import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';

interface UpdateNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    newVersion: string;
    updateUrl: string;
    isLandscape?: boolean;
}

const UpdateNotificationModal: React.FC<UpdateNotificationModalProps> = ({ 
    isOpen, 
    onClose, 
    newVersion, 
    updateUrl,
    isLandscape 
}) => {
    if (!isOpen) return null;

    const handleUpdate = () => {
        window.open(updateUrl, '_blank');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`bg-white rounded-3xl shadow-2xl overflow-hidden w-full ${isLandscape ? 'max-w-md' : 'max-w-sm'} relative`}
                    dir="rtl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Download size={32} />
                        </div>
                        <h2 className="text-2xl font-bold font-kufi">تحديث جديد متوفر!</h2>
                        <p className="opacity-90">إصدار جديد رقم {newVersion} متاح الآن</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 text-center">
                        <p className="text-gray-600 leading-relaxed mb-6">
                            نوصي بشدة بتحديث التطبيق الآن للحصول على أحدث الميزات والتحسينات وإصلاح الأخطاء لضمان أفضل تجربة مستخدم.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleUpdate}
                                className="w-full py-3.5 px-6 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-95 transition-transform"
                            >
                                <Download size={20} />
                                تحديث الآن
                            </button>
                            
                            <button
                                onClick={onClose}
                                className="w-full py-3 px-6 text-gray-500 hover:text-gray-700 font-medium active:scale-95 transition-transform"
                            >
                                ربما لاحقاً
                            </button>
                        </div>
                    </div>

                    {/* Close Button Icon */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpdateNotificationModal;
