import React from 'react';
import { 
    MapPin, 
    AlertTriangle, 
    Lock, 
    Users, 
    Calendar, 
    Search, 
    ClipboardList, 
    Bell, 
    LayoutDashboard, 
    CheckSquare, 
    Wallet, 
    FilePlus, 
    FileText, 
    Settings as SettingsIcon, 
    ShieldCheck,
    Truck 
} from 'lucide-react';
import { Branch, User, Customer, Item, AppSettings } from '../types';

interface UserPermissionsModalContentProps {
    tempUser: Partial<User>;
    setTempUser: (u: Partial<User>) => void;
    editUsername: string;
    setEditUsername: (val: string) => void;
    editPassword: string;
    setEditPassword: (val: string) => void;
    saveError: string | null;
    editingUserId: string | null;
    setShowUserModal: (show: boolean) => void;
    handleSaveUser: () => void;
    lang: 'ar' | 'en';
    branches: Branch[];
    customers: Customer[];
    items: Item[];
    currentUser: User | null;
    settings: AppSettings | null;
    customerSearchTerm: string;
    setCustomerSearchTerm: (val: string) => void;
    togglePagePermission: (page: string) => void;
    toggleBranchPermission: (branchId: string) => void;
}

export const UserPermissionsModalContent: React.FC<UserPermissionsModalContentProps> = ({
    tempUser,
    setTempUser,
    editUsername,
    setEditUsername,
    editPassword,
    setEditPassword,
    saveError,
    editingUserId,
    setShowUserModal,
    handleSaveUser,
    lang,
    branches,
    customers,
    items,
    currentUser,
    settings,
    customerSearchTerm,
    setCustomerSearchTerm,
    togglePagePermission,
    toggleBranchPermission
}) => {
    
    const systemPages = [
        {
            name: 'Dashboard',
            labelEn: 'Dashboard',
            labelAr: 'لوحة القيادة',
            colorClass: 'indigo',
            icon: 'LayoutDashboard',
        },
        {
            name: 'Daily Sales',
            labelEn: 'Daily Sales',
            labelAr: 'المبيعات اليومية',
            colorClass: 'blue',
            icon: 'Calendar',
            subPermissions: [
                { key: 'canAddInvoice', labelEn: 'Add Invoices', labelAr: 'إضافة فواتير' },
                { key: 'canEditInvoice', labelEn: 'Edit Invoices', labelAr: 'تعديل فواتير' },
                { key: 'canDeleteInvoice', labelEn: 'Delete Invoices', labelAr: 'حذف فواتير' },
                { key: 'canChangeInvoiceDate', labelEn: 'Change Invoice Date', labelAr: 'تغيير تاريخ الفاتورة' },
            ]
        },
        {
            name: 'Monthly Sales',
            labelEn: 'Monthly Sales',
            labelAr: 'المبيعات الشهرية',
            colorClass: 'blue',
            icon: 'Calendar',
        },
        {
            name: 'Annual Sales',
            labelEn: 'Annual Sales',
            labelAr: 'المبيعات السنوية',
            colorClass: 'blue',
            icon: 'Calendar',
        },
        {
            name: 'Invoices Tracking',
            labelEn: 'Invoices Tracking',
            labelAr: 'تتبع الفواتير',
            colorClass: 'fuchsia',
            icon: 'Search',
        },
        {
            name: 'PO',
            labelEn: 'PO',
            labelAr: 'طلبات الشراء (PO)',
            colorClass: 'fuchsia',
            icon: 'ShoppingCart',
            subPermissions: [
                { key: 'canCreatePO', labelEn: 'Add PO', labelAr: 'إضافة طلب شراء' },
                { key: 'canEditPO', labelEn: 'Edit PO', labelAr: 'تعديل طلب شراء' },
                { key: 'canDeletePO', labelEn: 'Delete PO', labelAr: 'حذف طلب شراء' },
                { key: 'canForceDeletePO', labelEn: 'Force Delete PO', labelAr: 'حذف إجباري لطلب الشراء' },
            ]
        },
        {
            name: 'Driver Work Log',
            labelEn: 'Driver Work Log',
            labelAr: 'سجل عمل السائقين',
            colorClass: 'teal',
            icon: 'Truck',
            subPermissions: [
                { key: 'canEditDriverLog', labelEn: 'Edit Work Log', labelAr: 'تعديل سجل العمل' },
                { key: 'canDeleteDriverLog', labelEn: 'Delete Work Log', labelAr: 'حذف سجل العمل' },
                { key: 'manageDrivers', labelEn: 'Manage Drivers List', labelAr: 'إدارة قائمة السائقين' },
                { key: 'manageVehicles', labelEn: 'Manage Vehicles List', labelAr: 'إدارة قائمة المركبات' },
            ]
        },
        {
            name: 'Drivers Timesheet',
            labelEn: 'Drivers Timesheet',
            labelAr: 'مخطط وقت السائقين',
            colorClass: 'teal',
            icon: 'Clock',
        },
        {
            name: 'Customers',
            labelEn: 'Customers',
            labelAr: 'العملاء',
            colorClass: 'teal',
            icon: 'Users',
            subPermissions: [
                { key: 'canAddCustomer', labelEn: 'Add Customer', labelAr: 'إضافة عميل' },
                { key: 'canEditCustomer', labelEn: 'Edit Customer', labelAr: 'تعديل عميل' },
                { key: 'canDeleteCustomer', labelEn: 'Delete Customer', labelAr: 'حذف عميل' },
            ]
        },
        {
            name: 'Time Sheet',
            labelEn: 'Employee Overtime (Time Sheet)',
            labelAr: 'ساعات العمل الإضافي (كشف الوقت)',
            colorClass: 'indigo',
            icon: 'Calendar',
            subPermissions: [
                { key: 'tsCanViewEmployees', labelEn: 'Employees', labelAr: 'الموظفين' },
                { key: 'tsCanViewOvertime1', labelEn: 'Overtime 1', labelAr: 'الإضافي 1' },
                { key: 'tsCanViewDriversTankers', labelEn: 'Drivers', labelAr: 'السائقين' },
                { key: 'tsCanViewOvertime2', labelEn: 'Overtime 2', labelAr: 'الإضافي 2' },
                { key: 'tsCanViewListOvertime', labelEn: 'List Overtime', labelAr: 'كشف الإضافي' },
                { key: 'tsCanAddEmployee', labelEn: 'Add Employee', labelAr: 'إضافة موظف' },
                { key: 'tsCanEditEmployee', labelEn: 'Edit Employee', labelAr: 'تعديل موظف' },
                { key: 'tsCanDeleteEmployee', labelEn: 'Delete Employee', labelAr: 'حذف موظف' },
                { key: 'tsCanUndoPost', labelEn: 'Undo Post', labelAr: 'تراجع عن الترحيل' },
                { key: 'tsCanDeletePost', labelEn: 'Delete Post', labelAr: 'حذف الترحيل' },
                { key: 'tsCanViewArchiveO1', labelEn: 'View Archive Overtime 1', labelAr: 'عرض أرشيف الإضافي 1' },
                { key: 'tsCanViewArchiveO2', labelEn: 'View Archive Overtime 2', labelAr: 'عرض أرشيف الإضافي 2' },
                { key: 'tsCanViewArchiveDrivers', labelEn: 'View Archive Drivers', labelAr: 'عرض أرشيف السائقين' },
            ]
        },
        {
            name: 'Orders',
            labelEn: 'Orders',
            labelAr: 'الطلبات',
            colorClass: 'orange',
            icon: 'ClipboardList',
            isOrdersPage: true,
        },
        {
            name: 'Order Approvals',
            labelEn: 'Order Approvals',
            labelAr: 'موافقات الطلبات',
            colorClass: 'orange',
            icon: 'CheckSquare',
        },
        {
            name: 'Payroll',
            labelEn: 'Payroll',
            labelAr: 'الرواتب',
            colorClass: 'violet',
            icon: 'Wallet',
        },
        {
            name: 'Allowances For Employees',
            labelEn: 'Allowances For Employees',
            labelAr: 'بدلات الموظفين',
            colorClass: 'violet',
            icon: 'FilePlus',
            isSinglePermission: true,
            descEn: 'Enables employee allowances, end of service & vacation management',
            descAr: 'تفعيل بدلات الموظفين ومستحقات نهاية الخدمة وإدارة الإجازات',
        },
        {
            name: 'Account Statement',
            labelEn: 'Account Statement',
            labelAr: 'كشف الحساب',
            colorClass: 'slate',
            icon: 'FileText',
        },
        {
            name: 'Settings',
            labelEn: 'Settings',
            labelAr: 'الإعدادات',
            colorClass: 'slate',
            icon: 'Settings',
            subPermissions: [
                { key: 'canManageSettings', labelEn: 'Can Change System Dates/Backup', labelAr: 'يمكنه تغيير تواريخ النظام والنسخ الاحتياطي' }
            ]
        }
    ];

    const getColorTheme = (color: string) => {
        const themes: Record<string, { border: string, header: string, text: string, bg: string, ring: string }> = {
            indigo: { border: 'border-indigo-100 hover:border-indigo-300', header: 'bg-gradient-to-r from-indigo-600 to-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50/30', ring: 'focus:ring-indigo-500' },
            blue: { border: 'border-blue-100 hover:border-blue-300', header: 'bg-gradient-to-r from-blue-600 to-blue-500', text: 'text-blue-600', bg: 'bg-blue-50/30', ring: 'focus:ring-blue-500' },
            fuchsia: { border: 'border-fuchsia-100 hover:border-fuchsia-300', header: 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-500', text: 'text-fuchsia-600', bg: 'bg-fuchsia-50/30', ring: 'focus:ring-fuchsia-500' },
            teal: { border: 'border-teal-100 hover:border-teal-300', header: 'bg-gradient-to-r from-teal-600 to-teal-500', text: 'text-teal-600', bg: 'bg-teal-50/30', ring: 'focus:ring-teal-500' },
            orange: { border: 'border-orange-100 hover:border-orange-300', header: 'bg-gradient-to-r from-orange-600 to-orange-500', text: 'text-orange-600', bg: 'bg-orange-50/30', ring: 'focus:ring-orange-500' },
            violet: { border: 'border-violet-100 hover:border-violet-300', header: 'bg-gradient-to-r from-violet-600 to-violet-500', text: 'text-violet-600', bg: 'bg-violet-50/30', ring: 'focus:ring-violet-500' },
            slate: { border: 'border-slate-100 hover:border-slate-300', header: 'bg-gradient-to-r from-slate-600 to-slate-500', text: 'text-slate-600', bg: 'bg-slate-50/30', ring: 'focus:ring-slate-500' }
        };
        return themes[color] || themes.blue;
    };

    const renderPageIcon = (iconName: string) => {
        switch (iconName) {
            case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5 text-white" />;
            case 'Calendar': return <Calendar className="w-5 h-5 text-white" />;
            case 'Search': return <Search className="w-5 h-5 text-white" />;
            case 'ShoppingCart': return <Wallet className="w-5 h-5 text-white" />;
            case 'Truck': return <Truck className="w-5 h-5 text-white" />;
            case 'Clock': return <FileText className="w-5 h-5 text-white" />;
            case 'Users': return <Users className="w-5 h-5 text-white" />;
            case 'ClipboardList': return <ClipboardList className="w-5 h-5 text-white" />;
            case 'CheckSquare': return <CheckSquare className="w-5 h-5 text-white" />;
            case 'Wallet': return <Wallet className="w-5 h-5 text-white" />;
            case 'FilePlus': return <FilePlus className="w-5 h-5 text-white" />;
            case 'FileText': return <FileText className="w-5 h-5 text-white" />;
            case 'Settings': return <SettingsIcon className="w-5 h-5 text-white" />;
            default: return <Calendar className="w-5 h-5 text-white" />;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] xl:max-w-7xl my-4 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white rounded-t-xl flex justify-between items-center shadow-md text-left">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" />
                    {editingUserId ? 'Edit User Permissions' : 'Add New User'}
                </h3>
                <button 
                    onClick={() => setShowUserModal(false)}
                    className="text-white hover:text-gray-200 transition-colors text-2xl font-bold focus:outline-none"
                >
                    &times;
                </button>
            </div>
            
            {saveError && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold text-sm text-left">
                    {saveError}
                </div>
            )}

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Credentials & Branches Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 text-left">
                    {/* Left Side: Credentials */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                            </label>
                            <input 
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder={lang === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                            </label>
                            <input 
                                type="text"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                            />
                        </div>
                    </div>

                    {/* Right Side: Branches under each other */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-slate-700">
                                {lang === 'ar' ? 'صلاحيات الفروع' : 'Branch Access'}
                            </span>
                            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                                <input 
                                    type="checkbox"
                                    checked={tempUser.permissions?.allowedBranches?.includes('all') || false}
                                    onChange={() => {
                                        if (!tempUser.permissions) return;
                                        const isAll = tempUser.permissions.allowedBranches.includes('all');
                                        setTempUser({
                                            ...tempUser,
                                            permissions: { 
                                                ...tempUser.permissions, 
                                                allowedBranches: isAll ? [] : ['all'] 
                                            }
                                        });
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded border-white focus:ring-offset-blue-600"
                                />
                                <span>{lang === 'ar' ? 'كل الفروع' : 'All Branches'}</span>
                            </label>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {branches.map(branch => (
                                <label 
                                    key={branch.id} 
                                    className={`flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg border transition-all bg-white ${
                                        tempUser.permissions?.allowedBranches?.includes('all') 
                                            ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200' 
                                            : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'
                                    }`}
                                >
                                    <input 
                                        type="checkbox"
                                        disabled={tempUser.permissions?.allowedBranches?.includes('all') || false}
                                        checked={tempUser.permissions?.allowedBranches?.includes('all') || tempUser.permissions?.allowedBranches?.includes(branch.id) || false}
                                        onChange={() => toggleBranchPermission(branch.id)}
                                        className="w-4 h-4 text-blue-600 rounded disabled:bg-gray-300"
                                    />
                                    <span className={`text-sm font-semibold ${tempUser.permissions?.allowedBranches?.includes('all') ? 'text-gray-400' : 'text-slate-700'}`}>
                                        {branch.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Page Access and Detailed Permissions */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-lg border-b pb-2 flex items-center gap-2 text-left">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Page Access & Detailed Permissions
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {systemPages.filter(page => {
                            const isGloballyDisabled = (settings?.globallyDisabledPages || []).includes(page.name);
                            if (isGloballyDisabled) return false;
                            
                            // Admin restriction: Only show pages the CURRENT user has access to
                            const isAlaaOrAdmin = currentUser?.username.toLowerCase() === 'alaa' || currentUser?.role === 'admin';
                            if (isAlaaOrAdmin) return true;
                            
                            return currentUser?.permissions?.allowedPages.includes(page.name);
                        }).map(page => {
                            const isPageEnabled = tempUser.permissions?.allowedPages.includes(page.name) || false;
                            const theme = getColorTheme(page.colorClass);
                            
                            return (
                                <div key={page.name} className={`bg-white rounded-xl border ${theme.border} shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md`}>
                                    {/* Card Header */}
                                    <div className={`${theme.header} p-3 text-white flex items-center justify-between`}>
                                        <div className="flex items-center gap-2 font-bold text-sm">
                                            {renderPageIcon(page.icon)}
                                            <span className="flex flex-col text-left">
                                                <span className="leading-tight font-semibold text-white">
                                                    {lang === 'ar' ? (page as any).labelAr : (page as any).labelEn}
                                                </span>
                                            </span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => togglePagePermission(page.name)}
                                            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 hover:scale-105 active:scale-95 shadow-inner"
                                            style={{ backgroundColor: isPageEnabled ? '#10b981' : 'rgba(255, 255, 255, 0.2)' }}
                                        >
                                            <span className="sr-only">Toggle page access</span>
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isPageEnabled ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>

                                    {/* Card Body */}
                                    <div className={`p-4 flex-1 flex flex-col justify-between ${isPageEnabled ? '' : 'bg-gray-50/50'}`}>
                                        {page.isOrdersPage ? (
                                            /* Orders Special Handling */
                                            <div className={`space-y-4 text-left ${isPageEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
                                                {/* Allowed Customers Limit */}
                                                <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                                                    <label className="text-xs font-bold text-orange-950 block mb-1">
                                                        Allowed Customers (Limit Access)
                                                    </label>
                                                    <div className="relative mb-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Search customers..."
                                                            value={customerSearchTerm}
                                                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                                            className="w-full text-xs pl-8 pr-2.5 py-1 border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                                        />
                                                        <Search className="absolute left-2.5 top-2 h-3 w-3 text-gray-400" />
                                                    </div>
                                                    <div className="max-h-24 overflow-y-auto border border-orange-100 rounded p-1.5 bg-white flex flex-col gap-1">
                                                        {customers
                                                            .filter(c => c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()))
                                                            .map(c => (
                                                                <label key={c.id} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 hover:text-orange-600">
                                                                    <input
                                                                        type="checkbox"
                                                                        disabled={!isPageEnabled}
                                                                        checked={tempUser.permissions?.allowedOrderCustomers?.includes(c.name) || false}
                                                                        onChange={(e) => {
                                                                            const current = tempUser.permissions?.allowedOrderCustomers || [];
                                                                            const newCustomers = e.target.checked
                                                                                ? [...current, c.name]
                                                                                : current.filter(name => name !== c.name);
                                                                            setTempUser({
                                                                                ...tempUser,
                                                                                permissions: { ...tempUser.permissions!, allowedOrderCustomers: newCustomers }
                                                                            });
                                                                        }}
                                                                        className="w-3 h-3 text-orange-600 rounded"
                                                                    />
                                                                    <span>{c.name}</span>
                                                                </label>
                                                            ))}
                                                    </div>
                                                </div>

                                                {/* Allowed Items Limit */}
                                                <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                                                    <label className="text-xs font-bold text-orange-950 block mb-1">
                                                        Allowed Items (Limit Access)
                                                    </label>
                                                    <div className="max-h-24 overflow-y-auto border border-orange-100 rounded p-1.5 bg-white flex flex-col gap-1">
                                                        {items.map(i => (
                                                            <label key={i.id} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 hover:text-orange-600">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled={!isPageEnabled}
                                                                    checked={tempUser.permissions?.allowedOrderItems?.includes(i.name) || false}
                                                                    onChange={(e) => {
                                                                        const current = tempUser.permissions?.allowedOrderItems || [];
                                                                        const newItems = e.target.checked
                                                                            ? [...current, i.name]
                                                                            : current.filter(name => name !== i.name);
                                                                        setTempUser({
                                                                            ...tempUser,
                                                                            permissions: { ...tempUser.permissions!, allowedOrderItems: newItems }
                                                                        });
                                                                    }}
                                                                    className="w-3 h-3 text-orange-600 rounded"
                                                                />
                                                                <span>{i.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Workflow & Popups */}
                                                <div className="bg-teal-50/40 p-2.5 rounded-lg border border-teal-100 space-y-2">
                                                    <h6 className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                                                        Workflow & Popups
                                                    </h6>
                                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-teal-950">
                                                        <input 
                                                            type="checkbox"
                                                            disabled={!isPageEnabled}
                                                            checked={tempUser.permissions?.showDeliveryConfirmationPopup !== false}
                                                            onChange={(e) => setTempUser({
                                                                ...tempUser,
                                                                permissions: { ...tempUser.permissions!, showDeliveryConfirmationPopup: e.target.checked }
                                                            })}
                                                            className="w-3.5 h-3.5 text-teal-600 rounded"
                                                        />
                                                        <span>Show Delivery Popup</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-teal-950 block">
                                                        <input 
                                                            type="checkbox"
                                                            disabled={!isPageEnabled}
                                                            checked={tempUser.permissions?.showOrderReceiptPopup !== false}
                                                            onChange={(e) => setTempUser({
                                                                ...tempUser,
                                                                permissions: { ...tempUser.permissions!, showOrderReceiptPopup: e.target.checked }
                                                            })}
                                                            className="w-3.5 h-3.5 text-teal-600 rounded"
                                                        />
                                                        <span>Show Receipt Popup</span>
                                                    </label>
                                                    {tempUser.permissions?.showOrderReceiptPopup !== false && (
                                                        <div className="pl-3 border-l border-teal-200 ml-1.5 space-y-1">
                                                            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-teal-850">
                                                                <input 
                                                                    type="checkbox"
                                                                    disabled={!isPageEnabled}
                                                                    checked={tempUser.permissions?.showReceiptDetailsPopup !== false}
                                                                    onChange={(e) => setTempUser({
                                                                        ...tempUser,
                                                                        permissions: { ...tempUser.permissions!, showReceiptDetailsPopup: e.target.checked }
                                                                    })}
                                                                    className="w-3 h-3 text-teal-600 rounded"
                                                                />
                                                                <span>Show Receipt Details</span>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Extra Privileges */}
                                                {currentUser?.username.toLowerCase() === 'alaa' && (
                                                    <div className="bg-orange-50/30 p-2.5 rounded-lg border border-orange-100/50 space-y-2">
                                                        <h6 className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">
                                                            Extra Privileges
                                                        </h6>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                                                                <input 
                                                                    type="checkbox"
                                                                    disabled={!isPageEnabled}
                                                                    checked={tempUser.permissions?.canViewAllOrders || false}
                                                                    onChange={(e) => setTempUser({
                                                                        ...tempUser,
                                                                        permissions: { ...tempUser.permissions!, canViewAllOrders: e.target.checked }
                                                                    })}
                                                                    className="w-3.5 h-3.5 text-orange-600 rounded"
                                                                />
                                                                <span>View All Users' Orders</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                                                                <input 
                                                                    type="checkbox"
                                                                    disabled={!isPageEnabled}
                                                                    checked={tempUser.permissions?.canDeleteOrder || false}
                                                                    onChange={(e) => setTempUser({
                                                                        ...tempUser,
                                                                        permissions: { ...tempUser.permissions!, canDeleteOrder: e.target.checked }
                                                                    })}
                                                                    className="w-3.5 h-3.5 text-orange-600 rounded"
                                                                />
                                                                <span>Delete Orders</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                                                                <input 
                                                                    type="checkbox"
                                                                    disabled={!isPageEnabled}
                                                                    checked={tempUser.permissions?.receiveNewOrderAlert || false}
                                                                    onChange={(e) => setTempUser({
                                                                        ...tempUser,
                                                                        permissions: { ...tempUser.permissions!, receiveNewOrderAlert: e.target.checked }
                                                                    })}
                                                                    className="w-3.5 h-3.5 text-orange-600 rounded"
                                                                />
                                                                <span>Receive Delivery Alerts</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : page.isSinglePermission ? (
                                            /* Single permission page handling */
                                            <div className="text-left py-2 flex-1 flex flex-col justify-between">
                                                <p className="text-xs text-slate-500 italic mb-3">
                                                    {lang === 'ar' ? (page as any).descAr : (page as any).descEn}
                                                </p>
                                                <div className={`text-xs font-bold px-2 py-1.5 rounded-md border text-center ${isPageEnabled ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                    {isPageEnabled 
                                                        ? (lang === 'ar' ? '✓ تفعيل الصلاحية الكاملة' : '✓ FULL ACCESS ACTIVE') 
                                                        : (lang === 'ar' ? '✗ لا توجد صلاحية' : '✗ NO ACCESS')}
                                                </div>
                                            </div>
                                        ) : page.subPermissions && page.subPermissions.length > 0 ? (
                                            /* Subpermissions checklist */
                                            <div className={`space-y-2 text-left ${isPageEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
                                                {page.subPermissions.map(perm => (
                                                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 hover:text-slate-900 transition-colors">
                                                        <input 
                                                            type="checkbox"
                                                            disabled={!isPageEnabled}
                                                            checked={(tempUser.permissions as any)?.[perm.key] || false}
                                                            onChange={(e) => setTempUser({
                                                                ...tempUser,
                                                                permissions: { ...tempUser.permissions!, [perm.key]: e.target.checked }
                                                            })}
                                                            className={`w-3.5 h-3.5 rounded ${theme.text}`}
                                                        />
                                                        <span className="flex flex-col">
                                                            <span className="font-medium">
                                                                {lang === 'ar' ? (perm as any).labelAr : (perm as any).labelEn}
                                                            </span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Simple page with no sub-permissions */
                                            <div className="text-left py-4 flex flex-col justify-center items-center h-full">
                                                <span className="text-xs text-slate-400 font-medium text-center italic">
                                                    {lang === 'ar' ? 'صلاحية كاملة عند التفعيل' : 'Full access upon activation'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System Notifications & Alerts - Full Width Card */}
                <div className="p-4 border rounded-xl bg-purple-50/50 border-purple-200 shadow-sm text-left">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-100">
                        <Bell className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-purple-900 text-base">
                            System Notifications & Alerts
                        </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {/* System Alerts */}
                        <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                            <h6 className="text-xs font-bold text-purple-900 mb-2 pb-1 border-b border-purple-50">
                                System Alerts
                            </h6>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 hover:text-purple-600 transition-colors">
                                <input 
                                    type="checkbox"
                                    checked={tempUser.permissions?.receiveLowPOAlert ?? false}
                                    onChange={(e) => setTempUser({
                                        ...tempUser,
                                        permissions: { ...tempUser.permissions!, receiveLowPOAlert: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-purple-600 rounded"
                                />
                                <span>Receive Low PO Balance Alerts</span>
                            </label>
                        </div>

                        {/* Cash Invoices Alerts */}
                        <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                            <h6 className="text-xs font-bold text-purple-900 mb-2 pb-1 border-b border-purple-50">
                                Cash Invoices
                            </h6>
                            <div className="flex flex-col gap-2">
                                {[
                                    { key: 'notifyAddCashInvoice', label: 'Add Cash Invoice' },
                                    { key: 'notifyEditCashInvoice', label: 'Edit Cash Invoice' },
                                    { key: 'notifyDeleteCashInvoice', label: 'Delete Cash Invoice' },
                                ].map(perm => (
                                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 hover:text-purple-600 transition-colors">
                                        <input 
                                            type="checkbox"
                                            checked={(tempUser.permissions as any)?.[perm.key] ?? true}
                                            onChange={(e) => setTempUser({
                                                ...tempUser,
                                                permissions: { ...tempUser.permissions!, [perm.key]: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-purple-600 rounded"
                                        />
                                        <span>{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Credit Invoices Alerts */}
                        <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                            <h6 className="text-xs font-bold text-purple-900 mb-2 pb-1 border-b border-purple-50">
                                Credit Invoices
                            </h6>
                            <div className="flex flex-col gap-2">
                                {[
                                    { key: 'notifyAddCreditInvoice', label: 'Add Credit Invoice' },
                                    { key: 'notifyEditCreditInvoice', label: 'Edit Credit Invoice' },
                                    { key: 'notifyDeleteCreditInvoice', label: 'Delete Credit Invoice' },
                                ].map(perm => (
                                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 hover:text-purple-600 transition-colors">
                                        <input 
                                            type="checkbox"
                                            checked={(tempUser.permissions as any)?.[perm.key] ?? true}
                                            onChange={(e) => setTempUser({
                                                ...tempUser,
                                                permissions: { ...tempUser.permissions!, [perm.key]: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-purple-600 rounded"
                                        />
                                        <span>{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Orders Alerts */}
                        <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                            <h6 className="text-xs font-bold text-purple-900 mb-2 pb-1 border-b border-purple-50">
                                Orders & Approvals
                            </h6>
                            <div className="flex flex-col gap-2">
                                {[
                                    { key: 'notifyAddOrder', label: 'Add Order' },
                                    { key: 'notifyApproveOrder', label: 'Approve Order' },
                                    { key: 'notifyRejectOrder', label: 'Reject Order' },
                                    { key: 'notifyDeleteOrder', label: 'Delete Order' },
                                ].map(perm => (
                                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 hover:text-purple-600 transition-colors">
                                        <input 
                                            type="checkbox"
                                            checked={(tempUser.permissions as any)?.[perm.key] ?? true}
                                            onChange={(e) => setTempUser({
                                                ...tempUser,
                                                permissions: { ...tempUser.permissions!, [perm.key]: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-purple-600 rounded"
                                        />
                                        <span>{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 rounded-b-xl flex justify-end gap-3 border-t border-slate-200">
                <button 
                    onClick={() => setShowUserModal(false)}
                    className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSaveUser}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm"
                >
                    Save User
                </button>
            </div>
        </div>
    );
};
