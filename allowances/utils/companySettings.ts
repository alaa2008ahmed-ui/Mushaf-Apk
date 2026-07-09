import { useState, useEffect } from 'react';
import { subscribeToCompanySettings, saveCompanySettingsToFirestore } from './firebaseSync';

const COMPANY_NAME_AR_KEY = 'adba_water_company_name_ar';
const COMPANY_NAME_EN_KEY = 'adba_water_company_name_en';

export const getCompanyNameAr = (): string => {
  return localStorage.getItem(COMPANY_NAME_AR_KEY) || 'شركة المياه العذبة المحدودة';
};

export const getCompanyNameEn = (): string => {
  return localStorage.getItem(COMPANY_NAME_EN_KEY) || 'Sweet Water Company Ltd';
};

export const saveCompanyNames = (ar: string, en: string): void => {
  localStorage.setItem(COMPANY_NAME_AR_KEY, ar);
  localStorage.setItem(COMPANY_NAME_EN_KEY, en);
  saveCompanySettingsToFirestore(ar, en);
  window.dispatchEvent(new Event('companySettingsChanged'));
};

export const useCompanySettings = () => {
  const [companyNameAr, setCompanyNameAr] = useState<string>(getCompanyNameAr());
  const [companyNameEn, setCompanyNameEn] = useState<string>(getCompanyNameEn());

  useEffect(() => {
    const handleUpdate = () => {
      setCompanyNameAr(getCompanyNameAr());
      setCompanyNameEn(getCompanyNameEn());
    };
    window.addEventListener('companySettingsChanged', handleUpdate);

    const unsubscribe = subscribeToCompanySettings((ar, en) => {
      localStorage.setItem(COMPANY_NAME_AR_KEY, ar);
      localStorage.setItem(COMPANY_NAME_EN_KEY, en);
      setCompanyNameAr(ar);
      setCompanyNameEn(en);
    });

    return () => {
      window.removeEventListener('companySettingsChanged', handleUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { companyNameAr, companyNameEn };
};

