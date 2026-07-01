import { useEffect } from 'react';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { alaaUser } from '../constants';
import { AppSettings, User } from '../types';

export const useSetupData = (
    isAuthReady: boolean,
    setNotification: any,
    setItems: any,
    setBranches: any,
    setInvoiceLogs: any,
    setDrivers: any,
    setVehicles: any,
    setDriverWorkLogs: any,
    setDriverMonthlySummaries: any,
    setOrders: any,
    setAppSettings: any,
    setUsers: any,
    setAllSalesInvoices: any,
    setCustomers: any,
    setDeliveryNotes: any,
    setBottleTransactions: any,
    setPoCustomers: any
) => {
    useEffect(() => {
        if (!isAuthReady) return;

        const handleDataUpdate = (collectionName: string, data: any[]) => {
            switch (collectionName) {
                case COLLECTIONS.RECORDS:
                    setItems(data.filter(r => r.type === 'item').map(r => r.data));
                    
                    const branchesData = data.filter(r => r.type === 'branch').map(r => r.data);
                    setBranches(branchesData.sort((a, b) => {
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
                    }));

                    setInvoiceLogs(data.filter(r => r.type === 'invoice_log').map(r => r.data));
                    setDrivers(data.filter(r => r.type === 'driver').map(r => r.data).sort((a, b) => a.driverId - b.driverId));
                    setVehicles(data.filter(r => r.type === 'vehicle').map(r => r.data).sort((a, b) => a.vehicleId - b.vehicleId));
                    setDriverWorkLogs(data.filter(r => r.type === 'driver_work_log').map(r => r.data));
                    setDriverMonthlySummaries(data.filter(r => r.type === 'driver_monthly_summary').map(r => r.data));
                    setOrders(data.filter(r => r.type === 'order').map(r => ({ ...r.data, id: r.id })));
                    
                    const settingsData = data.find(r => r.type === 'settings')?.data;
                    if (settingsData) {
                        setAppSettings({
                            ...settingsData,
                            registrationStartDate: settingsData.registrationStartDate ? new Date(settingsData.registrationStartDate) : null,
                            registrationEndDate: settingsData.registrationEndDate ? new Date(settingsData.registrationEndDate) : null,
                            modificationStartDate: settingsData.modificationStartDate ? new Date(settingsData.modificationStartDate) : null,
                            modificationEndDate: settingsData.modificationEndDate ? new Date(settingsData.modificationEndDate) : null,
                        });
                    }

                    const usersData = data.filter(r => r.type === 'user').map(r => r.data) as User[];
                    if (usersData.length > 0) {
                        setUsers([alaaUser, ...usersData.filter(u => u.username.toLowerCase() !== 'alaa')]);
                    } else {
                        setUsers([alaaUser]);
                    }
                    break;
                case COLLECTIONS.SALES_INVOICES:
                    setAllSalesInvoices(data.map(inv => {
                        let dateValue = inv.date;
                        if (dateValue && typeof dateValue === 'object' && dateValue.seconds !== undefined) {
                            dateValue = new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
                        } else if (dateValue) {
                            dateValue = new Date(dateValue);
                        } else {
                            dateValue = new Date();
                        }
                        return { ...inv, date: isNaN(dateValue.getTime()) ? new Date() : dateValue };
                    }));
                    break;
                case COLLECTIONS.CUSTOMERS:
                    setCustomers(data);
                    break;
                case COLLECTIONS.DELIVERY_NOTES:
                    setDeliveryNotes(data.map(n => ({ ...n, date: new Date(n.date) })));
                    break;
                case COLLECTIONS.BOTTLE_TRANSACTIONS:
                    setBottleTransactions(data.map(t => ({ ...t, date: new Date(t.date) })));
                    break;
                case COLLECTIONS.PO_CUSTOMERS:
                    setPoCustomers(data);
                    break;
            }
        };

        dualStorage.initialize(handleDataUpdate, (message, type) => {
            setNotification({ message, type });
        });
    }, [isAuthReady]);
};
