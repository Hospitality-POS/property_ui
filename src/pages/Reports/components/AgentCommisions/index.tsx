import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Empty, Spin, message } from 'antd';
import { useFilters } from '../../context/FiltersContext';
import { Sale, User, AgentCommissionReport } from '../types';
import { generateAgentCommissionsReport } from '../../utils/dataProcessors';
import AgentCommissionsSummary from './AgentCommissionsSummary';
import AgentCommissionsTable from './AgentCommissionsTable';

interface AgentCommissionsTabProps {
    salesData: Sale[];
    usersData: User[];
    isLoading: boolean;
    refetchSales: () => void;
    showCommissionPaymentModal: (sale: Sale) => void; // Ensure this prop is passed from parent
}

const AgentCommissionsTab: React.FC<AgentCommissionsTabProps> = ({
    salesData,
    usersData,
    isLoading,
    refetchSales,
    showCommissionPaymentModal
}) => {
    const [reportData, setReportData] = useState<AgentCommissionReport[]>([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [sortedInfo, setSortedInfo] = useState<any>({});
    const [printLoading, setPrintLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    const {
        dateRange,
        selectedAgents,
        filterType
    } = useFilters();

    // Process sales data to generate report when dependencies change
    useEffect(() => {
        if (!salesData.length) return;

        const processedData = generateAgentCommissionsReport(
            salesData,
            dateRange,
            selectedAgents,
            filterType
        );

        setReportData(processedData);
    }, [salesData, dateRange, selectedAgents, filterType]);

    // Calculate totals for the summary
    const calculateTotals = () => {
        let totalSales = 0;
        let totalSaleValue = 0;
        let totalCommission = 0;
        let totalPaidCommission = 0;
        let totalPendingCommission = 0;

        reportData.forEach(agent => {
            totalSales += agent.totalSales;
            totalSaleValue += agent.totalSaleValue;
            totalCommission += agent.totalCommission;
            totalPaidCommission += agent.totalCommissionPaid;
            totalPendingCommission += agent.totalCommissionPending;
        });

        return {
            totalSales,
            totalSaleValue,
            totalCommission,
            totalPaidCommission,
            totalPendingCommission
        };
    };

    // Handle row expansion
    const handleExpandRow = (expanded: boolean, record: AgentCommissionReport) => {
        setExpandedRowKeys(expanded ? [record.agentId] : []);
    };

    // Handle table sort change
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setSortedInfo(sorter);
    };

    // Handle showing the commission payment modal
    const handleShowCommissionPaymentModal = (sale: Sale) => {
        console.log('Showing commission payment modal from tab for sale:', sale);

        // Make sure the sale has the required properties
        if (!sale || !sale._id) {
            message.error('Invalid sale data. Cannot add payment.');
            console.error('Invalid sale data:', sale);
            return;
        }

        // Call the parent function to show the modal
        showCommissionPaymentModal(sale);
    };

    const totals = calculateTotals();

    return (
        <>
            {/* Summary stats */}
            <AgentCommissionsSummary totals={totals} />

            {/* Agent commissions table */}
            <Card style={{ marginTop: 16 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading report data..." />
                    </div>
                ) : reportData.length > 0 ? (
                    <AgentCommissionsTable
                        reportData={reportData}
                        expandedRowKeys={expandedRowKeys}
                        sortedInfo={sortedInfo}
                        onExpandRow={handleExpandRow}
                        onTableChange={handleTableChange}
                        onShowCommissionPaymentModal={handleShowCommissionPaymentModal}
                        printLoading={printLoading}
                        exportLoading={exportLoading}
                        setPrintLoading={setPrintLoading}
                        setExportLoading={setExportLoading}
                    />
                ) : (
                    <Empty
                        description="No commission data found for the selected criteria"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>
        </>
    );
};

export default AgentCommissionsTab;