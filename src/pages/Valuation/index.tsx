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
    Upload,
    Rate,
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
    TeamOutlined,
    BarChartOutlined,
    PieChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FileSearchOutlined,
    ScissorOutlined,
    ApartmentOutlined,
    AuditOutlined,
    FileExcelOutlined,
    MailOutlined,
    PhoneOutlined,
    CrownOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Sample valuations data
const valuationsData = [
    {
        id: 'V001',
        property: {
            id: 'P002',
            title: 'Garden City 3-Bedroom Apartment',
            type: 'Apartment',
            location: 'Garden City, Thika Road',
            size: '150 sq m'
        },
        client: {
            id: 'C001',
            name: 'John Kamau',
            contactNumber: '+254 712 345 678',
            email: 'john.kamau@example.com',
            type: 'Individual'
        },
        purpose: 'Sale',
        requestDate: '2025-01-05',
        completionDate: '2025-01-15',
        status: 'Completed',
        valuer: 'Daniel Omondi',
        valuationFee: 45000,
        marketValue: 8900000,
        forcedSaleValue: 7500000,
        methodology: ['Market Approach', 'Income Approach'],
        report: 'Valuation_Report_V001.pdf',
        notes: 'Property in good condition with premium finishes.',
        timeline: [
            { date: '2025-01-05', event: 'Request Received', description: 'Valuation request submitted by client' },
            { date: '2025-01-08', event: 'Site Visit', description: 'Valuer inspected the property and took measurements' },
            { date: '2025-01-12', event: 'Draft Report', description: 'Preliminary valuation report prepared' },
            { date: '2025-01-15', event: 'Final Report', description: 'Final valuation report issued to client' }
        ],
        comparableProperties: [
            { id: 'CP001', address: 'Garden City, Unit B7', size: '145 sq m', price: 8500000 },
            { id: 'CP002', address: 'Garden City, Unit D3', size: '155 sq m', price: 9200000 },
            { id: 'CP003', address: 'Garden City, Unit A9', size: '150 sq m', price: 8700000 }
        ],
        documents: ['Property Deed', 'Floor Plan', 'Property Photos', 'Final Valuation Report'],
        propertyRatings: {
            location: 4,
            condition: 4,
            accessibility: 5,
            amenities: 4,
            infrastructure: 4
        }
    },
    {
        id: 'V002',
        property: {
            id: 'P003',
            title: 'Commercial Plot in Mombasa Road',
            type: 'Land',
            location: 'Mombasa Road',
            size: '0.25 acres'
        },
        client: {
            id: 'C002',
            name: 'Sarah Wanjiku',
            contactNumber: '+254 723 456 789',
            email: 'sarah.wanjiku@example.com',
            type: 'Individual'
        },
        purpose: 'Mortgage',
        requestDate: '2025-02-10',
        completionDate: '2025-02-25',
        status: 'Completed',
        valuer: 'Daniel Omondi',
        valuationFee: 35000,
        marketValue: 3200000,
        forcedSaleValue: 2700000,
        methodology: ['Market Approach', 'Cost Approach'],
        report: 'Valuation_Report_V002.pdf',
        notes: 'Prime commercial plot with good visibility and access.',
        timeline: [
            { date: '2025-02-10', event: 'Request Received', description: 'Valuation request submitted by client' },
            { date: '2025-02-15', event: 'Site Visit', description: 'Valuer inspected the land and surrounding area' },
            { date: '2025-02-20', event: 'Draft Report', description: 'Preliminary valuation report prepared' },
            { date: '2025-02-25', event: 'Final Report', description: 'Final valuation report issued to client' }
        ],
        comparableProperties: [
            { id: 'CP004', address: 'Mombasa Road, Plot 123', size: '0.22 acres', price: 2900000 },
            { id: 'CP005', address: 'Mombasa Road, Plot 156', size: '0.27 acres', price: 3400000 },
            { id: 'CP006', address: 'Mombasa Road, Plot 189', size: '0.25 acres', price: 3100000 }
        ],
        documents: ['Land Title', 'Survey Plan', 'Land Photos', 'Final Valuation Report'],
        propertyRatings: {
            location: 5,
            accessibility: 4,
            infrastructure: 3,
            zoning: 5,
            topography: 4
        }
    },
    {
        id: 'V003',
        property: {
            id: 'P006',
            title: '1-Bedroom Studio in Kilimani',
            type: 'Apartment',
            location: 'Kilimani',
            size: '75 sq m'
        },
        client: {
            id: 'C003',
            name: 'Robert Kariuki',
            contactNumber: '+254 734 567 890',
            email: 'robert.kariuki@example.com',
            type: 'Individual'
        },
        purpose: 'Insurance',
        requestDate: '2025-02-20',
        completionDate: null,
        status: 'In Progress',
        valuer: 'Faith Muthoni',
        valuationFee: 30000,
        marketValue: null,
        forcedSaleValue: null,
        methodology: ['Market Approach'],
        report: null,
        notes: 'Awaiting inspection and comparable property analysis.',
        timeline: [
            { date: '2025-02-20', event: 'Request Received', description: 'Valuation request submitted by client' },
            { date: '2025-03-05', event: 'Site Visit Scheduled', description: 'Property inspection planned' }
        ],
        comparableProperties: [],
        documents: ['Property Deed', 'Floor Plan'],
        propertyRatings: {
            location: 0,
            condition: 0,
            accessibility: 0,
            amenities: 0,
            infrastructure: 0
        }
    },
    {
        id: 'V004',
        property: {
            id: 'P005',
            title: 'Agricultural Land in Thika',
            type: 'Land',
            location: 'Thika Road',
            size: '0.8 acres'
        },
        client: {
            id: 'B001',
            name: 'KCB Bank',
            contactNumber: '+254 745 678 901',
            email: 'mortgages@kcbbank.com',
            type: 'Institution'
        },
        purpose: 'Mortgage',
        requestDate: '2025-03-01',
        completionDate: null,
        status: 'Pending Inspection',
        valuer: 'Faith Muthoni',
        valuationFee: 40000,
        marketValue: null,
        forcedSaleValue: null,
        methodology: [],
        report: null,
        notes: 'Bank requires urgent valuation for mortgage application.',
        timeline: [
            { date: '2025-03-01', event: 'Request Received', description: 'Valuation request submitted by bank' },
            { date: '2025-03-08', event: 'Site Visit Scheduled', description: 'Property inspection planned' }
        ],
        comparableProperties: [],
        documents: ['Land Title', 'Survey Plan'],
        propertyRatings: {
            location: 0,
            accessibility: 0,
            infrastructure: 0,
            zoning: 0,
            topography: 0
        }
    },
    {
        id: 'V005',
        property: {
            id: 'P008',
            title: 'Penthouse in Riverside Drive',
            type: 'Apartment',
            location: 'Riverside Drive',
            size: '230 sq m'
        },
        client: {
            id: 'B002',
            name: 'Equity Bank',
            contactNumber: '+254 756 789 012',
            email: 'valuations@equitybank.com',
            type: 'Institution'
        },
        purpose: 'Mortgage',
        requestDate: '2025-02-15',
        completionDate: '2025-03-01',
        status: 'Completed',
        valuer: 'Daniel Omondi',
        valuationFee: 60000,
        marketValue: 18500000,
        forcedSaleValue: 15500000,
        methodology: ['Market Approach', 'Income Approach', 'Cost Approach'],
        report: 'Valuation_Report_V005.pdf',
        notes: 'Premium property with high-end finishes and amenities.',
        timeline: [
            { date: '2025-02-15', event: 'Request Received', description: 'Valuation request submitted by bank' },
            { date: '2025-02-20', event: 'Site Visit', description: 'Valuer inspected the property and amenities' },
            { date: '2025-02-25', event: 'Draft Report', description: 'Preliminary valuation report prepared' },
            { date: '2025-03-01', event: 'Final Report', description: 'Final valuation report issued to client' }
        ],
        comparableProperties: [
            { id: 'CP007', address: 'Riverside Drive, PH3', size: '220 sq m', price: 17800000 },
            { id: 'CP008', address: 'Riverside Drive, PH7', size: '245 sq m', price: 19500000 },
            { id: 'CP009', address: 'Westlands, PH2', size: '230 sq m', price: 18200000 }
        ],
        documents: ['Property Deed', 'Floor Plan', 'Property Photos', 'Final Valuation Report', 'Building Approval'],
        propertyRatings: {
            location: 5,
            condition: 5,
            accessibility: 4,
            amenities: 5,
            infrastructure: 5
        }
    }
];

