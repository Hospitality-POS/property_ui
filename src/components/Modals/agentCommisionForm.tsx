import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    DatePicker,
    InputNumber,
    Card,
    Row,
    Col,
    Typography,
    Space,
    message,
    Divider,
    Statistic,
    Table,
    Tag,
    Alert,
    Tooltip,
    Spin
} from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchAllUsers } from '../../services/auth.api';
import { fetchAllSales, createNewComm } from '../../services/sales';

const { Title, Text } = Typography;
const { Option } = Select;

// Calculate amount paid for a sale directly from payments array
const calculateAmountPaid = (sale) => {
    // For completed sales, the full sale price has been paid
    if (sale?.status === 'completed') {
        return parseFloat(sale.salePrice) || 0;
    }

    // Get directly from payments array
    if (sale?.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
        return sale.payments.reduce((sum, payment) => {
            const amount = parseFloat(payment.amount) || 0;
            return sum + amount;
        }, 0);
    }

    // If there's data in saleData
    if (sale?.saleData) {
        if (sale.saleData.status === 'completed') {
            return parseFloat(sale.saleData.salePrice) || 0;
        }

        if (sale.saleData.payments && Array.isArray(sale.saleData.payments) && sale.saleData.payments.length > 0) {
            return sale.saleData.payments.reduce((sum, payment) => {
                const amount = parseFloat(payment.amount) || 0;
                return sum + amount;
            }, 0);
        }
    }

    // Fallback to amountPaid field if it exists
    return parseFloat(sale?.amountPaid) || 0;
};

// Calculate the accrued commission based on amount paid
const calculateAccruedCommission = (sale) => {
    const amountPaid = calculateAmountPaid(sale);

    // Get commission rate
    let commissionRate = 0;
    if (sale?.commission?.percentage) {
        commissionRate = parseFloat(sale.commission.percentage) / 100;
    } else if (sale?.commissionPercentage) {
        commissionRate = parseFloat(sale.commissionPercentage) / 100;
    } else {
        commissionRate = 0.05; // Default to 5% if no rate found
    }

    return amountPaid * commissionRate;
};

const CommissionPaymentForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [agents, setAgents] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [commission, setCommission] = useState({});
    const [exceedsAccrued, setExceedsAccrued] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Select agent, 2: Select sale, 3: Payment details

    // Load agents and sales data
    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                // Fetch agents
                const agentsResponse = await fetchAllUsers();
                const salesAgents = Array.isArray(agentsResponse)
                    ? agentsResponse.filter(user => user.role === 'sales_agent')
                    : [];
                setAgents(salesAgents);

                // Fetch sales data
                const salesResponse = await fetchAllSales();
                if (salesResponse && salesResponse.data && Array.isArray(salesResponse.data)) {
                    setSalesData(salesResponse.data);
                } else if (salesResponse && Array.isArray(salesResponse)) {
                    setSalesData(salesResponse);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                message.error('Failed to load sales agents or sales data');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    // Format currency helper
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return 'KES 0';
        }
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    // Get commission status color
    const getCommissionStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#52c41a';
            case 'partial': return '#faad14';
            default: return '#ff4d4f';
        }
    };

    // Handle agent selection
    const handleAgentChange = (agentId) => {
        setTableLoading(true);
        setSelectedSale(null);
        setCommission({});
        setStep(2); // Move to sale selection step

        // Filter sales based on selected agent
        const agentSales = salesData.filter(sale =>
            (sale.salesAgent?._id === agentId || sale.salesAgent?.id === agentId)
        );

        // Process sales data to include commission information
        const processedSales = agentSales.map(sale => {
            const amountPaid = calculateAmountPaid(sale);
            const accruedCommission = calculateAccruedCommission(sale);
            const commissionPaid = sale.commission?.payments?.reduce(
                (sum, payment) => sum + (parseFloat(payment.amount) || 0), 0
            ) || 0;

            return {
                ...sale,
                amountPaid,
                accruedCommission,
                commissionPaid,
                availableCommission: accruedCommission - commissionPaid
            };
        });

        setFilteredSales(processedSales);
        setTableLoading(false);
    };

    // Handle sale selection
    const handleSaleSelection = (sale) => {
        setSelectedSale(sale);
        setStep(3); // Move to payment details step

        // Calculate accrued commission based on actual client payments
        const accruedCommission = calculateAccruedCommission(sale);

        // Calculate commission data
        const commissionData = {
            total: sale.commission?.amount || 0,
            paid: sale.commission?.payments?.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0) || 0,
            status: sale.commission?.status || 'pending',
            payments: sale.commission?.payments || [],
            accrued: accruedCommission
        };

        // Calculate remaining as the minimum of (total - paid) and (accrued - paid)
        const normalRemaining = commissionData.total - commissionData.paid;
        const accruedRemaining = commissionData.accrued - commissionData.paid;

        commissionData.remaining = Math.min(normalRemaining, accruedRemaining);
        commissionData.percentagePaid = (commissionData.paid / commissionData.total * 100).toFixed(2);

        setCommission(commissionData);

        // Initialize form with default values
        form.setFieldsValue({
            amount: commissionData.remaining > 0 ? commissionData.remaining : undefined,
            paymentMethod: 'bank transfer',
            paymentDate: moment(),
            paidTo: sale.salesAgent?._id || sale.salesAgent?.id || '',
            reference: '',
            notes: ''
        });
    };

    // Handle amount change to validate
    const handleAmountChange = (value) => {
        if (value > commission.accrued - commission.paid) {
            setExceedsAccrued(true);
        } else {
            setExceedsAccrued(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Double check that amount doesn't exceed accrued commission
            if (values.amount > commission.accrued - commission.paid) {
                message.error('Payment amount cannot exceed accrued commission');
                return;
            }

            setLoading(true);

            const paymentData = {
                ...values,
                paymentDate: values.paymentDate.format('YYYY-MM-DD')
            };

            // Submit payment
            const response = await createNewComm(selectedSale._id, paymentData);

            if (response.success) {
                message.success('Commission payment added successfully');

                // Reset form and state
                form.resetFields();
                setSelectedSale(null);
                setCommission({});
                setStep(1);

                // Refresh sales data
                try {
                    const salesResponse = await fetchAllSales();
                    if (salesResponse && salesResponse.data && Array.isArray(salesResponse.data)) {
                        setSalesData(salesResponse.data);
                    } else if (salesResponse && Array.isArray(salesResponse)) {
                        setSalesData(salesResponse);
                    }
                    setFilteredSales([]);
                } catch (error) {
                    console.error('Error refreshing sales data:', error);
                }
            } else {
                throw new Error(response.message || 'Failed to add commission payment');
            }
        } catch (error) {
            console.error('Error adding commission payment:', error);
            message.error('Failed to add commission payment: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Table columns for sales
    const columns = [
        {
            title: 'Sale Code',
            dataIndex: 'saleCode',
            key: 'saleCode',
            width: 120,
        },
        {
            title: 'Property',
            dataIndex: 'property',
            key: 'property',
            render: (_, record) => record.property?.name || 'N/A',
            ellipsis: true,
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            render: (_, record) => record.unit?.unitType || 'N/A',
            width: 120,
        },
        {
            title: 'Sale Price',
            dataIndex: 'salePrice',
            key: 'salePrice',
            render: (salePrice) => formatCurrency(salePrice),
            width: 130,
        },
        {
            title: 'Available Commission',
            dataIndex: 'availableCommission',
            key: 'availableCommission',
            render: (availableCommission) => formatCurrency(availableCommission),
            width: 160,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => handleSaleSelection(record)}
                    disabled={record.availableCommission <= 0}
                >
                    Select
                </Button>
            ),
            width: 80,
        },
    ];

    // Render step 1: Agent selection
    const renderAgentSelection = () => (
        <Form layout="vertical">
            <Form.Item
                name="agentId"
                label="Select Sales Agent"
                rules={[{ required: true, message: 'Please select a sales agent' }]}
            >
                <Select
                    placeholder="Select sales agent"
                    onChange={handleAgentChange}
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                >
                    {agents.map(agent => (
                        <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                            {agent.name || agent.fullName || `${agent.firstName} ${agent.lastName}`}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );

    // Render step 2: Sale selection
    const renderSaleSelection = () => (
        <>
            {renderAgentSelection()}

            <Divider />
            <Title level={5}>Select a Sale</Title>

            {filteredSales.length > 0 ? (
                <Form layout="vertical">
                    <Form.Item
                        name="saleId"
                        label="Select Sale"
                        rules={[{ required: true, message: 'Please select a sale' }]}
                    >
                        <Select
                            placeholder="Select sale"
                            onChange={(saleId) => {
                                const sale = filteredSales.find(s => s._id === saleId);
                                if (sale) {
                                    handleSaleSelection(sale);
                                }
                            }}
                            style={{ width: '100%' }}
                            showSearch
                            optionFilterProp="children"
                        >
                            {filteredSales.map(sale => (
                                <Option
                                    key={sale._id}
                                    value={sale._id}
                                    disabled={sale.availableCommission <= 0}
                                >
                                    {sale.saleCode} - {sale.property?.name || 'Property'} ({sale.unit?.unitType || 'Unit'}) - {formatCurrency(sale.availableCommission)}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            ) : (
                <Alert
                    message="No sales found"
                    description="No sales were found for this agent, or the agent has no sales with available commission."
                    type="info"
                    showIcon
                    style={{ margin: '20px 0' }}
                />
            )}
        </>
    );

    // Render step 3: Payment details
    const renderPaymentDetails = () => (
        <>
            {renderSaleSelection()}

            <Divider />
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Total Commission"
                                    value={formatCurrency(commission.total)}
                                    prefix={<DollarOutlined />}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title={(
                                        <span>
                                            Accrued Commission
                                            <Tooltip title="Commission based on actual client payments">
                                                <InfoCircleOutlined style={{ marginLeft: 5 }} />
                                            </Tooltip>
                                        </span>
                                    )}
                                    value={formatCurrency(commission.accrued)}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Paid Amount"
                                    value={formatCurrency(commission.paid)}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title={(
                                        <span>
                                            Available to Pay
                                            <Tooltip title="Maximum commission that can be paid based on client payments">
                                                <InfoCircleOutlined style={{ marginLeft: 5 }} />
                                            </Tooltip>
                                        </span>
                                    )}
                                    value={formatCurrency(commission.accrued - commission.paid)}
                                    valueStyle={{ color: (commission.accrued - commission.paid) > 0 ? '#ff4d4f' : '#52c41a' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <Row>
                            <Col span={12}>
                                <Text>Sale Reference: <strong>{selectedSale?.saleCode || 'N/A'}</strong></Text>
                            </Col>
                            <Col span={12}>
                                <Text>Status: <span style={{ color: getCommissionStatusColor(commission.status) }}>
                                    {commission.status?.toUpperCase() || 'PENDING'}
                                </span></Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Text>Property: <strong>{selectedSale?.property?.name || 'N/A'}</strong></Text>
                            </Col>
                            <Col span={12}>
                                <Text>Unit: <strong>{selectedSale?.unit?.unitType || 'N/A'}</strong></Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Text>Sale Price: <strong>{formatCurrency(selectedSale?.salePrice)}</strong></Text>
                            </Col>
                            <Col span={12}>
                                <Text>Agent: <strong>{selectedSale?.salesAgent?.name || 'N/A'}</strong></Text>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Payment Details">
                        {commission.accrued - commission.paid <= 0 && (
                            <Alert
                                message="No Commission Available"
                                description="There is no accrued commission available to pay at this time. Commission can only be paid based on the amount already paid by the client."
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}
                        <Form
                            form={form}
                            layout="vertical"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="amount"
                                        label="Payment Amount"
                                        rules={[
                                            { required: true, message: 'Please enter payment amount' },
                                            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
                                            {
                                                validator: (_, value) => {
                                                    if (value > (commission.accrued - commission.paid)) {
                                                        return Promise.reject(new Error('Amount exceeds available accrued commission'));
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                        help={exceedsAccrued ? "Payment cannot exceed accrued commission" : null}
                                        validateStatus={exceedsAccrued ? "error" : null}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            placeholder="Enter payment amount"
                                            formatter={value => `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/KES\s?|(,*)/g, '')}
                                            onChange={handleAmountChange}
                                            max={commission.accrued - commission.paid}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="paymentDate"
                                        label="Payment Date"
                                        rules={[{ required: true, message: 'Please select payment date' }]}
                                    >
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="paymentMethod"
                                        label="Payment Method"
                                        rules={[{ required: true, message: 'Please select payment method' }]}
                                    >
                                        <Select placeholder="Select payment method">
                                            {['bank transfer', 'cash', 'check', 'mobile money', 'other'].map(method => (
                                                <Option key={method} value={method}>{method.toUpperCase()}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="paidTo"
                                        label="Recipient (Agent)"
                                        rules={[{ required: true, message: 'Please select recipient' }]}
                                    >
                                        <Select placeholder="Select agent">
                                            {agents.map(agent => (
                                                <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                                                    {agent.name || agent.fullName || `${agent.firstName} ${agent.lastName}`}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="reference"
                                label="Reference Number"
                                rules={[{ required: true, message: 'Please enter reference number' }]}
                            >
                                <Input placeholder="Enter reference number or transaction ID" />
                            </Form.Item>

                            <Form.Item
                                name="notes"
                                label="Notes"
                            >
                                <Input.TextArea rows={3} placeholder="Enter any notes about this payment" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    loading={loading}
                                    disabled={commission.accrued - commission.paid <= 0 || exceedsAccrued}
                                >
                                    Submit Payment
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </>
    );

    // Render appropriate step
    const renderContent = () => {
        if (loadingData) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Loading data...</div>
                </div>
            );
        }

        switch (step) {
            case 1:
                return renderAgentSelection();
            case 2:
                return renderSaleSelection();
            case 3:
                return renderPaymentDetails();
            default:
                return renderAgentSelection();
        }
    };

    return (
        <Card title="Commission Payment Form">
            {renderContent()}
        </Card>
    );
};

export default CommissionPaymentForm;