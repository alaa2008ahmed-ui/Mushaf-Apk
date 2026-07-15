const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

// Fix row1Values
code = code.replace(
    /if \(cIdx === 0\) \{\n\s*cell\.font = \{ bold: true, size: 10 \};\n\s*cell\.alignment = \{ horizontal: 'left', vertical: 'middle' \};\n\s*\}/g,
    `if (cIdx === 0) {
                        cell.font = { bold: true, size: 10 };
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                    if (cIdx === 1) {
                        cell.font = { bold: true, size: 10 };
                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    }`
);

// Fix rowValues (for non-drivers)
code = code.replace(
    /activeEmployees.indexOf\(emp\) \+ 1,\n\s*emp\.englishName \|\| emp\.name,/g,
    `activeEmployees.indexOf(emp) + 1,
                    toTitleCase(emp.englishName || emp.name),`
);

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
