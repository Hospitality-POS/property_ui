import React, { useState } from 'react';
import {
    Layout,
    Card,
    Table,
    Tag,
    Space,
    Button,
    Input,
    Row,
    Col,
    Typography,
    Breadcrumb,
    Dropdown,
    Menu,
    Modal,
    Avatar,
    Divider,
    Tabs,
    Timeline,
    Badge,
    Tooltip,
    Form,
    Select
} from 'antd';
import {
    UserOutlined,
    SearchOutlined,
    FilterOutlined,
    DownOutlined,
    EditOutlined,
    DeleteOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    FileTextOutlined,
    CalendarOutlined,
    DollarOutlined,
    MessageOutlined,
    EnvironmentOutlined,
    IdcardOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Sample customer data
const customersData = [
    {
        id: '1',
        name: 'John Kamau',
        contactNumber: '+254 712 345 678',
        email: 'john.kamau@example.com',
        location: 'Nairobi',
        idNumber: 'ID12345678',
        leadSource: 'Website',
        status: 'Active',
        dateAdded: '2024-11-15',
        lastContact: '2025-02-28',
        assignedAgent: 'Jane Njeri',
        properties: [
            { id: 'P001', type: 'Land', location: 'Nairobi', status: 'Purchased', price: 5500000 }
        ],
        payments: [
            { id: 'PMT001', date: '2024-12-01', amount: 1500000, status: 'Paid' },
            { id: 'PMT002', date: '2025-01-01', amount: 500000, status: 'Paid' },
            { id: 'PMT003', date: '2025-02-01', amount: 500000, status: 'Paid' },
            { id: 'PMT004', date: '2025-03-01', amount: 500000, status: 'Due' }
        ],
        documents: [
            { id: 'DOC001', name: 'ID Copy', type: 'Identity', dateUploaded: '2024-11-16' },
            { id: 'DOC002', name: 'Sales Agreement', type: 'Contract', dateUploaded: '2024-12-02' }
        ],
        communications: [
            { id: 'COM001', date: '2024-11-20', type: 'Phone Call', summary: 'Initial discussion about property options', agent: 'Jane Njeri' },
            { id: 'COM002', date: '2024-11-25', type: 'Site Visit', summary: 'Visited Plot #A123 in Nairobi', agent: 'Jane Njeri' },
            { id: 'COM003', date: '2024-12-01', type: 'Meeting', summary: 'Signed agreement for Plot #A123', agent: 'Jane Njeri' },
            { id: 'COM004', date: '2025-02-28', type: 'Email', summary: 'Reminder about March payment', agent: 'Jane Njeri' }
        ]
    },
    {
        id: '2',
        name: 'Sarah Wanjiku',
        contactNumber: '+254 723 456 789',
        email: 'sarah.wanjiku@example.com',
        location: 'Mombasa',
        idNumber: 'ID23456789',
        leadSource: 'Referral',
        status: 'Active',
        dateAdded: '2025-01-05',
        lastContact: '2025-02-25',
        assignedAgent: 'James Otieno',
        properties: [
            { id: 'P005', type: 'Apartment', location: 'Garden City', status: 'Reserved', price: 8900000 }
        ],
        payments: [
            { id: 'PMT005', date: '2025-01-15', amount: 2000000, status: 'Paid' },
            { id: 'PMT006', date: '2025-02-15', amount: 800000, status: 'Paid' },
            { id: 'PMT007', date: '2025-03-15', amount: 800000, status: 'Due' }
        ],
        documents: [
            { id: 'DOC003', name: 'ID Copy', type: 'Identity', dateUploaded: '2025-01-06' },
            { id: 'DOC004', name: 'Reservation Form', type: 'Contract', dateUploaded: '2025-01-16' }
        ],
        communications: [
            { id: 'COM005', date: '2025-01-10', type: 'Phone Call', summary: 'Discussed apartment options', agent: 'James Otieno' },
            { id: 'COM006', date: '2025-01-12', type: 'Site Visit', summary: 'Viewed apartments at Garden City', agent: 'James Otieno' },
            { id: 'COM007', date: '2025-01-15', type: 'Meeting', summary: 'Signed reservation agreement', agent: 'James Otieno' },
            { id: 'COM008', date: '2025-02-25', type: 'SMS', summary: 'Payment reminder', agent: 'James Otieno' }
        ]
    },
    {
        id: '3',
        name: 'David Maina',
        contactNumber: '+254 734 567 890',
        email: 'david.maina@example.com',
        location: 'Nakuru',
        idNumber: 'ID34567890',
        leadSource: 'Exhibition',
        status: 'Lead',
        dateAdded: '2025-02-10',
        lastContact: '2025-03-01',
        assignedAgent: 'Peter Kipchoge',
        properties: [],
        payments: [],
        documents: [
            { id: 'DOC005', name: 'ID Copy', type: 'Identity', dateUploaded: '2025-02-11' }
        ],
        communications: [
            { id: 'COM009', date: '2025-02-10', type: 'Exhibition', summary: 'Met at the Real Estate Expo', agent: 'Peter Kipchoge' },
            { id: 'COM010', date: '2025-02-20', type: 'Phone Call', summary: 'Follow-up call about land options', agent: 'Peter Kipchoge' },
            { id: 'COM011', date: '2025-03-01', type: 'Email', summary: 'Sent property catalogs', agent: 'Peter Kipchoge' }
        ]
    },
    {
        id: '4',
        name: 'Elizabeth Owino',
        contactNumber: '+254 745 678 901',
        email: 'elizabeth.owino@example.com',
        location: 'Nairobi',
        idNumber: 'ID45678901',
        leadSource: 'Social Media',
        status: 'Inactive',
        dateAdded: '2024-09-18',
        lastContact: '2024-12-15',
        assignedAgent: 'Jane Njeri',
        properties: [
            { id: 'P008', type: 'Land', location: 'Thika Road', status: 'Cancelled', price: 3500000 }
        ],
        payments: [
            { id: 'PMT008', date: '2024-10-01', amount: 500000, status: 'Paid' },
            { id: 'PMT009', date: '2024-11-01', amount: 300000, status: 'Paid' }
        ],
        documents: [
            { id: 'DOC006', name: 'ID Copy', type: 'Identity', dateUploaded: '2024-09-19' },
            { id: 'DOC007', name: 'Cancellation Form', type: 'Contract', dateUploaded: '2024-12-16' }
        ],
        communications: [
            { id: 'COM012', date: '2024-09-20', type: 'Phone Call', summary: 'Initial consultation', agent: 'Jane Njeri' },
            { id: 'COM013', date: '2024-10-01', type: 'Meeting', summary: 'Signed preliminary agreement', agent: 'Jane Njeri' },
            { id: 'COM014', date: '2024-12-15', type: 'Meeting', summary: 'Discussed cancellation of purchase', agent: 'Jane Njeri' }
        ]
    },
    {
        id: '5',
        name: 'Robert Kariuki',
        contactNumber: '+254 756 789 012',
        email: 'robert.kariuki@example.com',
        location: 'Kisumu',
        idNumber: 'ID56789012',
        leadSource: 'Website',
        status: 'Active',
        dateAdded: '2025-01-25',
        lastContact: '2025-02-28',
        assignedAgent: 'Peter Kipchoge',
        properties: [
            { id: 'P010', type: 'Land', location: 'Kisumu', status: 'Purchased', price: 4200000 }
        ],
        payments: [
            { id: 'PMT010', date: '2025-01-30', amount: 1200000, status: 'Paid' },
            { id: 'PMT011', date: '2025-02-28', amount: 500000, status: 'Paid' },
            { id: 'PMT012', date: '2025-03-30', amount: 500000, status: 'Due' }
        ],
        documents: [
            { id: 'DOC008', name: 'ID Copy', type: 'Identity', dateUploaded: '2025-01-26' },
            { id: 'DOC009', name: 'Sales Agreement', type: 'Contract', dateUploaded: '2025-01-31' }
        ],
        communications: [
            { id: 'COM015', date: '2025-01-25', type: 'Online Form', summary: 'Submitted inquiry through website', agent: 'System' },
            { id: 'COM016', date: '2025-01-27', type: 'Phone Call', summary: 'Initial discussion', agent: 'Peter Kipchoge' },
            { id: 'COM017', date: '2025-01-30', type: 'Meeting', summary: 'Signed agreement for Plot in Kisumu', agent: 'Peter Kipchoge' },
            { id: 'COM018', date: '2025-02-28', type: 'SMS', summary: 'Payment confirmation', agent: 'System' }
        ]
    }
];

const CustomersList = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [viewCustomer, setViewCustomer] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        contactNumber: '',
        email: '',
        location: '',
        idNumber: '',
        leadSource: 'Website',
        status: 'Lead'
    });

    // Table columns for customer list
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <a onClick={() => handleViewCustomer(record)}>{text}</a>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Contact',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Lead Source',
            dataIndex: 'leadSource',
            key: 'leadSource',
            render: (source) => (
                <Tag color={
                    source === 'Website' ? 'blue' :
                        source === 'Referral' ? 'green' :
                            source === 'Exhibition' ? 'purple' :
                                source === 'Social Media' ? 'cyan' : 'default'
                }>
                    {source}
                </Tag>
            ),
            filters: [
                { text: 'Website', value: 'Website' },
                { text: 'Referral', value: 'Referral' },
                { text: 'Exhibition', value: 'Exhibition' },
                { text: 'Social Media', value: 'Social Media' },
            ],
            onFilter: (value, record) => record.leadSource === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'Active' ? 'green' :
                        status === 'Lead' ? 'blue' :
                            status === 'Inactive' ? 'red' : 'default'
                }>
                    {status}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Lead', value: 'Lead' },
                { text: 'Inactive', value: 'Inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Last Contact',
            dataIndex: 'lastContact',
            key: 'lastContact',
            sorter: (a, b) => new Date(a.lastContact) - new Date(b.lastContact),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditCustomer(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => showDeleteConfirm(record)}
                    />
                </Space>
            ),
        },
    ];

    // Handle view customer
    const handleViewCustomer = (customer) => {
        setViewCustomer(customer);
    };

    // Handle edit customer
    const handleEditCustomer = (customer) => {
        // In a real app, this would open a form to edit the customer
        console.log('Edit customer:', customer);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (customer) => {
        setCustomerToDelete(customer);
        setDeleteModalVisible(true);
    };

    // Handle delete customer
    const handleDeleteCustomer = () => {
        // In a real app, this would call an API to delete the customer
        console.log('Delete customer:', customerToDelete);
        setDeleteModalVisible(false);
        setCustomerToDelete(null);
    };

    // Handle add customer modal
    const showAddModal = () => {
        setAddModalVisible(true);
    };

    // Handle add customer form changes
    const handleNewCustomerChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({
            ...newCustomer,
            [name]: value
        });
    };

    // Handle select changes for dropdown fields
    const handleSelectChange = (value, fieldName) => {
        setNewCustomer({
            ...newCustomer,
            [fieldName]: value
        });
    };

    // Handle add customer submission
    const handleAddCustomer = () => {
        // In a real app, this would call an API to add the customer
        console.log('Add customer:', newCustomer);

        // Generate a new ID for demo purposes
        const newId = String(customersData.length + 1);
        const today = new Date().toISOString().split('T')[0];

        const customerToAdd = {
            ...newCustomer,
            id: newId,
            dateAdded: today,
            lastContact: today,
            assignedAgent: 'Jane Njeri', // Default agent for demo
            properties: [],
            payments: [],
            documents: [],
            communications: [
                {
                    id: `COM${Math.floor(Math.random() * 1000)}`,
                    date: today,
                    type: 'System',
                    summary: 'Customer added to the system',
                    agent: 'System'
                }
            ]
        };

        // Reset form and close modal
        setAddModalVisible(false);
        setNewCustomer({
            name: '',
            contactNumber: '',
            email: '',
            location: '',
            idNumber: '',
            leadSource: 'Website',
            status: 'Lead'
        });
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Filter customers based on search text
    const filteredCustomers = customersData.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.contactNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.location.toLowerCase().includes(searchText.toLowerCase())
    );

    // Menu for filter dropdown
    const filterMenu = (
        <Menu>
            <Menu.Item key="1">All Customers</Menu.Item>
            <Menu.Item key="2">Active Customers</Menu.Item>
            <Menu.Item key="3">Leads</Menu.Item>
            <Menu.Item key="4">Inactive Customers</Menu.Item>
            <Menu.Divider />
            <Menu.Item key="5">Recent Additions</Menu.Item>
            <Menu.Item key="6">Recent Contacts</Menu.Item>
        </Menu>
    );

    return (
        <>
           

                <Space className="mb-4">
                    {viewCustomer ? (
                        <Button onClick={() => setViewCustomer(null)} icon={<ArrowLeftOutlined />}>
                            Back to List
                        </Button>
                    ) : (
                        <Button type="primary" onClick={showAddModal}>Add New Customer</Button>
                    )}
                </Space>
           

           

                {viewCustomer ? (
                    // Single Customer View
                    <CustomerView customer={viewCustomer} onBack={() => setViewCustomer(null)} />
                ) : (
                    // Customers List View
                    <>
                        <Title level={3}>Customers</Title>
                        <Text type="secondary">Manage your customers and leads</Text>

                        {/* Search and Filter */}
                        <Row gutter={16} style={{ marginTop: 16, marginBottom: 16 }}>
                            <Col xs={24} sm={16} md={18} lg={20}>
                                <Input
                                    placeholder="Search customers..."
                                    prefix={<SearchOutlined />}
                                    onChange={handleSearch}
                                    value={searchText}
                                    allowClear
                                />
                            </Col>
                            <Col xs={24} sm={8} md={6} lg={4}>
                                <Dropdown overlay={filterMenu} trigger={['click']}>
                                    <Button block>
                                        <Space>
                                            <FilterOutlined />
                                            Filter
                                            <DownOutlined />
                                        </Space>
                                    </Button>
                                </Dropdown>
                            </Col>
                        </Row>

                        {/* Customers Table */}
                        <Table
                            columns={columns}
                            dataSource={filteredCustomers}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </>
                )}
          

           

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={deleteModalVisible}
                onOk={handleDeleteCustomer}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete {customerToDelete?.name}?</p>
                <p>This action cannot be undone.</p>
            </Modal>

            {/* Add Customer Modal */}
            <Modal
                title="Add New Customer"
                visible={addModalVisible}
                onOk={handleAddCustomer}
                onCancel={() => setAddModalVisible(false)}
                width={700}
                okText="Add Customer"
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Full Name" required>
                                <Input
                                    name="name"
                                    value={newCustomer.name}
                                    onChange={handleNewCustomerChange}
                                    placeholder="Enter customer full name"
                                    prefix={<UserOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="ID Number" required>
                                <Input
                                    name="idNumber"
                                    value={newCustomer.idNumber}
                                    onChange={handleNewCustomerChange}
                                    placeholder="National ID Number"
                                    prefix={<IdcardOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Contact Number" required>
                                <Input
                                    name="contactNumber"
                                    value={newCustomer.contactNumber}
                                    onChange={handleNewCustomerChange}
                                    placeholder="+254 7XX XXX XXX"
                                    prefix={<PhoneOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Email Address">
                                <Input
                                    name="email"
                                    value={newCustomer.email}
                                    onChange={handleNewCustomerChange}
                                    placeholder="email@example.com"
                                    prefix={<MailOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Location">
                                <Input
                                    name="location"
                                    value={newCustomer.location}
                                    onChange={handleNewCustomerChange}
                                    placeholder="City/Town"
                                    prefix={<EnvironmentOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Status">
                                <Select
                                    value={newCustomer.status}
                                    onChange={(value) => handleSelectChange(value, 'status')}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="Lead">Lead</Option>
                                    <Option value="Active">Active</Option>
                                    <Option value="Inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Lead Source">
                                <Select
                                    value={newCustomer.leadSource}
                                    onChange={(value) => handleSelectChange(value, 'leadSource')}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="Website">Website</Option>
                                    <Option value="Referral">Referral</Option>
                                    <Option value="Exhibition">Exhibition</Option>
                                    <Option value="Social Media">Social Media</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Assigned Agent">
                                <Select
                                    defaultValue="Jane Njeri"
                                    style={{ width: '100%' }}
                                >
                                    <Option value="Jane Njeri">Jane Njeri</Option>
                                    <Option value="James Otieno">James Otieno</Option>
                                    <Option value="Peter Kipchoge">Peter Kipchoge</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Notes">
                        <Input.TextArea
                            rows={4}
                            placeholder="Any additional information about the customer..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

// Customer View Component
const CustomerView = ({ customer, onBack }) => {
    // Property status tag color
    const getPropertyStatusColor = (status) => {
        switch (status) {
            case 'Purchased': return 'green';
            case 'Reserved': return 'orange';
            case 'Cancelled': return 'red';
            default: return 'default';
        }
    };

    // Payment status tag color
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'green';
            case 'Due': return 'orange';
            case 'Overdue': return 'red';
            default: return 'default';
        }
    };

    return (
        <div>
            <Title level={3}>{customer.name}</Title>

            {/* Customer Summary Card */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Avatar size={64} icon={<UserOutlined />} />
                            <div style={{ marginLeft: 16 }}>
                                <Title level={4}>{customer.name}</Title>
                                <Space direction="vertical">
                                    <Space>
                                        <PhoneOutlined />
                                        <Text>{customer.contactNumber}</Text>
                                    </Space>
                                    <Space>
                                        <MailOutlined />
                                        <Text>{customer.email}</Text>
                                    </Space>
                                    <Space>
                                        <EnvironmentOutlined />
                                        <Text>{customer.location}</Text>
                                    </Space>
                                </Space>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text type="secondary">Customer ID</Text>
                                <Paragraph>{customer.id}</Paragraph>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">ID Number</Text>
                                <Paragraph>{customer.idNumber}</Paragraph>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Status</Text>
                                <div>
                                    <Tag color={
                                        customer.status === 'Active' ? 'green' :
                                            customer.status === 'Lead' ? 'blue' :
                                                customer.status === 'Inactive' ? 'red' : 'default'
                                    }>
                                        {customer.status}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Lead Source</Text>
                                <div>
                                    <Tag color={
                                        customer.leadSource === 'Website' ? 'blue' :
                                            customer.leadSource === 'Referral' ? 'green' :
                                                customer.leadSource === 'Exhibition' ? 'purple' :
                                                    customer.leadSource === 'Social Media' ? 'cyan' : 'default'
                                    }>
                                        {customer.leadSource}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Text type="secondary">Assigned Agent</Text>
                        <Paragraph>
                            <TeamOutlined /> {customer.assignedAgent || 'Not Assigned'}
                        </Paragraph>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Text type="secondary">Date Added</Text>
                        <Paragraph>
                            <CalendarOutlined /> {customer.dateAdded}
                        </Paragraph>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Text type="secondary">Last Contact</Text>
                        <Paragraph>
                            <ClockCircleOutlined /> {customer.lastContact}
                        </Paragraph>
                    </Col>
                </Row>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultActiveKey="1">
                {/* Properties Tab */}
                <TabPane
                    tab={<span><HomeOutlined /> Properties</span>}
                    key="1"
                >
                    {customer.properties.length > 0 ? (
                        <Table
                            columns={[
                                {
                                    title: 'Property ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                },
                                {
                                    title: 'Type',
                                    dataIndex: 'type',
                                    key: 'type',
                                    render: type => (
                                        <Tag color={type === 'Land' ? 'green' : 'blue'}>
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
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: status => (
                                        <Tag color={getPropertyStatusColor(status)}>
                                            {status}
                                        </Tag>
                                    ),
                                },
                                {
                                    title: 'Price (KES)',
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: price => price.toLocaleString(),
                                },
                                {
                                    title: 'Actions',
                                    key: 'actions',
                                    render: () => (
                                        <Button size="small">View Details</Button>
                                    ),
                                },
                            ]}
                            dataSource={customer.properties}
                            rowKey="id"
                            pagination={false}
                        />
                    ) : (
                        <Empty description="No properties found" />
                    )}
                </TabPane>

                {/* Payments Tab */}
                <TabPane
                    tab={<span><DollarOutlined /> Payments</span>}
                    key="2"
                >
                    {customer.payments.length > 0 ? (
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
                                    title: 'Amount (KES)',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    render: amount => amount.toLocaleString(),
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: status => (
                                        <Tag color={getPaymentStatusColor(status)}>
                                            {status}
                                        </Tag>
                                    ),
                                },
                                {
                                    title: 'Actions',
                                    key: 'actions',
                                    render: (_, record) => (
                                        <Space>
                                            {record.status === 'Due' && (
                                                <Button size="small" type="primary">Record Payment</Button>
                                            )}
                                            <Button size="small">View Receipt</Button>
                                        </Space>
                                    ),
                                },
                            ]}
                            dataSource={customer.payments}
                            rowKey="id"
                            pagination={false}
                            summary={pageData => {
                                let totalPaid = 0;
                                let totalDue = 0;

                                pageData.forEach(item => {
                                    if (item.status === 'Paid') {
                                        totalPaid += item.amount;
                                    } else {
                                        totalDue += item.amount;
                                    }
                                });

                                return (
                                    <>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={2}><strong>Total</strong></Table.Summary.Cell>
                                            <Table.Summary.Cell index={2}><strong>{(totalPaid + totalDue).toLocaleString()}</strong></Table.Summary.Cell>
                                            <Table.Summary.Cell index={3} colSpan={2}></Table.Summary.Cell>
                                        </Table.Summary.Row>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={2}><Text type="success">Total Paid</Text></Table.Summary.Cell>
                                            <Table.Summary.Cell index={2}><Text type="success">{totalPaid.toLocaleString()}</Text></Table.Summary.Cell>
                                            <Table.Summary.Cell index={3} colSpan={2}></Table.Summary.Cell>
                                        </Table.Summary.Row>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={2}><Text type="danger">Total Due</Text></Table.Summary.Cell>
                                            <Table.Summary.Cell index={2}><Text type="danger">{totalDue.toLocaleString()}</Text></Table.Summary.Cell>
                                            <Table.Summary.Cell index={3} colSpan={2}></Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </>
                                );
                            }}
                        />
                    ) : (
                        <Empty description="No payments found" />
                    )}
                </TabPane>

                {/* Documents Tab */}
                <TabPane
                    tab={<span><FileTextOutlined /> Documents</span>}
                    key="3"
                >
                    {customer.documents.length > 0 ? (
                        <Table
                            columns={[
                                {
                                    title: 'Document ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                },
                                {
                                    title: 'Name',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Type',
                                    dataIndex: 'type',
                                    key: 'type',
                                    render: type => (
                                        <Tag color={
                                            type === 'Identity' ? 'blue' :
                                                type === 'Contract' ? 'green' : 'default'
                                        }>
                                            {type}
                                        </Tag>
                                    ),
                                },
                                {
                                    title: 'Date Uploaded',
                                    dataIndex: 'dateUploaded',
                                    key: 'dateUploaded',
                                },
                                {
                                    title: 'Actions',
                                    key: 'actions',
                                    render: () => (
                                        <Space>
                                            <Button size="small">View</Button>
                                            <Button size="small">Download</Button>
                                        </Space>
                                    ),
                                },
                            ]}
                            dataSource={customer.documents}
                            rowKey="id"
                            pagination={false}
                        />
                    ) : (
                        <Empty description="No documents found" />
                    )}
                    <div style={{ marginTop: 16 }}>
                        <Button type="primary">Upload New Document</Button>
                    </div>
                </TabPane>

                {/* Communication History Tab */}
                <TabPane
                    tab={<span><MessageOutlined /> Communication History</span>}
                    key="4"
                >
                    <Timeline mode="left">
                        {customer.communications.map(comm => (
                            <Timeline.Item
                                key={comm.id}
                                label={comm.date}
                                dot={
                                    comm.type === 'Phone Call' ? <PhoneOutlined style={{ fontSize: '16px' }} /> :
                                        comm.type === 'Email' ? <MailOutlined style={{ fontSize: '16px' }} /> :
                                            comm.type === 'Meeting' ? <TeamOutlined style={{ fontSize: '16px' }} /> :
                                                comm.type === 'SMS' ? <MessageOutlined style={{ fontSize: '16px' }} /> :
                                                    comm.type === 'Site Visit' ? <EnvironmentOutlined style={{ fontSize: '16px' }} /> :
                                                        undefined
                                }
                            >
                                <Card size="small" style={{ maxWidth: 500 }}>
                                    <p><strong>{comm.type}</strong> by {comm.agent}</p>
                                    <p>{comm.summary}</p>
                                </Card>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                    <div style={{ marginTop: 16 }}>
                        <Button type="primary">Add Communication</Button>
                    </div>
                </TabPane>
            </Tabs>

            {/* Action Buttons */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button icon={<PhoneOutlined />}>Call</Button>
                    <Button icon={<MailOutlined />}>Email</Button>
                    <Button icon={<EditOutlined />}>Edit</Button>
                    <Button icon={<DeleteOutlined />} danger>Delete</Button>
                    <Button type="primary">Schedule Meeting</Button>
                </Space>
            </div>
        </div>
    );
};

// Empty component for when there's no data
const Empty = ({ description }) => (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <UserOutlined style={{ fontSize: 48, color: '#ccc' }} />
        <p style={{ marginTop: 16, color: '#999' }}>{description}</p>
    </div>
);

export default CustomersList;