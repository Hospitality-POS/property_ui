import { Row, Col, Card, Statistic } from 'antd';
import {
    BankOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined
} from '@ant-design/icons';

export const PropertyStatistics = ({
    totalValue,
    availableCount,
    reservedCount,
    soldCount,
    totalCount
}) => {
    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Portfolio Value"
                        value={totalValue}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<BankOutlined />}
                        formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Available Properties"
                        value={availableCount}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                        suffix={`/ ${totalCount}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Reserved Properties"
                        value={reservedCount}
                        valueStyle={{ color: '#faad14' }}
                        prefix={<ClockCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Sold Properties"
                        value={soldCount}
                        valueStyle={{ color: '#f5222d' }}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default PropertyStatistics;