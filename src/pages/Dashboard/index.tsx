import React, { useState } from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Tabs, Button, Progress, Tag, Avatar, List, Typography, Space, Breadcrumb } from 'antd';
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
    MenuUnfoldOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);

    // Sample data - in a real application, this would come from API calls
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

    const [pendingPayments] = useState([
        { id: '1', customer: 'John Kamau', property: 'Plot #A123, Nairobi', amount: 250000, dueDate: '2025-03-15' },
        { id: '2', customer: 'Sarah Wanjiku', property: 'Apartment #B5, Garden City', amount: 180000, dueDate: '2025-03-20' },
        { id: '3', customer: 'David Maina', property: 'Plot #C345, Mombasa Road', amount: 320000, dueDate: '2025-03-25' },
        { id: '4', customer: 'Elizabeth Owino', property: 'Apartment #D12, Westlands', amount: 280000, dueDate: '2025-04-05' },
    ]);

    const [recentLeads] = useState([
        { id: '1', name: 'Michael Ochieng', contact: '+254 712 345 678', interest: 'Apartment', source: 'Website', assignedTo: 'Jane' },
        { id: '2', name: 'Priscilla Nyambura', contact: '+254 723 456 789', interest: 'Land', source: 'Referral', assignedTo: 'James' },
        { id: '3', name: 'Robert Kariuki', contact: '+254 734 567 890', interest: 'Apartment', source: 'Exhibition', assignedTo: 'Jane' },
        { id: '4', name: 'Faith Wangari', contact: '+254 745 678 901', interest: 'Land', source: 'Social Media', assignedTo: 'Peter' },
    ]);

    const [topAgents] = useState([
        { id: '1', name: 'Jane Njeri', sales: 5, commission: 850000 },
        { id: '2', name: 'James Otieno', sales: 4, commission: 720000 },
        { id: '3', name: 'Peter Kipchoge', sales: 3, commission: 650000 },
    ]);

    const [properties] = useState([
        { id: '1', type: 'Land', location: 'Nairobi', size: '0.5 acres', status: 'Available', price: 5500000 },
        { id: '2', type: 'Apartment', location: 'Garden City', size: '3BR', status: 'Reserved', price: 8900000 },
        { id: '3', type: 'Land', location: 'Mombasa Road', size: '0.25 acres', status: 'Available', price: 3200000 },
        { id: '4', type: 'Apartment', location: 'Westlands', size: '2BR', status: 'Sold', price: 7500000 },
        { id: '5', type: 'Land', location: 'Thika Road', size: '0.8 acres', status: 'Available', price: 6800000 },
    ]);

    // Table columns
    const paymentColumns = [
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Property',
            dataIndex: 'property',
            key: 'property',
        },
        {
            title: 'Amount (KES)',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span>{amount.toLocaleString()}</span>,
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Space size="small">
                    <Button type="primary" size="small">Remind</Button>
                    <Button size="small">Record Payment</Button>
                </Space>
            ),
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
            dataIndex: 'contact',
            key: 'contact',
        },
        {
            title: 'Interest',
            dataIndex: 'interest',
            key: 'interest',
            render: (interest) => (
                <Tag color={interest === 'Apartment' ? 'blue' : 'green'}>
                    {interest}
                </Tag>
            ),
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedTo',
            key: 'assignedTo',
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Space size="small">
                    <Button type="primary" size="small">Contact</Button>
                    <Button size="small">Convert</Button>
                </Space>
            ),
        },
    ];

    const propertyColumns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'Apartment' ? 'blue' : 'green'}>
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
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
            title: 'Price (KES)',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span>{price.toLocaleString()}</span>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" size="small" disabled={record.status === 'Sold'}>
                        {record.status === 'Available' ? 'Reserve' : 'View Details'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="header" style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                    />
                    <Title level={4} style={{ margin: '0 0 0 12px' }}>Real Estate Management System</Title>
                </div>
                <Space>
                    <Button type="primary">Add New Property</Button>
                    <Button>Add New Customer</Button>
                </Space>
            </Header>

            <Content style={{ margin: '16px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                <div style={{ marginBottom: 16 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                    </Breadcrumb>
                    <Title level={3} style={{ marginTop: 16 }}>Property Management Dashboard</Title>
                    <Text type="secondary">Overview of sales, properties, and customers</Text>
                </div>

                {/* Summary Statistics */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Properties"
                                value={42}
                                prefix={<HomeOutlined />}
                                suffix={<span style={{ fontSize: '14px', color: '#52c41a' }}><RiseOutlined /> 15%</span>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active Leads"
                                value={28}
                                prefix={<UserOutlined />}
                                suffix={<span style={{ fontSize: '14px', color: '#52c41a' }}><RiseOutlined /> 8%</span>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Sales This Month"
                                value={3}
                                prefix={<ShopOutlined />}
                                suffix={<span style={{ fontSize: '14px', color: '#ff4d4f' }}><FallOutlined /> 10%</span>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Revenue (KES)"
                                value={24500000}
                                precision={0}
                                formatter={value => `${value.toLocaleString()}`}
                                prefix={<DollarOutlined />}
                                suffix={<span style={{ fontSize: '14px', color: '#52c41a' }}><RiseOutlined /> 12%</span>}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    {/* Sales Trend Chart */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<><BarChartOutlined /> Sales Trend</>}
                            extra={<Button type="link">View Reports</Button>}
                        >
                            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text type="secondary">Sales Trend Chart would render here using Ant Charts or Recharts</Text>
                            </div>
                        </Card>
                    </Col>

                    {/* Property Distribution Chart */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<><PieChartOutlined /> Property Distribution</>}
                            extra={<Button type="link">View Details</Button>}
                        >
                            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text type="secondary">Property Distribution Chart would render here using Ant Charts or Recharts</Text>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Tabs for different data views */}
                <Card style={{ marginTop: 16 }}>
                    <Tabs defaultActiveKey="1">
                        <TabPane
                            tab={<span><BellOutlined /> Pending Payments</span>}
                            key="1"
                        >
                            <Table
                                columns={paymentColumns}
                                dataSource={pendingPayments}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                            />
                        </TabPane>
                        <TabPane
                            tab={<span><UserOutlined /> Recent Leads</span>}
                            key="2"
                        >
                            <Table
                                columns={leadColumns}
                                dataSource={recentLeads}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                            />
                        </TabPane>
                        <TabPane
                            tab={<span><HomeOutlined /> Properties</span>}
                            key="3"
                        >
                            <Table
                                columns={propertyColumns}
                                dataSource={properties}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
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
                                dataSource={topAgents}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar icon={<UserOutlined />} />}
                                            title={item.name}
                                            description={`${item.sales} sales | KES ${item.commission.toLocaleString()} commission`}
                                        />
                                        <Progress
                                            percent={Math.round((item.sales / 10) * 100)}
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
                                dataSource={[
                                    { id: 1, title: 'Property viewing with Sarah Wanjiku', time: 'Today, 2:00 PM', priority: 'High' },
                                    { id: 2, title: 'Follow up with Michael Ochieng', time: 'Tomorrow, 10:00 AM', priority: 'Medium' },
                                    { id: 3, title: 'Property valuation at Thika Road', time: 'Mar 10, 9:00 AM', priority: 'Medium' },
                                    { id: 4, title: 'Meet with James about commission structure', time: 'Mar 12, 11:00 AM', priority: 'Low' },
                                ]}
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
                            <Button type="default" block icon={<HomeOutlined />}>
                                Add Property
                            </Button>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                            <Button type="default" block icon={<UserOutlined />}>
                                Add Customer
                            </Button>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                            <Button type="default" block icon={<DollarOutlined />}>
                                Record Payment
                            </Button>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                            <Button type="default" block icon={<FileTextOutlined />}>
                                Generate Report
                            </Button>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                            <Button type="default" block icon={<EnvironmentOutlined />}>
                                View Map
                            </Button>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                            <Button type="default" block icon={<TeamOutlined />}>
                                Manage Agents
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Real Estate Management System ©2025
            </Footer>
        </Layout>
    );
};

export default Dashboard;