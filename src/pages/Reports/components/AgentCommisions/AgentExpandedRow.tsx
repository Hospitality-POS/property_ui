import React from 'react';
import { Table, Typography, Tag, Progress, Button, Tooltip, Space, Row, Col } from 'antd';
import { PlusOutlined, InfoCircleOutlined, FilePdfOutlined } from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AgentCommissionReport, AgentSaleDetails, Sale } from '../types';
import jsPDF from 'jspdf';
// Import jspdf-autotable correctly
import 'jspdf-autotable';

const { Title, Text } = Typography;

interface AgentExpandedRowProps {
    record: AgentCommissionReport;
    onShowCommissionPaymentModal: (sale: Sale) => void;
    calculatePaymentStats?: (sale: Sale) => any;
}

/**
 * Calculate amount paid for a sale directly from payments array
 */
const calculateAmountPaid = (sale: Sale | AgentSaleDetails): number => {
    // Check if the sale has the saleData property where payments are stored
    const saleData = sale.saleData || sale;

    // For completed sales, the full sale price has been paid
    if (saleData.status === 'completed') {
        return parseFloat(saleData.salePrice) || 0;
    }

    // Get directly from payments array
    if (saleData.payments && Array.isArray(saleData.payments) && saleData.payments.length > 0) {
        return saleData.payments.reduce((sum, payment) => {
            const amount = parseFloat(payment.amount) || 0;
            return sum + amount;
        }, 0);
    }

    // Fallback to amountPaid field if it exists
    return parseFloat(saleData.amountPaid || sale.amountPaid) || 0;
};

/**
 * Calculate accrued commission based on amount paid
 */
const calculateAccruedCommission = (sale: Sale | AgentSaleDetails): number => {
    const amountPaid = calculateAmountPaid(sale);
    const saleData = sale.saleData || sale;

    // Get commission rate from the appropriate source
    let commissionRate = 0;
    if (sale.commissionPercentage) {
        commissionRate = parseFloat(sale.commissionPercentage) / 100;
    } else if (saleData.commission?.percentage) {
        commissionRate = parseFloat(saleData.commission.percentage) / 100;
    } else if (saleData.commission?.rate) {
        commissionRate = parseFloat(saleData.commission.rate) / 100;
    } else {
        commissionRate = 0.05; // Default to 5% if no rate found
    }

    return amountPaid * commissionRate;
};

/**
 * Calculate commission payment progress
 */
const calculateCommissionProgress = (sale: Sale | AgentSaleDetails): number => {
    const saleData = sale.saleData || sale;

    // Get commission data from appropriate source
    let commissionPaid = 0;
    let totalCommission = 0;

    if (sale.commissionPaid) {
        commissionPaid = parseFloat(sale.commissionPaid);
    } else if (saleData.commission?.payments && Array.isArray(saleData.commission.payments)) {
        commissionPaid = saleData.commission.payments.reduce((sum, payment) => {
            return sum + parseFloat(payment.amount || 0);
        }, 0);
    }

    if (sale.commissionAmount) {
        totalCommission = parseFloat(sale.commissionAmount);
    } else if (saleData.commission?.amount) {
        totalCommission = parseFloat(saleData.commission.amount);
    }

    if (totalCommission <= 0) return 0;
    return (commissionPaid / totalCommission) * 100;
};

/**
 * Calculate client payment progress
 */
const calculateClientPaymentProgress = (sale: Sale | AgentSaleDetails): number => {
    const saleData = sale.saleData || sale;
    const totalPrice = parseFloat(saleData.salePrice || sale.salePrice || 0);
    const amountPaid = calculateAmountPaid(sale);

    if (totalPrice <= 0) return 0;
    return (amountPaid / totalPrice) * 100;
};

/**
 * Generate PDF for a specific sale using jsPDF with centered content
 */
