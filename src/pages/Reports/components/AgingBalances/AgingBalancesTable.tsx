import React, { useState } from 'react';
import { Table, Typography, Tag, Progress, Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { AgingBalance } from '../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';

const { Text, Title } = Typography;

interface AgingBalancesTableProps {
    agingBalancesData: AgingBalance[];
    exportLoading: boolean;
    setExportLoading: (loading: boolean) => void;
}

const AgingBalancesTable: React.FC<AgingBalancesTableProps> = ({
    agingBalancesData,
    exportLoading,
    setExportLoading
}) => {
    const [sortedInfo, setSortedInfo] = useState<any>({});

    // Handle table sort change
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setSortedInfo(sorter);
    };

    // Handle export
    const handleExport = (type: 'excel' | 'csv') => {
        if (type === 'excel') {
            exportToExcel(agingBalancesData, 'Aging_Balances_Report', setExportLoading);
        } else {
            exportToCSV(agingBalancesData, 'Aging_Balances_Report', setExportLoading);
        }
    };

    // Aging balances columns
    const agingBalancesColumns = [
        {
            title: 'Customer',
            dataIndex: 'customerName',
            key: 'customerName',
            sorter: (a: AgingBalance, b: AgingBalance) =>
                a.customerName.localeCompare(b.customerName),
            sortOrder: sortedInfo.columnKey === 'customerName' && sortedInfo.order,
            render: (text: string, record: AgingBalance) => (
                <div>
                    <Text strong>{text}</Text>
                    <div>
                        <Text type="secondary">{record.customerContact}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Sale Code',
            dataIndex: 'saleCode',
            key: 'saleCode',
        },
        {
            title: 'Property',
            dataIndex: 'propertyName',
            key: 'propertyName',
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
            sorter: (a: AgingBalance, b: AgingBalance) => a.salePrice - b.salePrice,
            sortOrder: sortedInfo.columnKey === 'salePrice' && sortedInfo.order,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Paid Amount',
            dataIndex: 'totalPaid',
            key: 'totalPaid',
            align: 'right' as const,
            sorter: (a: AgingBalance, b: AgingBalance) => a.totalPaid - b.totalPaid,
            sortOrder: sortedInfo.columnKey === 'totalPaid' && sortedInfo.order,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Outstanding Balance',
            dataIndex: 'outstandingBalance',
            key: 'outstandingBalance',
            align: 'right' as const,
            sorter: (a: AgingBalance, b: AgingBalance) => a.outstandingBalance - b.outstandingBalance,
            sortOrder: sortedInfo.columnKey === 'outstandingBalance' && sortedInfo.order,
            defaultSortOrder: 'descend' as const,
            render: (text: number) => <Text type="danger">{formatCurrency(text)}</Text>
        },
        {
            title: 'Payment Progress',
            dataIndex: 'paymentProgress',
            key: 'paymentProgress',
            align: 'center' as const,
            sorter: (a: AgingBalance, b: AgingBalance) =>
                Number(a.paymentProgress) - Number(b.paymentProgress),
            sortOrder: sortedInfo.columnKey === 'paymentProgress' && sortedInfo.order,
            render: (progress: number | string) => (
                <Progress
                    percent={Number(progress)}
                    size="small"
                    status={Number(progress) >= 100 ? "success" : Number(progress) > 0 ? "active" : "exception"}
                />
            )
        },
        {
            title: 'Aging',
            dataIndex: 'agingPeriod',
            key: 'agingPeriod',
            align: 'center' as const,
            filters: [
                { text: '0-30 days', value: '0-30 days' },
                { text: '31-60 days', value: '31-60 days' },
                { text: '61-90 days', value: '61-90 days' },
                { text: '90+ days', value: '90+ days' },
            ],
            onFilter: (value: string, record: AgingBalance) => record.agingPeriod === value,
            render: (period: string) => {
                let color = 'green';
                if (period === '31-60 days') color = 'orange';
                if (period === '61-90 days') color = 'volcano';
                if (period === '90+ days') color = 'red';

                return (
                    <Tag color={color}>
                        {period}
                    </Tag>
                );
            }
        },
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
        }
    ];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={5}>Outstanding Balance Details</Title>
                <Space>
                    <Button
                        onClick={() => handleExport('excel')}
                        loading={exportLoading}
                        icon={<DownloadOutlined />}
                    >
                        Export to Excel
                    </Button>
                    <Button
                        onClick={() => handleExport('csv')}
                        loading={exportLoading}
                        icon={<DownloadOutlined />}
                    >
                        Export to CSV
                    </Button>
                </Space>
            </div>
            <Table
                columns={agingBalancesColumns}
                dataSource={agingBalancesData}
                rowKey="saleId"
                onChange={handleTableChange}
            />
        </>
    );
};

export default AgingBalancesTable;