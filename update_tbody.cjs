const fs = require('fs');
let code = fs.readFileSync('components/TimeSheetDriversTankers.tsx', 'utf8');

const regex = /\{activeEmployees\.map\(\(emp\) => \{[\s\S]*?<\/React\.Fragment>\s*\);\s*\}\)\}/;

const replacement = `{activeEmployees.map((emp) => {
                                const eData = gridData?.employeesData[emp.id] || { capacity: '', totalTrips: '', tripsOnDuty: '', tripsOT: '', overtime: '', days: {} };
                                const isDriver = (emp.jobTitle || '').includes('سائق شاحنه') || (emp.jobTitle || '').includes('سائق');
                                const borderBottom = isDriver ? '1px dashed #9ca3af' : '2px solid #000';
                                const rowSpan = isDriver ? 3 : 1;

                                return (
                                    <React.Fragment key={emp.id}>
                                        <tr>
                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-2 font-bold text-red-600 uppercase text-left align-middle bg-white" rowSpan={rowSpan}>
                                                {emp.englishName || emp.name}
                                            </td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                {isDriver && (
                                                    <input
                                                        type="text"
                                                        data-row={activeEmployees.indexOf(emp) * 3}
                                                        data-col={0}
                                                        onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, 0)}
                                                        readOnly={isArchived}
                                                        value={eData.capacity}
                                                        onChange={(e) => handleDataChange(emp.id, 'capacity', e.target.value)}
                                                        className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                    />
                                                )}
                                            </td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px solid #000' }} className="p-0 text-center relative font-bold text-red-600 h-6 bg-white">
                                                <input
                                                    type="text"
                                                    value={eData.overtime}
                                                    readOnly
                                                    className="w-full h-full text-center outline-none bg-transparent font-bold text-red-600 text-[12px]"
                                                />
                                            </td>
                                            {daysArray.map(day => (
                                                <td key={\`d1-\${day}\`} style={{ borderBottom: borderBottom, borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                    {day <= daysInMonth && (
                                                        <input
                                                            type="text"
                                                            value={eData.days[\`\${day}_1\`] || ''}
                                                            data-row={activeEmployees.indexOf(emp) * 3}
                                                            data-col={day + 4}
                                                            onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, day + 4)}
                                                            readOnly={isArchived}
                                                            onChange={(e) => handleDataChange(emp.id, \`\${day}_1\`, e.target.value)}
                                                            className={\`w-full h-full text-center outline-none bg-transparent text-[12px] font-bold \${isWeekend(getDayName(day)) ? 'text-red-600' : ''}\`}
                                                        />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                        {isDriver && (
                                            <>
                                                <tr>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.totalTrips}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.tripsOT}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px solid #000' }} className="p-0 bg-white h-6"></td>
                                                    {daysArray.map(day => (
                                                        <td key={\`d2-\${day}\`} style={{ borderBottom: '1px dashed #9ca3af', borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                            {day <= daysInMonth && (
                                                                <input
                                                                    type="text"
                                                                    value={eData.days[\`\${day}_2\`] || ''}
                                                                    data-row={activeEmployees.indexOf(emp) * 3 + 1}
                                                                    data-col={day + 4}
                                                                    onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 1, day + 4)}
                                                                    readOnly={isArchived}
                                                                    onChange={(e) => handleDataChange(emp.id, \`\${day}_2\`, e.target.value)}
                                                                    className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold text-gray-800"
                                                                />
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.tripsOnDuty}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-0 bg-white h-6"></td>
                                                    {daysArray.map(day => (
                                                        <td key={\`d3-\${day}\`} style={{ borderBottom: '2px solid #000', borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                            {day <= daysInMonth && (
                                                                <input
                                                                    type="text"
                                                                    value={eData.days[\`\${day}_3\`] || ''}
                                                                    data-row={activeEmployees.indexOf(emp) * 3 + 2}
                                                                    data-col={day + 4}
                                                                    onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 2, day + 4)}
                                                                    readOnly={isArchived}
                                                                    onChange={(e) => handleDataChange(emp.id, \`\${day}_3\`, e.target.value)}
                                                                    className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold text-gray-800"
                                                                />
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}`;

code = code.replace(regex, replacement);
fs.writeFileSync('components/TimeSheetDriversTankers.tsx', code);
