import { initialEmployees } from './payroll/data/initialEmployees';
const ids = initialEmployees.map(e => e.id);
console.log("Missing IDs in Payroll (1-45):");
for(let i=1; i<=45; i++){
  if(!ids.includes(i)) console.log(i);
}
