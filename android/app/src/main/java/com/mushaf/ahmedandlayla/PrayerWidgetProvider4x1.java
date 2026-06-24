package com.mushaf.ahmedandlayla;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;
import android.os.Bundle;
import android.view.View;
import org.json.JSONObject;

public class PrayerWidgetProvider4x1 extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String prayerJson = prefs.getString("widget_prayer_data", null);
        int design = prefs.getInt("widget_design", 1);

        int layoutId = R.layout.prayer_widget_4x1;
        if (design == 2) layoutId = R.layout.prayer_widget_4x1_design2;
        else if (design == 3) layoutId = R.layout.prayer_widget_4x1_design3;
        else if (design == 4) layoutId = R.layout.prayer_widget_4x1_design4;

        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        if (prayerJson != null) {
            try {
                JSONObject data = new JSONObject(prayerJson);
                JSONObject times = data.getJSONObject("times");
                String nextPrayerId = data.has("next_prayer_id") ? data.getString("next_prayer_id") : "";
                String nextPrayerName = data.has("next_prayer_name") ? data.getString("next_prayer_name") : "";
                long targetTimeMillis = data.has("target_time_millis") ? data.getLong("target_time_millis") : 0;

                if (data.has("timestamps")) {
                    JSONObject timestamps = data.getJSONObject("timestamps");
                    long now = System.currentTimeMillis();
                    String[] prayerIds = {"fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "nextFajr", "nextSunrise", "nextDhuhr", "nextAsr", "nextMaghrib", "nextIsha"};
                    String[] prayerNames = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء", "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
                    for (int i = 0; i < prayerIds.length; i++) {
                        if (timestamps.has(prayerIds[i])) {
                            long pTime = timestamps.getLong(prayerIds[i]);
                            if (pTime > now) {
                                targetTimeMillis = pTime;
                                String id = prayerIds[i];
                                if (id.startsWith("next")) id = id.substring(4).toLowerCase();
                                nextPrayerId = id;
                                nextPrayerName = prayerNames[i];
                                break;
                            }
                        }
                    }
                }

                views.setTextViewText(R.id.widget_hijri_date, data.getString("day") + "، " + data.getString("hijri"));
                views.setTextViewText(R.id.widget_gregorian_date, data.getString("gregorian"));
                views.setTextViewText(R.id.widget_next_prayer_name, nextPrayerName + " بعد");
                
                if (targetTimeMillis > 0) {
                    long remainingMillis = targetTimeMillis - System.currentTimeMillis();
                    if (remainingMillis <= 0) {
                        views.setChronometer(R.id.widget_next_prayer_time, android.os.SystemClock.elapsedRealtime(), "00:00:00", false);
                    } else {
                        long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                            views.setBoolean(R.id.widget_next_prayer_time, "setCountDown", true);
                        }
                        views.setChronometer(R.id.widget_next_prayer_time, base, "%s", true);
                        
                        Intent updateIntent = new Intent(context, PrayerWidgetProvider4x1.class);
                        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
                        PendingIntent pendingUpdate = PendingIntent.getBroadcast(context, appWidgetId, updateIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                        android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                        if (alarmManager != null) {
                            long alarmTime = targetTimeMillis + 1000;
                            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                                alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC, alarmTime, pendingUpdate);
                            } else if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                                alarmManager.setExact(android.app.AlarmManager.RTC, alarmTime, pendingUpdate);
                            } else {
                                alarmManager.set(android.app.AlarmManager.RTC, alarmTime, pendingUpdate);
                            }
                        }
                    }
                } else {
                    views.setChronometer(R.id.widget_next_prayer_time, android.os.SystemClock.elapsedRealtime(), data.getString("remaining_time"), false);
                }
                
                views.setTextViewText(R.id.time_fajr, times.getString("fajr"));
                views.setTextViewText(R.id.time_sunrise, times.getString("sunrise"));
                views.setTextViewText(R.id.time_dhuhr, times.getString("dhuhr"));
                views.setTextViewText(R.id.time_asr, times.getString("asr"));
                views.setTextViewText(R.id.time_maghrib, times.getString("maghrib"));
                views.setTextViewText(R.id.time_isha, times.getString("isha"));

                int highlightColor = Color.parseColor("#10b981");
                int textColor = Color.parseColor("#000000");

                views.setTextColor(R.id.widget_next_prayer_name, highlightColor);
                views.setTextColor(R.id.widget_next_prayer_time, textColor);
                views.setTextColor(R.id.widget_hijri_date, Color.WHITE);
                views.setTextColor(R.id.widget_gregorian_date, Color.WHITE);

                views.setTextColor(R.id.name_fajr, textColor);
                views.setTextColor(R.id.time_fajr, textColor);
                views.setTextColor(R.id.name_sunrise, textColor);
                views.setTextColor(R.id.time_sunrise, textColor);
                views.setTextColor(R.id.name_dhuhr, textColor);
                views.setTextColor(R.id.time_dhuhr, textColor);
                views.setTextColor(R.id.name_asr, textColor);
                views.setTextColor(R.id.time_asr, textColor);
                views.setTextColor(R.id.name_maghrib, textColor);
                views.setTextColor(R.id.time_maghrib, textColor);
                views.setTextColor(R.id.name_isha, textColor);
                views.setTextColor(R.id.time_isha, textColor);

                if (nextPrayerId.equals("fajr")) { views.setTextColor(R.id.name_fajr, highlightColor); views.setTextColor(R.id.time_fajr, highlightColor); }
                else if (nextPrayerId.equals("sunrise")) { views.setTextColor(R.id.name_sunrise, highlightColor); views.setTextColor(R.id.time_sunrise, highlightColor); }
                else if (nextPrayerId.equals("dhuhr")) { views.setTextColor(R.id.name_dhuhr, highlightColor); views.setTextColor(R.id.time_dhuhr, highlightColor); }
                else if (nextPrayerId.equals("asr")) { views.setTextColor(R.id.name_asr, highlightColor); views.setTextColor(R.id.time_asr, highlightColor); }
                else if (nextPrayerId.equals("maghrib")) { views.setTextColor(R.id.name_maghrib, highlightColor); views.setTextColor(R.id.time_maghrib, highlightColor); }
                else if (nextPrayerId.equals("isha")) { views.setTextColor(R.id.name_isha, highlightColor); views.setTextColor(R.id.time_isha, highlightColor); }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
