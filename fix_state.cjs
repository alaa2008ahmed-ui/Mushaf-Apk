const fs = require('fs');
let code = fs.readFileSync('payroll/PayrollApp.tsx', 'utf8');

const regex = /if \(finalMigrated\.length > 0\) \{[\s\S]*?\}, \[\]\);/m;

const replacement = `return finalMigrated;
      } catch (err) {
        console.error('Error parsing employees', err);
      }
    }
    return initialEmployees;
  });

  const [archives, setArchives] = useState<any[]>(() => {
    const saved = localStorage.getItem('payroll_archives');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7);
  });
  
  const [viewMode, setViewMode] = useState<string>('table');
  
  const [signatures, setSignatures] = useState<any>(() => {
    const saved = localStorage.getItem('payroll_signatures');
    return saved ? JSON.parse(saved) : {
      preparedBy: "",
      accountsManager: "علاء أحمد عنتر المرشدي",
      deputyGeneralManager: "محمد أحمد محمد البدري",
      managingDirector: "نايف محمد عبدالله الخضره"
    };
  });
  
  const [activePayrollPhase, setActivePayrollPhase] = useState<'initial' | 'final'>('initial');
  
  const [sheetTitle, setSheetTitle] = useState(() => {
    const saved = localStorage.getItem('payroll_sheetTitle');
    return saved || 'كشف رواتب الموظفين';
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null);
  
  const archivedMonthData = useMemo(() => {
    return archives.find(arc => arc.monthIso === selectedMonth);
  }, [archives, selectedMonth]);`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('payroll/PayrollApp.tsx', code);
    console.log("Fixed state!");
} else {
    console.log("Regex didn't match.");
}
