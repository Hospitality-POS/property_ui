import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { TeamOutlined, BarChartOutlined, DollarOutlined } from '@ant-design/icons';
import { PerformanceTrends } from '../types';
import { formatCurrency } from '../../utils/formatters';

interface PerformanceSummaryProps {
    performanceTrendsData: PerformanceTrends;
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ performanceTrendsData }) => {
    // Calculate statistics
    const totalActiveAgents = performanceTrendsData.agentData?.length || 0;

    const averageMonthlySales = performanceTrendsData.monthlyData?.length > 0
        ? (performanceTrendsData.monthlyData.reduce((total, month) =>
            total + month.salesCount, 0) / performanceTrendsData.monthlyData.length).toFixed(1)
        : 0;

    const averageMonthlyRevenue = performanceTrendsData.monthlyData?.length > 0
        ? performanceTrendsData.monthlyData.reduce((total, month) =>
            total + month.salesValue, 0) / performanceTrendsData.monthlyData.length
        : 0;

    return (
        <Row gutter={16} className="summary-cards">
            <Col xs={24} sm={12} md={8}>
                <Card>
                    <Statistic
                        title="Total Active Agents"
                        value={totalActiveAgents}
                        prefix={<TeamOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Card>
                    <Statistic
                        title="Average Monthly Sales"
                        value={averageMonthlySales}
                        prefix={<BarChartOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={24} md={8}>
                <Card>
                    <Statistic
                        title="Average Monthly Revenue"
                        value={formatCurrency(averageMonthlyRevenue)}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default PerformanceSummary;