const fs = require('fs');
let code = fs.readFileSync('payroll/PayrollApp.tsx', 'utf8');

const regex = /if \(!ot1Record && !ot2Record\) \{[\s\S]*?if \(tsEmp\) \{/m;

const replacement = `const getEmployeeTotalHours = (empId: string, grid: any) => {
          if (!grid || !grid.employeesData) return 0;
            
          let dData = grid.employeesData[empId];
          const targetTsEmp = tsEmployees.find((e: any) => e.id === empId);
            
          if ((!dData || !dData.days || Object.keys(dData.days).length === 0) && targetTsEmp) {
            const targetNormAr = normalizeArabicName(targetTsEmp.name);
            for (const key of Object.keys(grid.employeesData)) {
              const otherTsEmp = tsEmployees.find((e: any) => e.id === key);
              if (otherTsEmp && normalizeArabicName(otherTsEmp.name) === targetNormAr) {
                dData = grid.employeesData[key];
                break;
              }
            }
          }
            
          if (!dData) return 0;
          let sum = 0;
          for (let i = 1; i <= 31; i++) {
            const val = parseFloat(dData.days[i] || '0');
            if (!isNaN(val)) sum += val;
          }
          return sum;
        };

        const getEmployeeBonus = (empId: string, grid: any) => {
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
        };

        let hasChanges = false;
        setEmployees(prev => {
          const newEmps = prev.map(emp => {
            const tsEmp = tsEmployees.find((t: any) => {
              const normTsAr = normalizeArabicName(t.name);
              const normEmpAr = normalizeArabicName(emp.name);
              if (normTsAr && normEmpAr && normTsAr === normEmpAr) return true;
                
              const normTsEn = normalizeEnglishName(t.englishName || '');
              const normEmpEn = normalizeEnglishName(emp.nameEn || '');
              if (normTsEn && normEmpEn && normTsEn === normEmpEn) return true;
                
              return false;
            });

            let updatedEmp = { ...emp };
            let changedForThisEmp = false;

            if (tsEmp) {`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('payroll/PayrollApp.tsx', code);
    console.log("Fixed!");
} else {
    console.log("Regex didn't match.");
}
