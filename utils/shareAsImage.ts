import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface ShareOptions {
    text: string;
    title?: string;
    source?: string;
    category?: string;
    theme?: any;
    isEn?: boolean;
    language?: string;
    setToastMessage?: (msg: string) => void;
}

// Helper to draw rounded rectangle with cross-browser canvas support
function drawRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Wrap text into clean lines respecting maximum width and paragraph breaks
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): { text: string; isHighlight?: boolean; isBullet?: boolean }[] {
    const clean = (text || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');

    const rawParagraphs = clean.split('\n');
    const result: { text: string; isHighlight?: boolean; isBullet?: boolean }[] = [];

    for (const rawParagraph of rawParagraphs) {
        const paragraph = rawParagraph.trim();
        if (!paragraph) {
            result.push({ text: '' }); // Empty spacing line
            continue;
        }

        const isHighlight = paragraph.startsWith('💡') || paragraph.startsWith('📜') || paragraph.startsWith('📖');
        const isBullet = paragraph.startsWith('•') || paragraph.startsWith('-') || /^[0-9]+[.-]/.test(paragraph);

        const words = paragraph.split(/\s+/);
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                result.push({ text: currentLine, isHighlight, isBullet });
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            result.push({ text: currentLine, isHighlight, isBullet });
        }
    }
    return result;
}

/**
 * Pure Canvas 2D card renderer that supports both Arabic and English seamlessly.
 * Dynamically adapts dimensions and height to content volume:
 * - Short text: Compact card with tight, balanced margins and ZERO empty void at bottom.
 * - Long text: Expands seamlessly to accommodate all paragraphs without truncation.
 * - Proportioned for mobile phones and tablets (1080px crisp high-DPI width).
 * When in English: LTR alignment, Latin typography, English brand name and references.
 * When in Arabic: RTL alignment, Amiri/Cairo font, Arabic brand name and references.
 */
