import { Employee, PayrollTotals } from '../types';

export const DEFAULT_FIELD_PHASES: { [key: string]: '1' | '2' } = {
  basicSalary: '1',
  communicationAllowance: '1',
  housingAllowance: '1',
  foodAllowance: '1',
  transportationAllowance: '1',
  insuranceDeduction: '1',
  
  overtimeHours: '2',
  overtime: '2',
  commission: '2',
  bonus: '2',
  generalDeduction: '2',
  loan: '2',
  absenceDays: '2',
  absenceDeduction: '2',
};

export function getEmployeeFieldPhase(emp: Employee, field: string): '1' | '2' {
  // 1. Employee-specific overrides take highest priority
  if (emp.fieldPhases && emp.fieldPhases[field]) {
    return emp.fieldPhases[field]!;
  }
  
  // Aliases for overrides
  if (field === 'overtime' && emp.fieldPhases?.overtimeHours) return emp.fieldPhases.overtimeHours;
  if (field === 'overtimeHours' && emp.fieldPhases?.overtime) return emp.fieldPhases.overtime;
  if (field === 'absenceDeduction' && emp.fieldPhases?.absenceDays) return emp.fieldPhases.absenceDays;
  if (field === 'absenceDays' && emp.fieldPhases?.absenceDeduction) return emp.fieldPhases.absenceDeduction;

  // 2. Global Rules based on Branch (الفرع / الإدارة)
  // Deductions fields: insuranceDeduction, generalDeduction, loan, absenceDeduction, absenceDays
  const isDeduction = [
    'insuranceDeduction', 
    'generalDeduction', 
    'loan', 
    'absenceDeduction', 
    'absenceDays'
  ].includes(field);

  if (isDeduction) {
    // For Administrators (الادارة): All deductions applied in Phase 1 (except insurance which is already Phase 1)
    if (emp.branch === 'الادارة') {
      if (field !== 'insuranceDeduction') {
        return '1';
      }
    }
    
    // For Branch Employees (فروع): All deductions (including insurance) applied in Phase 2
    if (emp.branch && emp.branch.startsWith('فرع')) {
      return '2';
    }
  }

  // 3. Fallback to system defaults
  return DEFAULT_FIELD_PHASES[field] || '1';
}