const ValuationManagement = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedValuation, setSelectedValuation] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [addValuationVisible, setAddValuationVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [valuationToDelete, setValuationToDelete] = useState(null);
    const [valuationStatusFilter, setValuationStatusFilter] = useState('all');
    const [valuationPurposeFilter, setValuationPurposeFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // Table columns for valuations list
    const columns = [
        {
            title: 'Valuation ID',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: 120,
            render: (text, record) => (
                <a onClick={() => handleViewValuation(record)}>{text}</a>
            ),
            sorter: (a, b) => a.id.localeCompare(b.id),
        },
        {
            title: 'Property',
            dataIndex: ['property', 'title'],
            key: 'property',
            width: 200,
            sorter: (a, b) => a.property.title.localeCompare(b.property.title),
        },
        {
            title: 'Type',
            dataIndex: ['property', 'type'],
            key: 'type',
            width: 100,
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
            title: 'Client',
            dataIndex: ['client', 'name'],
            key: 'client',
            width: 150,
            render: (text, record) => (
                <span>
                    {text} {record.client.type === 'Institution' && <CrownOutlined style={{ color: '#faad14' }} />}
                </span>
            ),
            sorter: (a, b) => a.client.name.localeCompare(b.client.name),
        },
        {
            title: 'Purpose',
            dataIndex: 'purpose',
            key: 'purpose',
            width: 120,
            filters: [
                { text: 'Sale', value: 'Sale' },
                { text: 'Mortgage', value: 'Mortgage' },
                { text: 'Insurance', value: 'Insurance' },
                { text: 'Tax', value: 'Tax' },
            ],
            onFilter: (value, record) => record.purpose === value,
            render: purpose => (
                <Tag color={
                    purpose === 'Sale' ? 'blue' :
                        purpose === 'Mortgage' ? 'green' :
                            purpose === 'Insurance' ? 'purple' : 'orange'
                }>
                    {purpose}
                </Tag>
            ),
        },
        {
            title: 'Request Date',
            dataIndex: 'requestDate',
            key: 'requestDate',
            width: 120,
            sorter: (a, b) => new Date(a.requestDate) - new Date(b.requestDate),
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => {
                let color = 'default';
                if (status === 'Pending Inspection') color = 'orange';
                if (status === 'In Progress') color = 'blue';
                if (status === 'Completed') color = 'green';
                if (status === 'Canceled') color = 'red';

                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            },
            filters: [
                { text: 'Pending Inspection', value: 'Pending Inspection' },
                { text: 'In Progress', value: 'In Progress' },
                { text: 'Completed', value: 'Completed' },
                { text: 'Canceled', value: 'Canceled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Valuer',
            dataIndex: 'valuer',
            key: 'valuer',
            width: 130,
            filters: [
                { text: 'Daniel Omondi', value: 'Daniel Omondi' },
                { text: 'Faith Muthoni', value: 'Faith Muthoni' },
            ],
            onFilter: (value, record) => record.valuer === value,
        },
        {
            title: 'Market Value (KES)',
            dataIndex: 'marketValue',
            key: 'marketValue',
            width: 160,
            render: (value) => value ? value.toLocaleString() : <Text type="secondary">Pending</Text>,
            sorter: (a, b) => {
                if (!a.marketValue) return 1;
                if (!b.marketValue) return -1;
                return a.marketValue - b.marketValue;
            },
        },
        {
            title: 'Fee (KES)',
            dataIndex: 'valuationFee',
            key: 'valuationFee',
            width: 120,
            render: (fee) => fee.toLocaleString(),
            sorter: (a, b) => a.valuationFee - b.valuationFee,
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<FileSearchOutlined />}
                            size="small"
                            onClick={() => handleViewValuation(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditValuation(record)}
                            disabled={record.status === 'Completed'}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            disabled={record.status === 'Completed'}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handle view valuation
    const handleViewValuation = (valuation) => {
        setSelectedValuation(valuation);
        setDrawerVisible(true);
    };

    // Handle edit valuation
    const handleEditValuation = (valuation) => {
        // In a real app, this would open a form to edit the valuation
        console.log('Edit valuation:', valuation);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (valuation) => {
        setValuationToDelete(valuation);
        setDeleteModalVisible(true);
    };

    // Handle delete valuation
    const handleDeleteValuation = () => {
        // In a real app, this would call an API to delete the valuation
        console.log('Delete valuation:', valuationToDelete);
        setDeleteModalVisible(false);
        setValuationToDelete(null);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Calculate valuation totals
    const getTotalValuationFee = () => {
        return valuationsData.reduce((total, valuation) => total + valuation.valuationFee, 0);
    };

    const getTotalPropertyValue = () => {
        return valuationsData
            .filter(valuation => valuation.marketValue)
            .reduce((total, valuation) => total + valuation.marketValue, 0);
    };

    const getCompletedValuationsCount = () => {
        return valuationsData.filter(valuation => valuation.status === 'Completed').length;
    };

    const getPendingValuationsCount = () => {
        return valuationsData.filter(valuation =>
            valuation.status !== 'Completed' && valuation.status !== 'Canceled'
        ).length;
    };

    // Filter valuations based on search text and filters
    const filteredValuations = valuationsData.filter(
        (valuation) => {
            const matchesSearch =
                valuation.id.toLowerCase().includes(searchText.toLowerCase()) ||
                valuation.property.title.toLowerCase().includes(searchText.toLowerCase()) ||
                valuation.client.name.toLowerCase().includes(searchText.toLowerCase()) ||
                valuation.valuer.toLowerCase().includes(searchText.toLowerCase());

            const matchesStatus = valuationStatusFilter === 'all' || valuation.status === valuationStatusFilter;
            const matchesPurpose = valuationPurposeFilter === 'all' || valuation.purpose === valuationPurposeFilter;

            let matchesDateRange = true;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const requestDate = new Date(valuation.requestDate);
                const startDate = new Date(dateRange[0]);
                const endDate = new Date(dateRange[1]);
                matchesDateRange = requestDate >= startDate && requestDate <= endDate;
            }

            return matchesSearch && matchesStatus && matchesPurpose && matchesDateRange;
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddValuationVisible(true)}>
                        Request Valuation
                    </Button>
                </Space>
            </Header>

            <Content style={{ margin: '16px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: 16 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>Valuations</Breadcrumb.Item>
                    </Breadcrumb>
                    <Title level={3} style={{ marginTop: 8, marginBottom: 16 }}>Property Valuation Management</Title>
                </div>

                {/* Valuation Statistics Cards */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Property Value"
                                value={getTotalPropertyValue()}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<BankOutlined />}
                                formatter={value => `KES ${value.toLocaleString()}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Completed Valuations"
                                value={getCompletedValuationsCount()}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<CheckCircleOutlined />}
                                suffix={`/ ${valuationsData.length}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Pending Valuations"
                                value={getPendingValuationsCount()}
                                valueStyle={{ color: '#faad14' }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Valuation Fees"
                                value={getTotalValuationFee()}
                                valueStyle={{ color: '#722ed1' }}
                                prefix={<DollarOutlined />}
                                formatter={value => `KES ${value.toLocaleString()}`}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Search and Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={24} md={6}>
                        <Input
                            placeholder="Search by ID, property, client or valuer..."
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
                            onChange={value => setValuationStatusFilter(value)}
                        >
                            <Option value="all">All Statuses</Option>
                            <Option value="Pending Inspection">Pending Inspection</Option>
                            <Option value="In Progress">In Progress</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Canceled">Canceled</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by Purpose"
                            defaultValue="all"
                            onChange={value => setValuationPurposeFilter(value)}
                        >
                            <Option value="all">All Purposes</Option>
                            <Option value="Sale">Sale</Option>
                            <Option value="Mortgage">Mortgage</Option>
                            <Option value="Insurance">Insurance</Option>
                            <Option value="Tax">Tax</Option>
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
                            </Menu>
                        }>
                            <Button style={{ width: '100%' }}>
                                <ExportOutlined /> Export <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Col>
                </Row>

                {/* Valuations Table */}
                <Table
                    columns={columns}
                    dataSource={filteredValuations}
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

                        let totalFee = 0;
                        let totalValue = 0;

                        pageData.forEach(({ valuationFee, marketValue }) => {
                            totalFee += valuationFee;
                            totalValue += marketValue || 0;
                        });

                        return (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={8}><strong>Page Total</strong></Table.Summary.Cell>
                                    <Table.Summary.Cell index={8}>
                                        <Text type="danger">KES {totalValue.toLocaleString()}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={9}>
                                        <Text type="danger">KES {totalFee.toLocaleString()}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={10}></Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        );
                    }}
                />
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Real Estate Management System ©2025
            </Footer>

            {/* Valuation Details Drawer */}
            <Drawer
                title={selectedValuation ? `Valuation Details: ${selectedValuation.id}` : 'Valuation Details'}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                width={700}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        {selectedValuation && selectedValuation.status === 'Completed' && (
                            <Button type="primary" icon={<FileTextOutlined />} style={{ marginRight: 8 }}>
                                Download Report
                            </Button>
                        )}
                        <Button onClick={() => setDrawerVisible(false)}>Close</Button>
                    </div>
                }
            >
                {selectedValuation && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Title level={4}>{selectedValuation.property.title}</Title>
                                    <Space direction="vertical">
                                        <Text><HomeOutlined style={{ marginRight: 8 }} />{selectedValuation.property.type} - {selectedValuation.property.size}</Text>
                                        <Text><EnvironmentOutlined style={{ marginRight: 8 }} />{selectedValuation.property.location}</Text>
                                        <Text><UserOutlined style={{ marginRight: 8 }} />Client: {selectedValuation.client.name}</Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    <Tag color={
                                        selectedValuation.status === 'Pending Inspection' ? 'orange' :
                                            selectedValuation.status === 'In Progress' ? 'blue' :
                                                selectedValuation.status === 'Completed' ? 'green' : 'red'
                                    } style={{ fontSize: '14px', padding: '4px 8px' }}>
                                        {selectedValuation.status}
                                    </Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Request Date:</Text> {selectedValuation.requestDate}
                                    </div>
                                    {selectedValuation.completionDate && (
                                        <div style={{ marginTop: 4 }}>
                                            <Text strong>Completion Date:</Text> {selectedValuation.completionDate}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Valuation Progress Steps */}
                        <div style={{ marginBottom: 24 }}>
                            <Steps size="small" current={
                                selectedValuation.status === 'Pending Inspection' ? 0 :
                                    selectedValuation.status === 'In Progress' ? 1 :
                                        selectedValuation.status === 'Completed' ? 2 : 0
                            }>
                                <Step title="Inspection" />
                                <Step title="Valuation" />
                                <Step title="Report" />
                            </Steps>
                        </div>

                        {/* Valuation Overview */}
                        <Card title="Valuation Overview" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Valuation Purpose">{selectedValuation.purpose}</Descriptions.Item>
                                        <Descriptions.Item label="Valuer">{selectedValuation.valuer}</Descriptions.Item>
                                        <Descriptions.Item label="Valuation Fee">KES {selectedValuation.valuationFee.toLocaleString()}</Descriptions.Item>
                                        <Descriptions.Item label="Methodology">
                                            {selectedValuation.methodology.join(', ') || 'Not determined yet'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Market Value">
                                            {selectedValuation.marketValue ? `KES ${selectedValuation.marketValue.toLocaleString()}` : 'Pending'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Forced Sale Value">
                                            {selectedValuation.forcedSaleValue ? `KES ${selectedValuation.forcedSaleValue.toLocaleString()}` : 'Pending'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Report">
                                            {selectedValuation.report || 'Not available yet'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Documents">
                                            {selectedValuation.documents.length} documents
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>
                        </Card>

                        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                            <TabPane tab="Property Details" key="1">
                                <Card title="Property Information" style={{ marginBottom: 16 }}>
                                    <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                                        <Descriptions.Item label="Property ID">{selectedValuation.property.id}</Descriptions.Item>
                                        <Descriptions.Item label="Property Type">{selectedValuation.property.type}</Descriptions.Item>
                                        <Descriptions.Item label="Size">{selectedValuation.property.size}</Descriptions.Item>
                                        <Descriptions.Item label="Location">{selectedValuation.property.location}</Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                {selectedValuation.status !== 'Pending Inspection' && (
                                    <Card title="Property Ratings" style={{ marginBottom: 16 }}>
                                        <Row gutter={16}>
                                            {Object.entries(selectedValuation.propertyRatings).map(([key, value]) => (
                                                <Col span={12} key={key} style={{ marginBottom: 16 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ textTransform: 'capitalize' }}>{key}:</Text>
                                                        <Rate disabled defaultValue={value} />
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Card>
                                )}

                                {selectedValuation.comparableProperties.length > 0 && (
                                    <Card title="Comparable Properties" style={{ marginBottom: 16 }}>
                                        <Table
                                            columns={[
                                                {
                                                    title: 'ID',
                                                    dataIndex: 'id',
                                                    key: 'id',
                                                },
                                                {
                                                    title: 'Address',
                                                    dataIndex: 'address',
                                                    key: 'address',
                                                },
                                                {
                                                    title: 'Size',
                                                    dataIndex: 'size',
                                                    key: 'size',
                                                },
                                                {
                                                    title: 'Price (KES)',
                                                    dataIndex: 'price',
                                                    key: 'price',
                                                    render: price => price.toLocaleString(),
                                                },
                                            ]}
                                            dataSource={selectedValuation.comparableProperties}
                                            rowKey="id"
                                            pagination={false}
                                            size="small"
                                        />
                                    </Card>
                                )}
                            </TabPane>

                            <TabPane tab="Timeline" key="2">
                                <Timeline mode="left">
                                    {selectedValuation.timeline.map((item, index) => (
                                        <Timeline.Item
                                            key={index}
                                            label={item.date}
                                            color={
                                                item.event === 'Final Report' ? 'green' :
                                                    item.event === 'Draft Report' ? 'blue' :
                                                        item.event === 'Site Visit' ? 'blue' :
                                                            'gray'
                                            }
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                                            <div>{item.description}</div>
                                        </Timeline.Item>
                                    ))}

                                    {selectedValuation.status !== 'Completed' && selectedValuation.status !== 'Canceled' && (
                                        <Timeline.Item label="Upcoming" color="gray" dot={<ClockCircleOutlined />}>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {selectedValuation.status === 'Pending Inspection' ? 'Site Inspection' : 'Finalize Report'}
                                            </div>
                                            <div>Scheduled activity in the valuation process</div>
                                        </Timeline.Item>
                                    )}
                                </Timeline>

                                {selectedValuation.status !== 'Completed' && selectedValuation.status !== 'Canceled' && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        style={{ marginTop: 16 }}
                                        block
                                    >
                                        Add Event
                                    </Button>
                                )}
                            </TabPane>

                            <TabPane tab="Client Details" key="3">
                                <Card>
                                    <Descriptions title="Client Information" bordered column={1}>
                                        <Descriptions.Item label="Name">{selectedValuation.client.name}</Descriptions.Item>
                                        <Descriptions.Item label="Client Type">
                                            <Tag color={selectedValuation.client.type === 'Institution' ? 'gold' : 'blue'}>
                                                {selectedValuation.client.type}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Contact Number">{selectedValuation.client.contactNumber}</Descriptions.Item>
                                        <Descriptions.Item label="Email">{selectedValuation.client.email}</Descriptions.Item>
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
                                    dataSource={selectedValuation.documents}
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
                                {selectedValuation.status !== 'Completed' && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        style={{ marginTop: 16 }}
                                    >
                                        Upload Document
                                    </Button>
                                )}
                            </TabPane>

                            <TabPane tab="Notes" key="5">
                                <Card>
                                    <Paragraph>{selectedValuation.notes || 'No notes available.'}</Paragraph>
                                    {selectedValuation.status !== 'Completed' && (
                                        <div style={{ marginTop: 16 }}>
                                            <Input.TextArea rows={4} placeholder="Add notes here..." />
                                            <Button type="primary" style={{ marginTop: 8 }}>Save Notes</Button>
                                        </div>
                                    )}
                                </Card>
                            </TabPane>
                        </Tabs>
                    </>
                )}
            </Drawer>

            {/* Request Valuation Modal */}
            <Modal
                title="Request Property Valuation"
                visible={addValuationVisible}
                onOk={() => setAddValuationVisible(false)}
                onCancel={() => setAddValuationVisible(false)}
                width={800}
                okText="Submit Request"
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
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Select Client" required>
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="Search for client"
                                            optionFilterProp="children"
                                        >
                                            <Option value="c001">C001 - John Kamau (Individual)</Option>
                                            <Option value="c003">C003 - Robert Kariuki (Individual)</Option>
                                            <Option value="b001">B001 - KCB Bank (Institution)</Option>
                                            <Option value="b002">B002 - Equity Bank (Institution)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Valuation Purpose" required>
                                        <Select style={{ width: '100%' }}>
                                            <Option value="Sale">Sale</Option>
                                            <Option value="Mortgage">Mortgage</Option>
                                            <Option value="Insurance">Insurance</Option>
                                            <Option value="Tax">Tax</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Assigned Valuer" required>
                                        <Select style={{ width: '100%' }}>
                                            <Option value="Daniel Omondi">Daniel Omondi</Option>
                                            <Option value="Faith Muthoni">Faith Muthoni</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Request Date" required>
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Valuation Fee (KES)" required>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            placeholder="Enter fee amount"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Special Instructions">
                                <Input.TextArea rows={4} placeholder="Any special requirements or instructions..." />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Required Documents" key="2">
                            <Form.Item label="Required Documents">
                                <Checkbox.Group style={{ width: '100%' }}>
                                    <Row>
                                        <Col span={8}>
                                            <Checkbox value="Property Deed">Property Deed/Title</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Floor Plan">Floor Plan</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Property Photos">Property Photos</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Survey Plan">Survey Plan</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Land Certificate">Land Certificate</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Building Approval">Building Approval</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>

                            <Form.Item label="Upload Documents">
                                <Upload.Dragger multiple listType="picture">
                                    <p className="ant-upload-drag-icon">
                                        <FileDoneOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag documents to this area to upload</p>
                                    <p className="ant-upload-hint">
                                        Upload any existing documents for the property valuation.
                                    </p>
                                </Upload.Dragger>
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Methodology" key="3">
                            <Form.Item label="Valuation Methodology">
                                <Checkbox.Group style={{ width: '100%' }}>
                                    <Row>
                                        <Col span={12}>
                                            <Checkbox value="Market Approach">Market Approach</Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox value="Income Approach">Income Approach</Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox value="Cost Approach">Cost Approach</Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox value="Residual Method">Residual Method</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>

                            <Form.Item label="Additional Notes on Methodology">
                                <Input.TextArea rows={4} placeholder="Any specific requirements for the valuation approach..." />
                            </Form.Item>
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={deleteModalVisible}
                onOk={handleDeleteValuation}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete the valuation <strong>{valuationToDelete?.id}</strong> for property <strong>{valuationToDelete?.property.title}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </Layout>
    );
};

export default ValuationManagement;