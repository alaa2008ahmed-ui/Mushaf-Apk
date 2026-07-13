const fs = require('fs');
let code = fs.readFileSync('payroll/components/ArchivePage.tsx', 'utf8');

const importTarget = `import { formatCurrency } from '../utils/calculations';`;
const importReplacement = `import { formatCurrency, calculateGrandTotals } from '../utils/calculations';`;
code = code.replace(importTarget, importReplacement);

const mapTarget = `          {sortedArchives.map((archive) => {
            const net = archive.totals?.netSalary || 0;
            const ent = archive.totals?.totalEntitlements || 0;
            const ded = archive.totals?.totalDeductions || 0;`;

const mapReplacement = `          {sortedArchives.map((archive) => {
            // Recalculate totals based on the active payroll phase
            const currentTotals = calculateGrandTotals(archive.employees, payrollPhase);
            const net = currentTotals.netSalary || 0;
            const ent = currentTotals.totalEntitlements || 0;
            const ded = currentTotals.totalDeductions || 0;`;

code = code.replace(mapTarget, mapReplacement);

fs.writeFileSync('payroll/components/ArchivePage.tsx', code);
console.log('Patched ArchivePage successfully');
