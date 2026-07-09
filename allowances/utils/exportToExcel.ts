import ExcelJS from 'exceljs';
import { saveOrShareFile } from './fileSaverHelper';
import { CalculatedEmployee } from '../types';
import { formatDateGB } from '../utils';
import { getCompanyNameAr, getCompanyNameEn } from './companySettings';

export async function exportEmployeesToExcel(employees: CalculatedEmployee[], branchName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('مخصصات نهاية الخدمة', {
    views: [{ rightToLeft: true }]
  });

  // Set column widths
  worksheet.columns = [
    { width: 6 },  // 1. م
    { width: 12 }, // 2. كود الموظف
    { width: 25 }, // 3. اسم الموظف
    { width: 18 }, // 4. الوظيفة
    { width: 15 }, // 5. جهة العمل
    { width: 13 }, // 6. تاريخ التعيين
    { width: 14 }, // 7. العودة من اجازة
    { width: 13 }, // 8. تاريخ الاحتساب
    { width: 11 }, // 9. مدة العمل
    { width: 11 }, // 10. مدة من اجازة
    { width: 13 }, // 11. الراتب الأساسي
    { width: 11 }, // 12. البدلات
    { width: 13 }, // 13. اجمالي الراتب
    { width: 11 }, // 14. سعر التذكرة
    { width: 12 }, // 15. مخصص التذاكر
    { width: 12 }, // 16. مخصص الاجازة
    { width: 13 }, // 17. نهاية الخدمة
    { width: 11 }, // 18. المدفوع
    { width: 11 }, // 19. المستحق
  ];

  // Title rows
  worksheet.mergeCells('A1:S1');
  const titleRow = worksheet.getCell('A1');
  titleRow.value = branchName === 'الكل' || !branchName ? 'مخصصات نهاية الخدمة' : `مخصصات نهاية الخدمة - ${branchName}`;
  titleRow.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1E293B' } };
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 35;

  worksheet.mergeCells('A2:S2');
  const companyRow = worksheet.getCell('A2');
  companyRow.value = `${getCompanyNameAr()} - ${getCompanyNameEn()}`;
  companyRow.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF334155' } };
  companyRow.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 28;

  const rawCalcDate = employees.length > 0 && employees[0].calculationDate ? employees[0].calculationDate : new Date().toISOString().split('T')[0];
  const formattedCalcDate = formatDateGB(rawCalcDate);

  worksheet.mergeCells('A3:S3');
  const dateRow = worksheet.getCell('A3');
  dateRow.value = `تاريخ الاحتساب: ${formattedCalcDate}`;
  dateRow.font = { name: 'Segoe UI', size: 11, color: { argb: 'FF64748B' } };
  dateRow.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(3).height = 22;

  worksheet.getRow(4).height = 10; // empty row

  // Table Headers (Row 5)
  const headers = [
    'م',
    'كود الموظف',
    'اسم الموظف',
    'الوظيفة',
    'جهة العمل',
    'تاريخ التعيين',
    'العودة من اجازة',
    'تاريخ الاحتساب',
    'مدة العمل',
    'مدة من اجازة',
    'الراتب الأساسي',
    'البدلات',
    'اجمالي الراتب',
    'سعر التذكرة',
    'مخصص التذاكر',
    'مخصص الاجازة',
    'نهاية الخدمة',
    'المدفوع',
    'المستحق'
  ];

  const headerRow = worksheet.getRow(5);
  headerRow.height = 32;

  headers.forEach((headerText, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = headerText;
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF334155' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };

    // Specific header colors matching app UI
    if (index === 12) { // اجمالي الراتب
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF4F46E5' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
    } else if (index === 14) { // مخصص التذاكر
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFD97706' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    } else if (index === 15) { // مخصص الاجازة
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF4F46E5' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
    } else if (index === 16) { // مخصص نهاية الخدمة
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFE11D48' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
    } else if (index === 17) { // مسحوبات نهاية الخدمة
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF64748B' } };
    } else if (index === 18) { // المستحق من نهاية الخدمة
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF059669' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    }
  });

  // Data rows
  employees.forEach((emp, index) => {
    const rowNumber = 6 + index;
    const row = worksheet.getRow(rowNumber);
    row.height = 24;

    const isDisabled = emp.isActive === false;

    const rowData = [
      index + 1,
      emp.code || emp.sequenceNumber || '',
      emp.name || '',
      emp.jobTitle || emp.branch || '',
      emp.branch || '',
      formatDateGB(emp.hireDate),
      formatDateGB(emp.lastVacationReturnDate),
      formatDateGB(emp.calculationDate),
      Number(emp.totalWorkDurationYears || 0),
      Number(emp.durationSinceLastVacationYears || 0),
      Number(emp.basicSalary || 0),
      Number(emp.fixedAllowances || 0),
      Number(emp.totalSalary || 0),
      Number(emp.ticketPrice || 0),
      Number(emp.ticketAllowance || 0),
      Number(emp.vacationAllowance || 0),
      Number(emp.endOfServiceAllowance || 0),
      Number(emp.paidEndOfService || 0),
      Number(emp.dueEndOfService || 0)
    ];

    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        strike: isDisabled,
        color: { argb: isDisabled ? 'FF94A3B8' : 'FF1E293B' }
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: colIdx === 2 ? 'right' : 'center'
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };

      // Number formats
      if (colIdx === 8 || colIdx === 9) {
        cell.numFmt = '0.00';
      } else if (colIdx >= 10) {
        cell.numFmt = '#,##0.00';
      }

      if (colIdx === 2) {
        cell.font.bold = true;
      }

      // Exact matching background fills and text colors for active employees
      if (!isDisabled) {
        if (colIdx === 12) { // اجمالي الراتب
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF4F46E5' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
        } else if (colIdx === 14) { // مخصص التذاكر
          cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FFD97706' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
        } else if (colIdx === 15) { // مخصص الاجازة
          cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF4F46E5' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
        } else if (colIdx === 16) { // مخصص نهاية الخدمة
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFE11D48' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
        } else if (colIdx === 17) { // مسحوبات نهاية الخدمة
          cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF64748B' } };
        } else if (colIdx === 18) { // المستحق من نهاية الخدمة
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF059669' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
        }
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
  });

  // Footer / Total Row
  if (employees.length > 0) {
    const activeEmployees = employees.filter(e => e.isActive !== false);
    const footerRowIndex = 6 + employees.length;
    const footerRow = worksheet.getRow(footerRowIndex);
    footerRow.height = 28;

    worksheet.mergeCells(`A${footerRowIndex}:J${footerRowIndex}`);
    const labelCell = footerRow.getCell(1);
    labelCell.value = `الإجمالي الكلي (${activeEmployees.length} موظف):`;
    labelCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    labelCell.alignment = { vertical: 'middle', horizontal: 'right' };

    for (let c = 1; c <= 10; c++) {
      const cell = footerRow.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF64748B' } },
        bottom: { style: 'double', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    }

    const totalCols = [
      { colIdx: 10, getter: (e: CalculatedEmployee) => e.basicSalary || 0 },
      { colIdx: 11, getter: (e: CalculatedEmployee) => e.fixedAllowances || 0 },
      { colIdx: 12, getter: (e: CalculatedEmployee) => e.totalSalary || 0, color: 'FF3730A3', fill: 'FFE0E7FF' },
      { colIdx: 13, getter: () => null },
      { colIdx: 14, getter: (e: CalculatedEmployee) => e.ticketAllowance || 0, color: 'FFB45309', fill: 'FFFEF3C7' },
      { colIdx: 15, getter: (e: CalculatedEmployee) => e.vacationAllowance || 0, color: 'FF3730A3', fill: 'FFE0E7FF' },
      { colIdx: 16, getter: (e: CalculatedEmployee) => e.endOfServiceAllowance || 0, color: 'FFBE123C', fill: 'FFFFE4E6' },
      { colIdx: 17, getter: (e: CalculatedEmployee) => e.paidEndOfService || 0, color: 'FF64748B' },
      { colIdx: 18, getter: (e: CalculatedEmployee) => e.dueEndOfService || 0, color: 'FF047857', fill: 'FFD1FAE5' }
    ];

    totalCols.forEach(col => {
      const cell = footerRow.getCell(col.colIdx + 1);
      const sum = col.getter ? activeEmployees.reduce((acc, emp) => acc + (col.getter(emp) || 0), 0) : null;
      
      if (sum !== null) {
        cell.value = sum;
        cell.numFmt = '#,##0.00';
      } else {
        cell.value = '-';
      }

      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: col.color || 'FF1E293B' }
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: col.fill || 'FFF1F5F9' }
      };

      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF64748B' } },
        bottom: { style: 'double', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });
  }

  // Generate Excel File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `مخصصات_نهاية_الخدمة_${branchName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  await saveOrShareFile(blob, fileName);
}
