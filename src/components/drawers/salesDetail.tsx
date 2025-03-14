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
    Empty,
    Alert
} from 'antd';
import {
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    PlusOutlined,
    FileTextOutlined,
    MailOutlined,
    PhoneOutlined,
    DollarOutlined,
    CalendarOutlined
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
    onAddPaymentPlan,
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
                    {sale && (!sale.status || (sale.status !== 'Completed' && sale.status !== 'Canceled')) &&
                        sale.paymentPlanType === 'Full Payment' && (
                            <Button type="primary" onClick={() => onAddPayment(sale)} style={{ marginRight: 8 }}>
                                Make Payment
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
                                        {sale.property.propertyType || 'Unknown Type'} - {sale?.property.propertyType === "apartment" ? sale.property.apartmentSize + ' sqm' : sale.property.landSize + " " + sale.property.sizeUnit}
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
                        // sale.saleStage === 'Documentation' ? 1 :
                        //     sale.saleStage === 'Financing' ? 2 :
                        //         sale.saleStage === 'Payment Collection' ? 3 :
                        sale.saleStage === 'Completed' ? 1 : 0
                }>
                    <Step
                        title="Reservation"
                        status={sale.status === 'Canceled' ? 'error' : undefined}
                    />
                    {/* <Step
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
                    /> */}
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
                            <Descriptions.Item label="Sale Date">
                                {formatDate(sale.saleDate)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            <Tabs defaultActiveKey={sale.paymentPlanType === 'Installment' ? "1" : "2"} activeKey={activeTab} onChange={onTabChange}>
                {sale.paymentPlanType === 'Installment' && (
                    <TabPane tab="Payment Plans" key="1">
                        {/* Payment Plans Section */}
                        {sale && sale.paymentPlans && sale.paymentPlans.length > 0 ? (
                            <>
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

                                <Table
                                    dataSource={sale.paymentPlans}
                                    rowKey={record => record._id || Math.random().toString()}
                                    expandable={{
                                        expandedRowRender: (plan) => {
                                            return (
                                                <>
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Descriptions column={1} size="small" title="Plan Details">
                                                                <Descriptions.Item label="Installment Amount">
                                                                    {formatCurrency(plan.installmentAmount)}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="Frequency">
                                                                    {plan.installmentFrequency.charAt(0).toUpperCase() + plan.installmentFrequency.slice(1)}
                                                                    {plan.installmentFrequency === 'custom' && plan.customFrequencyDays &&
                                                                        ` (${plan.customFrequencyDays} days)`}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="Late Penalty">
                                                                    {plan.latePenaltyPercentage}%
                                                                </Descriptions.Item>
                                                            </Descriptions>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Descriptions column={1} size="small" title="Progress">
                                                                {(() => {
                                                                    const totalPaid = plan.totalAmount - plan.outstandingBalance;
                                                                    const paidPercentage = (totalPaid / plan.totalAmount) * 100;
                                                                    return (
                                                                        <>
                                                                            <Descriptions.Item label="Paid Amount">
                                                                                {formatCurrency(totalPaid)}
                                                                            </Descriptions.Item>
                                                                            <Descriptions.Item label="Remaining">
                                                                                {formatCurrency(plan.outstandingBalance)}
                                                                            </Descriptions.Item>
                                                                            <Descriptions.Item label="Completion">
                                                                                <Progress
                                                                                    percent={Math.round(paidPercentage)}
                                                                                    size="small"
                                                                                    status={paidPercentage === 100 ? "success" : "active"}
                                                                                />
                                                                            </Descriptions.Item>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </Descriptions>
                                                        </Col>
                                                    </Row>

                                                    {/* Payments Table */}
                                                    <div style={{ marginTop: 16 }}>
                                                        <Title level={5}>Payments History</Title>
                                                        {plan.payments && plan.payments.length > 0 ? (
                                                            <Table
                                                                size="small"
                                                                columns={[
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
                                                                dataSource={plan.payments}
                                                                rowKey={record => record._id || Math.random().toString()}
                                                                pagination={false}
                                                            />
                                                        ) : (
                                                            <Empty
                                                                description="No payments recorded yet"
                                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                            />
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        }
                                    }}
                                    columns={[
                                        {
                                            title: 'Amount',
                                            dataIndex: 'installmentAmount',
                                            key: 'installmentAmount',
                                            render: installmentAmount => formatCurrency(installmentAmount)
                                        },
                                        {
                                            title: 'Frequency',
                                            dataIndex: 'installmentFrequency',
                                            key: 'frequency',
                                            render: frequency => frequency.charAt(0).toUpperCase() + frequency.slice(1)
                                        },
                                        {
                                            title: 'Total Amount',
                                            dataIndex: 'totalAmount',
                                            key: 'totalAmount',
                                            render: amount => formatCurrency(amount)
                                        },
                                        {
                                            title: 'Deposit',
                                            dataIndex: 'initialDeposit',
                                            key: 'deposit',
                                            render: amount => formatCurrency(amount)
                                        },
                                        {
                                            title: 'Remaining',
                                            dataIndex: 'outstandingBalance',
                                            key: 'remaining',
                                            render: amount => formatCurrency(amount)
                                        },
                                        {
                                            title: 'Start Date',
                                            dataIndex: 'startDate',
                                            key: 'startDate',
                                            render: date => formatDate(date)
                                        },
                                        {
                                            title: 'Status',
                                            dataIndex: 'status',
                                            key: 'status',
                                            render: status => (
                                                <Tag color={
                                                    status === 'active' ? 'green' :
                                                        status === 'completed' ? 'blue' :
                                                            status === 'defaulted' ? 'red' : 'orange'
                                                }>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </Tag>
                                            )
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'actions',
                                            render: (text, record) => (
                                                <Space>
                                                    {record.status === 'active' && sale.status !== 'Completed' && sale.status !== 'Canceled' && (
                                                        <Button
                                                            type="primary"
                                                            onClick={() => onAddPayment(sale, record)}
                                                            icon={<DollarOutlined />}
                                                            size="small"
                                                        >
                                                            Make Payment
                                                        </Button>
                                                    )}
                                                    <Button size="small" icon={<FileTextOutlined />}>
                                                        Details
                                                    </Button>
                                                </Space>
                                            )
                                        }
                                    ]}
                                />
                            </>
                        ) : (
                            <Card>
                                <Alert
                                    message="No Payment Plans"
                                    description="This sale doesn't have any payment plans yet."
                                    type="info"
                                    showIcon
                                />
                            </Card>
                        )}
                    </TabPane>
                )}

                <TabPane tab="Payments" key="2">
                    {/* Overall Payment Statistics */}
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

                    {/* All Payments Table */}
                    <Table
                        columns={[
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
                                title: 'Plan',
                                dataIndex: 'paymentPlan',
                                key: 'plan',
                                render: (plan) => plan ? `Plan #${plan.toString().substr(-6)}` : 'Direct Payment'
                            },
                            {
                                title: 'Method',
                                dataIndex: 'paymentMethod',
                                key: 'method',
                                render: method => {
                                    if (!method) return 'N/A';
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
                </TabPane>

                <TabPane tab="Timeline" key="3">
                    <Timeline mode="left">
                        {sale && sale.activities && sale.activities.length > 0 ? (
                            sale.activities.map((item, index) => (
                                <Timeline.Item
                                    key={index}
                                    label={formatDate(item.date)}
                                    color={
                                        item.event === 'Cancellation' || item.event === 'Refund' ? 'red' :
                                            item.event === 'Sale Agreement' || item.event === 'Final Payment' ? 'green' :
                                                'blue'
                                    }
                                >
                                    <div style={{ fontWeight: 'bold' }}>{item.activityType}</div>
                                    <div>{item.description}</div>
                                </Timeline.Item>
                            ))
                        ) : (
                            <Timeline.Item>No timeline activities available</Timeline.Item>
                        )}
                    </Timeline>

                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                        block
                        onClick={onAddEvent}
                    >
                        Add Activity
                    </Button>
                </TabPane>

                <TabPane tab="Customer Details" key="4">
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