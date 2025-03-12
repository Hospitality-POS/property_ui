import { Row, Col, Card, Statistic } from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    CrownOutlined,
    ShoppingOutlined
} from '@ant-design/icons';

export const CustomerStatisticsCards = ({
    totalCustomers,
    individualCustomers,
    companyCustomers,
    totalPurchases
}) => {
    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Customers"
                        value={totalCustomers}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<TeamOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Individual Customers"
                        value={individualCustomers}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<UserOutlined />}
                        suffix={`/ ${totalCustomers}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Corporate Customers"
                        value={companyCustomers}
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<CrownOutlined />}
                        suffix={`/ ${totalCustomers}`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Purchases"
                        value={totalPurchases || 0}
                        valueStyle={{ color: '#fa8c16' }}
                        prefix={<ShoppingOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default CustomerStatisticsCards;