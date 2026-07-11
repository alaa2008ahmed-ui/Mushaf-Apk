const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

// Update activeEmployees memo to sort
code = code.replace(/const activeEmployees = useMemo\(\(\) => \{[\s\S]*?return employees\.filter.*?;\s*\}, \[employees\]\);/,
`const activeEmployees = useMemo(() => {
        const filtered = employees.filter(emp => emp.isActive !== false && emp.showInDriversTab === true);
        return filtered.sort((a, b) => {
            const aIsDriver = (a.jobTitle || '').includes('سائق شاحنه') || (a.jobTitle || '').includes('سائق');
            const bIsDriver = (b.jobTitle || '').includes('سائق شاحنه') || (b.jobTitle || '').includes('سائق');
            if (aIsDriver && !bIsDriver) return -1;
            if (!aIsDriver && bIsDriver) return 1;
            return 0;
        });
    }, [employees]);`);

// Update render logic inside tbody
code = code.replace(/\{activeEmployees\.map\(\(emp\) => \{[\s\S]*?const eData = gridData\?\.employeesData\[emp\.id\][\s\S]*?return \([\s\S]*?<React\.Fragment key=\{emp\.id\}>[\s\S]*?<tr>[\s\S]*?<td style=\{\{ borderBottom: '2px solid #000', borderRight: '1px solid #000' \}\} className="p-2 font-bold text-red-600 uppercase text-left align-middle bg-white" rowSpan=\{3\}>[\s\S]*?<\/td>[\s\S]*?<td style=\{\{ borderBottom: '1px dashed #9ca3af'/g,
`{activeEmployees.map((emp) => {
                                const eData = gridData?.employeesData[emp.id] || { capacity: '', totalTrips: '', tripsOnDuty: '', tripsOT: '', overtime: '', days: {} };
                                const isDriver = (emp.jobTitle || '').includes('سائق شاحنه') || (emp.jobTitle || '').includes('سائق');
                                const rowSpan = isDriver ? 3 : 1;
                                const borderBottom = isDriver ? '1px dashed #9ca3af' : '2px solid #000';
                                
                                return (
                                    <React.Fragment key={emp.id}>
                                        <tr>
                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-2 font-bold text-red-600 uppercase text-left align-middle bg-white" rowSpan={rowSpan}>
                                                {emp.englishName || emp.name}
                                            </td>
                                            <td style={{ borderBottom: borderBottom`);

// I need to be more precise about replacing the rest of the rows. 
