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
    Avatar
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
    PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';

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
                property: safeString(purchase.property),
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

                <TabPane tab="Documents" key="4">
                    {Array.isArray(customer.documents) && customer.documents.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={customer.documents}
                            renderItem={(doc, index) => (
                                <List.Item key={index}
                                    actions={[
                                        <Button type="link">View</Button>,
                                        <Button type="link">Download</Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<FileTextOutlined />} />}
                                        title={safeString(doc.name)}
                                        description={
                                            <>
                                                <Tag color="blue">{safeString(doc.type)}</Tag>
                                                <span style={{ marginLeft: 8 }}>
                                                    Uploaded: {formatDate(doc.uploadedAt)}
                                                </span>
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="No documents uploaded yet" />
                    )}

                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                        block
                    >
                        Upload Document
                    </Button>
                </TabPane>

                <TabPane tab="Purchases" key="5">
                    {purchaseCount > 0 ? (
                        <Table
                            dataSource={purchasesData}
                            columns={[
                                {
                                    title: 'Sale ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                    render: (id) => {
                                        return id && id.length > 10 ? id.substring(0, 8) + '...' : id || 'N/A';
                                    }
                                },
                                {
                                    title: 'Property ID',
                                    dataIndex: 'property',
                                    key: 'property',
                                    render: (property) => {
                                        return property && property.length > 10 ? property.substring(0, 8) + '...' : property || 'N/A';
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
                                    render: () => (
                                        <Button size="small" icon={<FileTextOutlined />}>
                                            View
                                        </Button>
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
                        <Table
                            dataSource={paymentPlansData}
                            columns={[
                                {
                                    title: 'Plan ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                    render: (id) => {
                                        return id && id.length > 10 ? id.substring(0, 8) + '...' : id || 'N/A';
                                    }
                                },
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
                                    render: () => (
                                        <Button size="small" icon={<FileTextOutlined />}>
                                            View
                                        </Button>
                                    ),
                                },
                            ]}
                            pagination={false}
                        />
                    ) : (
                        <Empty description="No payment plans yet" />
                    )}
                </TabPane>
            </Tabs>
        </Drawer>
    );
};

export default CustomerDetailsDrawer;