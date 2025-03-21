import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, Button, Select, DatePicker, InputNumber,
    Divider, Statistic, Card, Row, Col, Typography, Space, message
} from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { createNewComm } from '../../services/sales'

const { Option } = Select;
const { Text, Title } = Typography;

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

    useEffect(() => {
        if (sale && visible) {
            // Calculate commission data
            const commissionData = {
                total: sale.commission?.amount || 0,
                paid: sale.commission?.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0,
                status: sale.commission?.status || 'pending',
                payments: sale.commission?.payments || []
            };

            commissionData.remaining = commissionData.total - commissionData.paid;
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

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
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
                            <Col span={8}>
                                <Statistic
                                    title="Total Commission"
                                    value={formatCurrency(commission.total)}
                                    prefix={<DollarOutlined />}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Paid Amount"
                                    value={formatCurrency(commission.paid)}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Remaining"
                                    value={formatCurrency(commission.remaining)}
                                    valueStyle={{ color: commission.remaining > 0 ? '#ff4d4f' : '#52c41a' }}
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
                                        { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Enter payment amount"
                                        formatter={value => `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/KES\s?|(,*)/g, '')}
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
                                <Button type="primary" loading={loading} onClick={handleSubmit}>
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