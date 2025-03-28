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
    Table,
} from 'antd';
import {
    DollarOutlined,
    PrinterOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import moment from 'moment';
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

    // Helper function to get payment method display name (for PDF)
    const getMethodDisplayName = (method) => {
        switch (method) {
            case 'mpesa': return 'M-Pesa';
            case 'bank_transfer': return 'Bank Transfer';
            case 'cash': return 'Cash';
            case 'cheque': return 'Cheque';
            default: return 'Other';
        }
    };

    // Handle printing of receipt
    const handlePrintReceipt = () => {
        try {
            message.loading({ content: 'Preparing receipt for printing...', key: 'printLoading' });

            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                message.error({ content: 'Popup blocked! Please allow popups to print.', key: 'printLoading' });
                return;
            }

            // Create print-specific style
            const printStyles = `
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px;
                        margin: 0;
                    }
                    
                    /* Header styling */
                    .receipt-header { 
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #000;
                    }
                    .receipt-title {
                        font-size: 22px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .receipt-subtitle {
                        font-size: 16px;
                        margin-bottom: 5px;
                    }
                    .receipt-date {
                        font-size: 14px;
                        color: #666;
                    }
                    
                    /* Section styling */
                    .section {
                        margin-bottom: 20px;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 15px 0 10px 0;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 5px;
                    }
                    
                    /* Data table styling */
                    .data-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .data-table th, .data-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .data-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    
                    /* Description list styling */
                    .description-list {
                        width: 100%;
                        margin-bottom: 15px;
                    }
                    .description-list dt {
                        font-weight: bold;
                        margin-bottom: 5px;
                        width: 40%;
                        float: left;
                        clear: left;
                    }
                    .description-list dd {
                        margin-left: 45%;
                        margin-bottom: 5px;
                    }
                    
                    /* Footer styling */
                    .receipt-footer {
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    
                    /* Payment summary styling */
                    .payment-summary {
                        background-color: #f9f9f9;
                        border: 1px solid #ddd;
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                    }
                    .payment-amount {
                        font-size: 22px;
                        font-weight: bold;
                        color: #2e7d32;
                        margin-bottom: 5px;
                    }
                    .payment-method, .payment-status, .payment-date {
                        margin-bottom: 5px;
                    }
                </style>
            `;

            // Create the receipt content with proper HTML
            let printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Receipt - ${payment.receiptNumber || 'N/A'}</title>
                    ${printStyles}
                </head>
                <body>
                    <div class="receipt-header">
                        <div class="receipt-title">PAYMENT RECEIPT</div>
                        <div class="receipt-subtitle">Receipt No: ${payment.receiptNumber || 'N/A'}</div>
                        <div class="receipt-date">Date: ${formatDate(payment.paymentDate)}</div>
                    </div>
                    
                    <div class="payment-summary">
                        <div class="payment-amount">KES ${payment.amount?.toLocaleString() || '0'}</div>
                        <div class="payment-method">Method: ${getMethodDisplayName(payment.paymentMethod)}</div>
                        <div class="payment-status">Status: ${payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'N/A'}</div>
                        <div class="payment-date">Paid on: ${formatDate(payment.paymentDate)}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Sale Information</div>
                        <dl class="description-list">
                            <dt>Sale Code:</dt>
                            <dd>${payment.sale?.saleCode || 'N/A'}</dd>
                            <dt>Property:</dt>
                            <dd>${payment.sale?.property?.name || 'N/A'}</dd>
                        </dl>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Customer Details</div>
                        <dl class="description-list">
                            <dt>Name:</dt>
                            <dd>${payment.customer?.name || 'N/A'}</dd>
                            <dt>Contact:</dt>
                            <dd>${payment.customer?.phone || 'N/A'}</dd>
                            <dt>Email:</dt>
                            <dd>${payment.customer?.email || 'N/A'}</dd>
                        </dl>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Payment Details</div>
                        <dl class="description-list">
                            <dt>Receipt Number:</dt>
                            <dd>${payment.receiptNumber || 'N/A'}</dd>
                            <dt>Transaction Reference:</dt>
                            <dd>${payment.transactionReference || 'N/A'}</dd>
                            ${payment.includesPenalty ? `
                            <dt>Penalty Amount:</dt>
                            <dd>KES ${payment.penaltyAmount?.toLocaleString() || '0'}</dd>
                            ` : ''}
                            <dt>Notes:</dt>
                            <dd>${payment.notes || 'No notes available'}</dd>
                        </dl>
                    </div>
            `;

            // Add payment plan information based on what's available
            if (!payment.paymentPlans || !payment.paymentPlans.length) {
                // Legacy single payment plan
                if (payment.paymentPlan) {
                    printContent += `
                        <div class="section">
                            <div class="section-title">Payment Plan Details</div>
                            <dl class="description-list">
                                <dt>Total Amount:</dt>
                                <dd>KES ${payment.paymentPlan.totalAmount?.toLocaleString() || '0'}</dd>
                                <dt>Outstanding Balance:</dt>
                                <dd>KES ${payment.paymentPlan.outstandingBalance?.toLocaleString() || '0'}</dd>
                                <dt>Installment Amount:</dt>
                                <dd>KES ${payment.paymentPlan.installmentAmount?.toLocaleString() || '0'}</dd>
                            </dl>
                        </div>
                    `;
                }
            } else if (payment.paymentPlans.length === 1) {
                // Single payment plan (new structure)
                const plan = payment.paymentPlans[0];
                printContent += `
                    <div class="section">
                        <div class="section-title">Payment Plan Details</div>
                        <dl class="description-list">
                            <dt>Total Amount:</dt>
                            <dd>KES ${plan.totalAmount?.toLocaleString() || '0'}</dd>
                            <dt>Outstanding Balance:</dt>
                            <dd>KES ${plan.outstandingBalance?.toLocaleString() || '0'}</dd>
                            <dt>Installment Amount:</dt>
                            <dd>KES ${plan.installmentAmount?.toLocaleString() || '0'}</dd>
                        </dl>
                    </div>
                `;
            } else {
                // Multiple payment plans
                printContent += `
                    <div class="section">
                        <div class="section-title">Payment Plans</div>
                        <p>This payment is applied to ${payment.paymentPlans.length} payment plans.</p>
                    </div>
                `;
            }

            // Add allocation information if available
            if (payment.allocation && payment.allocation.length > 0) {
                printContent += `
                    <div class="section">
                        <div class="section-title">Payment Allocation</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Plan</th>
                                    <th>Amount</th>
                                    <th>Applied To</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                payment.allocation.forEach((item, index) => {
                    const planId = item.paymentPlan?._id
                        ? String(item.paymentPlan._id).slice(-6)
                        : `Plan ${index + 1}`;

                    printContent += `
                        <tr>
                            <td>${item.paymentPlan?.name || planId}</td>
                            <td>KES ${item.amount?.toLocaleString() || '0'}</td>
                            <td>${item.appliedTo?.charAt(0).toUpperCase() + item.appliedTo?.slice(1) || 'N/A'}</td>
                        </tr>
                    `;
                });

                printContent += `
                            </tbody>
                        </table>
                    </div>
                `;
            }

            // Add footer
            printContent += `
                    <div class="receipt-footer">
                        <p>This is an electronically generated receipt and does not require a signature.</p>
                        <p>Generated on ${formatDate(new Date())}</p>
                    </div>
                    <script>
                        // Automatically print when loaded
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `;

            // Write the content to the new window and trigger print
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();

            message.success({ content: 'Print window opened. Please proceed with printing.', key: 'printLoading', duration: 2 });
        } catch (error) {
            console.error('Error printing receipt:', error);
            message.error({ content: 'Failed to print receipt', key: 'printLoading' });
        }
    };

    // Handle downloading PDF
    const handleDownloadPDF = () => {
        try {
            message.loading({ content: 'Generating PDF...', key: 'pdfLoading' });

            // Create PDF document
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20; // margin in mm
            const contentWidth = pageWidth - (margin * 2);
            const fileName = `Receipt-${payment.receiptNumber || payment._id}.pdf`;

            // Helper function to add a separator line
            const addSeparatorLine = (yPos) => {
                doc.setLineWidth(0.5);
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                return yPos + 5; // return new y position after line
            };

            // Header with styling
            doc.setFillColor(50, 50, 50);
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text("PAYMENT RECEIPT", pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Receipt No: ${payment.receiptNumber || 'N/A'}`, pageWidth / 2, 25, { align: 'center' });
            doc.text(`Date: ${formatDate(payment.paymentDate)}`, pageWidth / 2, 32, { align: 'center' });

            // Payment Amount Box
            let yPos = 50;
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos, contentWidth, 25, 'F');

            doc.setTextColor(0, 100, 0);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(`Amount: KES ${payment.amount?.toLocaleString() || '0'}`, pageWidth / 2, yPos + 10, { align: 'center' });

            doc.setTextColor(80, 80, 80);
            doc.setFontSize(11);
            doc.text(`Method: ${getMethodDisplayName(payment.paymentMethod)} | Status: ${payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'N/A'}`,
                pageWidth / 2, yPos + 20, { align: 'center' });

            yPos = 85;

            // Customer Information Section
            doc.setTextColor(0, 0, 0);
            doc.setFillColor(220, 230, 240);
            doc.rect(margin, yPos, contentWidth, 8, 'F');

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("CUSTOMER INFORMATION", margin + 5, yPos + 6);

            yPos += 12;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Name: ${payment.customer?.name || 'N/A'}`, margin + 5, yPos);
            yPos += 6;
            doc.text(`Contact: ${payment.customer?.phone || 'N/A'}`, margin + 5, yPos);
            yPos += 6;
            doc.text(`Email: ${payment.customer?.email || 'N/A'}`, margin + 5, yPos);

            yPos = addSeparatorLine(yPos + 8);

            // Sale Information Section
            doc.setFillColor(220, 230, 240);
            doc.rect(margin, yPos, contentWidth, 8, 'F');

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("SALE INFORMATION", margin + 5, yPos + 6);

            yPos += 12;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Sale Code: ${payment.sale?.saleCode || 'N/A'}`, margin + 5, yPos);
            yPos += 6;
            doc.text(`Property: ${payment.sale?.property?.name || 'N/A'}`, margin + 5, yPos);

            yPos = addSeparatorLine(yPos + 8);

            // Payment Details Section
            doc.setFillColor(220, 230, 240);
            doc.rect(margin, yPos, contentWidth, 8, 'F');

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("PAYMENT DETAILS", margin + 5, yPos + 6);

            yPos += 12;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Transaction Reference: ${payment.transactionReference || 'N/A'}`, margin + 5, yPos);

            if (payment.includesPenalty) {
                yPos += 6;
                doc.text(`Penalty Amount: KES ${payment.penaltyAmount?.toLocaleString() || '0'}`, margin + 5, yPos);
            }

            if (payment.notes) {
                yPos += 6;
                doc.text(`Notes: ${payment.notes}`, margin + 5, yPos);
            }

            yPos = addSeparatorLine(yPos + 8);

            // Payment Plan Details
            doc.setFillColor(220, 230, 240);
            doc.rect(margin, yPos, contentWidth, 8, 'F');

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("PAYMENT PLAN DETAILS", margin + 5, yPos + 6);

            yPos += 12;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            if (!payment.paymentPlans || !payment.paymentPlans.length) {
                // Legacy single payment plan
                if (payment.paymentPlan) {
                    doc.text(`Total Amount: KES ${payment.paymentPlan.totalAmount?.toLocaleString() || '0'}`, margin + 5, yPos);
                    yPos += 6;
                    doc.text(`Outstanding Balance: KES ${payment.paymentPlan.outstandingBalance?.toLocaleString() || '0'}`, margin + 5, yPos);
                    yPos += 6;
                    doc.text(`Installment Amount: KES ${payment.paymentPlan.installmentAmount?.toLocaleString() || '0'}`, margin + 5, yPos);
                } else {
                    doc.text("No payment plan information available", margin + 5, yPos);
                }
            } else if (payment.paymentPlans.length === 1) {
                // Single payment plan (new structure)
                const plan = payment.paymentPlans[0];
                doc.text(`Total Amount: KES ${plan.totalAmount?.toLocaleString() || '0'}`, margin + 5, yPos);
                yPos += 6;
                doc.text(`Outstanding Balance: KES ${plan.outstandingBalance?.toLocaleString() || '0'}`, margin + 5, yPos);
                yPos += 6;
                doc.text(`Installment Amount: KES ${plan.installmentAmount?.toLocaleString() || '0'}`, margin + 5, yPos);
            } else {
                // Multiple payment plans
                doc.text(`This payment is applied to ${payment.paymentPlans.length} payment plans.`, margin + 5, yPos);
            }

            // Add allocation table if needed
            if (payment.allocation && payment.allocation.length > 0) {
                yPos = addSeparatorLine(yPos + 10);

                doc.setFillColor(220, 230, 240);
                doc.rect(margin, yPos, contentWidth, 8, 'F');

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text("PAYMENT ALLOCATION", margin + 5, yPos + 6);

                yPos += 12;

                // Create table headers with background
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, yPos, contentWidth, 7, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text("Plan", margin + 5, yPos + 5);
                doc.text("Amount", margin + contentWidth / 3, yPos + 5);
                doc.text("Applied To", margin + (contentWidth / 3) * 2, yPos + 5);

                yPos += 10;
                doc.setFont('helvetica', 'normal');

                // Add table rows
                for (const item of payment.allocation) {
                    const planId = item.paymentPlan?._id
                        ? String(item.paymentPlan._id).slice(-6)
                        : 'N/A';
                    const planName = item.paymentPlan?.name || planId;

                    // Check if we need a new page
                    if (yPos > pageHeight - 30) {
                        doc.addPage();
                        yPos = 20;
                    }

                    doc.text(planName, margin + 5, yPos);
                    doc.text(`KES ${item.amount?.toLocaleString() || '0'}`, margin + contentWidth / 3, yPos);
                    doc.text(item.appliedTo?.charAt(0).toUpperCase() + item.appliedTo?.slice(1) || 'N/A',
                        margin + (contentWidth / 3) * 2, yPos);

                    yPos += 7;
                }
            }

            // Add footer to all pages
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);

                // Footer with background
                doc.setFillColor(240, 240, 240);
                doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

                doc.setTextColor(100, 100, 100);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.text("This is an electronically generated receipt and does not require a signature.",
                    pageWidth / 2, pageHeight - 12, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.text(`Generated on ${formatDate(new Date())} | Page ${i} of ${pageCount}`,
                    pageWidth / 2, pageHeight - 6, { align: 'center' });
            }

            // Save the PDF
            doc.save(fileName);
            message.success({ content: 'PDF downloaded successfully', key: 'pdfLoading', duration: 2 });
        } catch (error) {
            console.error('Error generating PDF:', error);
            message.error({ content: 'Failed to generate PDF', key: 'pdfLoading', duration: 2 });
        }
    };

    // Payment plan allocation columns
    const allocationColumns = [
        {
            title: 'Plan ID',
            dataIndex: 'planId',
            key: 'planId',
            render: (_, record) => record.planName || (record.paymentPlan?._id ? String(record.paymentPlan._id).slice(-6) : 'N/A')
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `KES ${amount?.toLocaleString() || '0'}`
        },
        {
            title: 'Applied To',
            dataIndex: 'appliedTo',
            key: 'appliedTo',
            render: (appliedTo) => appliedTo?.charAt(0).toUpperCase() + appliedTo?.slice(1) || 'N/A'
        }
    ];

    // Format allocation data
    const allocationData = payment.allocation?.map((item, index) => ({
        key: index,
        planId: item.paymentPlan,
        planName: item.paymentPlan?.name,
        amount: item.amount,
        appliedTo: item.appliedTo,
        notes: item.notes
    })) || [];

    // Determine if we should display a single payment plan or multiple
    const hasMultiplePlans = payment.paymentPlans && payment.paymentPlans.length > 1;
    const mainPaymentPlan = payment.paymentPlans?.[0] || payment.paymentPlan;

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
                                onClick={handleDownloadPDF}
                            >
                                Download PDF
                            </Button>
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={handlePrintReceipt}
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

                {/* Sale Information */}
                <Title level={5}>Sale Information</Title>
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Sale Code">
                        {payment.sale?.saleCode || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Property">
                        {payment.sale?.property?.name || 'N/A'}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {/* Customer Information */}
                <Title level={5}>Customer Details</Title>
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Customer Name">
                        {payment.customer?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer Contact">
                        {payment.customer?.phone || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer Email">
                        {payment.customer?.email || 'N/A'}
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
                            KES {payment.penaltyAmount?.toLocaleString() || "0"}
                        </Descriptions.Item>
                    )}
                    {payment.processedBy && (
                        <Descriptions.Item label="Processed By">
                            {payment.processedBy.name || payment.processedBy}
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Notes">
                        {payment.notes || "No notes available"}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {/* Payment Plan Information */}
                {mainPaymentPlan && !hasMultiplePlans && (
                    <>
                        <Title level={5}>Payment Plan Details</Title>
                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Total Amount">
                                KES {mainPaymentPlan.totalAmount?.toLocaleString() || "0"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Outstanding Balance">
                                KES {mainPaymentPlan.outstandingBalance?.toLocaleString() || "0"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Installment Amount">
                                KES {mainPaymentPlan.installmentAmount?.toLocaleString() || "0"}
                            </Descriptions.Item>
                            {mainPaymentPlan.installmentFrequency && (
                                <Descriptions.Item label="Installment Frequency">
                                    {mainPaymentPlan.installmentFrequency.charAt(0).toUpperCase() +
                                        mainPaymentPlan.installmentFrequency.slice(1)}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Payment Plan Status">
                                {mainPaymentPlan.status === 'active' ?
                                    <Tag color="green">Active</Tag> :
                                    <Tag color="red">Inactive</Tag>
                                }
                            </Descriptions.Item>
                            {mainPaymentPlan.startDate && mainPaymentPlan.endDate && (
                                <Descriptions.Item label="Payment Plan Duration">
                                    {formatDate(mainPaymentPlan.startDate)} to {formatDate(mainPaymentPlan.endDate)}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </>
                )}

                {/* Multiple Payment Plans */}
                {hasMultiplePlans && (
                    <>
                        <Title level={5}>Payment Plans</Title>
                        <div style={{ marginBottom: 16 }}>
                            <Text>This payment is applied to {payment.paymentPlans.length} payment plans.</Text>
                        </div>
                    </>
                )}

                {/* Payment Allocation Details */}
                {payment.allocation && payment.allocation.length > 0 && (
                    <>
                        <Title level={5}>Payment Allocation</Title>
                        <Table
                            columns={allocationColumns}
                            dataSource={allocationData}
                            pagination={false}
                            size="small"
                        />
                    </>
                )}
            </div>
        </Drawer>
    );
};

export default PaymentDetailsDrawer;