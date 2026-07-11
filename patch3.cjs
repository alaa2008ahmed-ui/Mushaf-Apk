const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

let rowIndex = 0;

code = code.replace(/<React\.Fragment key={emp\.id}>\s*<tr>\s*(<td[^>]+>[\s\S]*?<\/td>)\s*(<td[^>]+>)\s*<input\s*type="text"\s*value={eData\.capacity}/g, 
`<React.Fragment key={emp.id}>
                                        <tr>
                                            $1
                                            $2
                                                <input
                                                    type="text"
                                                    data-row={activeEmployees.indexOf(emp) * 3}
                                                    data-col={0}
                                                    onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, 0)}
                                                    readOnly={isArchived}
                                                    value={eData.capacity}`);

code = code.replace(/value={eData\.days\[\`\$\{day\}_1\`\] \|\| ''}\s*onChange/g,
`value={eData.days[\`\${day}_1\`] || ''}
                                                            data-row={activeEmployees.indexOf(emp) * 3}
                                                            data-col={day + 4}
                                                            onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, day + 4)}
                                                            readOnly={isArchived}
                                                            onChange`);

code = code.replace(/value={eData\.days\[\`\$\{day\}_2\`\] \|\| ''}\s*onChange/g,
`value={eData.days[\`\${day}_2\`] || ''}
                                                            data-row={activeEmployees.indexOf(emp) * 3 + 1}
                                                            data-col={day + 4}
                                                            onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 1, day + 4)}
                                                            readOnly={isArchived}
                                                            onChange`);

code = code.replace(/value={eData\.days\[\`\$\{day\}_3\`\] \|\| ''}\s*onChange/g,
`value={eData.days[\`\${day}_3\`] || ''}
                                                            data-row={activeEmployees.indexOf(emp) * 3 + 2}
                                                            data-col={day + 4}
                                                            onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 2, day + 4)}
                                                            readOnly={isArchived}
                                                            onChange`);

fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
