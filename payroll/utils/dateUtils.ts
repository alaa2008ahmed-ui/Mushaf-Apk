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
  let monthIndex: number;
  let year: number;

  if (typeof input === 'string' && /^\d{4}-\d{2}$/.test(input)) {
    const [y, m] = input.split('-').map(Number);
    monthIndex = m - 1;
    year = y;
  } else {
    const date = typeof input === 'string' ? new Date() : input;
    const day = date.getDate();
    if (day <= 5) {
      const prevDate = new Date(date);
      prevDate.setMonth(date.getMonth() - 1);
      monthIndex = prevDate.getMonth();
      year = prevDate.getFullYear();
    } else {
      monthIndex = date.getMonth();
      year = date.getFullYear();
    }
  }
  
  const monthsAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  const monthName = monthsAr[monthIndex];
  return `اجمالي رواتب شهر ${monthName} ${year} م.`;
};

/**
 * Formats the sheet title according to the selected payroll phase.
 */
export const getFormattedTitle = (title: string, phase: 'full' | 'phase1' | 'phase2', selectedMonthIso?: string): string => {
  let monthName = '';
  let yearStr = '';

  if (selectedMonthIso && /^\d{4}-\d{2}$/.test(selectedMonthIso)) {
    const [y, m] = selectedMonthIso.split('-').map(Number);
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    monthName = months[m - 1] || 'يوليو';
    yearStr = y.toString();
  }

  if (!monthName || !yearStr) {
    // Try to find the month and year from the title if selectedMonthIso is not provided
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthMatch = title.match(/(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)/);
    const yearMatch = title.match(/\b(20\d{2})\b/);
    if (monthMatch && yearMatch) {
      monthName = monthMatch[1];
      yearStr = yearMatch[1];
    } else {
      monthName = 'يوليو';
      yearStr = '2026';
    }
  }

  const suffix = ` ${yearStr} ${yearStr === '' ? '' : 'م.'}`;

  if (phase === 'full') {
    return `اجمالي رواتب شهر ${monthName} ${yearStr} م.`;
  } else if (phase === 'phase1') {
    return `اجمالي الراتب والبدلات للعاملين عن شهر ${monthName} ${yearStr} م.`;
  } else {
    return `اجمالي الاضافي للعاملين عن شهر ${monthName} ${yearStr} م.`;
  }
};

