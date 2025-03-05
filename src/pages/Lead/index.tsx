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
    Empty as AntEmpty,
    Descriptions
} from 'antd';
import {
    UserOutlined,
    SearchOutlined,
    PlusOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    FilterOutlined,
    DownOutlined,
    InfoCircleOutlined,
    TeamOutlined,
    MessageOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StarOutlined,
    StarFilled,
    FileTextOutlined,
    ArrowRightOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    DollarOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Sample leads data
const leadsData = [
    {
        id: 'L001',
        name: 'Michael Ochieng',
        contactNumber: '+254 712 345 678',
        email: 'michael.ochieng@example.com',
        location: 'Nairobi',
        leadSource: 'Website',
        status: 'New',
        dateAdded: '2025-02-28',
        lastContact: '2025-02-28',
        nextFollowUp: '2025-03-07',
        assignedAgent: 'Jane Njeri',
        propertyInterest: 'Apartment',
        budget: '5,000,000 - 8,000,000 KES',
        notes: 'Looking for a 2-bedroom apartment in Westlands area for family',
        priority: 'Medium',
        stage: 'Initial Contact',
        documents: [],
        activities: [
            { date: '2025-02-28', type: 'Lead Created', notes: 'Lead captured from website inquiry form' },
            { date: '2025-02-28', type: 'Email Sent', notes: 'Welcome email with property catalog sent' }
        ]
    },
    {
        id: 'L002',
        name: 'Priscilla Nyambura',
        contactNumber: '+254 723 456 789',
        email: 'priscilla.nyambura@example.com',
        location: 'Kiambu',
        leadSource: 'Referral',
        status: 'In Progress',
        dateAdded: '2025-02-15',
        lastContact: '2025-03-01',
        nextFollowUp: '2025-03-08',
        assignedAgent: 'James Otieno',
        propertyInterest: 'Land',
        budget: '3,000,000 - 6,000,000 KES',
        notes: 'Interested in agricultural land for farming. Referred by David Maina.',
        priority: 'High',
        stage: 'Property Viewing',
        documents: ['ID Copy'],
        activities: [
            { date: '2025-02-15', type: 'Lead Created', notes: 'Lead from referral by David Maina' },
            { date: '2025-02-20', type: 'Phone Call', notes: 'Discussed land requirements and budget' },
            { date: '2025-03-01', type: 'Property Viewing', notes: 'Visited Thika Road land plots' }
        ]
    },
    {
        id: 'L003',
        name: 'Robert Kariuki',
        contactNumber: '+254 734 567 890',
        email: 'robert.kariuki@example.com',
        location: 'Mombasa',
        leadSource: 'Exhibition',
        status: 'Qualified',
        dateAdded: '2025-02-10',
        lastContact: '2025-03-03',
        nextFollowUp: '2025-03-06',
        assignedAgent: 'Jane Njeri',
        propertyInterest: 'Apartment',
        budget: '8,000,000 - 12,000,000 KES',
        notes: 'Looking for beachfront property as a retirement home',
        priority: 'High',
        stage: 'Negotiation',
        documents: ['ID Copy', 'Bank Statement'],
        activities: [
            { date: '2025-02-10', type: 'Lead Created', notes: 'From Real Estate Exhibition in Mombasa' },
            { date: '2025-02-18', type: 'Email Sent', notes: 'Catalog of beachfront properties' },
            { date: '2025-02-25', type: 'Property Viewing', notes: 'Visited two beachfront apartments' },
            { date: '2025-03-03', type: 'Meeting', notes: 'Discussed terms for Garden View Apartment' }
        ]
    },
    {
        id: 'L004',
        name: 'Faith Wangari',
        contactNumber: '+254 745 678 901',
        email: 'faith.wangari@example.com',
        location: 'Nairobi',
        leadSource: 'Social Media',
        status: 'New',
        dateAdded: '2025-03-02',
        lastContact: '2025-03-02',
        nextFollowUp: '2025-03-09',
        assignedAgent: 'Peter Kipchoge',
        propertyInterest: 'Land',
        budget: '2,000,000 - 4,000,000 KES',
        notes: 'First-time buyer looking for residential plot',
        priority: 'Medium',
        stage: 'Initial Contact',
        documents: [],
        activities: [
            { date: '2025-03-02', type: 'Lead Created', notes: 'Facebook campaign lead' },
            { date: '2025-03-02', type: 'Email Sent', notes: 'Welcome email with brochure' }
        ]
    },
    {
        id: 'L005',
        name: 'Samuel Otieno',
        contactNumber: '+254 756 789 012',
        email: 'samuel.otieno@example.com',
        location: 'Kisumu',
        leadSource: 'Website',
        status: 'Closed Won',
        dateAdded: '2025-01-20',
        lastContact: '2025-03-01',
        nextFollowUp: null,
        assignedAgent: 'James Otieno',
        propertyInterest: 'Apartment',
        budget: '6,000,000 - 9,000,000 KES',
        notes: 'Successfully purchased 3BR unit at Sunrise Heights',
        priority: 'Low',
        stage: 'Closed',
        documents: ['ID Copy', 'Sale Agreement', 'Payment Receipt'],
        activities: [
            { date: '2025-01-20', type: 'Lead Created', notes: 'Website inquiry for Sunrise Heights' },
            { date: '2025-01-25', type: 'Property Viewing', notes: 'Visited Sunrise Heights project' },
            { date: '2025-02-10', type: 'Meeting', notes: 'Finalized unit selection and payment terms' },
            { date: '2025-03-01', type: 'Sale Completed', notes: 'Signed agreement and made initial payment' }
        ]
    },
    {
        id: 'L006',
        name: 'Mercy Akinyi',
        contactNumber: '+254 767 890 123',
        email: 'mercy.akinyi@example.com',
        location: 'Nakuru',
        leadSource: 'Referral',
        status: 'Closed Lost',
        dateAdded: '2025-01-15',
        lastContact: '2025-02-20',
        nextFollowUp: null,
        assignedAgent: 'Peter Kipchoge',
        propertyInterest: 'Land',
        budget: '4,000,000 - 7,000,000 KES',
        notes: 'Chose competitor property due to location preferences',
        priority: 'Low',
        stage: 'Closed',
        documents: ['ID Copy'],
        activities: [
            { date: '2025-01-15', type: 'Lead Created', notes: 'Referral from existing customer' },
            { date: '2025-01-30', type: 'Property Viewing', notes: 'Visited multiple land options' },
            { date: '2025-02-15', type: 'Follow-up Call', notes: 'Client is considering options' },
            { date: '2025-02-20', type: 'Closed Lost', notes: 'Client chose property from another developer' }
        ]
    }
];

const LeadsManagement = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [addLeadVisible, setAddLeadVisible] = useState(false);
    const [addActivityVisible, setAddActivityVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [leadStageFilter, setLeadStageFilter] = useState('all');
    const [leadPriorityFilter, setLeadPriorityFilter] = useState('all');
    const [leadAssigneeFilter, setLeadAssigneeFilter] = useState('all');

    // New lead form state
    const [newLead, setNewLead] = useState({
        name: '',
        contactNumber: '',
        email: '',
        location: '',
        leadSource: 'Website',
        propertyInterest: 'Apartment',
        budget: '',
        notes: '',
        priority: 'Medium',
        assignedAgent: ''
    });

    // New activity form state
    const [newActivity, setNewActivity] = useState({
        type: 'Phone Call',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        nextFollowUp: ''
    });

    // Table columns
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <a onClick={() => viewLeadDetails(record)}>{text}</a>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Contact',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
        },
        {
            title: 'Interest',
            dataIndex: 'propertyInterest',
            key: 'propertyInterest',
            render: (interest) => (
                <Tag color={interest === 'Apartment' ? 'blue' : 'green'}>
                    {interest}
                </Tag>
            ),
            filters: [
                { text: 'Apartment', value: 'Apartment' },
                { text: 'Land', value: 'Land' },
            ],
            onFilter: (value, record) => record.propertyInterest === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'New') color = 'blue';
                if (status === 'In Progress') color = 'cyan';
                if (status === 'Qualified') color = 'purple';
                if (status === 'Closed Won') color = 'green';
                if (status === 'Closed Lost') color = 'red';

                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            },
            filters: [
                { text: 'New', value: 'New' },
                { text: 'In Progress', value: 'In Progress' },
                { text: 'Qualified', value: 'Qualified' },
                { text: 'Closed Won', value: 'Closed Won' },
                { text: 'Closed Lost', value: 'Closed Lost' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            key: 'stage',
            filters: [
                { text: 'Initial Contact', value: 'Initial Contact' },
                { text: 'Property Viewing', value: 'Property Viewing' },
                { text: 'Negotiation', value: 'Negotiation' },
                { text: 'Closed', value: 'Closed' },
            ],
            onFilter: (value, record) => record.stage === value,
        },
        {
            title: 'Source',
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
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                let color = 'default';
                if (priority === 'High') color = 'red';
                if (priority === 'Medium') color = 'orange';
                if (priority === 'Low') color = 'green';

                return (
                    <Tag color={color}>
                        {priority}
                    </Tag>
                );
            },
            filters: [
                { text: 'High', value: 'High' },
                { text: 'Medium', value: 'Medium' },
                { text: 'Low', value: 'Low' },
            ],
            onFilter: (value, record) => record.priority === value,
        },
        // {
        //     title: 'Last Contact',
        //     dataIndex: 'lastContact',
        //     key: 'lastContact',
        //     sorter: (a, b) => new Date(a.lastContact) - new Date(b.lastContact),
        // },
        // {
        //     title: 'Next Follow-up',
        //     dataIndex: 'nextFollowUp',
        //     key: 'nextFollowUp',
        //     render: (date) => date ? date : <Text type="secondary">--</Text>,
        //     sorter: (a, b) => {
        //         if (!a.nextFollowUp) return 1;
        //         if (!b.nextFollowUp) return -1;
        //         return new Date(a.nextFollowUp) - new Date(b.nextFollowUp);
        //     },
        // },
        {
            title: 'Agent',
            dataIndex: 'assignedAgent',
            key: 'assignedAgent',
            filters: [
                { text: 'Jane Njeri', value: 'Jane Njeri' },
                { text: 'James Otieno', value: 'James Otieno' },
                { text: 'Peter Kipchoge', value: 'Peter Kipchoge' },
            ],
            onFilter: (value, record) => record.assignedAgent === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Add Activity">
                        <Button
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => showAddActivityModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Lead">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditLead(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Lead">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // View lead details in drawer
    const viewLeadDetails = (lead) => {
        setSelectedLead(lead);
        setDrawerVisible(true);
    };

    // Show add activity modal
    const showAddActivityModal = (lead) => {
        setSelectedLead(lead);
        setAddActivityVisible(true);
    };

    // Handle edit lead
    const handleEditLead = (lead) => {
        // In a real app, this would prefill the form with lead details
        // and open the edit modal
        console.log('Edit lead:', lead);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (lead) => {
        setLeadToDelete(lead);
        setDeleteModalVisible(true);
    };

    // Handle delete lead
    const handleDeleteLead = () => {
        // In a real app, this would call an API to delete the lead
        console.log('Delete lead:', leadToDelete);
        setDeleteModalVisible(false);
        setLeadToDelete(null);
    };

    // Handle add lead
    const handleAddLead = () => {
        // In a real app, this would call an API to add the lead
        console.log('Add lead:', newLead);
        setAddLeadVisible(false);

        // Reset form
        setNewLead({
            name: '',
            contactNumber: '',
            email: '',
            location: '',
            leadSource: 'Website',
            propertyInterest: 'Apartment',
            budget: '',
            notes: '',
            priority: 'Medium',
            assignedAgent: ''
        });
    };

    // Handle add activity
    const handleAddActivity = () => {
        // In a real app, this would call an API to add the activity
        console.log('Add activity to lead:', selectedLead.id, newActivity);
        setAddActivityVisible(false);

        // Reset form
        setNewActivity({
            type: 'Phone Call',
            notes: '',
            date: new Date().toISOString().split('T')[0],
            nextFollowUp: ''
        });
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Convert a lead
    const convertLead = (lead) => {
        // In a real app, this would open a form to convert the lead to a customer
        console.log('Convert lead to customer:', lead);
    };

    // Filter leads based on search text and filters
    const filteredLeads = leadsData.filter(
        (lead) =>
            (lead.name.toLowerCase().includes(searchText.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchText.toLowerCase()) ||
                lead.contactNumber.includes(searchText)) &&
            (leadStageFilter === 'all' || lead.stage === leadStageFilter) &&
            (leadPriorityFilter === 'all' || lead.priority === leadPriorityFilter) &&
            (leadAssigneeFilter === 'all' || lead.assignedAgent === leadAssigneeFilter)
    );

    // Lead stage distribution for stats
    const leadsByStage = {
        'Initial Contact': leadsData.filter(lead => lead.stage === 'Initial Contact').length,
        'Property Viewing': leadsData.filter(lead => lead.stage === 'Property Viewing').length,
        'Negotiation': leadsData.filter(lead => lead.stage === 'Negotiation').length,
        'Closed': leadsData.filter(lead => lead.stage === 'Closed').length
    };

    // Calculate completion percentage for lead stages
    const getStageCompletionPercentage = (stage) => {
        switch (stage) {
            case 'Initial Contact': return 25;
            case 'Property Viewing': return 50;
            case 'Negotiation': return 75;
            case 'Closed': return 100;
            default: return 0;
        }
    };

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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddLeadVisible(true)}>
                        Add Lead
                    </Button>
                </Space>
            </Header>

            <Content style={{ margin: '16px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: 16 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>Leads</Breadcrumb.Item>
                    </Breadcrumb>
                    <Title level={3} style={{ marginTop: 8, marginBottom: 16 }}>Lead Management</Title>
                </div>

                {/* Lead Statistics Cards */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Leads"
                                value={leadsData.length}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="New Leads (This Week)"
                                value={leadsData.filter(lead =>
                                    new Date(lead.dateAdded) > new Date(new Date().setDate(new Date().getDate() - 7))
                                ).length}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<PlusOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Qualified Leads"
                                value={leadsData.filter(lead => lead.status === 'Qualified').length}
                                valueStyle={{ color: '#722ed1' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Conversion Rate"
                                value={Math.round((leadsData.filter(lead => lead.status === 'Closed Won').length / leadsData.length) * 100)}
                                valueStyle={{ color: '#faad14' }}
                                suffix="%"
                                prefix={<ArrowRightOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Lead Funnel Stats */}
                <Card title="Lead Pipeline" style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                <Progress type="circle" percent={100} format={() => leadsByStage['Initial Contact']} width={80} />
                                <div style={{ marginTop: 8 }}>Initial Contact</div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                <Progress type="circle" percent={100} format={() => leadsByStage['Property Viewing']} width={80} strokeColor="#1890ff" />
                                <div style={{ marginTop: 8 }}>Property Viewing</div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                <Progress type="circle" percent={100} format={() => leadsByStage['Negotiation']} width={80} strokeColor="#722ed1" />
                                <div style={{ marginTop: 8 }}>Negotiation</div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                <Progress type="circle" percent={100} format={() => leadsByStage['Closed']} width={80} strokeColor="#52c41a" />
                                <div style={{ marginTop: 8 }}>Closed</div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Search and Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Search leads by name, email or phone..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={16}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Select
                                defaultValue="all"
                                style={{ width: 150 }}
                                onChange={value => setLeadStageFilter(value)}
                            >
                                <Option value="all">All Stages</Option>
                                <Option value="Initial Contact">Initial Contact</Option>
                                <Option value="Property Viewing">Property Viewing</Option>
                                <Option value="Negotiation">Negotiation</Option>
                                <Option value="Closed">Closed</Option>
                            </Select>
                            <Select
                                defaultValue="all"
                                style={{ width: 150 }}
                                onChange={value => setLeadPriorityFilter(value)}
                            >
                                <Option value="all">All Priorities</Option>
                                <Option value="High">High Priority</Option>
                                <Option value="Medium">Medium Priority</Option>
                                <Option value="Low">Low Priority</Option>
                            </Select>
                            <Select
                                defaultValue="all"
                                style={{ width: 150 }}
                                onChange={value => setLeadAssigneeFilter(value)}
                            >
                                <Option value="all">All Agents</Option>
                                <Option value="Jane Njeri">Jane Njeri</Option>
                                <Option value="James Otieno">James Otieno</Option>
                                <Option value="Peter Kipchoge">Peter Kipchoge</Option>
                            </Select>
                            <Dropdown overlay={
                                <Menu>
                                    <Menu.Item key="1">Export to CSV</Menu.Item>
                                    <Menu.Item key="2">Print List</Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item key="3">Bulk Edit</Menu.Item>
                                    <Menu.Item key="4">Bulk Delete</Menu.Item>
                                </Menu>
                            }>
                                <Button>
                                    More Actions <DownOutlined />
                                </Button>
                            </Dropdown>
                        </Space>
                    </Col>
                </Row>

                {/* Leads Table */}
                <Table
                    columns={columns}
                    dataSource={filteredLeads}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    expandable={{
                        expandedRowRender: record => (
                            <p style={{ margin: 0 }}>
                                <strong>Notes:</strong> {record.notes}
                            </p>
                        ),
                    }}
                />
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Real Estate Management System ©2025
            </Footer>

            {/* Lead Details Drawer */}
            <Drawer
                title={selectedLead ? `Lead Details: ${selectedLead.name}` : 'Lead Details'}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                width={600}
                extra={
                    selectedLead && selectedLead.status !== 'Closed Won' && selectedLead.status !== 'Closed Lost' ? (
                        <Button type="primary" onClick={() => convertLead(selectedLead)}>
                            Convert to Customer
                        </Button>
                    ) : null
                }
            >
                {selectedLead && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Row>
                                <Col span={18}>
                                    <Title level={4}>{selectedLead.name}</Title>
                                    <Space direction="vertical">
                                        <Text><PhoneOutlined style={{ marginRight: 8 }} />{selectedLead.contactNumber}</Text>
                                        <Text><MailOutlined style={{ marginRight: 8 }} />{selectedLead.email}</Text>
                                        <Text><EnvironmentOutlined style={{ marginRight: 8 }} />{selectedLead.location}</Text>
                                    </Space>
                                </Col>
                                <Col span={6} style={{ textAlign: 'right' }}>
                                    <Tag color={selectedLead.priority === 'High' ? 'red' : selectedLead.priority === 'Medium' ? 'orange' : 'green'}>
                                        {selectedLead.priority} Priority
                                    </Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color={
                                            selectedLead.status === 'New' ? 'blue' :
                                                selectedLead.status === 'In Progress' ? 'cyan' :
                                                    selectedLead.status === 'Qualified' ? 'purple' :
                                                        selectedLead.status === 'Closed Won' ? 'green' :
                                                            'red'
                                        }>
                                            {selectedLead.status}
                                        </Tag>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Progress
                            percent={getStageCompletionPercentage(selectedLead.stage)}
                            status="active"
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                            style={{ marginBottom: 24 }}
                        />

                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <Statistic title="Stage" value={selectedLead.stage} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Source" value={selectedLead.leadSource} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Date Added" value={selectedLead.dateAdded} />
                            </Col>
                        </Row>

                        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                            <TabPane tab="Overview" key="1">
                                <Card title="Lead Information" bordered={false}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Interest">
                                            <Tag color={selectedLead.propertyInterest === 'Apartment' ? 'blue' : 'green'}>
                                                {selectedLead.propertyInterest}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Budget">{selectedLead.budget}</Descriptions.Item>
                                        <Descriptions.Item label="Assigned Agent">{selectedLead.assignedAgent}</Descriptions.Item>
                                        <Descriptions.Item label="Last Contact">{selectedLead.lastContact}</Descriptions.Item>
                                        {/* <Descriptions.Item label="Next Follow-up">
                                            {selectedLead.nextFollowUp || 'None scheduled'}
                                        </Descriptions.Item> */}
                                    </Descriptions>
                                </Card>

                                <Card title="Notes" style={{ marginTop: 16 }}>
                                    <Paragraph>{selectedLead.notes || 'No notes available.'}</Paragraph>
                                </Card>
                            </TabPane>

                            <TabPane tab="Activity Timeline" key="2">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{ marginBottom: 16 }}
                                    onClick={() => showAddActivityModal(selectedLead)}
                                >
                                    Add Activity
                                </Button>

                                <Timeline mode="left">
                                    {selectedLead.activities.map((activity, index) => (
                                        <Timeline.Item
                                            key={index}
                                            label={activity.date}
                                            color={
                                                activity.type === 'Lead Created' ? 'blue' :
                                                    activity.type === 'Phone Call' ? 'green' :
                                                        activity.type === 'Email Sent' ? 'cyan' :
                                                            activity.type === 'Property Viewing' ? 'purple' :
                                                                activity.type === 'Meeting' ? 'orange' :
                                                                    activity.type === 'Sale Completed' ? 'green' :
                                                                        activity.type === 'Closed Lost' ? 'red' : 'gray'
                                            }
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{activity.type}</div>
                                            <div>{activity.notes}</div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </TabPane>

                            <TabPane tab="Documents" key="3">
                                {selectedLead.documents.length > 0 ? (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={selectedLead.documents}
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
                                ) : (
                                    <Empty description="No documents uploaded" />
                                )}

                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                >
                                    Upload Document
                                </Button>
                            </TabPane>

                            <TabPane tab="Follow-ups" key="4">
                                <Card>
                                    {selectedLead.nextFollowUp ? (
                                        <>
                                            <Title level={5}>Next Scheduled Follow-up</Title>
                                            <Descriptions>
                                                <Descriptions.Item label="Date" span={3}>{selectedLead.nextFollowUp}</Descriptions.Item>
                                                <Descriptions.Item label="Assigned To" span={3}>{selectedLead.assignedAgent}</Descriptions.Item>
                                                <Descriptions.Item label="Notes" span={3}>Follow up on property interest and schedule viewing if ready.</Descriptions.Item>
                                            </Descriptions>
                                            <div style={{ marginTop: 16 }}>
                                                <Space>
                                                    <Button type="primary">Complete & Log</Button>
                                                    <Button>Reschedule</Button>
                                                </Space>
                                            </div>
                                        </>
                                    ) : (
                                        <Empty description="No upcoming follow-ups scheduled" />
                                    )}
                                </Card>

                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                >
                                    Schedule Follow-up
                                </Button>
                            </TabPane>
                        </Tabs>
                    </>
                )}
            </Drawer>

            {/* Add Lead Modal */}
            <Modal
                title="Add New Lead"
                visible={addLeadVisible}
                onOk={handleAddLead}
                onCancel={() => setAddLeadVisible(false)}
                width={700}
                okText="Add Lead"
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Full Name" required>
                                <Input
                                    name="name"
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                    placeholder="Enter lead's full name"
                                    prefix={<UserOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Contact Number" required>
                                <Input
                                    name="contactNumber"
                                    value={newLead.contactNumber}
                                    onChange={(e) => setNewLead({ ...newLead, contactNumber: e.target.value })}
                                    placeholder="+254 7XX XXX XXX"
                                    prefix={<PhoneOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Email Address">
                                <Input
                                    name="email"
                                    value={newLead.email}
                                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                    placeholder="email@example.com"
                                    prefix={<MailOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Location">
                                <Input
                                    name="location"
                                    value={newLead.location}
                                    onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                                    placeholder="City/Town"
                                    prefix={<EnvironmentOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Lead Source">
                                <Select
                                    value={newLead.leadSource}
                                    onChange={(value) => setNewLead({ ...newLead, leadSource: value })}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="Website">Website</Option>
                                    <Option value="Referral">Referral</Option>
                                    <Option value="Exhibition">Exhibition</Option>
                                    <Option value="Social Media">Social Media</Option>
                                    <Option value="Direct Call">Direct Call</Option>
                                    <Option value="Walk-in">Walk-in</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Priority">
                                <Select
                                    value={newLead.priority}
                                    onChange={(value) => setNewLead({ ...newLead, priority: value })}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="High">High</Option>
                                    <Option value="Medium">Medium</Option>
                                    <Option value="Low">Low</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Property Interest">
                                <Select
                                    value={newLead.propertyInterest}
                                    onChange={(value) => setNewLead({ ...newLead, propertyInterest: value })}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="Apartment">Apartment</Option>
                                    <Option value="Land">Land</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Budget Range">
                                <Input
                                    name="budget"
                                    value={newLead.budget}
                                    onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                                    placeholder="e.g., 5,000,000 - 8,000,000 KES"
                                    prefix={<DollarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Assigned Agent">
                        <Select
                            value={newLead.assignedAgent}
                            onChange={(value) => setNewLead({ ...newLead, assignedAgent: value })}
                            style={{ width: '100%' }}
                        >
                            <Option value="Jane Njeri">Jane Njeri</Option>
                            <Option value="James Otieno">James Otieno</Option>
                            <Option value="Peter Kipchoge">Peter Kipchoge</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Notes">
                        <TextArea
                            rows={4}
                            value={newLead.notes}
                            onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                            placeholder="Any additional information about the lead..."
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Activity Modal */}
            <Modal
                title={`Add Activity for ${selectedLead?.name || 'Lead'}`}
                visible={addActivityVisible}
                onOk={handleAddActivity}
                onCancel={() => setAddActivityVisible(false)}
                okText="Add Activity"
            >
                <Form layout="vertical">
                    <Form.Item label="Activity Type" required>
                        <Select
                            value={newActivity.type}
                            onChange={(value) => setNewActivity({ ...newActivity, type: value })}
                            style={{ width: '100%' }}
                        >
                            <Option value="Phone Call">Phone Call</Option>
                            <Option value="Email Sent">Email Sent</Option>
                            <Option value="Meeting">Meeting</Option>
                            <Option value="Property Viewing">Property Viewing</Option>
                            <Option value="Follow-up">Follow-up</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Date" required>
                        <DatePicker
                            style={{ width: '100%' }}
                            defaultValue={new Date()}
                            onChange={(date, dateString) => setNewActivity({ ...newActivity, date: dateString })}
                        />
                    </Form.Item>

                    <Form.Item label="Notes" required>
                        <TextArea
                            rows={4}
                            value={newActivity.notes}
                            onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                            placeholder="Details about the activity..."
                        />
                    </Form.Item>

                    <Form.Item label="Schedule Next Follow-up">
                        <DatePicker
                            style={{ width: '100%' }}
                            onChange={(date, dateString) => setNewActivity({ ...newActivity, nextFollowUp: dateString })}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={deleteModalVisible}
                onOk={handleDeleteLead}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete the lead for <strong>{leadToDelete?.name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </Layout>
    );
};

// Empty component for when there's no data
const Empty = ({ description }) => (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <UserOutlined style={{ fontSize: 48, color: '#ccc' }} />
        <p style={{ marginTop: 16, color: '#999' }}>{description}</p>
    </div>
);

export default LeadsManagement;