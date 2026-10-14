import { safeHtml2Canvas } from './canvasHelper';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface ShareOptions {
    text: string;
    title?: string;
    source?: string;
    category?: string;
    theme: any;
    setToastMessage?: (msg: string) => void;
}

export const shareAsImage = async ({ text, title, source, category, theme, setToastMessage }: ShareOptions) => {
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
        container.style.backgroundColor = '#ffffff'; // Ensure an opaque background for the wrapper
        
        // Use theme palette or defaults
        const primaryColor = theme?.palette?.[0] || '#4CAF50';
        const secondaryColor = theme?.palette?.[1] || '#2E7D32';

        // Adaptive font sizing based on text length
        const textLen = (text || '').length;
        const fontSize = textLen > 350 ? '20px' : textLen > 200 ? '24px' : textLen > 100 ? '28px' : '34px';
        const lineHeight = textLen > 350 ? '1.6' : textLen > 200 ? '1.7' : '1.8';

        // Create content
        container.innerHTML = `
            <div id="share-card" style="
                background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
                padding: 28px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 420px;
                position: relative;
                color: white;
                text-align: center;
                box-shadow: inset 0 0 100px rgba(0,0,0,0.2);
                font-family: ${theme?.font || '"Amiri", serif'};
                box-sizing: border-box;
            ">
                <!-- Decorative Islamic Pattern Overlay -->
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
                    padding: 36px 32px;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.15);
                    width: 100%;
                    box-sizing: border-box;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    position: relative;
                    z-index: 1;
                    letter-spacing: 0;
                    word-spacing: 0;
                ">
                    ${title ? `
                        <div style="
                            font-size: 28px;
                            font-weight: 800;
                            margin-bottom: 22px;
                            padding-bottom: 14px;
                            border-bottom: 2px solid rgba(255,255,255,0.3);
                            color: #fef08a;
                            font-family: 'Cairo', 'Amiri', sans-serif;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            letter-spacing: 0.5px;
                        ">
                            ${title}
                        </div>
                    ` : ''}

                    <div style="
                        font-size: ${fontSize};
                        line-height: ${lineHeight};
                        margin-bottom: 24px;
                        font-family: inherit;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        white-space: pre-line;
                    ">
                        ${text.replace(/\n/g, '<br/>')}
                    </div>
                    
                    ${(category || source) ? `
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            margin-top: 18px;
                            padding-top: 18px;
                            border-top: 1px solid rgba(255,255,255,0.2);
                        ">
                            <span style="
                                font-size: 17px;
                                opacity: 0.95;
                                font-weight: bold;
                                font-family: 'Cairo', sans-serif;
                            ">
                                ${[category, source].filter(Boolean).join(' • ')}
                            </span>
                        </div>
                    ` : ''}
                    
                    <!-- Brand Footer -->
                    <div style="
                        margin-top: ${(category || source) ? '14px' : '24px'};
                        font-size: 19px;
                        font-weight: bold;
                        opacity: 0.95;
                        font-family: inherit;
                        ${!(category || source) ? 'padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.2);' : ''}
                    ">
                        مصحف أحمد وليلى
                    </div>
                </div>
            </div>`;

        document.body.appendChild(container);

        // Wait for fonts and styles to settle
        await new Promise(r => setTimeout(r, 500));

        const canvas = await safeHtml2Canvas(container, {
            scale: 3, // High quality scale
            backgroundColor: null,
            useCORS: true,
            logging: false,
            imageTimeout: 15000, 
            removeContainer: true
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        if (!dataUrl || dataUrl === 'data:,') {
            throw new Error('Failed to generate image data');
        }

        // Share logic
        if (Capacitor.isNativePlatform()) {
            const fileName = `mus-share_${Date.now()}.jpg`;
            const base64Data = dataUrl.split(',')[1];
            
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await Share.share({
                title: title || 'مشاركة',
                url: savedFile.uri, 
                dialogTitle: 'مشاركة عبر'
            });
        } else if (navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'mushaf_card.jpg', { type: 'image/jpeg' });
                
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: title || 'مشاركة'
                    });
                } else {
                    await downloadFile(dataUrl, setToastMessage);
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.error('Navigator share failed', e);
                    await downloadFile(dataUrl, setToastMessage);
                }
            }
        } else {
            await downloadFile(dataUrl, setToastMessage);
        }

        if (setToastMessage) setToastMessage('');

    } catch (err) {
        console.error('Share Error:', err);
        if (setToastMessage) {
            setToastMessage('فشلت المشاركة كصورة');
        }
    } finally {
        if (document.getElementById(containerId)) {
            document.body.removeChild(container);
        }
        setTimeout(() => {
            if (setToastMessage) setToastMessage('');
        }, 3000);
    }
};

const downloadFile = async (dataUrl: string, setToastMessage?: (msg: string) => void) => {
    try {
        const link = document.createElement('a');
        link.download = `mushaf_share_${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (setToastMessage) setToastMessage('تم تحميل الصورة للمشاركة');
    } catch (e) {
        console.error('Download failed', e);
        if (setToastMessage) setToastMessage('فشل تحميل الصورة');
    }
};
