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
    if (!sale) return null;

    return (
        <Modal
            title="Add Payment for Sale"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Form layout="vertical" onFinish={onOk}>
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
                            initialValue="bank_transfer"
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

                {sale.paymentPlans && sale.paymentPlans.length > 0 ? (
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
                                {formatCurrency(calculatePaymentStats(sale).paidAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Remaining Balance">
                                {formatCurrency(parseFloat(sale.salePrice) - calculatePaymentStats(sale).paidAmount)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                <div style={{ textAlign: 'right' }}>
                    <Button style={{ marginRight: 8 }} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Add Payment
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddPaymentModal;