import React from 'react';
import { Table, Space, Button, Dropdown, Menu, Typography, Tooltip } from 'antd';
import { DownloadOutlined, DownOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { AgentCommissionReport, Sale } from '../types';
import { formatCurrency } from '../../utils/formatters';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';
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
    calculatePaymentStats?: (sale: Sale) => any;
}

/**
 * Calculate amount paid for a sale directly from payments array
 */
const calculateAmountPaid = (sale: Sale): number => {
    // Check if the sale has the saleData property where payments are stored
    const saleData = sale.saleData || sale;

    // For completed sales, the full sale price has been paid
    if (saleData.status === 'completed') {
        return parseFloat(saleData.salePrice) || 0;
    }

    // Get directly from payments array - this is the source of truth
    if (saleData.payments && Array.isArray(saleData.payments) && saleData.payments.length > 0) {
        return saleData.payments.reduce((sum, payment) => {
            const amount = parseFloat(payment.amount) || 0;
            // Count all payments regardless of status for now
            return sum + amount;
        }, 0);
    }

    // Fallback to amountPaid field if it exists
    return parseFloat(saleData.amountPaid || sale.amountPaid) || 0;
};

/**
 * Calculate accrued commission based on amount paid
 */
const calculateAccruedCommission = (sale: Sale): number => {
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
    setExportLoading,
    calculatePaymentStats
}) => {
    const { dateRange } = useFilters();

    // Calculate total accrued commission for an agent
    const calculateTotalAccruedCommission = (record: AgentCommissionReport) => {
        return record.sales.reduce((sum, sale) => {
            return sum + calculateAccruedCommission(sale);
        }, 0);
    };

    // Handle export with filtered columns
    const handleExport = (record, format) => {
        // Columns to exclude from export
        const excludeColumns = ['saleId', 'commissionStatus', 'unit', 'unitId', 'saleData', 'quantity', 'paymentProgress', 'propertyId'];

        // Prepare filtered data
        const exportData = record.sales.map(sale => {
            const filteredSale = { ...sale };
            excludeColumns.forEach(col => {
                delete filteredSale[col];
            });

            // Add calculated values if they don't exist
            if (!filteredSale.amountPaid) {
                filteredSale.amountPaid = calculateAmountPaid(sale);
            }

            if (!filteredSale.accruedCommission) {
                filteredSale.accruedCommission = calculateAccruedCommission(sale);
            }

            return filteredSale;
        });

        // Export based on format
        setExportLoading(true);

        try {
            if (format === 'excel') {
                exportToExcel(exportData, `${record.agentName}_Commission`, setExportLoading);
            } else if (format === 'csv') {
                exportToCSV(exportData, `${record.agentName}_Commission`, setExportLoading);
            } else if (format === 'pdf') {
                exportToPDF(exportData, `${record.agentName}_Commission`, setExportLoading);
            }
        } catch (error) {
            console.error(`Error exporting to ${format}:`, error);
            setExportLoading(false);
        }
    };

    // Agent commissions report columns
    const agentColumns = [
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
            width: 200,
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
            width: 80,
            align: 'center' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalSales - b.totalSales,
            sortOrder: sortedInfo.columnKey === 'totalSales' && sortedInfo.order,
        },
        {
            title: 'Sale Value',
            dataIndex: 'totalSaleValue',
            key: 'totalSaleValue',
            width: 120,
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalSaleValue - b.totalSaleValue,
            sortOrder: sortedInfo.columnKey === 'totalSaleValue' && sortedInfo.order,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: (
                <Tooltip title="The total amount that clients have paid for all of this agent's sales">
                    Amount Paid
                </Tooltip>
            ),
            dataIndex: 'totalAmountPaid',
            key: 'totalAmountPaid',
            width: 120,
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) => {
                const aPaid = a.sales.reduce((sum, sale) => sum + calculateAmountPaid(sale), 0);
                const bPaid = b.sales.reduce((sum, sale) => sum + calculateAmountPaid(sale), 0);
                return aPaid - bPaid;
            },
            sortOrder: sortedInfo.columnKey === 'totalAmountPaid' && sortedInfo.order,
            render: (_: number, record: AgentCommissionReport) => {
                const totalPaid = record.sales.reduce((sum, sale) => {
                    return sum + calculateAmountPaid(sale);
                }, 0);

                return formatCurrency(totalPaid);
            }
        },
        {
            title: (
                <Tooltip title="Commission calculated based on what clients have actually paid so far">
                    Accrued Commission
                </Tooltip>
            ),
            dataIndex: 'accruedPayableCommission',
            key: 'accruedPayableCommission',
            width: 140,
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) => {
                return calculateTotalAccruedCommission(a) - calculateTotalAccruedCommission(b);
            },
            sortOrder: sortedInfo.columnKey === 'accruedPayableCommission' && sortedInfo.order,
            render: (_: any, record: AgentCommissionReport) => {
                const accruedCommission = calculateTotalAccruedCommission(record);
                return <Text style={{ color: '#1890ff' }}>{formatCurrency(accruedCommission)}</Text>;
            }
        },
        {
            title: (
                <Tooltip title="Total commission when all sales are fully paid">
                    Total Commission
                </Tooltip>
            ),
            dataIndex: 'totalCommission',
            key: 'totalCommission',
            width: 130,
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalCommission - b.totalCommission,
            sortOrder: sortedInfo.columnKey === 'totalCommission' && sortedInfo.order,
            defaultSortOrder: 'descend' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Paid',
            dataIndex: 'totalCommissionPaid',
            key: 'totalCommissionPaid',
            width: 100,
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) =>
                a.totalCommissionPaid - b.totalCommissionPaid,
            sortOrder: sortedInfo.columnKey === 'totalCommissionPaid' && sortedInfo.order,
            render: (text: number) => <Text type="success">{formatCurrency(text)}</Text>
        },
        {
            title: (
                <Tooltip title="Commission that can be paid now based on client payments minus already paid commission">
                    Pending
                </Tooltip>
            ),
            dataIndex: 'pendingCommission',
            key: 'pendingCommission',
            width: 100,
            align: 'right' as const,
            sorter: (a: AgentCommissionReport, b: AgentCommissionReport) => {
                const aPending = calculateTotalAccruedCommission(a) - a.totalCommissionPaid;
                const bPending = calculateTotalAccruedCommission(b) - b.totalCommissionPaid;
                return aPending - bPending;
            },
            sortOrder: sortedInfo.columnKey === 'pendingCommission' && sortedInfo.order,
            render: (_: any, record: AgentCommissionReport) => {
                const accruedCommission = calculateTotalAccruedCommission(record);
                const pendingCommission = Math.max(0, accruedCommission - record.totalCommissionPaid);
                return <Text type="warning">{formatCurrency(pendingCommission)}</Text>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (_: any, record: AgentCommissionReport) => (
                <Space>
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item
                                key="1"
                                onClick={() => handleExport(record, 'excel')}
                            >
                                <FileExcelOutlined /> Excel
                            </Menu.Item>
                            <Menu.Item
                                key="2"
                                onClick={() => handleExport(record, 'csv')}
                            >
                                <DownloadOutlined /> CSV
                            </Menu.Item>
                            <Menu.Item
                                key="3"
                                onClick={() => handleExport(record, 'pdf')}
                            >
                                <FilePdfOutlined /> PDF
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
            scroll={{ x: 1140 }}
            expandable={{
                expandedRowRender: (record) => (
                    <AgentExpandedRow
                        record={record}
                        onShowCommissionPaymentModal={handleShowCommissionPaymentModal}
                        calculatePaymentStats={calculatePaymentStats}
                    />
                ),
                expandRowByClick: true,
                expandedRowKeys,
                onExpand: onExpandRow
            }}
            onChange={onTableChange}
            size="middle"
            pagination={{
                pageSize: 10,
                position: ['bottomRight']
            }}
            summary={(pageData) => {
                if (!pageData || pageData.length === 0) return null;

                let totalSales = 0;
                let totalSaleValue = 0;
                let totalAmountPaid = 0;
                let totalAccruedCommission = 0;
                let totalCommission = 0;
                let totalCommissionPaid = 0;
                let totalPendingCommission = 0;

                pageData.forEach(record => {
                    totalSales += record.totalSales || 0;
                    totalSaleValue += record.totalSaleValue || 0;

                    // Calculate total amount paid across all agents' sales
                    totalAmountPaid += record.sales.reduce((sum, sale) => {
                        return sum + calculateAmountPaid(sale);
                    }, 0);

                    // Calculate total accrued commission across all agents
                    const agentAccruedCommission = calculateTotalAccruedCommission(record);
                    totalAccruedCommission += agentAccruedCommission;

                    totalCommission += record.totalCommission || 0;
                    totalCommissionPaid += record.totalCommissionPaid || 0;
                    totalPendingCommission += Math.max(0, agentAccruedCommission - record.totalCommissionPaid);
                });

                return (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                                {/* <Text strong>Totals:</Text> */}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={0}>
                                {/* <Text strong>Totals:</Text> */}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="center">
                                <Text strong>{totalSales}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">
                                <Text strong>{formatCurrency(totalSaleValue)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} align="right">
                                <Text strong>{formatCurrency(totalAmountPaid)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4} align="right">
                                <Text strong style={{ color: '#1890ff' }}>{formatCurrency(totalAccruedCommission)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5} align="right">
                                <Text strong>{formatCurrency(totalCommission)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={6} align="right">
                                <Text strong type="success">{formatCurrency(totalCommissionPaid)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={7} align="right">
                                <Text strong type="warning">{formatCurrency(totalPendingCommission)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={8}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
};

export default AgentCommissionsTable;