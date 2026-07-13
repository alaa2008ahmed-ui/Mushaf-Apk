import { initialEmployees } from './payroll/data/initialEmployees';
import * as fs from 'fs';

const tsNames = fs.readFileSync('ts_names.txt', 'utf-8').split('\n').filter(Boolean);
const tsNorm = tsNames.map(n => n.trim().toLowerCase().replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' '));

const prNorm = initialEmployees.map(e => e.name.trim().toLowerCase().replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' '));

console.log("In TimeSheet but not in Payroll:");
tsNames.forEach((name, i) => {
  if (!prNorm.includes(tsNorm[i])) {
    console.log(name);
  }
});

console.log("\nIn Payroll but not in TimeSheet:");
initialEmployees.forEach(e => {
  const norm = e.name.trim().toLowerCase().replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ');
  if (!tsNorm.includes(norm)) {
    console.log(e.name);
  }
});
