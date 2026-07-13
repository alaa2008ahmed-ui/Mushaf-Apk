import { INITIAL_DATA } from './allowances/data';
import { initialEmployees } from './payroll/data/initialEmployees';

const allowancesNames = INITIAL_DATA.map(e => e.name.trim().toLowerCase().replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' '));
const allowancesCodes = INITIAL_DATA.map(e => String(e.code).trim());

initialEmployees.forEach(e => {
  const normName = e.name.trim().toLowerCase().replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ');
  const code = String(e.code).trim();
  if (!allowancesCodes.includes(code) && !allowancesNames.includes(normName)) {
    console.log(`Extra in Payroll - Code: ${code}, Name: ${e.name}`);
  }
});
