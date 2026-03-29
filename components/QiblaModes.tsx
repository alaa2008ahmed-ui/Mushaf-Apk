import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SunCalc from 'suncalc';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export const VisualQibla = ({ lat, lng, theme }: { lat: number, lng: number, theme: any }) => {
    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border-2 relative z-0" style={{ borderColor: `${theme.palette[0]}30` }}>
            <MapContainer center={[lat, lng]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]} />
                <Marker position={[KAABA_LAT, KAABA_LNG]} />
                <Polyline positions={[[lat, lng], [KAABA_LAT, KAABA_LNG]]} color="red" weight={3} dashArray="5, 10" />
            </MapContainer>
        </div>
    );
};

export const ARQibla = ({ qiblaDirection, heading, isAligned, theme }: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError('تعذر الوصول إلى الكاميرا. يرجى منح الصلاحية.');
            }
        };
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const rotation = qiblaDirection - heading;

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center shadow-lg">
            {error ? (
                <p className="text-red-500 p-4 text-center">{error}</p>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                <div className="w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-300" 
                     style={{ borderColor: isAligned ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                    <div className="absolute w-full h-full transition-transform duration-500 ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 flex flex-col items-center">
                            <i className="fa-solid fa-kaaba text-5xl" style={{ color: isAligned ? '#22c55e' : '#ffffff' }}></i>
                            <i className="fa-solid fa-chevron-down text-2xl mt-2 animate-bounce" style={{ color: isAligned ? '#22c55e' : '#ffffff' }}></i>
                        </div>
                    </div>
                    {isAligned && (
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                    )}
                </div>
                <div className="mt-8 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold text-lg border border-white/20">
                    {isAligned ? 'أنت متجه للقبلة' : 'وجه الكاميرا نحو الكعبة'}
                </div>
            </div>
        </div>
    );
};

export const SunMoonQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const moonPos = SunCalc.getMoonPosition(time, lat, lng);

    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const moonHeading = (moonPos.azimuth * 180 / Math.PI + 180) % 360;

    const sunDiff = Math.abs(sunHeading - qiblaDirection);
    const moonDiff = Math.abs(moonHeading - qiblaDirection);

    const CompassDial = ({ targetHeading, targetIcon, targetColor }: any) => (
        <div className="relative w-48 h-48 rounded-full border-4 flex items-center justify-center mx-auto my-6 shadow-inner" style={{ borderColor: `${theme.palette[0]}30`, backgroundColor: `${theme.palette[0]}0a` }}>
            {/* Phone heading indicator (fixed at top) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-4 h-4 rounded-full bg-red-500 z-20 shadow-md"></div>
            
            {/* Rotating dial */}
            <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                {/* North marker */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold opacity-50" style={{ color: theme.palette[0] }}>N</div>
                
                {/* Qibla marker */}
                <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                        <i className="fa-solid fa-kaaba text-2xl" style={{ color: '#22c55e' }}></i>
                    </div>
                </div>

                {/* Target marker (Sun/Moon/Shadow) */}
                <div className="absolute w-full h-full" style={{ transform: `rotate(${targetHeading}deg)` }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                        <i className={`fa-solid ${targetIcon} text-3xl`} style={{ color: targetColor }}></i>
                    </div>
                </div>
            </div>
            
            {/* Center dot */}
            <div className="w-3 h-3 rounded-full z-10" style={{ backgroundColor: theme.palette[0] }}></div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto pb-20">
            <div className="themed-card p-6 rounded-2xl flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-4 right-4 text-yellow-500 opacity-20"><i className="fa-solid fa-sun text-6xl"></i></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.palette[0] }}>الشمس</h3>
                
                <CompassDial targetHeading={sunHeading} targetIcon="fa-sun" targetColor="#eab308" />

                <div className="w-full space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 rounded-lg themed-bg-alt">
                        <span className="text-xs font-bold">اتجاه الشمس:</span>
                        <span className="font-mono">{Math.round(sunHeading)}°</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg themed-bg-alt">
                        <span className="text-xs font-bold">اتجاه القبلة:</span>
                        <span className="font-mono">{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 w-full">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                        القبلة تبعد عن الشمس بـ {Math.round(sunDiff)} درجة
                    </p>
                </div>
            </div>

            <div className="themed-card p-6 rounded-2xl flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-4 right-4 text-blue-400 opacity-20"><i className="fa-solid fa-moon text-6xl"></i></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.palette[0] }}>القمر</h3>
                
                <CompassDial targetHeading={moonHeading} targetIcon="fa-moon" targetColor="#60a5fa" />

                <div className="w-full space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 rounded-lg themed-bg-alt">
                        <span className="text-xs font-bold">اتجاه القمر:</span>
                        <span className="font-mono">{Math.round(moonHeading)}°</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg themed-bg-alt">
                        <span className="text-xs font-bold">اتجاه القبلة:</span>
                        <span className="font-mono">{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 w-full">
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        القبلة تبعد عن القمر بـ {Math.round(moonDiff)} درجة
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ShadowQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const shadowHeading = (sunHeading + 180) % 360;
    const shadowDiff = Math.abs(shadowHeading - qiblaDirection);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center themed-card p-6 rounded-2xl text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                <i className="fa-solid fa-person-rays text-[15rem]"></i>
            </div>
            
            <div className="z-10 flex flex-col items-center w-full">
                <h3 className="text-2xl font-bold mb-2" style={{ color: theme.palette[0] }}>ظل الشمس</h3>
                
                <p className="mb-4 text-sm leading-relaxed themed-text-muted max-w-xs">
                    ضع عصا بشكل عمودي على الأرض المستوية. ظل العصا يشير إلى الاتجاه المعاكس للشمس.
                </p>

                <div className="relative w-56 h-56 rounded-full border-4 flex items-center justify-center mx-auto my-4 shadow-inner" style={{ borderColor: `${theme.palette[0]}30`, backgroundColor: `${theme.palette[0]}0a` }}>
                    {/* Phone heading indicator */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-4 h-4 rounded-full bg-red-500 z-20 shadow-md"></div>
                    
                    {/* Rotating dial */}
                    <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                        {/* North marker */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold opacity-50" style={{ color: theme.palette[0] }}>N</div>
                        
                        {/* Qibla marker */}
                        <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                                <i className="fa-solid fa-kaaba text-2xl" style={{ color: '#22c55e' }}></i>
                            </div>
                        </div>

                        {/* Shadow marker */}
                        <div className="absolute w-full h-full" style={{ transform: `rotate(${shadowHeading}deg)` }}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                                <i className="fa-solid fa-person-rays text-3xl" style={{ color: theme.palette[0] }}></i>
                            </div>
                        </div>
                    </div>
                    
                    {/* Center dot */}
                    <div className="w-3 h-3 rounded-full z-10" style={{ backgroundColor: theme.palette[0] }}></div>
                </div>

                <div className="w-full space-y-3 mt-4">
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-xs font-bold">اتجاه الظل الحالي:</span>
                        <span className="font-mono">{Math.round(shadowHeading)}°</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-xs font-bold">اتجاه القبلة:</span>
                        <span className="font-mono">{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-xl border w-full" style={{ backgroundColor: `${theme.palette[0]}1a`, borderColor: `${theme.palette[0]}4d` }}>
                    <p className="font-bold text-sm" style={{ color: theme.palette[0] }}>
                        القبلة تبعد عن الظل بـ {Math.round(shadowDiff)} درجة
                    </p>
                </div>
            </div>
        </div>
    );
};
