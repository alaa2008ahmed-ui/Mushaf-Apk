const fs = require('fs');
let code = fs.readFileSync('components/ListOvertime.tsx', 'utf8');

code = code.replace(/setArchiveTab\(\(archive\.overtime1 && canViewO1\) \? 'overtime1' : 'overtime2'\);/g, `setArchiveTab((archive.overtime1 && canViewO1) ? 'overtime1' : 'overtime2');`); // keep this if needed, wait, ListOvertime viewer only supports O1 and O2 grid format. The Drivers grid format is completely different!

// Let me just check what format ListOvertime expects.
