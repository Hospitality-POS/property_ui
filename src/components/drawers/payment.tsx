import React, { useRef } from 'react';
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
    message,
} from 'antd';
import {
    DollarOutlined,
    FileTextOutlined,
    PrinterOutlined,
    MailOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;

const PaymentDetailsDrawer = ({ visible, payment, onClose }) => {
    const receiptRef = useRef(null);

    if (!payment) return null;

    // Format date to be more user-friendly
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('DD MMM YYYY');
    };

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

    // Handle printing of receipt
    const handlePrintReceipt = () => {
        try {
            const content = receiptRef.current;
            const originalContents = document.body.innerHTML;

            // Create a print-specific style
            const printStyles = `
                <style>
                    @media print {
                        body { font-family: Arial, sans-serif; }
                        .ant-descriptions-item-label { 
                            font-weight: bold;
                            padding-right: 10px; 
                        }
                        .receipt-header { 
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .receipt-title {
                            font-size: 18px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        .receipt-subtitle {
                            font-size: 14px;
                            margin-bottom: 15px;
                        }
                        .section-title {
                            font-size: 16px;
                            font-weight: bold;
                            margin: 15px 0 10px 0;
                            border-bottom: 1px solid #ddd;
                            padding-bottom: 5px;
                        }
                    }
                </style>
            `;

            let printContent = `
                <div class="receipt-header">
                    <div class="receipt-title">PAYMENT RECEIPT</div>
                    <div class="receipt-subtitle">Receipt No: ${payment.receiptNumber || 'N/A'}</div>
                </div>
            `;

            printContent += content.innerHTML;
            document.body.innerHTML = printStyles + printContent;

            window.print();
            document.body.innerHTML = originalContents;

            message.success('Print initiated successfully');
        } catch (error) {
            console.error('Error printing receipt:', error);
            message.error('Failed to print receipt');
        }
    };

    // Handle downloading PDF
    const handleDownloadPDF = () => {
        try {
            message.loading({ content: 'Generating PDF...', key: 'pdfLoading' });

            // Create a simpler version of the receipt content for PDF
            const fileName = `Receipt-${payment.receiptNumber || payment._id}.pdf`;
            const title = "PAYMENT RECEIPT";

            // Create PDF document
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add company logo/header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

            // Add receipt number
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Receipt No: ${payment.receiptNumber || 'N/A'}`,
                doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
            doc.text(`Date: ${formatDate(payment.paymentDate)}`,
                doc.internal.pageSize.getWidth() / 2, 37, { align: 'center' });

            // Add a line
            doc.setLineWidth(0.5);
            doc.line(20, 42, doc.internal.pageSize.getWidth() - 20, 42);

            // Customer and Property Info
            doc.setFont('helvetica', 'bold');
            doc.text("Customer Information:", 20, 50);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${payment.customer.name}`, 25, 57);
            doc.text(`Contact: ${payment.customer.phone}`, 25, 64);
            doc.text(`Email: ${payment.customer.email}`, 25, 71);

            doc.setFont('helvetica', 'bold');
            doc.text("Property Information:", 20, 82);
            doc.setFont('helvetica', 'normal');
            doc.text(`Property: ${payment.sale.property.name}`, 25, 89);
            doc.text(`Type: ${payment.sale.property.propertyType}`, 25, 96);
            doc.text(`Location: ${payment.sale.property.location.address}`, 25, 103);

            // Payment details
            doc.setFont('helvetica', 'bold');
            doc.text("Payment Details:", 20, 114);
            doc.setFont('helvetica', 'normal');
            doc.text(`Amount: KES ${payment.amount.toLocaleString()}`, 25, 121);
            doc.text(`Method: ${getMethodDisplayName(payment.paymentMethod)}`, 25, 128);
            doc.text(`Status: ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}`, 25, 135);
            if (payment.transactionReference) {
                doc.text(`Transaction Reference: ${payment.transactionReference}`, 25, 142);
            }

            // Payment Plan details
            doc.setFont('helvetica', 'bold');
            doc.text("Payment Plan:", 20, 153);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Amount: KES ${payment.paymentPlan.totalAmount.toLocaleString()}`, 25, 160);
            doc.text(`Outstanding Balance: KES ${payment.paymentPlan.outstandingBalance.toLocaleString()}`, 25, 167);
            doc.text(`Installment Amount: KES ${payment.paymentPlan.installmentAmount.toLocaleString()}`, 25, 174);

            // Add footer
            doc.setFontSize(8);
            doc.text(`Generated on ${formatDate(new Date())}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' });

            // Add legal disclaimer
            doc.setFont('helvetica', 'italic');
            doc.text("This is an electronically generated receipt and does not require a signature.",
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 15,
                { align: 'center' });

            // Save the PDF
            doc.save(fileName);
            message.success({ content: 'PDF downloaded successfully', key: 'pdfLoading', duration: 2 });
        } catch (error) {
            console.error('Error generating PDF:', error);
            message.error({ content: 'Failed to generate PDF', key: 'pdfLoading', duration: 2 });
        }
    };

    // Helper function to get payment method display name
    const getMethodDisplayName = (method) => {
        switch (method) {
            case 'mpesa': return 'M-Pesa';
            case 'bank_transfer': return 'Bank Transfer';
            case 'cash': return 'Cash';
            case 'cheque': return 'Cheque';
            default: return 'Other';
        }
    };

    return (
        <Drawer
            title={
                <span>
                    Payment Details: <strong>{payment.receiptNumber || payment._id}</strong>
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
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownloadPDF(payment)}
                            >
                                Download PDF
                            </Button>
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={() => handlePrintReceipt(payment)}
                            >
                                Print Receipt
                            </Button>
                        </>
                    )}
                    <Button onClick={onClose}>Close</Button>
                </Space>
            }
        >
            <div ref={receiptRef}>
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
                                <Text strong>Payment Date:</Text> {formatDate(payment.paymentDate)}
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
                        {payment.sale.property.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Property Type">
                        {payment.sale.property.propertyType}
                    </Descriptions.Item>
                    <Descriptions.Item label="Location">
                        {payment.sale.property.location.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer Name">
                        {payment.customer.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer Contact">
                        {payment.customer.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer Email">
                        {payment.customer.email}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {/* Payment Details Section */}
                <Title level={5}>Payment Information</Title>
                <Descriptions bordered size="small" column={1}>
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
                        {formatDate(payment.paymentPlan.startDate)} to {formatDate(payment.paymentPlan.endDate)}
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </Drawer>
    );
};

export default PaymentDetailsDrawer;