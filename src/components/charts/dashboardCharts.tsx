import React, { useMemo } from 'react';
import { Row, Col, Card, Button, Typography } from 'antd';
import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';

const { Text } = Typography;

const SalesTrendChart = ({ salesData }) => {
    // Use provided salesData or fall back to sample data
    const data = salesData;

    // Using Column chart instead of Bar to ensure vertical orientation
    const config = {
        data: data,
        xField: 'month',              // Month on x-axis (bottom)
        yField: 'sales',              // Sales on y-axis (vertical bars going up)
        seriesField: 'month',         // Each month gets its own color
        isGroup: false,               // Not grouped columns
        legend: { position: 'top' },  // Legend at top
        // Different color for each month
        color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2',
            '#eb2f96', '#fa541c', '#fadb14', '#52c41a', '#2f54eb', '#1890ff'],
        // Make columns thicker
        columnWidthRatio: 0.5,        // Slightly narrower columns to fit better
        label: {
            // Format large numbers for better readability
            formatter: (value) => {
                if (value === 0) return '';
                return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(1)}K`;
            },
            position: 'top',          // Labels at top of columns
            style: {
                fontSize: 12,
                fontWeight: 'bold',
            },
        },
        // Enhanced column styling
        columnStyle: {
            radius: [4, 4, 0, 0],     // Rounded corners on top
            fillOpacity: 0.9,
        },
        // Improved tooltip
        tooltip: {
            formatter: (datum) => {
                const value = datum.sales;
                let formattedValue = '0';
                if (value >= 1000000) {
                    formattedValue = `${(value / 1000000).toFixed(2)}M`;
                } else if (value >= 1000) {
                    formattedValue = `${(value / 1000).toFixed(2)}K`;
                }
                return { name: datum.month, value: formattedValue };
            }
        },
        // Add animation
        animation: {
            appear: {
                animation: 'wave-in',
                duration: 1500,
            },
        },
        // Adjust padding to fit better in the card
        padding: [30, 20, 30, 50],
        // Set height to fit within card
        height: 300,
        // Configure axes
        xAxis: {
            title: { text: 'Month' },
            label: {
                autoRotate: true,
                autoHide: false,
                style: {
                    fontWeight: 'bold',
                    fontSize: 10
                }
            }
        },
        yAxis: {
            title: { text: 'Sales' },
            label: {
                formatter: (value) => {
                    if (value >= 1000000) return `${value / 1000000}M`;
                    if (value >= 1000) return `${value / 1000}K`;
                    return value;
                }
            }
        }
    };

    return (
        <Card
            title={<><BarChartOutlined /> Sales Trend</>}
            extra={<Button type="link">View Reports</Button>}
            style={{ height: 420 }}
        >
            <Column {...config} />
        </Card>
    );
};

const PropertyDistributionChart = ({ latestProperties }) => {
    // Use provided properties or fall back to sample data
    const properties = latestProperties;

    const propertyTypeData = useMemo(() => {
        // If properties already have value property, use that directly
        if (properties[0]?.value !== undefined) {
            return properties.map(prop => ({
                type: prop.propertyType,
                value: prop.value
            }));
        }

        // Otherwise calculate from counts
        const counts = properties.reduce((acc, prop) => {
            acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
            return acc;
        }, {});

        const total = properties.length;
        return Object.entries(counts).map(([type, count]) => ({
            type,
            value: (count / total) * 100,
        }));
    }, [properties]);

    // Enhanced pie chart configuration
    const config = {
        data: propertyTypeData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.7, // Smaller radius to fit better
        // Enhanced color palette
        color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
        label: {
            type: 'outer',
            content: ({ type, value }) => `${type} (${value.toFixed(1)}%)`,
            style: {
                fontSize: 10, // Smaller font
                fontWeight: 'bold',
                textAlign: 'center',
            },
            offset: 10, // Shorter label offset
        },
        // Add interactions
        interactions: [
            { type: 'element-active' },
            { type: 'pie-statistic-active' }
        ],
        // Enhanced tooltip
        tooltip: {
            formatter: (datum) => ({
                name: datum.type,
                value: `${datum.value.toFixed(1)}%`,
            }),
        },
        // Central statistic with smaller text
        statistic: {
            title: {
                style: {
                    fontSize: '12px',
                    lineHeight: 1.0,
                },
                formatter: () => 'Distribution',
            },
            content: {
                style: {
                    fontSize: '14px',
                    lineHeight: 1.0,
                },
                formatter: () => 'by Type',
            },
        },
        // Add animation
        animation: {
            appear: {
                animation: 'fade-in',
                duration: 1200,
            },
        },
        // Compact legend configuration
        legend: {
            position: 'bottom',
            layout: 'horizontal',
            itemHeight: 16,
            itemWidth: 80,
            maxRow: 2,
        },
        // Fixed height to fit in card
        height: 300,
        // Adjusted padding
        padding: [10, 10, 30, 10],
    };

    return (
        <Card
            title={<><PieChartOutlined /> Property Distribution</>}
            extra={<Button type="link">View Details</Button>}
            style={{ height: 420 }}
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