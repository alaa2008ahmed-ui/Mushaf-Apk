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
import android.os.Bundle;
import android.view.View;
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

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId);
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
                String nextPrayerId = data.has("next_prayer_id") ? data.getString("next_prayer_id") : "";
                String nextPrayerName = data.has("next_prayer_name") ? data.getString("next_prayer_name") : "";
                long targetTimeMillis = data.has("target_time_millis") ? data.getLong("target_time_millis") : 0;

                // حساب الصلاة القادمة بناءً على الوقت الحالي إذا توفرت الطوابع الزمنية
                if (data.has("timestamps")) {
                    JSONObject timestamps = data.getJSONObject("timestamps");
                    long now = System.currentTimeMillis();
                    
                    String[] prayerIds = {
                        "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", 
                        "nextFajr", "nextSunrise", "nextDhuhr", "nextAsr", "nextMaghrib", "nextIsha"
                    };
                    String[] prayerNames = {
                        "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء", 
                        "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"
                    };
                    
                    for (int i = 0; i < prayerIds.length; i++) {
                        if (timestamps.has(prayerIds[i])) {
                            long pTime = timestamps.getLong(prayerIds[i]);
                            if (pTime > now) {
                                targetTimeMillis = pTime;
                                String id = prayerIds[i];
                                if (id.startsWith("next")) {
                                    id = id.substring(4).toLowerCase();
                                }
                                nextPrayerId = id;
                                nextPrayerName = prayerNames[i];
                                break;
                            }
                        }
                    }
                }

                // تحديث التاريخ الهجري ومعلومات الصلاة القادمة
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
                        
                        // جدولة تحديث الريدجت عند دخول وقت الصلاة القادمة
                        Intent updateIntent = new Intent(context, PrayerWidgetProvider.class);
                        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
                        
                        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                                context, appWidgetId, updateIntent, 
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                                
                        android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                        if (alarmManager != null) {
                            // إضافة ثانية واحدة للتأكد من أن الوقت قد دخل فعلاً عند التحديث
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
                    // Fallback if target_time_millis is not available
                    views.setChronometer(R.id.widget_next_prayer_time, android.os.SystemClock.elapsedRealtime(), data.getString("remaining_time"), false);
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
                int bgColor = Color.parseColor("#FFFFFF");
                int textColor = Color.parseColor("#000000");
                int accentColor = Color.parseColor("#7C3AED"); // Purple
                int secondaryColor = Color.parseColor("#10b981"); // Green

                // تطبيق الثيم إذا كان متوفراً
                if (data.has("theme") && !data.isNull("theme")) {
                    JSONObject theme = data.getJSONObject("theme");
                    if (theme.has("primaryColor")) highlightColor = Color.parseColor(theme.getString("primaryColor"));
                    if (theme.has("secondaryColor")) accentColor = Color.parseColor(theme.getString("secondaryColor"));
                    if (theme.has("bgColor")) bgColor = Color.parseColor(theme.getString("bgColor"));
                    if (theme.has("textColor")) textColor = Color.parseColor(theme.getString("textColor"));
                    
                    // تطبيق الألوان على الخلفيات
                    views.setInt(R.id.widget_root, "setBackgroundColor", bgColor);
                    views.setInt(R.id.widget_left_section, "setBackgroundColor", accentColor);
                    views.setInt(R.id.widget_bottom_section, "setBackgroundColor", accentColor);
                }

                views.setTextColor(R.id.widget_next_prayer_name, highlightColor);
                views.setTextColor(R.id.widget_next_prayer_time, textColor);
                views.setTextColor(R.id.widget_hijri_date, Color.WHITE); // Keep white for contrast on accent
                views.setTextColor(R.id.widget_gregorian_date, Color.WHITE);
                views.setTextColor(R.id.widget_midnight, Color.WHITE);
                views.setTextColor(R.id.widget_last_third, Color.WHITE);

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

        // Handle resizing logic
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);
        
        // If the widget is shrunk below a certain threshold (e.g., 100dp), hide the bottom section
        if (minHeight > 0 && minHeight < 100) {
            views.setViewVisibility(R.id.widget_bottom_section, View.GONE);
        } else {
            views.setViewVisibility(R.id.widget_bottom_section, View.VISIBLE);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}