export function calculateEmployeeTotals(emp: Employee, phase: 'full' | 'phase1' | 'phase2' = 'full'): {
  totalEntitlements: number;
  totalDeductions: number;
  netSalary: number;
  insuranceDeduction: number;
  basicSalary: number;
  totalAllowances: number;
  overtime: number;
} {
  if (emp.isActive === false) {
    return {
      totalEntitlements: 0,
      totalDeductions: 0,
      netSalary: 0,
      insuranceDeduction: 0,
      basicSalary: 0,
      totalAllowances: 0,
      overtime: 0
    };
  }

  const isInsuranceEnabled = emp.hasInsurance !== false;
  const insuranceDeductionVal = isInsuranceEnabled ? (emp.insuranceDeduction || 0) : 0;
  
  let totalEntitlements = 0;
  let totalDeductions = 0;
  let basicSalary = 0;
  let totalAllowances = 0;
  let overtime = 0;

  if (phase === 'full') {
    basicSalary = emp.basicSalary || 0;
    overtime = emp.overtime || 0;
    totalAllowances = 
      (emp.communicationAllowance || 0) +
      (emp.housingAllowance || 0) +
      (emp.foodAllowance || 0) +
      (emp.transportationAllowance || 0) +
      (emp.commission || 0) +
      (emp.bonus || 0);

    totalEntitlements = basicSalary + overtime + totalAllowances;

    totalDeductions = 
      insuranceDeductionVal +
      (emp.generalDeduction || 0) +
      (emp.loan || 0) +
      (emp.absenceDeduction || 0);
  } 
  else if (phase === 'phase1' || phase === 'phase2') {
    const targetPhase = phase === 'phase1' ? '1' : '2';
    
    basicSalary = getEmployeeFieldPhase(emp, 'basicSalary') === targetPhase ? (emp.basicSalary || 0) : 0;
    overtime = getEmployeeFieldPhase(emp, 'overtime') === targetPhase ? (emp.overtime || 0) : 0;
    
    const communicationAllowance = getEmployeeFieldPhase(emp, 'communicationAllowance') === targetPhase ? (emp.communicationAllowance || 0) : 0;
    const housingAllowance = getEmployeeFieldPhase(emp, 'housingAllowance') === targetPhase ? (emp.housingAllowance || 0) : 0;
    const foodAllowance = getEmployeeFieldPhase(emp, 'foodAllowance') === targetPhase ? (emp.foodAllowance || 0) : 0;
    const transportationAllowance = getEmployeeFieldPhase(emp, 'transportationAllowance') === targetPhase ? (emp.transportationAllowance || 0) : 0;
    const commission = getEmployeeFieldPhase(emp, 'commission') === targetPhase ? (emp.commission || 0) : 0;
    const bonus = getEmployeeFieldPhase(emp, 'bonus') === targetPhase ? (emp.bonus || 0) : 0;

    totalAllowances = communicationAllowance + housingAllowance + foodAllowance + transportationAllowance + commission + bonus;
    totalEntitlements = basicSalary + overtime + totalAllowances;

    totalDeductions = 
      (getEmployeeFieldPhase(emp, 'insuranceDeduction') === targetPhase ? insuranceDeductionVal : 0) +
      (getEmployeeFieldPhase(emp, 'generalDeduction') === targetPhase ? (emp.generalDeduction || 0) : 0) +
      (getEmployeeFieldPhase(emp, 'loan') === targetPhase ? (emp.loan || 0) : 0) +
      (getEmployeeFieldPhase(emp, 'absenceDeduction') === targetPhase ? (emp.absenceDeduction || 0) : 0);
  }

  const netSalary = totalEntitlements - totalDeductions;

  return {
    totalEntitlements: Number(totalEntitlements.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netSalary: Number(netSalary.toFixed(2)),
    insuranceDeduction: (phase === 'full' || getEmployeeFieldPhase(emp, 'insuranceDeduction') === (phase === 'phase1' ? '1' : '2')) ? Number(insuranceDeductionVal.toFixed(2)) : 0,
    basicSalary: Number(basicSalary.toFixed(2)),
    totalAllowances: Number(totalAllowances.toFixed(2)),
    overtime: Number(overtime.toFixed(2))
  };
}

export function calculateGrandTotals(employees: Employee[], phase: 'full' | 'phase1' | 'phase2' = 'full'): PayrollTotals {
  return employees.reduce(
    (acc, emp) => {
      if (emp.isActive === false) return acc;
      const totals = calculateEmployeeTotals(emp, phase);
      
      const getVal = (val: number | undefined, fieldName: string) => {
        if (phase === 'full') return val || 0;
        const targetPhase = phase === 'phase1' ? '1' : '2';
        if (getEmployeeFieldPhase(emp, fieldName) === targetPhase) {
          return val || 0;
        }
        return 0;
      };

      return {
        basicSalary: acc.basicSalary + getVal(emp.basicSalary, 'basicSalary'),
        overtimeHours: acc.overtimeHours + getVal(emp.overtimeHours, 'overtimeHours'),
        overtime: acc.overtime + getVal(emp.overtime, 'overtime'),
        communicationAllowance: acc.communicationAllowance + getVal(emp.communicationAllowance, 'communicationAllowance'),
        housingAllowance: acc.housingAllowance + getVal(emp.housingAllowance, 'housingAllowance'),
        foodAllowance: acc.foodAllowance + getVal(emp.foodAllowance, 'foodAllowance'),
        transportationAllowance: acc.transportationAllowance + getVal(emp.transportationAllowance, 'transportationAllowance'),
        commission: acc.commission + getVal(emp.commission, 'commission'),
        bonus: acc.bonus + getVal(emp.bonus, 'bonus'),
        totalEntitlements: acc.totalEntitlements + totals.totalEntitlements,
        
        insuranceDeduction: acc.insuranceDeduction + totals.insuranceDeduction,
        generalDeduction: acc.generalDeduction + getVal(emp.generalDeduction, 'generalDeduction'),
        loan: acc.loan + getVal(emp.loan, 'loan'),
        absenceDays: acc.absenceDays + getVal(emp.absenceDays, 'absenceDays'),
        absenceDeduction: acc.absenceDeduction + getVal(emp.absenceDeduction, 'absenceDeduction'),
        totalDeductions: acc.totalDeductions + totals.totalDeductions,
        
        netSalary: acc.netSalary + totals.netSalary,
      };
    },
    {
      basicSalary: 0,
      overtimeHours: 0,
      overtime: 0,
      communicationAllowance: 0,
      housingAllowance: 0,
      foodAllowance: 0,
      transportationAllowance: 0,
      commission: 0,
      bonus: 0,
      totalEntitlements: 0,
      insuranceDeduction: 0,
      generalDeduction: 0,
      loan: 0,
      absenceDays: 0,
      absenceDeduction: 0,
      totalDeductions: 0,
      netSalary: 0,
    }
  );
}

export function formatCurrency(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumberClean(val: number): string {
  if (!val || val === 0) return '0';
  return val.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
}
