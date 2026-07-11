const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

code = code.replace(/const q = query\([\s\S]*?where\('type', '==', \`timesheet_drivers_tankers\`\),[\s\S]*?where\('data.month', '==', monthKey\)[\s\S]*?\);/g, 
`const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', 'timesheet_drivers_tankers')
        );`);

code = code.replace(/const unsubscribe = onSnapshot\(q, \(snapshot\) => \{[\s\S]*?if \(!snapshot\.empty\) \{[\s\S]*?const doc = snapshot\.docs\[0\];[\s\S]*?setGridData\(\{ \.\.\.doc\.data\(\)\.data, id: doc\.id \}\);[\s\S]*?\} else \{[\s\S]*?setGridData\(null\);[\s\S]*?\}[\s\S]*?setIsLoading\(false\);[\s\S]*?\}, \(error\) => \{/g, 
`const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const loadedDocs = snapshot.docs.map(doc => ({ ...doc.data().data, _docId: doc.id })).filter((d: any) => d.month === monthKey);
                if (loadedDocs.length > 0) {
                    const docData = loadedDocs[0];
                    setGridData({ ...docData, id: docData._docId });
                } else {
                    setGridData(null);
                }
            } else {
                setGridData(null);
            }
            setIsLoading(false);
        }, (error) => {`);

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
