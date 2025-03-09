import {
    Drawer,
    Button,
    Row,
    Col,
    Typography,
    Tag,
    Divider,
    Steps,
    Card,
    Statistic,
    Progress,
    Tabs,
    Table,
    Timeline,
    List,
    Avatar,
    Input,
    Descriptions,
    Space,
    Empty
} from 'antd';
import {
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    PlusOutlined,
    FileTextOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { TextArea } = Input;

export const SaleDetailsDrawer = ({
    visible,
    sale,
    activeTab,
    onTabChange,
    onClose,
    onAddPayment,
    onAddEvent,
    noteText,
    setNoteText,
    onSaveNotes,
    formatCurrency,
    formatDate,
    calculatePaymentStats
}) => {
    if (!sale) {
        return null;
    }

    return (
        <Drawer
            title="Sale Details"
            placement="right"
            onClose={onClose}
            open={visible}
            width={700}
            footer={
                <div style={{ textAlign: 'right' }}>
                    {sale && (!sale.status || (sale.status !== 'Completed' && sale.status !== 'Canceled')) && (
                        <Button type="primary" onClick={() => onAddPayment(sale)} style={{ marginRight: 8 }}>
                            Add Payment
                        </Button>
                    )}
                    <Button onClick={onClose}>Close</Button>
                </div>
            }
        >
            <div style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Title level={4}>{sale.property?.title || sale.property?.name || 'Unnamed Property'}</Title>
                        <Space direction="vertical">
                            {sale.property && (
                                <>
                                    <Text>
                                        <HomeOutlined style={{ marginRight: 8 }} />
                                        {sale.property.propertyType || 'Unknown Type'} - {sale.property.size || 'Unknown Size'}
                                    </Text>
                                    <Text>
                                        <EnvironmentOutlined style={{ marginRight: 8 }} />
                                        {sale.property.location?.address || 'Unknown Location'}
                                    </Text>
                                </>
                            )}
                            <Text>
                                <UserOutlined style={{ marginRight: 8 }} />
                                Customer: {sale.customer?.name || 'Unknown Customer'}
                            </Text>
                        </Space>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Tag color={
                            !sale.status ? 'default' :
                                sale.status === 'Reserved' ? 'orange' :
                                    sale.status === 'Processing' ? 'blue' :
                                        sale.status === 'In Progress' ? 'cyan' :
                                            sale.status === 'Completed' ? 'green' : 'red'
                        } style={{ fontSize: '14px', padding: '4px 8px' }}>
                            {sale.status || 'Unknown Status'}
                        </Tag>
                        <div style={{ marginTop: 8 }}>
                            <Text strong>Sale Date:</Text> {formatDate(sale.saleDate)}
                        </div>
                    </Col>
                </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Sale Progress Steps */}
            <div style={{ marginBottom: 24 }}>
                <Steps size="small" current={
                    sale.saleStage === 'Reservation' ? 0 :
                        sale.saleStage === 'Documentation' ? 1 :
                            sale.saleStage === 'Financing' ? 2 :
                                sale.saleStage === 'Payment Collection' ? 3 :
                                    sale.saleStage === 'Completed' ? 4 : 0
                }>
                    <Step
                        title="Reservation"
                        status={sale.status === 'Canceled' ? 'error' : undefined}
                    />
                    <Step
                        title="Documentation"
                        status={sale.status === 'Canceled' ? 'error' : undefined}
                    />
                    <Step
                        title="Financing"
                        status={sale.status === 'Canceled' ? 'error' : undefined}
                    />
                    <Step
                        title="Payment"
                        status={sale.status === 'Canceled' ? 'error' : undefined}
                    />
                    <Step
                        title="Completed"
                        status={sale.status === 'Canceled' ? 'error' : undefined}
                    />
                </Steps>
            </div>

            {/* Sale Overview */}
            <Card title="Sale Overview" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Sale Price">{formatCurrency(sale.salePrice)}</Descriptions.Item>
                            <Descriptions.Item label="List Price">{formatCurrency(sale.property?.price) || 'Not specified'}</Descriptions.Item>
                            <Descriptions.Item label="Discount">
                                {sale.discount && parseFloat(sale.discount) > 0 ? formatCurrency(sale.discount) : 'None'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Plan">
                                {sale.paymentPlans && sale.paymentPlans.length > 0
                                    ? `Installment (${sale.paymentPlans[0].installmentFrequency || 'custom'})`
                                    : 'Full Payment'}
                            </Descriptions.Item>
                            {sale.paymentPlans && sale.paymentPlans.length > 0 && (
                                <>
                                    <Descriptions.Item label="Initial Deposit">
                                        {formatCurrency(sale.paymentPlans[0].initialDeposit)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Installment Amount">
                                        {formatCurrency(sale.paymentPlans[0].installmentAmount)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Outstanding Balance">
                                        {formatCurrency(sale.paymentPlans[0].outstandingBalance)}
                                    </Descriptions.Item>
                                </>
                            )}
                        </Descriptions>
                    </Col>
                    <Col span={12}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Agent">{sale.salesAgent?.name || 'Not assigned'}</Descriptions.Item>
                            <Descriptions.Item label="Commission">{formatCurrency(sale.commission?.amount)}</Descriptions.Item>
                            {sale.paymentPlans && sale.paymentPlans.length > 0 && (
                                <>
                                    <Descriptions.Item label="Plan Start Date">
                                        {formatDate(sale.paymentPlans[0].startDate)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Plan End Date">
                                        {formatDate(sale.paymentPlans[0].endDate)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Plan Status">
                                        <Tag color={sale.paymentPlans[0].status === 'active' ? 'green' : 'orange'}>
                                            {sale.paymentPlans[0].status?.charAt(0).toUpperCase() + sale.paymentPlans[0].status?.slice(1) || 'Unknown'}
                                        </Tag>
                                    </Descriptions.Item>
                                </>
                            )}
                            <Descriptions.Item label="Reservation Fee">{formatCurrency(sale.reservationFee)}</Descriptions.Item>
                            <Descriptions.Item label="Documents">
                                {sale.documents && Array.isArray(sale.documents) && sale.documents.length > 0
                                    ? sale.documents.join(', ')
                                    : 'None'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sale Date">
                                {formatDate(sale.saleDate)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}>
                <TabPane tab="Payments" key="1">
                    {sale && sale.status !== 'Canceled' && (
                        <Card style={{ marginBottom: 16 }}>
                            {(() => {
                                const stats = calculatePaymentStats(sale);
                                return (
                                    <>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Statistic
                                                    title="Total Amount"
                                                    value={stats.totalAmount}
                                                    formatter={value => formatCurrency(value)}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <Statistic
                                                    title="Paid Amount"
                                                    value={stats.paidAmount}
                                                    formatter={value => formatCurrency(value)}
                                                    valueStyle={{ color: '#3f8600' }}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <Statistic
                                                    title="Remaining Amount"
                                                    value={stats.remainingAmount + stats.pendingAmount}
                                                    formatter={value => formatCurrency(value)}
                                                    valueStyle={{ color: '#cf1322' }}
                                                />
                                            </Col>
                                        </Row>
                                        <div style={{ marginTop: 16 }}>
                                            <Progress percent={Math.round(stats.paidPercentage)} status="active" />
                                        </div>
                                    </>
                                );
                            })()}
                        </Card>
                    )}

                    <Table
                        columns={[
                            {
                                title: 'Payment ID',
                                dataIndex: '_id',
                                key: 'id',
                                render: id => id || 'N/A'
                            },
                            {
                                title: 'Date',
                                dataIndex: 'paymentDate',
                                key: 'date',
                                render: date => formatDate(date) || 'N/A'
                            },
                            {
                                title: 'Amount',
                                dataIndex: 'amount',
                                key: 'amount',
                                render: amount => formatCurrency(amount)
                            },
                            {
                                title: 'Method',
                                dataIndex: 'paymentMethod',
                                key: 'method',
                                render: method => {
                                    if (!method) return 'N/A';
                                    // Convert snake_case to Title Case
                                    return method.split('_')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');
                                }
                            },
                            {
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status) => (
                                    <Tag color={
                                        status === 'Paid' || status === 'completed' ? 'green' :
                                            status === 'Pending' || status === 'pending' ? 'orange' :
                                                status === 'Refunded' || status === 'refunded' ? 'red' : 'default'
                                    }>
                                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'Reference',
                                dataIndex: 'transactionReference',
                                key: 'reference',
                                render: reference => reference || 'N/A'
                            },
                            {
                                title: 'Notes',
                                dataIndex: 'notes',
                                key: 'notes',
                                render: notes => notes || 'N/A'
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (text, record) => (
                                    <Space>
                                        {(record.status === 'Pending' || record.status === 'pending') && (
                                            <Button size="small" type="primary">Confirm</Button>
                                        )}
                                        <Button size="small">Receipt</Button>
                                    </Space>
                                ),
                            },
                        ]}
                        dataSource={(() => {
                            // Get payments from paymentPlans
                            let allPayments = [];

                            // Check if paymentPlans array exists and has items
                            if (sale.paymentPlans && Array.isArray(sale.paymentPlans) && sale.paymentPlans.length > 0) {
                                // Collect all payments from all payment plans
                                sale.paymentPlans.forEach(plan => {
                                    if (plan.payments && Array.isArray(plan.payments)) {
                                        allPayments = [...allPayments, ...plan.payments];
                                    }
                                });
                            }

                            // Fallback to sale.payments if no payments found in paymentPlans
                            if (allPayments.length === 0 && sale.payments && Array.isArray(sale.payments)) {
                                allPayments = sale.payments;
                            }

                            return allPayments;
                        })()}
                        rowKey={record => record._id || Math.random().toString()}
                        pagination={false}
                    />

                    {sale.status !== 'Completed' && sale.status !== 'Canceled' && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ marginTop: 16 }}
                            onClick={() => onAddPayment(sale)}
                        >
                            Add Payment
                        </Button>
                    )}
                </TabPane>

                <TabPane tab="Timeline" key="2">
                    <Timeline mode="left">
                        {sale && sale.timeline && sale.timeline.length > 0 ? (
                            sale.timeline.map((item, index) => (
                                <Timeline.Item
                                    key={index}
                                    label={formatDate(item.date)}
                                    color={
                                        item.event === 'Cancellation' || item.event === 'Refund' ? 'red' :
                                            item.event === 'Sale Agreement' || item.event === 'Final Payment' ? 'green' :
                                                'blue'
                                    }
                                >
                                    <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                                    <div>{item.description}</div>
                                </Timeline.Item>
                            ))
                        ) : (
                            <Timeline.Item>No timeline events available</Timeline.Item>
                        )}
                    </Timeline>

                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                        block
                        onClick={onAddEvent}
                    >
                        Add Event
                    </Button>
                </TabPane>

                <TabPane tab="Customer Details" key="3">
                    <Card>
                        <Descriptions title="Customer Information" bordered column={1}>
                            <Descriptions.Item label="Name">{sale.customer?.name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Contact Number">{sale.customer?.contactNumber || sale.customer?.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{sale.customer?.email || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                            <Space>
                                <Button icon={<MailOutlined />}>Send Email</Button>
                                <Button icon={<PhoneOutlined />}>Call</Button>
                                <Button type="primary" icon={<UserOutlined />}>View Profile</Button>
                            </Space>
                        </div>
                    </Card>
                </TabPane>

                <TabPane tab="Documents" key="4">
                    <List
                        itemLayout="horizontal"
                        dataSource={sale.documents || []}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button type="link">View</Button>,
                                    <Button type="link">Download</Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<FileTextOutlined />} />}
                                    title={item}
                                    description="Document details would appear here"
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

                <TabPane tab="Notes" key="5">
                    <Card>
                        {sale.notes && Array.isArray(sale.notes) && sale.notes.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={sale.notes}
                                renderItem={(note, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={`Note ${index + 1} - ${formatDate(note.createdAt)}`}
                                            description={note.content || note.text || '(No content)'}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Paragraph>No notes available.</Paragraph>
                        )}
                        <div style={{ marginTop: 16 }}>
                            <TextArea
                                rows={4}
                                placeholder="Add notes here..."
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                            />
                            <Button
                                type="primary"
                                style={{ marginTop: 8 }}
                                onClick={onSaveNotes}
                            >
                                Save Notes
                            </Button>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>
        </Drawer>
    );
};

export default SaleDetailsDrawer;