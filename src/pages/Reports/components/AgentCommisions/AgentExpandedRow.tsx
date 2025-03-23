import React from 'react';
import { Table, Typography, Tag, Progress, Button, Tooltip } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AgentCommissionReport, AgentSaleDetails, Sale } from '../types';

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
        // {
        //     title: 'Customer',
        //     dataIndex: 'customer',
        //     key: 'customer',
        // },
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
            title: 'Progress',
            dataIndex: 'paymentProgress',
            key: 'paymentProgress',
            align: 'center' as const,
            render: (progress: number | string, record: AgentSaleDetails) => {
                // Calculate real progress based on amount paid
                const amountPaid = calculateAmountPaid(record);
                const salePrice = parseFloat(record.salePrice) || 0;
                const realProgress = salePrice > 0 ? (amountPaid / salePrice) * 100 : 0;

                return (
                    <Progress
                        percent={Math.min(100, Math.round(realProgress))}
                        size="small"
                        status={realProgress >= 100 ? "success" : realProgress > 0 ? "active" : "exception"}
                    />
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

                let realStatus = status;
                let statusColor = 'red';

                if (accrued <= 0) {
                    realStatus = 'NO PAYMENT';
                    statusColor = 'red';
                } else if (paid >= accrued) {
                    realStatus = 'PAID';
                    statusColor = 'green';
                } else if (paid > 0) {
                    realStatus = 'PARTIAL';
                    statusColor = 'orange';
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
                );
            }
        }
    ];

    return (
        <div style={{ margin: '0 20px 20px 20px' }}>
            <Title level={5}>Sales Details</Title>
            <Table
                columns={salesDetailsColumns}
                dataSource={record.sales}
                pagination={false}
                size="small"
                rowKey="saleId"
            />
        </div>
    );
};

export default AgentExpandedRow;