import React from 'react';
import { Table, Typography, Tag, Progress, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AgentCommissionReport, AgentSaleDetails, Sale } from '../types';

const { Title } = Typography;

interface AgentExpandedRowProps {
    record: AgentCommissionReport;
    onShowCommissionPaymentModal: (sale: Sale) => void;
}

const AgentExpandedRow: React.FC<AgentExpandedRowProps> = ({
    record,
    onShowCommissionPaymentModal
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
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        // {
        //     title: 'Sale Date',
        //     dataIndex: 'saleDate',
        //     key: 'saleDate',
        //     render: (text: string) => formatDate(text)
        // },
        {
            title: 'Sale Price',
            dataIndex: 'salePrice',
            key: 'salePrice',
            align: 'right' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Commission',
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
            render: (progress: number | string) => (
                <Progress
                    percent={Number(progress)}
                    size="small"
                    status={Number(progress) >= 100 ? "success" : Number(progress) > 0 ? "active" : "exception"}
                />
            )
        },
        {
            title: 'Status',
            dataIndex: 'commissionStatus',
            key: 'commissionStatus',
            align: 'center' as const,
            render: (status: string) => (
                <Tag color={
                    status === 'paid' ? 'green' :
                        status === 'partial' ? 'orange' : 'red'
                }>
                    {status.toUpperCase()}
                </Tag>
            )
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
                        disabled={record.commissionStatus === 'paid'}
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