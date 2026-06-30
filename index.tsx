
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Capacitor } from '@capacitor/core';

const RootApp = () => {
  const [showVideoIntro, setShowVideoIntro] = useState(() => Capacitor.isNativePlatform());
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (showVideoIntro && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If autoplay fails, fallback to hiding the video
          setShowVideoIntro(false);
        });
      }
    }
  }, [showVideoIntro]);

  return (
    <>
      {showVideoIntro && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999999, backgroundColor: 'black' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            onEnded={() => setShowVideoIntro(false)}
            onError={() => setShowVideoIntro(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', outline: 'none', border: 'none' }}
          >
            <source src="/Vedios.mp4" type="video/mp4" />
          </video>
        </div>
      )}
      <App />
    </>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

