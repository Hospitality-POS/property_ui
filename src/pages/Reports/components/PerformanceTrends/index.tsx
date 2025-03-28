import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Typography, Tabs, Table } from 'antd';
import { Line, Column, Bar } from '@ant-design/charts';
import { useFilters } from '../../context/FiltersContext';
import { Sale, PerformanceTrends, AgentPerformance } from '../types';
import { generatePerformanceTrendsReport } from '../../utils/dataProcessors';
import PerformanceSummary from './PerformanceSummary';
import { formatCurrency } from '../../utils/formatters';

const { Title } = Typography;
const { TabPane } = Tabs;

interface PerformanceTrendsTabProps {
    salesData: Sale[];
    isLoading: boolean;
}

const PerformanceTrendsTab: React.FC<PerformanceTrendsTabProps> = ({
    salesData,
    isLoading
}) => {
    const [performanceTrendsData, setPerformanceTrendsData] = useState<PerformanceTrends>({
        monthlyData: [],
        agentData: []
    });
    const [activeChartTab, setActiveChartTab] = useState('count');

    const { dateRange } = useFilters();

    // Process data to generate performance trends report
    useEffect(() => {
        if (!salesData.length) return;

        const processedData = generatePerformanceTrendsReport(
            salesData,
            dateRange
        );

        setPerformanceTrendsData(processedData);
    }, [salesData, dateRange]);

    // Monthly sales count chart config
    const monthlySalesCountConfig = {
        data: performanceTrendsData.monthlyData,
        xField: 'monthName',
        yField: 'salesCount',
        seriesField: 'monthName',
        color: '#1890ff',
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
        smooth: true,
        xAxis: {
            title: {
                text: 'Month',
            },
        },
        yAxis: {
            title: {
                text: 'Sales Count',
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: 'Sales', value: datum.salesCount };
            },
        },
        meta: {
            salesCount: {
                alias: 'Sales Count',
            },
        },
    };

    // Monthly sales value chart config
    const monthlySalesValueConfig = {
        data: performanceTrendsData.monthlyData,
        xField: 'monthName',
        yField: 'salesValue',
        seriesField: 'monthName',
        color: '#52c41a',
        point: {
            size: 5,
            shape: 'circle',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
        smooth: true,
        xAxis: {
            title: {
                text: 'Month',
            },
        },
        yAxis: {
            title: {
                text: 'Sales Value',
            },
            label: {
                formatter: (v: number) => {
                    return `KES ${(v / 1000).toFixed(0)}K`;
                },
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: 'Sales Value',
                    value: formatCurrency(datum.salesValue)
                };
            },
        },
        meta: {
            salesValue: {
                alias: 'Sales Value',
            },
        },
    };

    // Agent performance chart config
    const agentPerformanceConfig = {
        data: performanceTrendsData.agentData
            .slice(0, 10) // Display top 10 agents
            .sort((a, b) => a.totalValue - b.totalValue),
        xField: activeChartTab === 'count' ? 'totalSales' : 'totalValue',
        yField: 'agentName',
        seriesField: 'agentName',
        color: '#faad14',
        legend: {
            position: 'top',
        },
        xAxis: {
            title: {
                text: activeChartTab === 'count' ? 'Total Sales Count' : 'Total Sales Value',
            },
            label: activeChartTab === 'value' ? {
                formatter: (v: number) => {
                    return `KES ${(v / 1000).toFixed(0)}K`;
                },
            } : {},
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: activeChartTab === 'count' ? 'Sales Count' : 'Sales Value',
                    value: activeChartTab === 'count'
                        ? datum.totalSales
                        : formatCurrency(datum.totalValue)
                };
            },
        },
    };

    // Agent monthly performance data preparation for line chart
    const prepareAgentMonthlyData = () => {
        const topAgents = performanceTrendsData.agentData.slice(0, 5); // Top 5 agents
        const result: any[] = [];

        topAgents.forEach(agent => {
            agent.monthlySales.forEach(month => {
                result.push({
                    month: month.monthName,
                    agent: agent.agentName,
                    value: activeChartTab === 'count' ? month.salesCount : month.salesValue
                });
            });
        });

        return result;
    };

    // Agent monthly performance chart config
    const agentMonthlyPerformanceConfig = {
        data: prepareAgentMonthlyData(),
        xField: 'month',
        yField: 'value',
        seriesField: 'agent',
        smooth: true,
        point: {
            size: 4,
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
        legend: {
            position: 'top',
        },
        xAxis: {
            title: {
                text: 'Month',
            },
        },
        yAxis: {
            title: {
                text: activeChartTab === 'count' ? 'Sales Count' : 'Sales Value',
            },
            label: activeChartTab === 'value' ? {
                formatter: (v: number) => {
                    return `KES ${(v / 1000).toFixed(0)}K`;
                },
            } : {},
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: datum.agent,
                    value: activeChartTab === 'count'
                        ? datum.value
                        : formatCurrency(datum.value)
                };
            },
        },
    };

    // Agent performance table columns
    const agentColumns = [
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
            sorter: (a: AgentPerformance, b: AgentPerformance) =>
                a.agentName.localeCompare(b.agentName),
        },
        {
            title: 'Total Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            sorter: (a: AgentPerformance, b: AgentPerformance) =>
                a.totalSales - b.totalSales,
            defaultSortOrder: 'descend' as 'descend',
        },
        {
            title: 'Total Value',
            dataIndex: 'totalValue',
            key: 'totalValue',
            sorter: (a: AgentPerformance, b: AgentPerformance) =>
                a.totalValue - b.totalValue,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Average Value',
            key: 'averageValue',
            render: (_, record: AgentPerformance) =>
                formatCurrency(record.totalSales > 0 ? (record.totalValue / record.totalSales) : 0),
        }
    ];

    return (
        <>
            {/* Performance Summary Cards */}
            <PerformanceSummary performanceTrendsData={performanceTrendsData} />

            {/* Monthly Sales Trend Chart */}
            <Card style={{ marginTop: 16 }}>
                <Title level={5}>Monthly Sales Trend</Title>
                <Tabs defaultActiveKey="count" onChange={setActiveChartTab}>
                    <TabPane tab="Sales Count" key="count">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="Loading performance data..." />
                            </div>
                        ) : performanceTrendsData.monthlyData.length > 0 ? (
                            <div style={{ height: 350 }}>
                                <Line {...monthlySalesCountConfig} />
                            </div>
                        ) : (
                            <Empty description="No performance data available" />
                        )}
                    </TabPane>
                    <TabPane tab="Sales Value" key="value">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="Loading performance data..." />
                            </div>
                        ) : performanceTrendsData.monthlyData.length > 0 ? (
                            <div style={{ height: 350 }}>
                                <Line {...monthlySalesValueConfig} />
                            </div>
                        ) : (
                            <Empty description="No performance data available" />
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            {/* Agent Performance Chart */}
            <Card style={{ marginTop: 16 }}>
                <Title level={5}>Agent Performance</Title>
                <Tabs defaultActiveKey="chart" onChange={() => { }}>
                    <TabPane tab="Comparison Chart" key="chart">
                        <Tabs defaultActiveKey="count" onChange={setActiveChartTab}>
                            <TabPane tab="Sales Count" key="count">
                                {isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin tip="Loading agent performance data..." />
                                    </div>
                                ) : performanceTrendsData.agentData.length > 0 ? (
                                    <div style={{ height: 350 }}>
                                        <Bar {...agentPerformanceConfig} />
                                    </div>
                                ) : (
                                    <Empty description="No agent performance data available" />
                                )}
                            </TabPane>
                            <TabPane tab="Sales Value" key="value">
                                {isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin tip="Loading agent performance data..." />
                                    </div>
                                ) : performanceTrendsData.agentData.length > 0 ? (
                                    <div style={{ height: 350 }}>
                                        <Bar {...agentPerformanceConfig} />
                                    </div>
                                ) : (
                                    <Empty description="No agent performance data available" />
                                )}
                            </TabPane>
                        </Tabs>
                    </TabPane>
                    <TabPane tab="Monthly Trends" key="trends">
                        <Tabs defaultActiveKey="count" onChange={setActiveChartTab}>
                            <TabPane tab="Sales Count" key="count">
                                {isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin tip="Loading agent performance data..." />
                                    </div>
                                ) : performanceTrendsData.agentData.length > 0 ? (
                                    <div style={{ height: 350 }}>
                                        <Line {...agentMonthlyPerformanceConfig} />
                                    </div>
                                ) : (
                                    <Empty description="No agent performance data available" />
                                )}
                            </TabPane>
                            <TabPane tab="Sales Value" key="value">
                                {isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin tip="Loading agent performance data..." />
                                    </div>
                                ) : performanceTrendsData.agentData.length > 0 ? (
                                    <div style={{ height: 350 }}>
                                        <Line {...agentMonthlyPerformanceConfig} />
                                    </div>
                                ) : (
                                    <Empty description="No agent performance data available" />
                                )}
                            </TabPane>
                        </Tabs>
                    </TabPane>
                    <TabPane tab="Rankings Table" key="table">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="Loading agent performance data..." />
                            </div>
                        ) : performanceTrendsData.agentData.length > 0 ? (
                            <Table
                                columns={agentColumns}
                                dataSource={performanceTrendsData.agentData}
                                rowKey="agentId"
                                pagination={{ pageSize: 10 }}
                            />
                        ) : (
                            <Empty description="No agent performance data available" />
                        )}
                    </TabPane>
                </Tabs>
            </Card>
        </>
    );
};

export default PerformanceTrendsTab;