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
  { id: '1', name: 'التصميم القياسي', label: 'التصميم القياسي', description: '', badge: 'الافتراضي' },
  { id: '2', name: 'رسمي كلاسيك', label: 'رسمي كلاسيك', description: '', badge: 'رسمي' },
  { id: '3', name: 'تنفيذي راقي', label: 'تنفيذي راقي', description: '', badge: 'تنفيذي' },
  { id: '4', name: 'اقتصادي مدمج', label: 'اقتصادي مدمج', description: '', badge: 'اقتصادي' },
  { id: '5', name: 'مؤسسي حكومي', label: 'مؤسسي حكومي', description: '', badge: 'مؤسسي' },
  { id: '6', name: 'حديث ومبسط', label: 'حديث ومبسط', description: '', badge: 'حديث' },
  { id: '7', name: 'هندسي دقيق', label: 'هندسي دقيق', description: '', badge: 'هندسي' },
  { id: '8', name: 'إبداعي ملون', label: 'إبداعي ملون', description: '', badge: 'إبداعي' },
  { id: '9', name: 'شامل تفصيلي', label: 'شامل تفصيلي', description: '', badge: 'شامل' },
  { id: '10', name: 'مدمج مضغوط', label: 'مدمج مضغوط', description: '', badge: 'مضغوط' },
  { id: '11', name: 'أنيق وفاخر', label: 'أنيق وفاخر', description: '', badge: 'أنيق' },
  { id: '12', name: 'تقني متطور', label: 'تقني متطور', description: '', badge: 'تقني' },
  { id: '13', name: 'أكاديمي موثق', label: 'أكاديمي موثق', description: '', badge: 'أكاديمي' },
  { id: '14', name: 'سريع ومباشر', label: 'سريع ومباشر', description: '', badge: 'مباشر' },
  { id: '15', name: 'عصري متوازن', label: 'عصري متوازن', description: '', badge: 'عصري' }
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
  const actualSection = section === 'eos' ? 'endOfService' : section;
  const val = localStorage.getItem(`${STORAGE_PREFIX}${actualSection}`) || localStorage.getItem(`${STORAGE_PREFIX}eos`);
  if (val && VALID_TEMPLATE_IDS.includes(val)) {
    return val as PrintTemplateId;
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
