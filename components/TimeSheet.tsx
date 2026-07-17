import React, { useState, useEffect } from 'react';
import { TimeSheetEmployee, Driver, DriverWorkLog, User } from '../types';
import TimeSheetReport from './TimeSheetReport';
import TimeSheetDriversTankers from './TimeSheetDriversTankers';
import ListOvertime from './ListOvertime';
import { initialEmployees } from '../payroll/data/initialEmployees';

interface Props {
    drivers: Driver[];
    workLogs: DriverWorkLog[];
    selectedBranchId?: string;
    users?: User[];
    currentUser?: User;
    onUpdateUser?: (id: string, user: User) => void;
    isMobile?: boolean;
}

const normalizeArabicName = (name: string) => {
    if (!name) return '';
    let n = name
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, '')
        .trim();
    const aliases: Record<string, string> = {
        'جيميهاوقرفايو': 'جيميهاوقرقايو',
        'سنتاجكاتوراياداف': 'سنتراجكاتوراياداف',
        'جومبرجاراسيا': 'جوميرجاراسيا',
        'ماجومادارسويكوت': 'ماجومادارسوبكوت',
        'نعمانكبيرحسين': 'نعمانحسين'
    };
    return aliases[n] || n;
};

export default function TimeSheet({ drivers, workLogs, selectedBranchId, users = [], currentUser, onUpdateUser, isMobile }: Props) {
    const [activeTab, setActiveTab] = useState<'drivers_tankers' | 'overtime1' | 'overtime2' | 'list_overtime'>('overtime1');
    const isSuperAdmin = currentUser?.username?.toLowerCase() === 'alaa';

    // Ensure activeTab is always one of the permitted tabs
    useEffect(() => {
        if (currentUser) {
            const perms = currentUser.permissions;
            const allowedTabs: ('drivers_tankers' | 'overtime1' | 'overtime2' | 'list_overtime')[] = [];
            if (isSuperAdmin || perms?.tsCanViewOvertime1 === true) allowedTabs.push('overtime1');
            if (isSuperAdmin || perms?.tsCanViewDriversTankers === true) allowedTabs.push('drivers_tankers');
            if (isSuperAdmin || perms?.tsCanViewOvertime2 === true) allowedTabs.push('overtime2');
            if (isSuperAdmin || perms?.tsCanViewListOvertime === true) allowedTabs.push('list_overtime');
            
            if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
                setActiveTab(allowedTabs[0]);
            }
        }
    }, [currentUser, activeTab, isSuperAdmin]);

    // Dynamic names language state for OT tabs ('ar' or 'en')
    const [namesLanguage, setNamesLanguage] = useState<'ar' | 'en'>(() => {
        const username = currentUser?.username || 'default';
        return (localStorage.getItem(`timesheet_names_language_${username}`) as 'ar' | 'en') || 
               (localStorage.getItem('timesheet_names_language') as 'ar' | 'en') || 'en';
    });

    // Sync state when currentUser is loaded or switched
    useEffect(() => {
        const username = currentUser?.username || 'default';
        const savedLang = localStorage.getItem(`timesheet_names_language_${username}`) as 'ar' | 'en';
        if (savedLang) {
            setNamesLanguage(savedLang);
        } else {
            const fallbackLang = (localStorage.getItem('timesheet_names_language') as 'ar' | 'en') || 'en';
            setNamesLanguage(fallbackLang);
        }
    }, [currentUser?.username]);

    const toggleNamesLanguage = (lang: 'ar' | 'en') => {
        setNamesLanguage(lang);
        const username = currentUser?.username || 'default';
        localStorage.setItem(`timesheet_names_language_${username}`, lang);
        localStorage.setItem('timesheet_names_language', lang);
    };

    const sortedEmployees = React.useMemo(() => {
        let payrollEmps: any[] = [];
        const saved = localStorage.getItem('payroll_employees_2026');
        if (saved) {
            try {
                payrollEmps = JSON.parse(saved) || [];
            } catch (e) {
                console.error(e);
            }
        }
        if (!payrollEmps || payrollEmps.length === 0) {
            payrollEmps = initialEmployees;
        }

        const branchOrder = [
            'الادارة',
            'المركز الرئيسي',
            'فرع الدمام',
            'فرع الاحساء',
            'فرع المعباه'
        ];

        return [...payrollEmps].sort((a, b) => {
            const idxA = a.branch ? branchOrder.indexOf(a.branch.trim()) : -1;
            const idxB = b.branch ? branchOrder.indexOf(b.branch.trim()) : -1;
            const valA = idxA !== -1 ? idxA : 999;
            const valB = idxB !== -1 ? idxB : 999;
            return valA - valB;
        }).map((emp: any, index: number) => ({
            id: emp.id?.toString() || `ts-emp-${index}`,
            serialNumber: index + 1,
            name: emp.name || '',
            englishName: emp.nameEn || '',
            jobTitle: emp.jobTitle || '',
            englishJobTitle: emp.englishJobTitle || '',
            isActive: emp.isActive !== false,
            showInOvertime1: emp.showInOvertime1 !== false,
            showInOvertime2: emp.showInOvertime2 !== false,
            showInDriversTab: emp.showInDriversTab || false,
            code: emp.code,
            branch: emp.branch || '',
            transferDate: emp.transferDate || ''
        })) as TimeSheetEmployee[];
    }, []);

    // Control visibility of global footer on second, third, and fourth tabs
    useEffect(() => {
        const footer = document.querySelector('.global-app-footer');
        if (footer) {
            if (activeTab === 'drivers_tankers' || activeTab === 'overtime1' || activeTab === 'overtime2' || activeTab === 'list_overtime') {
                footer.classList.add('hidden');
            } else {
                footer.classList.remove('hidden');
            }
        }
        return () => {
            const f = document.querySelector('.global-app-footer');
            if (f) {
                f.classList.remove('hidden');
            }
        };
    }, [activeTab]);

    return (
        <div className="w-full space-y-3 py-4 print:py-0 print:m-0 print:p-0 px-[0.5cm]">
            <div className={`px-2 print:hidden sticky bg-white z-40 py-3 border-b border-gray-200 shadow-sm ${isMobile ? 'top-0' : 'top-[160px]'}`}>
                {/* Tabs */}
                <div className="flex space-x-3 overflow-x-auto pb-1 items-center">
                    {(isSuperAdmin || currentUser?.permissions?.tsCanViewOvertime1 === true) && (
                        <button
                            onClick={() => setActiveTab('overtime1')}
                            className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                                activeTab === 'overtime1'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Overtime 1
                        </button>
                    )}
                    {(isSuperAdmin || currentUser?.permissions?.tsCanViewDriversTankers === true) && (
                        <button
                            onClick={() => setActiveTab('drivers_tankers')}
                            className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                                activeTab === 'drivers_tankers'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Drivers
                        </button>
                    )}
                    {(isSuperAdmin || currentUser?.permissions?.tsCanViewOvertime2 === true) && (
                        <button
                            onClick={() => setActiveTab('overtime2')}
                            className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                                activeTab === 'overtime2'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Overtime 2
                        </button>
                    )}
                    {(isSuperAdmin || currentUser?.permissions?.tsCanViewListOvertime === true) && (
                        <button
                            onClick={() => setActiveTab('list_overtime')}
                            className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                                activeTab === 'list_overtime'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            List Overtime
                        </button>
                    )}

                    {(activeTab === 'overtime1' || activeTab === 'overtime2') && (
                        <div className="flex bg-gray-100 rounded-md p-1 ml-auto shrink-0">
                            <button
                                onClick={() => toggleNamesLanguage('en')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    namesLanguage === 'en'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => toggleNamesLanguage('ar')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    namesLanguage === 'ar'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                AR
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow print:shadow-none print:m-0 print:p-0">
                {activeTab === 'drivers_tankers' && (
                    <div className="block">
                        <TimeSheetDriversTankers 
                            employees={sortedEmployees}
                            title="Drivers"
                            namesLanguage={namesLanguage}
                            currentUser={currentUser}
                        />
                    </div>
                )}

                {activeTab === 'overtime1' && (
                    <div className="block">
                        <TimeSheetReport 
                            employees={sortedEmployees.filter(emp => emp.isActive !== false && emp.showInOvertime1 !== false).map(emp => ({
                                ...emp,
                                name: namesLanguage === 'en' && emp.englishName ? emp.englishName : emp.name,
                                jobTitle: namesLanguage === 'en' && emp.englishJobTitle ? emp.englishJobTitle : emp.jobTitle
                            }))} 
                            title="Overtime" 
                            typeKey="overtime1" 
                            namesLanguage={namesLanguage}
                            currentUser={currentUser}
                        />
                    </div>
                )}

                {activeTab === 'overtime2' && (
                    <div className="block">
                        <TimeSheetReport 
                            employees={sortedEmployees.filter(emp => emp.isActive !== false && emp.showInOvertime2 !== false).map(emp => ({
                                ...emp,
                                name: namesLanguage === 'en' && emp.englishName ? emp.englishName : emp.name,
                                jobTitle: namesLanguage === 'en' && emp.englishJobTitle ? emp.englishJobTitle : emp.jobTitle
                            }))} 
                            title="Overtime" 
                            typeKey="overtime2" 
                            namesLanguage={namesLanguage}
                            currentUser={currentUser}
                        />
                    </div>
                )}

                {activeTab === 'list_overtime' && (
                    <div className="block">
                        <ListOvertime currentUser={currentUser} />
                    </div>
                )}
            </div>
        </div>
    );
}
