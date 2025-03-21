import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Row, Col, Typography } from 'antd';
import { Pie, Column, Liquid } from '@ant-design/charts';
import { useFilters } from '../../context/FiltersContext';
import { Sale, AgingBalance, AgingSummary } from '../types';
import { generateAgingBalancesReport } from '../../utils/dataProcessors';
import AgingSummaryCards from './AgingSummaryCards';
import AgingBalancesTable from './AgingBalancesTable';
import { formatCurrency } from '../../utils/formatters';

const { Title } = Typography;

interface AgingBalancesTabProps {
    salesData: Sale[];
    isLoading: boolean;
}

const AgingBalancesTab: React.FC<AgingBalancesTabProps> = ({
    salesData,
    isLoading
}) => {
    const [agingBalancesData, setAgingBalancesData] = useState<AgingBalance[]>([]);
    const [exportLoading, setExportLoading] = useState(false);

    const {
        dateRange,
        selectedProperties,
        selectedAgingFilter
    } = useFilters();

    // Process data to generate aging balances report
    useEffect(() => {
        if (!salesData.length) return;

        const processedData = generateAgingBalancesReport(
            salesData,
            dateRange,
            selectedAgingFilter,
            selectedProperties
        );

        setAgingBalancesData(processedData);
    }, [salesData, dateRange, selectedAgingFilter, selectedProperties]);

    // Calculate aging summary
    const calculateAgingSummary = (): AgingSummary => {
        const agingSummary: AgingSummary = {
            total: agingBalancesData.length,
            totalOutstanding: 0,
            aging: {
                '0-30': { count: 0, value: 0 },
                '31-60': { count: 0, value: 0 },
                '61-90': { count: 0, value: 0 },
                '90+': { count: 0, value: 0 }
            }
        };

        agingBalancesData.forEach(balance => {
            agingSummary.totalOutstanding += balance.outstandingBalance;

            if (balance.agingPeriod === '0-30 days') {
                agingSummary.aging['0-30'].count++;
                agingSummary.aging['0-30'].value += balance.outstandingBalance;
            } else if (balance.agingPeriod === '31-60 days') {
                agingSummary.aging['31-60'].count++;
                agingSummary.aging['31-60'].value += balance.outstandingBalance;
            } else if (balance.agingPeriod === '61-90 days') {
                agingSummary.aging['61-90'].count++;
                agingSummary.aging['61-90'].value += balance.outstandingBalance;
            } else {
                agingSummary.aging['90+'].count++;
                agingSummary.aging['90+'].value += balance.outstandingBalance;
            }
        });

        return agingSummary;
    };

    const agingSummary = calculateAgingSummary();

    // Prepare data for aging periods distribution pie chart
    const prepareAgingPeriodsPieData = () => {
        return [
            { type: '0-30 days', value: agingSummary.aging['0-30'].count },
            { type: '31-60 days', value: agingSummary.aging['31-60'].count },
            { type: '61-90 days', value: agingSummary.aging['61-90'].count },
            { type: '90+ days', value: agingSummary.aging['90+'].count }
        ];
    };

    // Prepare data for aging values chart
    const prepareAgingValuesData = () => {
        return [
            { period: '0-30 days', value: agingSummary.aging['0-30'].value },
            { period: '31-60 days', value: agingSummary.aging['31-60'].value },
            { period: '61-90 days', value: agingSummary.aging['61-90'].value },
            { period: '90+ days', value: agingSummary.aging['90+'].value }
        ];
    };

    // Calculate collection rate
    const calculateCollectionRate = () => {
        let totalSaleValue = 0;
        let totalPaid = 0;

        agingBalancesData.forEach(balance => {
            totalSaleValue += balance.salePrice;
            totalPaid += balance.totalPaid;
        });

        return totalSaleValue > 0 ? (totalPaid / totalSaleValue) : 0;
    };

    // Aging periods distribution pie chart config
    const agingPeriodsPieConfig = {
        appendPadding: 10,
        data: prepareAgingPeriodsPieData(),
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name}: {percentage}',
        },
        legend: {
            layout: 'horizontal',
            position: 'bottom'
        },
        interactions: [{ type: 'element-active' }],
        colors: ['#52c41a', '#faad14', '#fa8c16', '#ff4d4f'],
    };

    // Aging values chart config
    const agingValuesChartConfig = {
        data: prepareAgingValuesData(),
        xField: 'period',
        yField: 'value',
        meta: {
            value: {
                alias: 'Outstanding Amount',
            },
        },
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
            formatter: (datum: any) => formatCurrency(datum.value).replace('KES ', ''),
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: datum.period,
                    value: formatCurrency(datum.value)
                };
            },
        },
        color: ({ period }: any) => {
            switch (period) {
                case '0-30 days': return '#52c41a';
                case '31-60 days': return '#faad14';
                case '61-90 days': return '#fa8c16';
                case '90+ days': return '#ff4d4f';
                default: return '#1890ff';
            }
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: true,
            },
        },
        yAxis: {
            title: {
                text: 'Outstanding Amount (KES)',
            },
            label: {
                formatter: (v: number) => {
                    return `${(v / 1000).toFixed(0)}K`;
                },
            },
        },
    };

    // Collection rate liquid chart config
    const collectionRateConfig = {
        percent: calculateCollectionRate(),
        outline: {
            border: 4,
            distance: 8,
        },
        wave: {
            length: 128,
        },
        liquidStyle: {
            fill: 'l(90) 0:#1890ff 0.5:#1890ff 1:#52c41a',
        },
        statistic: {
            content: {
                formatter: ({ percent }: any) => `${(percent * 100).toFixed(1)}%`,
                style: {
                    fontSize: '24px',
                    lineHeight: '44px',
                },
            },
            title: {
                content: 'Collection Rate',
                style: {
                    fontSize: '14px',
                    lineHeight: '22px',
                },
            },
        },
    };

    return (
        <>
            {/* Aging Balances Summary Cards */}
            <AgingSummaryCards agingSummary={agingSummary} />

            {/* Aging Visualizations */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={8}>
                    <Card title="Collection Rate">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="Loading aging data..." />
                            </div>
                        ) : agingBalancesData.length > 0 ? (
                            <div style={{ height: 300 }}>
                                <Liquid {...collectionRateConfig} />
                            </div>
                        ) : (
                            <Empty description="No aging data found" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={16}>
                    <Card title="Aging Periods Distribution">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="Loading aging data..." />
                            </div>
                        ) : agingBalancesData.length > 0 ? (
                            <div style={{ height: 300 }}>
                                <Pie {...agingPeriodsPieConfig} />
                            </div>
                        ) : (
                            <Empty description="No aging data found" />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Aging Values Chart */}
            <Card style={{ marginTop: 16 }}>
                <Title level={5}>Outstanding Balances by Aging Period</Title>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading aging data..." />
                    </div>
                ) : agingBalancesData.length > 0 ? (
                    <div style={{ height: 350 }}>
                        <Column {...agingValuesChartConfig} />
                    </div>
                ) : (
                    <Empty description="No aging data found" />
                )}
            </Card>

            {/* Aging Balances Table */}
            <Card style={{ marginTop: 16 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading aging balances data..." />
                    </div>
                ) : agingBalancesData.length > 0 ? (
                    <AgingBalancesTable
                        agingBalancesData={agingBalancesData}
                        exportLoading={exportLoading}
                        setExportLoading={setExportLoading}
                    />
                ) : (
                    <Empty
                        description="No outstanding balances found for the selected criteria"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>
        </>
    );
};

export default AgingBalancesTab;