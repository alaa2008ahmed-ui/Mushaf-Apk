const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

code = code.replace(
    "// 1. Write NAME column with diagonal border (A4:A5)",
    `// 0. Write # column (A4:A5)
        const cell4Num = sheet.getCell(4, 1);
        cell4Num.value = '#';
        cell4Num.fill = whiteFill;
        cell4Num.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
        cell4Num.alignment = { horizontal: 'center', vertical: 'middle' };
        cell4Num.border = borderStyle as any;
        const cell5Num = sheet.getCell(5, 1);
        cell5Num.fill = whiteFill;
        cell5Num.border = borderStyle as any;
        sheet.mergeCells(4, 1, 5, 1);

        // 1. Write NAME column with diagonal border (B4:B5)`
);

code = code.replace(
    "const cell4Name = sheet.getCell(4, 1);",
    "const cell4Name = sheet.getCell(4, 2);"
);

code = code.replace(
    "const cell5Name = sheet.getCell(5, 1);",
    "const cell5Name = sheet.getCell(5, 2);"
);

code = code.replace(
    "sheet.mergeCells(4, 1, 5, 1);",
    "sheet.mergeCells(4, 2, 5, 2);"
);

code = code.replace(
    "const colIdx = idx + 2; // Start from Column B",
    "const colIdx = idx + 3; // Start from Column C"
);

// We need to do this carefully for daysArray31
code = code.replace(
    /const colIdx = 6 \+ day;/g,
    "const colIdx = 7 + day;"
);

// Also need to update row1Values, row2Values, row3Values in Excel output.
code = code.replace(
    "const row1Values: any[] = [",
    "const row1Values: any[] = [\n                    activeEmployees.indexOf(emp) + 1,"
);

code = code.replace(
    "const row2Values: any[] = [",
    "const row2Values: any[] = [\n                    '',"
);

code = code.replace(
    "const row3Values: any[] = [",
    "const row3Values: any[] = [\n                    '',"
);

code = code.replace(
    "const rowValues: any[] = [",
    "const rowValues: any[] = [\n                    activeEmployees.indexOf(emp) + 1,"
);

code = code.replace(
    "sheet.mergeCells(currentRow - 3, 1, currentRow - 1, 1);",
    "sheet.mergeCells(currentRow - 3, 2, currentRow - 1, 2);\n                sheet.mergeCells(currentRow - 3, 1, currentRow - 1, 1);" // Merge the # column too
);

code = code.replace(
    "emp.englishName || emp.name",
    "toTitleCase(emp.englishName || emp.name)"
);

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
