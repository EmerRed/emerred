package com.bitchat.android.services

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Build
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.bitchat.android.service.MeshServiceHolder
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import kotlin.coroutines.resume

/**
 * Fork addition: periodically reports the device's status to the EmerRed API
 * (`POST /afectados`), with this JSON shape:
 *
 * ```json
 * {
 *   "lat": 4.6097102,
 *   "long": -74.0817491,
 *   "numero_celular": 3001234567,
 *   "potencia_red_movil": -85,
 *   "coneccion_mesh": true
 * }
 * ```
 *
 * - `lat`/`long`: latest GPS fix from the fused location provider.
 * - `numero_celular`: typed manually in Settings, normalized to digits-only
 *   without country code (the API caps it at 10 digits).
 * - `potencia_red_movil`: cellular signal strength in dBm (Android exposes it
 *   via [TelephonyManager], unlike iOS); falls back to the average RSSI of
 *   connected BLE mesh peers.
 * - `coneccion_mesh`: true while at least one mesh peer is active.
 *
 * The API is create-once: the first report POSTs; afterwards the stored
 * record id is used with PUT. A 409 (duplicate phone) triggers a lookup by
 * phone number to recover the id. A tick with no GPS fix sends nothing —
 * a (0, 0) report would pollute the database.
 */
object TelemetryService {
    private const val TAG = "TelemetryService"
    private const val MAX_PHONE_DIGITS = 10

    private lateinit var appContext: Context
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val http = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
    private val jsonMediaType = "application/json".toMediaType()

    @Volatile
    private var started = false

    fun initialize(context: Context) {
        if (started) return
        started = true
        appContext = context.applicationContext
        TelemetryPreferences.init(appContext)

        // collectLatest cancels the in-flight loop whenever the toggle or the
        // interval changes, so edits apply without waiting for the next tick.
        scope.launch {
            TelemetryPreferences.enabled.collectLatest { enabled ->
                Log.i(TAG, if (enabled) "Reporting enabled" else "Reporting disabled")
                while (isActive && enabled) {
                    tick()
                    delay(TelemetryPreferences.getIntervalSeconds() * 1000)
                }
            }
        }
    }

    fun shutdown() {
        scope.cancel()
        started = false
    }

    /** Panic wipe: stop reporting and erase the stored phone and endpoint. */
    fun panicWipe() {
        TelemetryPreferences.wipe()
    }

    // MARK: - Report cycle

    private suspend fun tick() {
        val endpoint = TelemetryPreferences.getEndpointUrl() ?: run {
            Log.w(TAG, "Enabled but endpoint is empty/invalid: '${TelemetryPreferences.getEndpoint()}'")
            return
        }
        val phone = normalizePhone(TelemetryPreferences.getPhoneNumber()) ?: run {
            Log.w(TAG, "Phone number missing/invalid: '${TelemetryPreferences.getPhoneNumber()}'")
            return
        }
        val location = currentLocation() ?: run {
            Log.w(TAG, "No location fix yet (permission granted: ${hasLocationPermission()}); skipping report")
            return
        }

        val json = JSONObject()
            .put("lat", location.latitude)
            .put("long", location.longitude)
            .put("numero_celular", phone)
            .put("potencia_red_movil", networkSignalDbm())
            .put("coneccion_mesh", isMeshConnected())

        send(endpoint, phone, json)
    }