const generateSaleStatementPDF = (sale: AgentSaleDetails, agentName: string) => {
    try {
        // Create new jsPDF instance
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Check if autoTable is available - if not, we need to use an alternative approach
        if (typeof (doc as any).autoTable !== 'function') {
            console.error('jsPDF autoTable plugin is not properly loaded');
            // Fallback to basic PDF without tables
            generateBasicPDF(doc, sale, agentName);
            return;
        }

        // Add fonts and styling
        doc.setFont('helvetica', 'normal');

        // Format date for the report
        const dateStr = formatDate(new Date());

        // Set up dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Center all content by using consistent margins
        const leftMargin = margin;
        const rightMargin = pageWidth - margin;
        const centerX = pageWidth / 2;

        // Colors
        const primaryColor = [24, 144, 255]; // #1890ff
        const grayColor = [102, 102, 102]; // #666
        const greenColor = [82, 196, 26]; // #52c41a
        const redColor = [255, 77, 79]; // #ff4d4f
        const orangeColor = [250, 173, 20]; // #faad14

        // Helper functions for positioning
        let yPos = margin;

        // Add centered header with larger font and more prominence
        doc.setFontSize(24); // Increased from 22
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('Commission Statement', centerX, yPos, { align: 'center' });

        yPos += 10; // Increased from 8
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(`Generated on ${dateStr}`, centerX, yPos, { align: 'center' });

        yPos += 15;

        // Agent and Property Details section (centered layout with two columns)
        doc.setFontSize(14); // Increased from 12
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');

        // Center the section headers
        doc.text('Agent Details', centerX - contentWidth / 4, yPos, { align: 'center' });
        doc.text('Property Details', centerX + contentWidth / 4, yPos, { align: 'center' });

        yPos += 8; // Increased from 6
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Center the content under each header
        doc.text(`Name: ${agentName}`, centerX - contentWidth / 4, yPos, { align: 'center' });
        doc.text(`Property: ${sale.property}`, centerX + contentWidth / 4, yPos, { align: 'center' });

        yPos += 6; // Increased from 5
        doc.text(`Sale Code: ${sale.saleCode}`, centerX - contentWidth / 4, yPos, { align: 'center' });
        doc.text(`Unit: ${sale.unit || 'N/A'}`, centerX + contentWidth / 4, yPos, { align: 'center' });

        yPos += 15; // Increased from 12

        // Center the section header
        doc.setFontSize(16); // Increased from 14
        doc.setFont('helvetica', 'bold');
        doc.text('Sale Details', centerX, yPos, { align: 'center' });

        yPos += 3; // Increased from 1
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, yPos + 2, rightMargin, yPos + 2);

        yPos += 10;

        // Sale details table using jspdf-autotable (centered)
        const salePrice = parseFloat(sale.salePrice);
        const amountPaid = calculateAmountPaid(sale);
        const commissionRate = sale.commissionPercentage || '5';
        const totalCommission = parseFloat(sale.commissionAmount);
        const accruedCommission = calculateAccruedCommission(sale);
        const commissionPaid = parseFloat(sale.commissionPaid) || 0;
        const remainingCommission = Math.max(0, totalCommission - commissionPaid);

        // Use autoTable from jspdf-autotable - centered on page
        (doc as any).autoTable({
            startY: yPos,
            head: [['Description', 'Amount']],
            body: [
                ['Sale Price', formatCurrency(salePrice)],
                ['Amount Paid', formatCurrency(amountPaid)],
                ['Commission Rate', `${commissionRate}%`],
                ['Total Commission', formatCurrency(totalCommission)],
                ['Accrued Commission', formatCurrency(accruedCommission)],
                ['Commission Paid', formatCurrency(commissionPaid)],
                ['Remaining Commission', formatCurrency(remainingCommission)]
            ],
            styles: {
                fontSize: 10,
                cellPadding: 4,
                lineColor: [200, 200, 200],
                halign: 'center' // Center all text in cells
            },
            headStyles: {
                fillColor: [24, 144, 255], // Primary color for header
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'right' }
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            margin: { left: leftMargin + contentWidth / 4, right: rightMargin - contentWidth / 4 }, // Center the table
            tableWidth: contentWidth / 2, // Make table narrower for a centered appearance
            didParseCell: function (data: any) {
                // Highlight accrued commission row in blue
                if (data.row.index === 4 && data.column.index === 1) {
                    data.cell.styles.textColor = primaryColor;
                    data.cell.styles.fontStyle = 'bold';
                }

                // Highlight remaining commission in red or green
                if (data.row.index === 6 && data.column.index === 1) {
                    data.cell.styles.textColor = remainingCommission > 0 ? redColor : greenColor;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        // Get the Y position after the table
        yPos = (doc as any).lastAutoTable.finalY + 15; // Increased spacing

        // Payment Progress section (centered)
        doc.setFontSize(16); // Increased from 14
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Payment Progress', centerX, yPos, { align: 'center' });

        yPos += 3; // Increased from 1
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, yPos + 2, rightMargin, yPos + 2);

        yPos += 12; // Increased from 10

        // Client Payment Progress
        const clientProgress = calculateClientPaymentProgress(sale);
        const commissionProgress = calculateCommissionProgress(sale);

        // Narrow progress bars for better centering
        const progressBarWidth = contentWidth * 0.7; // 70% of content width
        const progressBarLeft = centerX - (progressBarWidth / 2);

        doc.setFontSize(11); // Increased from 10
        doc.setFont('helvetica', 'bold');
        doc.text(`Client Payment Progress (${clientProgress.toFixed(1)}%)`, centerX, yPos, { align: 'center' });

        yPos += 8; // Increased from 6

        // Draw progress bar background (centered)
        doc.setDrawColor(240, 240, 240);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(progressBarLeft, yPos, progressBarWidth, 6, 2, 2, 'F');

        // Draw progress bar fill (centered)
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        const clientFillWidth = progressBarWidth * (clientProgress / 100);
        if (clientFillWidth > 0) {
            doc.roundedRect(progressBarLeft, yPos, clientFillWidth, 6, 2, 2, 'F');
        }

        yPos += 15; // Increased from 12

        // Commission Payment Progress (centered)
        doc.setFont('helvetica', 'bold');
        doc.text(`Commission Payment Progress (${commissionProgress.toFixed(1)}%)`, centerX, yPos, { align: 'center' });

        yPos += 8; // Increased from 6

        // Draw progress bar background (centered)
        doc.setDrawColor(240, 240, 240);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(progressBarLeft, yPos, progressBarWidth, 6, 2, 2, 'F');

        // Determine progress bar color based on status
        let progressBarColor;
        if (commissionProgress < clientProgress * 0.8) {
            progressBarColor = redColor;
        } else if (commissionProgress < clientProgress) {
            progressBarColor = orangeColor;
        } else {
            progressBarColor = greenColor;
        }

        // Draw progress bar fill with appropriate color (centered)
        doc.setFillColor(progressBarColor[0], progressBarColor[1], progressBarColor[2]);
        const commissionFillWidth = progressBarWidth * (commissionProgress / 100);
        if (commissionFillWidth > 0) {
            doc.roundedRect(progressBarLeft, yPos, commissionFillWidth, 6, 2, 2, 'F');
        }

        // Footer (centered)
        yPos = pageHeight - 20;
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text('This is an automatically generated statement. For questions, please contact the accounting department.',
            centerX, yPos, { align: 'center' });

        // Save the PDF
        doc.save(`Commission_Statement_${sale.saleCode}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again or contact support.');
    }
};

/**
 * Fallback PDF generation function without using autoTable (centered version)
 */
const generateBasicPDF = (doc: jsPDF, sale: AgentSaleDetails, agentName: string) => {
    // Set up dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const centerX = pageWidth / 2;

    // Format date for the report
    const dateStr = formatDate(new Date());

    // Colors
    const primaryColor = [24, 144, 255]; // #1890ff
    const grayColor = [102, 102, 102]; // #666

    let yPos = margin;

    // Add centered header
    doc.setFontSize(20); // Increased from 18
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Commission Statement', centerX, yPos, { align: 'center' });

    yPos += 10; // Increased from 8
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Generated on ${dateStr}`, centerX, yPos, { align: 'center' });

    yPos += 20; // Increased from 15

    // Agent and Property Details (centered)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Agent: ${agentName}`, centerX, yPos, { align: 'center' });
    yPos += 8; // Increased from 6
    doc.text(`Sale Code: ${sale.saleCode}`, centerX, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Property: ${sale.property}`, centerX, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Unit: ${sale.unit || 'N/A'}`, centerX, yPos, { align: 'center' });

    yPos += 20; // Increased from 15

    // Sale details as simple text (centered)
    doc.setFontSize(16); // Increased from 14
    doc.text('Sale Details', centerX, yPos, { align: 'center' });
    yPos += 10; // Increased from 8

    const salePrice = parseFloat(sale.salePrice);
    const amountPaid = calculateAmountPaid(sale);
    const commissionRate = sale.commissionPercentage || '5';
    const totalCommission = parseFloat(sale.commissionAmount);
    const accruedCommission = calculateAccruedCommission(sale);
    const commissionPaid = parseFloat(sale.commissionPaid) || 0;
    const remainingCommission = Math.max(0, totalCommission - commissionPaid);

    // Function to draw centered key-value pairs
    const drawCenteredKeyValue = (key: string, value: string) => {
        const keyX = centerX - 40;
        const valueX = centerX + 40;

        doc.setFont('helvetica', 'bold');
        doc.text(`${key}:`, keyX, yPos, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.text(value, valueX, yPos, { align: 'left' });

        yPos += 8; // Consistent spacing
    };

    doc.setFontSize(10);
    drawCenteredKeyValue('Sale Price', formatCurrency(salePrice));
    drawCenteredKeyValue('Amount Paid', formatCurrency(amountPaid));
    drawCenteredKeyValue('Commission Rate', `${commissionRate}%`);
    drawCenteredKeyValue('Total Commission', formatCurrency(totalCommission));
    drawCenteredKeyValue('Accrued Commission', formatCurrency(accruedCommission));
    drawCenteredKeyValue('Commission Paid', formatCurrency(commissionPaid));
    drawCenteredKeyValue('Remaining Commission', formatCurrency(remainingCommission));

    // Centered footer
    yPos = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('This is an automatically generated statement. For questions, please contact the accounting department.',
        centerX, yPos, { align: 'center' });

    // Save the PDF
    doc.save(`Commission_Statement_${sale.saleCode}.pdf`);
};

const AgentExpandedRow: React.FC<AgentExpandedRowProps> = ({
    record,
    onShowCommissionPaymentModal,
    calculatePaymentStats
}) => {
    // Sales details columns for expanded row
    const salesDetailsColumns = [
        {
            title: 'Sale Code',
            dataIndex: 'saleCode',
            key: 'saleCode',
            width: 120
        },
        {
            title: 'Property',
            dataIndex: 'property',
            key: 'property',
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'Sale Price',
            dataIndex: 'salePrice',
            key: 'salePrice',
            align: 'right' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: (
                <Tooltip title="Amount actually paid by customer so far">
                    Amount Paid
                </Tooltip>
            ),
            dataIndex: 'amountPaid',
            key: 'amountPaid',
            align: 'right' as const,
            render: (_: any, record: AgentSaleDetails) => {
                const amountPaid = calculateAmountPaid(record);
                return formatCurrency(amountPaid);
            }
        },
        {
            title: (
                <Tooltip title="Commission that can be paid based on the amount the customer has paid">
                    Accrued Commission
                </Tooltip>
            ),
            dataIndex: 'accruedCommission',
            key: 'accruedCommission',
            align: 'right' as const,
            render: (_: any, record: AgentSaleDetails) => {
                const accruedCommission = calculateAccruedCommission(record);
                return <Text style={{ color: '#1890ff' }}>{formatCurrency(accruedCommission)}</Text>;
            }
        },
        {
            title: 'Total Commission',
            dataIndex: 'commissionAmount',
            key: 'commissionAmount',
            align: 'right' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Paid',
            dataIndex: 'commissionPaid',
            key: 'commissionPaid',
            align: 'right' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: (
                <Tooltip title="Client payment progress vs Commission payment progress">
                    Payment Progress
                </Tooltip>
            ),
            dataIndex: 'paymentProgress',
            key: 'paymentProgress',
            align: 'center' as const,
            width: 200,
            render: (_: any, record: AgentSaleDetails) => {
                const clientProgress = calculateClientPaymentProgress(record);
                const commissionProgress = calculateCommissionProgress(record);

                // Calculate status color based on the relationship between commission and client progress
                let statusColor = '#52c41a'; // green by default

                if (commissionProgress < clientProgress * 0.8) {
                    statusColor = '#ff4d4f'; // red if commission progress is significantly behind
                } else if (commissionProgress < clientProgress) {
                    statusColor = '#faad14'; // yellow if commission progress is a bit behind
                }

                return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Tooltip title={`Client Payment: ${clientProgress.toFixed(1)}%`}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text style={{ width: '70px', fontSize: '12px' }}>Client:</Text>
                                <Progress
                                    percent={clientProgress}
                                    size="small"
                                    showInfo={false}
                                    style={{ flex: 1 }}
                                />
                                <Text style={{ width: '40px', fontSize: '12px', textAlign: 'right' }}>
                                    {clientProgress.toFixed(0)}%
                                </Text>
                            </div>
                        </Tooltip>
                        <Tooltip title={`Commission Payment: ${commissionProgress.toFixed(1)}%`}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text style={{ width: '70px', fontSize: '12px' }}>Commission:</Text>
                                <Progress
                                    percent={commissionProgress}
                                    size="small"
                                    showInfo={false}
                                    strokeColor={statusColor}
                                    style={{ flex: 1 }}
                                />
                                <Text style={{ width: '40px', fontSize: '12px', textAlign: 'right' }}>
                                    {commissionProgress.toFixed(0)}%
                                </Text>
                            </div>
                        </Tooltip>
                    </Space>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'commissionStatus',
            key: 'commissionStatus',
            align: 'center' as const,
            render: (status: string, record: AgentSaleDetails) => {
                // Determine real status based on accrued vs paid
                const accrued = calculateAccruedCommission(record);
                const paid = parseFloat(record.commissionPaid) || 0;
                const clientProgress = calculateClientPaymentProgress(record);
                const commissionProgress = calculateCommissionProgress(record);

                let realStatus = status;
                let statusColor = 'red';

                if (accrued <= 0) {
                    realStatus = 'NO PAYMENT';
                    statusColor = 'red';
                } else if (paid >= accrued) {
                    realStatus = 'PAID';
                    statusColor = 'green';
                } else if (paid > 0) {
                    // Show warning if commission payments are lagging behind client payments
                    if (commissionProgress < clientProgress * 0.8) {
                        realStatus = 'BEHIND';
                        statusColor = 'red';
                    } else if (commissionProgress < clientProgress) {
                        realStatus = 'PARTIAL';
                        statusColor = 'orange';
                    } else {
                        realStatus = 'ON TRACK';
                        statusColor = 'green';
                    }
                } else {
                    realStatus = 'PENDING';
                    statusColor = 'blue';
                }

                return (
                    <Tag color={statusColor}>
                        {realStatus}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center' as const,
            render: (_: any, record: AgentSaleDetails) => {
                // Make sure saleData exists and has the required properties
                if (!record.saleData) {
                    console.error('Sale data is missing for record:', record);
                    return null;
                }

                // Check if any commission is available to be paid
                const accruedCommission = calculateAccruedCommission(record);
                const paidCommission = parseFloat(record.commissionPaid) || 0;
                const pendingCommission = Math.max(0, accruedCommission - paidCommission);
                const isFullyPaid = pendingCommission <= 0;

                return (
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                                // Log the sale data for debugging
                                console.log('Adding payment for sale:', record.saleData);

                                // Ensure saleData has the minimum required properties
                                const saleForModal = {
                                    ...record.saleData,
                                    _id: record.saleData._id || record.saleId,
                                    id: record.saleData.id || record.saleId,
                                    saleCode: record.saleData.saleCode || record.saleCode,
                                    salePrice: record.saleData.salePrice || record.salePrice,
                                    commission: record.saleData.commission || {
                                        amount: record.commissionAmount,
                                        percentage: record.commissionPercentage,
                                        status: record.commissionStatus,
                                        payments: record.commissionPayments || []
                                    }
                                };

                                onShowCommissionPaymentModal(saleForModal);
                            }}
                            disabled={isFullyPaid}
                        >
                            <PlusOutlined /> Add Payment
                        </Button>
                        <Button
                            type="default"
                            size="small"
                            icon={<FilePdfOutlined />}
                            onClick={() => generateSaleStatementPDF(record, record.agentName || record.agent || 'Agent')}
                        >
                            Export PDF
                        </Button>
                    </Space>
                );
            }
        }
    ];

    return (
        <div style={{ margin: '0 20px 20px 20px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={5}>Sales Details</Title>
                </Col>
                <Col>
                    <Text type="secondary">
                        <InfoCircleOutlined /> Click the "Export PDF" button to download a detailed commission statement
                    </Text>
                </Col>
            </Row>
            <Table
                columns={salesDetailsColumns}
                dataSource={record.sales}
                pagination={false}
                size="small"
                rowKey="saleId"
                className="commission-table"
                rowClassName={(record) => {
                    const commissionProgress = calculateCommissionProgress(record);
                    const clientProgress = calculateClientPaymentProgress(record);

                    if (commissionProgress < clientProgress * 0.8) {
                        return 'commission-row-alert';
                    } else if (commissionProgress < clientProgress) {
                        return 'commission-row-warning';
                    }
                    return '';
                }}
            />
            <style jsx global>{`
                .commission-table .commission-row-alert {
                    background-color: rgba(255, 77, 79, 0.05);
                }
                .commission-table .commission-row-warning {
                    background-color: rgba(250, 173, 20, 0.05);
                }
                .commission-table .ant-table-row:hover {
                    background-color: rgba(24, 144, 255, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default AgentExpandedRow;