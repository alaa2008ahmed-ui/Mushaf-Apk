/* 
  Simplified Arabic Reshaper 
  This handles the basic character joining for Arabic text in jsPDF.
*/

const arabicJoiningMap: { [key: number]: string[] } = {
  0x0621: ['\uFE80'], // ALEF WITH HAMZA ABOVE
  0x0622: ['\uFE81', '\uFE82'], // ALEF WITH MADDA ABOVE
  0x0623: ['\uFE83', '\uFE84'], // ALEF WITH HAMZA ABOVE
  0x0624: ['\uFE85', '\uFE86'], // WAW WITH HAMZA ABOVE
  0x0625: ['\uFE87', '\uFE88'], // ALEF WITH HAMZA BELOW
  0x0626: ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'], // YEH WITH HAMZA ABOVE
  0x0627: ['\uFE8D', '\uFE8E'], // ALEF
  0x0628: ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'], // BEH
  0x0629: ['\uFE93', '\uFE94'], // TEH MARBUTA
  0x062A: ['\uFE95', '\uFE96', '\uFE97', '\uFE98'], // TEH
  0x062B: ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'], // THEH
  0x062C: ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'], // JEEM
  0x062D: ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'], // HAH
  0x062E: ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'], // KHAH
  0x062F: ['\uFEA9', '\uFEAA'], // DAL
  0x0630: ['\uFEAB', '\uFEAC'], // THAL
  0x0631: ['\uFEAD', '\uFEAE'], // REH
  0x0632: ['\uFEAF', '\uFEB0'], // ZAIN
  0x0633: ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'], // SEEN
  0x0634: ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'], // SHEEN
  0x0635: ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'], // SAD
  0x0636: ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'], // DAD
  0x0637: ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'], // TAH
  0x0638: ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'], // ZAH
  0x0639: ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'], // AIN
  0x063A: ['\uFECD', '\uFECE', '\uFECF', '\uFED0'], // GHAIN
  0x0641: ['\uFED1', '\uFED2', '\uFED3', '\uFED4'], // FEH
  0x0642: ['\uFED5', '\uFED6', '\uFED7', '\uFED8'], // QAF
  0x0643: ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'], // KAF
  0x0644: ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'], // LAM
  0x0645: ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'], // MEEM
  0x0646: ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'], // NOON
  0x0647: ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'], // HEH
  0x0648: ['\uFEED', '\uFEEE'], // WAW
  0x0649: ['\uFEEF', '\uFEF0'], // ALEF MAKSURA
  0x064A: ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'], // YEH
  0x0640: ['\u0640', '\u0640', '\u0640', '\u0640'], // TATWEEL
};

const joinableWithNext = [
  0x0626, 0x0628, 0x062A, 0x062B, 0x062C, 0x062D, 0x062E, 0x0633, 0x0634, 0x0635,
  0x0636, 0x0637, 0x0638, 0x0639, 0x063A, 0x0641, 0x0642, 0x0643, 0x0644, 0x0645,
  0x0646, 0x0647, 0x064A, 0x0640,
];

const joinableWithPrev = [
  0x0622, 0x0623, 0x0624, 0x0625, 0x0626, 0x0627, 0x0628, 0x0629, 0x062A, 0x062B,
  0x062C, 0x062D, 0x062E, 0x062F, 0x0630, 0x0631, 0x0632, 0x0633, 0x0634, 0x0635,
  0x0636, 0x0637, 0x0638, 0x0639, 0x063A, 0x0641, 0x0642, 0x0643, 0x0644, 0x0645,
  0x0646, 0x0647, 0x0648, 0x0649, 0x064A, 0x0640,
];

export function reshapeArabic(text: string): string {
  if (!text) return '';
  const chars = text.split('');
  const reshaped: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].charCodeAt(0);
    const map = arabicJoiningMap[code];

    if (!map) {
      reshaped.push(chars[i]);
      continue;
    }

    const prevCode = i > 0 ? chars[i - 1].charCodeAt(0) : null;
    const nextCode = i < chars.length - 1 ? chars[i + 1].charCodeAt(0) : null;

    const connectsPrev = prevCode && joinableWithNext.includes(prevCode);
    const connectsNext = nextCode && joinableWithPrev.includes(nextCode);

    let index = 0;
    if (connectsPrev && connectsNext && map.length === 4) index = 3;
    else if (connectsPrev && map.length >= 2) index = 1;
    else if (connectsNext && map.length >= 3) index = 2;

    reshaped.push(map[index]);
  }

  // Handle RTL for jsPDF
  return reshaped.reverse().join('');
}
