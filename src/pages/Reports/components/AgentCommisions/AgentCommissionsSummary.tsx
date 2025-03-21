import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { BarChartOutlined, DollarOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/formatters';

interface CommissionSummaryTotals {
    totalSales: number;
    totalSaleValue: number;
    totalCommission: number;
    totalPaidCommission: number;
    totalPendingCommission: number;
}

interface AgentCommissionsSummaryProps {
    totals: CommissionSummaryTotals;
}

const AgentCommissionsSummary: React.FC<AgentCommissionsSummaryProps> = ({ totals }) => {
    return (
        <Row gutter={[16, 16]} wrap>
            <Col xs={24} sm={12} md={8}>
                <Card>
                    <Statistic
                        title="Total Sales"
                        value={totals.totalSales}
                        prefix={<BarChartOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Card>
                    <Statistic
                        title="Total Sales Value"
                        value={formatCurrency(totals.totalSaleValue)}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Card>
                    <Statistic
                        title="Commission"
                        value={formatCurrency(totals.totalCommission)}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={12}>
                <Card>
                    <Statistic
                        title="Paid Commission"
                        value={formatCurrency(totals.totalPaidCommission)}
                        valueStyle={{ color: '#3f8600' }}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={12}>
                <Card>
                    <Statistic
                        title="Pending Commission"
                        value={formatCurrency(totals.totalPendingCommission)}
                        valueStyle={{ color: '#faad14' }}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default AgentCommissionsSummary;
