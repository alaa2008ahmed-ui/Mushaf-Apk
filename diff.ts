import { INITIAL_DATA } from './allowances/data';
import { initialEmployees } from './payroll/data/initialEmployees';

const payrollNames = initialEmployees.map(e => e.name.trim().toLowerCase().replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' '));
const payrollCodes = initialEmployees.map(e => String(e.code).trim());

INITIAL_DATA.forEach(e => {
  const normName = e.name.trim().toLowerCase().replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ');
  const code = String(e.code).trim();
  if (!payrollCodes.includes(code) && !payrollNames.includes(normName)) {
    console.log(`Extra in Allowances - Code: ${code}, Name: ${e.name}, Active: ${e.isActive !== false}`);
  }
});
