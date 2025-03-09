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

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const CustomerDetailsDrawer = ({
    visible,
    customer,
    activeTab,
    onTabChange,
    onClose,
    onAddCommunication,
    onAddNote,
    formatDate
}) => {
    if (!customer) {
        return null;
    }

    return (
        <Drawer
            title={`Customer Details: ${customer.name}`}
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
                        <Title level={4}>{customer.name}</Title>
                        <Space direction="vertical">
                            <Text>
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {customer.phone}{' '}
                                {customer.verifiedPhone && (
                                    <Tag color="success">Verified</Tag>
                                )}
                            </Text>
                            <Text>
                                <MailOutlined style={{ marginRight: 8 }} />
                                {customer.email}
                            </Text>
                            <Text>
                                <IdcardOutlined style={{ marginRight: 8 }} />
                                ID: {customer.idNumber}
                            </Text>
                            <Text>
                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                {customer.address.street}, {customer.address.city}, {customer.address.county}
                            </Text>
                        </Space>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Tag
                            color={customer.customerType === 'individual' ? 'blue' : 'purple'}
                            style={{ fontSize: '14px', padding: '4px 8px' }}
                        >
                            {customer.customerType === 'individual' ? 'Individual' : 'Company'}
                        </Tag>
                        {customer.company && (
                            <div style={{ marginTop: 8 }}>
                                <Text strong>Company:</Text>{' '}
                                {customer.company}
                            </div>
                        )}
                        {customer.occupation && (
                            <div style={{ marginTop: 8 }}>
                                <Text strong>Occupation:</Text>{' '}
                                {customer.occupation}
                            </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                            <Text strong>Customer Since:</Text>{' '}
                            {customer.createdAt}
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
                            value={customer.purchases}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title="Payment Plans"
                            value={customer.paymentPlans}
                            prefix={<CreditCardOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title="Communications"
                            value={customer.communications ? customer.communications.length : 0}
                            prefix={<MessageOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}>
                <TabPane tab="Preferences" key="1">
                    <Card title="Property Preferences" style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Property Types">
                                        {customer.preferences.propertyTypes.map(type => (
                                            <Tag key={type} color={type === 'apartment' ? 'green' : 'orange'}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Tag>
                                        ))}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Preferred Locations">
                                        {customer.preferences.locations.join(', ')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Budget Range">
                                        KES {customer.preferences.budgetRange.min.toLocaleString()} - {customer.preferences.budgetRange.max.toLocaleString()}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Desired Amenities">
                                        {customer.preferences.amenities.length > 0
                                            ? customer.preferences.amenities.join(', ')
                                            : 'None specified'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Other Requirements">
                                        {customer.preferences.otherRequirements || 'None specified'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </Card>
                </TabPane>

                <TabPane tab="Communications" key="2">
                    {customer.communications && customer.communications.length > 0 ? (
                        <Timeline mode="left" style={{ marginTop: 20 }}>
                            {[...customer.communications]
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map((comm, index) => (
                                    <Timeline.Item
                                        key={index}
                                        label={comm.date}
                                        color={
                                            comm.type === 'call'
                                                ? 'blue'
                                                : comm.type === 'meeting'
                                                    ? 'green'
                                                    : comm.type === 'email'
                                                        ? 'purple'
                                                        : 'gray'
                                        }
                                        dot={
                                            comm.type === 'call' ? <PhoneOutlined /> :
                                                comm.type === 'email' ? <MailOutlined /> :
                                                    comm.type === 'meeting' ? <TeamOutlined /> :
                                                        comm.type === 'sms' ? <MessageOutlined /> :
                                                            <MessageOutlined />
                                        }
                                    >
                                        <div style={{ fontWeight: 'bold' }}>
                                            {comm?.type ? comm.type.charAt(0).toUpperCase() + comm.type.slice(1) : ''}
                                        </div>
                                        <div><strong>Summary:</strong> {comm?.summary || ''}</div>
                                        <div><strong>Outcome:</strong> {comm.outcome}</div>
                                        {comm.nextAction && (
                                            <div><strong>Next Action:</strong> {comm.nextAction}</div>
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
                    {customer.notes && customer.notes.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={[...customer.notes].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))}
                            renderItem={(note, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<span>{new Date(note.addedAt).toLocaleString()}</span>}
                                        description={note.content}
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
                    <List
                        itemLayout="horizontal"
                        dataSource={customer.documents || []}
                        renderItem={(doc) => (
                            <List.Item
                                actions={[
                                    <Button type="link">View</Button>,
                                    <Button type="link">Download</Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<FileTextOutlined />} />}
                                    title={doc.name}
                                    description={
                                        <>
                                            <Tag color="blue">{doc.type}</Tag>
                                            <span style={{ marginLeft: 8 }}>
                                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </span>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                    >
                        Upload Document
                    </Button>
                </TabPane>

                <TabPane tab="Purchases" key="5">
                    {customer.purchases > 0 ? (
                        <Table
                            dataSource={[
                                {
                                    id: 'S001',
                                    property: 'Garden City 3-Bedroom Apartment',
                                    date: '2025-02-01',
                                    amount: 8900000,
                                    status: 'Completed',
                                },
                            ]}
                            columns={[
                                {
                                    title: 'Sale ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                },
                                {
                                    title: 'Property',
                                    dataIndex: 'property',
                                    key: 'property',
                                },
                                {
                                    title: 'Date',
                                    dataIndex: 'date',
                                    key: 'date',
                                },
                                {
                                    title: 'Amount (KES)',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    render: (amount) => amount.toLocaleString(),
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status) => (
                                        <Tag color="green">{status}</Tag>
                                    ),
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
                    {customer.paymentPlans > 0 ? (
                        <Table
                            dataSource={[
                                {
                                    id: 'PP001',
                                    property: 'Garden City 3-Bedroom Apartment',
                                    startDate: '2025-01-15',
                                    amount: 8900000,
                                    paid: 2225000,
                                    remaining: 6675000,
                                    status: 'Active',
                                },
                            ]}
                            columns={[
                                {
                                    title: 'Plan ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                },
                                {
                                    title: 'Property',
                                    dataIndex: 'property',
                                    key: 'property',
                                },
                                {
                                    title: 'Start Date',
                                    dataIndex: 'startDate',
                                    key: 'startDate',
                                },
                                {
                                    title: 'Total (KES)',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    render: (amount) => amount.toLocaleString(),
                                },
                                {
                                    title: 'Paid (KES)',
                                    dataIndex: 'paid',
                                    key: 'paid',
                                    render: (paid) => paid.toLocaleString(),
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status) => (
                                        <Tag color="blue">{status}</Tag>
                                    ),
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