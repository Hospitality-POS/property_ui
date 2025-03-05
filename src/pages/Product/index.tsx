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
    Descriptions,
    List,
    Avatar,
    Carousel,
    Statistic,
    Upload,
    Timeline
} from 'antd';
import {
    HomeOutlined,
    ShopOutlined,
    SearchOutlined,
    FilterOutlined,
    DownOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    PlusOutlined,
    DollarOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    AreaChartOutlined,
    CalendarOutlined,
    TeamOutlined,
    UserOutlined,
    EyeOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    ApartmentOutlined,
    PictureOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Sample property data (same as in your document)
const propertiesData = [
    {
        id: 'P001',
        title: 'Premium Land Plot in Nairobi',
        type: 'Land',
        size: '0.5 acres',
        location: 'Nairobi West',
        county: 'Nairobi',
        constituency: 'Langata',
        coordinates: '-1.3046, 36.8500',
        price: 5500000,
        status: 'Available',
        description: 'Prime land for residential development in an upscale neighborhood.',
        features: ['Fenced', 'Road Access', 'Electricity Connection', 'Water Connection'],
        documents: ['Title Deed', 'Survey Plan', 'Clearance Certificate'],
        images: [
            'https://via.placeholder.com/800x600?text=Land+Plot+Image+1',
            'https://via.placeholder.com/800x600?text=Land+Plot+Image+2',
            'https://via.placeholder.com/800x600?text=Land+Plot+Image+3'
        ],
        // Additional project details
        projectManager: 'John Kimani',
        dateAdded: '2024-12-10',
        dateUpdated: '2025-02-20',
        salesProgress: 0,
        unitsSold: 0,
        totalUnits: 1,
        totalSales: 0,
        expectedRevenue: 5500000,
        projectPhase: 'Planning',
        completionDate: '2025-08-15',
        developmentCost: 2200000,
        roi: 150,
        salesRate: 'N/A',
        constructionStatus: 'Not Started'
    },
    {
        id: 'P002',
        title: 'Garden City 3-Bedroom Apartment',
        type: 'Apartment',
        size: '150 sq m',
        location: 'Garden City, Thika Road',
        county: 'Nairobi',
        constituency: 'Roysambu',
        coordinates: '-1.2335, 36.8957',
        price: 8900000,
        status: 'Reserved',
        description: 'Luxurious 3-bedroom apartment with modern amenities in a gated community.',
        features: ['3 Bedrooms', '2 Bathrooms', 'Balcony', 'Parking Space', 'Swimming Pool', 'Gym'],
        documents: ['Sale Agreement', 'Floor Plan', 'Building Approval'],
        images: [
            'https://via.placeholder.com/800x600?text=Apartment+Image+1',
            'https://via.placeholder.com/800x600?text=Apartment+Image+2',
            'https://via.placeholder.com/800x600?text=Apartment+Image+3'
        ],
        // Additional project details
        projectManager: 'Sarah Wanjiku',
        dateAdded: '2024-11-15',
        dateUpdated: '2025-02-25',
        salesProgress: 45,
        unitsSold: 9,
        totalUnits: 20,
        totalSales: 80100000,
        expectedRevenue: 178000000,
        projectPhase: 'Construction',
        completionDate: '2025-06-30',
        developmentCost: 120000000,
        roi: 48,
        salesRate: '1.5 units/month',
        constructionStatus: '65% Complete'
    },
    {
        id: 'P003',
        title: 'Commercial Plot in Mombasa Road',
        type: 'Land',
        size: '0.25 acres',
        location: 'Mombasa Road',
        county: 'Nairobi',
        constituency: 'Embakasi South',
        coordinates: '-1.3308, 36.9176',
        price: 3200000,
        status: 'Available',
        description: 'Strategically located commercial plot suitable for business development.',
        features: ['Commercial Zoning', 'High Traffic Area', 'Electricity Connection', 'Water Connection'],
        documents: ['Title Deed', 'Survey Plan', 'Rate Clearance'],
        images: [
            'https://via.placeholder.com/800x600?text=Commercial+Plot+Image+1',
            'https://via.placeholder.com/800x600?text=Commercial+Plot+Image+2'
        ],
        // Additional project details
        projectManager: 'David Maina',
        dateAdded: '2025-01-05',
        dateUpdated: '2025-01-30',
        salesProgress: 0,
        unitsSold: 0,
        totalUnits: 1,
        totalSales: 0,
        expectedRevenue: 3200000,
        projectPhase: 'Marketing',
        completionDate: 'N/A',
        developmentCost: 800000,
        roi: 300,
        salesRate: 'N/A',
        constructionStatus: 'Not Applicable'
    },
    {
        id: 'P004',
        title: 'Mountain View Estate - Phase 1',
        type: 'Development',
        size: '5 acres',
        location: 'Kikuyu',
        county: 'Kiambu',
        constituency: 'Kikuyu',
        coordinates: '-1.2500, 36.7000',
        price: 0, // Price per individual unit varies
        status: 'In Progress',
        description: 'A modern residential development with 25 townhouses in a serene environment.',
        features: ['Gated Community', '3 Bedroom Units', 'Playground', 'Paved Roads', 'Security'],
        documents: ['Master Plan', 'Approvals', 'EIA Certificate'],
        images: [
            'https://via.placeholder.com/800x600?text=Estate+Overview',
            'https://via.placeholder.com/800x600?text=Sample+House',
            'https://via.placeholder.com/800x600?text=Compound'
        ],
        // Additional project details
        projectManager: 'Samuel Odhiambo',
        dateAdded: '2024-09-15',
        dateUpdated: '2025-03-01',
        salesProgress: 68,
        unitsSold: 17,
        totalUnits: 25,
        totalSales: 102000000,
        expectedRevenue: 150000000,
        projectPhase: 'Construction',
        completionDate: '2025-07-30',
        developmentCost: 90000000,
        roi: 66,
        salesRate: '2.1 units/month',
        constructionStatus: '70% Complete',
        // Unit details
        unitTypes: [
            { type: 'Type A', size: '150 sq m', bedrooms: 3, price: 6000000, available: 3, reserved: 2, sold: 3 },
            { type: 'Type B', size: '180 sq m', bedrooms: 3, price: 6500000, available: 2, reserved: 1, sold: 4 },
            { type: 'Type C', size: '200 sq m', bedrooms: 4, price: 7000000, available: 3, reserved: 0, sold: 7 }
        ],
        // Timeline
        timeline: [
            { date: '2024-09-15', event: 'Project Initiated' },
            { date: '2024-10-20', event: 'Approvals Obtained' },
            { date: '2024-11-05', event: 'Construction Started' },
            { date: '2025-01-15', event: 'Phase 1 Foundation Complete' },
            { date: '2025-03-01', event: 'Structural Work 70% Complete' }
        ]
    },
    {
        id: 'P005',
        title: 'Sunrise Heights Apartments',
        type: 'Development',
        size: '0.8 acres',
        location: 'Kilimani',
        county: 'Nairobi',
        constituency: 'Dagoretti North',
        coordinates: '-1.2898, 36.7769',
        price: 0, // Price per individual unit varies
        status: 'In Progress',
        description: 'Luxury apartment complex with 40 units offering modern living in the heart of Kilimani.',
        features: ['Rooftop Pool', 'Gym', 'Secure Parking', '24/7 Security', 'Backup Generator'],
        documents: ['Building Plans', 'Approvals', 'Sales Agreements'],
        images: [
            'https://via.placeholder.com/800x600?text=Building+Render',
            'https://via.placeholder.com/800x600?text=Sample+Apartment',
            'https://via.placeholder.com/800x600?text=Rooftop+Area'
        ],
        // Additional project details
        projectManager: 'Elizabeth Owino',
        dateAdded: '2024-08-10',
        dateUpdated: '2025-02-28',
        salesProgress: 55,
        unitsSold: 22,
        totalUnits: 40,
        totalSales: 198000000,
        expectedRevenue: 360000000,
        projectPhase: 'Construction',
        completionDate: '2025-09-15',
        developmentCost: 250000000,
        roi: 44,
        salesRate: '3.1 units/month',
        constructionStatus: '60% Complete',
        // Unit details
        unitTypes: [
            { type: 'Studio', size: '45 sq m', bedrooms: 0, price: 4500000, available: 3, reserved: 2, sold: 5 },
            { type: '1 Bedroom', size: '65 sq m', bedrooms: 1, price: 6500000, available: 5, reserved: 2, sold: 8 },
            { type: '2 Bedroom', size: '85 sq m', bedrooms: 2, price: 8500000, available: 4, reserved: 1, sold: 5 },
            { type: '3 Bedroom', size: '120 sq m', bedrooms: 3, price: 12000000, available: 2, reserved: 1, sold: 2 }
        ],
        // Timeline
        timeline: [
            { date: '2024-08-10', event: 'Project Initiated' },
            { date: '2024-09-05', event: 'Approvals Obtained' },
            { date: '2024-10-15', event: 'Construction Started' },
            { date: '2025-01-10', event: 'Foundation Complete' },
            { date: '2025-02-28', event: 'Structural Work 60% Complete' }
        ]
    }
];

const PropertyTable = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [viewProperty, setViewProperty] = useState(null);
    const [viewProject, setViewProject] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [propertyType, setPropertyType] = useState('all');
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newPropertyType, setNewPropertyType] = useState('Land');

    // New property form state
    const [newProperty, setNewProperty] = useState({
        title: '',
        type: 'Land',
        size: '',
        location: '',
        county: '',
        constituency: '',
        coordinates: '',
        price: 0,
        status: 'Available',
        description: '',
        features: [],
        documents: [],
        projectManager: '',
        totalUnits: 1
    });

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <a onClick={() => handleViewProperty(record)}>{text}</a>
            ),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                let color = 'blue';
                if (type === 'Land') color = 'green';
                if (type === 'Development') color = 'purple';
                return (
                    <Tag color={color}>
                        {type}
                    </Tag>
                );
            },
            filters: [
                { text: 'Land', value: 'Land' },
                { text: 'Apartment', value: 'Apartment' },
                { text: 'Development', value: 'Development' },
            ],
            onFilter: (value, record) => record.type === value,
            width: 120,
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
            width: 100,
        },
        {
            title: 'Price (KES)',
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => {
                if (record.type === 'Development') {
                    return 'Various';
                }
                return price > 0 ? price.toLocaleString() : 'N/A';
            },
            sorter: (a, b) => a.price - b.price,
            width: 120,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'Reserved') color = 'orange';
                if (status === 'Sold') color = 'red';
                if (status === 'In Progress') color = 'blue';
                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            },
            filters: [
                { text: 'Available', value: 'Available' },
                { text: 'Reserved', value: 'Reserved' },
                { text: 'Sold', value: 'Sold' },
                { text: 'In Progress', value: 'In Progress' },
            ],
            onFilter: (value, record) => record.status === value,
            width: 120,
        },
        {
            title: 'Project Manager',
            dataIndex: 'projectManager',
            key: 'projectManager',
        },
        {
            title: 'Sales Progress',
            dataIndex: 'salesProgress',
            key: 'salesProgress',
            render: (progress, record) => {
                if (record.type === 'Development') {
                    return `${progress}%`;
                }
                if (record.status === 'Sold') {
                    return '100%';
                }
                if (record.status === 'Reserved') {
                    return '50%';
                }
                return '0%';
            },
            width: 120,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {record.type === 'Development' ? (
                        <Button
                            icon={<BarChartOutlined />}
                            size="small"
                            onClick={() => handleViewProject(record)}
                            title="View Project Details"
                        />
                    ) : (
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewProperty(record)}
                            title="View Property Details"
                        />
                    )}
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditProperty(record)}
                        title="Edit Property"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => showDeleteConfirm(record)}
                        title="Delete Property"
                    />
                </Space>
            ),
            width: 120,
        },
    ];

    // Handle view property
    const handleViewProperty = (property) => {
        setViewProperty(property);
        setViewProject(null);
    };

    // Handle view project
    const handleViewProject = (project) => {
        setViewProject(project);
        setViewProperty(null);
    };

    // Handle edit property
    const handleEditProperty = (property) => {
        // In a real app, this would open a form to edit the property
        console.log('Edit property:', property);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (property) => {
        setPropertyToDelete(property);
        setDeleteModalVisible(true);
    };

    // Handle delete property
    const handleDeleteProperty = () => {
        // In a real app, this would call an API to delete the property
        console.log('Delete property:', propertyToDelete);
        setDeleteModalVisible(false);
        setPropertyToDelete(null);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle property type filter
    const handlePropertyTypeChange = (value) => {
        setPropertyType(value);
    };

    // Show add property modal
    const showAddModal = () => {
        setAddModalVisible(true);
    };

    // Handle add property form changes
    const handleNewPropertyChange = (e) => {
        const { name, value } = e.target;
        setNewProperty({
            ...newProperty,
            [name]: value
        });
    };

    // Handle add property submission
    const handleAddProperty = () => {
        // In a real app, this would call an API to add the property
        const today = new Date().toISOString().split('T')[0];
        const newId = `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const propertyToAdd = {
            ...newProperty,
            id: newId,
            dateAdded: today,
            dateUpdated: today,
            salesProgress: 0,
            unitsSold: 0,
            images: ['https://via.placeholder.com/800x600?text=Property+Image'],
            totalSales: 0,
            expectedRevenue: newProperty.type === 'Development' ? 0 : newProperty.price
        };

        console.log('Add property:', propertyToAdd);
        setAddModalVisible(false);

        // Reset form
        setNewProperty({
            title: '',
            type: 'Land',
            size: '',
            location: '',
            county: '',
            constituency: '',
            coordinates: '',
            price: 0,
            status: 'Available',
            description: '',
            features: [],
            documents: [],
            projectManager: '',
            totalUnits: 1
        });
    };

    // Handle new property type change
    const handleNewPropertyTypeChange = (value) => {
        setNewPropertyType(value);
        setNewProperty({
            ...newProperty,
            type: value,
            features: [],
            documents: []
        });
    };

    // Filter properties based on search text and property type
    const filteredProperties = propertiesData.filter(
        (property) =>
            (propertyType === 'all' || property.type === propertyType) &&
            (property.title.toLowerCase().includes(searchText.toLowerCase()) ||
                property.location.toLowerCase().includes(searchText.toLowerCase()) ||
                property.id.toLowerCase().includes(searchText.toLowerCase()) ||
                property.projectManager.toLowerCase().includes(searchText.toLowerCase()))
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
                    {viewProperty || viewProject ? (
                        <Button
                            onClick={() => { setViewProperty(null); setViewProject(null); }}
                            icon={<ArrowLeftOutlined />}
                        >
                            Back to Properties
                        </Button>
                    ) : (
                        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                            Add Property
                        </Button>
                    )}
                </Space>
            </Header>

            <Content style={{ margin: '16px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: 16 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>Properties</Breadcrumb.Item>
                        {viewProperty && <Breadcrumb.Item>{viewProperty.title}</Breadcrumb.Item>}
                        {viewProject && <Breadcrumb.Item>{viewProject.title}</Breadcrumb.Item>}
                    </Breadcrumb>
                </div>

                {viewProperty ? (
                    // Single Property View
                    <PropertyView property={viewProperty} onBack={() => setViewProperty(null)} />
                ) : viewProject ? (
                    // Single Project View
                    <ProjectView project={viewProject} onBack={() => setViewProject(null)} />
                ) : (
                    // Properties Table View
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <Title level={3}>Property Portfolio</Title>
                                <Text type="secondary">Manage your real estate inventory</Text>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <Row gutter={16} style={{ marginTop: 16, marginBottom: 16 }}>
                            <Col xs={24} sm={18} md={20} lg={20}>
                                <Input
                                    placeholder="Search properties by title, location, ID, or project manager..."
                                    prefix={<SearchOutlined />}
                                    onChange={handleSearch}
                                    value={searchText}
                                    allowClear
                                />
                            </Col>
                            <Col xs={24} sm={6} md={4} lg={4}>
                                <Select
                                    style={{ width: '100%' }}
                                    value={propertyType}
                                    onChange={handlePropertyTypeChange}
                                >
                                    <Option value="all">All Types</Option>
                                    <Option value="Land">Land</Option>
                                    <Option value="Apartment">Apartments</Option>
                                    <Option value="Development">Developments</Option>
                                </Select>
                            </Col>
                        </Row>

                        {/* Properties Table */}
                        <Table
                            columns={columns}
                            dataSource={filteredProperties}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 1200 }}
                            expandable={{
                                expandedRowRender: record => (
                                    <p style={{ margin: 0 }}>
                                        <strong>Description:</strong> {record.description}
                                    </p>
                                ),
                            }}
                        />
                    </>
                )}
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Real Estate Management System ©2025
            </Footer>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={deleteModalVisible}
                onOk={handleDeleteProperty}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete <strong>{propertyToDelete?.title}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>

            {/* Add Property Modal */}
            <Modal
                title="Add New Property"
                visible={addModalVisible}
                onOk={handleAddProperty}
                onCancel={() => setAddModalVisible(false)}
                width={800}
                okText="Add Property"
            >
                <Form layout="vertical">
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Basic Information" key="1">
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Form.Item label="Property Title" required>
                                        <Input
                                            name="title"
                                            value={newProperty.title}
                                            onChange={handleNewPropertyChange}
                                            placeholder="Enter property title"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Property Type" required>
                                        <Select
                                            value={newPropertyType}
                                            onChange={handleNewPropertyTypeChange}
                                            style={{ width: '100%' }}
                                        >
                                            <Option value="Land">Land</Option>
                                            <Option value="Apartment">Apartment</Option>
                                            <Option value="Development">Development Project</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Size">
                                        <Input
                                            name="size"
                                            value={newProperty.size}
                                            onChange={handleNewPropertyChange}
                                            placeholder={newPropertyType === 'Land' ? 'e.g., 0.5 acres' : 'e.g., 120 sq m'}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Price (KES)" required>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={0}
                                            step={100000}
                                            value={newProperty.price}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            onChange={(value) => setNewProperty({ ...newProperty, price: value })}
                                            disabled={newPropertyType === 'Development'}
                                        />
                                        {newPropertyType === 'Development' && (
                                            <Text type="secondary">Price will be set per unit type</Text>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Location" required>
                                        <Input
                                            name="location"
                                            value={newProperty.location}
                                            onChange={handleNewPropertyChange}
                                            placeholder="Area/neighborhood"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Status">
                                        <Select
                                            value={newProperty.status}
                                            onChange={(value) => setNewProperty({ ...newProperty, status: value })}
                                            style={{ width: '100%' }}
                                        >
                                            <Option value="Available">Available</Option>
                                            <Option value="Reserved">Reserved</Option>
                                            <Option value="Sold">Sold</Option>
                                            {newPropertyType === 'Development' && (
                                                <Option value="In Progress">In Progress</Option>
                                            )}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item label="County">
                                        <Input
                                            name="county"
                                            value={newProperty.county}
                                            onChange={handleNewPropertyChange}
                                            placeholder="County name"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Constituency">
                                        <Input
                                            name="constituency"
                                            value={newProperty.constituency}
                                            onChange={handleNewPropertyChange}
                                            placeholder="Constituency name"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="GPS Coordinates">
                                        <Input
                                            name="coordinates"
                                            value={newProperty.coordinates}
                                            onChange={handleNewPropertyChange}
                                            placeholder="e.g., -1.2921, 36.8219"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Project Manager">
                                <Input
                                    name="projectManager"
                                    value={newProperty.projectManager}
                                    onChange={handleNewPropertyChange}
                                    placeholder="Name of project manager"
                                />
                            </Form.Item>

                            {newPropertyType === 'Development' && (
                                <Form.Item label="Total Units">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={1}
                                        value={newProperty.totalUnits}
                                        onChange={(value) => setNewProperty({ ...newProperty, totalUnits: value })}
                                    />
                                </Form.Item>
                            )}

                            <Form.Item label="Description">
                                <Input.TextArea
                                    rows={4}
                                    name="description"
                                    value={newProperty.description}
                                    onChange={handleNewPropertyChange}
                                    placeholder="Detailed description of the property..."
                                />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Features & Documents" key="2">
                            <Form.Item label="Features">
                                <Select
                                    mode="tags"
                                    style={{ width: '100%' }}
                                    placeholder="Add property features"
                                    value={newProperty.features}
                                    onChange={(values) => setNewProperty({ ...newProperty, features: values })}
                                >
                                    {newPropertyType === 'Land' && (
                                        <>
                                            <Option value="Fenced">Fenced</Option>
                                            <Option value="Road Access">Road Access</Option>
                                            <Option value="Electricity Connection">Electricity Connection</Option>
                                            <Option value="Water Connection">Water Connection</Option>
                                            <Option value="Commercial Zoning">Commercial Zoning</Option>
                                            <Option value="Residential Zoning">Residential Zoning</Option>
                                        </>
                                    )}

                                    {newPropertyType === 'Apartment' && (
                                        <>
                                            <Option value="1 Bedroom">1 Bedroom</Option>
                                            <Option value="2 Bedrooms">2 Bedrooms</Option>
                                            <Option value="3 Bedrooms">3 Bedrooms</Option>
                                            <Option value="Balcony">Balcony</Option>
                                            <Option value="Parking Space">Parking Space</Option>
                                            <Option value="Swimming Pool">Swimming Pool</Option>
                                            <Option value="Gym">Gym</Option>
                                            <Option value="Security">Security</Option>
                                            <Option value="Furnished">Furnished</Option>
                                        </>
                                    )}

                                    {newPropertyType === 'Development' && (
                                        <>
                                            <Option value="Gated Community">Gated Community</Option>
                                            <Option value="24/7 Security">24/7 Security</Option>
                                            <Option value="Playground">Playground</Option>
                                            <Option value="Swimming Pool">Swimming Pool</Option>
                                            <Option value="Gym">Gym</Option>
                                            <Option value="Parking">Parking</Option>
                                            <Option value="Backup Generator">Backup Generator</Option>
                                            <Option value="CCTV Surveillance">CCTV Surveillance</Option>
                                        </>
                                    )}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Required Documents">
                                <Select
                                    mode="tags"
                                    style={{ width: '100%' }}
                                    placeholder="Add required documents"
                                    value={newProperty.documents}
                                    onChange={(values) => setNewProperty({ ...newProperty, documents: values })}
                                >
                                    {newPropertyType === 'Land' && (
                                        <>
                                            <Option value="Title Deed">Title Deed</Option>
                                            <Option value="Survey Plan">Survey Plan</Option>
                                            <Option value="Clearance Certificate">Clearance Certificate</Option>
                                            <Option value="Land Rates Receipt">Land Rates Receipt</Option>
                                        </>
                                    )}

                                    {newPropertyType === 'Apartment' && (
                                        <>
                                            <Option value="Sale Agreement">Sale Agreement</Option>
                                            <Option value="Floor Plan">Floor Plan</Option>
                                            <Option value="Building Approval">Building Approval</Option>
                                            <Option value="Completion Certificate">Completion Certificate</Option>
                                        </>
                                    )}

                                    {newPropertyType === 'Development' && (
                                        <>
                                            <Option value="Master Plan">Master Plan</Option>
                                            <Option value="Building Approvals">Building Approvals</Option>
                                            <Option value="EIA Certificate">EIA Certificate</Option>
                                            <Option value="Project Schedule">Project Schedule</Option>
                                            <Option value="Sales Brochure">Sales Brochure</Option>
                                        </>
                                    )}
                                </Select>
                            </Form.Item>

                            {newPropertyType === 'Development' && (
                                <>
                                    <Divider orientation="left">Project Information</Divider>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Project Phase">
                                                <Select
                                                    style={{ width: '100%' }}
                                                    placeholder="Select project phase"
                                                    onChange={(value) => setNewProperty({ ...newProperty, projectPhase: value })}
                                                >
                                                    <Option value="Planning">Planning</Option>
                                                    <Option value="Design">Design</Option>
                                                    <Option value="Approvals">Approvals</Option>
                                                    <Option value="Marketing">Marketing</Option>
                                                    <Option value="Construction">Construction</Option>
                                                    <Option value="Handover">Handover</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Construction Status">
                                                <Input
                                                    placeholder="e.g., 50% Complete"
                                                    onChange={(e) => setNewProperty({ ...newProperty, constructionStatus: e.target.value })}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Expected Completion Date">
                                                <Input
                                                    placeholder="YYYY-MM-DD"
                                                    onChange={(e) => setNewProperty({ ...newProperty, completionDate: e.target.value })}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Development Cost (KES)">
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    step={1000000}
                                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                    onChange={(value) => setNewProperty({ ...newProperty, developmentCost: value })}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </TabPane>

                        <TabPane tab="Images" key="3">
                            <Form.Item label="Property Images">
                                <Upload.Dragger listType="picture-card" multiple>
                                    <p className="ant-upload-drag-icon">
                                        <PictureOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag files to this area to upload</p>
                                    <p className="ant-upload-hint">
                                        Support for multiple images. Please upload clear photos of the property.
                                    </p>
                                </Upload.Dragger>
                            </Form.Item>
                        </TabPane>

                        {newPropertyType === 'Development' && (
                            <TabPane tab="Unit Types" key="4">
                                <Button type="dashed" block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                                    Add Unit Type
                                </Button>
                                <Text type="secondary">
                                    For development projects, you can add different unit types with their details and pricing.
                                    This will be available after saving the project.
                                </Text>
                            </TabPane>
                        )}
                    </Tabs>
                </Form>
            </Modal>
        </Layout>
    );
};

// Property View Component
const PropertyView = ({ property, onBack }) => {
    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'green';
            case 'Reserved': return 'orange';
            case 'Sold': return 'red';
            default: return 'default';
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3}>{property.title}</Title>
                <Space>
                    <Tag color={property.type === 'Land' ? 'green' : 'blue'} style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {property.type}
                    </Tag>
                    <Tag color={getStatusColor(property.status)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {property.status}
                    </Tag>
                </Space>
            </div>

            {/* Property Images */}
            <Card style={{ marginBottom: 24 }}>
                <Carousel autoplay>
                    {property.images.map((image, index) => (
                        <div key={index}>
                            <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img
                                    src={image}
                                    alt={`${property.title} - Image ${index + 1}`}
                                    style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    ))}
                </Carousel>
            </Card>

            {/* Property Details */}
            <Row gutter={24}>
                <Col xs={24} md={16}>
                    <Card title="Property Details" style={{ marginBottom: 24 }}>
                        <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="Property ID">{property.id}</Descriptions.Item>
                            <Descriptions.Item label="Type">{property.type}</Descriptions.Item>
                            <Descriptions.Item label="Size">{property.size}</Descriptions.Item>
                            <Descriptions.Item label="Location">{property.location}</Descriptions.Item>
                            <Descriptions.Item label="County">{property.county}</Descriptions.Item>
                            <Descriptions.Item label="Constituency">{property.constituency}</Descriptions.Item>
                            <Descriptions.Item label="GPS Coordinates">{property.coordinates}</Descriptions.Item>
                            <Descriptions.Item label="Status" span={2}>
                                <Tag color={getStatusColor(property.status)}>
                                    {property.status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Price" span={3}>
                                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                    KES {property.price.toLocaleString()}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Description</Divider>
                        <Paragraph>{property.description}</Paragraph>

                        <Divider orientation="left">Features</Divider>
                        <div>
                            {property.features.map((feature, index) => (
                                <Tag key={index} color="blue" style={{ margin: '0 8px 8px 0' }}>
                                    <CheckCircleOutlined /> {feature}
                                </Tag>
                            ))}
                        </div>

                        <Divider orientation="left">Required Documents</Divider>
                        <div>
                            {property.documents.map((document, index) => (
                                <Tag key={index} color="purple" style={{ margin: '0 8px 8px 0' }}>
                                    <FileTextOutlined /> {document}
                                </Tag>
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card title="Location Map" style={{ marginBottom: 24 }}>
                        <div style={{ background: '#f0f0f0', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Text type="secondary">Map would be displayed here</Text>
                        </div>
                        <List style={{ marginTop: 16 }}>
                            <List.Item>
                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                {property.location}
                            </List.Item>
                            <List.Item>
                                <Text>{property.county} County, {property.constituency} Constituency</Text>
                            </List.Item>
                            <List.Item>
                                <Text>GPS: {property.coordinates}</Text>
                            </List.Item>
                        </List>
                    </Card>

                    <Card title="Project Information" style={{ marginBottom: 24 }}>
                        <List>
                            <List.Item>
                                <Text><UserOutlined /> Manager: {property.projectManager}</Text>
                            </List.Item>
                            <List.Item>
                                <Text><CalendarOutlined /> Added: {property.dateAdded}</Text>
                            </List.Item>
                            <List.Item>
                                <Text><ClockCircleOutlined /> Last Updated: {property.dateUpdated}</Text>
                            </List.Item>
                        </List>
                    </Card>

                    <Card title="Actions" style={{ marginBottom: 24 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button type="primary" block icon={<DollarOutlined />}>
                                {property.status === 'Available' ? 'Reserve Property' :
                                    property.status === 'Reserved' ? 'Process Payment' : 'View Transaction'}
                            </Button>
                            <Button block icon={<EditOutlined />}>
                                Edit Property
                            </Button>
                            <Button danger block icon={<DeleteOutlined />}>
                                Delete Property
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Project View Component
const ProjectView = ({ project, onBack }) => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3}>{project.title}</Title>
                <Space>
                    <Tag color="purple" style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {project.type}
                    </Tag>
                    <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {project.status}
                    </Tag>
                </Space>
            </div>

            {/* Project Images */}
            <Card style={{ marginBottom: 24 }}>
                <Carousel autoplay>
                    {project.images.map((image, index) => (
                        <div key={index}>
                            <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img
                                    src={image}
                                    alt={`${project.title} - Image ${index + 1}`}
                                    style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    ))}
                </Carousel>
            </Card>

            {/* Project Overview */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Sales Progress"
                            value={project.salesProgress}
                            suffix="%"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Units Sold"
                            value={`${project.unitsSold}/${project.totalUnits}`}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Sales (KES)"
                            value={project.totalSales}
                            precision={0}
                            formatter={value => `${value.toLocaleString()}`}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Expected Revenue (KES)"
                            value={project.expectedRevenue}
                            precision={0}
                            formatter={value => `${value.toLocaleString()}`}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Project Details Tabs */}
            <Card>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Project Details" key="1">
                        <Row gutter={24}>
                            <Col xs={24} md={16}>
                                <Descriptions title="Project Information" bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                                    <Descriptions.Item label="Project ID">{project.id}</Descriptions.Item>
                                    <Descriptions.Item label="Location">{project.location}</Descriptions.Item>
                                    <Descriptions.Item label="Size">{project.size}</Descriptions.Item>
                                    <Descriptions.Item label="County">{project.county}</Descriptions.Item>
                                    <Descriptions.Item label="Constituency">{project.constituency}</Descriptions.Item>
                                    <Descriptions.Item label="GPS Coordinates">{project.coordinates}</Descriptions.Item>
                                    <Descriptions.Item label="Project Phase">{project.projectPhase}</Descriptions.Item>
                                    <Descriptions.Item label="Construction Status">{project.constructionStatus}</Descriptions.Item>
                                    <Descriptions.Item label="Completion Date">{project.completionDate}</Descriptions.Item>
                                    <Descriptions.Item label="Project Manager">{project.projectManager}</Descriptions.Item>
                                    <Descriptions.Item label="Date Added">{project.dateAdded}</Descriptions.Item>
                                    <Descriptions.Item label="Last Updated">{project.dateUpdated}</Descriptions.Item>
                                </Descriptions>

                                <Divider orientation="left">Description</Divider>
                                <Paragraph>{project.description}</Paragraph>

                                <Divider orientation="left">Features & Amenities</Divider>
                                <div>
                                    {project.features.map((feature, index) => (
                                        <Tag key={index} color="blue" style={{ margin: '0 8px 8px 0' }}>
                                            <CheckCircleOutlined /> {feature}
                                        </Tag>
                                    ))}
                                </div>
                            </Col>

                            <Col xs={24} md={8}>
                                <Card title="Financial Summary" style={{ marginBottom: 24 }}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Development Cost">
                                            KES {project.developmentCost.toLocaleString()}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Expected Revenue">
                                            KES {project.expectedRevenue.toLocaleString()}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Return on Investment">
                                            {project.roi}%
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Sales Rate">
                                            {project.salesRate}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                <Card title="Location Map" style={{ marginBottom: 24 }}>
                                    <div style={{ background: '#f0f0f0', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text type="secondary">Map would be displayed here</Text>
                                    </div>
                                    <List style={{ marginTop: 16 }}>
                                        <List.Item>
                                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                                            {project.location}
                                        </List.Item>
                                        <List.Item>
                                            <Text>{project.county} County, {project.constituency} Constituency</Text>
                                        </List.Item>
                                        <List.Item>
                                            <Text>GPS: {project.coordinates}</Text>
                                        </List.Item>
                                    </List>
                                </Card>

                                <Card title="Actions">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Button type="primary" block icon={<BarChartOutlined />}>
                                            Sales Report
                                        </Button>
                                        <Button block icon={<TeamOutlined />}>
                                            Manage Team
                                        </Button>
                                        <Button block icon={<CalendarOutlined />}>
                                            Project Timeline
                                        </Button>
                                        <Button block icon={<EditOutlined />}>
                                            Edit Project
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="Unit Types & Inventory" key="2">
                        {project.unitTypes && (
                            <Table
                                dataSource={project.unitTypes}
                                rowKey="type"
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Unit Type',
                                        dataIndex: 'type',
                                        key: 'type',
                                    },
                                    {
                                        title: 'Size',
                                        dataIndex: 'size',
                                        key: 'size',
                                    },
                                    {
                                        title: 'Bedrooms',
                                        dataIndex: 'bedrooms',
                                        key: 'bedrooms',
                                    },
                                    {
                                        title: 'Price (KES)',
                                        dataIndex: 'price',
                                        key: 'price',
                                        render: price => price.toLocaleString()
                                    },
                                    {
                                        title: 'Available',
                                        dataIndex: 'available',
                                        key: 'available',
                                        render: value => <Tag color="green">{value}</Tag>
                                    },
                                    {
                                        title: 'Reserved',
                                        dataIndex: 'reserved',
                                        key: 'reserved',
                                        render: value => <Tag color="orange">{value}</Tag>
                                    },
                                    {
                                        title: 'Sold',
                                        dataIndex: 'sold',
                                        key: 'sold',
                                        render: value => <Tag color="red">{value}</Tag>
                                    },
                                    {
                                        title: 'Actions',
                                        key: 'actions',
                                        render: () => (
                                            <Space>
                                                <Button size="small">View</Button>
                                                <Button size="small" type="primary">Manage</Button>
                                            </Space>
                                        )
                                    }
                                ]}
                            />
                        )}
                    </TabPane>

                    <TabPane tab="Project Timeline" key="3">
                        {project.timeline && (
                            <div style={{ padding: '20px 0' }}>
                                <Row>
                                    <Col span={24} md={16}>
                                        <Card title="Project Milestones">
                                            <Timeline mode="left">
                                                {project.timeline.map((item, index) => (
                                                    <Timeline.Item key={index} label={item.date}>
                                                        {item.event}
                                                    </Timeline.Item>
                                                ))}
                                                <Timeline.Item label={project.completionDate} color="green">
                                                    Expected Completion
                                                </Timeline.Item>
                                            </Timeline>
                                        </Card>
                                    </Col>
                                    <Col span={24} md={8}>
                                        <Card title="Construction Progress" style={{ marginBottom: 16 }}>
                                            <Statistic
                                                title={project.constructionStatus}
                                                value={parseInt(project.constructionStatus.split('%')[0]) || 0}
                                                prefix={<ApartmentOutlined />}
                                                suffix="%"
                                            />
                                            <div style={{ marginTop: 16 }}>
                                                <Text type="secondary">Expected Completion:</Text>
                                                <div>{project.completionDate}</div>
                                            </div>
                                        </Card>
                                        <Card title="Sales Timeline">
                                            <div style={{ marginBottom: 16 }}>
                                                <Text type="secondary">Sales Rate:</Text>
                                                <div>{project.salesRate}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Sales Progress:</Text>
                                                <div>{project.salesProgress}% ({project.unitsSold}/{project.totalUnits} units)</div>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </TabPane>

                    <TabPane tab="Documents" key="4">
                        <Row gutter={16}>
                            <Col span={24}>
                                <List
                                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                                    dataSource={project.documents}
                                    renderItem={document => (
                                        <List.Item>
                                            <Card
                                                hoverable
                                                actions={[
                                                    <Button type="link" icon={<EyeOutlined />}>View</Button>,
                                                    <Button type="link" icon={<FileTextOutlined />}>Download</Button>
                                                ]}
                                            >
                                                <Card.Meta
                                                    avatar={<FileTextOutlined style={{ fontSize: 36, color: '#1890ff' }} />}
                                                    title={document}
                                                    description="Document description and details would appear here."
                                                />
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default PropertyTable;