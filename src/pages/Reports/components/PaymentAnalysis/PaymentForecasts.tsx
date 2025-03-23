import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, Statistic, Empty, Spin, Typography,
    Space, Table, Tag, Alert
} from 'antd';
import { Line, Column } from '@ant-design/charts';
import {
    CalendarOutlined, DollarOutlined,
    ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useFilters } from './index';
import { formatCurrency } from '../../utils/formatters';

const { Title, Text } = Typography;

// Types updated to match MongoDB schema
interface PaymentPlan {
    _id?: string;
    id?: string;
    totalAmount: number;    // Matches schema
    initialDeposit: number; // Matches schema
    outstandingBalance?: number; // Matches schema
    installmentAmount: number; // Matches schema
    installmentFrequency?: string; // Matches schema
    startDate: string;      // Matches schema
    endDate?: string;       // Matches schema
    status?: string;        // 'active', 'completed', 'defaulted', 'cancelled'
    paymentMethod?: string; // Matches schema
}

interface Sale {
    _id?: string;
    id?: string;
    saleCode?: string;
    totalAmount?: number;    // Changed from salePrice to match common naming
    salePrice?: number;      // Keep for backward compatibility
    paymentPlans?: PaymentPlan[];
}

interface PaymentForecast {
    month: string;
    monthDisplay: string;
    expectedAmount: number;
    duePayments: number;
}

interface PaymentForecastsTabProps {
    salesData: Sale[];
    isLoading: boolean;
}

// Helper function to ensure a value is a valid number
const ensureNumber = (value: any): number => {
    if (value === undefined || value === null) return 0;

    // If it's already a number, return it
    if (typeof value === 'number') return value;

    // If it's a string, try to convert it
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    // Default fallback
    return 0;
};

