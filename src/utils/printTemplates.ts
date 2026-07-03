import { useState, useEffect } from 'react';
import { subscribeToPrintTemplates, savePrintTemplatesToFirestore } from '../firebase';

export type PrintTemplateId = '1' | '2' | '3' | '4' | '5';
export type PrintSectionKey = 'endOfService' | 'eos' | 'vacationAllowance' | 'vacationRequest' | 'loanRequest';

export interface PrintTemplateOption {
  id: PrintTemplateId;
  name: string;
  label: string;
  description: string;
  badge: string;
}

export const PRINT_TEMPLATE_OPTIONS: PrintTemplateOption[] = [
  {
    id: '1',
    name: 'التصميم القياسي الحديث',
    label: 'التصميم القياسي الحديث',
    description: '',
    badge: 'الافتراضي'
  },
  {
    id: '2',
    name: 'التصميم الكلاسيكي الرسمي',
    label: 'التصميم الكلاسيكي الرسمي',
    description: '',
    badge: 'رسمي'
  },
  {
    id: '3',
    name: 'التصميم التنفيذي الراقي',
    label: 'التصميم التنفيذي الراقي',
    description: '',
    badge: 'تنفيذي'
  },
  {
    id: '4',
    name: 'التصميم المبسط المدمج',
    label: 'التصميم المبسط المدمج',
    description: '',
    badge: 'اقتصادي'
  },
  {
    id: '5',
    name: 'التصميم الحكومي المؤسسي',
    label: 'التصميم الحكومي المؤسسي',
    description: '',
    badge: 'مؤسسي'
  }
];

export const PRINT_SECTIONS: { key: PrintSectionKey; label: string }[] = [
  { key: 'endOfService', label: 'مخصص نهاية الخدمة ومستحقات الإجازة' },
  { key: 'vacationAllowance', label: 'تسوية مستحقات الإجازة' },
  { key: 'vacationRequest', label: 'طلب الإجازة' },
  { key: 'loanRequest', label: 'طلب سلفة' },
];

const STORAGE_PREFIX = 'adba_print_template_v2_';

export const getPrintTemplate = (section: PrintSectionKey): PrintTemplateId => {
  const actualSection = section === 'eos' ? 'endOfService' : section;
  const val = localStorage.getItem(`${STORAGE_PREFIX}${actualSection}`) || localStorage.getItem(`${STORAGE_PREFIX}eos`);
  if (val && ['1', '2', '3', '4', '5'].includes(val)) {
    return val as PrintTemplateId;
  }
  return '1';
};

export const savePrintTemplate = (section: PrintSectionKey, templateId: PrintTemplateId): void => {
  const actualSection = section === 'eos' ? 'endOfService' : section;
  localStorage.setItem(`${STORAGE_PREFIX}${actualSection}`, templateId);
  localStorage.setItem(`${STORAGE_PREFIX}eos`, templateId);

  const current = {
    endOfService: getPrintTemplate('endOfService'),
    eos: getPrintTemplate('endOfService'),
    vacationAllowance: getPrintTemplate('vacationAllowance'),
    vacationRequest: getPrintTemplate('vacationRequest'),
    loanRequest: getPrintTemplate('loanRequest'),
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
  }));

  useEffect(() => {
    const handleUpdate = () => {
      setTemplates({
        endOfService: getPrintTemplate('endOfService'),
        eos: getPrintTemplate('endOfService'),
        vacationAllowance: getPrintTemplate('vacationAllowance'),
        vacationRequest: getPrintTemplate('vacationRequest'),
        loanRequest: getPrintTemplate('loanRequest'),
      });
    };
    window.addEventListener('printTemplatesChanged', handleUpdate);

    const unsubscribe = subscribeToPrintTemplates((data) => {
      let changed = false;
      (['endOfService', 'eos', 'vacationAllowance', 'vacationRequest', 'loanRequest'] as const).forEach(k => {
        if (data[k] && ['1', '2', '3', '4', '5'].includes(data[k])) {
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
