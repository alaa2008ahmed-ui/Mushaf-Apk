const fs = require('fs');
let code = fs.readFileSync('components/TimeSheet.tsx', 'utf8');

// 1. Move the DRIVERS tab and change the text
const driversTabRegex = /\{\(!currentUser \|\| currentUser\.username\.toLowerCase\(\) === 'alaa' \|\| currentUser\.permissions\?\.tsCanViewDriversTankers === true\) && \(\s*<button\s*onClick=\{([^}]+)\}\s*className=\{`([^`]+)`\}\s*>\s*DRIVERS \(TANKERS\)\s*<\/button>\s*\)\}/;

const overtime1TabRegex = /\{\(!currentUser \|\| currentUser\.username\.toLowerCase\(\) === 'alaa' \|\| currentUser\.permissions\?\.tsCanViewOvertime1 === true\) && \(\s*<button\s*onClick=\{([^}]+)\}\s*className=\{`([^`]+)`\}\s*>\s*Overtime 1\s*<\/button>\s*\)\}/;

const driversTabMatch = code.match(driversTabRegex);
const overtime1TabMatch = code.match(overtime1TabRegex);

if (driversTabMatch && overtime1TabMatch) {
    // Replace the DRIVERS tab with empty string
    code = code.replace(driversTabMatch[0], '');
    
    // Replace the Overtime 1 tab with Overtime 1 tab + Drivers tab (with "Drivers" text)
    const newDriversTabStr = `{(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewDriversTankers === true) && (
                    <button
                        onClick={${driversTabMatch[1]}}
                        className={\`${driversTabMatch[2]}\`}
                    >
                        Drivers
                    </button>
                )}`;
                
    code = code.replace(overtime1TabMatch[0], `${overtime1TabMatch[0]}\n                ${newDriversTabStr}`);
} else {
    console.error("Could not find the tab definitions.");
}

// 2. Change the title passed to TimeSheetDriversTankers
code = code.replace(/title="DRIVERS \(TANKERS\)"/g, 'title="Drivers"');

fs.writeFileSync('components/TimeSheet.tsx', code);
console.log("Patched tabs successfully.");
