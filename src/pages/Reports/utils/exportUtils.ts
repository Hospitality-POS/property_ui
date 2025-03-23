import * as XLSX from 'xlsx';
import { message } from 'antd';
import { Moment } from 'moment';
import { formatCurrency, formatDate } from './formatters';
import { AgentCommissionReport } from '../components/types';

/**
 * Export data to Excel file
 * @param data - The data to export
 * @param filename - The filename to use
 * @param setExportLoading - Function to set loading state
 */
export const exportToExcel = (
    data: any[],
    filename: string,
    setExportLoading: (loading: boolean) => void
): void => {
    setExportLoading(true);
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        message.success('Export to Excel successful');
    } catch (error) {
        console.error('Excel export error:', error);
        message.error('Failed to export to Excel');
    } finally {
        setExportLoading(false);
    }
};

/**
 * Export data to CSV file
 * @param data - The data to export
 * @param filename - The filename to use
 * @param setExportLoading - Function to set loading state
 */
export const exportToCSV = (
    data: any[],
    filename: string,
    setExportLoading: (loading: boolean) => void
): void => {
    setExportLoading(true);
    try {
        // Convert JSON to CSV
        const replacer = (key: string, value: any) => value === null ? '' : value;
        const header = Object.keys(data[0]);
        let csv = data.map(row => header.map(fieldName =>
            JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        const csvArray = csv.join('\r\n');

        // Create a blob and download
        const blob = new Blob([csvArray], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        message.success('Export successful');
    } catch (error) {
        console.error('Export error:', error);
        message.error('Failed to export data');
    } finally {
        setExportLoading(false);
    }
};

/**
 * Export data to PDF
 * @param data - The data to export
 * @param filename - The filename to use
 * @param setExportLoading - Function to set loading state
 */
export const exportToPDF = (
    data: any[],
    filename: string,
    setExportLoading: (loading: boolean) => void
): void => {
    setExportLoading(true);
    try {
        // Create a hidden iframe for printing to PDF
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'absolute';
        printIframe.style.top = '-9999px';
        printIframe.style.left = '-9999px';
        printIframe.style.width = '0';
        printIframe.style.height = '0';
        document.body.appendChild(printIframe);

        // Flag to track if iframe is removed
        let isIframeRemoved = false;

        // Generate HTML content
        const tableHTML = generateHTMLTable(data, filename);

        // Write the HTML content to the iframe
        printIframe.contentDocument?.open();
        printIframe.contentDocument?.write(`
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1, h2 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 8px; border: 1px solid #ddd; }
                    th { background-color: #f2f2f2; text-align: left; }
                    .right-align { text-align: right; }
                    .center-align { text-align: center; }
                    .status-paid { background-color: #52c41a; color: white; padding: 3px 8px; border-radius: 4px; }
                    .status-partial { background-color: #faad14; color: white; padding: 3px 8px; border-radius: 4px; }
                    .status-pending { background-color: #ff4d4f; color: white; padding: 3px 8px; border-radius: 4px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        h1 { margin-top: 0; }
                    }
                </style>
            </head>
            <body>
                ${tableHTML}
                <script>
                    // This will automatically print
                    document.addEventListener('DOMContentLoaded', function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    });
                </script>
            </body>
            </html>
        `);
        printIframe.contentDocument?.close();

        // Set up event listener to know when to remove the iframe
        const removeIframe = () => {
            // Check if iframe still exists in the document and hasn't been removed yet
            if (!isIframeRemoved && document.body.contains(printIframe)) {
                try {
                    document.body.removeChild(printIframe);
                    isIframeRemoved = true;
                } catch (e) {
                    console.log('Iframe already removed');
                }
            }

            // Always set loading to false
            setExportLoading(false);
        };

        // For modern browsers
        if (printIframe.contentWindow) {
            printIframe.contentWindow.onafterprint = removeIframe;

            // Set a fallback timeout in case onafterprint doesn't fire
            setTimeout(removeIframe, 5000);

            // Trigger the print directly
            setTimeout(() => {
                if (printIframe.contentWindow && !isIframeRemoved) {
                    try {
                        printIframe.contentWindow.focus();
                        printIframe.contentWindow.print();
                    } catch (e) {
                        console.error('Error triggering print:', e);
                        removeIframe();
                    }
                }
            }, 1000);
        } else {
            // Fallback if contentWindow is not accessible
            removeIframe();
        }

        message.success('PDF export initiated');
    } catch (error) {
        console.error('PDF export error:', error);
        message.error('Failed to export to PDF');
        setExportLoading(false);
    }
};

/**
 * Generate HTML table from data
 */
const generateHTMLTable = (data: any[], title: string): string => {
    if (!data || data.length === 0) {
        return '<p>No data available</p>';
    }

    const keys = Object.keys(data[0]);
    const currentDate = new Date().toLocaleDateString();

    // Function to format values appropriately
    const formatValue = (key: string, value: any): string => {
        if (value === null || value === undefined) return '-';

        // Format currency fields
        if (key.toLowerCase().includes('price') ||
            key.toLowerCase().includes('amount') ||
            key.toLowerCase().includes('commission') ||
            key.toLowerCase().includes('paid')) {
            if (typeof value === 'number' || !isNaN(Number(value))) {
                return 'KES ' + Number(value).toLocaleString();
            }
        }

        // Format date fields
        if (key.toLowerCase().includes('date')) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString();
                }
            } catch (e) {
                // Not a valid date, return as is
            }
        }

        return String(value);
    };

    // Function to determine cell alignment
    const getCellAlignment = (key: string): string => {
        if (key.toLowerCase().includes('price') ||
            key.toLowerCase().includes('amount') ||
            key.toLowerCase().includes('commission') ||
            key.toLowerCase().includes('paid')) {
            return 'right-align';
        }

        if (key.toLowerCase().includes('status')) {
            return 'center-align';
        }

        return '';
    };

    // Function to format status cells
    const formatStatusCell = (value: string): string => {
        if (!value) return '-';

        const status = String(value).toLowerCase();
        let statusClass = '';

        if (status === 'paid' || status === 'completed') {
            statusClass = 'status-paid';
        } else if (status === 'partial') {
            statusClass = 'status-partial';
        } else {
            statusClass = 'status-pending';
        }

        return `<span class="${statusClass}">${String(value).toUpperCase()}</span>`;
    };

    // Generate header row
    let headerRow = keys.map(key => {
        // Format the header for display (capitalize, replace underscores with spaces)
        const formattedHeader = key.replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());

        return `<th>${formattedHeader}</th>`;
    }).join('');

    // Generate data rows
    let dataRows = data.map(row => {
        return '<tr>' + keys.map(key => {
            const cellClass = getCellAlignment(key);
            let cellContent = formatValue(key, row[key]);

            // Special formatting for status cells
            if (key.toLowerCase().includes('status')) {
                cellContent = formatStatusCell(row[key]);
            }

            return `<td class="${cellClass}">${cellContent}</td>`;
        }).join('') + '</tr>';
    }).join('');

    // Assemble the complete HTML
    return `
        <h1>${title}</h1>
        <h2>Commission Report</h2>
        <table>
            <thead>
                <tr>${headerRow}</tr>
            </thead>
            <tbody>
                ${dataRows}
            </tbody>
        </table>
        <div class="footer">
            <p>Generated on ${currentDate}</p>
        </div>
    `;
};