// Payment Forecasts Tab Component
const PaymentForecastsTab: React.FC<PaymentForecastsTabProps> = ({
    salesData,
    isLoading
}) => {
    const [forecasts, setForecasts] = useState<PaymentForecast[]>([]);
    const [totalExpected, setTotalExpected] = useState<number>(0);
    const [averageMonthly, setAverageMonthly] = useState<number>(0);
    const [highestMonth, setHighestMonth] = useState<{ month: string, amount: number }>({ month: '', amount: 0 });
    const [lowestMonth, setLowestMonth] = useState<{ month: string, amount: number }>({ month: '', amount: 0 });

    const { dateRange } = useFilters();

    // Process sales data to generate payment forecasts
    useEffect(() => {
        if (!salesData?.length) return;

        const processForecasts = () => {
            console.log("Processing sales data for forecasts:", salesData);

            const [startDate, endDate] = dateRange || [];

            // Default to next 12 months if no date range specified
            const startMoment = startDate ? moment(startDate) : moment().startOf('month');
            const endMoment = endDate ? moment(endDate) : moment().add(12, 'months').endOf('month');

            // Monthly forecasts
            const monthlyForecasts: Record<string, PaymentForecast> = {};

            // Generate monthly keys for the forecast period
            let currentMonth = moment(startMoment).startOf('month');
            while (currentMonth.isSameOrBefore(endMoment)) {
                const monthKey = currentMonth.format('YYYY-MM');
                monthlyForecasts[monthKey] = {
                    month: monthKey,
                    monthDisplay: currentMonth.format('MMM YYYY'),
                    expectedAmount: 0,
                    duePayments: 0
                };
                currentMonth.add(1, 'month');
            }

            // Process each sale's payment plans
            salesData.forEach(sale => {
                if (!sale.paymentPlans || !Array.isArray(sale.paymentPlans)) return;

                sale.paymentPlans.forEach(plan => {
                    if (!plan) return;

                    // Skip payments that are already completed
                    if (plan.status === 'completed' || plan.status === 'paid') return;

                    // Get the end date (or calculate it if not provided)
                    let endDate;
                    if (plan.endDate) {
                        endDate = moment(plan.endDate);
                    } else if (plan.startDate) {
                        // If no endDate but we have startDate, estimate based on frequency
                        const startDate = moment(plan.startDate);
                        switch (plan.installmentFrequency?.toLowerCase()) {
                            case 'weekly':
                                // Assuming 52 weekly payments
                                endDate = moment(startDate).add(52, 'weeks');
                                break;
                            case 'monthly':
                                // Assuming 12 monthly payments
                                endDate = moment(startDate).add(12, 'months');
                                break;
                            case 'quarterly':
                                // Assuming 4 quarterly payments
                                endDate = moment(startDate).add(4, 'quarters');
                                break;
                            default:
                                // Default to 12 months if unknown
                                endDate = moment(startDate).add(12, 'months');
                        }
                    } else {
                        // If no dates at all, use current month
                        endDate = moment();
                    }

                    if (!endDate.isValid()) return;

                    const monthKey = endDate.format('YYYY-MM');

                    // Calculate amount
                    const planAmount = ensureNumber(plan.outstandingBalance || plan.totalAmount);

                    console.log("Processing plan for forecast:", {
                        id: plan._id || plan.id,
                        status: plan.status,
                        endDate: endDate.format('YYYY-MM-DD'),
                        monthKey,
                        amount: planAmount
                    });

                    // Only include if the payment is due within our forecast period
                    if (monthlyForecasts[monthKey]) {
                        monthlyForecasts[monthKey].expectedAmount += planAmount;
                        monthlyForecasts[monthKey].duePayments += 1;
                    }
                });
            });

            console.log("Monthly forecasts:", monthlyForecasts);

            // Convert to array and sort by month
            const forecastArray = Object.values(monthlyForecasts).sort(
                (a, b) => moment(a.month, 'YYYY-MM').diff(moment(b.month, 'YYYY-MM'))
            );

            // Calculate summary statistics
            let total = 0;
            let highest = { month: '', amount: 0 };
            let lowest = { month: '', amount: Number.MAX_VALUE };

            forecastArray.forEach(forecast => {
                total += forecast.expectedAmount;

                if (forecast.expectedAmount > highest.amount) {
                    highest = { month: forecast.monthDisplay, amount: forecast.expectedAmount };
                }

                if (forecast.expectedAmount < lowest.amount && forecast.expectedAmount > 0) {
                    lowest = { month: forecast.monthDisplay, amount: forecast.expectedAmount };
                }
            });

            // If no months have payments, reset lowest
            if (lowest.amount === Number.MAX_VALUE) {
                lowest = { month: '', amount: 0 };
            }

            const average = forecastArray.length > 0 ? total / forecastArray.length : 0;

            setForecasts(forecastArray);
            setTotalExpected(total);
            setAverageMonthly(average);
            setHighestMonth(highest);
            setLowestMonth(lowest);
        };

        processForecasts();
    }, [salesData, dateRange]);

    // Safe formatter function that handles undefined/null values
    const safeNumberFormatter = (value: any): string => {
        // Check if value is undefined, null, or not a number
        if (value === undefined || value === null || isNaN(Number(value))) {
            return '0';
        }

        const numValue = Number(value);
        if (numValue >= 1000000) {
            return `${(numValue / 1000000).toFixed(1)}M`;
        } else if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(0)}K`;
        }
        return numValue.toString();
    };

    // Forecast chart config
    const forecastChartConfig = {
        data: forecasts.filter(f => f.expectedAmount > 0),
        xField: 'monthDisplay',
        yField: 'expectedAmount',
        isGroup: false,
        columnStyle: {
            radius: [20, 20, 0, 0],
        },
        label: {
            position: 'top',
            formatter: (datum: any) => safeNumberFormatter(datum?.expectedAmount),
        },
        yAxis: {
            label: {
                formatter: (v: any) => safeNumberFormatter(v),
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: 'Expected Amount',
                    value: formatCurrency(ensureNumber(datum?.expectedAmount))
                };
            },
        },
    };

    // Detailed forecast table columns
    const forecastColumns = [
        {
            title: 'Month',
            dataIndex: 'monthDisplay',
            key: 'monthDisplay',
            render: (text: string) => (
                <Text strong>{text}</Text>
            )
        },
        {
            title: 'Due Payments',
            dataIndex: 'duePayments',
            key: 'duePayments',
            align: 'center' as const,
        },
        {
            title: 'Expected Amount',
            dataIndex: 'expectedAmount',
            key: 'expectedAmount',
            align: 'right' as const,
            render: (amount: number) => formatCurrency(ensureNumber(amount))
        }
    ];

    return (
        <>
            <Alert
                message="Forecast Information"
                description="This is a forecast of expected payment collections based on current payment plans."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            {/* Summary Cards */}
            <Row gutter={16} className="summary-cards">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Expected Collections"
                            value={formatCurrency(totalExpected)}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Monthly Collection"
                            value={formatCurrency(averageMonthly)}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Highest Month"
                            value={highestMonth.month}
                            suffix={formatCurrency(highestMonth.amount)}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Lowest Month"
                            value={lowestMonth.month}
                            suffix={formatCurrency(lowestMonth.amount)}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Monthly Forecast Chart */}
            <Card style={{ marginTop: 16 }} title="Monthly Expected Collections">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading forecast data..." />
                    </div>
                ) : forecasts.some(f => f.expectedAmount > 0) ? (
                    <div style={{ height: 350 }}>
                        <Column {...forecastChartConfig} />
                    </div>
                ) : (
                    <Empty description="No forecast data available" />
                )}
            </Card>

            {/* Forecast Detail Table */}
            <Card style={{ marginTop: 16 }} title="Monthly Forecast Details">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading forecast data..." />
                    </div>
                ) : forecasts.length > 0 ? (
                    <Table
                        columns={forecastColumns}
                        dataSource={forecasts}
                        rowKey="month"
                        pagination={false}
                        summary={pageData => {
                            // Calculate totals for the table footer
                            let totalDuePayments = 0;
                            let totalExpectedAmount = 0;

                            pageData.forEach(({ duePayments, expectedAmount }) => {
                                totalDuePayments += ensureNumber(duePayments);
                                totalExpectedAmount += ensureNumber(expectedAmount);
                            });

                            return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0}>
                                            <Text strong>Total</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="center">
                                            <Text strong>{totalDuePayments}</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right">
                                            <Text strong>{formatCurrency(totalExpectedAmount)}</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            );
                        }}
                    />
                ) : (
                    <Empty description="No forecast data available" />
                )}
            </Card>
        </>
    );
};

export default PaymentForecastsTab;