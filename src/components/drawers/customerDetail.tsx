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
    DownloadOutlined
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

// PDF Generation Function
// PDF Generation Function
// PDF Generation Function
// PDF Generation Function
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
                    if (safeString(plan.status).toLowerCase() === 'completed') {
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
                        safeString(plan.status).toLowerCase() === 'completed' ?
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

    // Function to handle statement extraction
    const handleExtractStatement = async (planId = null) => {
        try {
            message.loading({ content: 'Generating statement...', key: 'pdfGeneration' });

            // Generate the PDF
            const pdfBlob = await generateCustomerStatementPDF(customer, planId);

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

    return (
        <Drawer
            title={`Customer Details: ${safeString(customer.name)}`}
            placement="right"
            onClose={onClose}
            open={visible}
            width={700}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button
                        onClick={() => handleExtractStatement()}
                        icon={<FilePdfOutlined />}
                        style={{ marginRight: 8 }}
                    >
                        Extract Statement
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
            }
        >
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
            </Tabs>
        </Drawer>
    );
};

export default CustomerDetailsDrawer;