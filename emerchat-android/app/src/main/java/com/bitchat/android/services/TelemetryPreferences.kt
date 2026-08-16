package com.bitchat.android.services

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * SharedPreferences-backed configuration for the telemetry uploader
 * ([TelemetryService]). Fork addition.
 */
object TelemetryPreferences {
    private const val PREFS_NAME = "telemetry_preferences"
    private const val KEY_ENABLED = "telemetry_enabled"
    private const val KEY_ENDPOINT = "telemetry_endpoint"
    private const val KEY_PHONE = "telemetry_phone"
    private const val KEY_INTERVAL = "telemetry_interval_seconds"
    private const val KEY_RECORD_ID = "telemetry_record_id"

    const val DEFAULT_INTERVAL_SECONDS = 30L
    const val MIN_INTERVAL_SECONDS = 10L
    const val MAX_INTERVAL_SECONDS = 600L
    const val DEFAULT_ENDPOINT = "https://emerred-production.up.railway.app/afectados"

    private lateinit var prefs: SharedPreferences

    private val _enabled = MutableStateFlow(false)
    val enabled: StateFlow<Boolean> = _enabled.asStateFlow()

    private val _endpointFlow = MutableStateFlow(DEFAULT_ENDPOINT)
    val endpointFlow: StateFlow<String> = _endpointFlow.asStateFlow()

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        _enabled.value = prefs.getBoolean(KEY_ENABLED, false)
        _endpointFlow.value = getEndpoint()
    }

    fun isEnabled(): Boolean = prefs.getBoolean(KEY_ENABLED, false)

    fun setEnabled(value: Boolean) {
        prefs.edit().putBoolean(KEY_ENABLED, value).apply()
        _enabled.value = value
    }

    fun getEndpoint(): String = prefs.getString(KEY_ENDPOINT, null) ?: DEFAULT_ENDPOINT

    fun setEndpoint(value: String) {
        val trimmed = value.trim()
        prefs.edit().putString(KEY_ENDPOINT, trimmed).apply()
        _endpointFlow.value = trimmed.ifEmpty { DEFAULT_ENDPOINT }
    }

    /** Parsed endpoint; null when missing or not an http(s) URL. */
    fun getEndpointUrl(): String? {
        val raw = getEndpoint()
        if (raw.isEmpty()) return null
        val uri = try { java.net.URI(raw) } catch (_: Exception) { return null }
        val scheme = uri.scheme?.lowercase() ?: return null
        return if ((scheme == "https" || scheme == "http") && uri.host != null) raw else null
    }

    /** Phone number reported as `celular`; typed manually in Settings. */
    fun getPhoneNumber(): String = prefs.getString(KEY_PHONE, "") ?: ""

    fun setPhoneNumber(value: String) {
        prefs.edit().putString(KEY_PHONE, value.trim()).apply()
    }

    fun getIntervalSeconds(): Long {
        val stored = prefs.getLong(KEY_INTERVAL, DEFAULT_INTERVAL_SECONDS)
        return stored.coerceIn(MIN_INTERVAL_SECONDS, MAX_INTERVAL_SECONDS)
    }

    fun setIntervalSeconds(value: Long) {
        prefs.edit()
            .putLong(KEY_INTERVAL, value.coerceIn(MIN_INTERVAL_SECONDS, MAX_INTERVAL_SECONDS))
            .apply()
    }

    /**
     * Mongo `_id` of this device's afectado record, learned from the first
     * successful POST (or a phone lookup). Drives POST → PUT switching.
     */
    fun getRecordId(): String? = prefs.getString(KEY_RECORD_ID, null)

    fun setRecordId(value: String?) {
        prefs.edit().putString(KEY_RECORD_ID, value).apply()
    }

    /** Panic wipe: the phone number and endpoint identify the user. */
    fun wipe() {
        prefs.edit().clear().apply()
        _enabled.value = false
    }
}
