const fs = require('fs');
let code = fs.readFileSync('components/ListOvertime.tsx', 'utf8');

code = code.replace(/sourceId2: record.overtimeType === 'overtime2' \? record.id : undefined,\n\s*overtime1: record.overtime1,\n\s*overtime2: record.overtime2,/g, 
`sourceId2: record.overtimeType === 'overtime2' ? record.id : undefined,
                    sourceIdDrivers: record.overtimeType === 'drivers' ? record.id : undefined,
                    overtime1: record.overtime1,
                    overtime2: record.overtime2,
                    drivers: record.drivers,`);

code = code.replace(/if \(record.overtimeType === 'overtime2'\) existing.sourceId2 = record.id;\n\s*if \(record.overtime1\) \{\n\s*existing.overtime1 = record.overtime1;\n\s*\}\n\s*if \(record.overtime2\) \{\n\s*existing.overtime2 = record.overtime2;\n\s*\}/g,
`if (record.overtimeType === 'overtime2') existing.sourceId2 = record.id;
                if (record.overtimeType === 'drivers') existing.sourceIdDrivers = record.id;
                if (record.overtime1) {
                    existing.overtime1 = record.overtime1;
                }
                if (record.overtime2) {
                    existing.overtime2 = record.overtime2;
                }
                if (record.drivers) {
                    existing.drivers = record.drivers;
                }`);

fs.writeFileSync('components/ListOvertime.tsx', code);
