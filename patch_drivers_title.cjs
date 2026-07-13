const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

code = code.replace(/title = "DRIVERS \(TANKERS\)"/g, 'title = "Drivers"');
code = code.replace(/<h2 className="text-xl font-bold text-gray-800">DRIVERS \(TANKERS\)<\/h2>/g, '<h2 className="text-xl font-bold text-gray-800">Drivers</h2>');

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
console.log("Patched TimeSheetDriversTankers.tsx successfully.");