    /**
     * First report creates the record (POST); the returned id is cached and
     * later reports update with PUT. 409 means the phone already exists
     * server-side (e.g. after a reinstall) — recover the id and update.
     */
    private fun send(endpoint: String, phone: Long, json: JSONObject) {
        val body = json.toString().toRequestBody(jsonMediaType)
        val recordId = TelemetryPreferences.getRecordId()

        val request = if (recordId != null) {
            Request.Builder().url("$endpoint/$recordId").put(body).build()
        } else {
            Request.Builder().url(endpoint).post(body).build()
        }

        try {
            http.newCall(request).execute().use { response ->
                val responseBody = response.body?.string().orEmpty()
                when {
                    response.isSuccessful -> {
                        if (recordId == null) {
                            extractId(responseBody)?.let { TelemetryPreferences.setRecordId(it) }
                        }
                        Log.i(TAG, "Report sent (HTTP ${response.code})")
                    }
                    response.code == 409 && recordId == null -> {
                        Log.i(TAG, "Phone already registered; recovering record id")
                        recoverRecordId(endpoint, phone)?.let { id ->
                            TelemetryPreferences.setRecordId(id)
                            send(endpoint, phone, json)
                        } ?: Log.w(TAG, "Could not recover record id for $phone")
                    }
                    response.code == 404 && recordId != null -> {
                        // The record vanished server-side; recreate it.
                        Log.w(TAG, "Record $recordId no longer exists; recreating")
                        TelemetryPreferences.setRecordId(null)
                        send(endpoint, phone, json)
                    }
                    else -> Log.w(TAG, "Endpoint returned HTTP ${response.code}: $responseBody")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Upload failed: ${e.javaClass.simpleName}: ${e.message}")
        }
    }

    /** GET /afectadoPorCelular/{numero} to learn the record id of a phone. */
    private fun recoverRecordId(endpoint: String, phone: Long): String? {
        // The API mounts /afectados and /afectadoPorCelular at the same root.
        val lookupUrl = try {
            endpoint.toHttpUrl().newBuilder().encodedPath("/afectadoPorCelular/$phone").build()
        } catch (e: Exception) {
            Log.w(TAG, "Cannot derive lookup URL from '$endpoint': ${e.message}")
            return null
        }
        return try {
            http.newCall(Request.Builder().url(lookupUrl).get().build()).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.w(TAG, "Phone lookup returned HTTP ${response.code}")
                    return null
                }
                extractId(response.body?.string().orEmpty())
            }
        } catch (e: Exception) {
            Log.w(TAG, "Phone lookup failed: ${e.message}")
            null
        }
    }

    private fun extractId(responseBody: String): String? {
        return try {
            val data = JSONObject(responseBody).optJSONObject("data")
            data?.optString("_id")?.takeIf { it.isNotEmpty() }
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Digits only, without country code: the API expects a plain national
     * number (9–10 digits), so "+57 300 123 4567" becomes 3001234567.
     */
    private fun normalizePhone(raw: String): Long? {
        val digits = raw.filter { it.isDigit() }
        if (digits.length < 7) return null
        val national = if (digits.length > MAX_PHONE_DIGITS) digits.takeLast(MAX_PHONE_DIGITS) else digits
        return national.toLongOrNull()
    }

    // MARK: - Data sources

    private fun hasLocationPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ActivityCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
    }

    @SuppressLint("MissingPermission")
    private suspend fun currentLocation(): Location? {
        if (!hasLocationPermission()) return null
        val client = LocationServices.getFusedLocationProviderClient(appContext)
        return try {
            suspendCancellableCoroutine { cont ->
                val cancellation = CancellationTokenSource()
                cont.invokeOnCancellation { cancellation.cancel() }
                client.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cancellation.token)
                    .addOnSuccessListener { location -> cont.resume(location) }
                    .addOnFailureListener { cont.resume(null) }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Location error: ${e.message}")
            null
        }
    }

    /**
     * Cellular signal strength in dBm. `getAllCellInfo` needs fine location
     * (already granted for BLE scanning). Falls back to the average RSSI of
     * the BLE mesh links, then to -120 (poor) when neither radio reports
     * anything — the API requires a value in [-150, 0].
     */
    @SuppressLint("MissingPermission")
    private fun networkSignalDbm(): Int {
        // CellSignalStrength.getDbm() needs API 29; older devices fall through
        // to the BLE average.
        if (hasLocationPermission() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val telephony = appContext.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
                val dbm = telephony?.allCellInfo
                    ?.filter { it.isRegistered }
                    ?.map { it.cellSignalStrength.dbm }
                    ?.filter { it != Int.MAX_VALUE }
                    ?.maxOrNull()
                if (dbm != null) return dbm.coerceIn(-150, -1)
            } catch (e: Exception) {
                Log.w(TAG, "Cell info error: ${e.message}")
            }
        }
        val rssiValues = try {
            MeshServiceHolder.meshService?.getPeerRSSI()?.values
        } catch (_: Exception) {
            null
        }
        return rssiValues?.takeIf { it.isNotEmpty() }?.average()?.toInt()?.coerceIn(-150, -1) ?: -120
    }

    private fun isMeshConnected(): Boolean {
        return try {
            (MeshServiceHolder.meshService?.getActivePeerCount() ?: 0) > 0
        } catch (_: Exception) {
            false
        }
    }
}
