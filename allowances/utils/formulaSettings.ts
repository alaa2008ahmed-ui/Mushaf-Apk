import { useState, useEffect } from 'react';
import { subscribeToFormulaSettings, saveFormulaSettingsToFirestore } from './firebaseSync';

export interface FormulaSettings {
  // Vacation Allowance settings
  vacationLessThan5YearsDays: number; // default: 21
  vacationMoreThan5YearsDays: number; // default: 30
  vacationSalaryBasis: 'total' | 'basic'; // default: 'total'
  vacationDivisor: number; // default: 30

  // Ticket Allowance settings
  ticketAdminIntervalYears: number; // default: 1
  ticketBranchesIntervalYears: number; // default: 2
  ticketCapToPrice: boolean; // default: true

  // End of Service settings
  eosSalaryBasis: 'total' | 'basic'; // default: 'total'
  eosFirstPeriodYears: number; // default: 5
  eosFirstPeriodCoefficient: number; // default: 0.5
  eosSecondPeriodCoefficient: number; // default: 1.0
}

export const DEFAULT_FORMULA_SETTINGS: FormulaSettings = {
  vacationLessThan5YearsDays: 21,
  vacationMoreThan5YearsDays: 30,
  vacationSalaryBasis: 'total',
  vacationDivisor: 30,
  
  ticketAdminIntervalYears: 1,
  ticketBranchesIntervalYears: 2,
  ticketCapToPrice: true,

  eosSalaryBasis: 'total',
  eosFirstPeriodYears: 5,
  eosFirstPeriodCoefficient: 0.5,
  eosSecondPeriodCoefficient: 1.0,
};

const STORAGE_KEY = 'adba_formula_settings_v1';

export const getFormulaSettings = (): FormulaSettings => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val) {
      const parsed = JSON.parse(val);
      // Ensure numeric types are maintained
      return {
        vacationLessThan5YearsDays: Number(parsed.vacationLessThan5YearsDays ?? DEFAULT_FORMULA_SETTINGS.vacationLessThan5YearsDays),
        vacationMoreThan5YearsDays: Number(parsed.vacationMoreThan5YearsDays ?? DEFAULT_FORMULA_SETTINGS.vacationMoreThan5YearsDays),
        vacationSalaryBasis: parsed.vacationSalaryBasis === 'basic' ? 'basic' : 'total',
        vacationDivisor: Number(parsed.vacationDivisor ?? DEFAULT_FORMULA_SETTINGS.vacationDivisor),
        
        ticketAdminIntervalYears: Number(parsed.ticketAdminIntervalYears ?? DEFAULT_FORMULA_SETTINGS.ticketAdminIntervalYears),
        ticketBranchesIntervalYears: Number(parsed.ticketBranchesIntervalYears ?? DEFAULT_FORMULA_SETTINGS.ticketBranchesIntervalYears),
        ticketCapToPrice: parsed.ticketCapToPrice !== false,

        eosSalaryBasis: parsed.eosSalaryBasis === 'basic' ? 'basic' : 'total',
        eosFirstPeriodYears: Number(parsed.eosFirstPeriodYears ?? DEFAULT_FORMULA_SETTINGS.eosFirstPeriodYears),
        eosFirstPeriodCoefficient: Number(parsed.eosFirstPeriodCoefficient ?? DEFAULT_FORMULA_SETTINGS.eosFirstPeriodCoefficient),
        eosSecondPeriodCoefficient: Number(parsed.eosSecondPeriodCoefficient ?? DEFAULT_FORMULA_SETTINGS.eosSecondPeriodCoefficient),
      };
    }
  } catch (err) {
    console.error("Error reading formula settings", err);
  }
  return DEFAULT_FORMULA_SETTINGS;
};

export const saveFormulaSettings = (settings: FormulaSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  saveFormulaSettingsToFirestore(settings);
  window.dispatchEvent(new Event('formulaSettingsChanged'));
};

export const useFormulaSettings = () => {
  const [settings, setSettings] = useState<FormulaSettings>(getFormulaSettings);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getFormulaSettings());
    };
    window.addEventListener('formulaSettingsChanged', handleUpdate);

    const unsubscribe = subscribeToFormulaSettings((data) => {
      if (data) {
        const updated = {
          ...DEFAULT_FORMULA_SETTINGS,
          ...data,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener('formulaSettingsChanged', handleUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    settings,
    saveSettings: saveFormulaSettings,
  };
};
