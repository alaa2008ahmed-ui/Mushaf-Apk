export interface SmartPrintConfig {
  rowHeight: string;
  fontSize: string;
  headerFontSize: string;
  headerHeight: string;
  cellPadding: string;
  sigMarginTop: string;
  sigGap: string;
  sigFontSize: string;
  zoom: string;
  label: string;
  density: 'ultra-dense' | 'dense' | 'medium' | 'comfortable' | 'spacious';
}

export function getSmartPrintConfig(count: number, isAllBranches?: boolean): SmartPrintConfig {
  if (count >= 56) {
    // Ultra dense (56+ employees) - compact to guarantee 1 page
    return {
      rowHeight: isAllBranches ? '13px' : '8.5px',
      fontSize: isAllBranches ? '6.6pt' : '6.2pt',
      headerFontSize: isAllBranches ? '7.0pt' : '6.6pt',
      headerHeight: '12px',
      cellPadding: '0.2px 0.8px',
      sigMarginTop: isAllBranches ? '20px' : '10px',
      sigGap: '6px',
      sigFontSize: '6.5pt',
      zoom: isAllBranches ? '64%' : '62%',
      label: `مكثف جداً (${count} موظف) - ورقة واحدة`,
      density: 'ultra-dense'
    };
  } else if (count >= 46) {
    // Very Dense (46 - 55 employees)
    return {
      rowHeight: isAllBranches ? '17px' : '11px',
      fontSize: isAllBranches ? '7.4pt' : '7.0pt',
      headerFontSize: isAllBranches ? '7.8pt' : '7.4pt',
      headerHeight: '14px',
      cellPadding: '0.6px 1.2px',
      sigMarginTop: isAllBranches ? '25px' : '10px',
      sigGap: '12px',
      sigFontSize: '8.0pt',
      zoom: isAllBranches ? '66%' : '64%',
      label: `تلقائي مكثف لملء كامل الصفحة (${count} موظف)`,
      density: 'dense'
    };
  } else if (count >= 38) {
    // Dense (38 - 45 employees, e.g. 42 employees)
    return {
      rowHeight: isAllBranches ? '20px' : '13px',
      fontSize: isAllBranches ? '7.8pt' : '7.4pt',
      headerFontSize: isAllBranches ? '8.2pt' : '7.8pt',
      headerHeight: '15px',
      cellPadding: '1px 1.6px',
      sigMarginTop: '4px',
      sigGap: '14px',
      sigFontSize: '11pt',
      zoom: isAllBranches ? '68%' : '66%',
      label: `تلقائي مخصص لاستغلال كامل الصفحة (${count} موظف)`,
      density: 'dense'
    };
  } else if (count >= 24) {
    // Medium (24 - 37 employees)
    return {
      rowHeight: isAllBranches ? '22px' : '15px',
      fontSize: isAllBranches ? '8.2pt' : '7.8pt',
      headerFontSize: isAllBranches ? '8.6pt' : '8.2pt',
      headerHeight: '18px',
      cellPadding: '1.2px 2px',
      sigMarginTop: '4px',
      sigGap: '16px',
      sigFontSize: '11.5pt',
      zoom: isAllBranches ? '70%' : '68%',
      label: `تلقائي متوسط لملء الصفحة (${count} موظف)`,
      density: 'medium'
    };
  } else if (count >= 12) {
    // Comfortable (12 - 23 employees, e.g. medium branch)
    return {
      rowHeight: isAllBranches ? '27px' : '20px',
      fontSize: isAllBranches ? '8.6pt' : '8.2pt',
      headerFontSize: isAllBranches ? '9.0pt' : '8.6pt',
      headerHeight: '18px',
      cellPadding: '1.4px 2.2px',
      sigMarginTop: '4px',
      sigGap: '20px',
      sigFontSize: '12pt',
      zoom: isAllBranches ? '72%' : '70%',
      label: `تلقائي مريح لملء الصفحة (${count} موظف)`,
      density: 'comfortable'
    };
  } else {
    // Spacious (1 - 11 employees, e.g. small branch)
    return {
      rowHeight: isAllBranches ? '34px' : '26px',
      fontSize: isAllBranches ? '9.2pt' : '8.8pt',
      headerFontSize: isAllBranches ? '9.6pt' : '9.2pt',
      headerHeight: '20px',
      cellPadding: '1.8px 3.2px',
      sigMarginTop: '4px',
      sigGap: '24px',
      sigFontSize: '12.5pt',
      zoom: isAllBranches ? '74%' : '72%',
      label: `تلقائي مخصص للفرع الصغير (${count} موظف)`,
      density: 'spacious'
    };
  }
}

