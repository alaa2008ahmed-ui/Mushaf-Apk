import { INITIAL_DATA } from './allowances/data';
import { initialEmployees } from './payroll/data/initialEmployees';
const payrollCodes = initialEmployees.map(e => String(e.code).trim());
let matchCount = 0;
INITIAL_DATA.forEach(e => {
  if (payrollCodes.includes(String(e.code).trim())) {
    matchCount++;
  }
});
console.log("Matches:", matchCount);
