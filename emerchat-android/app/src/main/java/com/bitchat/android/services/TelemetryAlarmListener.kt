package com.bitchat.android.services

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import kotlin.coroutines.resume

/**
 * Fork addition: keeps a WebSocket open to the EmerRed server so the alarm
 * that force-enables telemetry arrives instantly, without polling.
 *
 * The server is expected to accept connections at `<endpoint host>/alarma`
 * (ws:// or wss://, derived from the configured telemetry endpoint) and
 * broadcast `{"alarma": true}` when an emergency is declared. The connection
 * reconnects with exponential backoff (5 s … 60 s) and lives in the app
 * process, which [MeshForegroundService] already keeps alive in the
 * background. When FCM lands, this class is deleted and the FCM
 * MessagingService calls [TelemetryAlarmManager.activate] instead.
 */
object TelemetryAlarmListener {
    private const val TAG = "TelemetryAlarmListener"
    private const val WS_PATH = "/alarma"
    private const val BACKOFF_INITIAL_MS = 5_000L
    private const val BACKOFF_MAX_MS = 60_000L

    private lateinit var appContext: Context
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val http = OkHttpClient.Builder()
        .pingInterval(20, TimeUnit.SECONDS)
        .build()

    @Volatile
    private var started = false

    @Volatile
    private var socket: WebSocket? = null

    /** Wakes connectLoop out of a backoff delay when the endpoint changes. */
    private val reconnectSignal = kotlinx.coroutines.channels.Channel<Unit>(kotlinx.coroutines.channels.Channel.CONFLATED)

    fun start(context: Context) {
        if (started) return
        started = true
        appContext = context.applicationContext
        TelemetryPreferences.init(appContext)
        scope.launch { connectLoop() }

        // Editing the endpoint in Settings must retarget the channel at once:
        // drop the current socket so connectLoop re-reads the URL immediately
        // instead of waiting out a connection or a backoff delay.
        scope.launch {
            TelemetryPreferences.endpointFlow.collect {
                reconnectSignal.trySend(Unit)
                val current = socket
                if (current != null) {
                    Log.i(TAG, "Endpoint changed; reconnecting alarm channel")
                    socket = null
                    current.close(1000, "endpoint changed")
                }
            }
        }
    }

    private suspend fun connectLoop() {
        var backoff = BACKOFF_INITIAL_MS
        while (true) {
            val url = webSocketUrl()
            if (url == null) {
                Log.w(TAG, "No valid endpoint to derive WebSocket URL from; retrying in ${backoff}ms")
                waitInterruptibly(backoff)
                backoff = (backoff * 2).coerceAtMost(BACKOFF_MAX_MS)
                continue
            }
            val connected = awaitConnection(url)
            backoff = if (connected) BACKOFF_INITIAL_MS else (backoff * 2).coerceAtMost(BACKOFF_MAX_MS)
            if (!connected) waitInterruptibly(backoff)
        }
    }

    /** Sleeps for [ms], waking early if the endpoint changes meanwhile. */
    private suspend fun waitInterruptibly(ms: Long) {
        kotlinx.coroutines.withTimeoutOrNull(ms) { reconnectSignal.receive() }
    }

    /** Opens one WebSocket and suspends until it closes or fails. Returns true if it ever connected. */
    private suspend fun awaitConnection(url: String): Boolean {
        var everConnected = false
        kotlinx.coroutines.suspendCancellableCoroutine<Unit> { cont ->
            val listener = object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    everConnected = true
                    Log.i(TAG, "Alarm channel connected: $url")
                }

                override fun onMessage(webSocket: WebSocket, text: String) {
                    if (isAlarmMessage(text)) {
                        TelemetryAlarmManager.activate(appContext)
                    }
                }

                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                    Log.w(TAG, "Alarm channel failed: ${t.message}")
                    if (cont.isActive) cont.resume(Unit) {}
                }

                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                    Log.i(TAG, "Alarm channel closed ($code $reason)")
                    if (cont.isActive) cont.resume(Unit) {}
                }
            }
            socket = http.newWebSocket(Request.Builder().url(url).build(), listener)
            cont.invokeOnCancellation { socket?.close(1000, null) }
        }
        return everConnected
    }

    /** Accepts {"alarma": true} (or "active"/"activa") case-insensitively. */
    private fun isAlarmMessage(text: String): Boolean {
        return try {
            val json = JSONObject(text)
            val value = json.opt("alarma") ?: json.opt("alarm") ?: return false
            when (value) {
                is Boolean -> value
                is String -> value.lowercase() in listOf("true", "1", "activa", "active", "si", "sí")
                is Number -> value.toInt() != 0
                else -> false
            }
        } catch (_: Exception) {
            false
        }
    }

    private fun webSocketUrl(): String? {
        val endpoint = TelemetryPreferences.getEndpointUrl() ?: return null
        return try {
            val httpUrl = endpoint.toHttpUrl()
            val wsScheme = if (httpUrl.scheme == "https") "wss" else "ws"
            httpUrl.newBuilder().scheme(wsScheme).encodedPath(WS_PATH).build().toString()
        } catch (e: Exception) {
            Log.w(TAG, "Cannot derive WebSocket URL: ${e.message}")
            null
        }
    }
}
