import { useState, useEffect } from 'react';
import { subscribeToPrintTemplates, savePrintTemplatesToFirestore } from './firebaseSync';

export type PrintTemplateId = '1' | '2' | '3' | '4' | '5';

export type PrintSectionKey = 'endOfService' | 'eos' | 'vacationAllowance' | 'vacationRequest' | 'loanRequest' | 'employeeStatement';

export interface PrintTemplateOption {
  id: PrintTemplateId;
  name: string;
  label: string;
  description: string;
  badge: string;
}

export const PRINT_TEMPLATE_OPTIONS: PrintTemplateOption[] = [
  { id: '1', name: 'التصميم القياسي', label: 'التصميم القياسي', description: 'التصميم الافتراضي', badge: 'الافتراضي' },
  { id: '2', name: 'الاحترافي المطور', label: 'الاحترافي المطور', description: 'تصميم احترافي مطور', badge: 'جديد' },
  { id: '3', name: 'تصميم الشركات الحديث', label: 'تصميم الشركات الحديث', description: 'تصميم عصري للشركات', badge: 'جديد' },
  { id: '4', name: 'المبتكر الأنيق', label: 'المبتكر الأنيق', description: 'تصميم مبتكر وأنيق', badge: 'جديد' },
  { id: '5', name: 'الرسمي الفاخر', label: 'الرسمي الفاخر', description: 'تصميم رسمي فاخر', badge: 'جديد' }
];

export const PRINT_SECTIONS: { key: PrintSectionKey; label: string }[] = [
  { key: 'endOfService', label: 'مخصص نهاية الخدمة ومستحقات الإجازة' },
  { key: 'vacationAllowance', label: 'تسوية مستحقات الإجازة' },
  { key: 'vacationRequest', label: 'طلب الإجازة' },
  { key: 'loanRequest', label: 'طلب سلفة' },
  { key: 'employeeStatement', label: 'بطاقة الموظف' },
];

const STORAGE_PREFIX = 'adba_print_template_v2_';

const VALID_TEMPLATE_IDS = ['1', '2', '3', '4', '5'];

export const getPrintTemplate = (section: PrintSectionKey): PrintTemplateId => {
  const actualSection = section === 'eos' ? 'endOfService' : section;
  const saved = localStorage.getItem(`${STORAGE_PREFIX}${actualSection}`);
  if (saved && VALID_TEMPLATE_IDS.includes(saved)) {
    return saved as PrintTemplateId;
  }
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

let isSubscribedToPrintTemplates = false;

const initGlobalPrintTemplatesListener = () => {
  if (isSubscribedToPrintTemplates) return;
  isSubscribedToPrintTemplates = true;

  subscribeToPrintTemplates((data) => {
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
      window.dispatchEvent(new Event('printTemplatesChanged'));
    }
  });
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
    initGlobalPrintTemplatesListener();

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

    return () => {
      window.removeEventListener('printTemplatesChanged', handleUpdate);
    };
  }, []);

  return {
    templates,
    printTemplates: templates,
    saveTemplate: savePrintTemplate,
    setSectionTemplate: savePrintTemplate,
  };
};