/**
 * Generates exact print CSS string for a given employee count
 */
export function generateSmartPrintCSS(count: number, isAllBranches?: boolean): string {
  const config = getSmartPrintConfig(count, isAllBranches);
  return `
    @page { 
      size: A4 landscape; 
      margin-top: 0.6cm !important; 
      margin-bottom: 0.6cm !important; 
      margin-right: 0.5cm !important; 
      margin-left: 0.5cm !important; 
    }
    body { 
      background-color: white !important; 
      color: black !important; 
      font-family: Arial, sans-serif !important; 
      margin: 0 !important; 
      padding: 0 !important;
      zoom: ${config.zoom} !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #printable-payroll-section {
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 0.5cm !important;
      padding-right: 0.5cm !important;
      box-sizing: border-box !important;
      width: 100% !important;
    }
    h2 {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif !important;
      font-size: 13.5pt !important;
      margin-top: calc(15px + 0.5cm) !important;
      margin-bottom: 10px !important;
      padding-bottom: 2px !important;
      line-height: 1.6 !important;
      display: inline-block !important;
    }
    * {
      overflow: visible !important;
      max-height: none !important;
    }
    html, body, #printable-payroll-section, .bg-white {
      height: auto !important;
      overflow: visible !important;
    }
    .print-hidden, .print\\:hidden { display: none !important; }
    .min-w-\\[1250px\\] { min-width: 0 !important; width: 100% !important; }
    table { 
      min-width: 0 !important;
      width: 100% !important; 
      margin-left: 0 !important;
      margin-right: 0 !important;
      box-sizing: border-box !important;
      border-collapse: collapse !important; 
      margin-bottom: 4px !important; 
      page-break-inside: auto !important;
      border: 2px solid #000000 !important;
    }
    .print-signatures-grid {
      margin-top: 10px !important;
      margin-bottom: 5px !important;
      padding-left: 1.0cm !important;
      padding-right: 1.0cm !important;
      page-break-inside: avoid !important;
    }
    thead tr { 
      height: 19px !important; 
    }
    tbody tr { 
      height: ${config.rowHeight} !important; 
      max-height: ${config.rowHeight} !important; 
      page-break-inside: avoid !important;
      page-break-after: auto !important;
    }
    tfoot tr { 
      height: 19px !important; 
    }
    th, td { 
      border: 1px solid #000000 !important; 
      padding: ${config.cellPadding} !important; 
      font-size: 11pt !important; 
      line-height: 1 !important; 
      text-align: center !important; 
      height: ${config.rowHeight} !important; 
      white-space: normal !important; 
      color: #000000 !important;
    }
    th.text-right, td.text-right {
      text-align: right !important;
      padding-right: 4px !important;
    }
    th { 
      background-color: #f1f5f9 !important; 
      font-weight: 800 !important; 
      font-size: 11pt !important; 
      color: #000000 !important;
      height: 19px !important;
    }
    tfoot td {
      height: 19px !important;
    }
    th.print-col-total, td.print-col-total {
      color: #dc2626 !important;
    }
    th.print-col-net, td.print-col-net {
      color: #1d4ed8 !important;
    }
    .print-signatures-grid, .grid.grid-cols-2.md\\:grid-cols-4 { 
      display: grid !important; 
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important; 
      gap: ${config.sigGap} !important; 
      margin-top: ${config.sigMarginTop} !important; 
      padding-top: 4px !important;
      border-top: none !important;
    }
    .print-signatures-grid > div, .grid.grid-cols-2.md\\:grid-cols-4 > div { 
      padding: 2px !important; 
      border: none !important; 
      box-shadow: none !important; 
      text-align: center !important;
    }
    .print-signatures-grid p, .grid.grid-cols-2.md\\:grid-cols-4 p { 
      margin-bottom: 3px !important; 
      font-size: ${config.sigFontSize} !important; 
      border-top: none !important;
      padding-top: 0 !important;
    }
    tbody {
      counter-reset: emp-counter;
    }
    tbody tr:not(.print\:hidden) {
      counter-increment: emp-counter;
    }
    .print-serial-counter::before {
      content: counter(emp-counter) !important;
    }
  `;
}

/**
 * Generates exact print CSS string wrapped in @media print for embedding inside style tags
 */
