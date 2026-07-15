const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

// For non-driver rowValues
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

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
