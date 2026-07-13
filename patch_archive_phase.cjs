const fs = require('fs');
let code = fs.readFileSync('payroll/components/ArchivePage.tsx', 'utf8');

const mapTarget = `            const currentTotals = calculateGrandTotals(archive.employees, payrollPhase);`;
const mapReplacement = `            const currentTotals = calculateGrandTotals(archive.employees, payrollPhase as 'full' | 'phase1' | 'phase2');`;

code = code.replace(mapTarget, mapReplacement);

fs.writeFileSync('payroll/components/ArchivePage.tsx', code);
console.log('Patched phase successfully');
