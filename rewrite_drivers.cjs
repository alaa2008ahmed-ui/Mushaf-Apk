const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

// Replace the activeEmployees useMemo
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

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
