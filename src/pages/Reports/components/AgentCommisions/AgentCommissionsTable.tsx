import React from 'react';
import { Table, Space, Button, Dropdown, Menu, Typography } from 'antd';
import { DownloadOutlined, DownOutlined, PrinterOutlined, FileExcelOutlined } from '@ant-design/icons';
import { AgentCommissionReport, Sale } from '../types';
import { formatCurrency } from '../../utils/formatters';
import { exportToExcel, exportToCSV, printAgentCommission } from '../../utils/exportUtils';
import AgentExpandedRow from './AgentExpandedRow';
import { useFilters } from '../../context/FiltersContext';

const { Text } = Typography;

interface AgentCommissionsTableProps {
    reportData: AgentCommissionReport[];
    expandedRowKeys: string[];
    sortedInfo: any;
    onExpandRow: (expanded: boolean, record: AgentCommissionReport) => void;
    onTableChange: (pagination: any, filters: any, sorter: any) => void;
    onShowCommissionPaymentModal: (sale: Sale) => void;
    printLoading: boolean;
    exportLoading: boolean;
    setPrintLoading: (loading: boolean) => void;
    setExportLoading: (loading: boolean) => void;
}

const AgentCommissionsTable: React.FC<AgentCommissionsTableProps> = ({
    reportData,
    expandedRowKeys,
    sortedInfo,
    onExpandRow,
    onTableChange,
    onShowCommissionPaymentModal,
    printLoading,
    exportLoading,
    setPrintLoading,
    setExportLoading
}) => {
    const { dateRange } = useFilters();

    // Agent commissions report columns
    const agentColumns = [
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.agentName.localeCompare(b.agentName),
            sortOrder: sortedInfo.columnKey === 'agentName' && sortedInfo.order,
            render: (text: string, record: AgentCommissionReport) => (
                <div>
                    <Text strong>{text}</Text>
                    <div>
                        <Text type="secondary">{record.agentEmail}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            align: 'center' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalSales - b.totalSales,
            sortOrder: sortedInfo.columnKey === 'totalSales' && sortedInfo.order,
        },
        {
            title: 'Total Sale Value',
            dataIndex: 'totalSaleValue',
            key: 'totalSaleValue',
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalSaleValue - b.totalSaleValue,
            sortOrder: sortedInfo.columnKey === 'totalSaleValue' && sortedInfo.order,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Total Commission',
            dataIndex: 'totalCommission',
            key: 'totalCommission',
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalCommission - b.totalCommission,
            sortOrder: sortedInfo.columnKey === 'totalCommission' && sortedInfo.order,
            defaultSortOrder: 'descend' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Paid Commission',
            dataIndex: 'totalCommissionPaid',
            key: 'totalCommissionPaid',
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalCommissionPaid - b.totalCommissionPaid,
            sortOrder: sortedInfo.columnKey === 'totalCommissionPaid' && sortedInfo.order,
            render: (text: number) => <Text type="success">{formatCurrency(text)}</Text>
        },
        {
            title: 'Pending Commission',
            dataIndex: 'totalCommissionPending',
            key: 'totalCommissionPending',
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalCommissionPending - b.totalCommissionPending,
            sortOrder: sortedInfo.columnKey === 'totalCommissionPending' && sortedInfo.order,
            render: (text: number) => <Text type="warning">{formatCurrency(text)}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center' as const,
            render: (_: any, record: AgentCommissionReport) => (
                <Space>
                    <Button
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={() => printAgentCommission(record, dateRange, formatCurrency, () => { }, setPrintLoading)}
                        loading={printLoading}
                    >
                        Print
                    </Button>
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item
                                key="1"
                                onClick={() => exportToExcel(record.sales, `${record.agentName}_Commission`, setExportLoading)}
                            >
                                <FileExcelOutlined /> Excel
                            </Menu.Item>
                            <Menu.Item
                                key="2"
                                onClick={() => exportToCSV(record.sales, `${record.agentName}_Commission`, setExportLoading)}
                            >
                                <DownloadOutlined /> CSV
                            </Menu.Item>
                        </Menu>
                    }>
                        <Button size="small" loading={exportLoading}>
                            <DownloadOutlined /> Export <DownOutlined />
                        </Button>
                    </Dropdown>
                </Space>
            )
        }
    ];

    // Handle showing commission payment modal
    const handleShowCommissionPaymentModal = (sale: Sale) => {
        console.log('Showing commission payment modal from table for sale:', sale);
        onShowCommissionPaymentModal(sale);
    };

    return (
        <Table
            columns={agentColumns}
            dataSource={reportData}
            rowKey="agentId"
            expandable={{
                expandedRowRender: (record) => (
                    <AgentExpandedRow
                        record={record}
                        onShowCommissionPaymentModal={handleShowCommissionPaymentModal}
                    />
                ),
                expandRowByClick: true,
                expandedRowKeys,
                onExpand: onExpandRow
            }}
            onChange={onTableChange}
        />
    );
};

export default AgentCommissionsTable;