import { INITIAL_DATA } from './allowances/data';
import { initialEmployees } from './payroll/data/initialEmployees';
const payrollCodes = initialEmployees.map(e => String(e.code).trim());
INITIAL_DATA.forEach(e => {
  const code = String(e.code).trim();
  if (!payrollCodes.includes(code)) {
    console.log(`Code only in Allowances: ${code} - ${e.name}`);
  }
});
