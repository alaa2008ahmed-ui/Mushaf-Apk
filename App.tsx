
import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import Header from './components/Header';
import Nav from './components/Nav';
import { ClipboardList, X } from 'lucide-react';
import FilterBar from './components/FilterBar';
import TotalSummary from './components/TotalSummary';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import Notification from './components/Notification';
import Login from './components/Login';

// Lazy load heavy page components to speed up initial dashboard loading
const DailySales = lazy(() => import('./components/DailySales'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
const MonthlyReport = lazy(() => import('./components/MonthlyReport'));
const AnnualReport = lazy(() => import('./components/AnnualReport'));
const AccountStatement = lazy(() => import('./components/AccountStatement'));
const TimeSheet = lazy(() => import('./components/TimeSheet'));
const PO = lazy(() => import('./components/PO'));
const InvoiceTracking = lazy(() => import('./components/InvoiceTracking'));
const DriverWorkLog = lazy(() => import('./components/DriverWorkLog'));
const DriverReport = lazy(() => import('./components/DriverReport'));
const Customers = lazy(() => import('./components/Customers'));
const Orders = lazy(() => import('./components/Orders'));
const OrderApprovals = lazy(() => import('./components/OrderApprovals'));
import { Item, Employee, Invoice, Branch, User, UserPermissions, Customer, DeliveryNote, BottleTransaction, AppSettings, POCustomer, InvoiceLog, Driver, Vehicle, DriverWorkLog as IDriverWorkLog, DriverMonthlySummary, Order } from './types';
import { mockItems, mockEmployees, mockBranches, mockDrivers, mockVehicles, defaultAdmin, alaaUser, mockPOCustomers, mockCustomers } from './constants';
import { dualStorage, COLLECTIONS } from './DualStorageService';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { downloadBlob } from './downloadUtils';
import { captureAndExport, printOrDownloadPdf } from './captureUtils';
import CryptoJS from 'crypto-js';
import LZString from 'lz-string';
import { getFolderHandle } from './IndexedDBService';
import { useSetupData } from './hooks/useSetupData';
import { useBasicHandlers } from './hooks/useBasicHandlers';
import { useInvoiceMigration } from './hooks/useInvoiceMigration';
import { useCustomerHandlers } from './hooks/useCustomerHandlers';
import { useInvoiceHandlers } from './hooks/useInvoiceHandlers';
import { useSettingsHandlers } from './hooks/useSettingsHandlers';
import { useAppState } from './hooks/useAppState';
import DailyNotificationManager from './components/DailyNotificationManager';
import AutoBackupManager from './components/AutoBackupManager';
import { AppRouter } from './components/AppRouter';

// Declare jsPDF and html2canvas types for TypeScript
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
        ExcelJS: any;
    }
}

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('Dashboard');
    const [isMobile, setIsMobile] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState<number>(() => dualStorage.getLastSyncTime());
    const [showLowPOAlert, setShowLowPOAlert] = useState(false);
    const [hasShownLoginPOAlert, setHasShownLoginPOAlert] = useState(false);
    const alertTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Device Detection
    useEffect(() => {
        const checkDevice = () => {
            // Use width-based responsive detection
            // Note: maxTouchPoints caused touchscreen laptops to be identified as mobile
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
            const isMobileBrowser = mobileRegex.test(userAgent.toLowerCase());
            const isMobileDevice = isMobileBrowser || window.innerWidth < 1024;
            setIsMobile(isMobileDevice);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Handle sync and auth readiness with a safety timeout
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isAuthReady) setIsAuthReady(true);
        }, 3000); // 3 seconds fallback

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setIsAuthReady(true);
            clearTimeout(timer);
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    const handleForceSync = async () => {
        const branchName = branches.find(b => b.id === selectedBranchId)?.name || 'the selected branch';
        setNotification({ message: `Pushing local data for ${branchName} to server...`, type: 'info' });
        try {
            // This now specifically pushes local changes for the branch to cloud
            await dualStorage.forcePushBranchData(selectedBranchId);
            
            // Also do a full sync to catch any cloud changes
            await dualStorage.fullSyncFromCloud();
            
            setPendingSyncCount(dualStorage.getPendingCount(selectedBranchId));
            setLastSyncTime(dualStorage.getLastSyncTime());
            setNotification({ message: `Data for ${branchName} is now synced with server.`, type: 'success' });
        } catch (error) {
            console.error('Manual sync failed:', error);
            setNotification({ message: 'Sync failed. Please check your connection.', type: 'error' });
        }
    };
    
    // Update pending sync count when branch changes
    // Dynamic Data State
    const {
        items, setItems,
        branches, setBranches,
        users, setUsers,
        invoiceLogs, setInvoiceLogs,
        globalStats, setGlobalStats,
        appSettings, setAppSettings,
        drivers, setDrivers,
        vehicles, setVehicles,
        driverWorkLogs, setDriverWorkLogs,
        driverMonthlySummaries, setDriverMonthlySummaries,
        orders, setOrders,
        poCustomers, setPoCustomers,
        customers, setCustomers,
        deliveryNotes, setDeliveryNotes,
        bottleTransactions, setBottleTransactions
    } = useAppState(isAuthReady);

    const [prefilledCreditInvoice, setPrefilledCreditInvoice] = useState<{
        customerName: string;
        item: string;
        quantity: number;
        totalWithTax: number;
        orderIds: string[];
    } | null>(null);

    const [recentDeliveredGroup, setRecentDeliveredGroup] = useState<Order[] | null>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (currentUser) {
            const hidden = localStorage.getItem(`hideBeforeTax_${currentUser.username}`) === 'true';
            if (hidden) {
                document.body.classList.add('hide-before-tax');
            } else {
                document.body.classList.remove('hide-before-tax');
            }
        }
    }, [currentUser]);

    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);
    const lastPendingIdsRef = React.useRef<Set<string>>(new Set());
    const lastApprovedIdsRef = React.useRef<Set<string>>(new Set());

    const pendingOrdersList = useMemo(() => {
        return orders.filter(o => o.status === 'pending');
    }, [orders]);

    const canApproveOrders = useMemo(() => {
        if (!currentUser) return false;
        return currentUser.username.toLowerCase() === 'alaa' || 
               (currentUser.permissions?.allowedPages || []).includes('Order Approvals');
    }, [currentUser]);

    useEffect(() => {
        if (!canApproveOrders) {
            setShowPendingOrdersModal(false);
            return;
        }
        if (pendingOrdersList.length === 0) {
            setShowPendingOrdersModal(false);
            lastPendingIdsRef.current = new Set();
            return;
        }

        const currentPendingIds = new Set(pendingOrdersList.map(o => o.id));
        const hasNewPending = Array.from(currentPendingIds).some(id => !lastPendingIdsRef.current.has(id));

        if (hasNewPending) {
            setShowPendingOrdersModal(true);
        }
        lastPendingIdsRef.current = currentPendingIds;
    }, [pendingOrdersList, canApproveOrders]);

    useEffect(() => {
        if (currentUser) {
            const latestUser = users.find(u => u.username.trim().toLowerCase() === currentUser.username.trim().toLowerCase());
            if (latestUser && JSON.stringify(latestUser.permissions) !== JSON.stringify(currentUser.permissions)) {
                setCurrentUser(latestUser);
                localStorage.setItem('currentUser', JSON.stringify(latestUser));
            }
        }
    }, [users, currentUser]);

    // Order Flow routing guard
    useEffect(() => {
        if (appSettings?.directOrderFlow && currentPage === 'Order Approvals') {
            setCurrentPage('Dashboard');
        }
    }, [currentPage, appSettings?.directOrderFlow]);

    useEffect(() => {
        if (!currentUser?.permissions?.receiveNewOrderAlert) {
            return;
        }

        const approvedOrders = orders.filter(o => o.status === 'approved');
        const currentApprovedIds = new Set(approvedOrders.map(o => o.id));

        if (lastApprovedIdsRef.current.size > 0) {
            const hasNewApproved = approvedOrders.some(o => !lastApprovedIdsRef.current.has(o.id));
            if (hasNewApproved) {
                setNotification({ message: 'New Approved Order', type: 'info' }, 'notifyApproveOrder');
            }
        }
        
        lastApprovedIdsRef.current = currentApprovedIds;
    }, [orders, currentUser]);

    const [isNavHovered, setIsNavHovered] = useState(false);

    const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
        return localStorage.getItem('selectedBranchId') || '';
    });

    useEffect(() => {
        setPendingSyncCount(dualStorage.getPendingCount(selectedBranchId));
        
        // Poll pending sync count every 5 seconds (filtered by selected branch)
        const pollInterval = setInterval(() => {
            setPendingSyncCount(dualStorage.getPendingCount(selectedBranchId));
            setLastSyncTime(dualStorage.getLastSyncTime());
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [selectedBranchId]);

    const filteredBranches = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.permissions.allowedBranches.includes('all')) return branches;
        return branches.filter(b => currentUser.permissions.allowedBranches.includes(b.id));
    }, [branches, currentUser]);

    useEffect(() => {
        localStorage.setItem('selectedBranchId', selectedBranchId);
    }, [selectedBranchId]);

    useEffect(() => {
        if (currentUser) {
            const isHiddenOnMobile = isMobile && currentUser.username.toLowerCase() !== 'alaa' && (appSettings?.mobileHiddenPages || []).includes(currentPage);
            if (!currentUser.permissions.allowedPages.includes(currentPage) || isHiddenOnMobile) {
                // Priority fallback: 'Daily Sales' if allowed and not hidden on mobile, otherwise first allowed and visible page
                const availablePages = currentUser.permissions.allowedPages.filter(p => !isMobile || currentUser.username.toLowerCase() === 'alaa' || !(appSettings?.mobileHiddenPages || []).includes(p));
                
                if (availablePages.includes('Daily Sales')) {
                    setCurrentPage('Daily Sales');
                } else if (availablePages.length > 0) {
                    setCurrentPage(availablePages[0]);
                }
            }
        }
    }, [currentUser, currentPage, isMobile, appSettings?.mobileHiddenPages]);

    useEffect(() => {
        if (currentUser && filteredBranches.length > 0) {
            // Check if current selection is valid
            const isValid = selectedBranchId !== '' && filteredBranches.some(b => b.id === selectedBranchId);
            
            if (!isValid) {
                const lowerUser = currentUser.username.toLowerCase();
                if (filteredBranches.length === 1) {
                    setSelectedBranchId(filteredBranches[0].id);
                } else if (lowerUser.includes('dammam') && filteredBranches.some(b => b.id === 'b1')) {
                    setSelectedBranchId('b1');
                } else if (lowerUser.includes('hasa') && filteredBranches.some(b => b.id === 'b2')) {
                    setSelectedBranchId('b2');
                } else if (filteredBranches.some(b => b.id === 'b3')) {
                    setSelectedBranchId('b3');
                } else {
                    setSelectedBranchId(filteredBranches[0]?.id || '');
                }
            }
        }
    }, [currentUser, filteredBranches, selectedBranchId]);


    // Items Handlers and Branch Handlers moved to useBasicHandlers
    const handleLogin = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setHasShownLoginPOAlert(false);
        if (user.permissions.allowedPages.includes('Dashboard')) {
            setCurrentPage('Dashboard');
        } else {
            setCurrentPage('Daily Sales');
        }
        
        const allowed = user.permissions.allowedBranches;
        const hasAll = allowed.includes('all');
        const hasMain = hasAll || allowed.includes('b3');
        const hasDammam = hasAll || allowed.includes('b1');
        const hasHasa = hasAll || allowed.includes('b2');

        const lowerUser = user.username.toLowerCase();
        
        if (allowed.length === 1 && !hasAll) {
            setSelectedBranchId(allowed[0]);
        } else if (lowerUser.includes('dammam') && hasDammam) {
            setSelectedBranchId('b1');
        } else if (lowerUser.includes('hasa') && hasHasa) {
            setSelectedBranchId('b2');
        } else if (hasMain) {
            setSelectedBranchId('b3');
        } else if (allowed.length > 0) {
            const firstSafe = allowed.find(a => a !== 'all') || allowed[0];
            if (firstSafe) setSelectedBranchId(firstSafe);
        }
    };

    const {
        handleLogout, handleAddUser, handleUpdateUser, handleDeleteUser,
        handleUpdateSettings, handleAddDriver, handleUpdateDriver, handleDeleteDriver,
        handleAddVehicle, handleUpdateVehicle, handleDeleteVehicle,
        handleSaveDriverWorkLog, handleUpdateDriverWorkLog, handleDeleteDriverWorkLog, handleUpdateDriverMonthlySummary,
        handleAddItem, handleUpdateItem, handleDeleteItem, handleAddBranch, handleUpdateBranch, handleDeleteBranch
    } = useBasicHandlers(currentUser, setCurrentUser, setCurrentPage, setHasShownLoginPOAlert, setShowLowPOAlert, (msg, perm) => setNotification(msg, perm), drivers, vehicles, selectedBranchId, branches, setSelectedBranchId);

    // Migration: branchInvoiceNumbers state is removed in favor of appSettings.nextInvoiceNumbers
    
    const [notificationData, setNotificationData] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'add' | 'update' | 'delete' | 'warning' } | null>(null);

    const setNotification = React.useCallback((
        notif: { message: string, type: 'success' | 'error' | 'info' | 'add' | 'update' | 'delete' | 'warning' } | null,
        permKey?: keyof UserPermissions
    ) => {
        if (notif && permKey && currentUser?.permissions) {
            if (currentUser.permissions[permKey] === false) return;
        }
        setNotificationData(notif);
    }, [currentUser]);
    const [workingDate, setWorkingDate] = useState(new Date());
    const [timeSheetMonthTitle, setTimeSheetMonthTitle] = useState('');

    useEffect(() => {
        const handleMonthChange = (e: any) => {
            setTimeSheetMonthTitle(e.detail);
        };
        window.addEventListener('timesheet_month_changed', handleMonthChange);
        return () => window.removeEventListener('timesheet_month_changed', handleMonthChange);
    }, []);

    const [allSalesInvoices, setAllSalesInvoices] = useState<Invoice[]>(() => {
        const saved = dualStorage.getLocalData(COLLECTIONS.SALES_INVOICES);
        return saved.map((inv: any) => {
            let dateValue = inv.date;
            if (dateValue && typeof dateValue === 'object' && dateValue.seconds !== undefined) {
                dateValue = new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
            } else if (dateValue) {
                dateValue = new Date(dateValue);
            } else {
                dateValue = new Date();
            }
            return { ...inv, date: isNaN(dateValue.getTime()) ? new Date() : dateValue };
        });
    });
    
    useInvoiceMigration(isAuthReady, allSalesInvoices, setAllSalesInvoices, users, branches, setNotification);

    useSetupData(
        isAuthReady, setNotification, setItems, setBranches, setInvoiceLogs, setDrivers, setVehicles, setDriverWorkLogs, setDriverMonthlySummaries, setOrders, setAppSettings, setUsers, setAllSalesInvoices, setCustomers, setDeliveryNotes, setBottleTransactions, setPoCustomers
    );

    // Update currentUser whenever users array changes (e.g., from Firestore sync)
    // to ensure permissions and details stay up-to-date real-time.
    useEffect(() => {
        if (currentUser) {
            const upToDateUser = users.find(u => u.id === currentUser.id);
            if (upToDateUser && JSON.stringify(upToDateUser) !== JSON.stringify(currentUser)) {
                setCurrentUser(upToDateUser);
                localStorage.setItem('currentUser', JSON.stringify(upToDateUser));
            }
        }
    }, [users, currentUser]);

    // Derived values for backward compatibility and simpler logic
    const cashInvoices = useMemo(() => allSalesInvoices.filter(inv => inv.type === 'cash'), [allSalesInvoices]);
    const creditInvoices = useMemo(() => allSalesInvoices.filter(inv => inv.type === 'credit'), [allSalesInvoices]);
    const postedInvoices = allSalesInvoices; // Now everything is "posted" immediately
    const annualInvoices = allSalesInvoices; // Now everything is visible in annual immediately
    
    const sortedCustomers = useMemo(() => {
        return [...customers].sort((a, b) => {
            const numA = parseInt(a.customerNumber) || 0;
            const numB = parseInt(b.customerNumber) || 0;
            return numA - numB;
        });
    }, [customers]);
    
    const [cashEditInvoice, setCashEditInvoice] = useState<Invoice | null>(null);
    const [creditEditInvoice, setCreditEditInvoice] = useState<Invoice | null>(null);

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const branchPostedInvoices = useMemo(() => {
        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        return postedInvoices.filter(inv => 
            inv.branchId === selectedBranchId || (selectedBranch && inv.branchName === selectedBranch.name) || !inv.branchId
        );
    }, [postedInvoices, selectedBranchId, branches]);

    const branchAnnualInvoices = useMemo(() => {
        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        return annualInvoices.filter(inv => 
            inv.branchId === selectedBranchId || (selectedBranch && inv.branchName === selectedBranch.name) || !inv.branchId
        );
    }, [annualInvoices, selectedBranchId, branches]);

    const { handleAddPOCustomer, handleUpdatePOCustomer, handleDeletePOCustomer, handleAddCustomer, handleUpdateCustomer, handleDeleteCustomer } = useCustomerHandlers(setNotification);

    const activeCustomers = useMemo(() => customers.filter(c => c.isActive !== false), [customers]);
    const sortedActiveCustomers = useMemo(() => sortedCustomers.filter(c => c.isActive !== false), [sortedCustomers]);

    const poCustomersWithBalances = useMemo(() => {
        const activeCustomerNames = new Set(activeCustomers.map(c => c.name.toLowerCase().trim()));
        return poCustomers
            .filter(customer => activeCustomerNames.has(customer.customerName.toLowerCase().trim()))
            .map(customer => {
                const customerInvoices = allSalesInvoices.filter(inv => inv.poCustomerId === customer.id);
                const usedQty = customerInvoices.reduce((sum, inv) => sum + inv.quantity, 0);
                const usedTotal = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
                return {
                    ...customer,
                    remainingQuantity: (customer.quantity || 0) - usedQty,
                    remainingTotal: (customer.total || 0) - usedTotal
                };
            });
    }, [poCustomers, allSalesInvoices, activeCustomers]);

    const lowPOs = useMemo(() => {
        return poCustomersWithBalances.filter(c => {
            const isArchived = ((c.quantity || 0) > 0 && c.remainingQuantity <= 0) || ((c.total || 0) > 0 && c.remainingTotal <= 0);
            if (isArchived) return false;

            if (c.alertThreshold === undefined || c.alertThreshold <= 0) return false;

            const isQuantityAlert = (c.quantity || 0) > 0 && c.remainingQuantity <= c.alertThreshold;
            const isTotalAlert = (c.total || 0) > 0 && c.remainingTotal <= c.alertThreshold;

            return isQuantityAlert || isTotalAlert;
        });
    }, [poCustomersWithBalances]);

    const hasMainBranchAccess = useMemo(() => {
        if (!currentUser) return false;
        if (currentUser.username.toLowerCase() === 'alaa') return true;
        if (currentUser.permissions.allowedBranches.includes('all')) return true;
        const mainIds = branches.filter(b => b.name.toLowerCase().includes('main')).map(b => b.id);
        return currentUser.permissions.allowedBranches.some(bId => mainIds.includes(bId));
    }, [currentUser, branches]);

    const triggerPOAlert = React.useCallback(() => {
        setShowLowPOAlert(true);
        if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(() => {
            setShowLowPOAlert(false);
            alertTimeoutRef.current = null;
        }, 5000);
    }, []);

    const prevLowPOsRef = React.useRef<string[]>([]);

    useEffect(() => {
        if (!currentUser || currentUser.permissions?.receiveLowPOAlert === false) return;
        
        const currentLowPOIds = lowPOs.map(p => p.id);
        
        if (!hasShownLoginPOAlert && currentLowPOIds.length > 0) {
            setHasShownLoginPOAlert(true);
            triggerPOAlert();
        } else if (prevLowPOsRef.current.length > 0) {
            const newLowPOs = currentLowPOIds.filter(id => !prevLowPOsRef.current.includes(id));
            if (newLowPOs.length > 0) {
                triggerPOAlert();
            }
        }
        
        prevLowPOsRef.current = currentLowPOIds;
    }, [lowPOs, currentUser, triggerPOAlert, hasShownLoginPOAlert]);

    // Background timer to check and trigger daily notifications (strictly restricted to Capacitor Native Phone App)
    // Moved to DailyNotificationManager.tsx

    // Background timer to check and trigger automatic backup of all system databases (AutoBackupManager)
    // Moved to AutoBackupManager.tsx

    const { handleCreateInvoiceFromOrder, handleAddInvoice, handleUpdateInvoice, handleDeleteInvoice } = useInvoiceHandlers(
        currentUser,
        isAuthReady,
        allSalesInvoices,
        orders,
        setOrders,
        poCustomersWithBalances,
        appSettings,
        workingDate,
        selectedBranchId,
        setNotification,
        setCurrentPage,
        setPrefilledCreditInvoice,
        setRecentDeliveredGroup,
        setCashEditInvoice,
        setCreditEditInvoice
    );



    const { handleClearInvoices, handleRestoreDefaults } = useSettingsHandlers(appSettings, handleUpdateSettings, branches, setNotification);

    const renderPageProps = {
        currentPage, currentUser, isMobile, appSettings, allSalesInvoices, branches, globalStats,
        filteredBranches, selectedBranchId, setSelectedBranchId, workingDate, setWorkingDate,
        items, poCustomersWithBalances, orders, recentDeliveredGroup, setRecentDeliveredGroup,
        pendingSyncCount, lastSyncTime, handleForceSync, handleCreateInvoiceFromOrder,
        handleAddInvoice, handleUpdateInvoice, handleDeleteInvoice, setNotification,
        prefilledCreditInvoice, setPrefilledCreditInvoice, cashEditInvoice, setCashEditInvoice,
        creditEditInvoice, setCreditEditInvoice, postedInvoices, annualInvoices, users,
        invoiceLogs, drivers, vehicles, sortedActiveCustomers, driverWorkLogs,
        handleSaveDriverWorkLog, handleUpdateDriverWorkLog, handleDeleteDriverWorkLog,
        handleUpdateUser, activeCustomers, handleUpdateSettings, handleAddItem, handleUpdateItem,
        handleDeleteItem, handleAddBranch, handleDeleteBranch, handleUpdateBranch, handleAddUser,
        handleDeleteUser, handleClearInvoices, handleRestoreDefaults,
        handleAddDriver, handleUpdateDriver, handleDeleteDriver, handleAddVehicle,
        handleUpdateVehicle, handleDeleteVehicle, handleAddPOCustomer, handleUpdatePOCustomer,
        handleDeletePOCustomer, handleAddCustomer, sortedCustomers, handleUpdateCustomer,
        handleDeleteCustomer, setCurrentPage
    };

    const renderPage = () => <AppRouter {...renderPageProps} />;

    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    const selectedBranchName = selectedBranch ? selectedBranch.name : 'All Branches';

    if (!isAuthReady && !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Login users={users} onLogin={handleLogin} />;
    }

    return (
        <div className={`min-h-screen bg-gray-100 font-sans overflow-x-clip ${!isMobile ? 'pl-[64px] print:pl-0' : ''}`}>
            <DailyNotificationManager 
                appSettings={appSettings} 
                allSalesInvoices={allSalesInvoices} 
                branches={branches} 
                handleUpdateSettings={handleUpdateSettings} 
            />
            <AutoBackupManager 
                appSettings={appSettings} 
                setNotification={setNotification} 
            />
            {notificationData && <Notification message={notificationData.message} type={notificationData.type} onClose={() => setNotification(null)} />}
            
            <Nav 
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                allowedPages={currentUser.permissions.allowedPages
                    .filter(p => !appSettings?.directOrderFlow || p !== 'Order Approvals')
                    .filter(p => !isMobile || currentUser.username.toLowerCase() === 'alaa' || !(appSettings?.mobileHiddenPages || []).includes(p))
                }
                onLogout={handleLogout}
                isMobile={isMobile}
                pendingOrdersCount={orders.filter(o => o.status === 'pending').length}
            />

            {/* Trigger Area for Desktop Auto-hide Header */}
            {!isMobile && ['Dashboard'].includes(currentPage) && (
                <div 
                    onMouseEnter={() => setIsNavHovered(true)}
                    className="fixed top-0 left-[64px] right-0 h-4 z-50 no-print"
                />
            )}

            {/* Fixed Header and Navigation Wrapper */}
            {!['Monthly Sales', 'Annual Sales'].includes(currentPage) && (
                <div 
                    onMouseEnter={() => setIsNavHovered(true)}
                    onMouseLeave={() => setIsNavHovered(false)}
                    className={`
                        ${isMobile ? 'relative' : 'fixed top-0 left-[64px] right-0 z-[50]'} 
                        bg-gray-100 no-print pb-2 
                        ${!isMobile && currentPage === 'Time Sheet' ? 'h-[160px]' : ''}
                        ${!isMobile ? 'shadow-md' : 'shadow-sm'}
                        ${!isMobile && ['Dashboard'].includes(currentPage) ? `transition-all duration-75 ease-out transform ${isNavHovered ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}` : ''}
                    `}
                >
                    {!['Dashboard'].includes(currentPage) && (
                        <div className={`${currentPage === 'Time Sheet' ? 'px-1 sm:px-2' : 'px-4 sm:px-6 lg:px-8'} ${isMobile ? 'pt-4 pb-2' : 'pt-4'} relative z-30`}>
                            <div className="rounded-lg shadow-md">
                                <Header 
                                employeeName={currentUser.username} 
                                currentUser={currentUser}
                                date={workingDate}
                                branches={filteredBranches}
                                selectedBranchId={selectedBranchId}
                                onSelectBranch={setSelectedBranchId}
                                readOnly={filteredBranches.length <= 1}
                                pendingCount={pendingSyncCount}
                                lastSyncTime={lastSyncTime}
                                onRefresh={handleForceSync}
                                approvedOrders={orders.filter(o => o.status === 'approved')}
                                currentPage={currentPage}
                                reportTitle={currentPage === 'Time Sheet' ? `Employee Overtime${timeSheetMonthTitle ? ' - ' + timeSheetMonthTitle : ''}` : currentPage}
                                onCreateInvoice={handleCreateInvoiceFromOrder}
                                deliveredGroupProps={recentDeliveredGroup}
                                onCloseDeliveredGroup={() => setRecentDeliveredGroup(null)}
                            />
                        </div>
                    </div>
                )}
            </div>
            )}

            <main className="flex-1 flex flex-col min-h-0">
                {/* Spacer div to prevent content from hiding behind fixed header ONLY on Desktop */}
                {!isMobile && (
                    <div className={`
                        ${['Dashboard', 'Monthly Sales', 'Annual Sales'].includes(currentPage) 
                            ? 'h-0' 
                            : 'h-[160px]'} 
                        transition-all duration-75 ease-out
                        print:hidden
                    `}></div>
                )}
                
                {showLowPOAlert && lowPOs.length > 0 && hasMainBranchAccess && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4 shadow-md rounded flex flex-col justify-center print:hidden transition-all duration-300 ease-in-out" role="alert" dir="ltr">
                        <p className="font-bold flex items-center gap-2">
                            <span className="text-xl">⚠️</span> Low PO Balance Alert
                        </p>
                        <ul className="list-disc list-inside mt-2 text-sm">
                            {lowPOs.map(po => {
                                const isQtyLimit = (po.quantity || 0) > 0 && po.remainingQuantity <= (po.alertThreshold || 0);
                                const balanceText = isQtyLimit 
                                    ? `Remaining Qty: ${po.remainingQuantity}` 
                                    : `Remaining Total: ${po.remainingTotal.toFixed(2)}`;
                                return (
                                    <li key={po.id}>
                                        Customer: <span className="font-semibold">{po.customerName}</span> | PO: <span className="font-semibold">{po.poNumber}</span> | <span className="font-bold text-red-800">{balanceText}</span> (Limit: {po.alertThreshold})
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                <div className={`flex-1 flex flex-col min-h-0 ${!isMobile && currentPage === 'Dashboard' ? 'px-4 sm:px-6 lg:px-8' : ''}`}>
                    <Suspense fallback={
                        <div className="flex items-center justify-center p-12 w-full h-full min-h-[400px]">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                                <p className="text-gray-500 font-medium">Loading page...</p>
                            </div>
                        </div>
                    }>
                        {renderPage()}
                    </Suspense>
                </div>
            </main>

            {/* Center-screen alert modal for Pending Approvals */}
            {showPendingOrdersModal && canApproveOrders && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print" id="pending-orders-modal-root">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-150 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white px-6 py-5 relative flex items-center gap-3">
                            <div className="bg-white/15 p-2 rounded-xl">
                                <ClipboardList className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-extrabold tracking-tight">Pending Orders Awaiting Decision</h3>
                            </div>
                            <button
                                onClick={() => setShowPendingOrdersModal(false)}
                                className="absolute top-4 right-4 hover:bg-white/10 text-white/80 hover:text-white p-1.5 rounded-full transition-colors"
                                title="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <div className="space-y-3">
                                {pendingOrdersList.map((order, idx) => {
                                    const qtyVal = order.quantity || 0;
                                    const priceVal = order.price || 0;
                                    const totalBeforeTax = qtyVal * priceVal;
                                    const totalWithTax = totalBeforeTax * 1.15;
                                    return (
                                        <div 
                                            key={order.id || idx} 
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-155 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm"
                                        >
                                            <div className="text-left space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-orange-100 text-orange-850 font-black text-[10px] px-2 py-0.5 rounded-md border border-orange-200">
                                                        Serial: #{order.serial}
                                                    </span>
                                                    <span className="text-[13px] text-slate-500 font-bold font-mono">
                                                        {order.time ? new Date(order.time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true}) : ''}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-gray-800 text-sm leading-tight">{order.customerName}</h4>
                                                <p className="text-sm text-gray-500 font-semibold">{order.item}</p>
                                            </div>

                                            <div className="flex flex-col items-start sm:items-end gap-2 min-w-[155px] border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                                <div className="flex gap-2 items-center">
                                                    <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded text-sm border border-blue-150">
                                                        Qty: {qtyVal}
                                                    </span>
                                                    {order.price !== undefined && (
                                                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded text-sm border border-slate-200">
                                                            Price: {priceVal.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-600 flex gap-2.5 w-full justify-between sm:justify-end font-semibold">
                                                    <span>Ex. Tax: <span className="font-bold text-gray-800 font-mono">{totalBeforeTax.toFixed(2)}</span></span>
                                                    <span className="text-blue-600 font-extrabold">With Tax: <span className="font-mono">{totalWithTax.toFixed(2)}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <span className="text-xs text-slate-450 font-medium hidden sm:inline-block">
                                Total pending items: {pendingOrdersList.length}
                            </span>
                            <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowPendingOrdersModal(false)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 active:scale-95 transition-all text-center"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPendingOrdersModal(false);
                                        setCurrentPage('Order Approvals');
                                    }}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold text-sm text-white rounded-xl active:scale-95 transition-all shadow-md text-center flex items-center justify-center gap-1.5"
                                >
                                    Go to Approvals
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;