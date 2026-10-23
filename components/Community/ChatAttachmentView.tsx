import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, Maximize2, X, File, FileArchive, Check } from 'lucide-react';
import { ChatAttachment } from '../../services/communityService';
import { useLanguage } from '../../context/LanguageContext';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { registerBackInterceptor } from '../../hooks/useBackButton';

interface ChatAttachmentViewProps {
  attachment: ChatAttachment;
  isMe?: boolean;
}

export const downloadAttachment = async (url: string, fileName?: string) => {
  const finalName = fileName || `mushaf_image_${Date.now()}.jpg`;
  try {
    if (Capacitor.isNativePlatform()) {
      let base64Data = '';
      if (url.startsWith('data:')) {
        base64Data = url.split(',')[1];
      } else {
        const resp = await fetch(url);
        const blob = await resp.blob();
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const savedFile = await Filesystem.writeFile({
        path: finalName,
        data: base64Data,
        directory: Directory.Documents
      }).catch(async () => {
        return await Filesystem.writeFile({
          path: finalName,
          data: base64Data,
          directory: Directory.Cache
        });
      });

      try {
        await Share.share({
          title: finalName,
          url: savedFile.uri,
          dialogTitle: 'حفظ الصورة'
        });
      } catch (e) {}
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error downloading file:', err);
    try {
      window.open(url, '_blank');
    } catch (e) {}
  }
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
};

export const ChatAttachmentView: React.FC<ChatAttachmentViewProps> = ({ attachment, isMe }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [showLightbox, setShowLightbox] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close lightbox on hardware back button
  useEffect(() => {
    if (!showLightbox) return;
    const interceptor = () => {
      setShowLightbox(false);
      return true;
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [showLightbox]);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLightbox(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadAttachment(attachment.url, attachment.fileName);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  if (!attachment || !attachment.url) return null;

  // 1. Image Attachment
  if (attachment.type === 'image') {
    return (
      <div 
        className="mt-1.5 mb-1 flex flex-col items-start w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clickable Image Container */}
        <div 
          className="relative group rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-w-full sm:max-w-xs shadow-xs cursor-pointer select-none"
          onClick={(e) => {
            e.stopPropagation();
            setShowLightbox(true);
          }}
          title={isEn ? "Click to view full image" : "اضغط لعرض الصورة بحجمها الكامل"}
        >
          <img
            src={attachment.url}
            alt={attachment.fileName || (isEn ? 'Attached Image' : 'صورة مرفقة')}
            className="w-full max-h-64 sm:max-h-72 object-cover cursor-pointer transition-transform duration-200 group-hover:scale-102 active:scale-98 block"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-xs shadow-md">
              <Maximize2 size={18} />
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {showLightbox && (
            <div
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none"
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(false);
              }}
              dir={isEn ? 'ltr' : 'rtl'}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="relative max-w-3xl w-full flex flex-col items-center max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Display */}
                <div className="relative w-full flex items-center justify-center flex-1 min-h-0 overflow-hidden py-2">
                  <img
                    src={attachment.url}
                    alt={attachment.fileName || (isEn ? 'Attached Image' : 'صورة مرفقة')}
                    className="max-h-[72vh] sm:max-h-[78vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
                  />
                </div>

                {/* Bottom Action Buttons: Save & Close to return to chat */}
                <div className="w-full max-w-sm pt-3 flex items-center justify-center gap-3 shrink-0">
                  {/* زر حفظ */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
                    title={isEn ? "Save Image" : "حفظ الصورة"}
                  >
                    {downloadSuccess ? (
                      <>
                        <Check size={18} className="stroke-[2.5]" />
                        <span>{isEn ? 'Saved' : 'تم الحفظ'}</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} className="stroke-[2.5]" />
                        <span>{isEn ? 'Save' : 'حفظ'}</span>
                      </>
                    )}
                  </button>

                  {/* زر إغلاق باللون المميز بدلاً من الشفاف */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLightbox(false);
                    }}
                    className="flex-1 py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer border border-rose-500/40"
                    title={isEn ? "Close and return to conversation" : "إغلاق والعودة للمحادثة"}
                  >
                    <X size={18} className="stroke-[2.5]" />
                    <span>{isEn ? 'Close' : 'إغلاق'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. Video Attachment
  if (attachment.type === 'video') {
    return (
      <div 
        className="mt-1.5 mb-1 flex flex-col items-start w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-w-full sm:max-w-xs shadow-xs bg-black">
          <video
            src={attachment.url}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-64 sm:max-h-72 rounded-2xl"
          />
        </div>

        {/* Action bar below video */}
        <div className="flex items-center justify-between gap-2 w-full mt-1 px-1">
          <span className="text-[10px] opacity-75 truncate max-w-[140px]">
            {attachment.fileName || 'فيديو'} {attachment.fileSize ? `(${formatFileSize(attachment.fileSize)})` : ''}
          </span>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline active:scale-95 transition-all cursor-pointer"
            title="استرداد وحفظ الفيديو على جهازك"
          >
            {downloadSuccess ? <Check size={12} /> : <Download size={12} />}
            <span>{downloadSuccess ? 'تم الحفظ' : 'استرداد الفيديو'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Document / File Attachment
  const fileName = attachment.fileName || 'ملف مرفق';
  const isArchive = fileName.endsWith('.zip') || fileName.endsWith('.rar');
  const isPdf = fileName.endsWith('.pdf');

  return (
    <div 
      className="mt-1.5 mb-1 w-full max-w-full sm:max-w-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        onClick={handleDownload}
        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs active:scale-98 ${
          isMe 
            ? 'bg-white/15 hover:bg-white/20 border-white/25 text-white' 
            : 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-slate-800 dark:text-slate-100'
        }`}
        title="اضغط لاسترداد وتحميل الملف على جهازك"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            {isPdf ? (
              <FileText size={20} />
            ) : isArchive ? (
              <FileArchive size={20} />
            ) : (
              <File size={20} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs truncate leading-tight">
              {fileName}
            </p>
            <p className="text-[10px] opacity-75 mt-0.5">
              {formatFileSize(attachment.fileSize) || 'مستند'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
          title="استرداد وتحميل الملف"
        >
          {downloadSuccess ? <Check size={15} /> : <Download size={15} />}
        </button>
      </div>

      <div className="flex items-center justify-end mt-1 px-1">
        <button
          type="button"
          onClick={handleDownload}
          className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Download size={11} />
          <span>استرداد وتحميل الملف</span>
        </button>
      </div>
    </div>
  );
};
