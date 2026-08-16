package com.bitchat.android.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.bitchat.android.MainActivity
import com.bitchat.android.R
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Fork addition: single entry point for the remote "activate telemetry now"
 * alarm. Today it is triggered by [TelemetryAlarmListener] (WebSocket); when
 * FCM lands, its MessagingService only has to call [activate].
 *
 * On activation: telemetry is force-enabled (the first report goes out
 * immediately), the device rings the alarm tone and vibrates, a high-priority
 * notification is posted, and [alarmActive] flips so the UI can show a
 * full-screen alert. [dismiss] silences the alarm but telemetry keeps
 * reporting until the user turns it off in Settings.
 */
object TelemetryAlarmManager {
    private const val TAG = "TelemetryAlarmManager"
    private const val CHANNEL_ID = "emerred_alarm"
    private const val NOTIFICATION_ID = 10002

    private val _alarmActive = MutableStateFlow(false)
    val alarmActive: StateFlow<Boolean> = _alarmActive

    @Volatile
    private var ringtone: Ringtone? = null

    fun activate(context: Context) {
        if (_alarmActive.value) return
        _alarmActive.value = true
        Log.i(TAG, "Alarm activated: enabling telemetry immediately")

        TelemetryPreferences.init(context)
        TelemetryPreferences.setEnabled(true)

        ringAndVibrate(context)
        postNotification(context)
    }

    /** Stops sound/vibration and the full-screen alert; telemetry stays on. */
    fun dismiss(context: Context) {
        _alarmActive.value = false
        try { ringtone?.stop() } catch (_: Exception) { }
        ringtone = null
        getVibrator(context)?.cancel()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .cancel(NOTIFICATION_ID)
    }

    private fun ringAndVibrate(context: Context) {
        try {
            val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ringtone = RingtoneManager.getRingtone(context.applicationContext, uri)?.apply {
                audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    isLooping = true
                }
                play()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Alarm sound failed: ${e.message}")
        }

        // Long-short-short SOS-ish pattern, repeating.
        val pattern = longArrayOf(0, 800, 400, 300, 200, 300, 200, 300, 600)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getVibrator(context)?.vibrate(VibrationEffect.createWaveform(pattern, 0))
            } else {
                @Suppress("DEPRECATION")
                getVibrator(context)?.vibrate(pattern, 0)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Vibration failed: ${e.message}")
        }
    }

    private fun getVibrator(context: Context): Vibrator? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    private fun postNotification(context: Context) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, context.getString(R.string.alarm_channel_name), NotificationManager.IMPORTANCE_HIGH)
            )
        }
        val openIntent = PendingIntent.getActivity(
            context, 0, Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(context.getString(R.string.alarm_title))
            .setContentText(context.getString(R.string.alarm_notification_body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(openIntent)
            .build()
        try {
            manager.notify(NOTIFICATION_ID, notification)
        } catch (e: SecurityException) {
            Log.w(TAG, "POST_NOTIFICATIONS not granted; skipping alarm notification")
        }
    }
}
