import React, { useState, useEffect, useCallback } from 'react';
import {
    Row, Col, Card, Table, Tag, Progress, Space, Input,
    Statistic, Empty, Spin, Typography, Popover
} from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import { useFilters } from './index';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

// Types
interface Property {
    _id?: string;
    id?: string;
    name: string;
}

interface Customer {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
    phone?: string;
}

interface User {
    _id?: string;
    id?: string;
    name: string;
}

interface Payment {
    _id?: string;
    id?: string;
    amount: number;
    date: string;
    method?: string;
    reference?: string;
}

interface PaymentPlan {
    _id?: string;
    id?: string;
    name?: string;
    type: string;
    amount: number;
    totalAmount?: number;
    installmentAmount?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    paidAmount?: number;
    outstandingBalance?: number;
    payments: Payment[];
}

interface Sale {
    _id?: string;
    id?: string;
    saleCode?: string;
    saleDate?: string;
    createdAt?: string;
    salePrice: number;
    status?: string;
    property?: Property;
    customer?: Customer;
    salesAgent?: User;
    paymentPlans?: PaymentPlan[];
    payments?: Payment[];
}

interface DuePaymentItem {
    id: string;
    saleId: string;
    saleCode: string;
    propertyName: string;
    propertyId?: string;
    customerName: string;
    customerId?: string;
    customerContact: string;
    agentName: string;
    agentId?: string;
    startDate?: string;
    endDate?: string;
    totalAmount: number;
    paidAmount: number;
    outstandingBalance: number;
    status: string;
    daysUntilDue: number;
    daysOverdue: number;
    progress: number;
    sale: Sale;
    paymentPlan: PaymentPlan;
}

interface DuePaymentsSummary {
    totalDuePayments: number;
    totalDueAmount: number;
    totalOverduePayments: number;
    totalOverdueAmount: number;
    upcomingDuePayments: number;
    upcomingDueAmount: number;
    averageDaysOverdue: number;
}

interface DuePaymentsTabProps {
    salesData: Sale[];
    propertiesData: Property[];
    isLoading: boolean;
    // Accept filter props directly
    paymentStatus?: string;
    paymentType?: string;
    selectedProperties?: string[];
    dateRange?: [Moment | null, Moment | null];
}

