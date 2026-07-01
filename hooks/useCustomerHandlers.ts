import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { Customer, POCustomer } from '../types';

export const useCustomerHandlers = (setNotification: any) => {
    const handleAddPOCustomer = (customer: POCustomer) => {
        dualStorage.save(COLLECTIONS.PO_CUSTOMERS, customer.id, customer);
        setNotification({ message: 'PO Customer added successfully', type: 'success' });
    };

    const handleUpdatePOCustomer = (customer: POCustomer) => {
        dualStorage.save(COLLECTIONS.PO_CUSTOMERS, customer.id, customer);
        setNotification({ message: 'PO Customer updated successfully', type: 'success' });
    };

    const handleDeletePOCustomer = (id: string) => {
        dualStorage.delete(COLLECTIONS.PO_CUSTOMERS, id);
        setNotification({ message: 'PO Customer deleted successfully', type: 'success' });
    };

    const handleAddCustomer = (customer: Customer) => {
        dualStorage.save(COLLECTIONS.CUSTOMERS, customer.id, customer);
        setNotification({ message: 'Customer added successfully', type: 'success' });
    };

    const handleUpdateCustomer = (customer: Customer) => {
        dualStorage.save(COLLECTIONS.CUSTOMERS, customer.id, customer);
        setNotification({ message: 'Customer updated successfully', type: 'success' });
    };

    const handleDeleteCustomer = (id: string) => {
        dualStorage.delete(COLLECTIONS.CUSTOMERS, id);
        setNotification({ message: 'Customer deleted successfully', type: 'success' });
    };

    return {
        handleAddPOCustomer,
        handleUpdatePOCustomer,
        handleDeletePOCustomer,
        handleAddCustomer,
        handleUpdateCustomer,
        handleDeleteCustomer
    };
};
