import React, { useState } from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Tabs, Button, Progress, Tag, Avatar, List, Typography, Space, Breadcrumb, Calendar, Badge, Modal, Form, Input, DatePicker, Select, message, Empty } from 'antd';
import {
    HomeOutlined,
    ShopOutlined,
    UserOutlined,
    DollarOutlined,
    BarChartOutlined,
    CalendarOutlined,
    RiseOutlined,
    FallOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    FileTextOutlined,
    BellOutlined,
    PieChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined
} from '@ant-design/icons';

import moment from 'moment';
import { fetchAllProperties } from '@/services/property';
import { fetchAllLeads } from '@/services/lead';
import { fetchAllSales } from '@/services/sales';
import { fetchAllUsers } from '@/services/auth.api';
import { fetchAllPayments } from '@/services/payments';
import { useQuery } from '@tanstack/react-query';
import { ChartsSection } from "../../components/charts/dashboardCharts"
import { useNavigate } from '@umijs/max';
import EventCalendar from '../Calendar/index'

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

// Helper function to format date consistently
const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('YYYY-MM-DD');
};


// Main Dashboard Component Content
const DashboardContent = () => {
    // Refresh key for query invalidation
    const [refreshKey, setRefreshKey] = useState(0);

    const navigate = useNavigate();

    // Latest Payments Query
    const { data: latestPayments = [], isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
        queryKey: ['sale', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllPayments();

                // Process data to use createdAt as dateJoined
                const processedData = Array.isArray(response.data)
                    ? response.data.map(payment => ({
                        ...payment,
                        dateJoined: formatDate(payment.createdAt) || payment.dateJoined,
                    }))
                    : [];

                // Sort by createdAt in descending order (latest first)
                const sortedData = [...processedData].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                // Return only the 5 latest payments
                return sortedData.slice(0, 5);
            } catch (error) {
                message.error('Failed to fetch sales');
                console.error('Error fetching sales:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });


    const formatPropertyType = (type) => {
        const typeMap = {
            'land': 'Land',
            'apartment': 'Apartment'
        };
        return typeMap[type] || type;
    };


    // Latest Leads Query
    const { data: latestLeads = [], isLoading: isLoadingLeads, refetch: refetchLeads } = useQuery({
        queryKey: ['latestLeads', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllLeads();
                console.log('leads fetched successfully:', response);

                // Process data to ensure consistent format
                const processedData = Array.isArray(response.data)
                    ? response.data.map(lead => ({
                        ...lead,
                        dateJoined: formatDate(lead.createdAt) || lead.dateJoined,
                    }))
                    : [];

                // Sort by createdAt in descending order (latest first)
                const sortedData = [...processedData].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                // Return only the 5 latest leads
                return sortedData.slice(0, 5);
            } catch (error) {
                message.error('Failed to fetch leads');
                console.error('Error fetching leads:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Latest Properties Query
    const { data: latestProperties = [], isLoading: isLoadingProperties, refetch: refetchProperties } = useQuery({
        queryKey: ['latestProperties', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllProperties();
                console.log('properties fetched successfully:', response);

                // Process data to ensure consistent format
                const processedData = Array.isArray(response.data)
                    ? response.data.map(property => ({
                        ...property,
                        dateJoined: formatDate(property.createdAt) || property.dateJoined,
                    }))
                    : [];

                // Sort by createdAt in descending order (latest first)
                const sortedData = [...processedData].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                // Return only the 5 latest properties
                return sortedData.slice(0, 5);
            } catch (error) {
                message.error('Failed to fetch properties');
                console.error('Error fetching properties:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    const { data: agentsData = [], isLoading: isLoadingAgents } = useQuery({
        queryKey: ['users', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllUsers();

                // Process data to use createdAt as dateJoined
                const processedData = Array.isArray(response.data)
                    ? response.data.map(user => ({
                        ...user,
                        dateJoined: formatDate(user.createdAt) || user.dateJoined,
                    })).filter(user => user.role === 'sales_agent')
                    : [];

                return processedData;
            } catch (error) {
                message.error('Failed to fetch users');
                console.error('Error fetching users:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    const { data: salesDataValue = {
        salesCount: 0,
        totalSalesValue: 0,
        topSalesAgents: [],
        sales: []
    }, isLoading: isLoadingSales } = useQuery({
        queryKey: ['sales', refreshKey],
        queryFn: async () => {
            try {
                // Fetch sales data
                const salesResponse = await fetchAllSales();
                console.log('Sales fetched successfully:', salesResponse);

                const currentYear = moment().year();

                const filteredSales = Array.isArray(salesResponse.data)
                    ? salesResponse.data.filter(sale => {
                        const saleDate = moment(sale.saleDate);
                        return (
                            saleDate.year() === currentYear &&
                            sale.salePrice > 0 &&
                            sale.salesAgent?._id
                        );
                    })
                    : [];

                // Aggregate sales by month
                const salesByMonth = filteredSales.reduce((acc, sale) => {
                    const month = moment(sale.saleDate).format('MMM'); // Get month abbreviation
                    acc[month] = (acc[month] || 0) + sale.salePrice;
                    return acc;
                }, {});

                // Calculate top sales agents
                const agentSalesMap = filteredSales.reduce((acc, sale) => {
                    const agentId = sale.salesAgent?._id;
                    if (!agentId) return acc;

                    const agentName = sale.salesAgent?.name || 'Unknown Agent';

                    if (!acc[agentId]) {
                        acc[agentId] = {
                            agentId,
                            agentName,
                            salesCount: 0,
                            totalSales: 0,
                            totalCommission: 0
                        };
                    }

                    acc[agentId].salesCount += 1;
                    acc[agentId].totalSales += sale.salePrice;
                    // Assuming 2% commission
                    acc[agentId].totalCommission += sale.salePrice * 0.02;

                    return acc;
                }, {});

                // Convert to array and sort by total sales
                const topSalesAgents = Object.values(agentSalesMap)
                    .sort((a, b) => b.totalSales - a.totalSales)
                    .slice(0, 5);

                // Align fetched sales with predefined salesData and update values
                const alignedSalesData = [
                    { month: 'Jan', sales: salesByMonth['Jan'] || 0 },
                    { month: 'Feb', sales: salesByMonth['Feb'] || 0 },
                    { month: 'Mar', sales: salesByMonth['Mar'] || 0 },
                    { month: 'Apr', sales: salesByMonth['Apr'] || 0 },
                    { month: 'May', sales: salesByMonth['May'] || 0 },
                    { month: 'Jun', sales: salesByMonth['Jun'] || 0 },
                    { month: 'Jul', sales: salesByMonth['Jul'] || 0 },
                    { month: 'Aug', sales: salesByMonth['Aug'] || 0 },
                    { month: 'Sep', sales: salesByMonth['Sep'] || 0 },
                    { month: 'Oct', sales: salesByMonth['Oct'] || 0 },
                    { month: 'Nov', sales: salesByMonth['Nov'] || 0 },
                    { month: 'Dec', sales: salesByMonth['Dec'] || 0 }
                ];

                return {
                    salesCount: filteredSales.length,
                    totalSalesValue: filteredSales.reduce((total, sale) => total + sale.salePrice, 0),
                    topSalesAgents: topSalesAgents,
                    sales: alignedSalesData
                };
            } catch (error) {
                message.error('Failed to fetch sales');
                console.error('Error fetching sales:', error);
                return {
                    salesCount: 0,
                    totalSalesValue: 0,
                    topSalesAgents: [],
                    sales: []
                };
            }
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const { salesCount, totalSalesValue, topSalesAgents, sales } = salesDataValue;

    console.log('Sales data:', salesDataValue);

    // Property counts query
    const { data: propertiesData = { propertyCount: 0 } } = useQuery({
        queryKey: ['property', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllProperties();
                return {
                    propertyCount: response.data.length,
                };
            } catch (error) {
                message.error('Failed to fetch properties');
                console.error('Error fetching properties:', error);
                return { propertyCount: 0 };
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const { propertyCount } = propertiesData;

    // Lead counts query
    const { data: leadData = { leadCount: 0 } } = useQuery({
        queryKey: ['lead', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllLeads();
                return {
                    leadCount: response.data.length,
                };
            } catch (error) {
                message.error('Failed to fetch leads');
                console.error('Error fetching leads:', error);
                return { leadCount: 0 };
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const { leadCount } = leadData;

    // Get upcoming tasks from calendar/events API
    const { data: upcomingTasks = [], isLoading: isLoadingTasks } = useQuery({
        queryKey: ['tasks', refreshKey],
        queryFn: async () => {
            try {
                // This should be replaced with your actual API call to fetch tasks/events
                // For now, we'll just return an empty array which will show the Empty state
                return [];

                // When you implement the API, it should look something like this:
                // const response = await fetchAllTasks();
                // return response.data.slice(0, 5); // Get the 5 most recent/important tasks
            } catch (error) {
                console.error('Error fetching tasks:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    // Table columns
    const paymentColumns = [
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            sorter: (a, b) => a.customer.name.localeCompare(b.customer.name),
        },
        {
            title: 'Property',
            dataIndex: ['sale', 'property', 'name'],
            key: 'property',
            sorter: (a, b) => a.sale.property.name.localeCompare(b.sale.property.name),
        },
        {
            title: 'Amount (KES)',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span>{amount?.toLocaleString()}</span>,
        },
        {
            title: 'Date',
            dataIndex: 'dateJoined',
            key: 'dateJoined',
        },
    ];

    const leadColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Contact',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Interest',
            key: 'interest',
            render: (_, record) => (
                <Tag color={record.interestAreas[0]?.propertyType === 'apartment' ? 'blue' :
                    record.interestAreas[0]?.propertyType === 'land' ? 'green' : 'purple'}>
                    {record.interestAreas[0]?.propertyType === 'apartment' ? 'Apartment' :
                        record.interestAreas[0]?.propertyType === 'land' ? 'Land' : 'Both'}
                </Tag>
            ),
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Land', value: 'land' },
                { text: 'Both', value: 'both' },
            ],
            onFilter: (value, record) => record.interestAreas[0]?.propertyType === value,
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: 'Date Added',
            dataIndex: 'dateJoined',
            key: 'dateJoined',
        },
    ];

    const propertyColumns = [
        {
            title: 'Type',
            dataIndex: 'propertyType',
            key: 'propertyType',
            width: 120,
            render: (type) => {
                let color = type === 'land' ? 'green' : 'blue';
                return <Tag color={color}>{formatPropertyType(type)}</Tag>;
            },
            filters: [
                { text: 'Land', value: 'land' },
                { text: 'Apartment', value: 'apartment' },
            ],
            onFilter: (value, record) => record.propertyType === value,
        },
        {
            title: 'Location',
            key: 'location',
            width: 150,
            render: (_, record) => (
                <span>
                    <EnvironmentOutlined style={{ marginRight: 5 }} /> {record.location.address}
                </span>
            ),
        },
        {
            title: 'Size',
            key: 'size',
            width: 100,
            render: (_, record) => {
                if (record.propertyType === 'land') {
                    return `${record.landSize} ${record.sizeUnit}`;
                } else {
                    return `${record.apartmentSize} sq m`;
                }
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'Reserved') {
                    color = 'orange';
                } else if (status === 'Sold') {
                    color = 'red';
                }
                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: 'Date Added',
            dataIndex: 'dateJoined',
            key: 'dateJoined',
        },
    ];

    return (
        <>
            <Space className="mb-4">
                <Button type="primary" onClick={() => navigate("/property")}>Add New Property</Button>
                <Button onClick={() => navigate("/customer")}>Add New Customer</Button>
                <Button onClick={() => setRefreshKey(prev => prev + 1)}>Refresh Data</Button>
            </Space>

            {/* Summary Statistics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Properties"
                            value={propertyCount}
                            prefix={<HomeOutlined />}
                            suffix={<span style={{ fontSize: '14px', color: '#52c41a' }}><RiseOutlined /> 15%</span>}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Active Leads"
                            value={leadCount}
                            prefix={<UserOutlined />}
                            suffix={<span style={{ fontSize: '14px', color: '#52c41a' }}><RiseOutlined /> 8%</span>}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Sales This Month"
                            value={salesCount}
                            prefix={<ShopOutlined />}
                            suffix={<span style={{ fontSize: '14px', color: '#ff4d4f' }}><FallOutlined /> 10%</span>}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Revenue (KES)"
                            value={totalSalesValue}
                            precision={0}
                            formatter={value => `${value.toLocaleString()}`}
                            prefix={<DollarOutlined />}
                            suffix={<span style={{ fontSize: '14px', color: '#52c41a' }}><RiseOutlined /> 12%</span>}
                        />
                    </Card>
                </Col>
            </Row>

            <ChartsSection
                salesData={sales}
                latestProperties={latestProperties}
            />

            {/* Tabs for different data views */}
            <Card style={{ marginTop: 16 }}>
                <Tabs defaultActiveKey="1">
                    <TabPane
                        tab={<span><BellOutlined /> Latest Payments</span>}
                        key="1"
                    >
                        <Table
                            columns={paymentColumns}
                            dataSource={latestPayments}
                            rowKey="_id"
                            loading={isLoadingPayments}
                            pagination={false}
                            locale={{ emptyText: <Empty description="No payments data available" /> }}
                        />
                    </TabPane>
                    <TabPane
                        tab={<span><UserOutlined /> Latest Leads</span>}
                        key="2"
                    >
                        <Table
                            columns={leadColumns}
                            dataSource={latestLeads}
                            rowKey="_id"
                            loading={isLoadingLeads}
                            pagination={false}
                            locale={{ emptyText: <Empty description="No leads data available" /> }}
                        />
                    </TabPane>
                    <TabPane
                        tab={<span><HomeOutlined /> Latest Properties</span>}
                        key="3"
                    >
                        <Table
                            columns={propertyColumns}
                            dataSource={latestProperties}
                            rowKey="_id"
                            loading={isLoadingProperties}
                            pagination={false}
                            locale={{ emptyText: <Empty description="No properties data available" /> }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Top Performing Agents and Upcoming Tasks */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                    <Card title={<><TeamOutlined /> Top Performing Agents</>}>
                        {isLoadingSales ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                        ) : topSalesAgents && topSalesAgents.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={topSalesAgents}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar icon={<UserOutlined />} />}
                                            title={item.agentName}
                                            description={`${item.salesCount} sales | KES ${Math.round(item.totalCommission).toLocaleString()} commission`}
                                        />
                                        <Progress
                                            percent={Math.round((item.salesCount / 10) * 100)}
                                            size="small"
                                            status="active"
                                            style={{ width: 120 }}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No agent performance data available" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title={<><CalendarOutlined /> Upcoming Tasks</>}>
                        {isLoadingTasks ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                        ) : upcomingTasks && upcomingTasks.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={upcomingTasks}
                                renderItem={item => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                size="small"
                                                type={item.priority === 'High' ? 'primary' : 'default'}
                                                danger={item.priority === 'High'}
                                            >
                                                {item.priority}
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={item.title || item.description}
                                            description={moment(item.date || item.startDate).format('MMM DD, YYYY')}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description={
                                <span>
                                    No upcoming tasks
                                    <Button
                                        type="link"
                                        onClick={() => navigate('/calendar')}
                                        style={{ marginLeft: 8 }}
                                    >
                                        Add a task
                                    </Button>
                                </span>
                            } />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Quick Links */}
            <Card style={{ marginTop: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={8} md={4}>
                        <Button
                            type="default"
                            block
                            icon={<HomeOutlined />}
                            onClick={() => navigate("/property")}
                        >
                            Add Property
                        </Button>
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                        <Button type="default" block icon={<UserOutlined />}
                            onClick={() => navigate("/customer")}
                        >
                            Add Customer
                        </Button>
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                        <Button type="default" block icon={<DollarOutlined />}
                            onClick={() => navigate("/sales")}>
                            Record Payment
                        </Button>
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                        <Button type="default" block icon={<TeamOutlined />}
                            onClick={() => navigate("/users")}>
                            Manage Agents
                        </Button>
                    </Col>
                </Row>
            </Card>
        </>
    );
};

const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Tabs defaultActiveKey="1" type="card" size="large" style={{ marginBottom: 16 }}>
            <TabPane
                tab={<span><DashboardOutlined /> Dashboard</span>}
                key="1"
            >
                <DashboardContent />
            </TabPane>
            <TabPane
                tab={<span><CalendarOutlined /> Calendar</span>}
                key="2"
            >
                <EventCalendar />
            </TabPane>
        </Tabs>
    );
};

export default Dashboard;