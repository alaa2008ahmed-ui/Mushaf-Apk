import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import moment from 'moment-hijri';

export const setupNotifications = async (settings?: any) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Local notifications are not supported on the web platform.');
    return;
  }

  try {
    // Request permissions
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Default settings if not provided
    const defaultSettings = {
      sabah: true,
      masaa: true,
      dua: true,
      tasbeehMorning: true,
      tasbeehEvening: true,
      kahf: true,
    };
    
    const activeSettings = settings || (() => {
      const saved = localStorage.getItem('phone_notifications_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    })();

    // Clear existing notifications to avoid duplicates
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }] });

    const notificationsToSchedule = [];

    if (activeSettings.sabah) {
      notificationsToSchedule.push({
        title: 'أذكار الصباح',
        body: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: "من قال حين يصبح وحين يمسي: سبحان الله وبحمده مائة مرة، لم يأت أحد يوم القيامة بأفضل مما جاء به، إلا أحد قال مثل ما قال أو زاد عليه".',
        id: 1,
        schedule: { on: { hour: 7, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'sabah-masaa' },
        smallIcon: 'ic_stat_name',
      });
    }

    if (activeSettings.masaa) {
      notificationsToSchedule.push({
        title: 'أذكار المساء',
        body: 'لا تنس أذكار المساء، حصن نفسك. قال رسول الله ﷺ: "ما من عبد يقول في صباح كل يوم ومساء كل ليلة: بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم، ثلاث مرات، لم يضره شيء".',
        id: 2,
        schedule: { on: { hour: 16, minute: 30 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'sabah-masaa' },
        smallIcon: 'ic_stat_name',
      });
    }

    if (activeSettings.dua) {
      notificationsToSchedule.push({
        title: 'وقت الدعاء',
        body: 'قال رسول الله ﷺ: "الدعاء هو العبادة". اغتنم وقتك في الدعاء والتقرب إلى الله.',
        id: 3,
        schedule: { on: { hour: 14, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'adia' },
        smallIcon: 'ic_stat_name',
      });
    }

    if (activeSettings.tasbeehMorning) {
      notificationsToSchedule.push({
        title: 'فضل التسبيح',
        body: 'قال رسول الله ﷺ: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم".',
        id: 4,
        schedule: { on: { hour: 10, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'tasbeeh' },
        smallIcon: 'ic_stat_name',
      });
    }

    if (activeSettings.tasbeehEvening) {
      notificationsToSchedule.push({
        title: 'وقت التسبيح',
        body: 'قال رسول الله ﷺ: "أيعجز أحدكم أن يكسب كل يوم ألف حسنة؟" فسأله سائل من جلسائه: كيف يكسب أحدنا ألف حسنة؟ قال: "يسبح مائة تسبيحة، فيكتب له ألف حسنة، أو يحط عنه ألف خطيئة".',
        id: 5,
        schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'tasbeeh' },
        smallIcon: 'ic_stat_name',
      });
    }

    if (activeSettings.kahf) {
      notificationsToSchedule.push({
        title: 'سورة الكهف',
        body: 'قال رسول الله ﷺ: "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين".',
        id: 6,
        schedule: { on: { weekday: 6, hour: 9, minute: 0 }, allowWhileIdle: true, repeats: true }, // Friday is 6
        extra: { page: 'quran', params: { surah: 18 } },
        smallIcon: 'ic_stat_name',
      });
    }

    // Ramadan Preparation Notification (1 day before Ramadan)
    try {
      const currentHijriYear = moment().iYear();
      const currentHijriMonth = moment().iMonth(); // 0-indexed, Ramadan is 8
      
      let targetYear = currentHijriYear;
      // If we are already in Ramadan (or later), the day before Ramadan for this year has passed
      if (currentHijriMonth >= 8) {
        targetYear += 1;
      }
      
      let ramadan1 = moment(`${targetYear}/9/1`, 'iYYYY/iM/iD');
      let dayBeforeRamadan = ramadan1.clone().subtract(1, 'days');
      dayBeforeRamadan.hour(10).minute(0).second(0).millisecond(0);
      
      // If the calculated date is somehow in the past (e.g., today is exactly the day before Ramadan but past 10 AM)
      if (dayBeforeRamadan.isBefore(moment())) {
        targetYear += 1;
        ramadan1 = moment(`${targetYear}/9/1`, 'iYYYY/iM/iD');
        dayBeforeRamadan = ramadan1.clone().subtract(1, 'days');
        dayBeforeRamadan.hour(10).minute(0).second(0).millisecond(0);
      }

      notificationsToSchedule.push({
        title: 'استعد لرمضان!',
        body: 'غداً أول أيام شهر رمضان المبارك. قم بتجهيز الورد الشهري الخاص بك الآن.',
        id: 7,
        schedule: { at: dayBeforeRamadan.toDate(), allowWhileIdle: true },
        extra: { page: 'daily-wird' },
        smallIcon: 'ic_stat_name',
      });
    } catch (e) {
      console.error('Error scheduling Ramadan notification', e);
    }

    // Mawlid al-Nabawi Notification (12 Rabi' al-Awwal)
    try {
      const currentHijriYear = moment().iYear();
      const currentHijriMonth = moment().iMonth(); // 0-indexed, Rabi' al-Awwal is 2
      const currentHijriDay = moment().iDate();

      let targetYear = currentHijriYear;
      // If we are already past 12 Rabi' al-Awwal this year, schedule for next year
      if (currentHijriMonth > 2 || (currentHijriMonth === 2 && currentHijriDay >= 12)) {
        targetYear += 1;
      }

      const mawlidDate = moment(`${targetYear}/3/12`, 'iYYYY/iM/iD');
      mawlidDate.hour(8).minute(0).second(0).millisecond(0);

      notificationsToSchedule.push({
        title: 'مولد الهدى ﷺ',
        body: 'وُلِدَ الهُدى فَالكائِناتُ ضِياءُ.. نبارك لكم ذكرى مولد خير الأنام محمد ﷺ.',
        id: 8,
        schedule: { at: mawlidDate.toDate(), allowWhileIdle: true },
        extra: { page: 'home' },
        smallIcon: 'ic_stat_name',
      });
    } catch (e) {
      console.error('Error scheduling Mawlid notification', e);
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
    
    console.log('Notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};
