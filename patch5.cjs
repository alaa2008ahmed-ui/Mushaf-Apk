const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

code = code.replace(/try \{\s*await dualStorage\.save\(COLLECTIONS\.RECORDS, newData\.id, \{\s*type: 'timesheet_drivers_tankers',\s*data: newData\s*\}\);\s*\} catch \(error\) \{\s*console\.error\("Error saving data:", error\);\s*\}/g,
`dualStorage.save(COLLECTIONS.RECORDS, newData.id, {
            type: 'timesheet_drivers_tankers',
            data: newData
        }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(error => {
            console.error("Error saving data:", error);
        });`);

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
