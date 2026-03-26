import React, { useEffect, useState } from 'react';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDbre0eogQtQDlyPowjcNSii1jMqURYKK8UjFm9Y2zsZDU5oT9ZmOJgmbz_UarqXp3aduvrlHuGU5F/pub?output=csv';

const FloatingNeonTicker: React.FC = () => {
  const [tickerData, setTickerData] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;
    
    const fetchTicker = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${CSV_URL}&t=${timestamp}`);
        if (!response.ok) return; // تجاهل أخطاء الشبكة للحفاظ على حالة الشريط
        
        const text = await response.text();
        if (!isMounted) return;

        // حماية إضافية: إذا قامت جوجل بإرجاع صفحة خطأ (HTML) بدلاً من CSV بسبب كثرة الطلبات، نتجاهلها
        if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
          return;
        }

        const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
        
        if (rows.length >= 2) {
          // استخدام طريقة آمنة جداً لفصل الحالة عن النص بدلاً من الـ Regex المعقد
          const firstCommaIndex = rows[1].indexOf(',');
          let status = '';
          let message = '';
          
          if (firstCommaIndex !== -1) {
            status = rows[1].substring(0, firstCommaIndex).trim().toUpperCase();
            message = rows[1].substring(firstCommaIndex + 1).trim();
            
            // إزالة علامات التنصيص المزدوجة التي يضيفها ملف الـ CSV
            if (message.startsWith('"') && message.endsWith('"')) {
              message = message.substring(1, message.length - 1);
            }
            message = message.replace(/""/g, '"');
          } else {
            status = rows[1].trim().toUpperCase();
          }
          
          // التنفيذ الصارم
          if (status === 'OFF') {
            setTickerData(null);
          } else if (status === 'ON') {
            setTickerData(prev => {
              if (prev?.message === message && prev?.status === status) return prev;
              return { status, message };
            });
          }
        }
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      }
    };

    fetchTicker();
    intervalId = setInterval(fetchTicker, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // لا نخفي الشريط إلا إذا كانت الحالة ليست ON
  if (!tickerData || tickerData.status !== 'ON') {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes neon-ticker-ltr {
            0% { transform: translateX(-50%); color: #39FF14; text-shadow: 0 0 10px #39FF14; }
            20% { color: #00FFFF; text-shadow: 0 0 10px #00FFFF; }
            40% { color: #FF00FF; text-shadow: 0 0 10px #FF00FF; }
            60% { color: #FFFF00; text-shadow: 0 0 10px #FFFF00; }
            80% { color: #FF3131; text-shadow: 0 0 10px #FF3131; }
            100% { transform: translateX(0%); color: #39FF14; text-shadow: 0 0 10px #39FF14; }
          }
          @keyframes neon-border-glow {
            0%, 100% { border-color: #39FF14; box-shadow: 0 0 15px rgba(57, 255, 20, 0.7); }
            25% { border-color: #00FFFF; box-shadow: 0 0 15px rgba(0, 255, 255, 0.7); }
            50% { border-color: #FF00FF; box-shadow: 0 0 15px rgba(255, 0, 255, 0.7); }
            75% { border-color: #FFFF00; box-shadow: 0 0 15px rgba(255, 255, 0, 0.7); }
          }
          .ticker-content {
            display: inline-block;
            white-space: nowrap;
            width: max-content;
            will-change: transform;
            /* Seamless Loop: Zero Latency and Continuous Motion */
            animation: neon-ticker-ltr 25s linear infinite;
          }
          .neon-ticker-container {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            width: 100%;
            height: 50px;
            z-index: 999999;
            pointer-events: none;
            overflow: hidden;
            display: flex;
            align-items: center;
            background: #000000;
            backdrop-filter: blur(20px);
            border: 2px solid #39FF14;
            border-radius: 1rem;
            box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
            animation: neon-border-glow 8s linear infinite;
          }
          .neon-text {
            font-weight: 900;
            font-size: 1.2rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-family: 'Cairo', sans-serif;
            display: inline-block;
            padding: 0 40px; /* Space between repeated text */
          }
        `}
      </style>
      <div id="floating-neon-ticker" className="neon-ticker-container">
        <div className="ticker-content">
          <span className="neon-text" dangerouslySetInnerHTML={{ __html: tickerData.message }}></span>
          <span className="neon-text" dangerouslySetInnerHTML={{ __html: tickerData.message }}></span>
          <span className="neon-text" dangerouslySetInnerHTML={{ __html: tickerData.message }}></span>
        </div>
      </div>
    </>
  );
};

export default FloatingNeonTicker;
