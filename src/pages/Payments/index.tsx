import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import PaymentDetailsDrawer from '../../components/drawers/payment'; // Import the drawer component

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Sample data - in a real app this would be imported or fetched from an API
const paymentsData = [
  {
    id: 'PMT001',
    sale: {
      id: 'SLE001',
      property: {
        id: 'PROP001',
        title: 'Garden City 3-Bedroom Apartment',
        type: 'Apartment',
        location: 'Garden City, Thika Road',
      },
    },
    paymentPlan: {
      id: 'PP001',
      totalAmount: 8900000,
      outstandingBalance: 6230000,
      installmentAmount: 222500,
      installmentFrequency: 'monthly',
      startDate: '2025-01-10',
      endDate: '2027-01-10',
      status: 'active',
    },
    customer: {
      id: 'C001',
      name: 'John Kamau',
      contactNumber: '+254 712 345 678',
      email: 'john.kamau@example.com',
      type: 'Individual',
    },
    amount: 222500,
    paymentDate: '2025-02-10',
    paymentMethod: 'mpesa',
    transactionReference: 'MPESA239872459',
    status: 'completed',
    receiptNumber: 'RCP00123',
    receiptDocument: {
      url: 'https://example.com/receipts/RCP00123.pdf',
      generatedAt: '2025-02-10',
    },
    penaltyAmount: 0,
    includesPenalty: false,
    notes: 'Regular monthly payment',
    processedBy: {
      id: 'USR002',
      name: 'Alice Wanjiru',
    },
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
  },
  {
    id: 'PMT002',
    sale: {
      id: 'SLE001',
      property: {
        id: 'PROP001',
        title: 'Garden City 3-Bedroom Apartment',
        type: 'Apartment',
        location: 'Garden City, Thika Road',
      },
    },
    paymentPlan: {
      id: 'PP001',
      totalAmount: 8900000,
      outstandingBalance: 6007500,
      installmentAmount: 222500,
      installmentFrequency: 'monthly',
      startDate: '2025-01-10',
      endDate: '2027-01-10',
      status: 'active',
    },
    customer: {
      id: 'C001',
      name: 'John Kamau',
      contactNumber: '+254 712 345 678',
      email: 'john.kamau@example.com',
      type: 'Individual',
    },
    amount: 222500,
    paymentDate: '2025-03-10',
    paymentMethod: 'bank_transfer',
    transactionReference: 'TRF847362891',
    status: 'completed',
    receiptNumber: 'RCP00145',
    receiptDocument: {
      url: 'https://example.com/receipts/RCP00145.pdf',
      generatedAt: '2025-03-10',
    },
    penaltyAmount: 0,
    includesPenalty: false,
    notes: 'Regular monthly payment',
    processedBy: {
      id: 'USR002',
      name: 'Alice Wanjiru',
    },
    createdAt: '2025-03-10',
    updatedAt: '2025-03-10',
  },
  {
    id: 'PMT003',
    sale: {
      id: 'SLE002',
      property: {
        id: 'PROP002',
        title: 'Westlands Commercial Space',
        type: 'Commercial',
        location: 'Westlands, Nairobi',
      },
    },
    paymentPlan: {
      id: 'PP002',
      totalAmount: 12500000,
      outstandingBalance: 9375000,
      installmentAmount: 312500,
      installmentFrequency: 'monthly',
      startDate: '2025-01-15',
      endDate: '2027-01-15',
      status: 'active',
    },
    customer: {
      id: 'C002',
      name: 'ABC Enterprises Ltd',
      contactNumber: '+254 720 987 654',
      email: 'finance@abcenterprises.co.ke',
      type: 'Corporate',
    },
    amount: 312500,
    paymentDate: '2025-02-15',
    paymentMethod: 'cheque',
    transactionReference: 'CHQ000471',
    status: 'pending',
    receiptNumber: null,
    receiptDocument: null,
    penaltyAmount: 0,
    includesPenalty: false,
    notes: 'Cheque deposited, awaiting clearance',
    processedBy: {
      id: 'USR003',
      name: 'David Ochieng',
    },
    createdAt: '2025-02-15',
    updatedAt: '2025-02-15',
  }
];

