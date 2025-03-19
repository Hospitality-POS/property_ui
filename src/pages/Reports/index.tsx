import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Card, Space, Typography, Button, Row, Col, Select, DatePicker,
    Table, Tabs, Statistic, Spin, Empty, message, Tag, Dropdown, Menu
} from 'antd';
import {
    BarChartOutlined, PieChartOutlined, LineChartOutlined,
    FileExcelOutlined, PrinterOutlined, DownloadOutlined, FilterOutlined,
    ReloadOutlined, DownOutlined, TeamOutlined, DollarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { fetchAllSales } from '@/services/sales';
import { fetchAllUsers } from '@/services/auth.api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const ReportsPage = () => {
    // State management
    const [activeTab, setActiveTab] = useState('agent-commissions');
    const [dateRange, setDateRange] = useState([moment().startOf('month'), moment()]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [sortedInfo, setSortedInfo] = useState({});
    const [filterType, setFilterType] = useState('all'); // 'all', 'paid', 'unpaid'
    const [salesAnalysisData, setSalesAnalysisData] = useState([]);
    const [performanceTrendsData, setPerformanceTrendsData] = useState([]);

    // Format helpers
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return 'KES 0';
        }
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD MMM YYYY');
    };

    // Fetch all sales data
    const { data: salesData = [], isLoading: isLoadingSales, refetch: refetchSales } = useQuery({
        queryKey: ['sales-for-reports', refreshKey, dateRange],
        queryFn: async () => {
            try {
                const response = await fetchAllSales();
                console.log('Sales data fetched for reports:', response);
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                message.error('Failed to fetch sales data for reports');
                console.error('Error fetching sales data:', error);
                return [];
            }
        }
    });

    // Fetch all users/agents data
    const { data: usersData = [], isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users-for-reports', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllUsers();
                // Handle different possible response structures
                let usersArray = [];
                if (response.data && Array.isArray(response.data)) {
                    usersArray = response.data;
                } else if (Array.isArray(response)) {
                    usersArray = response;
                } else if (response.users && Array.isArray(response.users)) {
                    usersArray = response.users;
                }

                // Process user data and extract agents
                const agents = usersArray.filter(user =>
                    user.role === 'sales_agent' ||
                    user.role === 'agent' ||
                    (user.role && user.role.toLowerCase().includes('agent'))
                );
                return agents;
            } catch (error) {
                message.error('Failed to fetch agents data');
                console.error('Error fetching agents:', error);
                return [];
            }
        }
    });

    // Process sales data to generate report when dependencies change
    useEffect(() => {
        if (!salesData.length) return;

        generateAgentCommissionsReport();
        generateSalesAnalysisReport();
        generatePerformanceTrendsReport();
    }, [salesData, dateRange, selectedAgents, filterType]);

    // Generate agent commissions report
    const generateAgentCommissionsReport = () => {
        // Filter sales by date range
        const [startDate, endDate] = dateRange || [null, null];
        let filteredSales = salesData;

        if (startDate && endDate) {
            filteredSales = salesData.filter(sale => {
                const saleDate = moment(sale.saleDate || sale.createdAt);
                return saleDate.isBetween(startDate, endDate, null, '[]');
            });
        }

        // Filter by selected agents (if any)
        if (selectedAgents.length > 0) {
            filteredSales = filteredSales.filter(sale => {
                const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent;
                return selectedAgents.includes(agentId);
            });
        }

        // Filter by payment status if needed
        if (filterType === 'paid') {
            filteredSales = filteredSales.filter(sale => {
                // Check if commission is marked as paid
                return sale.commission?.status === 'paid';
            });
        } else if (filterType === 'unpaid') {
            filteredSales = filteredSales.filter(sale => {
                // Check if commission is not marked as paid
                return !sale.commission?.status || sale.commission?.status !== 'paid';
            });
        }

        // Group sales by agent
        const agentSalesMap = {};

        filteredSales.forEach(sale => {
            const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent;
            if (!agentId) return;

            const agentName = sale.salesAgent?.name || 'Unknown Agent';
            const agentEmail = sale.salesAgent?.email || '';

            if (!agentSalesMap[agentId]) {
                agentSalesMap[agentId] = {
                    agentId,
                    agentName,
                    agentEmail,
                    totalSales: 0,
                    totalCommission: 0,
                    totalCommissionPaid: 0,
                    totalCommissionPending: 0,
                    sales: []
                };
            }

            // Calculate commission
            const salePrice = parseFloat(sale.salePrice) || 0;
            const commissionPercentage = parseFloat(sale.commission?.percentage) || 5;
            const commissionAmount = parseFloat(sale.commission?.amount) || (salePrice * commissionPercentage / 100);
            const commissionStatus = sale.commission?.status || 'pending';

            // Update agent totals
            agentSalesMap[agentId].totalSales += 1;
            agentSalesMap[agentId].totalCommission += commissionAmount;

            if (commissionStatus === 'paid') {
                agentSalesMap[agentId].totalCommissionPaid += commissionAmount;
            } else {
                agentSalesMap[agentId].totalCommissionPending += commissionAmount;
            }

            // Add detailed sale info
            agentSalesMap[agentId].sales.push({
                saleId: sale._id || sale.id,
                property: sale.property?.name || 'Unknown Property',
                customer: sale.customer?.name || 'Unknown Customer',
                saleDate: sale.saleDate || sale.createdAt,
                salePrice,
                commissionPercentage,
                commissionAmount,
                commissionStatus,
                unit: sale.unit?.unitId || sale.unit?.name || 'Unknown Unit'
            });
        });

        // Convert to array and sort by total commission (highest first)
        const reportData = Object.values(agentSalesMap).sort((a, b) => b.totalCommission - a.totalCommission);
        setReportData(reportData);
    };

    // Generate sales analysis report
    const generateSalesAnalysisReport = () => {
        const [startDate, endDate] = dateRange || [null, null];
        let filteredSales = salesData;

        if (startDate && endDate) {
            filteredSales = salesData.filter(sale => {
                const saleDate = moment(sale.saleDate || sale.createdAt);
                return saleDate.isBetween(startDate, endDate, null, '[]');
            });
        }

        // Group sales by property
        const propertyMap = {};
        let totalSaleValue = 0;

        filteredSales.forEach(sale => {
            const propertyId = sale.property?._id || sale.property?.id || 'unknown';
            const propertyName = sale.property?.name || 'Unknown Property';
            const salePrice = parseFloat(sale.salePrice) || 0;

            totalSaleValue += salePrice;

            if (!propertyMap[propertyId]) {
                propertyMap[propertyId] = {
                    propertyId,
                    propertyName,
                    salesCount: 0,
                    totalValue: 0,
                    units: {}
                };
            }

            const property = propertyMap[propertyId];
            property.salesCount += 1;
            property.totalValue += salePrice;

            // Track unit sales if available
            const unitId = sale.unit?.unitId || sale.unit?.id || 'unknown';
            const unitName = sale.unit?.name || sale.unit?.unitId || 'Unknown Unit';

            if (!property.units[unitId]) {
                property.units[unitId] = {
                    unitId,
                    unitName,
                    salesCount: 0,
                    totalValue: 0
                };
            }

            property.units[unitId].salesCount += 1;
            property.units[unitId].totalValue += salePrice;
        });

        // Convert to arrays for rendering
        const propertySalesData = Object.values(propertyMap).map(property => {
            const unitSales = Object.values(property.units);
            return {
                ...property,
                units: unitSales,
                percentage: totalSaleValue > 0 ? ((property.totalValue / totalSaleValue) * 100).toFixed(1) : 0
            };
        }).sort((a, b) => b.totalValue - a.totalValue);

        setSalesAnalysisData(propertySalesData);
    };

    // Generate performance trends report
    const generatePerformanceTrendsReport = () => {
        const [startDate, endDate] = dateRange || [null, null];
        if (!startDate || !endDate || !salesData.length) return;

        // Group sales by month
        const monthlySales = {};
        const agentPerformance = {};

        salesData.forEach(sale => {
            const saleDate = moment(sale.saleDate || sale.createdAt);
            if (!saleDate.isBetween(startDate, endDate, null, '[]')) return;

            const yearMonth = saleDate.format('YYYY-MM');
            const monthName = saleDate.format('MMM YYYY');
            const salePrice = parseFloat(sale.salePrice) || 0;

            // Initialize month data if not exists
            if (!monthlySales[yearMonth]) {
                monthlySales[yearMonth] = {
                    yearMonth,
                    monthName,
                    salesCount: 0,
                    salesValue: 0,
                    agentSales: {}
                };
            }

            // Update monthly totals
            monthlySales[yearMonth].salesCount += 1;
            monthlySales[yearMonth].salesValue += salePrice;

            // Track agent performance
            const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent;
            const agentName = sale.salesAgent?.name || 'Unknown Agent';

            if (agentId) {
                // Add agent to monthly tracking
                if (!monthlySales[yearMonth].agentSales[agentId]) {
                    monthlySales[yearMonth].agentSales[agentId] = {
                        agentId,
                        agentName,
                        salesCount: 0,
                        salesValue: 0
                    };
                }

                monthlySales[yearMonth].agentSales[agentId].salesCount += 1;
                monthlySales[yearMonth].agentSales[agentId].salesValue += salePrice;

                // Add agent to overall tracking
                if (!agentPerformance[agentId]) {
                    agentPerformance[agentId] = {
                        agentId,
                        agentName,
                        monthlySales: {},
                        totalSales: 0,
                        totalValue: 0
                    };
                }

                if (!agentPerformance[agentId].monthlySales[yearMonth]) {
                    agentPerformance[agentId].monthlySales[yearMonth] = {
                        yearMonth,
                        monthName,
                        salesCount: 0,
                        salesValue: 0
                    };
                }

                agentPerformance[agentId].monthlySales[yearMonth].salesCount += 1;
                agentPerformance[agentId].monthlySales[yearMonth].salesValue += salePrice;
                agentPerformance[agentId].totalSales += 1;
                agentPerformance[agentId].totalValue += salePrice;
            }
        });

        // Convert to arrays and sort
        const monthlyData = Object.values(monthlySales).sort((a, b) =>
            moment(a.yearMonth).diff(moment(b.yearMonth))
        );

        const agentData = Object.values(agentPerformance)
            .sort((a, b) => b.totalValue - a.totalValue)
            .map(agent => {
                // Convert agent's monthly sales to array and ensure all months are represented
                const agentMonthlyData = [];
                monthlyData.forEach(month => {
                    const yearMonth = month.yearMonth;
                    agentMonthlyData.push(
                        agent.monthlySales[yearMonth] || {
                            yearMonth,
                            monthName: month.monthName,
                            salesCount: 0,
                            salesValue: 0
                        }
                    );
                });

                return {
                    ...agent,
                    monthlySales: agentMonthlyData.sort((a, b) =>
                        moment(a.yearMonth).diff(moment(b.yearMonth))
                    )
                };
            });

        setPerformanceTrendsData({
            monthlyData,
            agentData
        });
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Handle agent selection change
    const handleAgentChange = (value) => {
        setSelectedAgents(value);
    };

    // Handle filter type change
    const handleFilterTypeChange = (value) => {
        setFilterType(value);
    };

    // Handle refresh
    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
        refetchSales({ force: true });
        message.info('Refreshing report data...');
    };

    // Handle row expansion
    const handleExpandRow = (expanded, record) => {
        setExpandedRowKeys(expanded ? [record.agentId] : []);
    };

    // Handle table sort change
    const handleTableChange = (pagination, filters, sorter) => {
        setSortedInfo(sorter);
    };

    // Agent commissions report columns
    const agentColumns = [
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
            sorter: (a, b) => a.agentName.localeCompare(b.agentName),
            sortOrder: sortedInfo.columnKey === 'agentName' && sortedInfo.order,
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <div>
                        <Text type="secondary">{record.agentEmail}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            align: 'center',
            sorter: (a, b) => a.totalSales - b.totalSales,
            sortOrder: sortedInfo.columnKey === 'totalSales' && sortedInfo.order,
        },
        {
            title: 'Total Commission',
            dataIndex: 'totalCommission',
            key: 'totalCommission',
            align: 'right',
            sorter: (a, b) => a.totalCommission - b.totalCommission,
            sortOrder: sortedInfo.columnKey === 'totalCommission' && sortedInfo.order,
            defaultSortOrder: 'descend',
            render: (text) => formatCurrency(text)
        },
        {
            title: 'Paid Commission',
            dataIndex: 'totalCommissionPaid',
            key: 'totalCommissionPaid',
            align: 'right',
            sorter: (a, b) => a.totalCommissionPaid - b.totalCommissionPaid,
            sortOrder: sortedInfo.columnKey === 'totalCommissionPaid' && sortedInfo.order,
            render: (text) => <Text type="success">{formatCurrency(text)}</Text>
        },
        {
            title: 'Pending Commission',
            dataIndex: 'totalCommissionPending',
            key: 'totalCommissionPending',
            align: 'right',
            sorter: (a, b) => a.totalCommissionPending - b.totalCommissionPending,
            sortOrder: sortedInfo.columnKey === 'totalCommissionPending' && sortedInfo.order,
            render: (text) => <Text type="warning">{formatCurrency(text)}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<PrinterOutlined />}>Print</Button>
                    <Button size="small" icon={<FileExcelOutlined />}>Export</Button>
                </Space>
            )
        }
    ];

    // Sales details columns for expanded row
    const salesDetailsColumns = [
        {
            title: 'Sale ID',
            dataIndex: 'saleId',
            key: 'saleId',
            width: 100,
            ellipsis: true
        },
        {
            title: 'Property',
            dataIndex: 'property',
            key: 'property',
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Sale Date',
            dataIndex: 'saleDate',
            key: 'saleDate',
            render: (text) => formatDate(text)
        },
        {
            title: 'Sale Price',
            dataIndex: 'salePrice',
            key: 'salePrice',
            align: 'right',
            render: (text) => formatCurrency(text)
        },
        {
            title: 'Commission',
            dataIndex: 'commissionAmount',
            key: 'commissionAmount',
            align: 'right',
            render: (text) => formatCurrency(text)
        },
        {
            title: 'Status',
            dataIndex: 'commissionStatus',
            key: 'commissionStatus',
            align: 'center',
            render: (status) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? 'Paid' : 'Pending'}
                </Tag>
            )
        }
    ];

    // Property analysis columns
    const propertyAnalysisColumns = [
        {
            title: 'Property',
            dataIndex: 'propertyName',
            key: 'propertyName',
            sorter: (a, b) => a.propertyName.localeCompare(b.propertyName),
        },
        {
            title: 'Sales Count',
            dataIndex: 'salesCount',
            key: 'salesCount',
            align: 'center',
            sorter: (a, b) => a.salesCount - b.salesCount,
        },
        {
            title: 'Total Value',
            dataIndex: 'totalValue',
            key: 'totalValue',
            align: 'right',
            sorter: (a, b) => a.totalValue - b.totalValue,
            defaultSortOrder: 'descend',
            render: (text) => formatCurrency(text)
        },
        {
            title: 'Share (%)',
            dataIndex: 'percentage',
            key: 'percentage',
            align: 'center',
            render: (text) => `${text}%`
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<BarChartOutlined />}>Details</Button>
                </Space>
            )
        }
    ];

    // Performance trend columns
    const performanceTrendColumns = [
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
            sorter: (a, b) => a.agentName.localeCompare(b.agentName),
        },
        {
            title: 'Total Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            align: 'center',
            sorter: (a, b) => a.totalSales - b.totalSales,
        },
        {
            title: 'Total Value',
            dataIndex: 'totalValue',
            key: 'totalValue',
            align: 'right',
            sorter: (a, b) => a.totalValue - b.totalValue,
            defaultSortOrder: 'descend',
            render: (text) => formatCurrency(text)
        }
    ];

    // Calculate totals for the reports summary
    const calculateTotals = () => {
        let totalSales = 0;
        let totalCommission = 0;
        let totalPaidCommission = 0;
        let totalPendingCommission = 0;

        reportData.forEach(agent => {
            totalSales += agent.totalSales;
            totalCommission += agent.totalCommission;
            totalPaidCommission += agent.totalCommissionPaid;
            totalPendingCommission += agent.totalCommissionPending;
        });

        return {
            totalSales,
            totalCommission,
            totalPaidCommission,
            totalPendingCommission
        };
    };

    const totals = calculateTotals();

    // Expanded row render function
    const expandedRowRender = (record) => {
        return (
            <div style={{ margin: '0 20px 20px 20px' }}>
                <Title level={5}>Sales Details</Title>
                <Table
                    columns={salesDetailsColumns}
                    dataSource={record.sales}
                    pagination={false}
                    size="small"
                    rowKey="saleId"
                />
            </div>
        );
    };

    // Expanded property row render function
    const expandedPropertyRender = (record) => {
        return (
            <div style={{ margin: '0 20px 20px 20px' }}>
                <Title level={5}>Unit Sales</Title>
                <Table
                    columns={[
                        {
                            title: 'Unit',
                            dataIndex: 'unitName',
                            key: 'unitName',
                        },
                        {
                            title: 'Sales Count',
                            dataIndex: 'salesCount',
                            key: 'salesCount',
                            align: 'center',
                        },
                        {
                            title: 'Total Value',
                            dataIndex: 'totalValue',
                            key: 'totalValue',
                            align: 'right',
                            render: (text) => formatCurrency(text)
                        },
                        {
                            title: 'Share (%)',
                            key: 'percentage',
                            align: 'center',
                            render: (_, record) => {
                                const percentage = record.totalValue > 0 && record.propertyValue > 0
                                    ? ((record.totalValue / record.propertyValue) * 100).toFixed(1)
                                    : 0;
                                return `${percentage}%`;
                            }
                        }
                    ]}
                    dataSource={record.units.map(unit => ({
                        ...unit,
                        propertyValue: record.totalValue
                    }))}
                    pagination={false}
                    size="small"
                    rowKey="unitId"
                />
            </div>
        );
    };

    // Expanded agent performance row render function
    const expandedAgentPerformanceRender = (record) => {
        return (
            <div style={{ margin: '0 20px 20px 20px' }}>
                <Title level={5}>Monthly Performance</Title>
                <Table
                    columns={[
                        {
                            title: 'Month',
                            dataIndex: 'monthName',
                            key: 'monthName',
                        },
                        {
                            title: 'Sales Count',
                            dataIndex: 'salesCount',
                            key: 'salesCount',
                            align: 'center',
                        },
                        {
                            title: 'Sales Value',
                            dataIndex: 'salesValue',
                            key: 'salesValue',
                            align: 'right',
                            render: (text) => formatCurrency(text)
                        }
                    ]}
                    dataSource={record.monthlySales}
                    pagination={false}
                    size="small"
                    rowKey="yearMonth"
                />
            </div>
        );
    };

    return (
        <div className="reports-page">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={4}>Reports</Title>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                    >
                                        Refresh
                                    </Button>
                                    <Dropdown overlay={
                                        <Menu>
                                            <Menu.Item key="1" icon={<FileExcelOutlined />}>Export to Excel</Menu.Item>
                                            <Menu.Item key="2" icon={<PrinterOutlined />}>Print Report</Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item key="3" icon={<BarChartOutlined />}>Customize Report</Menu.Item>
                                        </Menu>
                                    }>
                                        <Button>
                                            <DownloadOutlined /> Export <DownOutlined />
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
                        onChange={setActiveTab}
                        tabBarExtraContent={
                            <Space>
                                <RangePicker
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                    allowClear={false}
                                />
                                <Select
                                    mode="multiple"
                                    style={{ minWidth: 200 }}
                                    placeholder="Select Agents"
                                    value={selectedAgents}
                                    onChange={handleAgentChange}
                                    loading={isLoadingUsers}
                                    allowClear
                                >
                                    {usersData.map(agent => (
                                        <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                                            {agent.name}
                                        </Option>
                                    ))}
                                </Select>
                                <Select
                                    style={{ width: 120 }}
                                    placeholder="Filter"
                                    value={filterType}
                                    onChange={handleFilterTypeChange}
                                >
                                    <Option value="all">All Commissions</Option>
                                    <Option value="paid">Paid Only</Option>
                                    <Option value="unpaid">Unpaid Only</Option>
                                </Select>
                            </Space>
                        }
                    >
                        <TabPane
                            tab={
                                <span>
                                    <TeamOutlined /> Agent Commissions
                                </span>
                            }
                            key="agent-commissions"
                        >
                            {/* Commission Summary Stats */}
                            <Row gutter={16} className="summary-cards">
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Total Sales"
                                            value={totals.totalSales}
                                            prefix={<BarChartOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Total Commission"
                                            value={formatCurrency(totals.totalCommission)}
                                            prefix={<DollarOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Paid Commission"
                                            value={formatCurrency(totals.totalPaidCommission)}
                                            valueStyle={{ color: '#3f8600' }}
                                            prefix={<DollarOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Pending Commission"
                                            value={formatCurrency(totals.totalPendingCommission)}
                                            valueStyle={{ color: '#faad14' }}
                                            prefix={<DollarOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Agent Commissions Table */}
                            <Card style={{ marginTop: 16 }}>
                                {isLoadingSales ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin tip="Loading report data..." />
                                    </div>
                                ) : reportData.length > 0 ? (
                                    <Table
                                        columns={agentColumns}
                                        dataSource={reportData}
                                        rowKey="agentId"
                                        expandable={{
                                            expandedRowRender,
                                            expandRowByClick: true,
                                            expandedRowKeys,
                                            onExpand: handleExpandRow
                                        }}
                                        onChange={handleTableChange}
                                    />
                                ) : (
                                    <Empty
                                        description="No commission data found for the selected criteria"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </TabPane>

                        {/* Sales Analysis Tab - Now Activated */}
                        <TabPane
                            tab={
                                <span>
                                    <PieChartOutlined /> Sales Analysis
                                </span>
                            }
                            key="sales-analysis"
                        >
                            {/* Sales Analysis Summary Cards */}
                            <Row gutter={16} className="summary-cards">
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Total Properties"
                                            value={salesAnalysisData.length}
                                            prefix={<BarChartOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Total Sales"
                                            value={salesAnalysisData.reduce((total, property) => total + property.salesCount, 0)}
                                            prefix={<BarChartOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={12}>
                                    <Card>
                                        <Statistic
                                            title="Total Sales Value"
                                            value={formatCurrency(salesAnalysisData.reduce((total, property) => total + property.totalValue, 0))}
                                            prefix={<DollarOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Property Sales Distribution Table */}
                            <Card style={{ marginTop: 16 }}>
                                <Title level={5}>Property Sales Distribution</Title>
                                {isLoadingSales ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin tip="Loading sales analysis data..." />
                                    </div>
                                ) : salesAnalysisData.length > 0 ? (
                                    <Table
                                        columns={propertyAnalysisColumns}
                                        dataSource={salesAnalysisData}
                                        rowKey="propertyId"
                                        expandable={{
                                            expandedRowRender: expandedPropertyRender,
                                            expandRowByClick: true
                                        }}
                                    />
                                ) : (
                                    <Empty
                                        description="No sales data found for the selected criteria"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>

                            {/* Sales by Period Chart (Placeholder) */}
                            <Card style={{ marginTop: 16 }}>
                                <Title level={5}>Sales by Period</Title>
                                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <BarChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                                        <p>Bar chart visualization showing monthly sales trend would appear here</p>
                                        <Button type="primary">Generate Chart</Button>
                                    </div>
                                </div>
                            </Card>

                            {/* Top Performing Properties Chart (Placeholder) */}
                            <Card style={{ marginTop: 16 }}>
                                <Title level={5}>Top Performing Properties</Title>
                                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <PieChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                                        <p>Pie chart visualization showing property distribution would appear here</p>
                                        <Button type="primary">Generate Chart</Button>
                                    </div>
                                </div>
                            </Card>
                        </TabPane>

                        {/* Performance Trends Tab - Now Activated */}
                        <TabPane
                            tab={
                                <span>
                                    <LineChartOutlined /> Performance Trends
                                </span>
                            }
                            key="performance-trends"
                        >
                            {/* Performance Summary Cards */}
                            <Row gutter={16} className="summary-cards">
                                <Col xs={24} sm={12} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Total Active Agents"
                                            value={performanceTrendsData.agentData?.length || 0}
                                            prefix={<TeamOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Average Monthly Sales"
                                            value={
                                                performanceTrendsData.monthlyData?.length > 0
                                                    ? (performanceTrendsData.monthlyData.reduce((total, month) =>
                                                        total + month.salesCount, 0) / performanceTrendsData.monthlyData.length).toFixed(1)
                                                    : 0
                                            }
                                            prefix={<BarChartOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Average Monthly Revenue"
                                            value={
                                                performanceTrendsData.monthlyData?.length > 0
                                                    ? formatCurrency(performanceTrendsData.monthlyData.reduce((total, month) =>
                                                        total + month.salesValue, 0) / performanceTrendsData.monthlyData.length)
                                                    : formatCurrency(0)
                                            }
                                            prefix={<DollarOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Monthly Sales Trend Chart (Placeholder) */}
                            <Card style={{ marginTop: 16 }}>
                                <Title level={5}>Monthly Sales Trend</Title>
                                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <LineChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                                        <p>Line chart visualization showing monthly sales trend would appear here</p>
                                        <Button type="primary">Generate Chart</Button>
                                    </div>
                                </div>
                            </Card>

                            {/* Agent Performance Table */}
                            <Card style={{ marginTop: 16 }}>
                                <Title level={5}>Agent Performance</Title>
                                {isLoadingSales ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin tip="Loading performance data..." />
                                    </div>
                                ) : performanceTrendsData.agentData?.length > 0 ? (
                                    <Table
                                        columns={performanceTrendColumns}
                                        dataSource={performanceTrendsData.agentData}
                                        rowKey="agentId"
                                        expandable={{
                                            expandedRowRender: expandedAgentPerformanceRender,
                                            expandRowByClick: true
                                        }}
                                    />
                                ) : (
                                    <Empty
                                        description="No performance data found for the selected criteria"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>

                            {/* Agent Comparison Chart (Placeholder) */}
                            <Card style={{ marginTop: 16 }}>
                                <Title level={5}>Agent Comparison</Title>
                                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <BarChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                                        <p>Bar chart comparing top agents would appear here</p>
                                        <Button type="primary">Generate Chart</Button>
                                    </div>
                                </div>
                            </Card>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        </div>
    );
};

export default ReportsPage;