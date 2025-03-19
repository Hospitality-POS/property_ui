import {
    Drawer,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Divider,
    Card,
    Statistic,
    Tabs,
    List,
    Descriptions,
    Timeline,
    Empty,
    Table,
    Avatar,
    message
} from 'antd';
import {
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    IdcardOutlined,
    MessageOutlined,
    CommentOutlined,
    ShoppingOutlined,
    CreditCardOutlined,
    TeamOutlined,
    FileTextOutlined,
    PlusOutlined,
    FilePdfOutlined,
    DownloadOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Safe data handling utility functions
const safeString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return '[Array]';
    if (typeof value === 'object') {
        if (value._id) return String(value._id);
        return '[Object]';
    }
    return String(value);
};

const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
};

// Format currency with KES prefix
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'KES 0.00';
    return `KES ${amount.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

// PDF Generation Function
const generateCustomerStatementPDF = (customer, transactions = [], paymentPlanId = null) => {
    return new Promise((resolve, reject) => {
        try {
            // Create new PDF document
            const doc = new jsPDF();

            // Ensure font settings are explicitly set
            doc.setFont("helvetica");
            doc.setFontSize(10);

            // Set document properties
            doc.setProperties({
                title: `Statement of Accounts - ${customer.name}`,
                subject: 'Customer Financial Statement',
                author: 'Company Name',
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
                    return moment(dateString).format('DD/MM/YYYY');
                } catch (e) {
                    return 'Invalid Date';
                }
            };

            // Add company header (no logo)
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 100);
            doc.text('Company Name', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('P.O.BOX 12345-00100, PIN: P0123456789X', 105, 30, { align: 'center' });
            doc.text('Physical Address: Company Street, City', 105, 35, { align: 'center' });

            // Add statement title
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Statement of Accounts', 105, 50, { align: 'center' });

            // Add statement period
            const startDate = '01/01/2024';
            const endDate = formatDate(new Date());
            doc.setFontSize(10);
            doc.text(`${startDate} To ${endDate}`, 105, 60, { align: 'center' });

            // Add customer information section
            doc.setFontSize(11);
            doc.text('To', 14, 75);
            doc.text(`${customer.name}`, 14, 85);
            doc.setFontSize(9);
            doc.text(`Email:${customer.email || 'N/A'}`, 14, 92);
            doc.text(`ID:${customer.idNumber || 'N/A'}`, 14, 99);
            doc.text(`Contacts:${customer.phone || 'N/A'}`, 14, 106);

            // Calculate summary data from transactions
            let totalInvoiced = 0;
            let totalPaid = 0;
            let creditNotes = 0;

            if (transactions.length > 0) {
                // Use provided transactions
                totalInvoiced = transactions.reduce((sum, t) => {
                    return t.type === 'Invoice' ? sum + t.amount : sum;
                }, 0);

                totalPaid = transactions.reduce((sum, t) => {
                    return t.type === 'Payment Received' ? sum + t.payment : sum;
                }, 0);

                creditNotes = transactions.reduce((sum, t) => {
                    return t.type === 'Credit Note' ? sum + t.amount : sum;
                }, 0);
            } else {
                // If no transactions, try to calculate from payment plans and purchases
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

                // Calculate totals for payment plans
                totalInvoiced = paymentPlans.reduce((sum, plan) =>
                    sum + (typeof plan.totalAmount === 'number' ? plan.totalAmount : 0), 0) + purchaseTotal;

                totalPaid = paymentPlans.reduce((sum, plan) => {
                    const planTotal = typeof plan.totalAmount === 'number' ? plan.totalAmount : 0;
                    const outstanding = typeof plan.outstandingBalance === 'number' ? plan.outstandingBalance : 0;
                    return sum + (planTotal - outstanding);
                }, 0);
            }

            const balanceDue = totalInvoiced - totalPaid - Math.abs(creditNotes);

            // Add summary box
            doc.setFillColor(240, 240, 240);
            doc.rect(14, 120, 180, 10, 'F');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Account Summary', 16, 127);

            // Add summary details
            doc.text('Opening Balance', 14, 140);
            doc.text('KES 0.00', 180, 140, { align: 'right' });

            doc.text('Invoiced Amount', 14, 147);
            doc.text(`KES ${formatCurrency(totalInvoiced)}`, 180, 147, { align: 'right' });

            doc.text('Amount Received', 14, 154);
            doc.text(`KES ${formatCurrency(totalPaid)}`, 180, 154, { align: 'right' });

            doc.text('Balance Due', 14, 161);
            doc.text(`KES ${formatCurrency(balanceDue)}`, 180, 161, { align: 'right' });

            // Add transactions table if available
            if (transactions.length > 0) {
                // Prepare transactions table
                doc.setFillColor(60, 60, 60);
                doc.rect(14, 175, 180, 10, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text('Date', 20, 182);
                doc.text('Transactions', 55, 182);
                doc.text('Details', 100, 182);
                doc.text('Amount', 140, 182);
                doc.text('Payments', 160, 182);
                doc.text('Balance', 180, 182);

                // Add transaction data using autotable
                const tableData = transactions.map(t => {
                    return [
                        formatDate(t.date),
                        t.type,
                        t.details,
                        t.type !== 'Payment Received' ? (t.amount || 0).toLocaleString() : '',
                        t.type === 'Payment Received' ? (t.payment || 0).toLocaleString() : '',
                        (t.balance || 0).toLocaleString()
                    ];
                });

                autoTable(doc, {
                    startY: 190,
                    head: [],
                    body: tableData,
                    theme: 'plain',
                    styles: {
                        fontSize: 9,
                        cellPadding: 3
                    },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: 50 },
                        3: { cellWidth: 25, halign: 'right' },
                        4: { cellWidth: 25, halign: 'right' },
                        5: { cellWidth: 25, halign: 'right' }
                    },
                    didDrawPage: (data) => {
                        // Add footer on each page
                        doc.setFontSize(8);
                        doc.setTextColor(150, 150, 150);
                        doc.text('This statement is automatically generated and does not require a signature.', 105, 285, { align: 'center' });
                        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 190, 285, { align: 'right' });
                    }
                });

                // Add final balance due at the bottom
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                const finalY = doc.lastAutoTable.finalY + 10;
                doc.text('Balance Due', 140, finalY);
                doc.text(`KES ${formatCurrency(balanceDue)}`, 180, finalY, { align: 'right' });
            } else {
                // Alternative display for payment plans if no transactions
                let yPos = 175;

                // Filter payment plans if a specific ID is provided
                const paymentPlans = paymentPlanId
                    ? (customer.paymentPlans || []).filter(plan => plan._id === paymentPlanId || plan.id === paymentPlanId)
                    : (customer.paymentPlans || []);

                if (paymentPlans.length > 0) {
                    // Add payment plans table
                    doc.setFillColor(60, 60, 60);
                    doc.rect(14, yPos, 180, 10, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Plan ID', 20, yPos + 7);
                    doc.text('Amount', 80, yPos + 7);
                    doc.text('Paid', 120, yPos + 7);
                    doc.text('Outstanding', 160, yPos + 7);
                    yPos += 15;

                    // Add plan data
                    doc.setTextColor(0, 0, 0);
                    paymentPlans.forEach(plan => {
                        const planId = (plan._id || plan.id || '').substring(0, 8) + '...';
                        const totalAmount = plan.totalAmount || 0;
                        const outstandingBalance = safeString(plan.status).toLowerCase() === 'completed' ?
                            0 : (plan.outstandingBalance || 0);
                        const paidAmount = totalAmount - outstandingBalance;

                        doc.text(planId, 20, yPos);
                        doc.text(formatCurrency(totalAmount), 80, yPos);
                        doc.text(formatCurrency(paidAmount), 120, yPos);
                        doc.text(formatCurrency(outstandingBalance), 160, yPos);
                        yPos += 10;
                    });

                    // Add a line
                    yPos += 5;
                    doc.line(14, yPos, 196, yPos);
                    yPos += 15;

                    // Add payment history if available
                    let paymentHistory = [];
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

                        const paymentRows = paymentHistory.map(payment => [
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

// Customer Statement Component
const CustomerStatementView = ({ customer, transactions = [], activeTab, onTabChange, onClose }) => {
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return moment(dateString).format('DD/MM/YYYY');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Calculate summary data from transactions
    const totalInvoiced = transactions.reduce((sum, t) => {
        return t.type === 'Invoice' ? sum + t.amount : sum;
    }, 0);

    const totalPaid = transactions.reduce((sum, t) => {
        return t.type === 'Payment Received' ? sum + t.payment : sum;
    }, 0);

    const creditNotes = transactions.reduce((sum, t) => {
        return t.type === 'Credit Note' ? sum + t.amount : sum;
    }, 0);

    const balanceDue = totalInvoiced - totalPaid - Math.abs(creditNotes);

    // Prepare table columns
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => formatDate(date)
        },
        {
            title: 'Transactions',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
            render: (details) => (
                <div style={{ whiteSpace: 'pre-line' }}>{details}</div>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount, record) => {
                if (record.type === 'Payment Received') return '';
                return amount !== 0 ? amount.toLocaleString() : '';
            }
        },
        {
            title: 'Payments',
            dataIndex: 'payment',
            key: 'payment',
            align: 'right',
            render: (payment, record) => {
                if (record.type !== 'Payment Received') return '';
                return payment !== 0 ? payment.toLocaleString() : '';
            }
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            align: 'right',
            render: (balance) => balance.toLocaleString()
        }
    ];

    // Handle PDF generation and download
    const handleDownloadPDF = async () => {
        try {
            message.loading({ content: 'Generating statement...', key: 'pdfGeneration' });
            const pdfBlob = await generateCustomerStatementPDF(customer, transactions);
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${customer.name.replace(/\s+/g, '-')}-statement.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success({ content: 'Statement downloaded successfully!', key: 'pdfGeneration', duration: 2 });
        } catch (error) {
            console.error('Error generating PDF:', error);
            message.error({ content: 'Failed to generate statement', key: 'pdfGeneration', duration: 2 });
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Title level={3}>Statement of Accounts</Title>
                    <Space>
                        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                            Print
                        </Button>
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
                            Download PDF
                        </Button>
                        {onTabChange && (
                            <Button onClick={() => onTabChange('1')}>
                                Back to Overview
                            </Button>
                        )}
                    </Space>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <Title level={4}>Company Name</Title>
                        <Text>P.O.BOX 12345-00100, PIN: P0123456789X</Text><br />
                        <Text>Physical Address: Company Street, City</Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Title level={5}>Statement Period</Title>
                        <Text>01/01/2024 To {formatDate(new Date())}</Text>
                    </div>
                </div>

                <Divider />

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card size="small" title="To">
                            <Title level={5}>{customer.name}</Title>
                            <Text>Email: {customer.email || 'N/A'}</Text><br />
                            <Text>ID: {customer.idNumber || 'N/A'}</Text><br />
                            <Text>Contacts: {customer.phone || 'N/A'}</Text>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" title="Account Summary">
                            <Row justify="space-between">
                                <Col>Opening Balance</Col>
                                <Col>KES 0.00</Col>
                            </Row>
                            <Row justify="space-between">
                                <Col>Invoiced Amount</Col>
                                <Col>{formatCurrency(totalInvoiced)}</Col>
                            </Row>
                            <Row justify="space-between">
                                <Col>Amount Received</Col>
                                <Col>{formatCurrency(totalPaid)}</Col>
                            </Row>
                            <Divider style={{ margin: '8px 0' }} />
                            <Row justify="space-between">
                                <Col><strong>Balance Due</strong></Col>
                                <Col><strong>{formatCurrency(balanceDue)}</strong></Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <div style={{ marginTop: 20 }}>
                    <Table
                        columns={columns}
                        dataSource={transactions.map((t, index) => ({ ...t, key: index }))}
                        pagination={false}
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                                        <strong>Balance Due</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <strong>{formatCurrency(balanceDue)}</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </div>

                <div style={{ marginTop: 40, textAlign: 'center' }}>
                    <Text type="secondary">
                        This statement is automatically generated and does not require a signature.
                        For any queries, please contact our customer service.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

// Main drawer component
export const CustomerDetailsDrawer = ({
    visible,
    customer,
    activeTab,
    onTabChange,
    onClose,
    onAddCommunication,
    onAddNote
}) => {
    if (!customer) {
        return null;
    }

    // Internal date formatting functions with safety checks
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return moment(dateString).format('DD MMM YYYY'); // e.g. 12 Mar 2025
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return moment(dateString).format('DD MMM YYYY, h:mm A'); // e.g. 12 Mar 2025, 2:30 PM
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = moment(dateString);
            const now = moment();

            if (now.diff(date, 'days') < 1) {
                return date.fromNow(); // e.g. "2 hours ago"
            } else if (now.diff(date, 'days') < 7) {
                return `${now.diff(date, 'days')} days ago`;
            } else {
                return formatDate(dateString);
            }
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Handle potentially missing fields in the customer object
    const getAddress = () => {
        if (!customer.address || typeof customer.address !== 'object') return 'No address provided';

        const parts = [];
        if (customer.address.street) parts.push(safeString(customer.address.street));
        if (customer.address.city) parts.push(safeString(customer.address.city));
        if (customer.address.county) parts.push(safeString(customer.address.county));

        return parts.join(', ') || 'No address details';
    };

    // Count purchases and payment plans safely
    const purchaseCount = (() => {
        if (!customer.purchases) return 0;
        if (typeof customer.purchases === 'number') return customer.purchases;
        if (Array.isArray(customer.purchases)) return customer.purchases.length;
        return 0;
    })();

    const paymentPlanCount = (() => {
        if (!customer.paymentPlans) return 0;
        if (typeof customer.paymentPlans === 'number') return customer.paymentPlans;
        if (Array.isArray(customer.paymentPlans)) return customer.paymentPlans.length;
        return 0;
    })();

    const communicationCount = (() => {
        if (!customer.communications) return 0;
        if (typeof customer.communications === 'number') return customer.communications;
        if (Array.isArray(customer.communications)) return customer.communications.length;
        return 0;
    })();

    // Super-safe data processing for tables
    const safelyProcessArray = (arr, processor) => {
        if (!arr) return [];
        if (!Array.isArray(arr)) return [];
        return arr.map(processor).filter(Boolean);  // Filter out any null/undefined results
    };

    // Process purchase data safely
    const processPurchase = (purchase) => {
        if (!purchase || typeof purchase !== 'object') return null;

        try {
            return {
                key: safeString(purchase._id || Math.random()),
                id: safeString(purchase._id),
                property: purchase.property,
                date: purchase.saleDate,
                amount: safeNumber(purchase.salePrice),
                status: safeString(purchase.status)
            };
        } catch (err) {
            console.error('Error processing purchase:', err);
            return null;
        }
    };

    // Process payment plan data safely
    const processPaymentPlan = (plan) => {
        if (!plan || typeof plan !== 'object') return null;

        try {
            return {
                key: safeString(plan._id || Math.random()),
                id: safeString(plan._id),
                totalAmount: safeNumber(plan.totalAmount),
                initialDeposit: safeNumber(plan.initialDeposit),
                outstandingBalance: safeNumber(plan.outstandingBalance),
                status: safeString(plan.status)
            };
        } catch (err) {
            console.error('Error processing payment plan:', err);
            return null;
        }
    };

    // Create safe data sources for tables
    const purchasesData = safelyProcessArray(customer.purchases, processPurchase);
    const paymentPlansData = safelyProcessArray(customer.paymentPlans, processPaymentPlan);

    // Generate transaction data from customer data
    const generateTransactionData = () => {
        const transactions = [];

        // Add opening balance
        transactions.push({
            date: customer.createdAt || new Date().toISOString(),
            type: 'Opening Balance',
            details: '***Opening Balance***',
            amount: 0,
            payment: 0,
            balance: 0
        });

        // Add data from purchases
        if (Array.isArray(customer.purchases)) {
            let runningBalance = 0;

            // Sort purchases by date
            const sortedPurchases = [...customer.purchases].sort((a, b) => {
                const dateA = new Date(a.saleDate || 0);
                const dateB = new Date(b.saleDate || 0);
                return dateA - dateB;
            });

            sortedPurchases.forEach(purchase => {
                const amount = safeNumber(purchase.salePrice);
                runningBalance += amount;

                transactions.push({
                    date: purchase.saleDate,
                    type: 'Invoice',
                    details: `Purchase - ${safeString(purchase.property?.name || 'Property')}`,
                    amount: amount,
                    payment: 0,
                    balance: runningBalance
                });
            });
        }

        // Add data from payment plans
        if (Array.isArray(customer.paymentPlans)) {
            let runningBalance = transactions.length > 0 ?
                transactions[transactions.length - 1].balance : 0;

            // Sort payment plans by date
            const sortedPlans = [...customer.paymentPlans].sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateA - dateB;
            });

            sortedPlans.forEach(plan => {
                // Add plan as invoice
                const amount = safeNumber(plan.totalAmount);
                runningBalance += amount;

                transactions.push({
                    date: plan.createdAt,
                    type: 'Invoice',
                    details: `Payment Plan - ${safeString(plan._id).substring(0, 8)}...`,
                    amount: amount,
                    payment: 0,
                    balance: runningBalance
                });

                // Add payments
                if (Array.isArray(plan.payments)) {
                    // Sort payments by date
                    const sortedPayments = [...plan.payments].sort((a, b) => {
                        const dateA = new Date(a.date || 0);
                        const dateB = new Date(b.date || 0);
                        return dateA - dateB;
                    });

                    sortedPayments.forEach(payment => {
                        const paymentAmount = safeNumber(payment.amount);
                        runningBalance -= paymentAmount;

                        transactions.push({
                            date: payment.date,
                            type: 'Payment Received',
                            details: `${payment.reference || 'Payment'}\nKES${paymentAmount.toLocaleString()} for payment of Plan ${safeString(plan._id).substring(0, 8)}...`,
                            amount: 0,
                            payment: paymentAmount,
                            balance: runningBalance
                        });
                    });
                }
            });
        }

        // Sort all transactions by date
        return transactions.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateA - dateB;
        });
    };

    // Function to handle statement extraction
    const handleExtractStatement = async (planId = null) => {
        try {
            message.loading({ content: 'Generating statement...', key: 'pdfGeneration' });

            // Generate transaction data
            const transactions = generateTransactionData();

            // Generate the PDF
            const pdfBlob = await generateCustomerStatementPDF(customer, transactions, planId);

            // Create a URL for the blob
            const url = URL.createObjectURL(pdfBlob);

            // Create a link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = planId
                ? `${customer.name.replace(/\s+/g, '-')}-plan-statement-${planId.substring(0, 8)}.pdf`
                : `${customer.name.replace(/\s+/g, '-')}-customer-statement.pdf`;
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            message.success({ content: 'Statement generated successfully!', key: 'pdfGeneration', duration: 2 });
        } catch (error) {
            console.error('Error generating statement:', error);
            message.error({ content: 'Failed to generate statement', key: 'pdfGeneration', duration: 2 });
        }
    };

    // Render appropriate content based on active tab
    const renderContent = () => {
        if (activeTab === "7") { // Statement tab
            return <CustomerStatementView
                customer={customer}
                transactions={generateTransactionData()}
                activeTab={activeTab}
                onTabChange={onTabChange}
            />;
        }

        return (
            <>
                <div style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Title level={4}>{safeString(customer.name)}</Title>
                            <Space direction="vertical">
                                <Text>
                                    <PhoneOutlined style={{ marginRight: 8 }} />
                                    {safeString(customer.phone)}{' '}
                                    {customer.verifiedPhone === true && (
                                        <Tag color="success">Verified</Tag>
                                    )}
                                </Text>
                                {customer.alternatePhone && (
                                    <Text>
                                        <PhoneOutlined style={{ marginRight: 8 }} />
                                        {safeString(customer.alternatePhone)} <Tag color="default">Alternate</Tag>
                                    </Text>
                                )}
                                <Text>
                                    <MailOutlined style={{ marginRight: 8 }} />
                                    {safeString(customer.email)}
                                </Text>
                                <Text>
                                    <IdcardOutlined style={{ marginRight: 8 }} />
                                    ID: {safeString(customer.idNumber)}
                                </Text>
                                <Text>
                                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                                    {getAddress()}
                                </Text>
                            </Space>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Tag
                                color={safeString(customer.customerType) === 'individual' ? 'blue' : 'purple'}
                                style={{ fontSize: '14px', padding: '4px 8px' }}
                            >
                                {safeString(customer.customerType) === 'individual' ? 'Individual' : 'Company'}
                            </Tag>
                            {customer.company && (
                                <div style={{ marginTop: 8 }}>
                                    <Text strong>Company:</Text>{' '}
                                    {safeString(customer.company)}
                                </div>
                            )}
                            {customer.occupation && (
                                <div style={{ marginTop: 8 }}>
                                    <Text strong>Occupation:</Text>{' '}
                                    {safeString(customer.occupation)}
                                </div>
                            )}
                            {customer.leadSource && (
                                <div style={{ marginTop: 8 }}>
                                    <Text strong>Lead Source:</Text>{' '}
                                    <Tag color="orange">{safeString(customer.leadSource)}</Tag>
                                </div>
                            )}
                            <div style={{ marginTop: 8 }}>
                                <Text strong>Customer Since:</Text>{' '}
                                {formatDate(customer.createdAt)}
                            </div>
                        </Col>
                    </Row>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Customer Status Overview */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Card size="small">
                            <Statistic
                                title="Purchases"
                                value={purchaseCount}
                                prefix={<ShoppingOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small">
                            <Statistic
                                title="Payment Plans"
                                value={paymentPlanCount}
                                prefix={<CreditCardOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small">
                            <Statistic
                                title="Communications"
                                value={communicationCount}
                                prefix={<MessageOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}>
                    <TabPane tab="Overview" key="1">
                        <Card title="Customer Information" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Full Name">
                                            {safeString(customer.name)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Phone Number">
                                            {safeString(customer.phone)}
                                        </Descriptions.Item>
                                        {customer.alternatePhone && (
                                            <Descriptions.Item label="Alt. Phone">
                                                {safeString(customer.alternatePhone)}
                                            </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="Email">
                                            {safeString(customer.email)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="ID Number">
                                            {safeString(customer.idNumber)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Customer Type">
                                            {safeString(customer.customerType) === 'individual' ? 'Individual' : 'Company'}
                                        </Descriptions.Item>
                                        {customer.company && (
                                            <Descriptions.Item label="Company">
                                                {safeString(customer.company)}
                                            </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="Lead Source">
                                            {safeString(customer.leadSource) || 'Not specified'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="Address Information" style={{ marginBottom: 16 }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Street">
                                    {safeString(customer.address?.street) || 'Not provided'}
                                </Descriptions.Item>
                                <Descriptions.Item label="City">
                                    {safeString(customer.address?.city) || 'Not provided'}
                                </Descriptions.Item>
                                <Descriptions.Item label="County">
                                    {safeString(customer.address?.county) || 'Not provided'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Postal Code">
                                    {safeString(customer.address?.postalCode) || 'Not provided'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Country">
                                    {safeString(customer.address?.country) || 'Not provided'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </TabPane>

                    <TabPane tab="Communications" key="2">
                        {Array.isArray(customer.communications) && customer.communications.length > 0 ? (
                            <Timeline mode="left" style={{ marginTop: 20 }}>
                                {[...customer.communications]
                                    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                                    .map((comm, index) => (
                                        <Timeline.Item
                                            key={index}
                                            label={formatDateTime(comm.date)}
                                            color={
                                                safeString(comm.type) === 'call'
                                                    ? 'blue'
                                                    : safeString(comm.type) === 'meeting'
                                                        ? 'green'
                                                        : safeString(comm.type) === 'email'
                                                            ? 'purple'
                                                            : 'gray'
                                            }
                                            dot={
                                                safeString(comm.type) === 'call' ? <PhoneOutlined /> :
                                                    safeString(comm.type) === 'email' ? <MailOutlined /> :
                                                        safeString(comm.type) === 'meeting' ? <TeamOutlined /> :
                                                            safeString(comm.type) === 'sms' ? <MessageOutlined /> :
                                                                <MessageOutlined />
                                            }
                                        >
                                            <div style={{ fontWeight: 'bold' }}>
                                                {safeString(comm.type).charAt(0).toUpperCase() + safeString(comm.type).slice(1)}
                                            </div>
                                            <div><strong>Summary:</strong> {safeString(comm.summary)}</div>
                                            <div><strong>Outcome:</strong> {safeString(comm.outcome)}</div>
                                            {comm.nextAction && (
                                                <div><strong>Next Action:</strong> {safeString(comm.nextAction)}</div>
                                            )}
                                        </Timeline.Item>
                                    ))}
                            </Timeline>
                        ) : (
                            <Empty description="No communications recorded yet" />
                        )}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            style={{ marginTop: 16 }}
                            onClick={() => onAddCommunication(customer)}
                            block
                        >
                            Add Communication
                        </Button>
                    </TabPane>

                    <TabPane tab="Notes" key="3">
                        {Array.isArray(customer.notes) && customer.notes.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={[...customer.notes].sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0))}
                                renderItem={(note, index) => (
                                    <List.Item key={index}>
                                        <List.Item.Meta
                                            title={<span>{formatRelativeTime(note.addedAt)}</span>}
                                            description={safeString(note.content)}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No notes added yet" />
                        )}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            style={{ marginTop: 16 }}
                            onClick={() => onAddNote(customer)}
                            block
                        >
                            Add Note
                        </Button>
                    </TabPane>

                    <TabPane tab="Purchases" key="4">
                        {purchaseCount > 0 ? (
                            <Table
                                dataSource={purchasesData}
                                columns={[
                                    {
                                        title: 'Property ID',
                                        dataIndex: 'property',
                                        key: 'property',
                                        render: (property) => {
                                            return property?.name && property.name.length > 10
                                                ? property.name.substring(0, 8) + '...'
                                                : property?.name || 'N/A';
                                        }
                                    },
                                    {
                                        title: 'Date',
                                        dataIndex: 'date',
                                        key: 'date',
                                        render: (date) => formatDate(date)
                                    },
                                    {
                                        title: 'Amount (KES)',
                                        dataIndex: 'amount',
                                        key: 'amount',
                                        render: (amount) => {
                                            return typeof amount === 'number' ? amount.toLocaleString() : 'N/A';
                                        }
                                    },
                                    {
                                        title: 'Status',
                                        dataIndex: 'status',
                                        key: 'status',
                                        render: (status) => {
                                            let color = 'blue';
                                            const statusStr = safeString(status);
                                            if (statusStr === 'completed') color = 'green';
                                            if (statusStr === 'cancelled') color = 'red';
                                            if (statusStr === 'pending') color = 'orange';
                                            if (statusStr === 'reservation') color = 'purple';

                                            const statusText = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);

                                            return <Tag color={color}>{statusText}</Tag>;
                                        }
                                    },
                                    {
                                        title: 'Actions',
                                        key: 'actions',
                                        render: (_, record) => (
                                            <Space>
                                                <Button size="small" icon={<FileTextOutlined />}>
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    icon={<FilePdfOutlined />}
                                                    onClick={() => handleExtractStatement(record.id)}
                                                >
                                                    PDF
                                                </Button>
                                            </Space>
                                        ),
                                    },
                                ]}
                                pagination={false}
                            />
                        ) : (
                            <Empty description="No purchases yet" />
                        )}
                    </TabPane>

                    <TabPane tab="Payment Plans" key="6">
                        {paymentPlanCount > 0 ? (
                            <>
                                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                                    <Button
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleExtractStatement()}
                                    >
                                        Extract Full Statement to PDF
                                    </Button>
                                </div>
                                <Table
                                    dataSource={paymentPlansData}
                                    columns={[
                                        {
                                            title: 'Initial Deposit (KES)',
                                            dataIndex: 'initialDeposit',
                                            key: 'initialDeposit',
                                            render: (amount) => {
                                                return typeof amount === 'number' ? amount.toLocaleString() : 'N/A';
                                            }
                                        },
                                        {
                                            title: 'Total Amount (KES)',
                                            dataIndex: 'totalAmount',
                                            key: 'totalAmount',
                                            render: (amount) => {
                                                return typeof amount === 'number' ? amount.toLocaleString() : 'N/A';
                                            }
                                        },
                                        {
                                            title: 'Outstanding (KES)',
                                            dataIndex: 'outstandingBalance',
                                            key: 'outstandingBalance',
                                            render: (amount) => {
                                                return typeof amount === 'number' ? amount.toLocaleString() : 'N/A';
                                            }
                                        },
                                        {
                                            title: 'Status',
                                            dataIndex: 'status',
                                            key: 'status',
                                            render: (status) => {
                                                let color = 'blue';
                                                const statusStr = safeString(status);
                                                if (statusStr === 'completed') color = 'green';
                                                if (statusStr === 'inactive') color = 'red';
                                                if (statusStr === 'pending') color = 'orange';

                                                const statusText = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);

                                                return <Tag color={color}>{statusText}</Tag>;
                                            }
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'actions',
                                            render: (_, record) => (
                                                <Space>
                                                    <Button size="small" icon={<FileTextOutlined />}>
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        icon={<FilePdfOutlined />}
                                                        onClick={() => handleExtractStatement(record.id)}
                                                    >
                                                        PDF
                                                    </Button>
                                                </Space>
                                            ),
                                        },
                                    ]}
                                    pagination={false}
                                />
                            </>
                        ) : (
                            <Empty description="No payment plans yet" />
                        )}
                    </TabPane>

                    <TabPane tab="Statement" key="7">
                        <div style={{ marginBottom: 16, textAlign: 'right' }}>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={() => handleExtractStatement()}
                            >
                                Extract Statement to PDF
                            </Button>
                        </div>
                        <Empty description="Click on the tab to view the full statement" />
                    </TabPane>
                </Tabs>
            </>
        );
    };

    return (
        <Drawer
            title={`Customer Details: ${safeString(customer.name)}`}
            placement="right"
            onClose={onClose}
            open={visible}
            width={activeTab === "7" ? 900 : 700}
            footer={
                activeTab !== "7" ? (
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            onClick={() => onTabChange("7")}
                            icon={<FilePdfOutlined />}
                            style={{ marginRight: 8 }}
                        >
                            View Statement
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => onAddCommunication(customer)}
                            icon={<MessageOutlined />}
                            style={{ marginRight: 8 }}
                        >
                            Log Communication
                        </Button>
                        <Button
                            onClick={() => onAddNote(customer)}
                            icon={<CommentOutlined />}
                            style={{ marginRight: 8 }}
                        >
                            Add Note
                        </Button>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                )
            }
        >
            {renderContent()}
        </Drawer>
    );
};

export default CustomerDetailsDrawer;