export function generateMediaPrintCSS(count: number, isAllBranches?: boolean): string {
  const config = getSmartPrintConfig(count, isAllBranches);
  return `
    @media print {
      @page { 
        size: A4 landscape; 
        margin-top: 0.6cm !important; 
        margin-bottom: 0.6cm !important; 
        margin-right: 0.5cm !important; 
        margin-left: 0.5cm !important; 
      }
      body { 
        background-color: white !important; 
        color: black !important; 
        font-family: Arial, sans-serif !important; 
        margin: 0 !important; 
        padding: 0 !important;
        zoom: ${config.zoom} !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #printable-payroll-section {
        margin-left: auto !important;
        margin-right: auto !important;
        padding-left: 0.5cm !important;
        padding-right: 0.5cm !important;
        box-sizing: border-box !important;
        width: 100% !important;
      }
      #printable-payroll-section h2 {
        font-family: 'Cairo', system-ui, -apple-system, sans-serif !important;
        font-size: 13.5pt !important;
        margin-top: calc(15px + 0.5cm) !important;
        margin-bottom: 10px !important;
        padding-bottom: 2px !important;
        line-height: 1.6 !important;
        display: inline-block !important;
      }
      * {
        overflow: visible !important;
        max-height: none !important;
      }
      html, body, #printable-payroll-section, .bg-white {
        height: auto !important;
        overflow: visible !important;
      }
      .print-hidden, .print\\:hidden { display: none !important; }
      .min-w-\\[1250px\\] { min-width: 0 !important; width: 100% !important; }
      #printable-payroll-section table { 
        min-width: 0 !important;
        width: 100% !important; 
        margin-left: 0 !important;
        margin-right: 0 !important;
        box-sizing: border-box !important;
        border-collapse: collapse !important; 
        margin-bottom: 4px !important; 
        page-break-inside: auto !important;
        border: 2px solid #000000 !important;
      }
      .print-signatures-grid {
        margin-top: 10px !important;
        margin-bottom: 5px !important;
        padding-left: 1.0cm !important;
        padding-right: 1.0cm !important;
        page-break-inside: avoid !important;
      }
      #printable-payroll-section thead tr { 
        height: 19px !important; 
      }
      #printable-payroll-section tbody tr { 
        height: ${config.rowHeight} !important; 
        max-height: ${config.rowHeight} !important; 
        page-break-inside: avoid !important;
        page-break-after: auto !important;
      }
      #printable-payroll-section tfoot tr { 
        height: 19px !important; 
      }
      #printable-payroll-section th, #printable-payroll-section td { 
        border: 1px solid #000000 !important; 
        padding: ${config.cellPadding} !important; 
        font-size: 11pt !important; 
        line-height: 1 !important; 
        text-align: center !important; 
        height: ${config.rowHeight} !important; 
        white-space: normal !important; 
        color: #000000 !important;
      }
      #printable-payroll-section th.text-right, #printable-payroll-section td.text-right {
        text-align: right !important;
        padding-right: 4px !important;
      }
      #printable-payroll-section th { 
        background-color: #f1f5f9 !important; 
        font-weight: 800 !important; 
        font-size: 11pt !important; 
        color: #000000 !important;
        height: 19px !important;
      }
      #printable-payroll-section tfoot td {
        height: 19px !important;
      }
      #printable-payroll-section th.print-col-total, #printable-payroll-section td.print-col-total {
        color: #dc2626 !important;
      }
      #printable-payroll-section th.print-col-net, #printable-payroll-section td.print-col-net {
        color: #1d4ed8 !important;
      }
      #printable-payroll-section .print-signatures-grid, #printable-payroll-section .grid.grid-cols-2.md\\:grid-cols-4 { 
        display: grid !important; 
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important; 
        gap: ${config.sigGap} !important; 
        margin-top: ${config.sigMarginTop} !important; 
        padding-top: 4px !important;
        border-top: none !important;
      }
      #printable-payroll-section .print-signatures-grid > div, #printable-payroll-section .grid.grid-cols-2.md\\:grid-cols-4 > div { 
        padding: 2px !important; 
        border: none !important; 
        box-shadow: none !important; 
        text-align: center !important;
      }
      #printable-payroll-section .print-signatures-grid p, #printable-payroll-section .grid.grid-cols-2.md\\:grid-cols-4 p { 
        margin-bottom: 3px !important; 
        font-size: ${config.sigFontSize} !important; 
        border-top: none !important;
        padding-top: 0 !important;
      }
      #printable-payroll-section tbody {
        counter-reset: emp-counter;
      }
      #printable-payroll-section tbody tr:not(.print\:hidden) {
        counter-increment: emp-counter;
      }
      #printable-payroll-section .print-serial-counter::before {
        content: counter(emp-counter) !important;
      }
    }
  `;
}

