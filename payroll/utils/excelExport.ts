import ExcelJS from 'exceljs';
import { Employee, Signatures } from '../types';
import { calculateEmployeeTotals, calculateGrandTotals, getEmployeeFieldPhase } from './calculations';
import { getDynamicSheetTitle, getFormattedTitle } from './dateUtils';

export async function exportPayrollToExcel(
  employees: Employee[], 
  sheetTitle: string = getDynamicSheetTitle(),
  signatures?: Signatures,
  payrollPhase: 'full' | 'phase1' | 'phase2' = 'full'
) {
  // Use a temporary phase-filtered title
  const displayTitle = getFormattedTitle(sheetTitle, payrollPhase);

  const wb = new ExcelJS.Workbook();
  wb.creator = "نظام إدارة كشوف الرواتب";
  wb.created = new Date();

  const ws = wb.addWorksheet("كشف الرواتب", {
    views: [
      {
        rightToLeft: true,
        showGridLines: true
      }
    ],
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1, // Crucial: forces Excel to print all 48 employees on exactly 1 landscape sheet!
      horizontalCentered: true,
      verticalCentered: false,
      margins: {
        left: 0.2,
        right: 0.2,
        top: 0.3,
        bottom: 0.3,
        header: 0.1,
        footer: 0.1
      }
    }
  });

  // Filter out employees with zero total (net salary)
  const activeEmployees = employees.filter(emp => {
    const totals = calculateEmployeeTotals(emp, payrollPhase);
    return totals.netSalary > 0;
  });

  // Calculate Grand Totals once at the beginning
  const grandTotals = calculateGrandTotals(activeEmployees, payrollPhase);

  // Define column visibility based on totals (Excel export shows all columns without exceptions)
  const colVisibility = {
    num: true,
    code: true,
    name: true,
    branch: true,
    job: true,
    basic: true,
    overtimeHours: true,
    overtime: true,
    comm: true,
    housing: true,
    food: true,
    trans: true,
    commis: true,
    bonus: true,
    totalEnt: true,
    insur: true,
    deduct: true,
    loan: true,
    absence: true,
    totalDed: true,
    net: true
  };

  // Filter columns based on visibility
  const allColumns = [
    { key: 'num', width: 5.5, label: "الرقم" },
    { key: 'code', width: 8.5, label: "كود الموظف" },
    { key: 'name', width: 22, label: "اسم الموظف" },
    { key: 'branch', width: 13, label: "الإدارة / الفرع" },
    { key: 'job', width: 13, label: "الوظيفة" },
    { key: 'basic', width: 11, label: "الأساسي" },
    { key: 'overtimeHours', width: 8.5, label: "ساعات العمل" },
    { key: 'overtime', width: 9, label: "إضافي" },
    { key: 'comm', width: 9, label: "اتصال" },
    { key: 'housing', width: 9, label: "سكن" },
    { key: 'food', width: 9, label: "طعام" },
    { key: 'trans', width: 9, label: "مواصلات" },
    { key: 'commis', width: 9, label: "عمولة" },
    { key: 'bonus', width: 9, label: "مكافأة" },
    { key: 'totalEnt', width: 12, label: "إجمالي" },
    { key: 'insur', width: 9, label: "تأمينات" },
    { key: 'deduct', width: 9, label: "خصم" },
    { key: 'loan', width: 9, label: "سلفة" },
    { key: 'absence', width: 9, label: "غيابات" },
    { key: 'totalDed', width: 11, label: "إجمالي" },
    { key: 'net', width: 13.5, label: "الصافي المستحق" },
  ];

  const visibleColumns = allColumns.filter(col => colVisibility[col.key as keyof typeof colVisibility]);
  ws.columns = visibleColumns.map(col => ({ key: col.key, width: col.width }));

  const totalCols = visibleColumns.length;
  const entitlementCols = visibleColumns.filter(c => ['basic', 'overtime', 'comm', 'housing', 'food', 'trans', 'commis', 'bonus', 'totalEnt'].includes(c.key)).length;
  const deductionCols = visibleColumns.filter(c => ['insur', 'deduct', 'loan', 'absence', 'totalDed'].includes(c.key)).length;

  // Row 1: Sheet Title Row
  const titleRow = ws.addRow([displayTitle]);
  titleRow.height = 34;
  ws.mergeCells(1, 1, 1, totalCols);
  const titleCell = ws.getCell(1, 1);
  titleCell.font = { name: 'Tahoma', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Dark Slate / Navy matching UI header
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 2: Spacer
  const spacerRow = ws.addRow([]);
  spacerRow.height = 6;

  // Row 3 & Row 4: Two-Tier Professional Headers
  const row3Data = [
    "الرقم", "كود الموظف", "اسم الموظف", "الإدارة / الفرع", "الوظيفة",
    "إستحقاقات العاملين", ...Array(entitlementCols - 1).fill(""),
    "إستقطاعات والخصومات", ...Array(deductionCols - 1).fill(""),
    "الصافي المستحق"
  ];
  const row3 = ws.addRow(row3Data);
  row3.height = 24;

  const row4Data = [
    "", "", "", "", "",
    ...visibleColumns.filter(c => ['basic', 'overtime', 'comm', 'housing', 'food', 'trans', 'commis', 'bonus', 'totalEnt'].includes(c.key)).map(c => c.label),
    ...visibleColumns.filter(c => ['insur', 'deduct', 'loan', 'absence', 'totalDed'].includes(c.key)).map(c => c.label),
    ""
  ];
  const row4 = ws.addRow(row4Data);
  row4.height = 22;

  // Merge Header Cells dynamically
  ws.mergeCells(3, 1, 4, 1); // الرقم
  ws.mergeCells(3, 2, 4, 2); // كود الموظف
  ws.mergeCells(3, 3, 4, 3); // اسم الموظف
  ws.mergeCells(3, 4, 4, 4); // الإدارة / الفرع
  ws.mergeCells(3, 5, 4, 5); // الوظيفة
  
  // Entitlements merge
  const entStart = 6;
  const entEnd = 6 + entitlementCols - 1;
  ws.mergeCells(3, entStart, 3, entEnd);

  // Deductions merge
  const dedStart = entEnd + 1;
  const dedEnd = entEnd + deductionCols;
  ws.mergeCells(3, dedStart, 3, dedEnd);

  // Net Salary merge
  ws.mergeCells(3, totalCols, 4, totalCols);

  const headerBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'medium', color: { argb: 'FF475569' } },
    left: { style: 'thin', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'medium', color: { argb: 'FF475569' } },
    right: { style: 'thin', color: { argb: 'FF94A3B8' } },
  };

  for (let r = 3; r <= 4; r++) {
    const row = ws.getRow(r);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Tahoma', size: 9.5, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = headerBorder;

      if (colNumber >= 1 && colNumber <= 5) {
        // Basic Employee Info: White background with dark text
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.font = { name: 'Tahoma', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colNumber >= entStart && colNumber <= entEnd) {
        // Entitlements
        if (r === 3) {
          // Top Tier: Light Blue bg, Amber text
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
          cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FFB45309' } };
        } else {
          // Bottom Tier: Slate-50 bg, Amber text
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: colNumber === entEnd ? { argb: 'FFF1F5F9' } : { argb: 'FFF8FAFC' } };
          cell.font = { name: 'Tahoma', size: 9, bold: true, color: { argb: 'FFB45309' } };
        }
      } else if (colNumber >= dedStart && colNumber <= dedEnd) {
        // Deductions
        if (r === 3) {
          // Top Tier: Light Rose bg, Dark Rose text
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
          cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF881337' } };
        } else {
          // Bottom Tier: Slate-50 bg, Rose text
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: colNumber === dedEnd ? { argb: 'FFFFE4E6' } : { argb: 'FFF8FAFC' } };
          cell.font = { name: 'Tahoma', size: 9, bold: true, color: { argb: 'FFBE123C' } };
        }
      } else if (colNumber === totalCols) {
        // Net Salary: White background, Blue text
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF1D4ED8' } };
      }
    });
  }

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  const numFmt = '#,##0.00;[Red]-#,##0.00;"-"';

  // Data Rows
  activeEmployees.forEach((emp, index) => {
    const totals = calculateEmployeeTotals(emp, payrollPhase);
    
    // Construct row data based on visible columns
    const rowData = visibleColumns.map(col => {
      const colKeyToField: { [key: string]: string } = {
        basic: 'basicSalary',
        comm: 'communicationAllowance',
        housing: 'housingAllowance',
        food: 'foodAllowance',
        trans: 'transportationAllowance',
        insur: 'insuranceDeduction',
        overtimeHours: 'overtimeHours',
        overtime: 'overtime',
        commis: 'commission',
        bonus: 'bonus',
        deduct: 'generalDeduction',
        loan: 'loan',
        absence: 'absenceDays',
      };

      let isVisibleInPhase = true;
      if ((payrollPhase === 'phase1' || payrollPhase === 'phase2') && colKeyToField[col.key]) {
        const targetPhase = payrollPhase === 'phase1' ? '1' : '2';
        isVisibleInPhase = getEmployeeFieldPhase(emp, colKeyToField[col.key]) === targetPhase;
      }

      const getVal = (val: number) => isVisibleInPhase ? val : 0;

      switch(col.key) {
        case 'num': return index + 1;
        case 'code': return emp.code;
        case 'name': return emp.name;
        case 'branch': return emp.branch || 'أخرى';
        case 'job': return emp.jobTitle;
        case 'basic': return getVal(emp.basicSalary);
        case 'overtimeHours': return getVal(emp.overtimeHours || 0);
        case 'overtime': return getVal(emp.overtime || 0);
        case 'comm': return getVal(emp.communicationAllowance || 0);
        case 'housing': return getVal(emp.housingAllowance || 0);
        case 'food': return getVal(emp.foodAllowance || 0);
        case 'trans': return getVal(emp.transportationAllowance || 0);
        case 'commis': return getVal(emp.commission || 0);
        case 'bonus': return getVal(emp.bonus || 0);
        case 'totalEnt': return totals.totalEntitlements;
        case 'insur': return totals.insuranceDeduction;
        case 'deduct': return getVal(emp.generalDeduction || 0);
        case 'loan': return getVal(emp.loan || 0);
        case 'absence': return getVal(emp.absenceDeduction || 0);
        case 'totalDed': return totals.totalDeductions;
        case 'net': return totals.netSalary;
        default: return '';
      }
    });

    const row = ws.addRow(rowData);
    row.height = 16.5;

    const isEven = index % 2 === 0;
    const baseBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = thinBorder;
      cell.font = { name: 'Tahoma', size: 8.5 };

      if (colNum === 1 || colNum === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Tahoma', size: 8.5, color: { argb: 'FF64748B' } };
      } else if (colNum === 3) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.font = { name: 'Tahoma', size: 9, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colNum === 4 || colNum === 5) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Tahoma', size: 8.5, color: { argb: 'FF334155' } };
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = numFmt;
      }

      const colKey = visibleColumns[colNum - 1].key;

      if (colKey === 'totalEnt') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.font = { name: 'Tahoma', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colKey === 'totalDed') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
        cell.font = { name: 'Tahoma', size: 8.5, bold: true, color: { argb: 'FF9F1239' } };
      } else if (colKey === 'net') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
        cell.font = { name: 'Tahoma', size: 9, bold: true, color: { argb: 'FF1E40AF' } };
      } else if (['basic', 'overtime', 'comm', 'housing', 'food', 'trans', 'commis', 'bonus'].includes(colKey)) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseBg } };
        if (['overtime', 'commis', 'bonus'].includes(colKey)) {
          if (cell.value && Number(cell.value) > 0) {
            cell.font = { name: 'Tahoma', size: 8.5, color: { argb: 'FF1D4ED8' } };
          }
        }
      } else if (['insur', 'deduct', 'loan', 'absence'].includes(colKey)) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseBg } };
        if (cell.value && Number(cell.value) > 0) {
          cell.font = { name: 'Tahoma', size: 8.5, color: { argb: 'FFBE123C' } };
        }
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseBg } };
      }
    });
  });

  // Grand Totals Row
  const totalRowData = visibleColumns.map(col => {
    switch(col.key) {
      case 'num': return '';
      case 'code': return '';
      case 'name': return "الاجمالــــــى";
      case 'branch': return '';
      case 'job': return '';
      case 'basic': return grandTotals.basicSalary;
      case 'overtimeHours': return grandTotals.overtimeHours || 0;
      case 'overtime': return grandTotals.overtime;
      case 'comm': return grandTotals.communicationAllowance;
      case 'housing': return grandTotals.housingAllowance;
      case 'food': return grandTotals.foodAllowance;
      case 'trans': return grandTotals.transportationAllowance;
      case 'commis': return grandTotals.commission;
      case 'bonus': return grandTotals.bonus;
      case 'totalEnt': return grandTotals.totalEntitlements;
      case 'insur': return grandTotals.insuranceDeduction;
      case 'deduct': return grandTotals.generalDeduction;
      case 'loan': return grandTotals.loan;
      case 'absence': return grandTotals.absenceDeduction;
      case 'totalDed': return grandTotals.totalDeductions;
      case 'net': return grandTotals.netSalary;
      default: return '';
    }
  });

  const totalRow = ws.addRow(totalRowData);
  totalRow.height = 24;
  ws.mergeCells(totalRow.number, 1, totalRow.number, 5);

  const totalBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'medium', color: { argb: 'FF475569' } },
    left: { style: 'thin', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'double', color: { argb: 'FF0F172A' } },
    right: { style: 'thin', color: { argb: 'FF94A3B8' } },
  };

  totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.border = totalBorder;
    cell.font = { name: 'Tahoma', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    if (colNum <= 5) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = numFmt;
    }

    const colKey = visibleColumns[colNum - 1].key;
    if (colKey === 'totalEnt') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      cell.font = { name: 'Tahoma', size: 9.5, bold: true, color: { argb: 'FFB45309' } };
    } else if (colKey === 'totalDed') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
      cell.font = { name: 'Tahoma', size: 9.5, bold: true, color: { argb: 'FF881337' } };
    } else if (colKey === 'net') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF1D4ED8' } };
    }
  });

  // Signatures Block at Bottom
  const sigSpacer = ws.addRow([]);
  sigSpacer.height = 8;

  // We need to adjust signature placement based on visible columns if we want them centered under the table
  const middleCol = Math.floor(totalCols / 2);
  const leftCol = 3;
  const rightCol = totalCols - 2;

  // For simplicity, we'll try to spread them across the available columns
  const sigRow1Data = Array(totalCols).fill("");
  sigRow1Data[leftCol - 1] = "إعداد";
  sigRow1Data[middleCol - 2] = "مدير الحسابات";
  sigRow1Data[middleCol + 2] = "نائب المدير العام";
  sigRow1Data[rightCol - 1] = "العضو المنتدب";

  const sigTitles = ws.addRow(sigRow1Data);
  sigTitles.height = 20;

  const sigRow2Data = Array(totalCols).fill("");
  sigRow2Data[leftCol - 1] = signatures?.preparedBy || '________________';
  sigRow2Data[middleCol - 2] = signatures?.accountsManager || 'علاء أحمد عنتر المرشدي';
  sigRow2Data[middleCol + 2] = signatures?.deputyGeneralManager || 'محمد أحمد محمد البدري';
  sigRow2Data[rightCol - 1] = signatures?.managingDirector || 'نايف محمد عبدالله الخضره';

  const sigNames = ws.addRow(sigRow2Data);
  sigNames.height = 22;

  // Merge signature cells - slightly more complex now due to dynamic columns
  // Let's just merge 2-3 cells per signature for better readability
  const mergeSig = (row: number, col: number) => {
    const start = Math.max(1, col - 1);
    const end = Math.min(totalCols, col + 1);
    ws.mergeCells(row, start, row, end);
  };

  mergeSig(sigTitles.number, leftCol);
  mergeSig(sigNames.number, leftCol);
  mergeSig(sigTitles.number, middleCol - 1);
  mergeSig(sigNames.number, middleCol - 1);
  mergeSig(sigTitles.number, middleCol + 3);
  mergeSig(sigNames.number, middleCol + 3);
  mergeSig(sigTitles.number, rightCol);
  mergeSig(sigNames.number, rightCol);

  [sigTitles, sigNames].forEach((r, idx) => {
    r.eachCell({ includeEmpty: false }, (cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (idx === 0) {
        cell.font = { name: 'Tahoma', size: 9, bold: true, color: { argb: 'FF334155' } };
      } else {
        cell.font = { name: 'Tahoma', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      }
    });
  });

  // Write and trigger browser download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `كشف_رواتب_${sheetTitle.replace(/[^a-zA-Z0-9أ-ي]/g, '_')}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

