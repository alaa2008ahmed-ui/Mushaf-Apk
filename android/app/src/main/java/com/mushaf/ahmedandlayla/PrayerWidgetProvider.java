package com.mushaf.ahmedandlayla;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;
import org.json.JSONObject;

public class PrayerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Read data from SharedPreferences (Capacitor default storage)
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String prayerJson = prefs.getString("widget_prayer_data", null);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);

        if (prayerJson != null) {
            try {
                JSONObject data = new JSONObject(prayerJson);
                JSONObject times = data.getJSONObject("times");
                String nextPrayerId = data.getString("next_prayer_id");

                // Update Hijri Date and Next Prayer Info
                views.setTextViewText(R.id.widget_hijri_date, data.getString("hijri"));
                views.setTextViewText(R.id.widget_next_prayer_name, "الصلاة القادمة: " + data.getString("next_prayer_name"));
                views.setTextViewText(R.id.widget_next_prayer_time, data.getString("remaining_time"));

                // Update Prayer Times
                views.setTextViewText(R.id.time_fajr, times.getString("fajr"));
                views.setTextViewText(R.id.time_sunrise, times.getString("sunrise"));
                views.setTextViewText(R.id.time_dhuhr, times.getString("dhuhr"));
                views.setTextViewText(R.id.time_asr, times.getString("asr"));
                views.setTextViewText(R.id.time_maghrib, times.getString("maghrib"));
                views.setTextViewText(R.id.time_isha, times.getString("isha"));

                // Reset Backgrounds
                int defaultColor = Color.TRANSPARENT;
                int highlightColor = Color.parseColor("#33FFD700"); // Semi-transparent Gold

                views.setInt(R.id.row_fajr, "setBackgroundColor", defaultColor);
                views.setInt(R.id.row_sunrise, "setBackgroundColor", defaultColor);
                views.setInt(R.id.row_dhuhr, "setBackgroundColor", defaultColor);
                views.setInt(R.id.row_asr, "setBackgroundColor", defaultColor);
                views.setInt(R.id.row_maghrib, "setBackgroundColor", defaultColor);
                views.setInt(R.id.row_isha, "setBackgroundColor", defaultColor);

                // Highlight Next Prayer
                if (nextPrayerId.equals("fajr")) views.setInt(R.id.row_fajr, "setBackgroundColor", highlightColor);
                else if (nextPrayerId.equals("sunrise")) views.setInt(R.id.row_sunrise, "setBackgroundColor", highlightColor);
                else if (nextPrayerId.equals("dhuhr")) views.setInt(R.id.row_dhuhr, "setBackgroundColor", highlightColor);
                else if (nextPrayerId.equals("asr")) views.setInt(R.id.row_asr, "setBackgroundColor", highlightColor);
                else if (nextPrayerId.equals("maghrib")) views.setInt(R.id.row_maghrib, "setBackgroundColor", highlightColor);
                else if (nextPrayerId.equals("isha")) views.setInt(R.id.row_isha, "setBackgroundColor", highlightColor);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