export async function renderCardToPureCanvas(options: ShareOptions): Promise<HTMLCanvasElement> {
    const { text, title, source, category, theme, isEn: explicitIsEn, language } = options;

    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    // Ensure fonts are ready
    try {
        await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 300))
        ]);
    } catch (e) {
        // Proceed with fallbacks
    }

    // --- STANDARD VERTICAL SOCIAL DIMENSIONS (4:5 Portrait for Instagram, Facebook & Mobile Screens) ---
    const width = 1080;
    const baseHeight = 1350; // Standard 4:5 vertical aspect ratio
    const outerMargin = 26;
    const innerMargin = 46;
    // Comfortable reading column width (so text wraps into 3-6 balanced poetic lines instead of stretching wide)
    const horizontalContentPadding = 140;
    const maxTextWidth = width - (horizontalContentPadding * 2);

    const fontFamily = isEn 
        ? "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        : "'Amiri', 'Cairo', 'Traditional Arabic', sans-serif";

    // Sanitize and ensure pure English when isEn is active
    let cleanCategory = category ? category.trim() : '';
    if (isEn && cleanCategory && /[\u0600-\u06FF]/.test(cleanCategory)) {
        cleanCategory = 'Remembrances & Supplications';
    }

    let cleanTitle = title ? title.trim() : '';
    if (isEn && cleanTitle && /[\u0600-\u06FF]/.test(cleanTitle)) {
        cleanTitle = 'Remembrance (Dhikr)';
    }

    let cleanSource = source ? source.trim() : '';
    if (isEn && cleanSource && /[\u0600-\u06FF]/.test(cleanSource)) {
        cleanSource = cleanSource
            .replace(/مرة واحدة/g, 'Once')
            .replace(/مرات/g, 'times')
            .replace(/مرة/g, 'times')
            .replace(/البداية/g, 'Start')
            .replace(/تمام المائة/g, 'Completion of 100')
            .replace(/صحيح البخاري/g, 'Sahih Al-Bukhari')
            .replace(/صحيح مسلم/g, 'Sahih Muslim')
            .replace(/سنن أبي داود/g, 'Sunan Abi Dawud')
            .replace(/سنن الترمذي/g, 'Sunan At-Tirmidhi')
            .replace(/سنن النسائي/g, "Sunan An-Nasa'i")
            .replace(/سنن ابن ماجه/g, 'Sunan Ibn Majah')
            .replace(/سورة/g, 'Surah')
            .replace(/آية/g, 'Ayah');
        if (/[\u0600-\u06FF]/.test(cleanSource)) {
            cleanSource = '';
        }
    }

    let cleanText = text ? text.trim() : '';
    if (isEn && cleanText && /[\u0600-\u06FF]/.test(cleanText)) {
        cleanText = cleanText.replace(/[\u0600-\u06FF]/g, '').trim() || text;
    }

    // Adaptive typography sizing for vertical mobile card
    const cleanLen = cleanText.replace(/<[^>]+>/g, '').length;
    let bodyFontSize: number;
    let lineHeight: number;

    if (cleanLen > 650) {
        bodyFontSize = isEn ? 23 : 24;
        lineHeight = isEn ? 40 : 44;
    } else if (cleanLen > 380) {
        bodyFontSize = isEn ? 26 : 28;
        lineHeight = isEn ? 46 : 52;
    } else if (cleanLen > 180) {
        bodyFontSize = isEn ? 30 : 33;
        lineHeight = isEn ? 52 : 60;
    } else if (cleanLen > 80) {
        bodyFontSize = isEn ? 34 : 37;
        lineHeight = isEn ? 58 : 66;
    } else {
        // Very short text: bold, majestic typography that commands attention
        bodyFontSize = isEn ? 38 : 42;
        lineHeight = isEn ? 62 : 72;
    }

    // Temporary measurement context with exact font styling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = 100;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.direction = isEn ? 'ltr' : 'rtl';
    tempCtx.font = `500 ${bodyFontSize}px ${fontFamily}`;

    const lines = wrapText(tempCtx, cleanText, maxTextWidth);

    // --- MEASURE VERTICAL HEIGHTS ---
    // 1. Top Section (Bismillah + Category Badge)
    const bismillahText = isEn 
        ? 'In the Name of Allah, the Entirely Merciful, the Especially Merciful' 
        : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    const topSectionStartY = innerMargin + 32;
    let topSectionEndY = topSectionStartY + (isEn ? 24 : 38); // Bismillah height
    if (cleanCategory) {
        topSectionEndY += 16 + 36; // gap + badge height (36px)
    }
    topSectionEndY += 20; // safety margin below top section

    // 2. Middle Section (Title + Divider + Body Lines + Source)
    let middleHeight = 0;
    if (cleanTitle) {
        middleHeight += 44 + 14 + 16 + 28; // Title + gap + divider + gap to text
    }
    for (const l of lines) {
        if (!l.text) {
            middleHeight += lineHeight * 0.45;
        } else {
            middleHeight += lineHeight;
        }
    }
    middleHeight += 20; // gap below text
    if (cleanSource) {
        middleHeight += 16 + 28 + 18; // divider + source text + gap
    }

    // 3. Bottom Section (Footer Brand)
    const footerHeight = 22 + 30 + 6 + 18 + 24; // divider + brandName + gap + subtitle + padding
    const footerTotalNeeded = footerHeight + innerMargin;

    // 4. Determine Final Canvas Height:
    // If content fits within standard 4:5 vertical (1350px), use 1350px.
    // If text is very long, expand vertically beyond 1350px.
    const totalRequiredHeight = topSectionEndY + middleHeight + 40 + footerTotalNeeded;
    const finalHeight = Math.max(baseHeight, Math.round(totalRequiredHeight));

    // Calculate Middle Start Y:
    // If finalHeight === baseHeight, vertically center the middle section in available space!
    let middleStartY = topSectionEndY + 20;
    const footerStartY = finalHeight === baseHeight
        ? (finalHeight - innerMargin - 85)
        : (middleStartY + middleHeight + 30);

    if (finalHeight === baseHeight) {
        const availableMiddleSpace = footerStartY - topSectionEndY;
        if (availableMiddleSpace > middleHeight) {
            middleStartY = Math.round(topSectionEndY + (availableMiddleSpace - middleHeight) / 2);
        }
    }

    // Create target canvas with exact vertical dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d')!;

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.direction = isEn ? 'ltr' : 'rtl';

    // Theme colors
    const primaryColor = theme?.palette?.[0] || '#064e3b';
    const secondaryColor = theme?.palette?.[1] || '#0f766e';

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, finalHeight);
    bgGrad.addColorStop(0, primaryColor);
    bgGrad.addColorStop(0.5, secondaryColor);
    bgGrad.addColorStop(1, '#062621'); // Deep rich bottom
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, finalHeight);

    // 2. Subtle Radial Glow in Center of Vertical Card
    const glow = ctx.createRadialGradient(width / 2, finalHeight * 0.48, 50, width / 2, finalHeight * 0.48, width * 0.7);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
    glow.addColorStop(0.55, 'rgba(255, 255, 255, 0.03)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, finalHeight);

    // 3. Subtle Geometric Star Pattern Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const step = 44;
    for (let x = 20; x < width; x += step) {
        for (let y = 20; y < finalHeight; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();

    // 4. Outer & Inner Luxury Frames
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2.2;
    drawRoundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, finalHeight - outerMargin * 2, 32);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)'; // Golden border
    ctx.lineWidth = 1.8;
    drawRoundRect(ctx, innerMargin, innerMargin, width - innerMargin * 2, finalHeight - innerMargin * 2, 24);
    ctx.fill();
    ctx.stroke();

    // Corner Ornaments
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.lineWidth = 2.5;
    const cornerSize = 24;
    const corners = [
        [innerMargin + 8, innerMargin + 8, 1, 1],
        [width - innerMargin - 8, innerMargin + 8, -1, 1],
        [innerMargin + 8, finalHeight - innerMargin - 8, 1, -1],
        [width - innerMargin - 8, finalHeight - innerMargin - 8, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * cornerSize);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * cornerSize, cy);
        ctx.stroke();
    }

    // 5. TOP SECTION: Bismillah & Category Badge
    let currentTopY = topSectionStartY;
    ctx.save();
    ctx.font = isEn ? `bold 16px ${fontFamily}` : `600 30px 'Amiri', 'Traditional Arabic', serif`;
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fillText(bismillahText, width / 2, currentTopY + (isEn ? 16 : 24));
    ctx.restore();

    currentTopY += isEn ? 28 : 42;

    if (cleanCategory) {
        ctx.font = `bold 17px ${fontFamily}`;
        const catMetrics = ctx.measureText(cleanCategory);
        const pillW = catMetrics.width + 48;
        const pillH = 36;
        const pillX = (width - pillW) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
        ctx.lineWidth = 1.2;
        drawRoundRect(ctx, pillX, currentTopY, pillW, pillH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(cleanCategory, width / 2, currentTopY + 24);
    }

    // 6. MIDDLE SECTION: Title & Elegant Divider
    let currentMiddleY = middleStartY;
    if (cleanTitle) {
        ctx.save();
        ctx.font = `bold 34px ${fontFamily}`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillText(cleanTitle, width / 2, currentMiddleY + 30);
        ctx.restore();

        currentMiddleY += 46;

        // Elegant Golden Divider with Center Diamond
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 160, currentMiddleY);
        ctx.lineTo(width / 2 - 16, currentMiddleY);
        ctx.moveTo(width / 2 + 16, currentMiddleY);
        ctx.lineTo(width / 2 + 160, currentMiddleY);
        ctx.stroke();

        // Center Diamond
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(width / 2, currentMiddleY - 6);
        ctx.lineTo(width / 2 + 6, currentMiddleY);
        ctx.lineTo(width / 2, currentMiddleY + 6);
        ctx.lineTo(width / 2 - 6, currentMiddleY);
        ctx.closePath();
        ctx.fill();

        currentMiddleY += 28;
    }

    // 7. MIDDLE SECTION: Body Text (Poetic & Comfortable Vertical Line Wrapping)
    ctx.direction = isEn ? 'ltr' : 'rtl';
    ctx.textAlign = 'center';

    for (const lineObj of lines) {
        if (!lineObj.text) {
            currentMiddleY += lineHeight * 0.45;
            continue;
        }

        ctx.save();
        if (lineObj.isHighlight) {
            ctx.font = `bold ${bodyFontSize + 1}px ${fontFamily}`;
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 4;
        } else if (lineObj.isBullet) {
            ctx.font = `500 ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = '#f1f5f9';
        } else {
            ctx.font = `normal ${bodyFontSize}px ${fontFamily}`;
            ctx.fillStyle = '#ffffff';
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 4;
        ctx.fillText(lineObj.text, width / 2, currentMiddleY + bodyFontSize * 0.85);
        ctx.restore();

        currentMiddleY += lineHeight;
    }

    currentMiddleY += 16;

    // 8. MIDDLE SECTION: Source & Metadata (if provided)
    if (cleanSource) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(horizontalContentPadding + 20, currentMiddleY);
        ctx.lineTo(width - horizontalContentPadding - 20, currentMiddleY);
        ctx.stroke();

        ctx.font = `bold 19px ${fontFamily}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(cleanSource, width / 2, currentMiddleY + 22);
    }

    // 9. BOTTOM SECTION: Footer Brand (Grounded at the bottom of the vertical card)
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 150, footerStartY);
    ctx.lineTo(width / 2 + 150, footerStartY);
    ctx.stroke();

    const brandName = isEn 
        ? 'Mushaf Ahmed & Laila' 
        : 'مصحف أحمد وليلى';

    const brandSubtitle = isEn
        ? 'Holy Quran & Daily Remembrance'
        : 'تلاوة وتدبر وسيرة نبوية';

    ctx.save();
    ctx.font = `bold 24px ${fontFamily}`;
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(brandName, width / 2, footerStartY + 26);

    ctx.font = `500 14px ${fontFamily}`;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.fillText(brandSubtitle, width / 2, footerStartY + 50);
    ctx.restore();

    return canvas;
}

