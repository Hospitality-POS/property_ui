import {
  ApartmentOutlined,
  BankOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  PictureOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Carousel,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  List,
  Menu,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { useState } from 'react';

const { Title, Text, Paragraph } = Typography;

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

// Sample property data
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
    description:
      'Prime land for residential development in an upscale neighborhood.',
    features: [
      'Fenced',
      'Road Access',
      'Electricity Connection',
      'Water Connection',
    ],
    documents: ['Title Deed', 'Survey Plan', 'Clearance Certificate'],
    images: [
      'https://via.placeholder.com/800x600?text=Land+Plot+Image+1',
      'https://via.placeholder.com/800x600?text=Land+Plot+Image+2',
      'https://via.placeholder.com/800x600?text=Land+Plot+Image+3',
    ],
    projectManager: 'John Kimani',
    dateAdded: '2024-12-10',
    dateUpdated: '2025-02-20',
    salesProgress: 0,
    unitsSold: 0,
    totalUnits: 1,
    totalSales: 0,
    expectedRevenue: 55000,
    projectPhase: 'Planning',
    completionDate: '2025-08-15',
    developmentCost: 2200000,
    roi: 150,
    salesRate: 'N/A',
    constructionStatus: 'Not Started',
    timeline: [
      {
        date: '2024-12-10',
        event: 'Property Added',
        description: 'Property details entered into system',
      },
      {
        date: '2025-01-15',
        event: 'Marketing Started',
        description: 'Property listing published',
      },
      {
        date: '2025-02-20',
        event: 'Property Inspection',
        description: 'Site visit conducted with potential buyer',
      },
    ],
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
    price: 89000,
    status: 'Reserved',
    description:
      'Luxurious 3-bedroom apartment with modern amenities in a gated community.',
    features: [
      '3 Bedrooms',
      '2 Bathrooms',
      'Balcony',
      'Parking Space',
      'Swimming Pool',
      'Gym',
    ],
    documents: ['Sale Agreement', 'Floor Plan', 'Building Approval'],
    images: [
      'https://via.placeholder.com/800x600?text=Apartment+Image+1',
      'https://via.placeholder.com/800x600?text=Apartment+Image+2',
      'https://via.placeholder.com/800x600?text=Apartment+Image+3',
    ],
    projectManager: 'Sarah Wanjiku',
    dateAdded: '2024-11-15',
    dateUpdated: '2025-02-25',
    salesProgress: 45,
    unitsSold: 9,
    totalUnits: 20,
    totalSales: 80100000,
    expectedRevenue: 178000,
    projectPhase: 'Construction',
    completionDate: '2025-06-30',
    developmentCost: 120000000,
    roi: 48,
    salesRate: '1.5 units/month',
    constructionStatus: '65% Complete',
    timeline: [
      {
        date: '2024-11-15',
        event: 'Property Added',
        description: 'Property details entered into system',
      },
      {
        date: '2025-01-05',
        event: 'Client Viewing',
        description: 'Property shown to interested client',
      },
      {
        date: '2025-02-10',
        event: 'Reservation',
        description: 'Property reserved pending payment',
      },
      {
        date: '2025-02-25',
        event: 'Deposit Received',
        description: 'Initial deposit payment received',
      },
    ],
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
    price: 32000,
    status: 'Available',
    description:
      'Strategically located commercial plot suitable for business development.',
    features: [
      'Commercial Zoning',
      'High Traffic Area',
      'Electricity Connection',
      'Water Connection',
    ],
    documents: ['Title Deed', 'Survey Plan', 'Rate Clearance'],
    images: [
      'https://via.placeholder.com/800x600?text=Commercial+Plot+Image+1',
      'https://via.placeholder.com/800x600?text=Commercial+Plot+Image+2',
    ],
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
    constructionStatus: 'Not Applicable',
    timeline: [
      {
        date: '2025-01-05',
        event: 'Property Added',
        description: 'Property details entered into system',
      },
      {
        date: '2025-01-20',
        event: 'Marketing Started',
        description: 'Property listing published',
      },
      {
        date: '2025-01-30',
        event: 'Site Visit',
        description: 'Site inspection with surveyor',
      },
    ],
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
    price: 0,
    status: 'In Progress',
    description:
      'A modern residential development with 25 townhouses in a serene environment.',
    features: [
      'Gated Community',
      '3 Bedroom Units',
      'Playground',
      'Paved Roads',
      'Security',
    ],
    documents: ['Master Plan', 'Approvals', 'EIA Certificate'],
    images: [
      'https://via.placeholder.com/800x600?text=Estate+Overview',
      'https://via.placeholder.com/800x600?text=Sample+House',
      'https://via.placeholder.com/800x600?text=Compound',
    ],
    projectManager: 'Samuel Odhiambo',
    dateAdded: '2024-09-15',
    dateUpdated: '2025-03-01',
    salesProgress: 68,
    unitsSold: 17,
    totalUnits: 25,
    totalSales: 102000000,
    expectedRevenue: 150000,
    projectPhase: 'Construction',
    completionDate: '2025-07-30',
    developmentCost: 90000000,
    roi: 66,
    salesRate: '2.1 units/month',
    constructionStatus: '70% Complete',
    unitTypes: [
      {
        type: 'Type A',
        size: '150 sq m',
        bedrooms: 3,
        price: 6000000,
        available: 3,
        reserved: 2,
        sold: 3,
      },
      {
        type: 'Type B',
        size: '180 sq m',
        bedrooms: 3,
        price: 6500000,
        available: 2,
        reserved: 1,
        sold: 4,
      },
      {
        type: 'Type C',
        size: '200 sq m',
        bedrooms: 4,
        price: 7000000,
        available: 3,
        reserved: 0,
        sold: 7,
      },
    ],
    timeline: [
      {
        date: '2024-09-15',
        event: 'Project Initiated',
        description: 'Development project launched',
      },
      {
        date: '2024-10-20',
        event: 'Approvals Obtained',
        description: 'All necessary permits secured',
      },
      {
        date: '2024-11-05',
        event: 'Construction Started',
        description: 'Ground breaking and foundation work',
      },
      {
        date: '2025-01-15',
        event: 'Phase 1 Foundation Complete',
        description: '100% foundation work complete',
      },
      {
        date: '2025-03-01',
        event: 'Structural Work 70% Complete',
        description: 'Construction progressing well',
      },
    ],
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
    price: 0,
    status: 'In Progress',
    description:
      'Luxury apartment complex with 40 units offering modern living in the heart of Kilimani.',
    features: [
      'Rooftop Pool',
      'Gym',
      'Secure Parking',
      '24/7 Security',
      'Backup Generator',
    ],
    documents: ['Building Plans', 'Approvals', 'Sales Agreements'],
    images: [
      'https://via.placeholder.com/800x600?text=Building+Render',
      'https://via.placeholder.com/800x600?text=Sample+Apartment',
      'https://via.placeholder.com/800x600?text=Rooftop+Area',
    ],
    projectManager: 'Elizabeth Owino',
    dateAdded: '2024-08-10',
    dateUpdated: '2025-02-28',
    salesProgress: 55,
    unitsSold: 22,
    totalUnits: 40,
    totalSales: 198000000,
    expectedRevenue: 3600000,
    projectPhase: 'Construction',
    completionDate: '2025-09-15',
    developmentCost: 250000000,
    roi: 44,
    salesRate: '3.1 units/month',
    constructionStatus: '60% Complete',
    unitTypes: [
      {
        type: 'Studio',
        size: '45 sq m',
        bedrooms: 0,
        price: 4500000,
        available: 3,
        reserved: 2,
        sold: 5,
      },
      {
        type: '1 Bedroom',
        size: '65 sq m',
        bedrooms: 1,
        price: 6500000,
        available: 5,
        reserved: 2,
        sold: 8,
      },
      {
        type: '2 Bedroom',
        size: '85 sq m',
        bedrooms: 2,
        price: 8500000,
        available: 4,
        reserved: 1,
        sold: 5,
      },
      {
        type: '3 Bedroom',
        size: '120 sq m',
        bedrooms: 3,
        price: 12000000,
        available: 2,
        reserved: 1,
        sold: 2,
      },
    ],
    timeline: [
      {
        date: '2024-08-10',
        event: 'Project Initiated',
        description: 'Development project launched',
      },
      {
        date: '2024-09-05',
        event: 'Approvals Obtained',
        description: 'All necessary permits secured',
      },
      {
        date: '2024-10-15',
        event: 'Construction Started',
        description: 'Ground breaking and foundation work',
      },
      {
        date: '2025-01-10',
        event: 'Foundation Complete',
        description: '100% foundation work complete',
      },
      {
        date: '2025-02-28',
        event: 'Structural Work 60% Complete',
        description: 'Construction progressing well',
      },
    ],
  },
];

