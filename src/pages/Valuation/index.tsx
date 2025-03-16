import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  DeleteOutlined,
  DollarOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  FileDoneOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  Modal,
  Rate,
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
  message,
  Upload,
} from 'antd';
import { useState } from 'react';
import AddValuationModal from '../../components/Modals/addValuation'
import { fetchAllProperties } from '@/services/property';
import { fetchAllCustomers } from '@/services/customer';
import { fetchAllUsers } from '@/services/auth.api';
import { createNewValuation, fetchAllValuations, updateValuation } from '@/services/valuation';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;


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
  const [isEditMode, setIsEditMode] = useState(false);
  const [valuationToEdit, setValuationToEdit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);



  const [form] = Form.useForm();


  const formatCurrency = (amount) => {
    // Check if amount is a valid number, return 0 if it's NaN or undefined
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'KES 0';
    }
    return `KES ${parseFloat(amount).toLocaleString()}`;
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD MMM YYYY');
  };

  // Fetch sales data
  const { data: valuationsData = [], isLoading: isLoadingValuations, refetch: refetchValuations } = useQuery({
    queryKey: ['sale', refreshKey],
    queryFn: async () => {
      try {
        const response = await fetchAllValuations();
        console.log('sales fetched successfully:', response);

        // Process data to use createdAt as dateJoined
        const processedData = Array.isArray(response.data)
          ? response.data.map(valuation => ({
            ...valuation,
            dateJoined: formatDate(valuation.createdAt) || valuation.dateJoined,
          }))
          : [];

        return processedData;
      } catch (error) {
        message.error('Failed to fetch sales');
        console.error('Error fetching sales:', error);
        return [];
      }
    },

    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  const { data: propertiesData = [], isLoading: isLoadingProperties, refetch: refetchProperties } = useQuery({
    queryKey: ['property'],
    queryFn: async () => {
      try {
        const response = await fetchAllProperties();
        return response.data;
      } catch (error) {
        message.error('Failed to fetch properties');
        console.error('Error fetching properties:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch customers data
  const { data: customersData = [], isLoading: isLoadingCustomers, refetch: refetchCustomers } = useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      try {
        const response = await fetchAllCustomers();
        return response.data;
      } catch (error) {
        message.error('Failed to fetch customers');
        console.error('Error fetching customers:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });


  // Fetch users data (agents and managers)
  const { data: userData = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await fetchAllUsers();

        // Return all users
        return Array.isArray(response.data) ? response.data.map(user => ({
          ...user
        })) : [];
      } catch (error) {
        message.error('Failed to fetch users');
        console.error('Error fetching users:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Filter the fetched data for agents and managers
  const valuersData = userData.filter(user => user.role === 'valuer');



  console.log('valuations dta', valuationsData);


  // Table columns for valuations list
  const columns = [
    // {
    //   title: 'Valuation ID',
    //   dataIndex: '_id',
    //   key: '_id',
    //   fixed: 'left',
    //   width: 120,
    //   render: (text, record) => (
    //     <a onClick={() => handleViewValuation(record)}>{text}</a>
    //   ),
    //   sorter: (a, b) => a._id.localeCompare(b._id),
    // },
    {
      title: 'Property',
      dataIndex: ['property', 'name'],
      key: 'property',
      fixed: 'left',
      width: 200,
      sorter: (a, b) => a.property.name.localeCompare(b.property.name),
    },
    {
      title: 'Type',
      dataIndex: ['property', 'propertyType'],
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'apartment' ? 'blue' : 'green'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Apartment', value: 'apartment' },
        { text: 'Land', value: 'land' },
      ],
      onFilter: (value, record) => record.property.propertyType === value,
    },
    {
      title: 'Client',
      dataIndex: ['requestedBy', 'name'],
      key: 'requestedBy',
      width: 150,
      render: (text, record) => (
        <span>
          {text || <Text type="secondary">Not Assigned</Text>}
        </span>
      ),
      sorter: (a, b) => {
        if (!a.requestedBy) return 1;
        if (!b.requestedBy) return -1;
        return a.requestedBy.name.localeCompare(b.requestedBy.name);
      },
    },
    {
      title: 'Purpose',
      dataIndex: 'valuationPurpose',
      key: 'purpose',
      width: 120,
      filters: [
        { text: 'Sale', value: 'sale' },
        { text: 'Mortgage', value: 'mortgage' },
        { text: 'Insurance', value: 'insurance' },
        { text: 'Tax', value: 'tax' },
      ],
      onFilter: (value, record) => record.valuationPurpose === value,
      render: (purpose) => {
        const formattedPurpose = purpose.charAt(0).toUpperCase() + purpose.slice(1);
        return (
          <Tag
            color={
              purpose === 'sale'
                ? 'blue'
                : purpose === 'mortgage'
                  ? 'green'
                  : purpose === 'insurance'
                    ? 'purple'
                    : 'orange'
            }
          >
            {formattedPurpose}
          </Tag>
        );
      },
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'requestDate',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Valuation Date',
      dataIndex: 'valuationDate',
      key: 'valuationDate',
      width: 140,
      render: (date) => (date ? new Date(date).toLocaleDateString() : <Text type="secondary">Pending</Text>),
      sorter: (a, b) => {
        if (!a.valuationDate) return 1;
        if (!b.valuationDate) return -1;
        return new Date(a.valuationDate) - new Date(b.valuationDate);
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        let color = 'default';
        if (!status) status = 'Pending';
        if (status === 'Pending Inspection') color = 'orange';
        if (status === 'In Progress') color = 'blue';
        if (status === 'Completed') color = 'green';
        if (status === 'Canceled') color = 'red';

        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Pending Inspection', value: 'Pending Inspection' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Canceled', value: 'Canceled' },
      ],
      onFilter: (value, record) => (record.status || 'Pending') === value,
    },
    {
      title: 'Valuer',
      dataIndex: ['valuer', 'name'],
      key: 'valuer',
      width: 130,
      render: (name) => name || <Text type="secondary">Not Assigned</Text>,
      filters: [], // This would be populated dynamically based on available valuers
      onFilter: (value, record) => record.valuer && record.valuer.name === value,
    },
    {
      title: 'Market Value (KES)',
      dataIndex: 'marketValue',
      key: 'marketValue',
      width: 160,
      render: (value) =>
        value ? value.toLocaleString() : <Text type="secondary">Pending</Text>,
      sorter: (a, b) => {
        if (!a.marketValue) return 1;
        if (!b.marketValue) return -1;
        return a.marketValue - b.marketValue;
      },
    },
    {
      title: 'Property Price (KES)',
      dataIndex: ['property', 'price'],
      key: 'price',
      width: 160,
      render: (price) => price?.toLocaleString(),
      sorter: (a, b) => (a.property?.price || 0) - (b.property?.price || 0),
    },
    // {
    //   title: 'Documents',
    //   key: 'documents',
    //   width: 120,
    //   render: (_, record) => (
    //     <Space>
    //       {record.reportDocument && (
    //         <Tooltip title="Report">
    //           <Button
    //             icon={<FileTextOutlined />}
    //             size="small"
    //             onClick={() => handleViewDocument(record.reportDocument)}
    //           />
    //         </Tooltip>
    //       )}
    //       {record.certificateDocument && (
    //         <Tooltip title="Certificate">
    //           <Button
    //             icon={<FilePdfOutlined />}
    //             size="small"
    //             onClick={() => handleViewDocument(record.certificateDocument)}
    //           />
    //         </Tooltip>
    //       )}
    //     </Space>
    //   ),
    // },
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

  const handleEditValuation = (valuation) => {
    setIsEditMode(true);
    setValuationToEdit(valuation);

    // Set form values based on existing valuation
    // Use optional chaining to safely access nested properties
    form.setFieldsValue({
      property: valuation.property?._id || valuation.property?.id || valuation.property,
      requestedBy: valuation.requestedBy?._id || valuation.requestedBy?.id || valuation.requestedBy,
      valuationPurpose: valuation.purpose?.toLowerCase() || valuation.valuationPurpose,
      valuer: valuation.valuer?._id || valuation.valuer?.id || valuation.valuer,
      valuationDate: valuation.requestDate ? moment(valuation.requestDate) :
        valuation.valuationDate ? moment(valuation.valuationDate) : null,
      marketValue: valuation.marketValue,
      valuationFee: valuation.valuationFee || 0,
      notes: valuation.notes,
      documents: valuation.documents || [],
      methodology: valuation.methodology || [],
      methodologyNotes: valuation.methodologyNotes,
      forcedSaleValue: valuation.forcedSaleValue,
    });

    setAddValuationVisible(true);
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


  const handleValuationSubmit = () => {
    form.validateFields().then(values => {
      if (isEditMode) {
        // Create a service function to update the valuation similar to your other API calls
        updateValuation(valuationToEdit._id, values)
          .then(updatedValuation => {
            // Show success message
            message.success('Valuation updated successfully!');
            setTimeout(() => {
              setRefreshKey(prevKey => prevKey + 1);
              refetchValuations({ force: true });
            }, 500);

            // Close modal and reset state
            setAddValuationVisible(false);
            setIsEditMode(false);
            setValuationToEdit(null);
            form.resetFields();
          })
          .catch(error => {
            console.error('Error updating valuation:', error);
            message.error('Failed to update valuation. Please try again.');
          });
      } else {
        createNewValuation(values)
          .then(newValuation => {
            // Show success message
            message.success('Valuation logged successfully!');
            setTimeout(() => {
              setRefreshKey(prevKey => prevKey + 1);
              refetchValuations({ force: true });
            }, 500);

            // Close modal
            setAddValuationVisible(false);
            form.resetFields();
          })
          .catch(error => {
            console.error('Error adding Valuation:', error);
            message.error('Failed to add Valuation. Please try again.');
          });
      }
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
    });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsEditMode(false);
    setValuationToEdit(null);
    setAddValuationVisible(false);
  };


  // Calculate valuation totals
  const getTotalValuationFee = () => {
    return valuationsData.reduce(
      (total, valuation) => total + valuation.valuationFee || 0,
      0,
    );
  };

  const getTotalPropertyValue = () => {
    return valuationsData
      .filter((valuation) => valuation.marketValue)
      .reduce((total, valuation) => total + valuation.marketValue, 0);
  };

  const getCompletedValuationsCount = () => {
    return valuationsData.filter(
      (valuation) => valuation.status === 'Completed',
    ).length;
  };

  const getPendingValuationsCount = () => {
    return valuationsData.filter(
      (valuation) =>
        valuation.status !== 'Completed' && valuation.status !== 'Canceled',
    ).length;
  };

  // Filter valuations based on search text and filters
  const filteredValuations = valuationsData.filter((valuation) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      (valuation.id?.toLowerCase().includes(search) || false) ||
      (valuation.property?.title?.toLowerCase().includes(search) || false) ||
      (valuation.requestedBy?.name?.toLowerCase().includes(search) || false) ||
      (valuation.valuer?.name?.toLowerCase().includes(search) || false);

    const matchesStatus =
      valuationStatusFilter === 'all' || valuation.status === valuationStatusFilter;

    const matchesPurpose =
      valuationPurposeFilter === 'all' || valuation.purpose === valuationPurposeFilter;

    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const requestDate = new Date(valuation.requestDate);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      matchesDateRange = requestDate >= startDate && requestDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesPurpose && matchesDateRange;
  });

  return (
    <>
      <Space className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddValuationVisible(true)}
        >
          Request Valuation
        </Button>
      </Space>
      {/* Valuation Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Property Value"
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
              formatter={(value) => `KES ${value.toLocaleString()}`}
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
            onChange={(value) => setValuationStatusFilter(value)}
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
            onChange={(value) => setValuationPurposeFilter(value)}
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

      {/* Valuations Table */}
      <Table
        columns={columns}
        dataSource={filteredValuations}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <strong>Notes:</strong> {record.notes}
            </p>
          ),
        }}
        summary={(pageData) => {
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
                <Table.Summary.Cell index={0} colSpan={8}>
                  <strong>Page Total</strong>
                </Table.Summary.Cell>
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

      {/* Valuation Details Drawer */}
      <Drawer
        title={
          selectedValuation
            ? `Valuation Details`
            : 'Valuation Details'
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={700}
        footer={
          <div style={{ textAlign: 'right' }}>
            {selectedValuation && selectedValuation.status === 'Completed' && (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                style={{ marginRight: 8 }}
              >
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
                    <Text>
                      <HomeOutlined style={{ marginRight: 8 }} />
                      {selectedValuation.property.type} -{' '}
                      {selectedValuation.property.size}
                    </Text>
                    <Text>
                      <EnvironmentOutlined style={{ marginRight: 8 }} />
                      {selectedValuation.property?.location?.address}
                    </Text>
                    <Text>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Client: {selectedValuation?.requestedBy?.name}
                    </Text>
                  </Space>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Tag
                    color={
                      selectedValuation.status === 'Pending Inspection'
                        ? 'orange'
                        : selectedValuation.status === 'In Progress'
                          ? 'blue'
                          : selectedValuation.status === 'Completed'
                            ? 'green'
                            : 'red'
                    }
                    style={{ fontSize: '14px', padding: '4px 8px' }}
                  >
                    {selectedValuation.status}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Request Date:</Text>{' '}
                    {selectedValuation.requestDate}
                  </div>
                  {selectedValuation.completionDate && (
                    <div style={{ marginTop: 4 }}>
                      <Text strong>Completion Date:</Text>{' '}
                      {selectedValuation.completionDate}
                    </div>
                  )}
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Valuation Progress Steps */}
            <div style={{ marginBottom: 24 }}>
              <Steps
                size="small"
                current={
                  selectedValuation.status === 'Pending Inspection'
                    ? 0
                    : selectedValuation.status === 'In Progress'
                      ? 1
                      : selectedValuation.status === 'Completed'
                        ? 2
                        : 0
                }
              >
                <Steps.Step title="Inspection" />
                <Steps.Step title="Valuation" />
                <Steps.Step title="Report" />
              </Steps>
            </div>

            {/* Valuation Overview */}
            <Card title="Valuation Overview" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Valuation Purpose">
                      {selectedValuation.valuationPurpose}
                    </Descriptions.Item>
                    <Descriptions.Item label="Valuer">
                      {selectedValuation.valuer?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Valuation Fee">
                      KES {selectedValuation?.valuationFee ? selectedValuation?.valuationFee.toLocaleString() : 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Methodology">
                      {selectedValuation.methodology.join(', ') ||
                        'Not determined yet'}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Market Value">
                      {selectedValuation?.marketValue
                        ? `KES ${selectedValuation.marketValue.toLocaleString()}`
                        : 'Pending'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Forced Sale Value">
                      {selectedValuation?.forcedSaleValue
                        ? `KES ${selectedValuation.forcedSaleValue.toLocaleString()}`
                        : 'Pending'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Report">
                      {selectedValuation?.report || 'Not available yet'}
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="Documents">
                      {selectedValuation?.documents ? selectedValuation?.documents.length : 0} documents
                    </Descriptions.Item> */}
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <TabPane tab="Property Details" key="1">
                <Card title="Property Information" style={{ marginBottom: 16 }}>
                  <Descriptions
                    bordered
                    column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                  >
                    {/* <Descriptions.Item label="Property ID">
                      {selectedValuation.property.id}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Property Type">
                      {selectedValuation.property.type}
                    </Descriptions.Item>
                    <Descriptions.Item label="Size">
                      {selectedValuation.property.size}
                    </Descriptions.Item>
                    <Descriptions.Item label="Location">
                      {selectedValuation.property?.location?.address}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {selectedValuation.status !== 'Pending Inspection' && selectedValuation?.propertyRatings && (
                  <Card title="Property Ratings" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      {Object.entries(selectedValuation.propertyRatings).map(
                        ([key, value]) => (
                          <Col span={12} key={key} style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Text style={{ textTransform: 'capitalize' }}>
                                {key}:
                              </Text>
                              <Rate disabled defaultValue={value} />
                            </div>
                          </Col>
                        ),
                      )}
                    </Row>
                  </Card>
                )}
                {selectedValuation.comparableProperties && selectedValuation.comparableProperties.length > 0 && (
                  <Card
                    title="Comparable Properties"
                    style={{ marginBottom: 16 }}
                  >
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
                          render: (price) => price.toLocaleString(),
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
                  {selectedValuation.timeline && selectedValuation.timeline.map((item, index) => (
                    <Timeline.Item
                      key={index}
                      label={item.date}
                      color={
                        item.event === 'Final Report'
                          ? 'green'
                          : item.event === 'Draft Report'
                            ? 'blue'
                            : item.event === 'Site Visit'
                              ? 'blue'
                              : 'gray'
                      }
                    >
                      <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                      <div>{item.description}</div>
                    </Timeline.Item>
                  ))}

                  {selectedValuation.status !== 'Completed' &&
                    selectedValuation.status !== 'Canceled' && (
                      <Timeline.Item
                        label="Upcoming"
                        color="gray"
                        dot={<ClockCircleOutlined />}
                      >
                        <div style={{ fontWeight: 'bold' }}>
                          {selectedValuation.status === 'Pending Inspection'
                            ? 'Site Inspection'
                            : 'Finalize Report'}
                        </div>
                        <div>Scheduled activity in the valuation process</div>
                      </Timeline.Item>
                    )}
                </Timeline>

                {selectedValuation.status !== 'Completed' &&
                  selectedValuation.status !== 'Canceled' && (
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
                    <Descriptions.Item label="Name">
                      {selectedValuation?.requestedBy?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Client Type">
                      <Tag
                        color={
                          selectedValuation?.requestedBy?.type === 'Institution'
                            ? 'gold'
                            : 'blue'
                        }
                      >
                        {selectedValuation?.requestedBy?.type}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Contact Number">
                      {selectedValuation.requestedBy?.contactNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {selectedValuation?.requestedBy?.email}
                    </Descriptions.Item>
                  </Descriptions>
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Space>
                      <Button icon={<MailOutlined />}>Send Email</Button>
                      <Button icon={<PhoneOutlined />}>Call</Button>
                      <Button type="primary" icon={<UserOutlined />}>
                        View Profile
                      </Button>
                    </Space>
                  </div>
                </Card>
              </TabPane>

              {/* <TabPane tab="Documents" key="4">
                <List
                  itemLayout="horizontal"
                  dataSource={selectedValuation.documents}
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
                {selectedValuation.status !== 'Completed' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginTop: 16 }}
                  >
                    Upload Document
                  </Button>
                )}
              </TabPane> */}

              <TabPane tab="Notes" key="5">
                <Card>
                  <Paragraph>
                    {selectedValuation.notes || 'No notes available.'}
                  </Paragraph>
                  {selectedValuation.status !== 'Completed' && (
                    <div style={{ marginTop: 16 }}>
                      <Input.TextArea
                        rows={4}
                        placeholder="Add notes here..."
                      />
                      <Button type="primary" style={{ marginTop: 8 }}>
                        Save Notes
                      </Button>
                    </div>
                  )}
                </Card>
              </TabPane>
            </Tabs>
          </>
        )}
      </Drawer>

      {/* Request Valuation Modal */}
      <AddValuationModal
        visible={addValuationVisible}
        isEditMode={isEditMode}
        propertiesData={propertiesData}
        customersData={customersData}
        isLoadingCustomers={isLoadingCustomers}
        isLoadingProperties={isLoadingProperties}
        valuersData={valuersData}
        isLoadingUsers={isLoadingUsers}
        formatCurrency={formatCurrency}
        valuationToEdit={valuationToEdit} // Uncomment this line
        form={form}
        onOk={handleValuationSubmit}
        onCancel={handleModalCancel}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onOk={handleDeleteValuation}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the valuation{' '}
          {/* <strong>{valuationToDelete?.id}</strong> for property{' '} */}
          <strong>{valuationToDelete?.property.title}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default ValuationManagement;
