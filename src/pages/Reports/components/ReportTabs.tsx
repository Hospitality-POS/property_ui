import React from 'react';
import { Tabs, Space, DatePicker, Select } from 'antd';
import {
    TeamOutlined,
    PieChartOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { useFilters } from '../context/FiltersContext';
import { ReportTabsProps, TabKey, Sale } from './types';

// Tab components
import AgentCommissionsTab from './AgentCommisions';
import SalesAnalysisTab from './SalesAnalysis';
import PortfolioProgressTab from './PortfolioProgress';
import AgingBalancesTab from './AgingBalances';
import PerformanceTrendsTab from './PerformanceTrends';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ExtendedReportTabsProps extends ReportTabsProps {
    showCommissionPaymentModal: (sale: Sale) => void;
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
        setSelectedAgingFilter
    } = useFilters();

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key as TabKey);
    };

    return (
        <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            tabBarExtraContent={
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates as [any, any])}
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
                                onChange={setSelectedProperties}
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
                            onChange={setSelectedProperties}
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
                                onChange={setSelectedProperties}
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
                </Space>
            }
        >
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
        </Tabs>
    );
};

export default ReportTabs;