import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { AppSettings, Branch, Driver, Item, User, Vehicle, DriverWorkLog, DriverMonthlySummary } from '../types';

export const useBasicHandlers = (
    currentUser: User | null,
    setCurrentUser: any,
    setCurrentPage: any,
    setHasShownLoginPOAlert: any,
    setShowLowPOAlert: any,
    setNotification: any,
    drivers: Driver[],
    vehicles: Vehicle[],
    selectedBranchId: string,
    branches: Branch[],
    setSelectedBranchId: any
) => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            setCurrentPage('Dashboard');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleAddUser = (user: User) => {
        dualStorage.save(COLLECTIONS.RECORDS, user.id, { type: 'user', data: user });
        setNotification({ message: 'User added successfully', type: 'success' }, 'User Management');
    };

    const handleUpdateUser = (user: User) => {
        dualStorage.save(COLLECTIONS.RECORDS, user.id, { type: 'user', data: user });
        setNotification({ message: 'User updated successfully', type: 'success' }, 'User Management');
    };

    const handleDeleteUser = (id: string) => {
        dualStorage.delete(COLLECTIONS.RECORDS, id);
        setNotification({ message: 'User deleted successfully', type: 'success' }, 'User Management');
    };

    const handleUpdateSettings = (settings: AppSettings) => {
        dualStorage.save(COLLECTIONS.RECORDS, 'settings', { type: 'settings', data: settings });
        setNotification({ message: 'Settings updated successfully', type: 'success' });
    };

    const handleAddDriver = (driver: Driver) => {
        dualStorage.save(COLLECTIONS.RECORDS, driver.id, { type: 'driver', data: driver });
        setNotification({ message: 'Driver added successfully', type: 'success' });
    };

    const handleUpdateDriver = (driver: Driver) => {
        dualStorage.save(COLLECTIONS.RECORDS, driver.id, { type: 'driver', data: driver });
        setNotification({ message: 'Driver updated successfully', type: 'success' });
    };

    const handleDeleteDriver = (id: string) => {
        dualStorage.delete(COLLECTIONS.RECORDS, id);
        setNotification({ message: 'Driver deleted successfully', type: 'success' });
    };

    const handleAddVehicle = (vehicle: Vehicle) => {
        dualStorage.save(COLLECTIONS.RECORDS, vehicle.id, { type: 'vehicle', data: vehicle });
        setNotification({ message: 'Vehicle added successfully', type: 'success' });
    };

    const handleUpdateVehicle = (vehicle: Vehicle) => {
        dualStorage.save(COLLECTIONS.RECORDS, vehicle.id, { type: 'vehicle', data: vehicle });
        setNotification({ message: 'Vehicle updated successfully', type: 'success' });
    };

    const handleDeleteVehicle = (id: string) => {
        dualStorage.delete(COLLECTIONS.RECORDS, id);
        setNotification({ message: 'Vehicle deleted successfully', type: 'success' });
    };

    const handleSaveDriverWorkLog = (log: DriverWorkLog) => {
        dualStorage.save(COLLECTIONS.RECORDS, log.id, { type: 'driver_work_log', data: log });
        setNotification({ message: 'Work log saved successfully', type: 'success' });
    };

    const handleUpdateDriverWorkLog = (log: DriverWorkLog) => {
        dualStorage.save(COLLECTIONS.RECORDS, log.id, { type: 'driver_work_log', data: log });
        setNotification({ message: 'Work log updated successfully', type: 'success' });
    };

    const handleDeleteDriverWorkLog = (id: string) => {
        dualStorage.delete(COLLECTIONS.RECORDS, id);
        setNotification({ message: 'Work log deleted successfully', type: 'success' });
    };

    const handleUpdateDriverMonthlySummary = (summary: DriverMonthlySummary) => {
        dualStorage.save(COLLECTIONS.RECORDS, summary.id, { type: 'driver_monthly_summary', data: summary });
        setNotification({ message: 'Monthly summary updated successfully', type: 'success' });
    };

    const handleAddItem = (item: Item) => {
        dualStorage.save(COLLECTIONS.RECORDS, item.id, { type: 'item', data: item });
        setNotification({ message: 'Item added successfully', type: 'success' });
    };

    const handleUpdateItem = (item: Item) => {
        dualStorage.save(COLLECTIONS.RECORDS, item.id, { type: 'item', data: item });
        setNotification({ message: 'Item updated successfully', type: 'success' });
    };

    const handleDeleteItem = (id: string) => {
        dualStorage.delete(COLLECTIONS.RECORDS, id);
        setNotification({ message: 'Item deleted successfully', type: 'success' });
    };

    const handleAddBranch = (branch: Branch) => {
        dualStorage.save(COLLECTIONS.RECORDS, branch.id, { type: 'branch', data: branch });
        setNotification({ message: 'Branch added successfully', type: 'success' });
    };

    const handleUpdateBranch = (branch: Branch) => {
        dualStorage.save(COLLECTIONS.RECORDS, branch.id, { type: 'branch', data: branch });
        setNotification({ message: 'Branch updated successfully', type: 'success' });
    };

    const handleDeleteBranch = (id: string) => {
        dualStorage.delete(COLLECTIONS.RECORDS, id);
        setNotification({ message: 'Branch deleted successfully', type: 'success' });
    };

    return {
        handleLogout, handleAddUser, handleUpdateUser, handleDeleteUser,
        handleUpdateSettings, handleAddDriver, handleUpdateDriver, handleDeleteDriver,
        handleAddVehicle, handleUpdateVehicle, handleDeleteVehicle,
        handleSaveDriverWorkLog, handleUpdateDriverWorkLog, handleDeleteDriverWorkLog, handleUpdateDriverMonthlySummary,
        handleAddItem, handleUpdateItem, handleDeleteItem, handleAddBranch, handleUpdateBranch, handleDeleteBranch
    };
};
