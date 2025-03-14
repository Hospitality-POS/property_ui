import { Row, Col, Card, Statistic } from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    CrownOutlined,
    ShoppingOutlined
} from '@ant-design/icons';

// Utility function to safely format values
const safeFormatValue = (value) => {
    // Handle case when value is null or undefined
    if (value === null || value === undefined) {
        return 0;
    }

    // Handle case when value is a number
    if (typeof value === 'number') {
        return value;
    }

    // Handle case when value is an array
    if (Array.isArray(value)) {
        return value.length;
    }

    // Handle case when value is an object or another type
    if (typeof value === 'object') {
        // This catches the [object Object] issue
        return 0;
    }

    // Try to parse as number if it's a string
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
};

export const CustomerStatisticsCards = ({
    totalCustomers,
    individualCustomers,
    companyCustomers,
    totalPurchases
}) => {
    // Format the values safely
    const formattedTotalCustomers = safeFormatValue(totalCustomers);
    const formattedIndividualCustomers = safeFormatValue(individualCustomers);
    const formattedCompanyCustomers = safeFormatValue(companyCustomers);
    const formattedTotalPurchases = safeFormatValue(totalPurchases);

    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Customers"
                        value={formattedTotalCustomers}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<TeamOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Individual Customers"
                        value={formattedIndividualCustomers}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<UserOutlined />}
                        suffix={formattedTotalCustomers > 0 ? `/ ${formattedTotalCustomers}` : ''}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Corporate Customers"
                        value={formattedCompanyCustomers}
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<CrownOutlined />}
                        suffix={formattedTotalCustomers > 0 ? `/ ${formattedTotalCustomers}` : ''}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Purchases"
                        value={formattedTotalPurchases}
                        valueStyle={{ color: '#fa8c16' }}
                        prefix={<ShoppingOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default CustomerStatisticsCards;