import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { AppSettings, Branch } from '../types';
import { mockItems, mockBranches } from '../constants';

export const useSettingsHandlers = (
    appSettings: AppSettings, 
    handleUpdateSettings: any, 
    branches: Branch[], 
    setNotification: any
) => {
    const handleClearInvoices = async () => {
        try {
            await dualStorage.clearCollection(COLLECTIONS.SALES_INVOICES);
            // Optionally clear delivery notes and PO customers depending on requirements
            setNotification({ message: 'All invoices cleared successfully', type: 'success' }, 'Settings');
        } catch (error) {
            console.error('Error clearing invoices:', error);
            setNotification({ message: 'Failed to clear invoices', type: 'error' }, 'Settings');
        }
    };

    const handleRestoreDefaults = () => {
        // Just as an example, restoring default settings
        const defaultSettings: AppSettings = {
            restrictRegistration: false,
            registrationStartDate: null,
            registrationEndDate: null,
            restrictModification: false,
            modificationStartDate: null,
            modificationEndDate: null,
            nextInvoiceNumbers: {}
        };
        handleUpdateSettings(defaultSettings);
        setNotification({ message: 'Defaults restored successfully', type: 'success' }, 'Settings');
    };

    return {
        handleClearInvoices,
        handleRestoreDefaults
    };
};
