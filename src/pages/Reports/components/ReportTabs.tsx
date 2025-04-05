import React, { useEffect } from 'react';
import { Tabs, Space, DatePicker, Select } from 'antd';
import {
    TeamOutlined,
    PieChartOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    LineChartOutlined,
    CalendarOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { useFilters } from '../context/FiltersContext';
import { ReportTabsProps, TabKey, Sale } from './types';

// Tab components
import AgentCommissionsTab from './AgentCommisions';
import SalesAnalysisTab from './SalesAnalysis';
import PortfolioProgressTab from './PortfolioProgress';
import AgingBalancesTab from './AgingBalances';
import PerformanceTrendsTab from './PerformanceTrends';

// Payment Analysis tab components
import DuePaymentsTab from './PaymentAnalysis/DuePayments';
import PaymentStatisticsTab from './PaymentAnalysis/PaymentStatistics';
import PaymentForecastsTab from './PaymentAnalysis/PaymentForecasts';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Extended TabKey type to include payment analysis tabs
type ExtendedTabKey = TabKey | 'due-payments' | 'payment-statistics' | 'payment-forecasts';

interface ExtendedReportTabsProps extends ReportTabsProps {
    showCommissionPaymentModal: (sale: Sale) => void;
    activeTab: ExtendedTabKey;
    setActiveTab: (key: ExtendedTabKey) => void;
}

const ReportTabs: React.FC<ExtendedReportTabsProps> = ({
    activeTab,
    setActiveTab,
    salesData,
    usersData,
    propertiesData,
    isLoadingSales,
    isLoadingUsers,
    isLoadingProperties,
    refetchSales,
    showCommissionPaymentModal
}) => {
    const {
        dateRange,
        setDateRange,
        selectedAgents,
        setSelectedAgents,
        selectedProperties,
        setSelectedProperties,
        filterType,
        setFilterType,
        selectedAgingFilter,
        setSelectedAgingFilter,
        // Make sure these are added to your FiltersContext
        paymentStatus,
        setPaymentStatus,
        paymentType,
        setPaymentType,
        refreshData
    } = useFilters();

    // Create enhanced filter handlers that trigger refreshes
    const handleDateRangeChange = (dates: any) => {
        console.log("Date range changed:", dates);
        setDateRange(dates);
        // Force a refresh to update the data
        refreshData();
    };

    const handlePaymentStatusChange = (value: string) => {
        console.log("Payment status changed to:", value);
        setPaymentStatus(value);
        // Force a refresh to update the data
        refreshData();
    };

    const handlePaymentTypeChange = (value: string) => {
        console.log("Payment type changed to:", value);
        setPaymentType(value);
        // Force a refresh to update the data
        refreshData();
    };

    const handlePropertiesChange = (values: string[]) => {
        console.log("Selected properties changed to:", values);
        setSelectedProperties(values);
        // Force a refresh to update the data
        refreshData();
    };

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key as ExtendedTabKey);
    };

    // Log when filters change
    useEffect(() => {
        console.log("Filter values in ReportTabs:", {
            dateRange,
            selectedProperties,
            paymentStatus,
            paymentType
        });
    }, [dateRange, selectedProperties, paymentStatus, paymentType]);

    return (
        <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            tabBarExtraContent={
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        allowClear={false}
                    />
                    {activeTab === 'agent-commissions' && (
                        <>
                            <Select
                                mode="multiple"
                                style={{ minWidth: 200 }}
                                placeholder="Select Agents"
                                value={selectedAgents}
                                onChange={setSelectedAgents}
                                loading={isLoadingUsers}
                                allowClear
                            >
                                {usersData.map(agent => (
                                    <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                                        {agent.name}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                style={{ width: 140 }}
                                placeholder="Commission"
                                value={filterType}
                                onChange={setFilterType}
                            >
                                <Option value="all">All Commissions</Option>
                                <Option value="paid">Paid Only</Option>
                                <Option value="partial">Partial Only</Option>
                                <Option value="unpaid">Unpaid Only</Option>
                            </Select>
                        </>
                    )}
                    {activeTab === 'sales-analysis' && (
                        <>
                            <Select
                                mode="multiple"
                                style={{ minWidth: 200 }}
                                placeholder="Select Properties"
                                value={selectedProperties}
                                onChange={handlePropertiesChange}
                                loading={isLoadingProperties}
                                allowClear
                            >
                                {propertiesData.map(property => (
                                    <Option key={property._id || property.id} value={property._id || property.id}>
                                        {property.name}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                mode="multiple"
                                style={{ minWidth: 200 }}
                                placeholder="Select Agents"
                                value={selectedAgents}
                                onChange={setSelectedAgents}
                                loading={isLoadingUsers}
                                allowClear
                            >
                                {usersData.map(agent => (
                                    <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                                        {agent.name}
                                    </Option>
                                ))}
                            </Select>
                        </>
                    )}
                    {activeTab === 'portfolio-progress' && (
                        <Select
                            mode="multiple"
                            style={{ minWidth: 200 }}
                            placeholder="Select Properties"
                            value={selectedProperties}
                            onChange={handlePropertiesChange}
                            loading={isLoadingProperties}
                            allowClear
                        >
                            {propertiesData.map(property => (
                                <Option key={property._id || property.id} value={property._id || property.id}>
                                    {property.name}
                                </Option>
                            ))}
                        </Select>
                    )}
                    {activeTab === 'aging-balances' && (
                        <>
                            <Select
                                style={{ width: 140 }}
                                placeholder="Aging Period"
                                value={selectedAgingFilter}
                                onChange={setSelectedAgingFilter}
                            >
                                <Option value="all">All Periods</Option>
                                <Option value="0-30">0-30 Days</Option>
                                <Option value="31-60">31-60 Days</Option>
                                <Option value="61-90">61-90 Days</Option>
                                <Option value="91-plus">90+ Days</Option>
                            </Select>
                            <Select
                                mode="multiple"
                                style={{ minWidth: 200 }}
                                placeholder="Select Properties"
                                value={selectedProperties}
                                onChange={handlePropertiesChange}
                                loading={isLoadingProperties}
                                allowClear
                            >
                                {propertiesData.map(property => (
                                    <Option key={property._id || property.id} value={property._id || property.id}>
                                        {property.name}
                                    </Option>
                                ))}
                            </Select>
                        </>
                    )}
                    {(activeTab === 'due-payments' || activeTab === 'payment-statistics' || activeTab === 'payment-forecasts') && (
                        <>
                            {activeTab === 'due-payments' && (
                                <>
                                    <Select
                                        style={{ width: 140 }}
                                        placeholder="Status"
                                        value={paymentStatus}
                                        onChange={handlePaymentStatusChange}
                                    >
                                        <Option value="all">All Payments</Option>
                                        <Option value="due">Due</Option>
                                        <Option value="overdue">Overdue</Option>
                                        <Option value="paid">Paid</Option>
                                        <Option value="partial">Partial</Option>
                                    </Select>
                                    <Select
                                        style={{ width: 140 }}
                                        placeholder="Type"
                                        value={paymentType}
                                        onChange={handlePaymentTypeChange}
                                    >
                                        <Option value="all">All Types</Option>
                                        <Option value="deposit">Deposit</Option>
                                        <Option value="installment">Installment</Option>
                                        <Option value="final">Final</Option>
                                    </Select>
                                    <Select
                                        mode="multiple"
                                        style={{ minWidth: 200 }}
                                        placeholder="Select Properties"
                                        value={selectedProperties}
                                        onChange={handlePropertiesChange}
                                        loading={isLoadingProperties}
                                        allowClear
                                    >
                                        {propertiesData.map(property => (
                                            <Option key={property._id || property.id} value={property._id || property.id}>
                                                {property.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </>
                            )}
                        </>
                    )}
                </Space>
            }
        >
            {/* Original Report Tabs */}
            <TabPane
                tab={
                    <span>
                        <TeamOutlined /> Agent Commissions
                    </span>
                }
                key="agent-commissions"
            >
                <AgentCommissionsTab
                    salesData={salesData}
                    usersData={usersData}
                    isLoading={isLoadingSales}
                    refetchSales={refetchSales}
                    showCommissionPaymentModal={showCommissionPaymentModal}
                />
            </TabPane>

            <TabPane
                tab={
                    <span>
                        <PieChartOutlined /> Sales Analysis
                    </span>
                }
                key="sales-analysis"
            >
                <SalesAnalysisTab
                    salesData={salesData}
                    isLoading={isLoadingSales}
                />
            </TabPane>

            <TabPane
                tab={
                    <span>
                        <BarChartOutlined /> Portfolio Progress
                    </span>
                }
                key="portfolio-progress"
            >
                <PortfolioProgressTab
                    salesData={salesData}
                    propertiesData={propertiesData}
                    isLoading={isLoadingSales || isLoadingProperties}
                />
            </TabPane>

            <TabPane
                tab={
                    <span>
                        <ClockCircleOutlined /> Aging Balances
                    </span>
                }
                key="aging-balances"
            >
                <AgingBalancesTab
                    salesData={salesData}
                    isLoading={isLoadingSales}
                />
            </TabPane>

            <TabPane
                tab={
                    <span>
                        <LineChartOutlined /> Performance Trends
                    </span>
                }
                key="performance-trends"
            >
                <PerformanceTrendsTab
                    salesData={salesData}
                    isLoading={isLoadingSales}
                />
            </TabPane>

            {/* Payment Analysis Tabs - Pass filters directly as props */}
            <TabPane
                tab={
                    <span>
                        <CalendarOutlined /> Due Payments
                    </span>
                }
                key="due-payments"
            >
                <DuePaymentsTab
                    salesData={salesData}
                    propertiesData={propertiesData}
                    isLoading={isLoadingSales || isLoadingProperties}
                    paymentStatus={paymentStatus}
                    paymentType={paymentType}
                    selectedProperties={selectedProperties}
                    dateRange={dateRange}
                />
            </TabPane>

            <TabPane
                tab={
                    <span>
                        <BarChartOutlined /> Payment Statistics
                    </span>
                }
                key="payment-statistics"
            >
                <PaymentStatisticsTab
                    salesData={salesData}
                    isLoading={isLoadingSales}
                />
            </TabPane>

            <TabPane
                tab={
                    <span>
                        <DollarOutlined /> Payment Forecasts
                    </span>
                }
                key="payment-forecasts"
            >
                <PaymentForecastsTab
                    salesData={salesData}
                    isLoading={isLoadingSales}
                />
            </TabPane>
        </Tabs>
    );
};

export default ReportTabs;