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
  AreaChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import PaymentDetailsDrawer from '../../components/drawers/payment'; // Import the drawer component
import { fetchAllPayments } from '@/services/payments';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentsList = () => {
  // State definitions
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);


  const { data: paymentsData = [], isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['sale', refreshKey],
    queryFn: async () => {
      try {
        const response = await fetchAllPayments();
        console.log('sales fetched successfully:', response);

        // Process data to use createdAt as dateJoined
        const processedData = Array.isArray(response.data)
          ? response.data.map(payment => ({
            ...payment,
            dateJoined: formatDate(payment.createdAt) || payment.dateJoined,
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

  console.log('payment vasl', paymentsData);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD MMM YYYY');
  };

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

  // Calculate updated statistics
  const getTotalTransactionsCount = () => {
    return paymentsData.length;
  };

  const getTotalPaymentsAmount = () => {
    return paymentsData.reduce((total, payment) => total + payment.amount, 0);
  };

  const getPaymentMethodStats = () => {
    const methodCounts = {};

    paymentsData.forEach(payment => {
      const method = payment.paymentMethod || 'other';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    const mostCommonMethod = Object.entries(methodCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([method, count]) => method)[0] || 'N/A';

    return {
      mostCommonMethod,
      counts: methodCounts
    };
  };

  const getRecentPaymentsCount = () => {
    const thirtyDaysAgo = moment().subtract(30, 'days');
    return paymentsData.filter(payment =>
      moment(payment.paymentDate).isAfter(thirtyDaysAgo)
    ).length;
  };

  // Get average payment amount
  const getAveragePaymentAmount = () => {
    if (paymentsData.length === 0) return 0;
    const total = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
    return total / paymentsData.length;
  };

  // Filter data
  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch =
      payment._id.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.sale.property.title.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (payment?.receiptNumber && payment?.receiptNumber.toLowerCase().includes(searchText.toLowerCase()));

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
      title: 'Property',
      dataIndex: ['sale', 'property', 'name'],
      key: 'property',
      fixed: true,
      width: 200,
      sorter: (a, b) => a.sale.property.name.localeCompare(b.sale.property.name),
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
      dataIndex: ['paymentPlan', 'totalAmount'],
      key: 'paymentPlan',
      width: 130,
      render: (amount) => `KES ${amount?.toLocaleString() || 0}`,
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
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method) => {
        let methodText = 'Other';
        let color = 'gray';

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
            color = 'yellow';
            break;
          case 'cheque':
            methodText = 'Cheque';
            color = 'purple';
            break;
        }
        return <Tag color={color}>{methodText}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'gray';
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
    },
    {
      title: 'Receipt #',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 120,
      render: (text) => text || <span className="text-gray-400">-</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            className="p-1 border border-gray-300 rounded"
            onClick={() => handleViewPayment(record)}
            type="button"
          >
            <EyeOutlined />
          </button>
        </div>
      ),
    },
  ];

  // Get the most common payment method
  const { mostCommonMethod } = getPaymentMethodStats();

  // Get payment method display name for statistics
  const getMethodDisplayName = (method) => {
    switch (method) {
      case 'mpesa': return 'M-Pesa';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'cheque': return 'Cheque';
      default: return 'Other';
    }
  };

  return (
    <div className="payments-list-container">
      {/* Updated Payment Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Amount Received"
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
              title="Total Transactions"
              value={getTotalTransactionsCount()}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Recent Payments (30 days)"
              value={getRecentPaymentsCount()}
              valueStyle={{ color: '#faad14' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Payment Amount"
              value={getAveragePaymentAmount()}
              valueStyle={{ color: '#722ed1' }}
              prefix={<AreaChartOutlined />}
              formatter={(value) => `KES ${value.toLocaleString()}`}
            />
            <Text type="secondary">Most used: {getMethodDisplayName(mostCommonMethod)}</Text>
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