const fs = require('fs');
let code = fs.readFileSync('components/TimeSheet.tsx', 'utf8');

// The permissions text
code = code.replace(/View Drivers \(Tankers\) Tab/g, 'View Drivers Tab');
code = code.replace(/Show in Drivers \(Tankers\)/g, 'Show in Drivers');
code = code.replace(/title="Drivers \(Tankers\)"/g, 'title="Drivers"');

fs.writeFileSync('components/TimeSheet.tsx', code);
console.log("Patched text successfully");
