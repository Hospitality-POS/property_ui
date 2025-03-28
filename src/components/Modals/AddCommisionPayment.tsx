import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, Button, Select, DatePicker, InputNumber,
    Divider, Statistic, Card, Row, Col, Typography, Space, message, Alert,
    Tooltip
} from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { createNewComm } from '../../services/sales'

const { Option } = Select;
const { Text, Title } = Typography;

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

const CommissionPaymentModal = ({
    visible,
    onCancel,
    sale,
    onSuccess,
    agents = [],
    paymentMethods = ['bank transfer', 'cash', 'check', 'other']
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [commission, setCommission] = useState({});
    const [exceedsAccrued, setExceedsAccrued] = useState(false);

    useEffect(() => {
        if (sale && visible) {
            // Calculate accrued commission based on actual client payments
            const accruedCommission = calculateAccruedCommission(sale);

            // Calculate commission data
            const commissionData = {
                total: sale.commission?.amount || 0,
                paid: sale.commission?.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0,
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
        }
    }, [sale, visible, form]);

    const handleAmountChange = (value) => {
        if (value > commission.accrued - commission.paid) {
            setExceedsAccrued(true);
        } else {
            setExceedsAccrued(false);
        }
    };

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

            const response = await createNewComm(sale._id, paymentData);

            if (response.success) {
                // message.success('Commission payment added successfully');
                onSuccess(response.data);
                onCancel();
            } else {
                message.error(response.message || 'Failed to add commission payment');
            }
        } catch (error) {
            console.error('Error adding commission payment:', error);
            message.error('Failed to add commission payment');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return 'KES 0';
        }
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    const getCommissionStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#52c41a';
            case 'partial': return '#faad14';
            default: return '#ff4d4f';
        }
    };

    return (
        <Modal
            title={`Add Commission Payment - ${sale?.saleCode || 'Sale'}`}
            visible={visible}
            onCancel={onCancel}
            width={700}
            footer={null}
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="Total Commission"
                                    value={formatCurrency(commission.total)}
                                    prefix={<DollarOutlined />}
                                />
                            </Col>
                            <Col span={6}>
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
                            <Col span={6}>
                                <Statistic
                                    title="Paid Amount"
                                    value={formatCurrency(commission.paid)}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Col>
                            <Col span={6}>
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
                                <Text>Sale Reference: <strong>{sale?.saleCode || 'N/A'}</strong></Text>
                            </Col>
                            <Col span={12}>
                                <Text>Status: <span style={{ color: getCommissionStatusColor(commission.status) }}>
                                    {commission.status?.toUpperCase() || 'PENDING'}
                                </span></Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Text>Property: <strong>{sale?.property?.name || 'N/A'}</strong></Text>
                            </Col>
                            <Col span={12}>
                                <Text>Unit: <strong>{sale?.unit?.unitType || 'N/A'}</strong></Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Text>Sale Price: <strong>{formatCurrency(sale?.salePrice)}</strong></Text>
                            </Col>
                            <Col span={12}>
                                <Text>Agent: <strong>{sale?.salesAgent?.name || 'N/A'}</strong></Text>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Title level={5}>Payment Details</Title>
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
                            <Col span={12}>
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
                            <Col span={12}>
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
                            <Col span={12}>
                                <Form.Item
                                    name="paymentMethod"
                                    label="Payment Method"
                                    rules={[{ required: true, message: 'Please select payment method' }]}
                                >
                                    <Select placeholder="Select payment method">
                                        {paymentMethods.map(method => (
                                            <Option key={method} value={method}>{method.toUpperCase()}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="paidTo"
                                    label="Recipient (Agent)"
                                    rules={[{ required: true, message: 'Please select recipient' }]}
                                >
                                    <Select placeholder="Select agent">
                                        {agents.map(agent => (
                                            <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                                                {agent.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="reference"
                            label="Reference Number"
                            rules={[{ required: true, message: 'Reference Number' }]}
                        >
                            <Input placeholder="Enter reference number or transaction ID" />
                        </Form.Item>

                        <Form.Item
                            name="notes"
                            label="Notes"
                        >
                            <Input.TextArea rows={3} placeholder="Enter any notes about this payment" />
                        </Form.Item>

                        <Row justify="end">
                            <Space>
                                <Button onClick={onCancel}>Cancel</Button>
                                <Button
                                    type="primary"
                                    loading={loading}
                                    onClick={handleSubmit}
                                    disabled={commission.accrued - commission.paid <= 0 || exceedsAccrued}
                                >
                                    Add Payment
                                </Button>
                            </Space>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Modal>
    );
};

export default CommissionPaymentModal;