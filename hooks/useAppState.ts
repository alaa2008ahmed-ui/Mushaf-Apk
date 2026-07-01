import { useState, useEffect } from 'react';
import { COLLECTIONS, dualStorage } from '../DualStorageService';
import { 
    Item, Branch, User, InvoiceLog, AppSettings, Driver, Vehicle, DriverWorkLog, 
    DriverMonthlySummary, Order, Invoice, Customer, DeliveryNote, BottleTransaction, POCustomer 
} from '../types';
import { defaultAdmin, alaaUser, mockItems, mockBranches, mockPOCustomers } from '../constants';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useAppState = (isAuthReady: boolean) => {
    const [items, setItems] = useState<Item[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        return records.filter((r: any) => r.type === 'item').map((r: any) => r.data);
    });
    
    const [branches, setBranches] = useState<Branch[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        const branchesData = records.filter((r: any) => r.type === 'branch').map((r: any) => r.data);
        return branchesData.sort((a, b) => {
            const getPriority = (name: string) => {
                const lowerName = name.toLowerCase();
                if (lowerName.includes('main')) return 1;
                if (lowerName.includes('dammam')) return 2;
                if (lowerName.includes('alhasa') || lowerName.includes('hasa')) return 3;
                return 4;
            };
            const priorityA = getPriority(a.name);
            const priorityB = getPriority(b.name);
            return priorityA !== priorityB ? priorityA - priorityB : a.name.localeCompare(b.name);
        });
    });

    const [users, setUsers] = useState<User[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        const usersData = records.filter((r: any) => r.type === 'user').map((r: any) => r.data);
        return usersData.length > 0 ? [alaaUser, ...usersData.filter((u: any) => u.username.toLowerCase() !== 'alaa')] : [alaaUser];
    });

    const [invoiceLogs, setInvoiceLogs] = useState<InvoiceLog[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        return records.filter((r: any) => r.type === 'invoice_log').map((r: any) => r.data as InvoiceLog);
    });

    const [globalStats, setGlobalStats] = useState<any>(null);

    useEffect(() => {
        if (!isAuthReady) return;
        const statsRef = doc(db, 'settings', 'global_stats');
        const unsubscribe = onSnapshot(statsRef, (docSnap: any) => {
            if (docSnap.exists()) {
                setGlobalStats(docSnap.data());
            }
        });
        return () => unsubscribe();
    }, [isAuthReady]);

    const [appSettings, setAppSettings] = useState<AppSettings>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        const settingsData = records.find((r: any) => r.type === 'settings')?.data;
        if (settingsData) {
            return {
                ...settingsData,
                registrationStartDate: settingsData.registrationStartDate ? new Date(settingsData.registrationStartDate) : null,
                registrationEndDate: settingsData.registrationEndDate ? new Date(settingsData.registrationEndDate) : null,
                modificationStartDate: settingsData.modificationStartDate ? new Date(settingsData.modificationStartDate) : null,
                modificationEndDate: settingsData.modificationEndDate ? new Date(settingsData.modificationEndDate) : null,
            };
        }
        return {
            restrictRegistration: false,
            registrationStartDate: null,
            registrationEndDate: null,
            restrictModification: false,
            modificationStartDate: null,
            modificationEndDate: null,
            nextInvoiceNumbers: {}
        };
    });

    const [drivers, setDrivers] = useState<Driver[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        return records.filter((r: any) => r.type === 'driver').map((r: any) => r.data as Driver).sort((a, b) => a.driverId - b.driverId);
    });

    const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        return records.filter((r: any) => r.type === 'vehicle').map((r: any) => r.data as Vehicle).sort((a, b) => a.vehicleId - b.vehicleId);
    });

    const [driverWorkLogs, setDriverWorkLogs] = useState<DriverWorkLog[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        return records.filter((r: any) => r.type === 'driver_work_log').map((r: any) => r.data as DriverWorkLog);
    });

    const [driverMonthlySummaries, setDriverMonthlySummaries] = useState<DriverMonthlySummary[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        return records.filter((r: any) => r.type === 'driver_monthly_summary').map((r: any) => r.data as DriverMonthlySummary);
    });

    const [orders, setOrders] = useState<Order[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        return records.filter((r: any) => r.type === 'order').map((r: any) => ({
            ...(r.data as Order),
            id: r.id
        }));
    });

    const [poCustomers, setPoCustomers] = useState<POCustomer[]>(() => {
        return dualStorage.getLocalData(COLLECTIONS.PO_CUSTOMERS);
    });
    
    const [customers, setCustomers] = useState<Customer[]>(() => dualStorage.getLocalData(COLLECTIONS.CUSTOMERS));

    const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(() => {
        const notes = dualStorage.getLocalData(COLLECTIONS.DELIVERY_NOTES);
        return notes.map((n: any) => ({ ...n, date: new Date(n.date) }));
    });

    const [bottleTransactions, setBottleTransactions] = useState<BottleTransaction[]>(() => {
        const trans = dualStorage.getLocalData(COLLECTIONS.BOTTLE_TRANSACTIONS);
        return trans.map((t: any) => ({ ...t, date: new Date(t.date) }));
    });

    return {
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
    };
};
