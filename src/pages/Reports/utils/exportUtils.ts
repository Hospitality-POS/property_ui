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