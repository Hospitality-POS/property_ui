// src/pages/PaymentAnalysis/index.tsx
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Row, Col, message, Card, Space, Button, Dropdown, Menu, Typography,
    Tabs, DatePicker, Select
} from 'antd';
import {
    ReloadOutlined, FileExcelOutlined, PrinterOutlined,
    DownloadOutlined, CalendarOutlined, BarChartOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import moment, { Moment } from 'moment';
import { fetchAllSales } from '@/services/sales';
import { fetchAllProperties } from '@/services/property';

// Import tab components directly
import DuePaymentsTab from './DuePayments';
import PaymentStatisticsTab from './PaymentStatistics';
import PaymentForecastsTab from './PaymentForecasts';

// Constants and types
const { Title } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

type TabKey = 'due-payments' | 'payment-statistics' | 'payment-forecasts';
type PaymentStatus = 'all' | 'due' | 'overdue' | 'paid' | 'partial';
type PaymentType = 'all' | 'installment' | 'deposit' | 'final';
type SortOrder = 'endDate' | 'amount' | 'customer';

// Context type definition
interface FiltersContextType {
    dateRange: [Moment | null, Moment | null];
    setDateRange: (range: [Moment | null, Moment | null]) => void;
    selectedProperties: string[];
    setSelectedProperties: (properties: string[]) => void;
    selectedCustomers: string[];
    setSelectedCustomers: (customers: string[]) => void;
    paymentStatus: PaymentStatus;
    setPaymentStatus: (status: PaymentStatus) => void;
    paymentType: PaymentType;
    setPaymentType: (type: PaymentType) => void;
    paymentThreshold: number;
    setPaymentThreshold: (threshold: number) => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    refreshKey: number;
    refreshData: () => void;
}

// Create context
const FiltersContext = createContext<FiltersContextType>({
    dateRange: [moment().startOf('month'), moment().add(3, 'months')],
    setDateRange: () => { },
    selectedProperties: [],
    setSelectedProperties: () => { },
    selectedCustomers: [],
    setSelectedCustomers: () => { },
    paymentStatus: 'all',
    setPaymentStatus: () => { },
    paymentType: 'all',
    setPaymentType: () => { },
    paymentThreshold: 0,
    setPaymentThreshold: () => { },
    sortOrder: 'endDate',
    setSortOrder: () => { },
    refreshKey: 0,
    refreshData: () => { },
});

// Custom hook to use the filters context
export const useFilters = () => useContext(FiltersContext);

// Main PaymentAnalysis component
const PaymentAnalysisPage: React.FC = () => {
    // State for tab
    const [activeTab, setActiveTab] = useState<TabKey>('due-payments');
    const [refreshKey, setRefreshKey] = useState<number>(0);

    // Context filter states
    const [dateRange, setDateRange] = useState<[Moment | null, Moment | null]>([
        moment().startOf('month'),
        moment().add(3, 'months')
    ]);
    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('all');
    const [paymentType, setPaymentType] = useState<PaymentType>('all');
    const [paymentThreshold, setPaymentThreshold] = useState<number>(0);
    const [sortOrder, setSortOrder] = useState<SortOrder>('endDate');

    // Fetch all sales data
    const {
        data: salesData = [],
        isLoading: isLoadingSales,
        refetch: refetchSales
    } = useQuery({
        queryKey: ['sales-for-payment-analysis', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllSales();
                console.log('Sales data fetched for payment analysis:', response);
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                message.error('Failed to fetch sales data for payment analysis');
                console.error('Error fetching sales data:', error);
                return [];
            }
        }
    });

    // Fetch all properties data
    const {
        data: propertiesData = [],
        isLoading: isLoadingProperties
    } = useQuery({
        queryKey: ['properties-for-payment-analysis', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllProperties();
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                message.error('Failed to fetch properties data');
                console.error('Error fetching properties:', error);
                return [];
            }
        }
    });

    // Refresh data
    const refreshData = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    // Enhanced filter change handlers that also refresh data
    const handleDateRangeChange = (dates: any) => {
        console.log("Date range changed:", dates);
        setDateRange(dates);
        // Force a refresh to ensure filters are applied
        setRefreshKey(prevKey => prevKey + 1);
    };

    const handlePaymentStatusChange = (value: PaymentStatus) => {
        console.log("Payment status changed to:", value);
        setPaymentStatus(value);
        // Force a refresh to ensure filters are applied
        setRefreshKey(prevKey => prevKey + 1);
    };

    const handlePaymentTypeChange = (value: PaymentType) => {
        console.log("Payment type changed to:", value);
        setPaymentType(value);
        // Force a refresh to ensure filters are applied
        setRefreshKey(prevKey => prevKey + 1);
    };

    // Context value
    const contextValue: FiltersContextType = {
        dateRange,
        setDateRange,
        selectedProperties,
        setSelectedProperties,
        selectedCustomers,
        setSelectedCustomers,
        paymentStatus,
        setPaymentStatus,
        paymentType,
        setPaymentType,
        paymentThreshold,
        setPaymentThreshold,
        sortOrder,
        setSortOrder,
        refreshKey,
        refreshData,
    };

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key as TabKey);
    };

    // Log when filters change
    useEffect(() => {
        console.log("Filter context updated:", {
            dateRange,
            selectedProperties,
            paymentStatus,
            paymentType,
            refreshKey
        });
    }, [dateRange, selectedProperties, paymentStatus, paymentType, refreshKey]);

    return (
        <FiltersContext.Provider value={contextValue}>
            <div className="payment-analysis-page">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Title level={4}>Payment Plans Analysis</Title>
                                </Col>
                                <Col>
                                    <Space>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={refreshData}
                                        >
                                            Refresh
                                        </Button>
                                        <Dropdown overlay={
                                            <Menu>
                                                <Menu.Item key="1">
                                                    <FileExcelOutlined /> Export to Excel
                                                </Menu.Item>
                                                <Menu.Item key="2">
                                                    <PrinterOutlined /> Print Report
                                                </Menu.Item>
                                            </Menu>
                                        }>
                                            <Button>
                                                <DownloadOutlined /> Actions
                                            </Button>
                                        </Dropdown>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Tabs
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            tabBarExtraContent={
                                <Space>
                                    <RangePicker
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                        allowClear={false}
                                    />
                                    <Select
                                        style={{ width: 140 }}
                                        placeholder="Status"
                                        value={paymentStatus}
                                        onChange={handlePaymentStatusChange}
                                    >
                                        <Option value="all">All Payments</Option>
                                        <Option value="due">Due</Option>
                                        <Option value="overdue">Overdue</Option>
                                        <Option value="paid">Paid</Option>
                                        <Option value="partial">Partial</Option>
                                    </Select>
                                    <Select
                                        style={{ width: 140 }}
                                        placeholder="Type"
                                        value={paymentType}
                                        onChange={handlePaymentTypeChange}
                                    >
                                        <Option value="all">All Types</Option>
                                        <Option value="deposit">Deposit</Option>
                                        <Option value="installment">Installment</Option>
                                        <Option value="final">Final</Option>
                                    </Select>
                                </Space>
                            }
                        >
                            <TabPane
                                tab={
                                    <span>
                                        <CalendarOutlined /> Due Payments
                                    </span>
                                }
                                key="due-payments"
                            >
                                <DuePaymentsTab
                                    salesData={salesData}
                                    propertiesData={propertiesData}
                                    isLoading={isLoadingSales || isLoadingProperties}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        <BarChartOutlined /> Payment Statistics
                                    </span>
                                }
                                key="payment-statistics"
                            >
                                <PaymentStatisticsTab
                                    salesData={salesData}
                                    isLoading={isLoadingSales}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        <LineChartOutlined /> Payment Forecasts
                                    </span>
                                }
                                key="payment-forecasts"
                            >
                                <PaymentForecastsTab
                                    salesData={salesData}
                                    isLoading={isLoadingSales}
                                />
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </div>
        </FiltersContext.Provider>
    );
};

export default PaymentAnalysisPage;