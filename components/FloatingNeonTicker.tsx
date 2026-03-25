import React, { useEffect, useState } from 'react';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDbre0eogQtQDlyPowjcNSii1jMqURYKK8UjFm9Y2zsZDU5oT9ZmOJgmbz_UarqXp3aduvrlHuGU5F/pub?output=csv';

const FloatingNeonTicker: React.FC = () => {
  const [tickerData, setTickerData] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const response = await fetch(`${CSV_URL}&t=${Date.now()}`);
        const text = await response.text();
        const rows = text.split(/\r?\n/);
        
        if (rows.length >= 2) {
          const secondRow = rows[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const status = secondRow[0]?.trim().toUpperCase();
          const message = secondRow[1]?.replace(/^"|"$/g, '').trim();
          
          if (status === 'ON' && message) {
            setTickerData({ status, message });
          } else {
            setTickerData(null);
          }
        }
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 60 * 1000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (!tickerData || tickerData.status !== 'ON' || !tickerData.message) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes neon-ticker-ltr {
            0% { transform: translateX(-100%); color: #39FF14; text-shadow: 0 0 10px #39FF14; }
            18% { color: #00FFFF; text-shadow: 0 0 10px #00FFFF; }
            36% { color: #FF00FF; text-shadow: 0 0 10px #FF00FF; }
            54% { color: #FFFF00; text-shadow: 0 0 10px #FFFF00; }
            72% { color: #FF3131; text-shadow: 0 0 10px #FF3131; }
            90% { transform: translateX(100vw); color: #39FF14; text-shadow: 0 0 10px #39FF14; }
            100% { transform: translateX(100vw); color: #39FF14; text-shadow: 0 0 10px #39FF14; }
          }
          @keyframes neon-border-glow {
            0%, 100% { border-color: #39FF14; box-shadow: 0 0 20px rgba(57, 255, 20, 0.8); }
            25% { border-color: #00FFFF; box-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }
            50% { border-color: #FF00FF; box-shadow: 0 0 20px rgba(255, 0, 255, 0.8); }
            75% { border-color: #FFFF00; box-shadow: 0 0 20px rgba(255, 255, 0, 0.8); }
          }
          .animate-neon-ticker {
            display: inline-block;
            white-space: nowrap;
            /* 20s total: 18s movement + 2s pause (at 90-100%) */
            animation: neon-ticker-ltr 20s linear infinite;
            padding-left: 20px;
          }
          .neon-ticker-container {
            position: fixed;
            top: 22px; /* Positioned to float over the header/app name area */
            left: 0;
            width: 100%;
            height: 54px; /* Slightly taller for better presence */
            z-index: 999999;
            pointer-events: none;
            overflow: hidden;
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            border-top: 2px solid #39FF14;
            border-bottom: 2px solid #39FF14;
            animation: neon-border-glow 8s linear infinite;
          }
          .neon-text {
            font-weight: 900;
            font-size: 1.5rem; /* Even larger and bolder */
            text-transform: uppercase;
            letter-spacing: 2px;
            font-family: 'Cairo', sans-serif;
          }
        `}
      </style>
      <div className="neon-ticker-container">
        <div className="animate-neon-ticker">
          <span className="neon-text">{tickerData.message}</span>
        </div>
      </div>
    </>
  );
};

export default FloatingNeonTicker;
