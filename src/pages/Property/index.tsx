import {
  ApartmentOutlined,
  BankOutlined,
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
  message,
} from 'antd';
import { useState } from 'react';
import { createNewProperty, fetchAllProperties, updateProperty, deleteProperty } from '@/services/property';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;


const PropertyTable = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [refreshKey, setRefreshKey] = useState(0);
  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);


  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD MMM YYYY');
  };

  const { data: propertiesData = [], isLoading: isLoadingProperties, refetch: refetchProperties } = useQuery({
    queryKey: ['property'], // Adding refreshKey to queryKey
    queryFn: async () => {
      try {
        const response = await fetchAllProperties();
        console.log('properties fetched successfully:', response);

        // Process data to use createdAt as dateJoined
        const processedData = Array.isArray(response.data)
          ? response.data.map(property => ({
            ...property,
            dateJoined: formatDate(property.createdAt) || property.dateJoined,
          }))
          : [];

        return processedData;
      } catch (error) {
        message.error('Failed to fetch properties');
        console.error('Error fetching properties:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Function to format property status for display
  const formatStatus = (status) => {
    const statusMap = {
      'available': 'Available',
      'reserved': 'Reserved',
      'sold': 'Sold',
      'under_construction': 'Under Construction'
    };
    return statusMap[status] || status;
  };

  // Function to format property type for display
  const formatPropertyType = (type) => {
    const typeMap = {
      'land': 'Land',
      'apartment': 'Apartment'
    };
    return typeMap[type] || type;
  };

  // Table columns for properties list
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 120,
      render: (text, record) => (
        <a onClick={() => handleViewProperty(record)}>{text}</a>
      ),
      sorter: (a, b) => a._id.localeCompare(b._id),
    },

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
      title: 'Price (KES)',
      dataIndex: 'price',
      key: 'price',
      width: 160,
      render: (price) => price > 0 ? price.toLocaleString() : <Text>N/A</Text>,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        let color = 'green';
        if (status === 'reserved') color = 'orange';
        if (status === 'sold') color = 'red';
        if (status === 'under_construction') color = 'blue';
        return <Tag color={color}>{formatStatus(status)}</Tag>;
      },
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Reserved', value: 'reserved' },
        { text: 'Sold', value: 'sold' },
        { text: 'Under Construction', value: 'under_construction' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Manager',
      key: 'manager',
      width: 130,
      render: (_, record) => record.propertyManager.name,
      filters: Array.from(new Set(propertiesData.map(p => p.propertyManager.name)))
        .map(name => ({ text: name, value: name })),
      onFilter: (value, record) => record.propertyManager.name === value,
    },
    {
      title: 'Date Added',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Sale Progress',
      key: 'salesProgress',
      width: 160,
      render: (_, record) => {
        if (record.status === 'sold') {
          return <Progress percent={100} size="small" status="success" />;
        }
        if (record.status === 'reserved') {
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

  const handleAddProperty = () => {
    form.validateFields().then(values => {
      // Format coordinates if they exist
      if (values.location && values.location.coordinates && values.location.coordinates.coordinates) {
        // Check if coordinates is a string that needs parsing
        if (typeof values.location.coordinates.coordinates === 'string') {
          // Split the string by comma or space and convert to numbers
          const coordsString = values.location.coordinates.coordinates;
          const coordsArray = coordsString
            .split(/[,\s]+/)                 // Split by comma or whitespace
            .filter(coord => coord.trim())   // Remove empty entries
            .map(coord => parseFloat(coord)) // Convert to numbers
            .filter(coord => !isNaN(coord)); // Filter out any NaN values

          // Make sure we have at least 2 coordinates
          if (coordsArray.length >= 2) {
            // Update the values object with the properly formatted coordinates
            values.location.coordinates = {
              type: 'Point',
              coordinates: coordsArray
            };
          }
        }
      }

      // Add property ID if in edit mode
      if (isEditMode && selectedProperty) {
        values._id = selectedProperty._id;
      }

      console.log('form values', values);

      // Create an API function call based on whether we're adding or editing
      const apiCall = isEditMode
        ? updateProperty(values._id, values) // You would need to create this function in your services
        : createNewProperty(values);

      apiCall
        .then(property => {
          // Show success message
          message.success(`Property ${isEditMode ? 'updated' : 'added'} successfully!`);
          setTimeout(() => {
            setRefreshKey(prevKey => prevKey + 1);
            refetchProperties({ force: true });
          }, 500);
          // Close modal and reset form
          setAddPropertyVisible(false);
          setIsEditMode(false);
          setSelectedProperty(null);
          form.resetFields();
        })
        .catch(error => {
          // Display error message
          message.error(`Failed to ${isEditMode ? 'update' : 'add'} property: ${error.message}`);
        });
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
    });
  };


  const handleModalCancel = () => {
    setAddPropertyVisible(false);
    setIsEditMode(false);
    setSelectedProperty(null);
    form.resetFields();
  };

  const handleEditProperty = (property) => {
    // Set the edit mode flag
    setIsEditMode(true);

    // Set the selected property for reference
    setSelectedProperty(property);

    // Format specific data to match form expectations
    const formattedProperty = {
      ...property,
      // Handle property manager - convert from object to ID
      propertyManager: property.propertyManager._id,
      // Ensure location structure is preserved correctly
      location: {
        ...property.location,
        // Format coordinates for the form
        coordinates: {
          ...property.location.coordinates,
          // Present coordinates as string for the form input
          coordinates: property.location.coordinates.coordinates.join(',')
        }
      }
    };


    // Set form values with the formatted property data
    form.setFieldsValue(formattedProperty);

    // Open the form modal with edit mode
    setAddPropertyVisible(true);
  };

  // Show delete confirmation modal
  const showDeleteConfirm = (property) => {
    setPropertyToDelete(property);
    setDeleteModalVisible(true);
  };

  // Handle delete property
  const handleDeleteProperty = async () => {
    try {
      // Check if propertyToDelete exists and has an ID
      if (!propertyToDelete || !propertyToDelete._id) {
        throw new Error('Invalid property selected for deletion');
      }

      // Show loading message
      const hideLoadingMessage = message.loading('Deleting property...', 0);

      // Call the delete API
      await deleteProperty(propertyToDelete._id);

      // Close loading message
      hideLoadingMessage();

      // Show success message
      message.success(`Property "${propertyToDelete.name}" deleted successfully`);

      // Close the modal and reset state
      setDeleteModalVisible(false);
      setPropertyToDelete(null);

      // Refresh the property list
      refetchProperties({ force: true });
    } catch (error) {
      // Handle error - display meaningful error message
      console.error('Error deleting property:', error);
      message.error(`Failed to delete property: ${error.message || 'Unknown error occurred'}`);

      // Close the modal but maintain propertyToDelete state in case user wants to retry
      setDeleteModalVisible(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Calculate property statistics
  const getTotalPropertyValue = () => {
    return propertiesData.reduce((total, property) => total + property.price, 0);
  };

  const getAvailablePropertiesCount = () => {
    return propertiesData.filter((property) => property.status === 'available').length;
  };

  const getReservedPropertiesCount = () => {
    return propertiesData.filter((property) => property.status === 'reserved').length;
  };

  const getSoldPropertiesCount = () => {
    return propertiesData.filter((property) => property.status === 'sold').length;
  };

  // Filter properties
  const filteredProperties = propertiesData.filter((property) => {
    const matchesSearch =
      property._id.toLowerCase().includes(searchText.toLowerCase()) ||
      property.name.toLowerCase().includes(searchText.toLowerCase()) ||
      property.location.address.toLowerCase().includes(searchText.toLowerCase()) ||
      property.propertyManager.name.toLowerCase().includes(searchText.toLowerCase());

    const matchesType =
      propertyTypeFilter === 'all' || property.propertyType === propertyTypeFilter;

    const matchesStatus =
      propertyStatusFilter === 'all' || property.status === propertyStatusFilter;

    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const addedDate = new Date(property.createdAt);
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

      {/* Property Statistics */}
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
              title="Sold Properties"
              value={getSoldPropertiesCount()}
              valueStyle={{ color: '#f5222d' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={6}>
          <Input
            placeholder="Search by ID, name, location or manager..."
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
            <Option value="land">Land</Option>
            <Option value="apartment">Apartment</Option>
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
            <Option value="available">Available</Option>
            <Option value="reserved">Reserved</Option>
            <Option value="sold">Sold</Option>
            <Option value="under_construction">Under Construction</Option>
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
        rowKey="_id"
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
          pageData.forEach(({ price }) => {
            pageTotal += price || 0;
          });

          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <strong>Page Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text type="danger">KES {pageTotal.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} colSpan={5}></Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />

      {/* Property Details Drawer */}
      <Drawer
        title={selectedProperty ? `Property Details: ${selectedProperty._id}` : 'Property Details'}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<FileTextOutlined />} style={{ marginRight: 8 }}>
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
                  <Title level={4}>{selectedProperty.name}</Title>
                  <Space direction="vertical">
                    <Text>
                      <HomeOutlined style={{ marginRight: 8 }} />
                      {formatPropertyType(selectedProperty.propertyType)} - {
                        selectedProperty.propertyType === 'land'
                          ? `${selectedProperty.landSize} ${selectedProperty.sizeUnit}`
                          : `${selectedProperty.apartmentSize} sq m`
                      }
                    </Text>
                    <Text>
                      <EnvironmentOutlined style={{ marginRight: 8 }} />
                      {selectedProperty.location.address}, {selectedProperty.location.county}
                    </Text>
                    <Text>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Manager: {selectedProperty.propertyManager.name}
                    </Text>
                  </Space>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Tag
                    color={
                      selectedProperty.status === 'available'
                        ? 'green'
                        : selectedProperty.status === 'reserved'
                          ? 'orange'
                          : selectedProperty.status === 'sold'
                            ? 'red'
                            : 'blue'
                    }
                    style={{ fontSize: '14px', padding: '4px 8px' }}
                  >
                    {formatStatus(selectedProperty.status)}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text>Added:</Text> {selectedProperty.createdAt}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text>Updated:</Text> {selectedProperty.updatedAt}
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
                  selectedProperty.status === 'available'
                    ? 0
                    : selectedProperty.status === 'reserved'
                      ? 1
                      : selectedProperty.status === 'sold'
                        ? 2
                        : selectedProperty.status === 'under_construction'
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
                {selectedProperty.images.map((image, index) => (
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

            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <TabPane tab="Overview" key="1">
                <Card title="Property Overview" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Property Type">
                          {formatPropertyType(selectedProperty.propertyType)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Size">
                          {selectedProperty.propertyType === 'land'
                            ? `${selectedProperty.landSize} ${selectedProperty.sizeUnit}`
                            : `${selectedProperty.apartmentSize} sq m`
                          }
                        </Descriptions.Item>
                        <Descriptions.Item label="Location">
                          {selectedProperty.location.address}
                        </Descriptions.Item>
                        <Descriptions.Item label="County">
                          {selectedProperty.location.county}
                        </Descriptions.Item>
                        <Descriptions.Item label="Constituency">
                          {selectedProperty.location.constituency}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Price">
                          KES {selectedProperty.price.toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                          {formatStatus(selectedProperty.status)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Property Manager">
                          {selectedProperty.propertyManager.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Documents">
                          {selectedProperty.documents.length} documents
                        </Descriptions.Item>
                        <Descriptions.Item label="Date Added">
                          {selectedProperty.createdAt}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                </Card>

                <Card title="Description" style={{ marginBottom: 16 }}>
                  <Paragraph>{selectedProperty.description}</Paragraph>
                </Card>

                {selectedProperty.propertyType === 'land' && (
                  <Card title="Land Details" style={{ marginBottom: 16 }}>
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="Plot Number">
                        {selectedProperty.plotNumber}
                      </Descriptions.Item>
                      <Descriptions.Item label="Land Size">
                        {selectedProperty.landSize} {selectedProperty.sizeUnit}
                      </Descriptions.Item>
                      <Descriptions.Item label="Land Rate per Unit">
                        KES {selectedProperty.landRatePerUnit.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Title Deed Number">
                        {selectedProperty.titleDeedNumber}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}

                {selectedProperty.propertyType === 'apartment' && (
                  <Card title="Apartment Details" style={{ marginBottom: 16 }}>
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="Unit Number">
                        {selectedProperty.unitNumber}
                      </Descriptions.Item>
                      <Descriptions.Item label="Building Name">
                        {selectedProperty.buildingName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bedrooms">
                        {selectedProperty.bedrooms}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bathrooms">
                        {selectedProperty.bathrooms}
                      </Descriptions.Item>
                      <Descriptions.Item label="Floor">
                        {selectedProperty.floor || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Construction Status">
                        {selectedProperty.constructionStatus === 'ready' ? 'Ready' : 'Under Construction'}
                      </Descriptions.Item>
                    </Descriptions>

                    {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                      <>
                        <Divider orientation="left">Amenities</Divider>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedProperty.amenities.map((amenity, idx) => (
                            <Tag key={idx} color="blue">
                              <CheckCircleOutlined /> {amenity}
                            </Tag>
                          ))}
                        </div>
                      </>
                    )}
                  </Card>
                )}
              </TabPane>

              <TabPane tab="Documents" key="2">
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
                        title={item.name}
                        description={`Type: ${item.type} | Uploaded: ${item.uploadedAt}`}
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

              <TabPane tab="Location" key="3">
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
                      at coordinates: {selectedProperty.location.coordinates.coordinates.join(', ')}
                    </Text>
                  </div>
                  <Descriptions title="Location Details" bordered>
                    <Descriptions.Item label="Address" span={3}>
                      {selectedProperty.location.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="County">
                      {selectedProperty.location.county}
                    </Descriptions.Item>
                    <Descriptions.Item label="Constituency">
                      {selectedProperty.location.constituency || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="GPS Coordinates">
                      {selectedProperty.location.coordinates.coordinates.join(', ')}
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
        title={isEditMode ? "Edit Property" : "Add New Property"}
        open={addPropertyVisible}
        onOk={handleAddProperty}
        onCancel={handleModalCancel}
        width={1000}
        okText={isEditMode ? "Update Property" : "Add Property"}
      >
        <Form layout="vertical" form={form}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Information" key="1">
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    label="Property Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter property name' }]}
                  >
                    <Input placeholder="Enter property name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Property Type"
                    name="propertyType"
                    rules={[{ required: true, message: 'Please select property type' }]}
                  >
                    <Select placeholder="Select property type">
                      <Option value="land">Land</Option>
                      <Option value="apartment">Apartment</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter a description' }]}
              >
                <Input.TextArea rows={4} placeholder="Detailed description of the property..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Price (KES)"
                    name="price"
                    rules={[{ required: true, message: 'Please enter the price' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Enter property price"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Status" name="status" initialValue="available">
                    <Select>
                      <Option value="available">Available</Option>
                      <Option value="reserved">Reserved</Option>
                      <Option value="sold">Sold</Option>
                      <Option value="under_construction">Under Construction</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Address"
                    name={['location', 'address']}
                    rules={[{ required: true, message: 'Please enter the address' }]}
                  >
                    <Input placeholder="Street address or area" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="County"
                    name={['location', 'county']}
                    rules={[{ required: true, message: 'Please enter the county' }]}
                  >
                    <Input placeholder="County name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Constituency" name={['location', 'constituency']}>
                    <Input placeholder="Constituency name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="GPS Coordinates (Longitude, Latitude)"
                    name={['location', 'coordinates', 'coordinates']}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();

                          let coords;
                          if (typeof value === 'string') {
                            // Parse string coordinates
                            coords = value
                              .split(/[,\s]+/)
                              .filter(coord => coord.trim())
                              .map(coord => parseFloat(coord))
                              .filter(coord => !isNaN(coord));

                            if (coords.length !== 2) {
                              return Promise.reject('Please enter two numbers for coordinates');
                            }
                          } else if (Array.isArray(value)) {
                            coords = value;
                            if (coords.length !== 2) {
                              return Promise.reject('Please enter two numbers for coordinates');
                            }
                          } else {
                            return Promise.reject('Invalid coordinates format');
                          }

                          const [longitude, latitude] = coords;
                          if (longitude < -180 || longitude > 180) {
                            return Promise.reject('Longitude must be between -180 and 180');
                          }
                          if (latitude < -90 || latitude > 90) {
                            return Promise.reject('Latitude must be between -90 and 90');
                          }

                          return Promise.resolve();
                        }
                      }
                    ]}
                    help="Enter as longitude,latitude (e.g., 36.8219,-1.2921 for Nairobi)"
                  >
                    <Input placeholder="e.g., 36.8219,-1.2921" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Property Manager"
                    name="propertyManager"
                    rules={[{ required: true, message: 'Please select a property manager' }]}
                  >
                    <Select placeholder="Select property manager">
                      <Option value="U001">John Kimani</Option>
                      <Option value="U002">Sarah Wanjiku</Option>
                      <Option value="U003">David Maina</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Property Details" key="2">
              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
                prevValues.propertyType !== currentValues.propertyType
              }>
                {({ getFieldValue }) => {
                  const propertyType = getFieldValue('propertyType');

                  return propertyType === 'land' ? (
                    <>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Plot Number"
                            name="plotNumber"
                            rules={[{ required: true, message: 'Please enter the plot number' }]}
                          >
                            <Input placeholder="Plot/LR Number" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Land Size"
                            name="landSize"
                            rules={[{ required: true, message: 'Please enter land size' }]}
                          >
                            <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="Size amount" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Size Unit" name="sizeUnit" initialValue="acres">
                            <Select>
                              <Option value="acres">Acres</Option>
                              <Option value="hectares">Hectares</Option>
                              <Option value="square_meters">Square Meters</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Land Rate per Unit"
                            name="landRatePerUnit"
                            rules={[{ required: true, message: 'Please enter land rate per unit' }]}
                          >
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                              placeholder="Rate per unit"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            label="Title Deed Number"
                            name="titleDeedNumber"
                            rules={[{ required: true, message: 'Please enter title deed number' }]}
                          >
                            <Input placeholder="Title deed number" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ) : propertyType === 'apartment' ? (
                    <>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Unit Number"
                            name="unitNumber"
                            rules={[{ required: true, message: 'Please enter unit number' }]}
                          >
                            <Input placeholder="Apartment unit number" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Building Name"
                            name="buildingName"
                            rules={[{ required: true, message: 'Please enter building name' }]}
                          >
                            <Input placeholder="Name of the building/complex" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            label="Bedrooms"
                            name="bedrooms"
                            rules={[{ required: true, message: 'Please enter number of bedrooms' }]}
                          >
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="Number of bedrooms" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label="Bathrooms"
                            name="bathrooms"
                            rules={[{ required: true, message: 'Please enter number of bathrooms' }]}
                          >
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="Number of bathrooms" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label="Size (sq m)"
                            name="apartmentSize"
                            rules={[{ required: true, message: 'Please enter apartment size' }]}
                          >
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="Size in square meters" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Floor" name="floor">
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="Floor number" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Construction Status" name="constructionStatus" initialValue="ready">
                            <Select>
                              <Option value="ready">Ready</Option>
                              <Option value="under_construction">Under Construction</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Amenities" name="amenities">
                        <Select mode="tags" style={{ width: '100%' }} placeholder="Add apartment amenities">
                          <Option value="Balcony">Balcony</Option>
                          <Option value="Parking Space">Parking Space</Option>
                          <Option value="Swimming Pool">Swimming Pool</Option>
                          <Option value="Gym">Gym</Option>
                          <Option value="Security">Security</Option>
                          <Option value="Rooftop Garden">Rooftop Garden</Option>
                        </Select>
                      </Form.Item>
                    </>
                  ) : null;
                }}
              </Form.Item>
            </TabPane>

            <TabPane tab="Documents & Images" key="3">
              <Form.Item label="Property Images">
                <Upload.Dragger listType="picture-card" multiple>
                  <p className="ant-upload-drag-icon">
                    <PictureOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag images to upload</p>
                  <p className="ant-upload-hint">Upload clear images of the property</p>
                </Upload.Dragger>
              </Form.Item>

              <Form.Item label="Property Documents">
                <Upload.Dragger multiple>
                  <p className="ant-upload-drag-icon">
                    <FileTextOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag documents to upload</p>
                  <p className="ant-upload-hint">Upload relevant property documents (PDF, DOCX)</p>
                </Upload.Dragger>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDeleteProperty}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the property{' '}
          <strong>{propertyToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default PropertyTable;