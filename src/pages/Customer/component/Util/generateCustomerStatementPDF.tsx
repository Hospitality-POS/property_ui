import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

const generateCustomerStatementPDF = (customer, paymentPlanId = null) => {
    return new Promise((resolve, reject) => {
        try {
            // Create new PDF document
            const doc = new jsPDF();

            // Ensure font settings are explicitly set
            doc.setFont("helvetica");
            doc.setFontSize(10);

            // Set document properties
            doc.setProperties({
                title: `Customer Statement - ${customer.name}`,
                subject: 'Customer Financial Statement',
                author: 'Your Company Name',
                creator: 'CRM System'
            });

            // Helper functions for PDF
            const formatCurrency = (amount) => {
                if (amount === null || amount === undefined) return 'N/A';
                return amount.toLocaleString('en-KE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            };

            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                try {
                    return moment(dateString).format('DD MMM YYYY');
                } catch (e) {
                    return 'Invalid Date';
                }
            };

            // Add document title
            doc.setFontSize(22);
            doc.setTextColor(0, 0, 100);
            doc.text('CUSTOMER STATEMENT', 105, 20, { align: 'center' });

            // Add generation date
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${formatDate(new Date())}`, 195, 10, { align: 'right' });

            // Add customer details section
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Customer Details:', 14, 40);

            doc.setFontSize(10);
            doc.text(`Name: ${customer.name || 'N/A'}`, 14, 48);
            doc.text(`ID Number: ${customer.idNumber || 'N/A'}`, 14, 54);
            doc.text(`Phone: ${customer.phone || 'N/A'}`, 14, 60);
            doc.text(`Email: ${customer.email || 'N/A'}`, 14, 66);

            // Add address if available
            if (customer.address) {
                const addressParts = [];
                if (customer.address.street) addressParts.push(customer.address.street);
                if (customer.address.city) addressParts.push(customer.address.city);
                if (customer.address.county) addressParts.push(customer.address.county);
                if (customer.address.country) addressParts.push(customer.address.country);

                doc.text('Address:', 120, 48);
                doc.text(addressParts.join(', ') || 'No address provided', 120, 54);
            }

            // Add customer since date
            doc.text(`Customer Since: ${formatDate(customer.createdAt)}`, 120, 66);

            // Add a line
            doc.setDrawColor(220, 220, 220);
            doc.line(14, 75, 196, 75);

            // Statement summary section
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Statement Summary:', 14, 85);

            // Filter payment plans if a specific ID is provided
            const paymentPlans = paymentPlanId
                ? (customer.paymentPlans || []).filter(plan => plan._id === paymentPlanId || plan.id === paymentPlanId)
                : (customer.paymentPlans || []);

            // Get sales/purchases
            const purchases = paymentPlanId
                ? []  // If viewing specific payment plan, don't show purchases
                : (customer.purchases || []);

            const purchaseTotal = purchases.reduce((sum, purchase) =>
                sum + (typeof purchase.salePrice === 'number' ? purchase.salePrice : 0), 0);

            // Calculate summary data
            if (paymentPlans.length === 0 && purchases.length === 0) {
                doc.setFontSize(10);
                doc.text('No payment plans or purchases available', 14, 95);
            } else {
                // Calculate summary totals for payment plans
                const totalInitialDeposit = paymentPlans.reduce((sum, plan) =>
                    sum + (typeof plan.initialDeposit === 'number' ? plan.initialDeposit : 0), 0);

                const totalAmount = paymentPlans.reduce((sum, plan) =>
                    sum + (typeof plan.totalAmount === 'number' ? plan.totalAmount : 0), 0);

                // Modified outstanding balance calculation - considers completed plans as fully paid
                const totalOutstanding = paymentPlans.reduce((sum, plan) => {
                    // If the plan status is 'completed', consider outstanding balance as 0
                    if (plan.status.toLowerCase() === 'completed') {
                        return sum;
                    }
                    return sum + (typeof plan.outstandingBalance === 'number' ? plan.outstandingBalance : 0);
                }, 0);

                // Summary data
                let yPos = 95;
                doc.setFontSize(10);

                if (paymentPlans.length > 0) {
                    doc.text(`Total Payment Plans: ${paymentPlans.length}`, 14, yPos);
                    yPos += 6;
                    doc.text(`Total Plan Amount: KES ${formatCurrency(totalAmount)}`, 14, yPos);
                    yPos += 6;
                    doc.text(`Total Paid: KES ${formatCurrency(totalAmount - totalOutstanding)}`, 14, yPos);
                    yPos += 6;
                    doc.text(`Outstanding Balance: KES ${formatCurrency(totalOutstanding)}`, 14, yPos);
                    yPos += 6;
                }

                if (purchases.length > 0) {
                    doc.text(`Total Purchases: ${purchases.length}`, 14, yPos);
                    yPos += 6;
                    doc.text(`Total Purchase Amount: KES ${formatCurrency(purchaseTotal)}`, 14, yPos);
                    yPos += 6;
                }

                // Add a line
                yPos += 10;
                doc.line(14, yPos, 196, yPos);
                yPos += 15;

                // Add purchases/sales table if available
                let lastTableEndY = yPos;
                if (purchases.length > 0) {
                    doc.setFontSize(12);
                    doc.text('Purchase/Sales Details:', 14, yPos);
                    yPos += 10;

                    // Prepare table data
                    const purchaseColumns = [
                        "Date",
                        "Property",
                        "Amount (KES)",
                        "Status"
                    ];

                    const purchaseRows = purchases.map(purchase => [
                        formatDate(purchase.saleDate),
                        purchase.property?.name || 'N/A',
                        formatCurrency(purchase.salePrice || 0),
                        purchase.status ? purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1) : 'N/A'
                    ]);

                    // Add the purchases table
                    const purchasesTable = autoTable(doc, {
                        head: [purchaseColumns],
                        body: purchaseRows,
                        startY: yPos,
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                        alternateRowStyles: { fillColor: [242, 242, 242] },
                        didDrawPage: (data) => {
                            // Save the finalY position for later use
                            lastTableEndY = data.cursor.y;
                        }
                    });

                    // Update Y position - we'll use the manual tracking instead of getPlugin
                    yPos = lastTableEndY + 15;
                }

                // Add payment plans table if available
                if (paymentPlans.length > 0) {
                    doc.setFontSize(12);
                    doc.text('Payment Plan Details:', 14, yPos);
                    yPos += 10;

                    // Prepare table data
                    const tableColumn = [
                        "Plan ID",
                        "Initial Deposit (KES)",
                        "Total Amount (KES)",
                        "Outstanding (KES)",
                        "Status"
                    ];

                    const tableRows = paymentPlans.map(plan => [
                        (plan._id || plan.id || '').substring(0, 8) + '...',
                        formatCurrency(plan.initialDeposit || 0),
                        formatCurrency(plan.totalAmount || 0),
                        // Display 0 for completed plans
                        plan.status.toLowerCase() === 'completed' ?
                            formatCurrency(0) :
                            formatCurrency(plan.outstandingBalance || 0),
                        plan.status ? plan.status.charAt(0).toUpperCase() + plan.status.slice(1) : 'N/A'
                    ]);

                    // Add the table - using autoTable as a function instead of a method
                    const plansTable = autoTable(doc, {
                        head: [tableColumn],
                        body: tableRows,
                        startY: yPos,
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                        alternateRowStyles: { fillColor: [242, 242, 242] },
                        didDrawPage: (data) => {
                            // Save the finalY position for later use
                            lastTableEndY = data.cursor.y;
                        }
                    });

                    // Update Y position for the next section
                    yPos = lastTableEndY + 15;

                    // Add payment history table if available
                    const paymentHistory = [];
                    paymentPlans.forEach(plan => {
                        if (plan.payments && Array.isArray(plan.payments)) {
                            plan.payments.forEach(payment => {
                                paymentHistory.push({
                                    ...payment,
                                    planId: plan._id || plan.id
                                });
                            });
                        }
                    });

                    if (paymentHistory.length > 0) {
                        doc.setFontSize(12);
                        doc.text('Payment History:', 14, yPos);
                        yPos += 10;

                        // Prepare payment history table
                        const paymentColumns = [
                            "Date",
                            "Amount (KES)",
                            "Method",
                            "Reference",
                            "Plan ID"
                        ];

                        const paymentRows = paymentHistory?.map(payment => [
                            formatDate(payment.date),
                            formatCurrency(payment.amount || 0),
                            payment.method || 'N/A',
                            payment.reference || 'N/A',
                            (payment.planId || '').substring(0, 8) + '...'
                        ]);

                        // Add the payment history table
                        autoTable(doc, {
                            head: [paymentColumns],
                            body: paymentRows,
                            startY: yPos,
                            styles: { fontSize: 9 },
                            headStyles: { fillColor: [46, 204, 113], textColor: 255 },
                            alternateRowStyles: { fillColor: [242, 242, 242] }
                        });
                    }
                }
            }

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);

                // Footer text
                doc.text(
                    'This statement is automatically generated and does not require a signature. ' +
                    'For any queries, please contact our customer service.',
                    105,
                    285,
                    { align: 'center' }
                );

                // Page numbers
                doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: 'right' });
            }

            // Return the PDF as a blob
            const pdfBlob = doc.output('blob');
            resolve(pdfBlob);
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
};

export default generateCustomerStatementPDF;