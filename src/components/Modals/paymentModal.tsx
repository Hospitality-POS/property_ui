import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Row,
    Col,
    InputNumber,
    DatePicker,
    Select,
    Input,
    Divider,
    Card,
    Descriptions,
    Button
} from 'antd';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

export const AddPaymentModal = ({
    visible,
    sale,
    onOk,
    onCancel,
    formatCurrency,
    calculatePaymentStats
}) => {
    const [form] = Form.useForm();

    // Set up default values when the modal opens or sale changes
    useEffect(() => {
        if (visible && sale) {
            // Determine default amount based on selectedPaymentPlan
            let defaultAmount = '';
            let defaultNotes = '';

            if (sale.selectedPaymentPlan) {
                // If a specific payment plan was selected, use its installment amount
                defaultAmount = parseFloat(sale.selectedPaymentPlan.installmentAmount) || 0;

                // Set a detailed note indicating this is a payment for this specific plan
                defaultNotes = `Payment for installment plan #${sale.selectedPaymentPlan._id.toString().substr(-6)}`;
            }

            // Set form values including the calculated amount
            form.setFieldsValue({
                amount: defaultAmount,
                paymentDate: moment(),
                paymentMethod: 'bank_transfer',
                reference: '',
                notes: defaultNotes
            });
        }
    }, [visible, sale, form]);

    const onFinish = (values) => {
        onOk(values);
        form.resetFields();
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    if (!sale) return null;

    // Get stats for displaying
    const stats = calculatePaymentStats(sale);

    // Determine if this is a payment plan specific payment
    const isPaymentPlanPayment = sale.selectedPaymentPlan !== undefined;

    return (
        <Modal
            title={isPaymentPlanPayment ? "Make Plan Payment" : "Add Payment for Sale"}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            <Form layout="vertical" onFinish={onFinish} form={form}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Payment Amount (KES)"
                            name="amount"
                            rules={[{ required: true, message: 'Please enter the payment amount' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder="Enter amount"
                                min={0}
                                disabled={isPaymentPlanPayment} // Disable field if it's a payment plan payment
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Payment Date"
                            name="paymentDate"
                            rules={[{ required: true, message: 'Please select the payment date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Payment Method"
                            name="paymentMethod"
                            rules={[{ required: true, message: 'Please select a payment method' }]}
                        >
                            <Select style={{ width: '100%' }}>
                                <Option value="bank_transfer">Bank Transfer</Option>
                                <Option value="mobile_money">M-Pesa</Option>
                                <Option value="cash">Cash</Option>
                                <Option value="check">Check</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Reference Number"
                            name="reference"
                        >
                            <Input placeholder="Enter reference number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Notes"
                    name="notes"
                >
                    <TextArea rows={4} placeholder="Add payment notes..." />
                </Form.Item>

                <Divider />

                {isPaymentPlanPayment ? (
                    // Display selected payment plan details
                    <Card style={{ marginBottom: 16 }} size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Payment Plan">
                                {sale.selectedPaymentPlan.installmentFrequency?.charAt(0).toUpperCase() +
                                    sale.selectedPaymentPlan.installmentFrequency?.slice(1) || 'Custom'} Plan
                            </Descriptions.Item>
                            <Descriptions.Item label="Installment Amount">
                                {formatCurrency(sale.selectedPaymentPlan.installmentAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Amount">
                                {formatCurrency(sale.selectedPaymentPlan.totalAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Outstanding Balance">
                                {formatCurrency(sale.selectedPaymentPlan.outstandingBalance)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                ) : sale.paymentPlans && sale.paymentPlans.length > 0 ? (
                    <Card style={{ marginBottom: 16 }} size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Payment Plan">
                                {sale.paymentPlans[0].installmentFrequency?.charAt(0).toUpperCase() +
                                    sale.paymentPlans[0].installmentFrequency?.slice(1) || 'Custom'} Plan
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Amount">
                                {formatCurrency(sale.paymentPlans[0].totalAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Outstanding Balance">
                                {formatCurrency(sale.paymentPlans[0].outstandingBalance)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                ) : (
                    <Card style={{ marginBottom: 16 }} size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Sale Total">{formatCurrency(sale.salePrice)}</Descriptions.Item>
                            <Descriptions.Item label="Amount Paid">
                                {formatCurrency(stats.paidAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Remaining Balance">
                                {formatCurrency(parseFloat(sale.salePrice) - stats.paidAmount)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                <div style={{ textAlign: 'right' }}>
                    <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                        {isPaymentPlanPayment ? "Make Payment" : "Add Payment"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddPaymentModal;