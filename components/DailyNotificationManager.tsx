import React, { useEffect } from 'react';
import { AppSettings, Invoice, Branch } from '../types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

interface Props {
    appSettings: AppSettings;
    allSalesInvoices: Invoice[];
    branches: Branch[];
    handleUpdateSettings: (newSettings: AppSettings) => void;
}

const DailyNotificationManager: React.FC<Props> = ({ appSettings, allSalesInvoices, branches, handleUpdateSettings }) => {
    useEffect(() => {
        // Enforce that notifications ONLY run if the app is running on a native mobile phone platform (via Capacitor)
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        if (!appSettings || !appSettings.dailyNotificationEnabled || !appSettings.dailyNotificationTime) {
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date();
            
            const getLocalDateString = (d: Date) => {
                const yr = d.getFullYear();
                const mo = d.getMonth() + 1;
                const dy = d.getDate();
                return `${yr}-${mo < 10 ? '0' + mo : mo}-${dy < 10 ? '0' + dy : dy}`;
            };

            const todayStr = getLocalDateString(now);
            const currentHour = String(now.getHours()).padStart(2, '0');
            const currentMin = String(now.getMinutes()).padStart(2, '0');
            const currentTimeStr = `${currentHour}:${currentMin}`;

            const targetTimeStr = appSettings.dailyNotificationTime!;

            // Check if we hit or passed target time, and have not yet triggered for today
            if (currentTimeStr >= targetTimeStr && appSettings.lastTriggeredNotificationDate !== todayStr) {
                // Filter today's invoices
                const todayInvoices = allSalesInvoices.filter(inv => {
                    const invDateStr = getLocalDateString(new Date(inv.date));
                    return invDateStr === todayStr;
                });

                const branchSummaries: string[] = [];
                let grandTotal = 0;

                branches.forEach(b => {
                    const bInvs = todayInvoices.filter(inv => inv.branchId === b.id);
                    const bTotal = bInvs.reduce((sum, i) => sum + i.total, 0);
                    
                    grandTotal += bTotal;
                    
                    branchSummaries.push(`${b.name} : ${bTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال`);
                });

                const bodyText = [
                    ...branchSummaries,
                    `اجمالي المبيعات : ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال`,
                    `لمعرفة التفاصيل اضغط هنا`
                ].join('\n');

                const performDispatch = async () => {
                    let sent = false;
                    try {
                        const check = await LocalNotifications.checkPermissions();
                        if (check.display === 'granted') {
                            await LocalNotifications.schedule({
                                notifications: [
                                    {
                                        title: 'ملخص المبيعات اليومية لشركة المياه العذبة المحدودة',
                                        body: bodyText,
                                        id: 1001,
                                        schedule: { at: new Date(Date.now() + 50) },
                                        sound: undefined,
                                        attachments: undefined,
                                        actionTypeId: "",
                                        extra: null
                                    }
                                ]
                            });
                            sent = true;
                        } else {
                            // Attempt lazy request on native if allowed
                            const req = await LocalNotifications.requestPermissions();
                            if (req.display === 'granted') {
                                await LocalNotifications.schedule({
                                    notifications: [
                                        {
                                            title: 'ملخص المبيعات اليومية لشركة المياه العذبة المحدودة',
                                            body: bodyText,
                                            id: 1001,
                                            schedule: { at: new Date(Date.now() + 50) },
                                            sound: undefined,
                                            attachments: undefined,
                                            actionTypeId: "",
                                            extra: null
                                        }
                                    ]
                                });
                                sent = true;
                            }
                        }
                    } catch (err) {
                        console.error('Failed to trigger native local notification', err);
                    }

                    if (sent) {
                        // Update settings state to log this triggered date
                        handleUpdateSettings({
                            ...appSettings,
                            lastTriggeredNotificationDate: todayStr
                        });
                        console.log(`Daily summary notification triggered successfully for ${todayStr}.`);
                    }
                };

                performDispatch();
            }
        }, 15000); // Check every 15 seconds for hot-response

        return () => clearInterval(intervalId);
    }, [appSettings, allSalesInvoices, branches, handleUpdateSettings]);

    return null;
};

export default DailyNotificationManager;
