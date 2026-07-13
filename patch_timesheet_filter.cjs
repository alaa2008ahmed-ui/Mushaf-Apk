const fs = require('fs');
let code = fs.readFileSync('components/TimeSheet.tsx', 'utf8');

// 1. Add filteredEmployees useMemo
const sortedEmployeesStr = `    }, [employees]);`;
const filteredEmployeesStr = `    }, [employees]);

    const filteredEmployeesList = React.useMemo(() => {
        return sortedEmployees
            .filter(emp => employeeFilter === 'all' ? true : employeeFilter === 'active' ? emp.isActive !== false : emp.isActive === false)
            .filter(emp => !searchQuery || emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || (emp.englishName && emp.englishName.toLowerCase().includes(searchQuery.toLowerCase())));
    }, [sortedEmployees, employeeFilter, searchQuery]);`;

code = code.replace(sortedEmployeesStr, filteredEmployeesStr);

// 2. Update Employees List (count)
const countTargetStr = `<h2 className="text-xl font-bold text-gray-900">Employees List ({employees.filter(emp => emp.isActive !== false).length})</h2>`;
const countReplacementStr = `<h2 className="text-xl font-bold text-gray-900">Employees List ({filteredEmployeesList.length})</h2>`;

code = code.replace(countTargetStr, countReplacementStr);

// 3. Update the map over sortedEmployees to use filteredEmployeesList
const tbodyTargetStr = `{sortedEmployees
                                        .filter(emp => employeeFilter === 'all' ? true : employeeFilter === 'active' ? emp.isActive !== false : emp.isActive === false)
                                        .filter(emp => !searchQuery || emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || (emp.englishName && emp.englishName.toLowerCase().includes(searchQuery.toLowerCase())))
                                        .map((emp, idx) => (`;

const tbodyReplacementStr = `{filteredEmployeesList
                                        .map((emp, idx) => (`;

code = code.replace(tbodyTargetStr, tbodyReplacementStr);

fs.writeFileSync('components/TimeSheet.tsx', code);
console.log('Patched TimeSheet successfully');
