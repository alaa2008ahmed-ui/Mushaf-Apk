import { Employee, CalculatedEmployee } from './types';
import { getFormulaSettings } from './utils/formulaSettings';

export function calculateDateDifferenceInDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}

export function calculateDateDifferenceInYears(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays / 365.25;
}

export function calculateEndOfService(
  salary: number,
  years: number,
  firstPeriodYears = 5,
  firstPeriodCoeff = 0.5,
  secondPeriodCoeff = 1.0
): number {
  if (years <= 0) return 0;
  if (years <= firstPeriodYears) {
    return (salary * firstPeriodCoeff) * years;
  }
  return ((salary * firstPeriodCoeff) * firstPeriodYears) + (salary * secondPeriodCoeff * (years - firstPeriodYears));
}

export function calculateEmployeeAllowances(employee: Employee): CalculatedEmployee {
  const computedFixedAllowances = (employee.housingAllowance || 0) + 
                                  (employee.transferAllowance || 0) + 
                                  (employee.phoneAllowance || 0) + 
                                  (employee.foodAllowance || 0);

  const totalSalary = employee.basicSalary + computedFixedAllowances;
  
  const totalWorkDurationYears = calculateDateDifferenceInYears(employee.hireDate, employee.calculationDate);
  const durationSinceLastVacationYears = calculateDateDifferenceInYears(employee.lastVacationReturnDate, employee.calculationDate);
  
  // Load dynamic formula settings
  const settings = getFormulaSettings();

  // Vacation allowance days entitlement
  const vacationDaysEntitlement = totalWorkDurationYears < 5 
    ? settings.vacationLessThan5YearsDays 
    : settings.vacationMoreThan5YearsDays;
  
  const earnedVacationDays = durationSinceLastVacationYears * vacationDaysEntitlement;
  
  // Salary basis for vacation
  const vacationSalary = settings.vacationSalaryBasis === 'basic' 
    ? employee.basicSalary 
    : totalSalary;
    
  const vacationAllowance = (vacationSalary / settings.vacationDivisor) * earnedVacationDays;
  
  // Ticket allowance:
  const ticketPrice = employee.ticketPrice || 0;
  const branch = (employee.branch || '').trim();
  const isAdministrative = branch === 'الادارة' || branch === 'الإدارة';

  const intervalYears = isAdministrative 
    ? settings.ticketAdminIntervalYears 
    : settings.ticketBranchesIntervalYears;
  
  let ticketAllowance = intervalYears > 0 
    ? (ticketPrice * durationSinceLastVacationYears) / intervalYears
    : 0;

  if (settings.ticketCapToPrice && ticketAllowance > ticketPrice) {
    ticketAllowance = ticketPrice;
  }
  if (ticketAllowance < 0) {
    ticketAllowance = 0;
  }
  
  // Salary basis for EOS
  const eosSalary = settings.eosSalaryBasis === 'basic'
    ? employee.basicSalary
    : totalSalary;

  const endOfServiceAllowance = calculateEndOfService(
    eosSalary,
    totalWorkDurationYears,
    settings.eosFirstPeriodYears,
    settings.eosFirstPeriodCoefficient,
    settings.eosSecondPeriodCoefficient
  );
  
  const dueEndOfService = endOfServiceAllowance - employee.paidEndOfService;

  return {
    ...employee,
    fixedAllowances: computedFixedAllowances,
    totalSalary,
    totalWorkDurationYears,
    durationSinceLastVacationYears,
    vacationDaysEntitlement,
    earnedVacationDays,
    vacationAllowance,
    ticketAllowance,
    endOfServiceAllowance,
    dueEndOfService,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    numberingSystem: 'latn'
  }).format(amount);
}

export function formatDateGB(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return '-';
    const day = String(dateStr.getDate()).padStart(2, '0');
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const year = dateStr.getFullYear();
    return `\u200E${year}-${month}-${day}`;
  }
  const trimmed = dateStr.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `\u200E${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `\u200E${year}-${month}-${day}`;
}

export function formatDateTimeEN(dateInput?: string | Date): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : '-';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  
  return `${year}/${month}/${day}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

export function calculateIndemnityByReason(baseIndemnity: number, years: number, reason: string): number {
  if (reason === 'article_80' || reason === 'probation_period') {
    return 0;
  }
  if (reason === 'resignation') {
    if (years < 2) return 0;
    if (years >= 2 && years < 5) return baseIndemnity / 3;
    if (years >= 5 && years < 10) return (baseIndemnity * 2) / 3;
    return baseIndemnity;
  }
  // All other cases under Saudi Labor Law (end_of_contract, redundancy, force_majeure, marriage_or_childbirth, employer_breach)
  return baseIndemnity; 
}

export function triggerSafePrint(): void {
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 300);
    });
  }
}

const INTERNAL_BACKUP_KEY = "ADBA_WATER_SWC_SYSTEM_BACKUP_KEY_2026";

export function encryptBackupData(data: any): string {
  try {
    const jsonStr = JSON.stringify(data);
    const utf8Encoded = encodeURIComponent(jsonStr);
    let xorResult = '';
    for (let i = 0; i < utf8Encoded.length; i++) {
      const charCode = utf8Encoded.charCodeAt(i) ^ INTERNAL_BACKUP_KEY.charCodeAt(i % INTERNAL_BACKUP_KEY.length);
      xorResult += String.fromCharCode(charCode);
    }
    return btoa(xorResult);
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("حدث خطأ أثناء تشفير ملف النسخة الاحتياطية.");
  }
}