// Due Payments Tab Component
const DuePaymentsTab: React.FC<DuePaymentsTabProps> = ({
    salesData,
    propertiesData,
    isLoading,
    // Use the filter props directly
    paymentStatus: propsPaymentStatus,
    paymentType: propsPaymentType,
    selectedProperties: propsSelectedProperties,
    dateRange: propsDateRange
}) => {
    const [duePaymentItems, setDuePaymentItems] = useState<DuePaymentItem[]>([]);
    const [allItems, setAllItems] = useState<DuePaymentItem[]>([]);
    const [summaryData, setSummaryData] = useState<DuePaymentsSummary>({
        totalDuePayments: 0,
        totalDueAmount: 0,
        totalOverduePayments: 0,
        totalOverdueAmount: 0,
        upcomingDuePayments: 0,
        upcomingDueAmount: 0,
        averageDaysOverdue: 0
    });
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<DuePaymentItem[]>([]);

    // Get filters from context as fallback
    const {
        dateRange: contextDateRange,
        selectedProperties: contextSelectedProperties,
        paymentStatus: contextPaymentStatus,
        paymentType: contextPaymentType,
        paymentThreshold = 0,
        refreshKey = 0
    } = useFilters();

    // Use props if provided, otherwise use context values
    const effectiveDateRange = propsDateRange || contextDateRange;
    const effectiveSelectedProperties = propsSelectedProperties || contextSelectedProperties || [];
    const effectivePaymentStatus = propsPaymentStatus || contextPaymentStatus || 'all';
    const effectivePaymentType = propsPaymentType || contextPaymentType || 'all';

    // Debug log
    useEffect(() => {
        console.log("DuePayments component using filters:", {
            paymentStatus: effectivePaymentStatus,
            paymentType: effectivePaymentType,
            selectedProperties: effectiveSelectedProperties,
            dateRange: effectiveDateRange
        });
    }, [effectivePaymentStatus, effectivePaymentType, effectiveSelectedProperties, effectiveDateRange]);

    // Process the data (extract to reusable function)
    const processData = useCallback(() => {
        if (!salesData.length) return [];

        console.log("Processing data with filters:", {
            paymentStatus: effectivePaymentStatus,
            paymentType: effectivePaymentType,
            selectedProperties: effectiveSelectedProperties,
            dateRange: effectiveDateRange
        });

        const items: DuePaymentItem[] = [];
        const [startFilterDate, endFilterDate] = effectiveDateRange || [null, null];

        salesData.forEach(sale => {
            // Skip if sale doesn't have payment plans
            if (!sale.paymentPlans || !Array.isArray(sale.paymentPlans) || sale.paymentPlans.length === 0) {
                return;
            }

            // Process each payment plan
            sale.paymentPlans.forEach(plan => {
                // Get startDate and endDate from payment plan (if available)
                const startDate = plan.startDate ? moment(plan.startDate) : null;
                const endDate = plan.endDate ? moment(plan.endDate) : null;

                // Skip if both dates are not available
                if (!startDate && !endDate) {
                    return;
                }

                // Apply date range filter
                // If a plan's endDate is before startFilterDate or after endFilterDate, skip it
                if (startFilterDate && endDate && endDate.isBefore(startFilterDate)) {
                    return;
                }

                if (endFilterDate && endDate && endDate.isAfter(endFilterDate)) {
                    return;
                }

                // Calculate payment details
                const totalAmount = plan.totalAmount || plan.amount || 0;
                const installmentAmount = plan.installmentAmount || plan.amount || 0;
                const paidAmount = plan.paidAmount || plan.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

                // Check if payment is fully paid
                const isPaid = paidAmount >= totalAmount;

                // If paid, set outstandingBalance to 0 to avoid showing negative values
                const outstandingBalance = isPaid ? 0 :
                    (plan.outstandingBalance !== undefined ? plan.outstandingBalance : (totalAmount - paidAmount));

                // Calculate days until due between startDate and endDate
                const today = moment();
                let daysUntilDue = 0;
                let daysOverdue = 0;

                if (endDate) {
                    if (today.isAfter(endDate)) {
                        // Already past the end date
                        daysOverdue = today.diff(endDate, 'days');
                        daysUntilDue = 0;
                    } else {
                        // End date is in the future
                        daysUntilDue = endDate.diff(today, 'days');
                        daysOverdue = 0;
                    }
                }

                // Determine status based on payment plan status or calculate it
                let status = '';
                if (isPaid) {
                    // If fully paid, always show as paid regardless of other factors
                    status = 'paid';
                } else if (plan.status) {
                    // Map from payment plan status to the display status
                    if (plan.status === 'completed') {
                        status = 'paid';
                    } else if (plan.status === 'defaulted') {
                        status = 'overdue';
                    } else if (plan.status === 'active') {
                        // For active plans, check days
                        if (daysOverdue > 0) {
                            status = 'overdue';
                        } else {
                            status = 'due';
                        }
                    } else {
                        status = plan.status;
                    }
                } else {
                    // Determine status if not explicitly set
                    if (daysOverdue > 0) {
                        status = 'overdue';
                    } else {
                        status = 'due';
                    }
                }

                // Create the due payment item
                const item: DuePaymentItem = {
                    id: plan._id || plan.id || `${sale._id || sale.id}-${endDate?.valueOf() || startDate?.valueOf()}`,
                    saleId: sale._id || sale.id || '',
                    saleCode: sale.saleCode || 'N/A',
                    propertyName: sale.property?.name || 'Unknown Property',
                    propertyId: sale.property?._id || sale.property?.id,
                    customerName: sale.customer?.name || 'Unknown Customer',
                    customerId: sale.customer?._id || sale.customer?.id,
                    customerContact: sale.customer?.phone || sale.customer?.email || 'N/A',
                    agentName: sale.salesAgent?.name || 'Unknown Agent',
                    agentId: sale.salesAgent?._id || sale.salesAgent?.id,
                    startDate: plan.startDate,
                    endDate: plan.endDate,
                    totalAmount: totalAmount,
                    paidAmount: paidAmount,
                    outstandingBalance: outstandingBalance,
                    status: status,
                    daysUntilDue: daysUntilDue,
                    daysOverdue: daysOverdue,
                    progress: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
                    sale: sale,
                    paymentPlan: plan
                };

                items.push(item);
            });
        });

        // Sort items by end date (ascending)
        const sortedItems = [...items].sort((a, b) => {
            const dateA = a.endDate ? moment(a.endDate) : a.startDate ? moment(a.startDate) : moment();
            const dateB = b.endDate ? moment(b.endDate) : b.startDate ? moment(b.startDate) : moment();
            return dateA.diff(dateB);
        });

        return sortedItems;
    }, [salesData, effectiveDateRange, effectivePaymentStatus, effectivePaymentType, effectiveSelectedProperties]);

    // Process all data to get initial items
    useEffect(() => {
        if (!salesData.length) return;

        const allProcessedItems = processData();
        setAllItems(allProcessedItems);

        // Apply filters immediately
        let filtered = [...allProcessedItems];

        // Apply property filter
        if (effectiveSelectedProperties.length > 0) {
            filtered = filtered.filter(item => effectiveSelectedProperties.includes(item.propertyId || ''));
        }

        // Apply status filter
        if (effectivePaymentStatus !== 'all') {
            filtered = filtered.filter(item => item.status.toLowerCase() === effectivePaymentStatus.toLowerCase());
        }

        // Apply type filter
        if (effectivePaymentType !== 'all') {
            filtered = filtered.filter(item =>
                item.paymentPlan.type?.toLowerCase() === effectivePaymentType.toLowerCase()
            );
        }

        // Calculate summary and update state
        const summary = calculateSummary(filtered);
        setDuePaymentItems(filtered);
        setSummaryData(summary);
        setFilteredData(filtered);

    }, [salesData, processData, effectivePaymentStatus, effectivePaymentType, effectiveSelectedProperties, refreshKey]);

    // Calculate summary statistics
    const calculateSummary = (items: DuePaymentItem[]): DuePaymentsSummary => {
        const summary: DuePaymentsSummary = {
            totalDuePayments: 0,
            totalDueAmount: 0,
            totalOverduePayments: 0,
            totalOverdueAmount: 0,
            upcomingDuePayments: 0,
            upcomingDueAmount: 0,
            averageDaysOverdue: 0
        };

        let totalOverdueDays = 0;
        let overdueCount = 0;

        items.forEach(item => {
            if (item.status === 'overdue') {
                summary.totalOverduePayments++;
                summary.totalOverdueAmount += item.outstandingBalance;
                totalOverdueDays += item.daysOverdue;
                overdueCount++;
            } else if (item.status === 'due') {
                summary.upcomingDuePayments++;
                summary.upcomingDueAmount += item.outstandingBalance;
            }

            summary.totalDuePayments++;
            summary.totalDueAmount += item.outstandingBalance;
        });

        summary.averageDaysOverdue = overdueCount > 0 ? Math.round(totalOverdueDays / overdueCount) : 0;

        return summary;
    };

    // Handle search
    const handleSearch = (value: string) => {
        setSearchText(value);

        if (!value) {
            setFilteredData(duePaymentItems);
            return;
        }

        const filtered = duePaymentItems.filter(item =>
            item.customerName.toLowerCase().includes(value.toLowerCase()) ||
            item.saleCode.toLowerCase().includes(value.toLowerCase()) ||
            item.propertyName.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredData(filtered);
    };

    // Columns for the table
    const columns = [
        {
            title: 'Customer',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text: string, record: DuePaymentItem) => (
                <div>
                    <Text strong>{text}</Text>
                    <div>
                        <Text type="secondary">{record.customerContact}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Sale Code',
            dataIndex: 'saleCode',
            key: 'saleCode',
        },
        {
            title: 'Property',
            dataIndex: 'propertyName',
            key: 'propertyName',
            width: 150,
        },
        {
            title: 'Due Date',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 120,
            render: (text: string, record: DuePaymentItem) => {
                // Display end date or fall back to whatever's available
                const displayDate = record.endDate || record.startDate;
                if (!displayDate) return <Text type="secondary">N/A</Text>;

                // If payment is already paid, don't show "Due today" or other due status
                if (record.status === 'paid') {
                    return (
                        <div>
                            <div>{formatDate(displayDate)}</div>
                            <Text type="success">Completed</Text>
                        </div>
                    );
                }

                // Regular display for unpaid items
                return (
                    <div>
                        <div>{formatDate(displayDate)}</div>
                        {record.daysUntilDue > 0 ? (
                            <Text type="secondary">In {record.daysUntilDue} days</Text>
                        ) : record.daysOverdue > 0 ? (
                            <Text type="danger">Overdue by {record.daysOverdue} days</Text>
                        ) : (
                            <Text type="warning">Due today</Text>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Paid',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            align: 'right' as const,
            render: (text: number) => formatCurrency(text)
        },
        {
            title: 'Outstanding',
            dataIndex: 'outstandingBalance',
            key: 'outstandingBalance',
            align: 'right' as const,
            render: (text: number) => <Text strong type="danger">{formatCurrency(text)}</Text>
        },
        {
            title: 'Progress',
            key: 'progress',
            align: 'center' as const,
            render: (_, record: DuePaymentItem) => (
                <Progress
                    percent={Math.round(record.progress)}
                    size="small"
                    status={
                        record.status === 'paid' ? 'success' :
                            record.status === 'overdue' ? 'exception' : 'active'
                    }
                />
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => {
                let color = 'blue';
                if (text === 'paid') color = 'green';
                else if (text === 'overdue') color = 'red';
                else if (text === 'partial') color = 'orange';

                return (
                    <Tag color={color}>
                        {text ? text.toUpperCase() : 'N/A'}
                    </Tag>
                );
            }
        },
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
            width: 120,
        }
    ];

    return (
        <>
            {/* Enhanced filter status indicator for debugging */}
            <div style={{ marginBottom: 8, fontSize: '0.85em', color: '#888' }}>
                Active filters:
                Status: {effectivePaymentStatus},
                Type: {effectivePaymentType},
                Properties: {effectiveSelectedProperties?.length || 0},
                Date Range: {effectiveDateRange && effectiveDateRange[0] ?
                    effectiveDateRange[0].format('YYYY-MM-DD') : 'none'} to {effectiveDateRange && effectiveDateRange[1] ?
                        effectiveDateRange[1].format('YYYY-MM-DD') : 'none'}
            </div>

            {/* Summary Cards */}
            <Row gutter={16} className="summary-cards">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Due Payments"
                            value={summaryData.totalDuePayments}
                            suffix={
                                <Popover
                                    content={formatCurrency(summaryData.totalDueAmount)}
                                    title="Total Amount Due"
                                >
                                    <InfoCircleOutlined style={{ fontSize: '0.8em', marginLeft: 4 }} />
                                </Popover>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Overdue Payments"
                            value={summaryData.totalOverduePayments}
                            valueStyle={{ color: '#ff4d4f' }}
                            suffix={
                                <Popover
                                    content={formatCurrency(summaryData.totalOverdueAmount)}
                                    title="Total Overdue Amount"
                                >
                                    <InfoCircleOutlined style={{ fontSize: '0.8em', marginLeft: 4 }} />
                                </Popover>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Upcoming Due Payments"
                            value={summaryData.upcomingDuePayments}
                            valueStyle={{ color: '#1890ff' }}
                            suffix={
                                <Popover
                                    content={formatCurrency(summaryData.upcomingDueAmount)}
                                    title="Total Upcoming Amount"
                                >
                                    <InfoCircleOutlined style={{ fontSize: '0.8em', marginLeft: 4 }} />
                                </Popover>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Days Overdue"
                            value={summaryData.averageDaysOverdue}
                            valueStyle={{ color: summaryData.averageDaysOverdue > 30 ? '#ff4d4f' : '#faad14' }}
                            suffix="days"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Just Search - No Duplicate Filters */}
            <Card style={{ marginTop: 16 }}>
                <Row gutter={16} justify="space-between" align="middle">
                    <Col>
                        <Title level={5}>Due Payments List</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Input
                                placeholder="Search customer, sale, property..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => handleSearch(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Due Payments Table */}
            <Card style={{ marginTop: 16 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Loading payment data..." />
                    </div>
                ) : filteredData.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                    />
                ) : (
                    <Empty description="No due payments found for the selected criteria" />
                )}
            </Card>
        </>
    );
};

export default DuePaymentsTab;