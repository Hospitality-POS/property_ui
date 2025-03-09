import { Row, Col, Card, Statistic } from 'antd';
import {
    DollarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined
} from '@ant-design/icons';

export const SalesStatisticsCards = ({
    totalSalesAmount,
    completedSalesCount,
    pendingSalesCount,
    totalCommission,
    totalSalesCount
}) => {
    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Sales Revenue"
                        value={totalSalesAmount}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<DollarOutlined />}
                        formatter={value => `KES ${value.toLocaleString()}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Completed Sales"
                        value={completedSalesCount}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                        suffix={`/ ${totalSalesCount}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Pending Sales"
                        value={pendingSalesCount}
                        valueStyle={{ color: '#faad14' }}
                        prefix={<ClockCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Commission"
                        value={totalCommission}
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<TeamOutlined />}
                        formatter={value => `KES ${value.toLocaleString()}`}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default SalesStatisticsCards;