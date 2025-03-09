import React from 'react';
import { Row, Col, Card, Button, Progress, Typography } from 'antd';
import {
    BarChartOutlined,
    PieChartOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// Sales Trend Chart Component
const SalesTrendChart = ({ salesData }) => {
    // Find the max sales value to calculate percentages
    const maxSales = Math.max(...salesData.map(item => item.sales));


    return (
        <Card
            title={<><BarChartOutlined /> Sales Trend</>}
            extra={<Button type="link">View Reports</Button>}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: 320,
                padding: '0 20px'
            }}>
                {salesData.map((monthData, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '10%'
                        }}
                    >
                        <Progress
                            type="vertical"
                            percent={(monthData.sales / maxSales) * 100}
                            strokeColor="#1890ff"
                            trailColor="#e6f7ff"
                            style={{ marginBottom: 8 }}
                        />
                        <Text style={{ fontSize: 10 }}>{monthData.month}</Text>
                        <Text style={{ fontSize: 10 }}>
                            {(monthData.sales / 1000).toFixed(0)}K
                        </Text>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Property Distribution Chart Component
const PropertyDistributionChart = ({ propertyTypeData }) => {
    return (
        <Card
            title={<><PieChartOutlined /> Property Distribution</>}
            extra={<Button type="link">View Details</Button>}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: 320,
                padding: '0 20px'
            }}>
                {propertyTypeData.map((typeData, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '40%'
                        }}
                    >
                        <Progress
                            type="circle"
                            percent={typeData.value}
                            format={(percent) => `${typeData.type}`}
                            strokeColor={index === 0 ? '#1890ff' : '#52c41a'}
                        />
                        <Text style={{ marginTop: 8 }}>
                            {typeData.value}% ({typeData.type})
                        </Text>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Charts Section for Dashboard
export const ChartsSection = ({ salesData, propertyTypeData }) => {
    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
                <SalesTrendChart salesData={salesData} />
            </Col>
            <Col xs={24} lg={12}>
                <PropertyDistributionChart propertyTypeData={propertyTypeData} />
            </Col>
        </Row>
    );
};

export default ChartsSection;