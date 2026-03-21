import React from 'react';

interface NextPrayerCardProps {
    nextPrayer: { key: string; name: string } | null;
    times: Record<string, string>;
    countdown: string;
    isBlackAndWhite: boolean;
    themePalette0: string;
    themePalette1: string;
    formatTime12: (time: string) => string;
    applyOffset: (timeStr: string, offsetMins: number) => string;
    prayerOffset: number;
}

const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
    nextPrayer,
    times,
    countdown,
    isBlackAndWhite,
    themePalette0,
    themePalette1,
    formatTime12,
    applyOffset,
    prayerOffset
}) => {
    if (!nextPrayer || !times[nextPrayer.key]) return null;

    return (
        <div className="rounded-2xl p-3 text-white mb-5 relative overflow-hidden" style={{background: isBlackAndWhite ? `linear-gradient(135deg, #333, #000)` : `linear-gradient(135deg, ${themePalette1}, ${themePalette0})`}}>
            <div className="flex justify-between items-center relative z-10">
                <div className="text-right">
                    <p className="text-[10px] font-bold opacity-90">المتبقي على صلاة <span className="underline decoration-white/40">{nextPrayer.name}</span></p>
                    <p className="text-3xl font-black font-mono tracking-tighter">{countdown}</p>
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-bold opacity-80 uppercase">موعد الأذان</p>
                    <p className="text-base font-black" dangerouslySetInnerHTML={{ __html: formatTime12(applyOffset(times[nextPrayer.key], prayerOffset)) }}></p>
                </div>
            </div>
            <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>
    );
};

export default NextPrayerCard;
