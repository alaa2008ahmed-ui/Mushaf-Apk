import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

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
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }] });

    const notificationsToSchedule = [];

    if (activeSettings.sabah) {
      notificationsToSchedule.push({
        title: 'أذكار الصباح',
        body: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: "من قال حين يصبح وحين يمسي: سبحان الله وبحمده مائة مرة، لم يأت أحد يوم القيامة بأفضل مما جاء به، إلا أحد قال مثل ما قال أو زاد عليه".',
        id: 1,
        schedule: { on: { hour: 7, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'sabah-masaa' },
        smallIcon: 'ic_stat_icon_config_sample',
      });
    }

    if (activeSettings.masaa) {
      notificationsToSchedule.push({
        title: 'أذكار المساء',
        body: 'لا تنس أذكار المساء، حصن نفسك. قال رسول الله ﷺ: "ما من عبد يقول في صباح كل يوم ومساء كل ليلة: بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم، ثلاث مرات، لم يضره شيء".',
        id: 2,
        schedule: { on: { hour: 16, minute: 30 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'sabah-masaa' },
      });
    }

    if (activeSettings.dua) {
      notificationsToSchedule.push({
        title: 'وقت الدعاء',
        body: 'قال رسول الله ﷺ: "الدعاء هو العبادة". اغتنم وقتك في الدعاء والتقرب إلى الله.',
        id: 3,
        schedule: { on: { hour: 14, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'adia' },
      });
    }

    if (activeSettings.tasbeehMorning) {
      notificationsToSchedule.push({
        title: 'فضل التسبيح',
        body: 'قال رسول الله ﷺ: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم".',
        id: 4,
        schedule: { on: { hour: 10, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'tasbeeh' },
      });
    }

    if (activeSettings.tasbeehEvening) {
      notificationsToSchedule.push({
        title: 'وقت التسبيح',
        body: 'قال رسول الله ﷺ: "أيعجز أحدكم أن يكسب كل يوم ألف حسنة؟" فسأله سائل من جلسائه: كيف يكسب أحدنا ألف حسنة؟ قال: "يسبح مائة تسبيحة، فيكتب له ألف حسنة، أو يحط عنه ألف خطيئة".',
        id: 5,
        schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true, repeats: true },
        extra: { page: 'tasbeeh' },
      });
    }

    if (activeSettings.kahf) {
      notificationsToSchedule.push({
        title: 'سورة الكهف',
        body: 'قال رسول الله ﷺ: "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين".',
        id: 6,
        schedule: { on: { weekday: 6, hour: 9, minute: 0 }, allowWhileIdle: true, repeats: true }, // Friday is 6
        extra: { page: 'quran', params: { surah: 18 } },
      });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
    
    console.log('Notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};