/**
 * Print agent commission report
 * @param record - The agent record
 * @param dateRange - The date range
 * @param setPrintLoading - Function to set loading state
 */
export const printAgentCommission = (
    record: AgentCommissionReport,
    dateRange: [Moment | null, Moment | null],
    formatCurrency: (amount: number | string | undefined | null) => string,
    formatDate: (dateString: string | Date | undefined | null) => string,
    setPrintLoading: (loading: boolean) => void
): void => {
    setPrintLoading(true);

    // Create printable content
    const printContent = document.createElement('div');
    printContent.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="text-align: center;">Agent Commission Report</h1>
      <h2 style="text-align: center;">${record.agentName}</h2>
      <p style="text-align: center;">${formatDate(dateRange[0]?.toDate())} to ${formatDate(dateRange[1]?.toDate())}</p>
      <hr />
      <div style="margin-top: 20px;">
          <h3>Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Agent:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${record.agentName}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${record.agentEmail}</td>
              </tr>
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Sales:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${record.totalSales}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Sale Value:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(record.totalSaleValue)}</td>
              </tr>
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Commission:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(record.totalCommission)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Commission Payments:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${record.commissionPaymentCount}</td>
              </tr>
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Paid Commission:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(record.totalCommissionPaid)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pending Commission:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(record.totalCommissionPending)}</td>
              </tr>
          </table>
      </div>
      <div style="margin-top: 20px;">
          <h3>Sales Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
              <thead>
                  <tr style="background-color: #f2f2f2;">
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Sale Code</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Property</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Unit</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Customer</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Sale Price</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Commission</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Paid</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Status</th>
                  </tr>
              </thead>
              <tbody>
                  ${record.sales.map(sale => `
                      <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">${sale.saleCode}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${sale.property}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${sale.unit}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${sale.customer}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(sale.saleDate)}</td>
                          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(sale.salePrice)}</td>
                          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(sale.commissionAmount)}</td>
                          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(sale.commissionPaid)}</td>
                          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                              <span style="padding: 3px 8px; border-radius: 4px; background-color: ${sale.commissionStatus === 'paid' ? '#52c41a' :
            sale.commissionStatus === 'partial' ? '#faad14' : '#ff4d4f'
        }; color: white;">
                                  ${sale.commissionStatus.toUpperCase()}
                              </span>
                          </td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
      </div>
      <div style="margin-top: 40px; text-align: center;">
          <p>Generated on ${formatDate(new Date())}</p>
      </div>
    </div>
  `;

    // Append to body, print, and remove
    document.body.appendChild(printContent);
    window.print();
    document.body.removeChild(printContent);
    setPrintLoading(false);
};

/**
 * Print report to PDF
 * @param elementId - ID of the element to print
 * @param filename - The filename to use
 */
export const printToPDF = (elementId: string, filename: string): void => {
    // This would typically use a library like jsPDF or html2canvas
    // For implementation simplicity, just use browser print
    const element = document.getElementById(elementId);
    if (element) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print</title>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(element.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        } else {
            message.error('Unable to open print window');
        }
    } else {
        message.error('Element not found');
    }
};