import React, { useMemo } from 'react';
import { Row, Col, Card, Button, Typography } from 'antd';
import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { Bar, Pie } from '@ant-design/charts';

const { Text } = Typography;

const SalesTrendChart = ({ salesData }) => {


    const config = {
        data: salesData,
        xField: 'sales',
        yField: 'month',
        seriesField: 'month',
        legend: { position: 'top-left' },
        color: '#1890ff',
    };

    return (
        <Card
            title={<><BarChartOutlined /> Sales Trend</>}
            extra={<Button type="link">View Reports</Button>}
        >
            <Bar {...config} />
        </Card>
    );
};

const PropertyDistributionChart = ({ latestProperties }) => {
    const propertyTypeData = useMemo(() => {
        const counts = latestProperties.reduce((acc, prop) => {
            acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
            return acc;
        }, {});

        const total = latestProperties.length;
        return Object.entries(counts).map(([type, count]) => ({
            type,
            value: (count / total) * 100,
        }));
    }, [latestProperties]);

    const config = {
        data: propertyTypeData,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        label: {
            type: 'outer',
            content: ({ type, value }) => `${type} (${value.toFixed(2)}%)`,
        },
        tooltip: {
            formatter: (datum) => ({
                name: datum.type,
                value: `${datum.value.toFixed(2)}%`,
            }),
        },
    };

    return (
        <Card
            title={<><PieChartOutlined /> Property Distribution</>}
            extra={<Button type="link">View Details</Button>}
        >
            <Pie {...config} />
        </Card>
    );
};

export const ChartsSection = ({ salesData, latestProperties }) => {
    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
                <SalesTrendChart salesData={salesData} />
            </Col>
            <Col xs={24} lg={12}>
                <PropertyDistributionChart latestProperties={latestProperties} />
            </Col>
        </Row>
    );
};

export default ChartsSection;
