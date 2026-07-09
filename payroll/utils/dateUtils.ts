/**
 * Utility functions for Arabic date formatting and automatic dynamic sheet title generation.
 */

/**
 * Returns the Arabic name of the month for a given month number (1-12) or Date.
 */
export const getArabicMonthName = (input: Date | number | string = new Date()): string => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  let monthIndex = 0;
  if (typeof input === 'number') {
    monthIndex = input - 1;
  } else if (typeof input === 'string') {
    if (/^\d{4}-\d{2}$/.test(input)) {
      monthIndex = parseInt(input.split('-')[1], 10) - 1;
    } else {
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        monthIndex = date.getMonth();
      }
    }
  } else {
    monthIndex = input.getMonth();
  }
  return months[monthIndex] || 'يوليو';
};

/**
 * Automatically generates the standard Arabic payroll sheet title.
 */
export const getDynamicSheetTitle = (input: Date | string = new Date()): string => {
  let monthName = '';
  let year = 2026;

  if (typeof input === 'string' && /^\d{4}-\d{2}$/.test(input)) {
    const [y, m] = input.split('-').map(Number);
    monthName = getArabicMonthName(m);
    year = y;
  } else {
    const date = typeof input === 'string' ? new Date() : input;
    monthName = getArabicMonthName(date);
    year = date.getFullYear();
  }
  
  return `اجمالي الراتب والبدلات والاضافي للعاملين عن شهر ${monthName} ${year} م`;
};

/**
 * Formats the sheet title according to the selected payroll phase.
 */
export const getFormattedTitle = (title: string, phase: 'full' | 'phase1' | 'phase2', selectedMonthIso?: string): string => {
  let monthName = '';
  let yearStr = '';

  if (selectedMonthIso) {
    const [y, m] = selectedMonthIso.split('-').map(Number);
    if (y && m) {
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      monthName = months[m - 1] || 'يوليو';
      yearStr = y.toString();
    }
  }

  if (!monthName || !yearStr) {
    // Try to find the month and year from the title
    const monthMatch = title.match(/(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)/);
    const yearMatch = title.match(/\b(20\d{2})\b/);
    if (monthMatch && yearMatch) {
      monthName = monthMatch[1];
      yearStr = yearMatch[1];
    } else {
      // fallback extraction after 'عن شهر' or 'عن'
      const match = title.match(/(?:عن شهر|عن)\s+(.+)$/);
      let monthPart = match && match[1] ? match[1].trim() : title;
      monthPart = monthPart.replace(/\s*م\.?$/, '').trim();
      
      const prefixes = [
        "اجمالي الراتب والبدلات والاضافي للعاملين عن شهر",
        "اجمالي الراتب والبدلات للعاملين عن شهر",
        "اجمالي الاضافي للعاملين عن شهر",
        "اجمالي الراتب والبدلات والاضافي للعاملين عن",
        "اجمالي الراتب والبدلات للعاملين عن",
        "اجمالي الاضافي للعاملين عن"
      ];
      for (const prefix of prefixes) {
        if (monthPart.startsWith(prefix)) {
          monthPart = monthPart.substring(prefix.length).trim();
        }
      }
      monthName = monthPart;
      yearStr = '';
    }
  }

  const suffix = yearStr ? ` ${yearStr} م.` : ' م.';

  if (phase === 'full') {
    return `اجمالي الراتب والبدلات والاضافي للعاملين عن شهر ${monthName}${suffix}`;
  } else if (phase === 'phase1') {
    return `اجمالي الراتب والبدلات للعاملين عن شهر ${monthName}${suffix}`;
  } else {
    return `اجمالي الاضافي للعاملين عن شهر ${monthName}${suffix}`;
  }
};

