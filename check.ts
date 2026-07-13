import { INITIAL_DATA } from './allowances/data';
import { initialEmployees } from './payroll/data/initialEmployees';

const activeAllowances = INITIAL_DATA.filter(e => e.isActive !== false);
const payrollCodes = initialEmployees.map(e => String(e.code).trim());

activeAllowances.forEach(e => {
  const code = String(e.code).trim();
  if (!payrollCodes.includes(code)) {
    console.log(`Code: ${code}, Name: ${e.name}`);
  }
});
