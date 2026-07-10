import { useState, useEffect } from 'react';
import { subscribeToPrintTemplates, savePrintTemplatesToFirestore } from './firebaseSync';

export type PrintTemplateId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15';

export type PrintSectionKey = 'endOfService' | 'eos' | 'vacationAllowance' | 'vacationRequest' | 'loanRequest' | 'employeeStatement';

export interface PrintTemplateOption {
  id: PrintTemplateId;
  name: string;
  label: string;
  description: string;
  badge: string;
}

export const PRINT_TEMPLATE_OPTIONS: PrintTemplateOption[] = [
  { id: '1', name: 'التصميم القياسي', label: 'التصميم القياسي', description: '', badge: 'الافتراضي' }
];

export const PRINT_SECTIONS: { key: PrintSectionKey; label: string }[] = [
  { key: 'endOfService', label: 'مخصص نهاية الخدمة ومستحقات الإجازة' },
  { key: 'vacationAllowance', label: 'تسوية مستحقات الإجازة' },
  { key: 'vacationRequest', label: 'طلب الإجازة' },
  { key: 'loanRequest', label: 'طلب سلفة' },
  { key: 'employeeStatement', label: 'بطاقة الموظف' },
];

const STORAGE_PREFIX = 'adba_print_template_v2_';

const VALID_TEMPLATE_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

export const getPrintTemplate = (section: PrintSectionKey): PrintTemplateId => {
  return '1';
};

export const savePrintTemplate = (section: PrintSectionKey, templateId: PrintTemplateId): void => {
  const actualSection = section === 'eos' ? 'endOfService' : section;
  localStorage.setItem(`${STORAGE_PREFIX}${actualSection}`, templateId);
  localStorage.setItem(`${STORAGE_PREFIX}eos`, templateId);

  const current: Record<string, any> = {
    endOfService: getPrintTemplate('endOfService'),
    eos: getPrintTemplate('endOfService'),
    vacationAllowance: getPrintTemplate('vacationAllowance'),
    vacationRequest: getPrintTemplate('vacationRequest'),
    loanRequest: getPrintTemplate('loanRequest'),
    employeeStatement: getPrintTemplate('employeeStatement'),
  };

  current[actualSection] = templateId;
  if (actualSection === 'endOfService') current.eos = templateId;

  savePrintTemplatesToFirestore(current);
  window.dispatchEvent(new Event('printTemplatesChanged'));
};

export const usePrintTemplates = () => {
  const [templates, setTemplates] = useState<Record<string, PrintTemplateId>>(() => ({
    endOfService: getPrintTemplate('endOfService'),
    eos: getPrintTemplate('endOfService'),
    vacationAllowance: getPrintTemplate('vacationAllowance'),
    vacationRequest: getPrintTemplate('vacationRequest'),
    loanRequest: getPrintTemplate('loanRequest'),
    employeeStatement: getPrintTemplate('employeeStatement'),
  }));

  useEffect(() => {
    const handleUpdate = () => {
      setTemplates({
        endOfService: getPrintTemplate('endOfService'),
        eos: getPrintTemplate('endOfService'),
        vacationAllowance: getPrintTemplate('vacationAllowance'),
        vacationRequest: getPrintTemplate('vacationRequest'),
        loanRequest: getPrintTemplate('loanRequest'),
        employeeStatement: getPrintTemplate('employeeStatement'),
      });
    };

    window.addEventListener('printTemplatesChanged', handleUpdate);

    const unsubscribe = subscribeToPrintTemplates((data) => {
      let changed = false;
      (['endOfService', 'eos', 'vacationAllowance', 'vacationRequest', 'loanRequest', 'employeeStatement'] as const).forEach(k => {
        if (data[k] && VALID_TEMPLATE_IDS.includes(data[k])) {
          const targetKey = k === 'eos' ? 'endOfService' : k;
          localStorage.setItem(`${STORAGE_PREFIX}${targetKey}`, data[k]);
          localStorage.setItem(`${STORAGE_PREFIX}eos`, data[k]);
          changed = true;
        }
      });
      if (changed) {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener('printTemplatesChanged', handleUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    templates,
    printTemplates: templates,
    saveTemplate: savePrintTemplate,
    setSectionTemplate: savePrintTemplate,
  };
};
