import { initialEmployees as payrollEmployees } from './payroll/data/initialEmployees';
import { INITIAL_DATA as overtimeEmployees } from './allowances/data';

const payrollCodes = payrollEmployees.map(e => e.code.trim());
const overtimeCodes = overtimeEmployees.map(e => e.code.trim());

console.log('Payroll count:', payrollCodes.length);
console.log('Overtime count:', overtimeCodes.length);

console.log('\nCodes in Overtime but not in Payroll:');
overtimeEmployees.forEach(e => {
  if (!payrollCodes.includes(e.code.trim())) {
    console.log(`${e.code.trim()} - ${e.name}`);
  }
});

console.log('\nCodes in Payroll but not in Overtime:');
payrollEmployees.forEach(e => {
  if (!overtimeCodes.includes(e.code.trim())) {
    console.log(`${e.code.trim()} - ${e.name}`);
  }
});
