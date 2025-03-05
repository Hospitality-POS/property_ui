import React, { useState } from 'react';
import {
    Layout,
    Card,
    Table,
    Tag,
    Space,
    Button,
    Input,
    InputNumber,
    Row,
    Col,
    Typography,
    Breadcrumb,
    Dropdown,
    Menu,
    Modal,
    Divider,
    Tabs,
    Form,
    Select,
    DatePicker,
    Tooltip,
    Progress,
    Badge,
    Timeline,
    Drawer,
    Avatar,
    List,
    Statistic,
    Descriptions,
    Steps,
    Popover,
    Checkbox,
    Upload
} from 'antd';
import {
    DollarOutlined,
    SearchOutlined,
    PlusOutlined,
    FileTextOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    FilterOutlined,
    DownOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    HomeOutlined,
    BankOutlined,
    PrinterOutlined,
    ExportOutlined,
    FileDoneOutlined,
    FileExcelOutlined,
    MailOutlined,
    PhoneOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TeamOutlined,
    BarChartOutlined,
    PieChartOutlined,
    CheckOutlined,
    CloseOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;

// Sample sales data
const salesData = [
    {
        id: 'S001',
        property: {
            id: 'P002',
            title: 'Garden City 3-Bedroom Apartment',
            type: 'Apartment',
            location: 'Garden City, Thika Road',
            size: '150 sq m'
        },
        customer: {
            id: 'C001',
            name: 'John Kamau',
            contactNumber: '+254 712 345 678',
            email: 'john.kamau@example.com'
        },
        salePrice: 8500000,
        listPrice: 8900000,
        discount: 400000,
        status: 'Completed',
        saleDate: '2025-01-15',
        paymentPlan: 'Installment',
        agent: 'Jane Njeri',
        commission: 212500,
        completionDate: '2025-03-01',
        documents: ['Sale Agreement', 'Payment Receipt', 'Title Transfer'],
        payments: [
            {
                id: 'PMT001',
                amount: 2500000,
                date: '2025-01-15',
                method: 'Bank Transfer',
                status: 'Paid',
                reference: 'BT-78923'
            },
            {
                id: 'PMT002',
                amount: 3000000,
                date: '2025-02-01',
                method: 'M-Pesa',
                status: 'Paid',
                reference: 'MP-56781'
            },
            {
                id: 'PMT003',
                amount: 3000000,
                date: '2025-03-01',
                method: 'Bank Transfer',
                status: 'Paid',
                reference: 'BT-89023'
            }
        ],
        notes: 'Customer negotiated a discount for early completion payment.',
        timeline: [
            { date: '2024-12-10', event: 'Initial Viewing', description: 'Customer viewed the property and showed interest' },
            { date: '2024-12-18', event: 'Negotiation', description: 'Price and terms discussed' },
            { date: '2025-01-15', event: 'Sale Agreement', description: 'Contract signed and initial payment made' },
            { date: '2025-02-01', event: 'Second Payment', description: 'Second installment received' },
            { date: '2025-03-01', event: 'Final Payment', description: 'Final payment received and handover completed' }
        ],
        saleStage: 'Completed'
    },
    {
        id: 'S002',
        property: {
            id: 'P003',
            title: 'Commercial Plot in Mombasa Road',
            type: 'Land',
            location: 'Mombasa Road',
            size: '0.25 acres'
        },
        customer: {
            id: 'C002',
            name: 'Sarah Wanjiku',
            contactNumber: '+254 723 456 789',
            email: 'sarah.wanjiku@example.com'
        },
        salePrice: 3200000,
        listPrice: 3200000,
        discount: 0,
        status: 'In Progress',
        saleDate: '2025-02-20',
        paymentPlan: 'Installment',
        agent: 'James Otieno',
        commission: 80000,
        completionDate: '2025-08-20',
        documents: ['Sale Agreement', 'Payment Receipt'],
        payments: [
            {
                id: 'PMT004',
                amount: 1000000,
                date: '2025-02-20',
                method: 'Bank Transfer',
                status: 'Paid',
                reference: 'BT-90123'
            },
            {
                id: 'PMT005',
                amount: 500000,
                date: '2025-03-20',
                method: 'M-Pesa',
                status: 'Pending',
                reference: 'MP-67892'
            },
            {
                id: 'PMT006',
                amount: 500000,
                date: '2025-04-20',
                method: 'M-Pesa',
                status: 'Not Due',
                reference: ''
            },
            {
                id: 'PMT007',
                amount: 500000,
                date: '2025-05-20',
                method: 'M-Pesa',
                status: 'Not Due',
                reference: ''
            },
            {
                id: 'PMT008',
                amount: 700000,
                date: '2025-08-20',
                method: 'M-Pesa',
                status: 'Not Due',
                reference: ''
            }
        ],
        notes: 'Customer requested a 6-month payment plan.',
        timeline: [
            { date: '2025-01-25', event: 'Initial Viewing', description: 'Customer viewed the property and showed interest' },
            { date: '2025-02-10', event: 'Negotiation', description: 'Payment plan terms discussed' },
            { date: '2025-02-20', event: 'Sale Agreement', description: 'Contract signed and initial payment made' }
        ],
        saleStage: 'Payment Collection'
    },
    {
        id: 'S003',
        property: {
            id: 'P006',
            title: '1-Bedroom Studio in Kilimani',
            type: 'Apartment',
            location: 'Kilimani',
            size: '75 sq m'
        },
        customer: {
            id: 'C003',
            name: 'Robert Kariuki',
            contactNumber: '+254 734 567 890',
            email: 'robert.kariuki@example.com'
        },
        salePrice: 4000000,
        listPrice: 4200000,
        discount: 200000,
        status: 'Processing',
        saleDate: '2025-03-01',
        paymentPlan: 'Full Payment',
        agent: 'Jane Njeri',
        commission: 100000,
        completionDate: '2025-03-15',
        documents: ['Reservation Form', 'Sale Agreement'],
        payments: [
            {
                id: 'PMT009',
                amount: 4000000,
                date: '2025-03-10',
                method: 'Bank Transfer',
                status: 'Pending',
                reference: 'BT-12345'
            }
        ],
        notes: 'Customer negotiated a discount for full payment.',
        timeline: [
            { date: '2025-02-15', event: 'Initial Viewing', description: 'Customer viewed the property and showed interest' },
            { date: '2025-02-25', event: 'Negotiation', description: 'Price negotiation for full payment' },
            { date: '2025-03-01', event: 'Sale Agreement', description: 'Contract signed' }
        ],
        saleStage: 'Documentation'
    },
    {
        id: 'S004',
        property: {
            id: 'P005',
            title: 'Agricultural Land in Thika',
            type: 'Land',
            location: 'Thika Road',
            size: '0.8 acres'
        },
        customer: {
            id: 'C004',
            name: 'Faith Wangari',
            contactNumber: '+254 745 678 901',
            email: 'faith.wangari@example.com'
        },
        salePrice: 6800000,
        listPrice: 6800000,
        discount: 0,
        status: 'Reserved',
        saleDate: '2025-03-02',
        paymentPlan: 'Mortgage',
        agent: 'Peter Kipchoge',
        commission: 170000,
        completionDate: null,
        documents: ['Reservation Form'],
        payments: [
            {
                id: 'PMT010',
                amount: 680000,
                date: '2025-03-02',
                method: 'M-Pesa',
                status: 'Paid',
                reference: 'MP-78901'
            }
        ],
        notes: 'Customer is securing mortgage financing from KCB Bank.',
        timeline: [
            { date: '2025-02-20', event: 'Initial Viewing', description: 'Customer viewed the property and showed interest' },
            { date: '2025-03-02', event: 'Reservation', description: 'Property reserved with 10% booking fee' }
        ],
        saleStage: 'Financing'
    },
    {
        id: 'S005',
        property: {
            id: 'P008',
            title: 'Penthouse in Riverside Drive',
            type: 'Apartment',
            location: 'Riverside Drive',
            size: '230 sq m'
        },
        customer: {
            id: 'C005',
            name: 'Samuel Otieno',
            contactNumber: '+254 756 789 012',
            email: 'samuel.otieno@example.com'
        },
        salePrice: 18000000,
        listPrice: 18500000,
        discount: 500000,
        status: 'Canceled',
        saleDate: '2025-01-10',
        paymentPlan: 'Installment',
        agent: 'James Otieno',
        commission: 0,
        completionDate: null,
        documents: ['Reservation Form', 'Cancellation Form'],
        payments: [
            {
                id: 'PMT011',
                amount: 2000000,
                date: '2025-01-10',
                method: 'Bank Transfer',
                status: 'Refunded',
                reference: 'BT-23456'
            }
        ],
        notes: 'Sale canceled due to financing issues. Booking fee refunded.',
        timeline: [
            { date: '2024-12-15', event: 'Initial Viewing', description: 'Customer viewed the property and showed interest' },
            { date: '2025-01-10', event: 'Reservation', description: 'Property reserved with booking fee' },
            { date: '2025-02-15', event: 'Cancellation', description: 'Sale canceled due to financing issues' },
            { date: '2025-02-28', event: 'Refund', description: 'Booking fee refunded to customer' }
        ],
        saleStage: 'Canceled'
    }
];

const SalesManagement = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [addSaleVisible, setAddSaleVisible] = useState(false);
    const [addPaymentVisible, setAddPaymentVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [salesStatusFilter, setSalesStatusFilter] = useState('all');
    const [salesAgentFilter, setSalesAgentFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // Table columns for sales list
    const columns = [
        {
            title: 'Sale ID',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: 100,
            sorter: (a, b) => a.id.localeCompare(b.id),
        },
        {
            title: 'Property',
            dataIndex: ['property', 'title'],
            key: 'property',
            fixed: 'left',
            width: 180,
            render: (text, record) => (
                <a onClick={() => handleViewSale(record)}>{text}</a>
            ),
            sorter: (a, b) => a.property.title.localeCompare(b.property.title),
        },
        {
            title: 'Type',
            dataIndex: ['property', 'type'],
            key: 'type',
            width: 110,
            render: (type) => (
                <Tag color={type === 'Apartment' ? 'blue' : 'green'}>
                    {type}
                </Tag>
            ),
            filters: [
                { text: 'Apartment', value: 'Apartment' },
                { text: 'Land', value: 'Land' },
            ],
            onFilter: (value, record) => record.property.type === value,
        },
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            width: 150,
            sorter: (a, b) => a.customer.name.localeCompare(b.customer.name),
        },
        {
            title: 'Sale Price (KES)',
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: 150,
            render: (price) => price.toLocaleString(),
            sorter: (a, b) => a.salePrice - b.salePrice,
        },
        {
            title: 'Sale Date',
            dataIndex: 'saleDate',
            key: 'saleDate',
            width: 120,
            sorter: (a, b) => new Date(a.saleDate) - new Date(b.saleDate),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = 'default';
                if (status === 'Reserved') color = 'orange';
                if (status === 'Processing') color = 'blue';
                if (status === 'In Progress') color = 'cyan';
                if (status === 'Completed') color = 'green';
                if (status === 'Canceled') color = 'red';

                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            },
            filters: [
                { text: 'Reserved', value: 'Reserved' },
                { text: 'Processing', value: 'Processing' },
                { text: 'In Progress', value: 'In Progress' },
                { text: 'Completed', value: 'Completed' },
                { text: 'Canceled', value: 'Canceled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Payment Plan',
            dataIndex: 'paymentPlan',
            key: 'paymentPlan',
            width: 120,
            filters: [
                { text: 'Full Payment', value: 'Full Payment' },
                { text: 'Installment', value: 'Installment' },
                { text: 'Mortgage', value: 'Mortgage' },
            ],
            onFilter: (value, record) => record.paymentPlan === value,
        },
        {
            title: 'Agent',
            dataIndex: 'agent',
            key: 'agent',
            width: 120,
            filters: [
                { text: 'Jane Njeri', value: 'Jane Njeri' },
                { text: 'James Otieno', value: 'James Otieno' },
                { text: 'Peter Kipchoge', value: 'Peter Kipchoge' },
            ],
            onFilter: (value, record) => record.agent === value,
        },
        {
            title: 'Commission (KES)',
            dataIndex: 'commission',
            key: 'commission',
            width: 140,
            render: (commission) => commission.toLocaleString(),
            sorter: (a, b) => a.commission - b.commission,
        },
        {
            title: 'Completion Date',
            dataIndex: 'completionDate',
            key: 'completionDate',
            width: 140,
            render: (date) => date ? date : <Text type="secondary">Pending</Text>,
            sorter: (a, b) => {
                if (!a.completionDate) return 1;
                if (!b.completionDate) return -1;
                return new Date(a.completionDate) - new Date(b.completionDate);
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<FileTextOutlined />}
                            size="small"
                            onClick={() => handleViewSale(record)}
                        />
                    </Tooltip>
                    {record.status !== 'Completed' && record.status !== 'Canceled' && (
                        <Tooltip title="Add Payment">
                            <Button
                                icon={<DollarOutlined />}
                                size="small"
                                type="primary"
                                onClick={() => handleAddPayment(record)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Edit Sale">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditSale(record)}
                        />
                    </Tooltip>
                    {record.status !== 'Completed' && (
                        <Tooltip title="Cancel Sale">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => showDeleteConfirm(record)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    // Handle view sale
    const handleViewSale = (sale) => {
        setSelectedSale(sale);
        setDrawerVisible(true);
    };

    // Handle edit sale
    const handleEditSale = (sale) => {
        // In a real app, this would open a form to edit the sale
        console.log('Edit sale:', sale);
    };

    // Handle add payment
    const handleAddPayment = (sale) => {
        setSelectedSale(sale);
        setAddPaymentVisible(true);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (sale) => {
        setSaleToDelete(sale);
        setDeleteModalVisible(true);
    };

    // Handle delete/cancel sale
    const handleCancelSale = () => {
        // In a real app, this would call an API to cancel the sale
        console.log('Cancel sale:', saleToDelete);
        setDeleteModalVisible(false);
        setSaleToDelete(null);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Calculate sales totals
    const getTotalSalesAmount = () => {
        return salesData
            .filter(sale => sale.status !== 'Canceled')
            .reduce((total, sale) => total + sale.salePrice, 0);
    };

    const getTotalCommission = () => {
        return salesData
            .filter(sale => sale.status !== 'Canceled')
            .reduce((total, sale) => total + sale.commission, 0);
    };

    const getCompletedSalesCount = () => {
        return salesData.filter(sale => sale.status === 'Completed').length;
    };

    const getPendingSalesCount = () => {
        return salesData.filter(sale =>
            sale.status !== 'Completed' && sale.status !== 'Canceled'
        ).length;
    };

    // Calculate payment stats for a sale
    const calculatePaymentStats = (sale) => {
        const totalAmount = sale.salePrice;
        const paidAmount = sale.payments
            .filter(payment => payment.status === 'Paid')
            .reduce((total, payment) => total + payment.amount, 0);
        const pendingAmount = sale.payments
            .filter(payment => payment.status === 'Pending')
            .reduce((total, payment) => total + payment.amount, 0);
        const remainingAmount = totalAmount - paidAmount - pendingAmount;
        const paidPercentage = (paidAmount / totalAmount) * 100;

        return {
            totalAmount,
            paidAmount,
            pendingAmount,
            remainingAmount,
            paidPercentage
        };
    };

    // Filter sales based on search text and filters
    const filteredSales = salesData.filter(
        (sale) => {
            const matchesSearch =
                sale.id.toLowerCase().includes(searchText.toLowerCase()) ||
                sale.property.title.toLowerCase().includes(searchText.toLowerCase()) ||
                sale.customer.name.toLowerCase().includes(searchText.toLowerCase());

            const matchesStatus = salesStatusFilter === 'all' || sale.status === salesStatusFilter;
            const matchesAgent = salesAgentFilter === 'all' || sale.agent === salesAgentFilter;

            let matchesDateRange = true;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const saleDate = new Date(sale.saleDate);
                const startDate = new Date(dateRange[0]);
                const endDate = new Date(dateRange[1]);
                matchesDateRange = saleDate >= startDate && saleDate <= endDate;
            }

            return matchesSearch && matchesStatus && matchesAgent && matchesDateRange;
        }
    );

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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddSaleVisible(true)}>
                        Add Sale
                    </Button>
                </Space>
            </Header>

            <Content style={{ margin: '16px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: 16 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>Sales</Breadcrumb.Item>
                    </Breadcrumb>
                    <Title level={3} style={{ marginTop: 8, marginBottom: 16 }}>Sales Management</Title>
                </div>

                {/* Sales Statistics Cards */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Sales Revenue"
                                value={getTotalSalesAmount()}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<DollarOutlined />}
                                formatter={value => `KES ${value.toLocaleString()}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Completed Sales"
                                value={getCompletedSalesCount()}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<CheckCircleOutlined />}
                                suffix={`/ ${salesData.length}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Pending Sales"
                                value={getPendingSalesCount()}
                                valueStyle={{ color: '#faad14' }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Commission"
                                value={getTotalCommission()}
                                valueStyle={{ color: '#722ed1' }}
                                prefix={<TeamOutlined />}
                                formatter={value => `KES ${value.toLocaleString()}`}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Search and Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={24} md={6}>
                        <Input
                            placeholder="Search by ID, property or customer..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by Status"
                            defaultValue="all"
                            onChange={value => setSalesStatusFilter(value)}
                        >
                            <Option value="all">All Statuses</Option>
                            <Option value="Reserved">Reserved</Option>
                            <Option value="Processing">Processing</Option>
                            <Option value="In Progress">In Progress</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Canceled">Canceled</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by Agent"
                            defaultValue="all"
                            onChange={value => setSalesAgentFilter(value)}
                        >
                            <Option value="all">All Agents</Option>
                            <Option value="Jane Njeri">Jane Njeri</Option>
                            <Option value="James Otieno">James Otieno</Option>
                            <Option value="Peter Kipchoge">Peter Kipchoge</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Start Date', 'End Date']}
                            onChange={handleDateRangeChange}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={2}>
                        <Dropdown overlay={
                            <Menu>
                                <Menu.Item key="1" icon={<FileExcelOutlined />}>Export to Excel</Menu.Item>
                                <Menu.Item key="2" icon={<PrinterOutlined />}>Print Report</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="3" icon={<BarChartOutlined />}>Sales Analytics</Menu.Item>
                            </Menu>
                        }>
                            <Button style={{ width: '100%' }}>
                                <ExportOutlined /> Export <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Col>
                </Row>

                {/* Sales Table */}
                <Table
                    columns={columns}
                    dataSource={filteredSales}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1500 }}
                    expandable={{
                        expandedRowRender: record => (
                            <p style={{ margin: 0 }}>
                                <strong>Notes:</strong> {record.notes}
                            </p>
                        ),
                    }}
                    summary={pageData => {
                        if (pageData.length === 0) return null;

                        let totalSaleAmount = 0;
                        let totalCommission = 0;

                        pageData.forEach(({ salePrice, commission, status }) => {
                            if (status !== 'Canceled') {
                                totalSaleAmount += salePrice;
                                totalCommission += commission;
                            }
                        });

                        return (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={4}><strong>Page Total</strong></Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>
                                        <Text type="danger">KES {totalSaleAmount.toLocaleString()}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} colSpan={3}></Table.Summary.Cell>
                                    <Table.Summary.Cell index={8}>
                                        <Text type="danger">KES {totalCommission.toLocaleString()}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={9} colSpan={2}></Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        );
                    }}
                />
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Real Estate Management System ©2025
            </Footer>

            {/* Sale Details Drawer */}
            <Drawer
                title={selectedSale ? `Sale Details: ${selectedSale.id}` : 'Sale Details'}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                width={700}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        {selectedSale && selectedSale.status !== 'Completed' && selectedSale.status !== 'Canceled' && (
                            <Button type="primary" onClick={() => handleAddPayment(selectedSale)} style={{ marginRight: 8 }}>
                                Add Payment
                            </Button>
                        )}
                        <Button onClick={() => setDrawerVisible(false)}>Close</Button>
                    </div>
                }
            >
                {selectedSale && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Title level={4}>{selectedSale.property.title}</Title>
                                    <Space direction="vertical">
                                        <Text><HomeOutlined style={{ marginRight: 8 }} />{selectedSale.property.type} - {selectedSale.property.size}</Text>
                                        <Text><EnvironmentOutlined style={{ marginRight: 8 }} />{selectedSale.property.location}</Text>
                                        <Text><UserOutlined style={{ marginRight: 8 }} />Customer: {selectedSale.customer.name}</Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    <Tag color={
                                        selectedSale.status === 'Reserved' ? 'orange' :
                                            selectedSale.status === 'Processing' ? 'blue' :
                                                selectedSale.status === 'In Progress' ? 'cyan' :
                                                    selectedSale.status === 'Completed' ? 'green' : 'red'
                                    } style={{ fontSize: '14px', padding: '4px 8px' }}>
                                        {selectedSale.status}
                                    </Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Sale Date:</Text> {selectedSale.saleDate}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Sale Progress Steps */}
                        <div style={{ marginBottom: 24 }}>
                            <Steps size="small" current={
                                selectedSale.saleStage === 'Reservation' ? 0 :
                                    selectedSale.saleStage === 'Documentation' ? 1 :
                                        selectedSale.saleStage === 'Financing' ? 2 :
                                            selectedSale.saleStage === 'Payment Collection' ? 3 :
                                                selectedSale.saleStage === 'Completed' ? 4 : 0
                            }>
                                <Step title="Reservation" status={selectedSale.saleStage === 'Canceled' ? 'error' : ''} />
                                <Step title="Documentation" status={selectedSale.saleStage === 'Canceled' ? 'error' : ''} />
                                <Step title="Financing" status={selectedSale.saleStage === 'Canceled' ? 'error' : ''} />
                                <Step title="Payment" status={selectedSale.saleStage === 'Canceled' ? 'error' : ''} />
                                <Step title="Completed" status={selectedSale.saleStage === 'Canceled' ? 'error' : ''} />
                            </Steps>
                        </div>

                        {/* Sale Overview */}
                        <Card title="Sale Overview" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Sale Price">KES {selectedSale.salePrice.toLocaleString()}</Descriptions.Item>
                                        <Descriptions.Item label="List Price">KES {selectedSale.listPrice.toLocaleString()}</Descriptions.Item>
                                        <Descriptions.Item label="Discount">
                                            {selectedSale.discount > 0 ? `KES ${selectedSale.discount.toLocaleString()}` : 'None'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Payment Plan">{selectedSale.paymentPlan}</Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Agent">{selectedSale.agent}</Descriptions.Item>
                                        <Descriptions.Item label="Commission">KES {selectedSale.commission.toLocaleString()}</Descriptions.Item>
                                        <Descriptions.Item label="Completion Date">
                                            {selectedSale.completionDate || 'Pending'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Documents">
                                            {selectedSale.documents.join(', ')}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>
                        </Card>

                        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                            <TabPane tab="Payments" key="1">
                                {selectedSale.status !== 'Canceled' && (
                                    <Card style={{ marginBottom: 16 }}>
                                        {(() => {
                                            const stats = calculatePaymentStats(selectedSale);
                                            return (
                                                <>
                                                    <Row gutter={16}>
                                                        <Col span={8}>
                                                            <Statistic
                                                                title="Total Amount"
                                                                value={stats.totalAmount}
                                                                formatter={value => `KES ${value.toLocaleString()}`}
                                                            />
                                                        </Col>
                                                        <Col span={8}>
                                                            <Statistic
                                                                title="Paid Amount"
                                                                value={stats.paidAmount}
                                                                formatter={value => `KES ${value.toLocaleString()}`}
                                                                valueStyle={{ color: '#3f8600' }}
                                                            />
                                                        </Col>
                                                        <Col span={8}>
                                                            <Statistic
                                                                title="Remaining Amount"
                                                                value={stats.remainingAmount + stats.pendingAmount}
                                                                formatter={value => `KES ${value.toLocaleString()}`}
                                                                valueStyle={{ color: '#cf1322' }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <div style={{ marginTop: 16 }}>
                                                        <Progress percent={Math.round(stats.paidPercentage)} status="active" />
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </Card>
                                )}

                                <Table
                                    columns={[
                                        {
                                            title: 'Payment ID',
                                            dataIndex: 'id',
                                            key: 'id',
                                        },
                                        {
                                            title: 'Date',
                                            dataIndex: 'date',
                                            key: 'date',
                                        },
                                        {
                                            title: 'Amount',
                                            dataIndex: 'amount',
                                            key: 'amount',
                                            render: (amount) => `KES ${amount.toLocaleString()}`,
                                        },
                                        {
                                            title: 'Method',
                                            dataIndex: 'method',
                                            key: 'method',
                                        },
                                        {
                                            title: 'Status',
                                            dataIndex: 'status',
                                            key: 'status',
                                            render: (status) => (
                                                <Tag color={
                                                    status === 'Paid' ? 'green' :
                                                        status === 'Pending' ? 'orange' :
                                                            status === 'Refunded' ? 'red' : 'default'
                                                }>
                                                    {status}
                                                </Tag>
                                            ),
                                        },
                                        {
                                            title: 'Reference',
                                            dataIndex: 'reference',
                                            key: 'reference',
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'actions',
                                            render: (text, record) => (
                                                <Space>
                                                    {record.status === 'Pending' && (
                                                        <Button size="small" type="primary">Confirm</Button>
                                                    )}
                                                    <Button size="small">Receipt</Button>
                                                </Space>
                                            ),
                                        },
                                    ]}
                                    dataSource={selectedSale.payments}
                                    rowKey="id"
                                    pagination={false}
                                />

                                {selectedSale.status !== 'Completed' && selectedSale.status !== 'Canceled' && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        style={{ marginTop: 16 }}
                                        onClick={() => handleAddPayment(selectedSale)}
                                    >
                                        Add Payment
                                    </Button>
                                )}
                            </TabPane>

                            <TabPane tab="Timeline" key="2">
                                <Timeline mode="left">
                                    {selectedSale.timeline.map((item, index) => (
                                        <Timeline.Item
                                            key={index}
                                            label={item.date}
                                            color={
                                                item.event === 'Cancellation' || item.event === 'Refund' ? 'red' :
                                                    item.event === 'Sale Agreement' || item.event === 'Final Payment' ? 'green' :
                                                        'blue'
                                            }
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                                            <div>{item.description}</div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                    block
                                >
                                    Add Event
                                </Button>
                            </TabPane>

                            <TabPane tab="Customer Details" key="3">
                                <Card>
                                    <Descriptions title="Customer Information" bordered column={1}>
                                        <Descriptions.Item label="Name">{selectedSale.customer.name}</Descriptions.Item>
                                        <Descriptions.Item label="Contact Number">{selectedSale.customer.contactNumber}</Descriptions.Item>
                                        <Descriptions.Item label="Email">{selectedSale.customer.email}</Descriptions.Item>
                                    </Descriptions>
                                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Space>
                                            <Button icon={<MailOutlined />}>Send Email</Button>
                                            <Button icon={<PhoneOutlined />}>Call</Button>
                                            <Button type="primary" icon={<UserOutlined />}>View Profile</Button>
                                        </Space>
                                    </div>
                                </Card>
                            </TabPane>

                            <TabPane tab="Documents" key="4">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={selectedSale.documents}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                <Button type="link">View</Button>,
                                                <Button type="link">Download</Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<FileTextOutlined />} />}
                                                title={item}
                                                description="Document details would appear here"
                                            />
                                        </List.Item>
                                    )}
                                />
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                >
                                    Upload Document
                                </Button>
                            </TabPane>

                            <TabPane tab="Notes" key="5">
                                <Card>
                                    <Paragraph>{selectedSale.notes || 'No notes available.'}</Paragraph>
                                    <div style={{ marginTop: 16 }}>
                                        <Input.TextArea rows={4} placeholder="Add notes here..." />
                                        <Button type="primary" style={{ marginTop: 8 }}>Save Notes</Button>
                                    </div>
                                </Card>
                            </TabPane>
                        </Tabs>
                    </>
                )}
            </Drawer>

            {/* Add Payment Modal */}
            <Modal
                title={`Add Payment for ${selectedSale?.id || 'Sale'}`}
                visible={addPaymentVisible}
                onOk={() => setAddPaymentVisible(false)}
                onCancel={() => setAddPaymentVisible(false)}
                width={600}
            >
                {selectedSale && (
                    <Form layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Payment Amount (KES)" required>
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter amount"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Payment Date" required>
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Payment Method" required>
                                    <Select style={{ width: '100%' }}>
                                        <Option value="Bank Transfer">Bank Transfer</Option>
                                        <Option value="M-Pesa">M-Pesa</Option>
                                        <Option value="Cash">Cash</Option>
                                        <Option value="Check">Check</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Reference Number">
                                    <Input placeholder="Enter reference number" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Notes">
                            <Input.TextArea rows={4} placeholder="Add payment notes..." />
                        </Form.Item>

                        <Divider />

                        <Card style={{ marginBottom: 16 }} size="small">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Sale Total">KES {selectedSale.salePrice.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Amount Paid">
                                    KES {calculatePaymentStats(selectedSale).paidAmount.toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Remaining Balance">
                                    KES {(selectedSale.salePrice - calculatePaymentStats(selectedSale).paidAmount).toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Form>
                )}
            </Modal>

            {/* Cancel Sale Confirmation Modal */}
            <Modal
                title="Confirm Sale Cancellation"
                visible={deleteModalVisible}
                onOk={handleCancelSale}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Cancel Sale"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to cancel the sale <strong>{saleToDelete?.id}</strong> for property <strong>{saleToDelete?.property.title}</strong>?</p>
                <p>This action will mark the sale as canceled. Any existing payments may need to be refunded separately.</p>
            </Modal>

            {/* Add Sale Modal */}
            <Modal
                title="Create New Sale"
                visible={addSaleVisible}
                onOk={() => setAddSaleVisible(false)}
                onCancel={() => setAddSaleVisible(false)}
                width={800}
                okText="Create Sale"
            >
                <Form layout="vertical">
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Basic Information" key="1">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Select Property" required>
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="Search for property"
                                            optionFilterProp="children"
                                        >
                                            <Option value="p001">P001 - Premium Land Plot in Nairobi</Option>
                                            <Option value="p006">P006 - 1-Bedroom Studio in Kilimani</Option>
                                            <Option value="p007">P007 - Beachfront Land in Diani</Option>
                                            <Option value="p008">P008 - Penthouse in Riverside Drive</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Select Customer" required>
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="Search for customer"
                                            optionFilterProp="children"
                                        >
                                            <Option value="c001">C001 - John Kamau</Option>
                                            <Option value="c003">C003 - Robert Kariuki</Option>
                                            <Option value="c006">C006 - Mercy Akinyi</Option>
                                            <Option value="c007">C007 - Francis Mutua</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Sale Price (KES)" required>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            placeholder="Enter sale price"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="List Price (KES)" required>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            placeholder="Enter list price"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item label="Sale Date" required>
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Payment Plan" required>
                                        <Select style={{ width: '100%' }}>
                                            <Option value="Full Payment">Full Payment</Option>
                                            <Option value="Installment">Installment</Option>
                                            <Option value="Mortgage">Mortgage</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Assigned Agent" required>
                                        <Select style={{ width: '100%' }}>
                                            <Option value="Jane Njeri">Jane Njeri</Option>
                                            <Option value="James Otieno">James Otieno</Option>
                                            <Option value="Peter Kipchoge">Peter Kipchoge</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Notes">
                                <Input.TextArea rows={4} placeholder="Add sales notes..." />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Payment Details" key="2">
                            <Form.Item label="Initial Payment Amount (KES)" required>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Enter initial payment amount"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Payment Date" required>
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Payment Method" required>
                                        <Select style={{ width: '100%' }}>
                                            <Option value="Bank Transfer">Bank Transfer</Option>
                                            <Option value="M-Pesa">M-Pesa</Option>
                                            <Option value="Cash">Cash</Option>
                                            <Option value="Check">Check</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Reference Number">
                                <Input placeholder="Enter reference number" />
                            </Form.Item>

                            <Divider>Installment Schedule</Divider>

                            <Form.Item>
                                <Button type="dashed" block icon={<PlusOutlined />}>
                                    Add Installment
                                </Button>
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Documents" key="3">
                            <Form.Item label="Required Documents">
                                <Checkbox.Group style={{ width: '100%' }}>
                                    <Row>
                                        <Col span={8}>
                                            <Checkbox value="Sale Agreement">Sale Agreement</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Payment Receipt">Payment Receipt</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="ID Copy">ID Copy</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Title Transfer">Title Transfer</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Bank Statement">Bank Statement</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Mortgage Approval">Mortgage Approval</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>

                            <Form.Item label="Upload Documents">
                                <Upload.Dragger multiple listType="picture">
                                    <p className="ant-upload-drag-icon">
                                        <FileDoneOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                    <p className="ant-upload-hint">
                                        Support for single or bulk upload. Strictly prohibited from uploading company data or other
                                        banned files.
                                    </p>
                                </Upload.Dragger>
                            </Form.Item>
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>
        </Layout>
    );
};

// Get the appropriate step status
const getStepStatus = (currentStage, step) => {
    const stages = ['Reservation', 'Documentation', 'Financing', 'Payment Collection', 'Completed'];
    const currentIndex = stages.indexOf(currentStage);
    const stepIndex = stages.indexOf(step);

    if (currentStage === 'Canceled') return 'error';
    if (stepIndex < currentIndex) return 'finish';
    if (stepIndex === currentIndex) return 'process';
    return 'wait';
};

export default SalesManagement;