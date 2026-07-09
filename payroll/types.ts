export interface Employee {
  id: number; // ت
  code: string; // الكود
  name: string; // الاسم
  nameEn?: string; // الاسم بالإنجليزية
  nationalId?: string; // رقم الهوية / الإقامة
  jobTitle: string; // الوظيفة
  branch: string; // الفرع / الإدارة
  hireDate: string; // تاريخ_التعيين
  iban?: string; // رقم الآيبان
  nationality?: string; // الجنسية
  hasInsurance?: boolean; // تفعيل/تعطيل التأمينات
  isActive?: boolean; // حالة الموظف (نشط / معطل)
  
  // Entitlements (إستحقاقات)
  basicSalary: number; // الراتب_الأساسي
  overtimeHours?: number; // ساعات العمل / الإضافي
  overtime: number; // اضافي
  communicationAllowance: number; // بدل_الاتصال
  housingAllowance: number; // بدل_السكن
  foodAllowance: number; // بدل_الطعام
  transportationAllowance: number; // بدل_الانتقال
  commission: number; // عمولة
  bonus: number; // مكافأة (بدلات_أخرى)
  
  // Deductions (إستقطاعات)
  insuranceDeduction: number; // التأمينات (خصم نسبة تأمين)
  generalDeduction: number; // خصم
  loan: number; // سلفة
  absenceDays?: number; // ايام الغياب
  absenceDeduction: number; // غيابات
  
  // Other info
  endOfServicePaid: number; // نهاية_الخدمة_المدفوع
  notes?: string;
  paymentStage?: '1' | '2'; // 1: المرحلة الأولى (راتب أساسي)، 2: المرحلة الثانية (كامل الراتب)
  fieldPhases?: {
    basicSalary?: '1' | '2';
    overtimeHours?: '1' | '2';
    overtime?: '1' | '2';
    communicationAllowance?: '1' | '2';
    housingAllowance?: '1' | '2';
    foodAllowance?: '1' | '2';
    transportationAllowance?: '1' | '2';
    commission?: '1' | '2';
    bonus?: '1' | '2';
    insuranceDeduction?: '1' | '2';
    generalDeduction?: '1' | '2';
    loan?: '1' | '2';
    absenceDays?: '1' | '2';
    absenceDeduction?: '1' | '2';
    [key: string]: '1' | '2' | undefined;
  };
}

export interface PayrollTotals {
  basicSalary: number;
  overtimeHours: number;
  overtime: number;
  communicationAllowance: number;
  housingAllowance: number;
  foodAllowance: number;
  transportationAllowance: number;
  commission: number;
  bonus: number;
  totalEntitlements: number;
  
  insuranceDeduction: number;
  generalDeduction: number;
  loan: number;
  absenceDays: number;
  absenceDeduction: number;
  totalDeductions: number;
  
  netSalary: number;
}

export interface Signatures {
  preparedBy: string;
  accountsManager: string;
  deputyGeneralManager: string;
  managingDirector: string;
}

export interface ArchivedMonth {
  id: string;
  monthName: string;
  archivedAt: string;
  sheetTitle: string;
  employees: Employee[];
  totals: PayrollTotals;
  employeeCount: number;
  monthIso?: string;
}

export type ViewMode = 'table' | 'analytics' | 'payslips' | 'archive' | 'settings' | 'bank' | 'account-statement';