const PropertyTable = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  // Table columns for properties list
  const columns = [
    {
      title: 'Property ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 120,
      render: (text, record) => (
        <a onClick={() => handleViewProperty(record)}>{text}</a>
      ),
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        let color = 'blue';
        if (type === 'Land') color = 'green';
        if (type === 'Development') color = 'purple';
        return <Tag color={color}>{type}</Tag>;
      },
      filters: [
        { text: 'Land', value: 'Land' },
        { text: 'Apartment', value: 'Apartment' },
        { text: 'Development', value: 'Development' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (text) => (
        <span>
          <EnvironmentOutlined style={{ marginRight: 5 }} /> {text}
        </span>
      ),
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
      width: 160,
      render: (price, record) => {
        if (record.type === 'Development') {
          return <Text key="price">Various</Text>;
        }
        return price > 0 ? (
          price.toLocaleString()
        ) : (
          <Text>N/A</Text>
        );
      },
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        let color = 'green';
        if (status === 'Reserved') color = 'orange';
        if (status === 'Sold') color = 'red';
        if (status === 'In Progress') color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Available', value: 'Available' },
        { text: 'Reserved', value: 'Reserved' },
        { text: 'Sold', value: 'Sold' },
        { text: 'In Progress', value: 'In Progress' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Project Manager',
      dataIndex: 'projectManager',
      key: 'projectManager',
      width: 130,
      filters: [
        { text: 'John Kimani', value: 'John Kimani' },
        { text: 'Sarah Wanjiku', value: 'Sarah Wanjiku' },
        { text: 'David Maina', value: 'David Maina' },
        { text: 'Samuel Odhiambo', value: 'Samuel Odhiambo' },
        { text: 'Elizabeth Owino', value: 'Elizabeth Owino' },
      ],
      onFilter: (value, record) => record.projectManager === value,
    },
    {
      title: 'Date Added',
      dataIndex: 'dateAdded',
      key: 'dateAdded',
      width: 120,
      sorter: (a, b) => new Date(a.dateAdded) - new Date(b.dateAdded),
    },
    {
      title: 'Sales Progress',
      dataIndex: 'salesProgress',
      key: 'salesProgress',
      width: 160,
      render: (progress, record) => {
        if (record.type === 'Development') {
          return <Progress percent={progress} size="small" status="active" />;
        }
        if (record.status === 'Sold') {
          return <Progress percent={100} size="small" status="success" />;
        }
        if (record.status === 'Reserved') {
          return <Progress percent={50} size="small" status="active" />;
        }
        return <Progress percent={0} size="small" />;
      },
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
              onClick={() => handleViewProperty(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditProperty(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
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

  // Handle view property
  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setDrawerVisible(true);
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

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Calculate property portfolio statistics
  const getTotalPropertyValue = () => {
    return (
      propertiesData
        .filter((property) => property.price > 0)
        .reduce((total, property) => total + property.price, 0) +
      propertiesData
        .filter((property) => property.type === 'Development')
        .reduce((total, property) => total + property.expectedRevenue, 0)
    );
  };

  const getAvailablePropertiesCount = () => {
    return propertiesData.filter((property) => property.status === 'Available')
      .length;
  };

  const getReservedPropertiesCount = () => {
    return propertiesData.filter((property) => property.status === 'Reserved')
      .length;
  };

  const getTotalDevelopmentValue = () => {
    return propertiesData
      .filter((property) => property.type === 'Development')
      .reduce((total, property) => total + property.expectedRevenue, 0);
  };

  // Filter properties based on search text and filters
  const filteredProperties = propertiesData.filter((property) => {
    const matchesSearch =
      property.id.toLowerCase().includes(searchText.toLowerCase()) ||
      property.title.toLowerCase().includes(searchText.toLowerCase()) ||
      property.location.toLowerCase().includes(searchText.toLowerCase()) ||
      property.projectManager.toLowerCase().includes(searchText.toLowerCase());

    const matchesType =
      propertyTypeFilter === 'all' || property.type === propertyTypeFilter;
    const matchesStatus =
      propertyStatusFilter === 'all' ||
      property.status === propertyStatusFilter;

    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const addedDate = new Date(property.dateAdded);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      matchesDateRange = addedDate >= startDate && addedDate <= endDate;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  });

  return (
    <>
      <Space className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddPropertyVisible(true)}
        >
          Add Property
        </Button>
      </Space>

      {/* Property Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Portfolio Value"
              value={getTotalPropertyValue()}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BankOutlined />}
              formatter={(value) => `KES ${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Available Properties"
              value={getAvailablePropertiesCount()}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${propertiesData.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Reserved Properties"
              value={getReservedPropertiesCount()}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Development Projects Value"
              value={getTotalDevelopmentValue()}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ApartmentOutlined />}
              formatter={(value) => `KES ${value.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={6}>
          <Input
            placeholder="Search by ID, title, location or manager..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Type"
            defaultValue="all"
            onChange={(value) => setPropertyTypeFilter(value)}
          >
            <Option value="all">All Types</Option>
            <Option value="Land">Land</Option>
            <Option value="Apartment">Apartment</Option>
            <Option value="Development">Development</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Status"
            defaultValue="all"
            onChange={(value) => setPropertyStatusFilter(value)}
          >
            <Option value="all">All Statuses</Option>
            <Option value="Available">Available</Option>
            <Option value="Reserved">Reserved</Option>
            <Option value="Sold">Sold</Option>
            <Option value="In Progress">In Progress</Option>
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
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" icon={<FileExcelOutlined />}>
                  Export to Excel
                </Menu.Item>
                <Menu.Item key="2" icon={<PrinterOutlined />}>
                  Print Report
                </Menu.Item>
              </Menu>
            }
          >
            <Button style={{ width: '100%' }}>
              <ExportOutlined /> Export <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>

      {/* Properties Table */}
      <Table
        columns={columns}
        dataSource={filteredProperties}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <strong>Description:</strong> {record.description}
            </p>
          ),
        }}
        summary={(pageData) => {
          if (pageData.length === 0) return null;

          let pageTotal = 0;
          let developmentTotal = 0;

          pageData.forEach(({ price, expectedRevenue, type }) => {
            if (type === 'Development') {
              developmentTotal += expectedRevenue || 0;
            } else {
              pageTotal += price || 0;
            }
          });

          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <strong>Page Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text>KES {pageTotal.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} colSpan={5}>
                  <Text>
                    Development Value: KES {developmentTotal.toLocaleString()}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />

      {/* Property Details Drawer */}
      <Drawer
        title={
          selectedProperty
            ? `Property Details: ${selectedProperty.id}`
            : 'Property Details'
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={700}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              style={{ marginRight: 8 }}
            >
              Generate Report
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>Close</Button>
          </div>
        }
      >
        {selectedProperty && (
          <>
            <div style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={16}>
                  <Title level={4}>{selectedProperty?.title}</Title>
                  <Space direction="vertical">
                    <Text>
                      <HomeOutlined style={{ marginRight: 8 }} />
                      {selectedProperty?.type} - {selectedProperty?.size}
                    </Text>
                    <Text>
                      <EnvironmentOutlined style={{ marginRight: 8 }} />
                      {selectedProperty?.location}, {selectedProperty?.county}
                    </Text>
                    <Text>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Project Manager: {selectedProperty?.projectManager}
                    </Text>
                  </Space>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Tag
                    color={
                      selectedProperty?.status === 'Available'
                        ? 'green'
                        : selectedProperty?.status === 'Reserved'
                        ? 'orange'
                        : selectedProperty?.status === 'Sold'
                        ? 'red'
                        : 'blue'
                    }
                    style={{ fontSize: '14px', padding: '4px 8px' }}
                  >
                    {selectedProperty?.status}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text >Added:</Text> {selectedProperty?.dateAdded}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text >Updated:</Text> {selectedProperty?.dateUpdated}
                  </div>
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Property Progress Steps */}
            <div style={{ marginBottom: 24 }}>
              <Steps
                size="small"
                current={
                  selectedProperty?.status === 'Available'
                    ? 0
                    : selectedProperty?.status === 'Reserved'
                    ? 1
                    : selectedProperty?.status === 'Sold'
                    ? 2
                    : selectedProperty?.type === 'Development'
                    ? 1
                    : 0
                }
              >
                <Step title="Available" />
                <Step title="Reserved/In Progress" />
                <Step title="Sold/Completed" />
              </Steps>
            </div>

            {/* Property Image Carousel */}
            <Card style={{ marginBottom: 16 }}>
              <Carousel autoplay>
                {selectedProperty?.images?.map((image, index) => (
                  <div key={index}>
                    <div
                      style={{
                        height: '300px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#f0f0f0',
                      }}
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            </Card>

            {/* Property Overview */}
            <Card title="Property Overview" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Property Type">
                      {selectedProperty?.type}
                    </Descriptions.Item>
                    <Descriptions.Item label="Size">
                      {selectedProperty?.size}
                    </Descriptions.Item>
                    <Descriptions.Item label="Location">
                      {selectedProperty?.location}
                    </Descriptions.Item>
                    <Descriptions.Item label="County">
                      {selectedProperty?.county}
                    </Descriptions.Item>
                    <Descriptions.Item label="Constituency">
                      {selectedProperty?.constituency}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Price">
                      {selectedProperty?.type === 'Development'
                        ? 'Various Units Pricing'
                        : `KES ${selectedProperty?.price.toLocaleString()}`}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      {selectedProperty?.status}
                    </Descriptions.Item>
                    <Descriptions.Item label="Sales Progress">
                      {selectedProperty?.type === 'Development'
                        ? `${selectedProperty?.salesProgress}% (${selectedProperty?.unitsSold}/${selectedProperty?.totalUnits} units)`
                        : selectedProperty?.status === 'Sold'
                        ? '100%'
                        : selectedProperty?.status === 'Reserved'
                        ? '50%'
                        : '0%'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Project Manager">
                      {selectedProperty?.projectManager}
                    </Descriptions.Item>
                    <Descriptions.Item label="Documents">
                      {selectedProperty?.documents.length} documents
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <TabPane tab="Property Details" key="1">
                <Card title="Description" style={{ marginBottom: 16 }}>
                  <Paragraph>{selectedProperty?.description}</Paragraph>
                </Card>

                <Card title="Features" style={{ marginBottom: 16 }}>
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                  >
                    {selectedProperty?.features?.map((feature, idx) => (
                      <Tag key={idx} color="blue">
                        <CheckCircleOutlined /> {feature}
                      </Tag>
                    ))}
                  </div>
                </Card>

                {selectedProperty?.type === 'Development' &&
                  selectedProperty?.unitTypes && (
                    <Card title="Unit Types" style={{ marginBottom: 16 }}>
                      <Table
                        columns={[
                          {
                            title: 'Type',
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
                            render: (price) => price.toLocaleString(),
                          },
                          {
                            title: 'Status',
                            key: 'status',
                            render: (_, record) => (
                              <Space>
                                <Tag color="green">
                                  {record?.available} Available
                                </Tag>
                                <Tag color="orange">
                                  {record?.reserved} Reserved
                                </Tag>
                                <Tag color="red">{record?.sold} Sold</Tag>
                              </Space>
                            ),
                          },
                        ]}
                        dataSource={selectedProperty?.unitTypes}
                        rowKey="type"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  )}
              </TabPane>

              <TabPane tab="Timeline" key="2">
                <Timeline mode="left">
                  {selectedProperty?.timeline?.map((item, index) => (
                    <Timeline.Item
                      key={index}
                      label={item.date}
                      color={
                        item.event.includes('Sold') ||
                        item.event.includes('Complete')
                          ? 'green'
                          : item.event.includes('Reserved') ||
                            item.event.includes('Progress')
                          ? 'blue'
                          : 'gray'
                      }
                    >
                      <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                      <div>{item.description}</div>
                    </Timeline.Item>
                  ))}

                  {selectedProperty?.status !== 'Sold' && (
                    <Timeline.Item
                      label="Future"
                      color="gray"
                      dot={<ClockCircleOutlined />}
                    >
                      <div style={{ fontWeight: 'bold' }}>
                        {selectedProperty?.status === 'Available'
                          ? 'Reserve Property'
                          : selectedProperty?.status === 'Reserved'
                          ? 'Complete Sale'
                          : 'Handover'}
                      </div>
                      <div>Next step in the property lifecycle</div>
                    </Timeline.Item>
                  )}
                </Timeline>

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16 }}
                  block
                >
                  Add Timeline Event
                </Button>
              </TabPane>

              <TabPane tab="Financial Details" key="3">
                <Card>
                  {selectedProperty.type === 'Development' ? (
                    <Descriptions
                      title="Development Financial Information"
                      bordered
                      column={1}
                    >
                      <Descriptions.Item label="Total Expected Revenue">
                        KES {selectedProperty?.expectedRevenue.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Development Cost">
                        KES {selectedProperty?.developmentCost.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Return on Investment">
                        {selectedProperty?.roi}%
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Sales to Date">
                        KES {selectedProperty?.totalSales.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sales Rate">
                        {selectedProperty?.salesRate}
                      </Descriptions.Item>
                      <Descriptions.Item label="Units Sold">
                        {selectedProperty?.unitsSold} of{' '}
                        {selectedProperty?.totalUnits} (
                        {selectedProperty?.salesProgress}%)
                      </Descriptions.Item>
                      <Descriptions.Item label="Completion Status">
                        {selectedProperty?.constructionStatus}
                      </Descriptions.Item>
                      <Descriptions.Item label="Expected Completion">
                        {selectedProperty?.completionDate}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Descriptions
                      title="Property Financial Information"
                      bordered
                      column={1}
                    >
                      <Descriptions.Item label="Listing Price">
                        KES {selectedProperty?.price.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        {selectedProperty?.status}
                      </Descriptions.Item>
                      {selectedProperty?.status === 'Reserved' && (
                        <Descriptions.Item label="Reservation Fee">
                          KES 100,000
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Property Tax (Annual)">
                        KES{' '}
                        {Math.round(
                          selectedProperty?.price * 0.01,
                        ).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Management Fee (Monthly)">
                        KES{' '}
                        {Math.round(
                          selectedProperty?.price * 0.0005,
                        ).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Estimated ROI">
                        {selectedProperty?.type === 'Land'
                          ? '8-12% p.a.'
                          : '5-7% p.a.'}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Space>
                      <Button icon={<DollarOutlined />}>Price History</Button>
                      <Button icon={<BarChartOutlined />}>
                        Financial Analysis
                      </Button>
                      <Button type="primary" icon={<FileTextOutlined />}>
                        Generate Financial Report
                      </Button>
                    </Space>
                  </div>
                </Card>
              </TabPane>

              <TabPane tab="Documents" key="4">
                <List
                  itemLayout="horizontal"
                  dataSource={selectedProperty.documents}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="link">View</Button>,
                        <Button type="link">Download</Button>,
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

              <TabPane tab="Location & Map" key="5">
                <Card>
                  <div
                    style={{
                      height: '300px',
                      background: '#f0f0f0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Text type="secondary">
                      Map would be displayed here showing the property location
                      at coordinates: {selectedProperty.coordinates}
                    </Text>
                  </div>
                  <Descriptions title="Location Details" bordered>
                    <Descriptions.Item label="Address" span={3}>
                      {selectedProperty.location}
                    </Descriptions.Item>
                    <Descriptions.Item label="County">
                      {selectedProperty.county}
                    </Descriptions.Item>
                    <Descriptions.Item label="Constituency">
                      {selectedProperty.constituency}
                    </Descriptions.Item>
                    <Descriptions.Item label="GPS Coordinates">
                      {selectedProperty.coordinates}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nearby Facilities" span={3}>
                      <Text>
                        Information about nearby schools, hospitals, shopping
                        centers, etc. would be displayed here.
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </TabPane>
            </Tabs>
          </>
        )}
      </Drawer>

      {/* Add Property Modal */}
      <Modal
        title="Add New Property"
        visible={addPropertyVisible}
        onOk={() => setAddPropertyVisible(false)}
        onCancel={() => setAddPropertyVisible(false)}
        width={800}
        okText="Add Property"
      >
        <Form layout="vertical">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Information" key="1">
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item label="Property Title" required>
                    <Input placeholder="Enter property title" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Property Type" required>
                    <Select placeholder="Select property type">
                      <Option value="Land">Land</Option>
                      <Option value="Apartment">Apartment</Option>
                      <Option value="Development">Development Project</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Size" required>
                    <Input placeholder="e.g., 0.5 acres or 150 sq m" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Price (KES)" required>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Enter property price"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Location" required>
                    <Input placeholder="Area/neighborhood" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Status">
                    <Select defaultValue="Available">
                      <Option value="Available">Available</Option>
                      <Option value="Reserved">Reserved</Option>
                      <Option value="Sold">Sold</Option>
                      <Option value="In Progress">In Progress</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="County">
                    <Input placeholder="County name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Constituency">
                    <Input placeholder="Constituency name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Project Manager">
                    <Input placeholder="Name of project manager" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Description">
                <Input.TextArea
                  rows={4}
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
                >
                  <Option value="Fenced">Fenced</Option>
                  <Option value="Road Access">Road Access</Option>
                  <Option value="Electricity Connection">
                    Electricity Connection
                  </Option>
                  <Option value="Water Connection">Water Connection</Option>
                  <Option value="3 Bedrooms">3 Bedrooms</Option>
                  <Option value="2 Bathrooms">2 Bathrooms</Option>
                  <Option value="Parking Space">Parking Space</Option>
                  <Option value="Swimming Pool">Swimming Pool</Option>
                  <Option value="Gym">Gym</Option>
                  <Option value="Security">Security</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Required Documents">
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Add required documents"
                >
                  <Option value="Title Deed">Title Deed</Option>
                  <Option value="Survey Plan">Survey Plan</Option>
                  <Option value="Floor Plan">Floor Plan</Option>
                  <Option value="Building Approval">Building Approval</Option>
                  <Option value="Sale Agreement">Sale Agreement</Option>
                  <Option value="Master Plan">Master Plan</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Upload Property Documents">
                <Upload.Dragger multiple listType="picture">
                  <p className="ant-upload-drag-icon">
                    <FileTextOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag documents to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Upload any property documents like title deeds, survey
                    plans, etc.
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </TabPane>

            <TabPane tab="Images" key="3">
              <Form.Item label="Property Images">
                <Upload.Dragger listType="picture-card" multiple>
                  <p className="ant-upload-drag-icon">
                    <PictureOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag images to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Upload clear images of the property from different angles
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </TabPane>

            <TabPane tab="Location" key="4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="GPS Coordinates">
                    <Input placeholder="e.g., -1.2921, 36.8219" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Nearby Facilities">
                    <Input placeholder="e.g., 5 mins to shopping center" />
                  </Form.Item>
                </Col>
              </Row>
              <div
                style={{
                  height: '200px',
                  background: '#f0f0f0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text type="secondary">
                  Map selection tool would be displayed here
                </Text>
              </div>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onOk={handleDeleteProperty}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the property{' '}
          <strong>{propertyToDelete?.title}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default PropertyTable;
