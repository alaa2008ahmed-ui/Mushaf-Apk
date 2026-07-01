import React, { useMemo } from 'react';
import Header from './Header';
import FilterBar from './FilterBar';
import TotalSummary from './TotalSummary';
import InvoiceForm from './InvoiceForm';
import InvoiceList from './InvoiceList';
import { captureAndExport, printOrDownloadPdf } from '../captureUtils';
import { downloadBlob } from '../downloadUtils';
import { Invoice, Branch, User, Item, POCustomer, AppSettings, Order } from '../types';

interface DailySalesProps {
    currentUser: User;
    branches: Branch[];
    filteredBranches: Branch[];
    selectedBranchId: string;
    setSelectedBranchId: (id: string) => void;
    workingDate: Date;
    setWorkingDate: (d: Date) => void;
    allSalesInvoices: Invoice[];
    items: Item[];
    poCustomersWithBalances: POCustomer[];
    appSettings: AppSettings;
    orders: Order[];
    recentDeliveredGroup: Order[] | null;
    setRecentDeliveredGroup: (group: Order[] | null) => void;
    pendingSyncCount: number;
    lastSyncTime: number;
    handleForceSync: () => void;
    handleCreateInvoiceFromOrder: (group: Order[]) => void;
    handleAddInvoice: (invoice: Omit<Invoice, 'id' | 'date' | 'employeeId' | 'branchId' | 'status'>) => Promise<void>;
    handleUpdateInvoice: (updatedInvoice: Invoice) => Promise<void>;
    handleDeleteInvoice: (id: string) => Promise<void>;
    setNotification: (notif: { message: string, type: 'success' | 'error' | 'info' | 'add' | 'update' | 'delete' | 'warning' } | null) => void;
    prefilledCreditInvoice: { items: { itemId: string, quantity: number, price: number }[], relatedOrderIds: string[], targetCustomerId: string } | null;
    setPrefilledCreditInvoice: (data: null) => void;
    cashEditInvoice: Invoice | null;
    setCashEditInvoice: (inv: Invoice | null) => void;
    creditEditInvoice: Invoice | null;
    setCreditEditInvoice: (inv: Invoice | null) => void;
}

