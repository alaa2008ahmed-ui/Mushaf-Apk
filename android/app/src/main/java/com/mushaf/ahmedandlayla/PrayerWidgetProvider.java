package com.mushaf.ahmedandlayla; // تم التعديل إلى الاسم المعتمد (y)

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;
import org.json.JSONObject;

// السطر التالي هو المفتاح لحل مشكلة الـ 22 خطأ (ربط الفهرس بالحزمة الصحيحة)
import com.mushaf.ahmedandlayla.R; 

public class PrayerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // قراءة البيانات من مخزن Capacitor المشترك
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String prayerJson = prefs.getString("widget_prayer_data", null);

        // ربط الواجهة (الريدجت) مع الحزمة الصحيحة
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);

        // جعل الريدجت يفتح التطبيق عند الضغط عليه
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        if (prayerJson != null) {
            try {
                JSONObject data = new JSONObject(prayerJson);
                JSONObject times = data.getJSONObject("times");
                String nextPrayerId = data.getString("next_prayer_id");

                // تحديث التاريخ الهجري ومعلومات الصلاة القادمة
                views.setTextViewText(R.id.widget_hijri_date, data.getString("day") + "، " + data.getString("hijri"));
                views.setTextViewText(R.id.widget_gregorian_date, data.getString("gregorian"));
                views.setTextViewText(R.id.widget_city, data.getString("city"));
                views.setTextViewText(R.id.widget_next_prayer_name, data.getString("next_prayer_name") + " بعد");
                
                if (data.has("target_time_millis")) {
                    long targetTimeMillis = data.getLong("target_time_millis");
                    long remainingMillis = targetTimeMillis - System.currentTimeMillis();
                    long base = android.os.SystemClock.elapsedRealtime() + remainingMillis;
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                        views.setBoolean(R.id.widget_next_prayer_time, "setCountDown", true);
                    }
                    views.setChronometer(R.id.widget_next_prayer_time, base, "%s", true);
                } else {
                    views.setTextViewText(R.id.widget_next_prayer_time, data.getString("remaining_time"));
                }
                
                views.setTextViewText(R.id.widget_midnight, data.getString("midnight"));
                views.setTextViewText(R.id.widget_last_third, data.getString("last_third"));

                // تحديث أوقات الصلوات
                views.setTextViewText(R.id.time_fajr, times.getString("fajr"));
                views.setTextViewText(R.id.time_sunrise, times.getString("sunrise"));
                views.setTextViewText(R.id.time_dhuhr, times.getString("dhuhr"));
                views.setTextViewText(R.id.time_asr, times.getString("asr"));
                views.setTextViewText(R.id.time_maghrib, times.getString("maghrib"));
                views.setTextViewText(R.id.time_isha, times.getString("isha"));

                // إعداد الألوان (تصفير الألوان)
                int defaultColor = Color.parseColor("#000000");
                int highlightColor = Color.parseColor("#10b981"); // Green

                views.setTextColor(R.id.name_fajr, defaultColor);
                views.setTextColor(R.id.time_fajr, defaultColor);
                views.setTextColor(R.id.name_sunrise, defaultColor);
                views.setTextColor(R.id.time_sunrise, defaultColor);
                views.setTextColor(R.id.name_dhuhr, defaultColor);
                views.setTextColor(R.id.time_dhuhr, defaultColor);
                views.setTextColor(R.id.name_asr, defaultColor);
                views.setTextColor(R.id.time_asr, defaultColor);
                views.setTextColor(R.id.name_maghrib, defaultColor);
                views.setTextColor(R.id.time_maghrib, defaultColor);
                views.setTextColor(R.id.name_isha, defaultColor);
                views.setTextColor(R.id.time_isha, defaultColor);

                // تظليل الصلاة القادمة فقط
                if (nextPrayerId.equals("fajr")) {
                    views.setTextColor(R.id.name_fajr, highlightColor);
                    views.setTextColor(R.id.time_fajr, highlightColor);
                } else if (nextPrayerId.equals("sunrise")) {
                    views.setTextColor(R.id.name_sunrise, highlightColor);
                    views.setTextColor(R.id.time_sunrise, highlightColor);
                } else if (nextPrayerId.equals("dhuhr")) {
                    views.setTextColor(R.id.name_dhuhr, highlightColor);
                    views.setTextColor(R.id.time_dhuhr, highlightColor);
                } else if (nextPrayerId.equals("asr")) {
                    views.setTextColor(R.id.name_asr, highlightColor);
                    views.setTextColor(R.id.time_asr, highlightColor);
                } else if (nextPrayerId.equals("maghrib")) {
                    views.setTextColor(R.id.name_maghrib, highlightColor);
                    views.setTextColor(R.id.time_maghrib, highlightColor);
                } else if (nextPrayerId.equals("isha")) {
                    views.setTextColor(R.id.name_isha, highlightColor);
                    views.setTextColor(R.id.time_isha, highlightColor);
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}