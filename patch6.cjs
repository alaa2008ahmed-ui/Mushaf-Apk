const fs = require('fs');
let code = fs.readFileSync('payroll/PayrollApp.tsx', 'utf8');

const target = `
        setEmployees((prev) => {
          const res = updateEmps(prev);
          return res.changed ? res.emps : prev;
        });
      } catch (err) {
`;

const replacement = `
        setEmployees((prev) => {
          const res = updateEmps(prev);
          return res.changed ? res.emps : prev;
        });

        setArchives((prev) => {
          let arcsChanged = false;
          const newArcs = prev.map((arc) => {
            if (arc.monthIso === currentMonth) {
              const res = updateEmps(arc.employees);
              if (res.changed) {
                arcsChanged = true;
                return { ...arc, employees: res.emps };
              }
            }
            return arc;
          });
          return arcsChanged ? newArcs : prev;
        });
      } catch (err) {
`;

if (code.includes(target)) {
  fs.writeFileSync('payroll/PayrollApp.tsx', code.replace(target, replacement));
  console.log('Reverted successfully');
} else {
  console.log('Target not found');
}
