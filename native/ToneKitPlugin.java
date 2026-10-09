package ma.supplements.app;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Choisir une sonnerie du téléphone, la prévisualiser, et créer un canal de notification « alarme » avec ce son. */
@CapacitorPlugin(name = "ToneKit")
public class ToneKitPlugin extends Plugin {
    private Ringtone current;

    @PluginMethod
    public void pick(PluginCall call) {
        Intent i = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
        i.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALL);
        i.putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, call.getString("title", "اختر نغمة المنبه"));
        i.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
        i.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
        String cur = call.getString("current");
        if (cur != null && !cur.isEmpty()) i.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, Uri.parse(cur));
        startActivityForResult(call, i, "pickResult");
    }

    @ActivityCallback
    private void pickResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject r = new JSObject();
        Intent data = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || data == null) { r.put("cancelled", true); call.resolve(r); return; }
        Uri uri = data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
        if (uri == null) { r.put("cancelled", true); call.resolve(r); return; }
        String title = "";
        try { Ringtone rt = RingtoneManager.getRingtone(getContext(), uri); if (rt != null) title = rt.getTitle(getContext()); } catch (Exception ignored) { }
        r.put("cancelled", false);
        r.put("uri", uri.toString());
        r.put("title", title);
        call.resolve(r);
    }

    /** Canal à importance haute avec un son joué sur le flux ALARME (sonne même en mode silencieux selon les réglages). */
    @PluginMethod
    public void createChannel(PluginCall call) {
        String id = call.getString("id");
        String name = call.getString("name", "المنبه");
        String uri = call.getString("uri");
        if (id == null || uri == null) { call.reject("id and uri are required"); return; }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm.getNotificationChannel(id) == null) {
                NotificationChannel ch = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);
                AudioAttributes aa = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                ch.setSound(Uri.parse(uri), aa);
                ch.enableVibration(true);
                ch.setVibrationPattern(new long[] { 0, 600, 300, 600, 300, 600 });
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                ch.setBypassDnd(true);
                nm.createNotificationChannel(ch);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void play(PluginCall call) {
        stopCurrent();
        String uri = call.getString("uri");
        if (uri == null) { call.reject("uri is required"); return; }
        try {
            current = RingtoneManager.getRingtone(getContext(), Uri.parse(uri));
            if (current != null) current.play();
            call.resolve();
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    @PluginMethod
    public void stop(PluginCall call) { stopCurrent(); call.resolve(); }

    private void stopCurrent() {
        try { if (current != null && current.isPlaying()) current.stop(); } catch (Exception ignored) { }
        current = null;
    }
}
