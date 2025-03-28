import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, Statistic, Empty, Spin, Typography,
    Space, Tabs, Table, Tag, Progress
} from 'antd';
import { Pie, Column } from '@ant-design/charts';
import { InfoCircleOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useFilters } from './index';
import { formatCurrency } from '../../utils/formatters';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Types updated to match MongoDB schema
interface Payment {
    _id?: string;
    id?: string;
    amount: number;
    paymentDate: string;  // Matches schema
    paymentMethod?: string; // Matches schema
    transactionReference?: string; // Matches schema
    status?: string;
    receiptNumber?: string;
    penaltyAmount?: number;
    includesPenalty?: boolean;
    notes?: string;
}

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
    status?: string;        // Matches schema
    paymentMethod?: string; // Matches schema
    payments?: Payment[];   // Virtual field
}

interface Sale {
    _id?: string;
    id?: string;
    saleCode?: string;
    totalAmount?: number;    // Changed from salePrice to match common naming
    paymentPlans?: PaymentPlan[];
    payments?: Payment[];
}

interface PaymentStatusBreakdown {
    status: string;
    count: number;
    amount: number;
}

interface FrequencyBreakdown {
    frequency: string;
    count: number;
    amount: number;
}

interface MonthlyCollection {
    month: string;
    monthDisplay?: string;
    count: number;
    amount: number;
}

interface PaymentStatistics {
    collectionRate: number;
    totalPayments: number;
    totalAmountCollected: number;
    totalSalesValue: number;
    statusBreakdown: PaymentStatusBreakdown[];
    frequencyBreakdown: FrequencyBreakdown[];
    monthlyCollections: MonthlyCollection[];
}

interface PaymentStatisticsTabProps {
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

// Helper function to get appropriate tag color based on status
const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'blue';
        case 'completed':
            return 'green';
        case 'defaulted':
            return 'red';
        case 'cancelled':
            return 'orange';
        default:
            return 'default';
    }
};

// Helper function to get appropriate tag color based on frequency
const getFrequencyColor = (frequency: string): string => {
    switch (frequency.toLowerCase()) {
        case 'weekly':
            return 'purple';
        case 'monthly':
            return 'cyan';
        case 'quarterly':
            return 'geekblue';
        case 'custom':
            return 'magenta';
        default:
            return 'default';
    }
};

