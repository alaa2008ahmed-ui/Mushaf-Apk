import React from 'react';
import { COLLECTIONS, dualStorage } from '../DualStorageService';
import { Invoice, Order, InvoiceLog, AppSettings, POCustomer, User, Branch } from '../types';

export const useInvoiceHandlers = (
    currentUser: User | null,
    isAuthReady: boolean,
    allSalesInvoices: Invoice[],
    orders: Order[],
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
    poCustomersWithBalances: (POCustomer & { remainingQuantity: number, remainingTotal: number })[],
    appSettings: AppSettings,
    workingDate: Date,
    selectedBranchId: string,
    setNotification: (msg: any, perm?: keyof User["permissions"]) => void,
    setCurrentPage: (p: string) => void,
    setPrefilledCreditInvoice: (data: any) => void,
    setRecentDeliveredGroup: (orders: Order[]) => void,
    setCashEditInvoice: (inv: Invoice | null) => void,
    setCreditEditInvoice: (inv: Invoice | null) => void
) => {

    const handleCreateInvoiceFromOrder = (group: Order[]) => {
        if (group.length === 0) return;
        
        const mainOrder = group[0];
        const customerName = mainOrder.customerName;
        const item = mainOrder.item;
        
        const totalQty = group.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const totalWithTax = group.reduce((acc, curr) => acc + (curr.totalWithTax || 0), 0);
        const orderIds = group.map(o => o.id);

        setPrefilledCreditInvoice({
            customerName,
            item,
            quantity: totalQty,
            totalWithTax,
            orderIds
        });

        setCurrentPage('Daily Sales');
    };

    const handleAddInvoice = async (invoice: Omit<Invoice, 'id' | 'date' | 'employeeId' | 'branchId' | 'status'>) => {
        if (!selectedBranchId) {
            setNotification({ message: 'Error: No branch selected. Please select a branch first.', type: 'error' });
            return;
        }

        // Validation for PO Balance
        if (invoice.poCustomerId) {
            const poCust = poCustomersWithBalances.find(c => c.id === invoice.poCustomerId);
            if (poCust) {
                if (poCust.quantity > 0 && invoice.quantity > poCust.remainingQuantity) {
                    setNotification({ 
                        message: `Insufficient PO Quantity. Remaining: ${poCust.remainingQuantity}, Requested: ${invoice.quantity}`, 
                        type: 'error' 
                    });
                    return;
                }
                if (poCust.total > 0 && invoice.total > poCust.remainingTotal) {
                    setNotification({ 
                        message: `Insufficient PO Balance. Remaining: ${poCust.remainingTotal.toFixed(2)}, Requested: ${invoice.total.toFixed(2)}`, 
                        type: 'error' 
                    });
                    return;
                }
            } else {
                setNotification({ message: 'Selected PO Customer not found.', type: 'error' });
                return;
            }
        }

        // Registration Restriction
        if (appSettings.restrictRegistration) {
            const start = appSettings.registrationStartDate ? new Date(appSettings.registrationStartDate) : null;
            const end = appSettings.registrationEndDate ? new Date(appSettings.registrationEndDate) : null;
            const current = new Date(workingDate);
            current.setHours(0,0,0,0);
            
            if (start) start.setHours(0,0,0,0);
            if (end) end.setHours(0,0,0,0);

            if ((start && current < start) || (end && current > end)) {
                setNotification({ message: 'Invoice date is outside the allowed registration range.', type: 'error' });
                return;
            }
        }

        if (!isAuthReady) {
            setNotification({ message: 'System is initializing. Please wait.', type: 'error' });
            return;
        }

        const isUnique = !allSalesInvoices.some(inv => 
            inv.invoiceNumber === invoice.invoiceNumber && 
            inv.branchId === selectedBranchId && 
            inv.type === invoice.type
        );
        if (!isUnique) {
            setNotification({ message: `Invoice number ${invoice.invoiceNumber} is already taken. Please use a unique number.`, type: 'error' });
            return;
        }

        const now = new Date();
        const invoiceDate = new Date(workingDate);
        invoiceDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

        const uniqueId = `inv-${selectedBranchId}-${invoice.type}-${invoice.invoiceNumber}`;

        const newInvoice: Invoice = {
            ...invoice,
            id: uniqueId,
            date: invoiceDate,
            status: 'daily',
            branchId: selectedBranchId,
            createdBy: currentUser?.username
        };

        await dualStorage.save(COLLECTIONS.SALES_INVOICES, newInvoice.id, { ...newInvoice, date: newInvoice.date.toISOString() });

        if (invoice.orderIds && invoice.orderIds.length > 0) {
            const deliveredOrders: Order[] = [];
            for (const orderId of invoice.orderIds) {
                const existingOrder = orders.find(o => o.id === orderId);
                if (existingOrder) {
                    const updatedOrder = { ...existingOrder, status: 'delivered' as const };
                    deliveredOrders.push(updatedOrder);
                    await dualStorage.save(COLLECTIONS.RECORDS, orderId, {
                        type: 'order',
                        data: updatedOrder
                    });
                }
            }
            if (deliveredOrders.length > 0) {
                const hasPopupPermission = currentUser?.username?.toLowerCase() === 'alaa' || 
                                           currentUser?.permissions?.showDeliveryConfirmationPopup !== false;
                if (hasPopupPermission) {
                    setRecentDeliveredGroup(deliveredOrders);
                }
            }
            setOrders(prevOrders => 
                prevOrders.map(o => 
                    invoice.orderIds!.includes(o.id) ? { ...o, status: 'delivered' as const } : o
                )
            );
        }

        setNotification(
            { message: `Invoice #${newInvoice.invoiceNumber} Saved`, type: 'add' },
            invoice.type === 'cash' ? 'notifyAddCashInvoice' : 'notifyAddCreditInvoice'
        );
    };

    const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
        const isUnique = !allSalesInvoices.some(inv => 
            inv.invoiceNumber === updatedInvoice.invoiceNumber && 
            inv.branchId === updatedInvoice.branchId &&
            inv.type === updatedInvoice.type &&
            inv.id !== updatedInvoice.id
        );
        if (!isUnique) {
            setNotification({ message: `Invoice number ${updatedInvoice.invoiceNumber} is already used by another invoice.`, type: 'error' });
            return;
        }

        if (updatedInvoice.poCustomerId) {
            const poCust = poCustomersWithBalances.find(c => c.id === updatedInvoice.poCustomerId);
            if (poCust) {
                const currentInvoices = allSalesInvoices.filter(inv => inv.poCustomerId === updatedInvoice.poCustomerId && inv.id !== updatedInvoice.id);
                const usedQty = currentInvoices.reduce((sum, inv) => sum + inv.quantity, 0);
                const usedTotal = currentInvoices.reduce((sum, inv) => sum + inv.total, 0);
                const actualRemainingQty = (poCust.quantity || 0) - usedQty;
                const actualRemainingTotal = (poCust.total || 0) - usedTotal;

                if (poCust.quantity > 0 && updatedInvoice.quantity > actualRemainingQty) {
                    setNotification({ 
                        message: `Insufficient PO Quantity. Remaining: ${actualRemainingQty}, Requested: ${updatedInvoice.quantity}`, 
                        type: 'error' 
                    });
                    return;
                }
                if (poCust.total > 0 && updatedInvoice.total > actualRemainingTotal) {
                    setNotification({ 
                        message: `Insufficient PO Balance. Remaining: ${actualRemainingTotal.toFixed(2)}, Requested: ${updatedInvoice.total.toFixed(2)}`, 
                        type: 'error' 
                    });
                    return;
                }
            }
        }

        if (appSettings.restrictModification) {
            const start = appSettings.modificationStartDate ? new Date(appSettings.modificationStartDate) : null;
            const end = appSettings.modificationEndDate ? new Date(appSettings.modificationEndDate) : null;
            const invDate = new Date(updatedInvoice.date);
            invDate.setHours(0,0,0,0);

            if (start) start.setHours(0,0,0,0);
            if (end) end.setHours(0,0,0,0);

            if (start && end) {
                 if (invDate >= start && invDate <= end) {
                    setNotification({ message: 'Invoice Protected from Edit', type: 'error' });
                    return;
                 }
            } else if (start && invDate >= start && !end) {
                setNotification({ message: 'Invoice Protected from Edit', type: 'error' });
                return;
            } else if (end && invDate <= end && !start) {
                setNotification({ message: 'Invoice Protected from Edit', type: 'error' });
                return;
            }
        }

        const oldInvoice = allSalesInvoices.find(inv => inv.id === updatedInvoice.id);

        if (oldInvoice) {
            const logEntry: InvoiceLog = {
                id: 'log-' + new Date().getTime() + '-' + Math.random().toString(36).substring(7),
                action: 'EDIT',
                invoiceId: updatedInvoice.id,
                invoiceNumber: updatedInvoice.invoiceNumber,
                branchId: updatedInvoice.branchId,
                date: new Date(),
                user: currentUser?.username || 'Unknown',
                previousValues: oldInvoice,
                newValues: updatedInvoice
            };
            await dualStorage.save(COLLECTIONS.RECORDS, logEntry.id, { type: 'invoice_log', data: logEntry });

            const newId = `inv-${updatedInvoice.branchId}-${updatedInvoice.type}-${updatedInvoice.invoiceNumber}`;
            
            if (newId !== updatedInvoice.id) {
                const finalInvoice = { ...updatedInvoice, id: newId };
                await dualStorage.save(COLLECTIONS.SALES_INVOICES, newId, { ...finalInvoice, date: finalInvoice.date.toISOString() });
                await dualStorage.delete(COLLECTIONS.SALES_INVOICES, updatedInvoice.id);
            } else {
                await dualStorage.save(COLLECTIONS.SALES_INVOICES, updatedInvoice.id, { ...updatedInvoice, date: updatedInvoice.date.toISOString() });
            }
        } else {
            await dualStorage.save(COLLECTIONS.SALES_INVOICES, updatedInvoice.id, { ...updatedInvoice, date: updatedInvoice.date.toISOString() });
        }

        if (updatedInvoice.type === 'cash') setCashEditInvoice(null);
        else setCreditEditInvoice(null);

        setNotification(
            { message: `Invoice #${updatedInvoice.invoiceNumber} Updated`, type: 'update' },
            updatedInvoice.type === 'cash' ? 'notifyEditCashInvoice' : 'notifyEditCreditInvoice'
        );
    };

    const handleDeleteInvoice = async (id: string) => {
        const invoiceToDelete = allSalesInvoices.find(inv => inv.id === id);
        
        if (!invoiceToDelete) {
            setNotification({ message: 'Error: Invoice not found in state.', type: 'error' });
            return;
        }

        if (invoiceToDelete && appSettings.restrictModification) {
           const start = appSettings.modificationStartDate ? new Date(appSettings.modificationStartDate) : null;
           const end = appSettings.modificationEndDate ? new Date(appSettings.modificationEndDate) : null;
           const invDate = new Date(invoiceToDelete.date);
           invDate.setHours(0,0,0,0);

           if (start) start.setHours(0,0,0,0);
           if (end) end.setHours(0,0,0,0);

           if (start && end) {
                if (invDate >= start && invDate <= end) {
                   setNotification({ message: 'Invoice Protected from Deletion', type: 'error' });
                   return;
                }
           } else if (start && invDate >= start && !end) {
               setNotification({ message: 'Invoice Protected from Deletion', type: 'error' });
               return;
           } else if (end && invDate <= end && !start) {
               setNotification({ message: 'Invoice Protected from Deletion', type: 'error' });
               return;
           }
        }

        if (invoiceToDelete) {
            const logEntry: InvoiceLog = {
                id: 'log-' + new Date().getTime() + '-' + Math.random().toString(36).substring(7),
                action: 'DELETE',
                invoiceId: invoiceToDelete.id,
                invoiceNumber: invoiceToDelete.invoiceNumber,
                branchId: invoiceToDelete.branchId,
                date: new Date(),
                user: currentUser?.username || 'Unknown',
                previousValues: invoiceToDelete,
                newValues: null
            };
            await dualStorage.save(COLLECTIONS.RECORDS, logEntry.id, { type: 'invoice_log', data: logEntry });
            
            if (invoiceToDelete.orderIds && invoiceToDelete.orderIds.length > 0) {
                for (const orderId of invoiceToDelete.orderIds) {
                    const existingOrder = orders.find(o => o.id === orderId);
                    if (existingOrder) {
                        const revertedOrder = { ...existingOrder, status: 'approved' as const };
                        await dualStorage.save(COLLECTIONS.RECORDS, orderId, {
                            type: 'order',
                            data: revertedOrder
                        });
                        setOrders(prevOrders => 
                            prevOrders.map(o => o.id === orderId ? revertedOrder : o)
                        );
                    }
                }
            }
        }

        await dualStorage.delete(COLLECTIONS.SALES_INVOICES, id);

        setNotification(
            { message: `Invoice #${invoiceToDelete?.invoiceNumber || ''} Deleted`, type: 'delete' },
            invoiceToDelete?.type === 'cash' ? 'notifyDeleteCashInvoice' : 'notifyDeleteCreditInvoice'
        );
    };

    return {
        handleCreateInvoiceFromOrder,
        handleAddInvoice,
        handleUpdateInvoice,
        handleDeleteInvoice
    };
};