/**
 * Universal high-reliability sharing function for cards and quotes
 */
export const shareAsImage = async ({ text, title, source, category, theme, isEn: explicitIsEn, language, setToastMessage }: ShareOptions) => {
    const isEn = explicitIsEn ?? (language === 'en' || !(/[\u0600-\u06FF]/.test(text || '')));

    if (setToastMessage) {
        setToastMessage(isEn ? 'Preparing high quality image...' : 'جاري تجهيز الصورة بدقة عالية...');
    }

    try {
        const canvas = await renderCardToPureCanvas({
            text,
            title,
            source,
            category,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        if (!dataUrl || dataUrl === 'data:,') {
            throw new Error('Failed to generate image data');
        }

        const shareTitle = title || (isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد وليلى');
        const shareDialogTitle = isEn ? 'Share Image via' : 'مشاركة البطاقة كصورة عبر';
        const shareFileName = isEn ? `ahmed_layla_card_${Date.now()}.jpg` : `mus-share_${Date.now()}.jpg`;
        const shareText = isEn 
            ? `${shareTitle}\nMushaf Ahmed & Laila • Holy Quran & Daily Remembrance`
            : `${shareTitle}\nمصحف أحمد وليلى • تلاوة وتدبر وسيرة نبوية`;

        // Share via Native Device Sheet or Web Share
        if (Capacitor.isNativePlatform()) {
            const base64Data = dataUrl.split(',')[1];

            const savedFile = await Filesystem.writeFile({
                path: shareFileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await Share.share({
                title: shareTitle,
                text: shareText,
                url: savedFile.uri,
                dialogTitle: shareDialogTitle
            });
        } else if (navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], shareFileName, { type: 'image/jpeg' });

                const sharePayload: ShareData = {
                    files: [file],
                    title: shareTitle,
                    text: shareText
                };

                if (navigator.canShare && navigator.canShare(sharePayload)) {
                    await navigator.share(sharePayload);
                } else if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: shareTitle
                    });
                } else {
                    await downloadFile(dataUrl, isEn, setToastMessage);
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.warn('Navigator share file failed, falling back to download', e);
                    await downloadFile(dataUrl, isEn, setToastMessage);
                }
            }
        } else {
            await downloadFile(dataUrl, isEn, setToastMessage);
        }

        if (setToastMessage) {
            setToastMessage(isEn ? 'Shared successfully' : 'تمت المشاركة بنجاح');
        }
    } catch (err) {
        console.error('Share Error:', err);
        if (setToastMessage) {
            setToastMessage(isEn ? 'Failed to share image' : 'فشلت المشاركة كصورة');
        }
    } finally {
        setTimeout(() => {
            if (setToastMessage) setToastMessage('');
        }, 2500);
    }
};

const downloadFile = async (dataUrl: string, isEn: boolean, setToastMessage?: (msg: string) => void) => {
    try {
        const link = document.createElement('a');
        link.download = isEn ? `ahmed_layla_card_${Date.now()}.jpg` : `mushaf_share_${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (setToastMessage) {
            setToastMessage(isEn ? 'Image downloaded successfully' : 'تم تنزيل الصورة بنجاح');
        }
    } catch (e) {
        console.error('Download failed', e);
        if (setToastMessage) {
            setToastMessage(isEn ? 'Failed to download image' : 'فشل تنزيل الصورة');
        }
    }
};
