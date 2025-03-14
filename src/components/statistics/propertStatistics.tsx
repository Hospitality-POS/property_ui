import { Row, Col, Card, Statistic } from 'antd';
import {
    BankOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    HomeOutlined,
    AppstoreOutlined
} from '@ant-design/icons';

export const PropertyStatistics = ({
    totalValue,
    totalCount,
    reservedCount,
    soldCount,
    availableCount,
    totalUnits,
    availableUnits,
}) => {
    return (
        <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Total Portfolio Value"
                        value={totalValue}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<DollarOutlined />}
                        formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Total Properties"
                        value={totalCount}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<BankOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
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
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Sold Properties"
                        value={soldCount}
                        valueStyle={{ color: '#f5222d' }}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Total Units"
                        value={totalUnits || 0}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<AppstoreOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Available Units"
                        value={availableUnits || 0}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                        suffix={`/ ${totalUnits || 0}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Reserved Units"
                        value={reservedCount || 0}
                        valueStyle={{ color: '#f5222d' }}
                        prefix={<DollarOutlined />}
                        suffix={`/ ${totalUnits || 0}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Sold Units"
                        value={soldCount || 0}
                        valueStyle={{ color: '#f5222d' }}
                        prefix={<DollarOutlined />}
                        suffix={`/ ${totalUnits || 0}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ marginBottom: 16 }}>
                <Card>
                    <Statistic
                        title="Occupancy Rate"
                        value={totalUnits ? Math.round((soldCount / totalUnits) * 100) : 0}
                        valueStyle={{ color: '#faad14' }}
                        prefix={<HomeOutlined />}
                        suffix="%"
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default PropertyStatistics;
