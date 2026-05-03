import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface ShareOptions {
    text: string;
    source?: string;
    category?: string;
    theme: any;
    setToastMessage?: (msg: string) => void;
}

export const shareAsImage = async ({ text, source, category, theme, setToastMessage }: ShareOptions) => {
    if (setToastMessage) setToastMessage('جاري تجهيز الصورة...');

    // Use a unique ID for the container to avoid conflicts
    const containerId = `share-container-${Date.now()}`;
    const container = document.createElement('div');
    container.id = containerId;
    
    try {
        // Wait for fonts to be ready with a timeout to avoid hanging
        try {
            await Promise.race([
                document.fonts.ready,
                new Promise(resolve => setTimeout(resolve, 2000))
            ]);
        } catch (e) {
            console.warn('Font loading timed out or failed, proceeding with default fonts');
        }

        // Create a temporary container for capturing
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '800px'; 
        container.style.direction = 'rtl';
        container.style.backgroundColor = '#ffffff'; // Ensure a opaque background for the wrapper
        
        // Use theme palette or defaults
        const primaryColor = theme?.palette?.[0] || '#4CAF50';
        const secondaryColor = theme?.palette?.[1] || '#2E7D32';

        // Add background and patterns
        container.innerHTML = `
            <div id="share-card" style="
                background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
                padding: 60px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                position: relative;
                color: white;
                text-align: center;
                box-shadow: inset 0 0 100px rgba(0,0,0,0.2);
                font-family: ${theme?.font || '"Amiri", serif'};
            ">
                <!-- Decorative Islamic Pattern Overlay -->
                <!-- We use a semi-transparent overlay instead of external image if possible for better reliability -->
                <div style="
                    position: absolute;
                    inset: 0;
                    opacity: 0.1;
                    background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
                    background-size: 20px 20px;
                    pointer-events: none;
                "></div>
                
                <!-- Inner Decorative Frame -->
                <div style="
                    border: 2px solid rgba(255,255,255,0.3);
                    padding: 40px;
                    border-radius: 30px;
                    background: rgba(255,255,255,0.15);
                    width: 100%;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    position: relative;
                    z-index: 1;
                    letter-spacing: 0;
                    word-spacing: 0;
                    font-variant-ligatures: normal;
                ">
                    <div style="
                        font-size: 34px;
                        line-height: 1.8;
                        margin-bottom: 30px;
                        font-family: inherit;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        letter-spacing: 0;
                        word-spacing: 0;
                    ">
                        ${text.replace(/\n/g, '<br/>')}
                    </div>
                    
                    ${(category || source) ? `
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid rgba(255,255,255,0.2);
                        ">
                            <span style="
                                font-size: 18px;
                                opacity: 0.9;
                                font-weight: bold;
                                font-family: 'Cairo', sans-serif;
                            ">
                                ${[category, source].filter(Boolean).join(' • ')}
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Brand Footer -->
                <div style="
                    margin-top: 30px;
                    font-size: 20px;
                    font-weight: bold;
                    opacity: 0.9;
                    font-family: ${theme?.font || '"Amiri", serif'};
                    letter-spacing: 0;
                    word-spacing: 0;
                    font-variant-ligatures: normal;
                ">
                    مصحف أحمد وليلى
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Wait a tiny bit for the DOM to settle
        await new Promise(r => setTimeout(r, 200));

        const canvas = await html2canvas(container, {
            scale: 2,
            backgroundColor: null,
            useCORS: true,
            logging: false,
            imageTimeout: 5000, // Shorter timeout for images
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Share logic
        if (Capacitor.isNativePlatform()) {
            await Share.share({
                title: 'مشاركة',
                text: 'شارك من تطبيق مصحف احمد وليلى 🕌',
                url: dataUrl, 
                dialogTitle: 'مشاركة عبر'
            });
            if (setToastMessage) setToastMessage('');
        } else if (navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'dhikr.jpg', { type: 'image/jpeg' });
                
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'مشاركة',
                        text: 'شارك من تطبيق مصحف احمد وليلى 🕌'
                    });
                } else {
                    await downloadFile(dataUrl, text, setToastMessage);
                }
            } catch (e) {
                console.error('Navigator share failed', e);
                await downloadFile(dataUrl, text, setToastMessage);
            }
        } else {
            await downloadFile(dataUrl, text, setToastMessage);
        }

    } catch (err) {
        console.error('Share Error:', err);
        if (setToastMessage) {
            setToastMessage('حدث خطأ في المشاركة، جاري المحاولة بطريقة أخرى...');
            setTimeout(() => {
                showFallbackShare(text, setToastMessage);
            }, 1500);
        }
    } finally {
        if (document.getElementById(containerId)) {
            document.body.removeChild(container);
        }
        // Ensure toast is cleared after some time if it wasn't cleared by share logic
        setTimeout(() => {
            if (setToastMessage) setToastMessage('');
        }, 3000);
    }
};

const downloadFile = async (dataUrl: string, text: string, setToastMessage?: (msg: string) => void) => {
    try {
        const link = document.createElement('a');
        link.download = `dhikr_${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (setToastMessage) setToastMessage('تم تحميل الصورة');
    } catch (e) {
        console.error('Download failed', e);
    }
    setTimeout(() => {
        if (setToastMessage) setToastMessage('');
        showFallbackShare(text, setToastMessage);
    }, 2000);
};

const showFallbackShare = async (text: string, setToastMessage?: (msg: string) => void) => {
    try {
        const plainText = text.replace(/<[^>]*>?/gm, '');
        if (navigator.share) {
            await navigator.share({
                title: 'مشاركة',
                text: plainText + '\n\nشارك من تطبيق مصحف احمد وليلى 🕌'
            });
        }
    } catch (e) {}
    if (setToastMessage) setToastMessage('');
};
