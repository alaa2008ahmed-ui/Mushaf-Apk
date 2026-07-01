import React, { Suspense } from 'react';
import Dashboard from './Dashboard';
import DailySales from './DailySales';
import MonthlyReport from './MonthlyReport';
import AnnualReport from './AnnualReport';
import AccountStatement from './AccountStatement';
import InvoiceTracking from './InvoiceTracking';
import DriverWorkLog from './DriverWorkLog';
import DriverReport from './DriverReport';
import TimeSheet from './TimeSheet';
import Settings from './Settings';
import PO from './PO';
import Customers from './Customers';
import Orders from './Orders';
import OrderApprovals from './OrderApprovals';

export const AppRouter = (props: any) => {
    const {
        currentPage,
        currentUser,
        isMobile,
        appSettings,
        allSalesInvoices,
        branches,
        globalStats,
        filteredBranches,
        selectedBranchId,
        setSelectedBranchId,
        workingDate,
        setWorkingDate,
        items,
        poCustomersWithBalances,
        orders,
        recentDeliveredGroup,
        setRecentDeliveredGroup,
        pendingSyncCount,
        lastSyncTime,
        handleForceSync,
        handleCreateInvoiceFromOrder,
        handleAddInvoice,
        handleUpdateInvoice,
        handleDeleteInvoice,
        setNotification,
        prefilledCreditInvoice,
        setPrefilledCreditInvoice,
        cashEditInvoice,
        setCashEditInvoice,
        creditEditInvoice,
        setCreditEditInvoice,
        postedInvoices,
        annualInvoices,
        users,
        invoiceLogs,
        drivers,
        vehicles,
        sortedActiveCustomers,
        driverWorkLogs,
        handleSaveDriverWorkLog,
        handleUpdateDriverWorkLog,
        handleDeleteDriverWorkLog,
        handleUpdateUser,
        activeCustomers,
        handleUpdateSettings,
        handleAddItem,
        handleUpdateItem,
        handleDeleteItem,
        handleAddBranch,
        handleDeleteBranch,
        handleUpdateBranch,
        handleAddUser,
        handleDeleteUser,
        handleClearInvoices,
        handleRestoreDefaults,
        handleAddDriver,
        handleUpdateDriver,
        handleDeleteDriver,
        handleAddVehicle,
        handleUpdateVehicle,
        handleDeleteVehicle,
        handleAddPOCustomer,
        handleUpdatePOCustomer,
        handleDeletePOCustomer,
        handleAddCustomer,
        sortedCustomers,
        handleUpdateCustomer,
        handleDeleteCustomer,
        setCurrentPage,
    } = props;

    if (!currentUser) return null;

    const isHiddenOnMobile = isMobile && currentUser.username.toLowerCase() !== 'alaa' && (appSettings?.mobileHiddenPages || []).includes(currentPage);

    if (!currentUser.permissions.allowedPages.includes(currentPage) || isHiddenOnMobile) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mt-6 bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                    <p className="text-gray-500 mt-2">You do not have permission to view the {currentPage} page on this device.</p>
                </div>
            </div>
        );
    }

    switch (currentPage) {
        case 'Dashboard':
            return (
                <div className="px-2 sm:px-6 lg:px-8 pb-8 pt-0">
                    <Dashboard invoices={allSalesInvoices} branches={branches} globalStats={globalStats} />
                </div>
            );
        case 'Daily Sales':
            return (
                <DailySales
                    currentUser={currentUser}
                    branches={branches}
                    filteredBranches={filteredBranches}
                    selectedBranchId={selectedBranchId}
                    setSelectedBranchId={setSelectedBranchId}
                    workingDate={workingDate}
                    setWorkingDate={setWorkingDate}
                    allSalesInvoices={allSalesInvoices}
                    items={items}
                    poCustomersWithBalances={poCustomersWithBalances as any}
                    appSettings={appSettings}
                    orders={orders}
                    recentDeliveredGroup={recentDeliveredGroup}
                    setRecentDeliveredGroup={setRecentDeliveredGroup}
                    pendingSyncCount={pendingSyncCount}
                    lastSyncTime={lastSyncTime}
                    handleForceSync={handleForceSync}
                    handleCreateInvoiceFromOrder={handleCreateInvoiceFromOrder}
                    handleAddInvoice={handleAddInvoice}
                    handleUpdateInvoice={handleUpdateInvoice}
                    handleDeleteInvoice={handleDeleteInvoice}
                    setNotification={setNotification}
                    prefilledCreditInvoice={prefilledCreditInvoice}
                    setPrefilledCreditInvoice={setPrefilledCreditInvoice}
                    cashEditInvoice={cashEditInvoice}
                    setCashEditInvoice={setCashEditInvoice}
                    creditEditInvoice={creditEditInvoice}
                    setCreditEditInvoice={setCreditEditInvoice}
                />
            );
        case 'Monthly Sales':
            return (
                <MonthlyReport 
                    invoices={postedInvoices} 
                    items={items.filter((i: any) => i.id !== 'cancel')} 
                    branches={filteredBranches}
                    selectedBranchId={selectedBranchId}
                />
            );
        case 'Annual Sales':
            return (
                <AnnualReport 
                    invoices={annualInvoices} 
                    items={items.filter((i: any) => i.id !== 'cancel')} 
                    branches={filteredBranches}
                    selectedBranchId={selectedBranchId}
                />
            );
        case 'Account Statement':
            return (
                        <AccountStatement 
                            invoices={allSalesInvoices}
                            items={items.filter((i: any) => i.id !== 'cancel')}
                            branches={filteredBranches}
                            selectedBranchId={selectedBranchId}
                            currentUserName={currentUser.username}
                            users={users}
                            poCustomers={poCustomersWithBalances as any}
                        />
            );
        case 'Invoices Tracking':
            return (
                <InvoiceTracking 
                    logs={invoiceLogs}
                    branches={branches}
                    currentUserName={currentUser.username}
                    selectedBranchId={selectedBranchId}
                    pendingCount={pendingSyncCount}
                    lastSyncTime={lastSyncTime}
                    onRefresh={handleForceSync}
                />
            );
        case 'Driver Work Log':
            return (
                <DriverWorkLog 
                    drivers={drivers}
                    vehicles={vehicles}
                    customers={sortedActiveCustomers}
                    logs={driverWorkLogs.filter((l: any) => l.branchId === selectedBranchId)}
                    onSave={handleSaveDriverWorkLog}
                    onUpdate={handleUpdateDriverWorkLog}
                    onDelete={handleDeleteDriverWorkLog}
                    canEdit={currentUser.permissions.canEditDriverLog}
                    canDelete={currentUser.permissions.canDeleteDriverLog}
                />
            );
        case 'Drivers Timesheet':
            return (
                <DriverReport 
                    drivers={drivers}
                    workLogs={driverWorkLogs}
                    canEdit={currentUser.permissions.canEditDriverLog}
                    selectedBranchId={selectedBranchId}
                />
            );
        case 'Time Sheet':
            return (
                <TimeSheet 
                    drivers={drivers}
                    workLogs={driverWorkLogs}
                    selectedBranchId={selectedBranchId}
                    users={users}
                    currentUser={currentUser}
                    onUpdateUser={handleUpdateUser}
                    isMobile={isMobile}
                />
            );
        case 'Settings':
             return (
                <Settings 
                    customers={activeCustomers}
                    items={items} 
                    branches={branches}
                    users={users}
                    settings={appSettings}
                    onUpdateSettings={handleUpdateSettings}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                    onAddBranch={handleAddBranch}
                    onDeleteBranch={handleDeleteBranch}
                    onUpdateBranch={handleUpdateBranch}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onClearInvoices={handleClearInvoices}
                    onRestoreDefaults={handleRestoreDefaults}
                    drivers={drivers}
                    vehicles={vehicles}
                    onAddDriver={handleAddDriver}
                    onUpdateDriver={handleUpdateDriver}
                    onDeleteDriver={handleDeleteDriver}
                    onAddVehicle={handleAddVehicle}
                    onUpdateVehicle={handleUpdateVehicle}
                    onDeleteVehicle={handleDeleteVehicle}
                    canManageDrivers={currentUser.permissions.manageDrivers}
                    canManageVehicles={currentUser.permissions.manageVehicles}
                    currentUser={currentUser}
                    allSalesInvoices={allSalesInvoices}
                />
             );
        case 'PO':
             return (
                <PO 
                    poCustomers={poCustomersWithBalances as any} 
                    customers={activeCustomers} 
                    items={items} 
                    invoices={allSalesInvoices} 
                    onAddPOCustomer={handleAddPOCustomer} 
                    onUpdatePOCustomer={handleUpdatePOCustomer} 
                    onDeletePOCustomer={handleDeletePOCustomer} 
                    onAddCustomer={handleAddCustomer}
                    currentUser={currentUser} 
                    onSwitchPage={setCurrentPage} 
                    onNotification={(msg: string, type: any) => setNotification({ message: msg, type })}
                />
             );
        case 'Customers':
            return <Customers customers={sortedCustomers} onAdd={handleAddCustomer} onUpdate={handleUpdateCustomer} onDelete={handleDeleteCustomer} currentUser={currentUser} />;
        case 'Orders':
            return <Orders orders={orders} setNotification={setNotification} customers={activeCustomers} items={items} currentUser={currentUser} directOrderFlow={appSettings?.directOrderFlow} />;
        case 'Order Approvals':
            return <OrderApprovals orders={orders} setNotification={setNotification} currentUser={currentUser} />;
        default:
            return (
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-700">Page not available</h2>
                        <p className="text-gray-500 mt-2">{currentPage} is under construction.</p>
                    </div>
                </div>
            );
    }
};
