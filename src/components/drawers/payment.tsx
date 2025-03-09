import React from 'react';
import {
    Drawer,
    Descriptions,
    Button,
    Space,
    Typography,
    Tag,
    Divider,
    Row,
    Col,
    Card,
    Statistic,
} from 'antd';
import {
    DollarOutlined,
    FileTextOutlined,
    PrinterOutlined,
    MailOutlined,
    DownloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentDetailsDrawer = ({ visible, payment, onClose }) => {
    if (!payment) return null;

    // Format payment method display
    const getPaymentMethodDisplay = (method) => {
        switch (method) {
            case 'mpesa':
                return <Tag color="green">M-Pesa</Tag>;
            case 'bank_transfer':
                return <Tag color="blue">Bank Transfer</Tag>;
            case 'cash':
                return <Tag color="gold">Cash</Tag>;
            case 'cheque':
                return <Tag color="purple">Cheque</Tag>;
            default:
                return <Tag>Other</Tag>;
        }
    };

    // Format payment status display
    const getStatusDisplay = (status) => {
        let color = 'default';
        let text = status.charAt(0).toUpperCase() + status.slice(1);

        switch (status) {
            case 'pending':
                color = 'orange';
                break;
            case 'completed':
                color = 'green';
                break;
            case 'failed':
                color = 'red';
                break;
            case 'refunded':
                color = 'purple';
                break;
        }

        return <Tag color={color}>{text}</Tag>;
    };

    return (
        <Drawer
            title={
                <span>
                    Payment Details: <strong>{payment.id}</strong>
                </span>
            }
            width={700}
            placement="right"
            onClose={onClose}
            open={visible}
            footer={
                <Space>
                    {payment.status === 'completed' && (
                        <>
                            <Button type="primary" icon={<DownloadOutlined />}>
                                Download Receipt
                            </Button>
                            <Button icon={<PrinterOutlined />}>Print Receipt</Button>
                            <Button icon={<MailOutlined />}>Email Receipt</Button>
                        </>
                    )}
                    <Button onClick={onClose}>Close</Button>
                </Space>
            }
        >
            {/* Payment Summary Card */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic
                            title="Payment Amount"
                            value={payment.amount}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="KES"
                        />
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Status:</Text> {getStatusDisplay(payment.status)}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Payment Date:</Text> {payment.paymentDate}
                        </div>
                        <div>
                            <Text strong>Payment Method:</Text> {getPaymentMethodDisplay(payment.paymentMethod)}
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Property and Customer Section */}
            <Title level={5}>Property & Customer Details</Title>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Property">
                    {payment.sale.property.title}
                </Descriptions.Item>
                <Descriptions.Item label="Property Type">
                    {payment.sale.property.type}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                    {payment.sale.property.location}
                </Descriptions.Item>
                <Descriptions.Item label="Customer Name">
                    {payment.customer.name}
                </Descriptions.Item>
                <Descriptions.Item label="Customer Contact">
                    {payment.customer.contactNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Customer Email">
                    {payment.customer.email}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Payment Details Section */}
            <Title level={5}>Payment Information</Title>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Payment ID">
                    {payment.id}
                </Descriptions.Item>
                <Descriptions.Item label="Sale ID">
                    {payment.sale.id}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Plan ID">
                    {payment.paymentPlan.id}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                    {getPaymentMethodDisplay(payment.paymentMethod)}
                </Descriptions.Item>
                <Descriptions.Item label="Transaction Reference">
                    {payment.transactionReference || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Receipt Number">
                    {payment.receiptNumber || "N/A"}
                </Descriptions.Item>
                {payment.includesPenalty && (
                    <Descriptions.Item label="Penalty Amount">
                        KES {payment.penaltyAmount.toLocaleString()}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Processed By">
                    {payment.processedBy.name}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                    {payment.notes || "No notes available"}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Payment Plan Information */}
            <Title level={5}>Payment Plan Details</Title>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Total Amount">
                    KES {payment.paymentPlan.totalAmount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Outstanding Balance">
                    KES {payment.paymentPlan.outstandingBalance.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Installment Amount">
                    KES {payment.paymentPlan.installmentAmount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Installment Frequency">
                    {payment.paymentPlan.installmentFrequency.charAt(0).toUpperCase() +
                        payment.paymentPlan.installmentFrequency.slice(1)}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Plan Status">
                    {payment.paymentPlan.status === 'active' ?
                        <Tag color="green">Active</Tag> :
                        <Tag color="red">Inactive</Tag>
                    }
                </Descriptions.Item>
                <Descriptions.Item label="Payment Plan Duration">
                    {payment.paymentPlan.startDate} to {payment.paymentPlan.endDate}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default PaymentDetailsDrawer;