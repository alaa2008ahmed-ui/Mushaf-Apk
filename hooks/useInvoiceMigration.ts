import React, { useEffect } from 'react';
import { COLLECTIONS, dualStorage } from '../DualStorageService';
import { Invoice, User, Branch } from '../types';

export const useInvoiceMigration = (
    isAuthReady: boolean,
    allSalesInvoices: Invoice[],
    setAllSalesInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>,
    users: User[],
    branches: Branch[],
    setNotification: (msg: any) => void
) => {
    // Migration logic for old localStorage keys
    useEffect(() => {
        const migrateInvoices = async () => {
            const fsData = dualStorage.getLocalData(COLLECTIONS.SALES_INVOICES);
            if (fsData && fsData.length > 0) {
                setAllSalesInvoices(fsData.map((inv: any) => {
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
                return;
            }

            console.log("App: No FS data found, checking for old storage to migrate...");
            const oldCash = localStorage.getItem('cashInvoices');
            const oldCredit = localStorage.getItem('creditInvoices');
            const oldPosted = localStorage.getItem('postedInvoices');
            const oldAnnual = localStorage.getItem('annualInvoices');
            
            if (!oldCash && !oldCredit && !oldPosted && !oldAnnual) {
                console.log("App: No old storage found to migrate.");
                return;
            }

            let migrated: Invoice[] = [];
            if (oldCash) migrated = [...migrated, ...JSON.parse(oldCash).map((i:any) => ({...i, id: i.id || `cash-m-${Date.now()}-${Math.random()}`, status: 'daily' as const, type: 'cash' as const}))];
            if (oldCredit) migrated = [...migrated, ...JSON.parse(oldCredit).map((i:any) => ({...i, id: i.id || `credit-m-${Date.now()}-${Math.random()}`, status: 'daily' as const, type: 'credit' as const}))];
            if (oldPosted) migrated = [...migrated, ...JSON.parse(oldPosted).map((i:any) => ({...i, id: i.id || `posted-m-${Date.now()}-${Math.random()}`, status: 'monthly' as const}))];
            if (oldAnnual) migrated = [...migrated, ...JSON.parse(oldAnnual).map((i:any) => ({...i, id: i.id || `annual-m-${Date.now()}-${Math.random()}`, status: 'annual' as const}))];
            
            if (migrated.length > 0) {
                console.log(`App: Migrating ${migrated.length} invoices to DualStorage...`);
                for (const inv of migrated) {
                    dualStorage.save(COLLECTIONS.SALES_INVOICES, inv.id, inv);
                }
                setAllSalesInvoices(migrated.map(inv => ({ ...inv, date: new Date(inv.date) })));
                
                localStorage.removeItem('cashInvoices');
                localStorage.removeItem('creditInvoices');
                localStorage.removeItem('postedInvoices');
                localStorage.removeItem('annualInvoices');
                console.log("App: Migration complete, old storage cleared.");
            }
        };

        if (isAuthReady) {
            migrateInvoices();
        }
    }, [isAuthReady, setAllSalesInvoices]);
    
    // Auto-correction for branch assignments
    useEffect(() => {
        if (!isAuthReady || allSalesInvoices.length === 0 || users.length === 0 || branches.length === 0) return;

        let requiresUpdate = false;
        
        const correctedInvoices = allSalesInvoices.map(inv => {
            let correctBranchId = inv.branchId;
            let needsFix = false;

            const creator = inv.createdBy ? users.find(u => u.username.trim().toLowerCase() === inv.createdBy?.trim().toLowerCase()) : null;
            
            if (creator) {
                const allowed = creator.permissions.allowedBranches;
                if (allowed.length === 1 && allowed[0] !== 'all') {
                    if (inv.branchId !== allowed[0]) {
                        correctBranchId = allowed[0];
                        needsFix = true;
                    }
                } else if (!inv.branchId) {
                    if (creator.username.toLowerCase().includes('dammam')) correctBranchId = 'b1';
                    else if (creator.username.toLowerCase().includes('hasa')) correctBranchId = 'b2';
                    else correctBranchId = 'b3';
                    needsFix = true;
                }
            } else if (!inv.branchId) {
                correctBranchId = 'b3';
                needsFix = true;
            }

            if (needsFix && correctBranchId) {
                const correctBranchName = branches.find(b => b.id === correctBranchId)?.name;
                requiresUpdate = true;
                return {
                    ...inv,
                    branchId: correctBranchId,
                    branchName: correctBranchName || inv.branchName
                };
            }
            return inv;
        });

        if (requiresUpdate) {
            console.log("Auto-correcting invoice branch assignments...");
            setAllSalesInvoices(correctedInvoices);
            correctedInvoices.forEach(inv => {
                const original = allSalesInvoices.find(o => o.id === inv.id);
                if (original && original.branchId !== inv.branchId) {
                    dualStorage.save(COLLECTIONS.SALES_INVOICES, inv.id, { ...inv, date: new Date(inv.date).toISOString() });
                }
            });
            setTimeout(() => {
                setNotification({ message: 'Auto-corrected invoice branch data based on user permissions.', type: 'info' });
            }, 1000);
        }
    }, [isAuthReady, allSalesInvoices, users, branches, setAllSalesInvoices, setNotification]);
};