const PaymentsList = () => {
  // State definitions
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Handler methods
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleEditPayment = (payment) => {
    console.log('Edit payment:', payment);
    // In a real app, this would open an edit form
  };

  const handleDeletePayment = (payment) => {
    console.log('Delete payment:', payment);
    // In a real app, this would show a confirmation dialog
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Calculate statistics
  const getCompletedPaymentsCount = () => {
    return paymentsData.filter(payment => payment.status === 'completed').length;
  };

  const getTotalPaymentsAmount = () => {
    return paymentsData
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getPendingPaymentsCount = () => {
    return paymentsData.filter(payment => payment.status === 'pending').length;
  };

  const getPendingPaymentsAmount = () => {
    return paymentsData
      .filter(payment => payment.status === 'pending')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  // Filter data
  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.sale.property.title.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === 'all' || payment.paymentMethod === paymentMethodFilter;

    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const paymentDate = new Date(payment.paymentDate);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      matchesDateRange = paymentDate >= startDate && paymentDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange;
  });

  // Table column definitions
  const paymentColumns = [
    {
      title: 'Payment ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text, record) => (
        <a onClick={() => handleViewPayment(record)}>{text}</a>
      ),
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Property',
      dataIndex: ['sale', 'property', 'title'],
      key: 'property',
      width: 200,
      sorter: (a, b) => a.sale.property.title.localeCompare(b.sale.property.title),
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 150,
      sorter: (a, b) => a.customer.name.localeCompare(b.customer.name),
    },
    {
      title: 'Payment Plan',
      dataIndex: ['paymentPlan', 'id'],
      key: 'paymentPlan',
      width: 130,
    },
    {
      title: 'Amount (KES)',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => amount.toLocaleString(),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      sorter: (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method) => {
        let methodText = 'Other';
        let color = 'default';

        switch (method) {
          case 'mpesa':
            methodText = 'M-Pesa';
            color = 'green';
            break;
          case 'bank_transfer':
            methodText = 'Bank Transfer';
            color = 'blue';
            break;
          case 'cash':
            methodText = 'Cash';
            color = 'gold';
            break;
          case 'cheque':
            methodText = 'Cheque';
            color = 'purple';
            break;
        }

        return <Tag color={color}>{methodText}</Tag>;
      },
      filters: [
        { text: 'M-Pesa', value: 'mpesa' },
        { text: 'Bank Transfer', value: 'bank_transfer' },
        { text: 'Cash', value: 'cash' },
        { text: 'Cheque', value: 'cheque' },
        { text: 'Other', value: 'other' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'default';
        let text = status.charAt(0).toUpperCase() + status.slice(1);

        switch (status) {
          case 'pending':
            color = 'orange';
            break;
          case 'completed':
            color = 'green';
            break;
          case 'failed':
            color = 'red';
            break;
          case 'refunded':
            color = 'purple';
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
        { text: 'Failed', value: 'failed' },
        { text: 'Refunded', value: 'refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Receipt #',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 120,
      render: (text) => text || <Text type="secondary">-</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewPayment(record)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditPayment(record)}
            disabled={record.status === 'completed' || record.status === 'refunded'}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeletePayment(record)}
            disabled={record.status === 'completed' || record.status === 'refunded'}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="payments-list-container">
      {/* Payment Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Payments"
              value={getTotalPaymentsAmount()}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              formatter={(value) => `KES ${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Payments"
              value={getCompletedPaymentsCount()}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${paymentsData.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Payments"
              value={getPendingPaymentsCount()}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={getPendingPaymentsAmount()}
              valueStyle={{ color: '#fa541c' }}
              prefix={<ExclamationCircleOutlined />}
              formatter={(value) => `KES ${value.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={6}>
          <Input
            placeholder="Search by ID, property, customer or receipt..."
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
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
            <Option value="refunded">Refunded</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Payment Method"
            defaultValue="all"
            onChange={(value) => setPaymentMethodFilter(value)}
          >
            <Option value="all">All Methods</Option>
            <Option value="mpesa">M-Pesa</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="cash">Cash</Option>
            <Option value="cheque">Cheque</Option>
            <Option value="other">Other</Option>
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

      {/* Payments Table */}
      <Table
        columns={paymentColumns}
        dataSource={filteredPayments}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <strong>Transaction Reference:</strong> {record.transactionReference || 'N/A'}<br />
              <strong>Notes:</strong> {record.notes || 'No notes provided'}
            </p>
          ),
        }}
        summary={(pageData) => {
          if (pageData.length === 0) return null;

          let totalAmount = 0;
          let totalPenalty = 0;

          pageData.forEach(({ amount, penaltyAmount, includesPenalty }) => {
            totalAmount += amount;
            if (includesPenalty && penaltyAmount) {
              totalPenalty += penaltyAmount;
            }
          });

          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <strong>Page Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text type="danger">KES {totalAmount.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} colSpan={4}></Table.Summary.Cell>
                <Table.Summary.Cell index={9}>
                  {totalPenalty > 0 ? (
                    <Text type="danger">KES {totalPenalty.toLocaleString()}</Text>
                  ) : (
                    <Text type="secondary">KES 0</Text>
                  )}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />

      {/* Payment Details Drawer */}
      <PaymentDetailsDrawer
        visible={drawerVisible}
        payment={selectedPayment}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default PaymentsList;