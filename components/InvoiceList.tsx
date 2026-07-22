
import React, { useMemo } from 'react';
import { Invoice, Employee, Branch, POCustomer } from '../types';

interface InvoiceListProps {
    title: string;
    invoices: Invoice[];
    theme: 'cash' | 'credit';
    branches?: Branch[];
    canDelete?: boolean;
    onDelete?: (id: string) => void;
    canEdit?: boolean;
    onEdit?: (invoice: Invoice) => void;
    poCustomers?: POCustomer[];
    showBeforeTaxColumn?: boolean;
}

interface SummaryData {
    [itemName: string]: {
        totalQuantity: number;
        grandTotal: number;
    };
}

const InvoiceList: React.FC<InvoiceListProps> = ({ title, invoices, theme, branches, canDelete, onDelete, canEdit, onEdit, poCustomers = [], showBeforeTaxColumn = false }) => {
    const themeClasses = {
        cash: {
            headerBg: 'bg-blue-600',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            totalBg: 'bg-blue-100',
            totalBorder: 'border-blue-300'
        },
        credit: {
            headerBg: 'bg-sky-600',
            borderColor: 'border-sky-200',
            textColor: 'text-sky-800',
            totalBg: 'bg-sky-100',
            totalBorder: 'border-sky-300'
        }
    };
    const currentTheme = themeClasses[theme];

    const { summary, overallTotal, overallQuantity } = useMemo(() => {
        const summaryData = invoices.reduce((acc, invoice) => {
            const { itemName, quantity, total } = invoice;
            if (itemName === 'Cancel') return acc;
            if (!acc[itemName]) {
                acc[itemName] = { totalQuantity: 0, grandTotal: 0 };
            }
            acc[itemName].totalQuantity += quantity;
            acc[itemName].grandTotal += total;
            return acc;
        }, {} as SummaryData);
        
        const overallTotal = invoices.reduce((sum, inv) => sum + (inv.itemName !== 'Cancel' ? inv.total : 0), 0);
        const overallQuantity = invoices.reduce((sum, inv) => sum + (inv.itemName !== 'Cancel' ? inv.quantity : 0), 0);


        return {
            summary: Object.keys(summaryData).map((name) => ({
                name,
                totalQuantity: summaryData[name].totalQuantity,
                grandTotal: summaryData[name].grandTotal,
            })),
            overallTotal,
            overallQuantity,
        };
    }, [invoices]);

    const getBranchName = (id?: string) => {
        if (!id) return 'Main';
        return branches?.find(b => b.id === id)?.name || 'Unknown';
    };

    const formatTime = (date: Date) => {
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('en-GB'); // DD/MM/YYYY
        return `${dateStr} ${timeStr}`;
    };

    return (
        <div className="space-y-8">
            {/* Section 1: The Summary Section (Now First) - Hidden in Print */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 no-print">
                <h4 className={`text-lg font-bold mb-4 pb-2 border-b ${currentTheme.borderColor} ${currentTheme.textColor}`}>Summary by Item</h4>
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th scope="col" className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Item
                                </th>
                                <th scope="col" className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Total Qty
                                </th>
                                <th scope="col" className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Grand Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {summary.map((item, index) => (
                                <tr key={index} className="bg-white">
                                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{item.name}</td>
                                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.totalQuantity.toFixed(2)}</td>
                                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">{item.grandTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                             <tr className={`border-t-2 font-bold ${currentTheme.totalBg} ${currentTheme.totalBorder}`}>
                                <td className={`px-2 sm:px-4 py-3 text-right text-sm ${currentTheme.textColor}`}>
                                    Overall Grand Total
                                </td>
                                <td className={`px-2 sm:px-4 py-3 text-left text-sm font-semibold ${currentTheme.textColor}`}>
                                    {overallQuantity.toFixed(2)}
                                </td>
                                <td className={`px-2 sm:px-4 py-3 text-left text-sm font-semibold ${currentTheme.textColor}`}>
                                    {overallTotal.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Section 2: The Invoice List Table (Now Second) */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className={`text-lg font-bold mb-4 ${currentTheme.textColor}`}>{title}</h3>
                
                {/* Mobile View: Single Row Layout */}
                <div className="block sm:hidden space-y-3">
                    {invoices.map((invoice) => {
                        const poCust = invoice.poCustomerId ? poCustomers.find(c => c.id === invoice.poCustomerId) : null;
                        return (
                        <div key={invoice.id} className={`p-3 rounded-xl border-l-[6px] ${invoice.poNumber ? 'border-purple-500' : currentTheme.borderColor} ${invoice.poNumber ? 'bg-purple-50' : 'bg-white'} border border-gray-100 shadow-sm relative overflow-hidden transition-colors flex flex-col gap-2`}>
                            <div className="flex items-center justify-between gap-3">
                                {/* Left Side: Number, Item, Info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Dedicated Number Box - properly sized for any length */}
                                    <div className={`flex flex-col items-center justify-center border rounded-lg py-1.5 px-2 shrink-0 min-w-[54px] ${invoice.poNumber ? 'bg-purple-100 border-purple-200' : 'bg-gray-50 border-gray-100'}`}>
                                        <span className={`text-[9px] uppercase font-bold leading-none mb-1 ${invoice.poNumber ? 'text-purple-600' : 'text-gray-400'}`}>
                                            {invoice.poNumber ? 'PO Inv' : 'Inv No.'}
                                        </span>
                                        <span className={`text-[14px] font-black leading-none ${invoice.poNumber ? 'text-purple-700' : 'text-gray-700'}`}>{invoice.invoiceNumber}</span>
                                    </div>
                                    
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-1 min-w-0">
                                            <span className="font-bold text-gray-900 text-[15px] leading-tight truncate">
                                                {invoice.itemCode && invoice.itemCode !== 'cancel' && <span className="text-gray-500 font-mono mr-1">[{invoice.itemCode}]</span>}
                                                {invoice.itemName}
                                            </span>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${invoice.poNumber ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>Qty: {invoice.quantity.toFixed(2)}</span>
                                            <div className="text-gray-300 text-[11px] hidden xs:block">|</div>
                                            <div className="text-[11px] text-gray-500 truncate">
                                                {invoice.createdBy || '-'} {branches ? `• ${getBranchName(invoice.branchId)}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Total */}
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0 text-right flex flex-col items-end">
                                        <span className="font-black text-gray-900 text-[17px]">
                                            {invoice.total.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] font-bold text-orange-500 before-tax-amount">
                                            {(invoice.total / 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    );})}
                    <div className={`p-4 rounded-xl font-bold ${currentTheme.totalBg} ${currentTheme.textColor} flex justify-between items-center border border-current border-opacity-10 shadow-sm`}>
                        <span className="text-sm">Total ({overallQuantity.toFixed(2)} items)</span>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black">{overallTotal.toFixed(2)}</span>
                            <span className="text-sm font-bold text-orange-500 mt-1 before-tax-amount">{(overallTotal / 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Desktop View: Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={currentTheme.headerBg}>
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    No.
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    User
                                </th>
                                {branches && (
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Branch
                                    </th>
                                )}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Item
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Qty
                                </th>
                                {showBeforeTaxColumn && (
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider before-tax-amount">
                                        Before Tax
                                    </th>
                                )}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice, index) => {
                                const poCust = invoice.poCustomerId ? poCustomers.find(c => c.id === invoice.poCustomerId) : null;
                                return (
                                <tr key={invoice.id} className={`${invoice.poNumber ? 'bg-purple-50 font-semibold' : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white')} transition-colors`}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatTime(invoice.date)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{invoice.createdBy || '-'}</td>
                                    {branches && (
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{getBranchName(invoice.branchId)}</td>
                                    )}
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {invoice.itemCode && invoice.itemCode !== 'cancel' && <span className="text-gray-400 font-mono mr-1 text-xs">{invoice.itemCode}</span>}
                                        {invoice.itemName}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{invoice.quantity.toFixed(2)}</td>
                                    {showBeforeTaxColumn && (
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-orange-600 before-tax-amount">{(invoice.total / 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    )}
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">{invoice.total.toFixed(2)}</td>
                                </tr>
                            )})}
                        </tbody>
                        <tfoot className={`border-t-2 ${currentTheme.totalBorder} ${currentTheme.totalBg}`}>
                            <tr>
                                <td colSpan={branches ? 5 : 4} className={`px-4 py-3 text-right text-sm font-bold ${currentTheme.textColor}`}>
                                    Total
                                </td>
                                <td className={`px-4 py-3 text-left text-sm font-bold ${currentTheme.textColor}`}>
                                    {overallQuantity.toFixed(2)}
                                </td>
                                {showBeforeTaxColumn && (
                                    <td className={`px-4 py-3 text-left text-sm font-bold text-orange-600 before-tax-amount`}>
                                        {(overallTotal / 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                )}
                                <td className={`px-4 py-3 text-left text-sm font-bold ${currentTheme.textColor} align-middle`}>
                                    {overallTotal.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
