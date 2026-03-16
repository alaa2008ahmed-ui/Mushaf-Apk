
import React, { useEffect, useRef, useState } from 'react';

interface VideoSplashProps {
  onEnded: () => void;
}

const VideoSplash: React.FC<VideoSplashProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video play failed:", error);
        onEnded();
      });
    }
  }, [onEnded]);

  const handleEnded = () => {
    setIsFading(true);
    setTimeout(onEnded, 500); // Match transition duration
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      <video
        ref={videoRef}
        className={`w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        disablePictureInPicture
        controls={false}
        onLoadedData={() => setIsReady(true)}
        onEnded={handleEnded}
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }} // Fix for some mobile clipping issues
      />
      
      {isReady && !isFading && (
        <button 
          onClick={handleEnded}
          className="absolute bottom-10 right-10 bg-black/40 text-white px-6 py-2 rounded-full text-sm backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all animate-fadeIn"
        >
          تخطي
        </button>
      )}
    </div>
  );
};

export default VideoSplash;