export function decryptBackupData(encryptedBase64: string): any {
  try {
    const xorResult = atob(encryptedBase64.trim());
    let utf8Encoded = '';
    for (let i = 0; i < xorResult.length; i++) {
      const charCode = xorResult.charCodeAt(i) ^ INTERNAL_BACKUP_KEY.charCodeAt(i % INTERNAL_BACKUP_KEY.length);
      utf8Encoded += String.fromCharCode(charCode);
    }
    const jsonStr = decodeURIComponent(utf8Encoded);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Decryption error:", err);
    throw new Error("ملف النسخة الاحتياطية غير صالح أو تالف أو بتنسيق غير صحيح.");
  }
}

export function tafqeetArabic(amount: number): string {
  if (isNaN(amount) || amount === 0) return "فقط صفر ريال سعودي لا غير";
  
  const absAmount = Math.abs(amount);
  const riyals = Math.floor(absAmount);
  const halalas = Math.round((absAmount - riyals) * 100);

  const ones = [
    "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر",
    "سبعة عشر", "ثمانية عشر", "تسعة عشر"
  ];
  const tens = [
    "", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"
  ];
  const hundreds = [
    "", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"
  ];

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const parts: string[] = [];

    if (h > 0) parts.push(hundreds[h]);

    if (rem > 0) {
      if (rem < 20) {
        parts.push(ones[rem]);
      } else {
        const t = Math.floor(rem / 10);
        const o = rem % 10;
        if (o > 0) {
          parts.push(ones[o] + " و" + tens[t]);
        } else {
          parts.push(tens[t]);
        }
      }
    }
    return parts.join(" و");
  }

  const groups = [
    { value: riyals % 1000, single: "", dual: "", plural: "" },
    { value: Math.floor(riyals / 1000) % 1000, single: "ألف", dual: "ألفان", plural: "آلاف" },
    { value: Math.floor(riyals / 1000000) % 1000, single: "مليون", dual: "مليونان", plural: "ملايين" },
    { value: Math.floor(riyals / 1000000000) % 1000, single: "مليار", dual: "ملياران", plural: "مليارات" }
  ];

  const riyalParts: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const val = groups[i].value;
    if (val === 0) continue;

    if (i === 0) {
      riyalParts.push(convertThreeDigits(val));
    } else {
      if (val === 1) {
        riyalParts.push(groups[i].single);
      } else if (val === 2) {
        riyalParts.push(groups[i].dual);
      } else if (val >= 3 && val <= 10) {
        riyalParts.push(convertThreeDigits(val) + " " + groups[i].plural);
      } else {
        riyalParts.push(convertThreeDigits(val) + " " + groups[i].single);
      }
    }
  }

  let riyalText = "";
  if (riyals > 0) {
    if (riyals === 1) riyalText = "ريال سعودي واحد";
    else if (riyals === 2) riyalText = "ريالان سعوديان";
    else {
      const baseText = riyalParts.join(" و");
      const lastTwo = riyals % 100;
      if (lastTwo >= 3 && lastTwo <= 10) {
        riyalText = baseText + " ريالات سعودية";
      } else {
        riyalText = baseText + " ريالاً سعودياً";
      }
    }
  }

  let halalaText = "";
  if (halalas > 0) {
    if (halalas === 1) halalaText = "هللة واحدة";
    else if (halalas === 2) halalaText = "هللتان";
    else if (halalas >= 3 && halalas <= 10) halalaText = convertThreeDigits(halalas) + " هللات";
    else halalaText = convertThreeDigits(halalas) + " هللة";
  }

  let result = "فقط ";
  if (riyals > 0 && halalas > 0) {
    result += riyalText + " و" + halalaText;
  } else if (riyals > 0) {
    result += riyalText;
  } else if (halalas > 0) {
    result += halalaText;
  } else {
    return "فقط صفر ريال سعودي لا غير";
  }

  result += " لا غير";
  return amount < 0 ? "سالب " + result : result;
}

export function tafqeetEnglish(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Only Zero Saudi Riyals";
  
  const absAmount = Math.abs(amount);
  const riyals = Math.floor(absAmount);
  const halalas = Math.round((absAmount - riyals) * 100);

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const parts: string[] = [];

    if (h > 0) parts.push(ones[h] + " Hundred");

    if (rem > 0) {
      if (rem < 20) {
        parts.push(ones[rem]);
      } else {
        const t = Math.floor(rem / 10);
        const o = rem % 10;
        parts.push(o > 0 ? `${tens[t]}-${ones[o]}` : tens[t]);
      }
    }
    return parts.join(" ");
  }

  const scales = ["", "Thousand", "Million", "Billion"];
  const riyalParts: string[] = [];

  let tempRiyals = riyals;
  let scaleIndex = 0;

  while (tempRiyals > 0) {
    const chunk = tempRiyals % 1000;
    if (chunk > 0) {
      const chunkStr = convertThreeDigits(chunk);
      if (scales[scaleIndex]) {
        riyalParts.unshift(chunkStr + " " + scales[scaleIndex]);
      } else {
        riyalParts.unshift(chunkStr);
      }
    }
    tempRiyals = Math.floor(tempRiyals / 1000);
    scaleIndex++;
  }

  let riyalText = "";
  if (riyals > 0) {
    riyalText = riyalParts.join(" ");
    riyalText += riyals === 1 ? " Saudi Riyal" : " Saudi Riyals";
  }

  let halalaText = "";
  if (halalas > 0) {
    halalaText = convertThreeDigits(halalas) + (halalas === 1 ? " Halala" : " Halalas");
  }

  let result = "Only ";
  if (riyals > 0 && halalas > 0) {
    result += riyalText + " and " + halalaText;
  } else if (riyals > 0) {
    result += riyalText;
  } else if (halalas > 0) {
    result += halalaText;
  } else {
    return "Only Zero Saudi Riyals";
  }

  return amount < 0 ? "Minus " + result : result;
}