// Payment Statistics Tab Component
const PaymentStatisticsTab: React.FC<PaymentStatisticsTabProps> = ({
    salesData,
    isLoading
}) => {
    const [statistics, setStatistics] = useState<PaymentStatistics>({
        collectionRate: 0,
        totalPayments: 0,
        totalAmountCollected: 0,
        totalSalesValue: 0,
        statusBreakdown: [],
        frequencyBreakdown: [],
        monthlyCollections: []
    });

    const { dateRange } = useFilters();

    // Process sales data to generate payment statistics
    useEffect(() => {
        if (!salesData?.length) return;

        const processStatistics = () => {
            console.log("Processing sales data:", salesData);

            const [startDate, endDate] = dateRange || [];
            const startMoment = startDate ? moment(startDate) : moment().subtract(1, 'year');
            const endMoment = endDate ? moment(endDate) : moment();

            // Collection tracking
            let totalSalesValue = 0;
            let totalPayments = 0;
            let totalAmountCollected = 0;

            // Status and frequency breakdowns
            const statusCounts: Record<string, { count: number, amount: number }> = {};
            const frequencyCounts: Record<string, { count: number, amount: number }> = {};

            // Monthly collections
            const monthlyData: Record<string, { count: number, amount: number }> = {};

            // Generate monthly keys for the selected date range
            let currentMonth = moment(startMoment).startOf('month');
            while (currentMonth.isSameOrBefore(endMoment)) {
                const monthKey = currentMonth.format('YYYY-MM');
                monthlyData[monthKey] = { count: 0, amount: 0 };
                currentMonth.add(1, 'month');
            }

            // Process each sale
            salesData.forEach(sale => {
                // Get the sale price (might be salePrice or totalAmount depending on your schema)
                const salePrice = ensureNumber(sale.totalAmount || sale.salePrice);
                console.log(`Sale ${sale._id || sale.id}: Price ${salePrice}`);

                // Safely add to totalSalesValue
                totalSalesValue += salePrice;

                // Process individual payments
                if (sale.payments && Array.isArray(sale.payments)) {
                    sale.payments.forEach(payment => {
                        if (!payment) return;

                        // Use paymentDate from schema instead of date
                        const paymentDate = moment(payment.paymentDate || payment.date);

                        // Skip if payment date is invalid or outside date range
                        if (!paymentDate.isValid() ||
                            !paymentDate.isBetween(startMoment, endMoment, 'day', '[]')) {
                            return;
                        }

                        // Only count completed payments if status is available
                        // If status is not provided, count it anyway (backward compatibility)
                        if (!payment.status || payment.status === 'completed') {
                            totalPayments++;
                            totalAmountCollected += ensureNumber(payment.amount);
                        }

                        // Track by month - safely format the date
                        const monthKey = paymentDate.format('YYYY-MM');
                        if (monthlyData[monthKey]) {
                            monthlyData[monthKey].count++;
                            monthlyData[monthKey].amount += ensureNumber(payment.amount);
                        }
                    });
                }

                // Process payment plans
                if (sale.paymentPlans && Array.isArray(sale.paymentPlans)) {
                    sale.paymentPlans.forEach(plan => {
                        if (!plan) return;

                        console.log("Processing plan:", {
                            id: plan._id || plan.id,
                            totalAmount: plan.totalAmount,
                            status: plan.status,
                            frequency: plan.installmentFrequency
                        });

                        // Use totalAmount from schema instead of amount
                        const planAmount = ensureNumber(plan.totalAmount);

                        // Track payment plan status statistics
                        const status = (plan.status?.toLowerCase() || 'unknown');
                        if (!statusCounts[status]) {
                            statusCounts[status] = { count: 0, amount: 0 };
                        }
                        statusCounts[status].count++;
                        statusCounts[status].amount += planAmount;

                        // Track installment frequency
                        const frequency = (plan.installmentFrequency?.toLowerCase() || 'unknown');
                        if (!frequencyCounts[frequency]) {
                            frequencyCounts[frequency] = { count: 0, amount: 0 };
                        }
                        frequencyCounts[frequency].count++;
                        frequencyCounts[frequency].amount += planAmount;
                    });
                }
            });

            console.log("Status counts:", statusCounts);
            console.log("Frequency counts:", frequencyCounts);

            // Calculate collection rate - handle division by zero
            const collectionRate = totalSalesValue > 0 ? (totalAmountCollected / totalSalesValue) : 0;

            // Convert status counts to array and ensure amount is a valid number
            const statusBreakdown = Object.entries(statusCounts).map(([status, data]) => ({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                count: data.count,
                amount: data.amount
            })).sort((a, b) => b.amount - a.amount);

            // Convert frequency counts to array and ensure amount is a valid number
            const frequencyBreakdown = Object.entries(frequencyCounts).map(([frequency, data]) => ({
                frequency: frequency.charAt(0).toUpperCase() + frequency.slice(1),
                count: data.count,
                amount: data.amount
            })).sort((a, b) => b.amount - a.amount);

            // Convert monthly data to array with safe date handling
            const monthlyCollections = Object.entries(monthlyData).map(([month, data]) => {
                const momentObj = moment(month, 'YYYY-MM');
                return {
                    month,
                    monthDisplay: momentObj.isValid() ? momentObj.format('MMM YYYY') : month,
                    count: data.count,
                    amount: data.amount
                };
            }).sort((a, b) => {
                const aMoment = moment(a.month, 'YYYY-MM');
                const bMoment = moment(b.month, 'YYYY-MM');
                return aMoment.isValid() && bMoment.isValid()
                    ? aMoment.diff(bMoment)
                    : 0;
            });

            setStatistics({
                collectionRate,
                totalPayments,
                totalAmountCollected,
                totalSalesValue,
                statusBreakdown,
                frequencyBreakdown,
                monthlyCollections
            });
        };

        processStatistics();
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

    // Status breakdown pie chart config
    const statusPieConfig = {
        appendPadding: 10,
        data: statistics.statusBreakdown
            .filter(item => item.amount > 0) // Only include non-zero values
            .map(item => ({
                type: item.status,
                value: item.amount
            })),
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name}: {percentage}',
        },
        interactions: [{ type: 'element-active' }],
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: datum.type,
                    value: formatCurrency(ensureNumber(datum.value))
                };
            },
        },
    };

    // Frequency breakdown pie chart config
    const frequencyPieConfig = {
        appendPadding: 10,
        data: statistics.frequencyBreakdown
            .filter(item => item.amount > 0) // Only include non-zero values
            .map(item => ({
                type: item.frequency,
                value: item.amount
            })),
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name}: {percentage}',
        },
        interactions: [{ type: 'element-active' }],
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: datum.type,
                    value: formatCurrency(ensureNumber(datum.value))
                };
            },
        },
    };

    // Monthly collections chart config
    const monthlyColumnConfig = {
        data: statistics.monthlyCollections.map(item => ({
            month: item.monthDisplay || item.month,
            amount: item.amount
        })),
        xField: 'month',
        yField: 'amount',
        label: {
            formatter: (datum: any) => safeNumberFormatter(datum?.amount),
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        meta: {
            amount: {
                alias: 'Amount Collected',
            },
        },
        color: '#1890ff',
        yAxis: {
            label: {
                formatter: (v: any) => safeNumberFormatter(v),
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: 'Amount Collected',
                    value: formatCurrency(ensureNumber(datum?.amount))
                };
            },
        },
    };

    // Payment status breakdown table columns
    const statusColumns = [
        {
            title: 'Payment Plan Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => (
                <Tag color={getStatusColor(text)}>{text}</Tag>
            )
        },
        {
            title: 'Number of Plans',
            dataIndex: 'count',
            key: 'count',
            align: 'center' as const,
        },
        {
            title: 'Total Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => formatCurrency(ensureNumber(amount))
        },
        {
            title: 'Percentage',
            key: 'percentage',
            align: 'right' as const,
            render: (_, record: PaymentStatusBreakdown) => {
                const totalAmount = statistics.statusBreakdown.reduce(
                    (sum, item) => sum + ensureNumber(item.amount), 0
                );
                return (
                    <Text>
                        {totalAmount > 0
                            ? ((ensureNumber(record.amount) / totalAmount) * 100).toFixed(1)
                            : '0.0'}%
                    </Text>
                );
            }
        }
    ];

    // Payment frequency breakdown table columns
    const frequencyColumns = [
        {
            title: 'Installment Frequency',
            dataIndex: 'frequency',
            key: 'frequency',
            render: (text: string) => (
                <Tag color={getFrequencyColor(text)}>{text}</Tag>
            )
        },
        {
            title: 'Number of Plans',
            dataIndex: 'count',
            key: 'count',
            align: 'center' as const,
        },
        {
            title: 'Total Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => formatCurrency(ensureNumber(amount))
        },
        {
            title: 'Percentage',
            key: 'percentage',
            align: 'right' as const,
            render: (_, record: FrequencyBreakdown) => {
                const totalAmount = statistics.frequencyBreakdown.reduce(
                    (sum, item) => sum + ensureNumber(item.amount), 0
                );
                return (
                    <Text>
                        {totalAmount > 0
                            ? ((ensureNumber(record.amount) / totalAmount) * 100).toFixed(1)
                            : '0.0'}%
                    </Text>
                );
            }
        }
    ];

    return (
        <>
            {/* Summary Cards */}
            <Row gutter={16} className="summary-cards">
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Collection Rate"
                            value={`${(statistics.collectionRate * 100).toFixed(1)}%`}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: statistics.collectionRate >= 0.75 ? '#52c41a' : '#faad14' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Progress
                                percent={Number((statistics.collectionRate * 100).toFixed(1))}
                                size="small"
                                status={statistics.collectionRate >= 0.75 ? 'success' : 'active'}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Total Payments"
                            value={statistics.totalPayments}
                            suffix={`of ${formatCurrency(statistics.totalAmountCollected)}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Total Sales Value"
                            value={formatCurrency(statistics.totalSalesValue)}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                    <Card title="Payment Plan Status Distribution">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="Loading payment statistics..." />
                            </div>
                        ) : statistics.statusBreakdown.some(item => item.amount > 0) ? (
                            <div style={{ height: 350 }}>
                                <Pie {...statusPieConfig} />
                            </div>
                        ) : (
                            <Empty description="No payment status data available" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Installment Frequency Distribution">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="Loading payment statistics..." />
                            </div>
                        ) : statistics.frequencyBreakdown.some(item => item.amount > 0) ? (
                            <div style={{ height: 350 }}>
                                <Pie {...frequencyPieConfig} />
                            </div>
                        ) : (
                            <Empty description="No frequency data available" />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Monthly Collections Chart */}
            <Card style={{ marginTop: 16 }} title="Monthly Collections">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading payment statistics..." />
                    </div>
                ) : statistics.monthlyCollections.some(item => item.amount > 0) ? (
                    <div style={{ height: 350 }}>
                        <Column {...monthlyColumnConfig} />
                    </div>
                ) : (
                    <Empty description="No monthly collection data available" />
                )}
            </Card>

            {/* Payment Status Table */}
            <Card style={{ marginTop: 16 }} title="Payment Plans by Status">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading payment statistics..." />
                    </div>
                ) : statistics.statusBreakdown.length > 0 ? (
                    <Table
                        columns={statusColumns}
                        dataSource={statistics.statusBreakdown}
                        rowKey="status"
                        pagination={false}
                    />
                ) : (
                    <Empty description="No payment status data available" />
                )}
            </Card>

            {/* Payment Frequency Table */}
            <Card style={{ marginTop: 16 }} title="Payment Plans by Installment Frequency">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading payment statistics..." />
                    </div>
                ) : statistics.frequencyBreakdown.length > 0 ? (
                    <Table
                        columns={frequencyColumns}
                        dataSource={statistics.frequencyBreakdown}
                        rowKey="frequency"
                        pagination={false}
                    />
                ) : (
                    <Empty description="No frequency data available" />
                )}
            </Card>
        </>
    );
};

export default PaymentStatisticsTab;