const DailySales: React.FC<DailySalesProps> = ({
    currentUser,
    branches,
    filteredBranches,
    selectedBranchId,
    setSelectedBranchId,
    workingDate,
    setWorkingDate,
    allSalesInvoices,
    items,
    poCustomersWithBalances,
    appSettings,
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
    setCreditEditInvoice
}) => {

    const cashInvoices = useMemo(() => allSalesInvoices.filter(inv => inv.type === 'cash'), [allSalesInvoices]);
    const creditInvoices = useMemo(() => allSalesInvoices.filter(inv => inv.type === 'credit'), [allSalesInvoices]);

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const branchCashInvoices = useMemo(() => {
        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        return cashInvoices.filter(inv => 
            (inv.branchId === selectedBranchId || (selectedBranch && inv.branchName === selectedBranch.name) || !inv.branchId) && 
            isSameDay(new Date(inv.date), workingDate)
        ).sort((a,b) => a.invoiceNumber - b.invoiceNumber);
    }, [cashInvoices, selectedBranchId, workingDate, branches]);

    const branchCreditInvoices = useMemo(() => {
        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        return creditInvoices.filter(inv => 
            (inv.branchId === selectedBranchId || (selectedBranch && inv.branchName === selectedBranch.name) || !inv.branchId) && 
            isSameDay(new Date(inv.date), workingDate)
        ).sort((a,b) => a.invoiceNumber - b.invoiceNumber);
    }, [creditInvoices, selectedBranchId, workingDate, branches]);

    const totalCash = useMemo(() => branchCashInvoices.reduce((sum, inv) => sum + inv.total, 0), [branchCashInvoices]);
    const totalCredit = useMemo(() => branchCreditInvoices.reduce((sum, inv) => sum + inv.total, 0), [branchCreditInvoices]);
    const totalDaySales = useMemo(() => totalCash + totalCredit, [totalCash, totalCredit]);
    const allInvoices = useMemo(() => [...branchCashInvoices, ...branchCreditInvoices].sort((a,b) => a.date.getTime() - b.date.getTime()), [branchCashInvoices, branchCreditInvoices]);

    const combinedSummaryData = useMemo(() => {
        const summaryData = allInvoices.reduce((acc, invoice) => {
            const { itemName, quantity, total } = invoice;
            if (itemName === 'Cancel') return acc;
            if (!acc[itemName]) {
                acc[itemName] = { totalQuantity: 0, grandTotal: 0 };
            }
            acc[itemName].totalQuantity += quantity;
            acc[itemName].grandTotal += total;
            return acc;
        }, {} as { [itemName: string]: { totalQuantity: number; grandTotal: number; } });
        return Object.keys(summaryData).map((name) => ({
                name,
                totalQuantity: summaryData[name].totalQuantity,
                grandTotal: summaryData[name].grandTotal,
        }));
    }, [allInvoices]);

    const getNextInvoiceNumber = (branchId: string, type: 'cash' | 'credit') => {
        const selectedBranch = branches.find(b => b.id === branchId);
        const branchInvoices = allSalesInvoices.filter(inv => {
            return (inv.branchId === branchId || (selectedBranch && inv.branchName === selectedBranch.name)) && inv.type === type;
        });

        if (branchInvoices.length === 0) return 1;

        const getLocalDateStr = (d: any) => {
            const date = new Date(d);
            if (isNaN(date.getTime())) return '';
            return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        };
        const todayStr = getLocalDateStr(new Date());

        const todayInvoices = branchInvoices.filter(inv => getLocalDateStr(inv.date) === todayStr);

        if (todayInvoices.length > 0) {
            const maxToday = Math.max(...todayInvoices.map(inv => Number(inv.invoiceNumber)).filter(num => !isNaN(num)), 0);
            return maxToday + 1;
        }

        const sortedInvoices = [...branchInvoices].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        const mostRecentInvoice = sortedInvoices[0];
        const lastNumber = Number(mostRecentInvoice.invoiceNumber);

        return !isNaN(lastNumber) && lastNumber > 0 ? lastNumber + 1 : 1;
    };

    const checkUniqueCashNumber = (num: number, excludeId?: string) => {
        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        return !allSalesInvoices.some(inv => 
            inv.invoiceNumber === num && 
            inv.type === 'cash' &&
            (inv.branchId === selectedBranchId || (selectedBranch && inv.branchName === selectedBranch.name)) &&
            inv.id !== excludeId
        );
    };

    const checkUniqueCreditNumber = (num: number, excludeId?: string) => {
        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        return !allSalesInvoices.some(inv => 
            inv.invoiceNumber === num && 
            inv.type === 'credit' &&
            (inv.branchId === selectedBranchId || (selectedBranch && inv.branchName === selectedBranch.name)) &&
            inv.id !== excludeId
        );
    };

    const handlePrintDaily = () => {
        captureAndExport('printable-area-daily', (canvas) => {
            const branchName = branches.find(b => b.id === selectedBranchId)?.name || 'Main_Branch';
            const filename = `daily-sales-${branchName.replace(/\s+/g, '_')}-${workingDate.toLocaleDateString('en-GB').replace(/\//g, '-')}`;
            printOrDownloadPdf(canvas, filename, 'p');
        });
    };
    
    const handleExportExcelDaily = async () => {
        const ExcelJS = (window as any).ExcelJS;
        if (!ExcelJS) { console.error("ExcelJS library is not loaded."); return; }
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Daily Sales Report', { views: [{ rightToLeft: false }] });
        const employeeName = currentUser?.username || 'N/A';
        const branchName = branches.find(b => b.id === selectedBranchId)?.name || 'Main Branch';
        const date = workingDate.toLocaleDateString('en-GB');
        const totalSummaryFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7FAFC' } };
        const combinedSummaryFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
        const cashSectionFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF4FF' } };
        const creditSectionFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FFF4' } };
        const cashHeaderFont = { bold: true, color: { argb: 'FF2C5282' } };
        const creditHeaderFont = { bold: true, color: { argb: 'FF276749' } };
        const sectionTitleFont = { bold: true };
        const invoiceHeaderFont = { bold: true, color: { argb: 'FFFFFFFF' }};
        const cashInvoiceHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3182CE' } };
        const creditInvoiceHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF38A169' } };
        const totalRowFont = { bold: true };
        const totalCashFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBEE3F8' } };
        const totalCreditFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6F6D5' } };
        sheet.mergeCells('A1:J2');
        const headerCell = sheet.getCell('A1');
        headerCell.value = 'Daily Sales Report\nSweet Water Company LTD';
        headerCell.font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
        headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF276749' } };
        headerCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        sheet.getRow(1).height = 25; sheet.getRow(2).height = 25;
        sheet.mergeCells('A3:J3');
        const userInfoCell = sheet.getCell('A3');
        userInfoCell.value = `Branch: ${branchName}`;
        userInfoCell.font = { size: 10, color: { argb: 'FFFFFFFF' }, bold: true };
        userInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F855A' } };
        userInfoCell.alignment = { vertical: 'middle', horizontal: 'left' };
        sheet.getRow(3).height = 20;
        sheet.addRow([]);
        let currentRow = 5;
        sheet.getCell(`A${currentRow}`).value = 'Date:';
        sheet.getCell(`A${currentRow}`).font = { bold: true };
        sheet.getCell(`B${currentRow}`).value = date;
        currentRow++;
        sheet.getCell(`A${currentRow}`).value = 'Employee:';
        sheet.getCell(`A${currentRow}`).font = { bold: true };
        sheet.getCell(`B${currentRow}`).value = employeeName;
        currentRow += 2;
        
        const cashColStart = 1;
        const cashWidth = 6;
        const gap = 1;
        const creditColStart = cashColStart + cashWidth + gap;
        const creditWidth = 6;
        
        const summaryStartRow = currentRow;
        sheet.mergeCells(`A${summaryStartRow}:C${summaryStartRow}`);
        const totalSummaryTitle = sheet.getCell(`A${summaryStartRow}`);
        totalSummaryTitle.value = 'Total Summary';
        totalSummaryTitle.font = sectionTitleFont;
        totalSummaryTitle.fill = totalSummaryFill;
        const summaryHeaders = sheet.getRow(summaryStartRow + 1);
        summaryHeaders.getCell(1).value = 'Total Cash';
        summaryHeaders.getCell(2).value = 'Total Credit';
        summaryHeaders.getCell(3).value = 'Total Day Sales';
        summaryHeaders.eachCell(c => { c.style = { font: sectionTitleFont, fill: totalSummaryFill }; });
        const summaryDataRow = sheet.getRow(summaryStartRow + 2);
        summaryDataRow.getCell(1).value = totalCash;
        summaryDataRow.getCell(1).numFmt = '#,##0.00';
        summaryDataRow.getCell(2).value = totalCredit;
        summaryDataRow.getCell(2).numFmt = '#,##0.00';
        summaryDataRow.getCell(3).value = totalDaySales;
        summaryDataRow.getCell(3).numFmt = '#,##0.00';
        summaryDataRow.eachCell(c => { c.fill = totalSummaryFill; });
        
        if (combinedSummaryData.length > 0) {
            const combinedSummaryStartCol = creditColStart;
            sheet.mergeCells(summaryStartRow, combinedSummaryStartCol, summaryStartRow, combinedSummaryStartCol + 2);
            const combinedSummaryTitle = sheet.getCell(summaryStartRow, combinedSummaryStartCol);
            combinedSummaryTitle.value = 'Combined Summary by Item';
            combinedSummaryTitle.font = sectionTitleFont;
            combinedSummaryTitle.fill = combinedSummaryFill;
            const combinedHeaders = sheet.getRow(summaryStartRow + 1);
            combinedHeaders.getCell(combinedSummaryStartCol).value = 'Item';
            combinedHeaders.getCell(combinedSummaryStartCol + 1).value = 'Total Quantity';
            combinedHeaders.getCell(combinedSummaryStartCol + 2).value = 'Grand Total';
            [combinedSummaryStartCol, combinedSummaryStartCol + 1, combinedSummaryStartCol + 2].forEach(colIdx => {
                combinedHeaders.getCell(colIdx).style = { font: sectionTitleFont, fill: combinedSummaryFill };
            });
            combinedSummaryData.forEach((item, index) => {
                const row = sheet.getRow(summaryStartRow + 2 + index);
                row.getCell(combinedSummaryStartCol).value = item.name;
                row.getCell(combinedSummaryStartCol + 1).value = item.totalQuantity;
                row.getCell(combinedSummaryStartCol + 2).value = item.grandTotal;
                row.getCell(combinedSummaryStartCol + 2).numFmt = '#,##0.00';
                [combinedSummaryStartCol, combinedSummaryStartCol + 1, combinedSummaryStartCol + 2].forEach(colIdx => {
                    row.getCell(colIdx).fill = combinedSummaryFill;
                });
            });
        }
        
        currentRow += Math.max(3, combinedSummaryData.length + 2) + 1;
        const invoiceStartRow = currentRow;
        
        sheet.mergeCells(invoiceStartRow, cashColStart, invoiceStartRow, cashColStart + cashWidth - 1);
        const cashTitleCell = sheet.getCell(invoiceStartRow, cashColStart);
        cashTitleCell.value = 'Registered Cash Invoices';
        cashTitleCell.style = { font: cashHeaderFont, fill: cashSectionFill, alignment: { horizontal: 'center' } };
        
        sheet.mergeCells(invoiceStartRow, creditColStart, invoiceStartRow, creditColStart + creditWidth - 1);
        const creditTitleCell = sheet.getCell(invoiceStartRow, creditColStart);
        creditTitleCell.value = 'Registered Credit Invoices';
        creditTitleCell.style = { font: creditHeaderFont, fill: creditSectionFill, alignment: { horizontal: 'center' } };
        
        const subheaderRow = sheet.getRow(invoiceStartRow + 1);
        const invoiceHeaders = ['No.', 'Time', 'Employee', 'Item', 'Qty', 'Total'];
        
        invoiceHeaders.forEach((header, i) => {
            const cashCell = subheaderRow.getCell(cashColStart + i);
            cashCell.value = header;
            cashCell.style = { font: invoiceHeaderFont, fill: cashInvoiceHeaderFill };
            const creditCell = subheaderRow.getCell(creditColStart + i);
            creditCell.value = header;
            creditCell.style = { font: invoiceHeaderFont, fill: creditInvoiceHeaderFill };
        });
        
        const maxInvoices = Math.max(branchCashInvoices.length, branchCreditInvoices.length);
        const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        for (let i = 0; i < maxInvoices; i++) {
            const dataRow = sheet.getRow(invoiceStartRow + 2 + i);
            if (i < branchCashInvoices.length) {
                const inv = branchCashInvoices[i];
                dataRow.getCell(cashColStart).value = inv.invoiceNumber;
                dataRow.getCell(cashColStart + 1).value = formatTime(inv.date);
                dataRow.getCell(cashColStart + 2).value = inv.createdBy || 'Unknown';
                dataRow.getCell(cashColStart + 3).value = inv.itemName;
                dataRow.getCell(cashColStart + 4).value = inv.quantity;
                dataRow.getCell(cashColStart + 5).value = inv.total;
                dataRow.getCell(cashColStart + 5).numFmt = '#,##0.00';
                for(let j=0; j<cashWidth; j++) dataRow.getCell(cashColStart + j).fill = cashSectionFill;
            }
            if (i < branchCreditInvoices.length) {
                const inv = branchCreditInvoices[i];
                dataRow.getCell(creditColStart).value = inv.invoiceNumber;
                dataRow.getCell(creditColStart + 1).value = formatTime(inv.date);
                dataRow.getCell(creditColStart + 2).value = inv.createdBy || 'Unknown';
                dataRow.getCell(creditColStart + 3).value = inv.itemName;
                dataRow.getCell(creditColStart + 4).value = inv.quantity;
                dataRow.getCell(creditColStart + 5).value = inv.total;
                dataRow.getCell(creditColStart + 5).numFmt = '#,##0.00';
                for(let j=0; j<creditWidth; j++) dataRow.getCell(creditColStart + j).fill = creditSectionFill;
            }
        }
        
        const totalCashQty = branchCashInvoices.reduce((sum, inv) => sum + inv.quantity, 0);
        const totalCreditQty = branchCreditInvoices.reduce((sum, inv) => sum + inv.quantity, 0);
        
        if (branchCashInvoices.length > 0) {
            const totalRow = sheet.getRow(invoiceStartRow + 2 + branchCashInvoices.length);
            const labelCell = totalRow.getCell(cashColStart);
            labelCell.value = 'Total Cash';
            sheet.mergeCells(totalRow.getCell(cashColStart).address, totalRow.getCell(cashColStart + 3).address);
            
            totalRow.getCell(cashColStart + 4).value = totalCashQty;
            totalRow.getCell(cashColStart + 5).value = totalCash;
            totalRow.getCell(cashColStart + 5).numFmt = '#,##0.00';
            
            for(let j=0; j<cashWidth; j++) {
                const cell = totalRow.getCell(cashColStart + j);
                cell.font = totalRowFont;
                cell.fill = totalCashFill;
            }
        }
        
        if (branchCreditInvoices.length > 0) {
            const totalRow = sheet.getRow(invoiceStartRow + 2 + branchCreditInvoices.length);
            const labelCell = totalRow.getCell(creditColStart);
            labelCell.value = 'Total Credit';
            sheet.mergeCells(totalRow.getCell(creditColStart).address, totalRow.getCell(creditColStart + 3).address);
            
            totalRow.getCell(creditColStart + 4).value = totalCreditQty;
            totalRow.getCell(creditColStart + 5).value = totalCredit;
            totalRow.getCell(creditColStart + 5).numFmt = '#,##0.00';
            
            for(let j=0; j<creditWidth; j++) {
                const cell = totalRow.getCell(creditColStart + j);
                cell.font = totalRowFont;
                cell.fill = totalCreditFill;
            }
        }
        
        sheet.getColumn(cashColStart).width = 8;
        sheet.getColumn(cashColStart + 1).width = 10;
        sheet.getColumn(cashColStart + 2).width = 20;
        sheet.getColumn(cashColStart + 3).width = 15;
        sheet.getColumn(cashColStart + 4).width = 8;
        sheet.getColumn(cashColStart + 5).width = 12;
        
        sheet.getColumn(creditColStart).width = 8;
        sheet.getColumn(creditColStart + 1).width = 10;
        sheet.getColumn(creditColStart + 2).width = 20;
        sheet.getColumn(creditColStart + 3).width = 15;
        sheet.getColumn(creditColStart + 4).width = 8;
        sheet.getColumn(creditColStart + 5).width = 12;
        
        workbook.xlsx.writeBuffer().then(async buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const safeDate = date.replace(/\//g, '-');
            const filename = `daily-sales-report-${safeDate}.xlsx`;
            
            await downloadBlob(blob, filename, {
                description: 'Excel File',
                accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
            });
        });
    };
    
    const handleExportPdfDaily = () => captureAndExport('printable-area-daily', async (canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = (window as any).jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(), pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        let width = pdfWidth, height = width / ratio;
        if (height > pdfHeight) { height = pdfHeight; width = height * ratio; }
        const xOffset = (pdfWidth - width) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, width, height);

        const filename = `daily-sales-report-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
        const blob = pdf.output('blob');

        await downloadBlob(blob, filename, {
            description: 'PDF File',
            accept: { 'application/pdf': ['.pdf'] },
        });
    });

    return (
        <div id="printable-area-daily">
            <div className="print-only" style={{ height: '20px' }}></div>
            <div className="print-only px-4 sm:px-6 lg:px-8">
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
                    currentPage={'Daily Sales'}
                    onCreateInvoice={handleCreateInvoiceFromOrder}
                    deliveredGroupProps={recentDeliveredGroup}
                    onCloseDeliveredGroup={() => setRecentDeliveredGroup(null)}
                />
            </div>
            <div className="px-2 sm:px-6 lg:px-8 pb-8 pt-2">
                <FilterBar 
                    invoiceCount={allInvoices.length}
                    onPrint={handlePrintDaily}
                    onExportExcel={handleExportExcelDaily}
                    onExportPdf={handleExportPdfDaily}
                    workingDate={workingDate}
                    onDateChange={setWorkingDate}
                />
                <div className="mt-3 sm:mt-8 space-y-3 sm:space-y-8">
                    <TotalSummary 
                        totalCash={totalCash} 
                        totalCredit={totalCredit} 
                        totalDaySales={totalDaySales} 
                        branchName={branches.find(b => b.id === selectedBranchId)?.name || 'Main Branch'}
                        isMainBranch={selectedBranchId === 'b3' || (branches.find(b => b.id === selectedBranchId)?.name || 'Main Branch').toLowerCase().includes('main')}
                        approvedOrders={orders.filter(o => o.status === 'approved')}
                    />
                </div>

                <div className="mt-3 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 items-start no-print">
                    <InvoiceForm 
                        key={`cash-${selectedBranchId}`}
                        title="Cash Invoice" 
                        theme="cash" 
                        branchName={branches.find(b => b.id === selectedBranchId)?.name}
                        invoiceNumber={getNextInvoiceNumber(selectedBranchId, 'cash')} 
                        items={items} 
                        poCustomers={poCustomersWithBalances as any}
                        branches={branches}
                        onAddInvoice={handleAddInvoice}
                        onError={(msg) => setNotification({ message: msg, type: 'error' })}
                        onUpdateInvoice={handleUpdateInvoice}
                        existingInvoices={branchCashInvoices}
                        allInvoices={allSalesInvoices}
                        editInvoice={cashEditInvoice}
                        manualInvoiceNumber={appSettings.manualInvoiceNumber}
                        canEdit={currentUser.permissions.canEditInvoice}
                        canAdd={currentUser.permissions.canAddInvoice}
                        canDelete={currentUser.permissions.canDeleteInvoice}
                        canChangeDate={currentUser.permissions.canChangeInvoiceDate}
                        onDeleteInvoice={handleDeleteInvoice}
                        checkUniqueNumber={checkUniqueCashNumber}
                    />
                    <InvoiceForm 
                        key={`credit-${selectedBranchId}`}
                        title="Credit Invoice" 
                        theme="credit" 
                        branchName={branches.find(b => b.id === selectedBranchId)?.name}
                        invoiceNumber={getNextInvoiceNumber(selectedBranchId, 'credit')} 
                        items={items} 
                        poCustomers={poCustomersWithBalances as any}
                        branches={branches}
                        onAddInvoice={handleAddInvoice}
                        onError={(msg) => setNotification({ message: msg, type: 'error' })}
                        onUpdateInvoice={handleUpdateInvoice}
                        existingInvoices={branchCreditInvoices}
                        allInvoices={allSalesInvoices}
                        editInvoice={creditEditInvoice}
                        manualInvoiceNumber={appSettings.manualInvoiceNumber}
                        canEdit={currentUser.permissions.canEditInvoice}
                        canAdd={currentUser.permissions.canAddInvoice}
                        canDelete={currentUser.permissions.canDeleteInvoice}
                        canChangeDate={currentUser.permissions.canChangeInvoiceDate}
                        onDeleteInvoice={handleDeleteInvoice}
                        checkUniqueNumber={checkUniqueCreditNumber}
                        prefillData={prefilledCreditInvoice}
                        onPrefillCleared={() => setPrefilledCreditInvoice(null)}
                    />
                </div>

                {allInvoices.length > 0 && (
                    <>
                        <div className="mt-3 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-start">
                            <div>{branchCashInvoices.length > 0 && (
                                <InvoiceList 
                                    title="Registered Cash Invoices" 
                                    invoices={branchCashInvoices} 
                                    theme="cash" 
                                    canDelete={currentUser.permissions.canDeleteInvoice} 
                                    onDelete={handleDeleteInvoice} 
                                    canEdit={currentUser.permissions.canEditInvoice}
                                    onEdit={(inv) => setCashEditInvoice(inv)}
                                />
                            )}</div>
                            <div>{branchCreditInvoices.length > 0 && (
                                <InvoiceList 
                                    title="Registered Credit Invoices" 
                                    invoices={branchCreditInvoices} 
                                    theme="credit" 
                                    canDelete={currentUser.permissions.canDeleteInvoice} 
                                    onDelete={handleDeleteInvoice} 
                                    canEdit={currentUser.permissions.canEditInvoice}
                                    onEdit={(inv) => setCreditEditInvoice(inv)}
                                />
                            )}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailySales;
