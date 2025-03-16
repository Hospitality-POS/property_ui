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

    // Map the status to the display value
    const getStatusDisplay = (status) => {
        if (!status) return { text: 'Unknown', color: 'default' };

        const statusMap = {
            'reservation': { text: 'Reserved', color: 'orange' },
            'agreement': { text: 'Agreement', color: 'blue' },
            'processing': { text: 'Processing', color: 'cyan' },
            'completed': { text: 'Completed', color: 'green' },
            'cancelled': { text: 'Cancelled', color: 'red' }
        };

        const statusInfo = statusMap[status.toLowerCase()] || { text: status, color: 'default' };
        return statusInfo;
    };

    // Get unit information from the sale
    const getUnitInfo = () => {
        if (sale.unit) {
            return {
                type: sale.unit.unitType,
                plotSize: sale.unit.plotSize,
                price: sale.unit.price
            };
        }
        return {
            type: 'Unknown Unit',
            plotSize: '',
            price: 0
        };
    };

    const unitInfo = getUnitInfo();
    const statusInfo = getStatusDisplay(sale.status);

    return (
        <Drawer
            title="Sale Details"
            placement="right"
            onClose={onClose}
            open={visible}
            width={700}
            footer={
                <div style={{ textAlign: 'right' }}>
                    {sale && sale.status !== 'completed' && sale.status !== 'cancelled' &&
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
                                        {sale.property.propertyType || 'Unknown Type'} - Unit: {unitInfo.type}
                                        {unitInfo.plotSize ? ` - ${unitInfo.plotSize} sqm` : ''}
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
                        <Tag color={statusInfo.color} style={{ fontSize: '14px', padding: '4px 8px' }}>
                            {statusInfo.text}
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
                    sale.status === 'reservation' ? 0 :
                        sale.status === 'agreement' ? 1 :
                            sale.status === 'processing' ? 2 :
                                sale.status === 'completed' ? 3 : 0
                }>
                    <Step
                        title="Reservation"
                        status={sale.status === 'cancelled' ? 'error' : undefined}
                    />
                    <Step
                        title="Agreement"
                        status={sale.status === 'cancelled' ? 'error' : undefined}
                    />
                    <Step
                        title="Processing"
                        status={sale.status === 'cancelled' ? 'error' : undefined}
                    />
                    <Step
                        title="Completed"
                        status={sale.status === 'cancelled' ? 'error' : undefined}
                    />
                </Steps>
            </div>

            {/* Sale Overview */}
            <Card title="Sale Overview" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Sale Price">{formatCurrency(sale.salePrice)}</Descriptions.Item>
                            <Descriptions.Item label="List Price">{formatCurrency(unitInfo.price)}</Descriptions.Item>
                            <Descriptions.Item label="Unit Type">{unitInfo.type || 'Not specified'}</Descriptions.Item>
                            {unitInfo.plotSize && (
                                <Descriptions.Item label="Plot Size">{unitInfo.plotSize} sqm</Descriptions.Item>
                            )}
                            <Descriptions.Item label="Quantity">{sale.quantity || 1}</Descriptions.Item>
                            <Descriptions.Item label="Payment Plan">
                                {sale.paymentPlanType || 'Full Payment'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col span={12}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Agent">{sale.salesAgent?.name || 'Not assigned'}</Descriptions.Item>
                            <Descriptions.Item label="Property Manager">{sale.propertyManager?.name || 'Not assigned'}</Descriptions.Item>
                            <Descriptions.Item label="Commission">{formatCurrency(sale.commission?.amount)}</Descriptions.Item>
                            <Descriptions.Item label="Commission %">{sale.commission?.percentage || 5}%</Descriptions.Item>
                            <Descriptions.Item label="Reservation Fee">{formatCurrency(sale.reservationFee) || 'N/A'}</Descriptions.Item>
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
                                                                <Descriptions.Item label="Initial Deposit">
                                                                    {formatCurrency(plan.initialDeposit)}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="Total Amount">
                                                                    {formatCurrency(plan.totalAmount)}
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
                                                            status === 'pending' ? 'orange' : 'red'
                                                }>
                                                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
                                                </Tag>
                                            )
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'actions',
                                            render: (text, record) => (
                                                <Space>
                                                    {record.status === 'active' && sale.status !== 'completed' && sale.status !== 'cancelled' && (
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
                    {sale && sale.status !== 'cancelled' && (
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

                <TabPane tab="Activities" key="3">
                    <Timeline mode="left">
                        {sale && sale.activities && sale.activities.length > 0 ? (
                            sale.activities.map((item, index) => (
                                <Timeline.Item
                                    key={index}
                                    label={formatDate(item.date)}
                                    color={
                                        item.activityType === 'Cancellation' || item.activityType === 'Refund' ? 'red' :
                                            item.activityType === 'Sale Agreement' || item.activityType === 'Final Payment' ? 'green' :
                                                'blue'
                                    }
                                >
                                    <div style={{ fontWeight: 'bold' }}>{item.activityType}</div>
                                    <div>{item.description}</div>
                                </Timeline.Item>
                            ))
                        ) : sale && sale.events && sale.events.length > 0 ? (
                            sale.events.map((item, index) => (
                                <Timeline.Item
                                    key={index}
                                    label={formatDate(item.addedAt)}
                                    color={
                                        item.event.includes('Cancel') ? 'red' :
                                            item.event.includes('Complet') ? 'green' :
                                                'blue'
                                    }
                                >
                                    <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                                </Timeline.Item>
                            ))
                        ) : (
                            <Timeline.Item>No activities or events available</Timeline.Item>
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
                            <Descriptions.Item label="Address">{sale.customer?.address || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="ID Number">{sale.customer?.identificationNumber || 'N/A'}</Descriptions.Item>
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

                {/* <TabPane tab="Documents" key="5">
                    <Card>
                        {sale.documents && Array.isArray(sale.documents) && sale.documents.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={sale.documents}
                                renderItem={(doc, index) => (
                                    <List.Item
                                        actions={[
                                            <Button type="link" key="view">View</Button>,
                                            <Button type="link" key="download">Download</Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={doc.name || `Document ${index + 1}`}
                                            description={`Type: ${doc.type || 'Unknown'} - Uploaded: ${formatDate(doc.uploadedAt)}`}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty
                                description="No documents available"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                        <div style={{ marginTop: 16 }}>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                block
                            >
                                Upload Document
                            </Button>
                        </div>
                    </Card>
                </TabPane> */}

                <TabPane tab="Notes" key="5">
                    <Card>
                        {sale.notes && Array.isArray(sale.notes) && sale.notes.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={sale.notes}
                                renderItem={(note, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={`Note ${index + 1} - ${formatDate(note.addedAt || note.createdAt)}`}
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