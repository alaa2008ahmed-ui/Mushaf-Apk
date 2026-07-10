const fs = require('fs');
let code = fs.readFileSync('payroll/PayrollApp.tsx', 'utf8');

const regexBonus = /const getEmployeeBonus = \(empId: string, grid: any\) => \{[\s\S]*?return maxBonus;\n          \} else \{[\s\S]*?return dData && dData\.bonus \? parseFloat\(String\(dData\.bonus\)\.replace\(\/,\/g, ''\)\.trim\(\)\) \|\| 0 : 0;\n        \};\n/;

const replaceBonus = `const getEmployeeBonus = (empId: string, grid: any) => {
          if (!grid || !grid.employeesData) return 0;
            
          let dData = grid.employeesData[empId];
          const targetTsEmp = tsEmployees.find((e: any) => e.id === empId);
            
          if ((!dData || !dData.bonus) && targetTsEmp) {
            const targetNormAr = normalizeArabicName(targetTsEmp.name);
            for (const key of Object.keys(grid.employeesData)) {
              const otherTsEmp = tsEmployees.find((e: any) => e.id === key);
              if (otherTsEmp && normalizeArabicName(otherTsEmp.name) === targetNormAr) {
                dData = grid.employeesData[key];
                break;
              }
            }
          }
            
          return dData && dData.bonus ? parseFloat(String(dData.bonus).replace(/,/g, '').trim()) || 0 : 0;
        };\n`;

if (regexBonus.test(code)) {
    code = code.replace(regexBonus, replaceBonus);
    fs.writeFileSync('payroll/PayrollApp.tsx', code);
    console.log("Patched successfully!");
} else {
    console.log("Regex didn't match.");
}
