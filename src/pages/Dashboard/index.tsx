import React, { useState } from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Tabs, Button, Progress, Tag, Avatar, List, Typography, Space, Breadcrumb, Calendar, Badge, Modal, Form, Input, DatePicker, Select, message } from 'antd';
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

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

// Helper function to format date consistently
const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('YYYY-MM-DD');
};

// Event Calendar Component
const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [form] = Form.useForm();

    // Function to handle date selection
    const onSelect = (value) => {
        setSelectedDate(value);
        setIsModalVisible(true);
    };




    // Function to add a new event
    const handleAddEvent = () => {
        form.validateFields().then(values => {
            const newEvent = {
                id: `event_${Date.now()}`,
                title: values.title,
                date: values.date,
                type: values.type,
                description: values.description
            };

            setEvents([...events, newEvent]);
            setIsModalVisible(false);
            form.resetFields();
        }).catch(errorInfo => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    // Function to render events for a specific date
    const dateCellRender = (value) => {
        const dateEvents = events.filter(event =>
            event.date && event.date.isSame(value, 'day')
        );

        return (
            <ul className="events">
                {dateEvents.map(event => (
                    <li key={event.id}>
                        <Badge
                            status={
                                event.type === 'meeting' ? 'success' :
                                    event.type === 'task' ? 'warning' : 'error'
                            }
                            text={event.title}
                        />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="calendar-container">
            <Row gutter={[0, 16]}>
                <Col span={24}>
                    <Space style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={() => setIsModalVisible(true)}>
                            Add New Event
                        </Button>
                    </Space>
                </Col>
                <Col span={24}>
                    <Card>
                        <Calendar
                            onSelect={onSelect}
                            dateCellRender={dateCellRender}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Add New Event"
                visible={isModalVisible}
                onOk={handleAddEvent}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please input event title!' }]}
                    >
                        <Input prefix={<CalendarOutlined />} placeholder="Enter event title" />
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Date"
                        initialValue={selectedDate}
                        rules={[{ required: true, message: 'Please select a date!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Event Type"
                        rules={[{ required: true, message: 'Please select event type!' }]}
                    >
                        <Select placeholder="Select event type">
                            <Select.Option value="meeting">Meeting</Select.Option>
                            <Select.Option value="task">Task</Select.Option>
                            <Select.Option value="reminder">Reminder</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Optional event description" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
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
                console.log('sales fetched successfully:', response);

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
        queryKey: ['users'],
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
        salesActivities: [],
        top5SalesActivities: []
    } } = useQuery({
        queryKey: ['sales'],
        queryFn: async () => {
            try {
                const response = await fetchAllSales();
                const currentMonth = moment().month();
                const currentYear = moment().year();

                const filteredSales = response.data.filter(sale => {
                    const saleDate = moment(sale.saleDate);
                    return (
                        saleDate.month() === currentMonth &&
                        saleDate.year() === currentYear &&
                        sale.salePrice > 0 &&
                        sale.salesAgent?._id
                    );
                });

                // Aggregate sales by agent
                const salesByAgent = filteredSales.reduce((acc, sale) => {
                    const agentId = sale.salesAgent._id;

                    if (!acc[agentId]) {
                        acc[agentId] = {
                            agentId,
                            agentName: sale.salesAgent.name, // Include agent name
                            salesCount: 0,
                            totalSales: 0,
                            totalCommission: 0
                        };
                    }
                    acc[agentId].salesCount += 1;
                    acc[agentId].totalSales += sale.salePrice;
                    acc[agentId].totalCommission += (sale.salePrice * (sale.commission?.percentage || 5)) / 100;
                    return acc;
                }, {});

                // Sort and pick top 5 agents
                const topSalesAgents = Object.values(salesByAgent)
                    .sort((a, b) => b.totalSales - a.totalSales)
                    .slice(0, 5);

                // Extract all sales activities
                const salesActivities = response.data.flatMap(sale =>
                    sale.activities.map(activity => ({
                        saleId: sale._id,
                        activityType: activity.activityType,
                        date: activity.date,
                        description: activity.description,
                        by: activity.by, // Assuming `by` contains a user reference
                    }))
                );

                // Sort and pick top 5 activities based on most recent date
                const top5SalesActivities = [...salesActivities]
                    .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
                    .slice(0, 5);

                return {
                    salesCount: filteredSales.length,
                    totalSalesValue: filteredSales.reduce((total, sale) => total + sale.salePrice, 0),
                    topSalesAgents,
                    salesActivities,
                    top5SalesActivities,
                };
            } catch (error) {
                message.error('Failed to fetch sales');
                console.error('Error fetching sales:', error);
                return { salesCount: 0, totalSalesValue: 0, topSalesAgents: [], salesActivities: [], top5SalesActivities: [] };
            }
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const { salesCount, totalSalesValue, topSalesAgents, salesActivities, top5SalesActivities } = salesDataValue;







    // Property counts query
    const { data: propertiesData = { propertyCount: 0 } } = useQuery({
        queryKey: ['property'],
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
        queryKey: ['lead'],
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

    // Sample data - in a real application, this could be replaced with API calls
    const [salesData] = useState([
        { month: 'Jan', sales: 580000 },
        { month: 'Feb', sales: 780000 },
        { month: 'Mar', sales: 890000 },
        { month: 'Apr', sales: 680000 },
        { month: 'May', sales: 720000 },
        { month: 'Jun', sales: 950000 },
    ]);



    const [propertyTypeData] = useState([
        { type: 'Land', value: 45 },
        { type: 'Apartments', value: 55 },
    ]);

    const [topAgents] = useState([
        { id: '1', name: 'Jane Njeri', sales: 5, commission: 850000 },
        { id: '2', name: 'James Otieno', sales: 4, commission: 720000 },
        { id: '3', name: 'Peter Kipchoge', sales: 3, commission: 650000 },
    ]);

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
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: () => (
        //         <Space size="small">
        //             <Button type="primary" size="small">View Details</Button>
        //             <Button size="small">Record Payment</Button>
        //         </Space>
        //     ),
        // },
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
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: () => (
        //         <Space size="small">
        //             <Button type="primary" size="small">Contact</Button>
        //             <Button size="small">Convert</Button>
        //         </Space>
        //     ),
        // },
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
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: (_, record) => (
        //         <Space size="small">
        //             <Button type="primary" size="small" disabled={record.status === 'Sold'}>
        //                 {record.status === 'Available' ? 'Reserve' : 'View Details'}
        //             </Button>
        //         </Space>
        //     ),
        // },
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
                salesData={salesData}
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
                            rowKey="id"
                            loading={isLoadingPayments}
                            pagination={false}
                        />
                    </TabPane>
                    <TabPane
                        tab={<span><UserOutlined /> Latest Leads</span>}
                        key="2"
                    >
                        <Table
                            columns={leadColumns}
                            dataSource={latestLeads}
                            rowKey="id"
                            loading={isLoadingLeads}
                            pagination={false}
                        />
                    </TabPane>
                    <TabPane
                        tab={<span><HomeOutlined /> Latest Properties</span>}
                        key="3"
                    >
                        <Table
                            columns={propertyColumns}
                            dataSource={latestProperties}
                            rowKey="id"
                            loading={isLoadingProperties}
                            pagination={false}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Top Performing Agents */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                    <Card title={<><TeamOutlined /> Top Performing Agents</>}>
                        <List
                            itemLayout="horizontal"
                            dataSource={topSalesAgents}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} />}
                                        title={item.agentName}
                                        description={`${item.salesCount} sales | KES ${item.totalCommission.toLocaleString()} commission`}
                                    />
                                    <Progress
                                        percent={Math.round((item.totalSales / 10) * 100)}
                                        size="small"
                                        status="active"
                                        style={{ width: 120 }}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title={<><CalendarOutlined /> Upcoming Tasks</>}>
                        <List
                            itemLayout="horizontal"
                            dataSource={salesActivities.map((activity, index) => ({
                                id: index + 1,
                                title: activity.description || 'No Description',
                                time: moment(activity.date).calendar(),
                                priority: index === 0 ? 'High' : index < 3 ? 'Medium' : 'Low'
                            }))}
                            renderItem={item => (
                                <List.Item
                                    actions={[
                                        <Button size="small" type={item.priority === 'High' ? 'primary' : 'default'}>
                                            {item.priority}
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={item.title}
                                        description={item.time}
                                    />
                                </List.Item>
                            )}
                        />
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
                    {/* <Col xs={24} sm={8} md={4}>
                        <Button type="default" block icon={<FileTextOutlined />}>
                            Generate Report
                        </Button>
                    </Col> */}
                    {/* <Col xs={24} sm={8} md={4}>
                        <Button type="default" block icon={<EnvironmentOutlined />}>
                            View Map
                        </Button>
                    </Col> */}
                    <Col xs={24} sm={8} md={4}>
                        <Button type="default" block icon={<TeamOutlined />}>
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