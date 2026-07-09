import { saveAs } from 'file-saver';

/**
 * يحفظ الملف عن طريق التحميل العادي أو يشاركه عبر واجهة Web Share API (مفيد جداً في تطبيقات الـ APK/الهواتف/WebView)
 * @param blob محتوى الملف كـ Blob
 * @param fileName الاسم المرغوب للملف
 */
export async function saveOrShareFile(blob: Blob, fileName: string): Promise<boolean> {
  const file = new File([blob], fileName, { type: blob.type });

  // التحقق من دعم ميزة المشاركة في النظام ومشاركتها كملف
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'مشاركة وتصدير الملف',
        text: fileName
      });
      return true; // تم التصدير/المشاركة بنجاح عبر النظام
    } catch (err) {
      console.warn("فشلت المشاركة، سيتم محاولة التحميل التقليدي:", err);
    }
  }

  // التحميل التقليدي كبديل
  saveAs(blob, fileName);
  return false;
}
