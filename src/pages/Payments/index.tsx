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
  message,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  DownOutlined,
  EyeOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  SearchOutlined,
  AreaChartOutlined,
  PlusOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import PaymentDetailsDrawer from '../../components/drawers/payment'; // Import the drawer component
import AddPaymentModal from '../../components/Modals/addPayment'; // Import the new payment modal
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
  const [addPaymentModalVisible, setAddPaymentModalVisible] = useState(false);

  const { data: paymentsData = [], isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments', refreshKey],
    queryFn: async () => {
      try {
        const response = await fetchAllPayments();
        console.log('Payments fetched successfully:', response);

        // Process data to use createdAt as dateJoined
        const processedData = Array.isArray(response.data)
          ? response.data.map(payment => ({
            ...payment,
            dateJoined: formatDate(payment.createdAt) || payment.dateJoined,
          }))
          : [];

        return processedData;
      } catch (error) {
        message.error('Failed to fetch payments');
        console.error('Error fetching payments:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

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

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Show add payment modal
  const showAddPaymentModal = () => {
    setAddPaymentModalVisible(true);
  };

  // Handle payment added successfully
  const handlePaymentAdded = (newPayment) => {
    // Refresh the payments list
    setRefreshKey(prevKey => prevKey + 1);
    message.success('Payment added successfully!');
  };

  // Calculate updated statistics
  const getTotalTransactionsCount = () => {
    return paymentsData.length;
  };

  const getTotalPaymentsAmount = () => {
    return paymentsData.reduce((total, payment) => total + (payment.amount || 0), 0);
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
    const total = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    return total / paymentsData.length;
  };

  // Filter data
  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch =
      payment._id?.toLowerCase().includes(searchText.toLowerCase()) ||
      (payment.sale?.property?.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (payment.customer?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (payment?.receiptNumber || '').toLowerCase().includes(searchText.toLowerCase());

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

  // Helper function to get payment plan display text
  const getPaymentPlanDisplay = (payment) => {
    // Handle case with multiple payment plans
    if (payment.paymentPlans && payment.paymentPlans.length > 0) {
      if (payment.paymentPlans.length === 1) {
        // Single payment plan - show total amount if available
        const plan = payment.paymentPlans[0];
        if (plan.totalAmount) {
          return `KES ${plan.totalAmount.toLocaleString() || 0}`;
        } else {
          return plan._id ? `Plan ID: ${String(plan._id).slice(-6)}` : 'Single Plan';
        }
      } else {
        // Multiple payment plans - show count
        return `${payment.paymentPlans.length} Plans`;
      }
    }

    // Handle backward compatibility with old structure
    if (payment.paymentPlan && payment.paymentPlan.totalAmount) {
      return `KES ${payment.paymentPlan.totalAmount.toLocaleString() || 0}`;
    }

    return 'N/A';
  };

  // Table column definitions
  const paymentColumns = [
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      fixed: true,
      width: 150,
      render: (text) => text || 'N/A',
      sorter: (a, b) => {
        const nameA = a.customer?.name || '';
        const nameB = b.customer?.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Payment Plan',
      key: 'paymentPlan',
      width: 130,
      render: (_, record) => {
        // Handle multiple payment plans
        if (record.paymentPlans && record.paymentPlans.length > 1) {
          return (
            <Tooltip title={`Applied to ${record.paymentPlans.length} payment plans`}>
              <Tag color="blue">{record.paymentPlans.length} Plans</Tag>
            </Tooltip>
          );
        }

        // Handle single payment plan
        return getPaymentPlanDisplay(record);
      },
    },
    {
      title: 'Amount (KES)',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => (amount || 0).toLocaleString(),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a, b) => {
        if (!a.paymentDate) return -1;
        if (!b.paymentDate) return 1;
        return new Date(a.paymentDate) - new Date(b.paymentDate);
      },
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
        let text = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

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
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewPayment(record)}
          />
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
      {/* Add Payment Button */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddPaymentModal}
        >
          Add Payment
        </Button>
      </div>

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
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }}
        loading={isLoadingPayments}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ margin: 0 }}>
              <p>
                <strong>Transaction Reference:</strong> {record.transactionReference || 'N/A'}<br />
                <strong>Notes:</strong> {record.notes || 'No notes provided'}
              </p>

              {/* Display allocation details if present */}
              {record.allocation && record.allocation.length > 0 && (
                <div>
                  <strong>Payment Allocation:</strong>
                  <ul style={{ marginTop: 5 }}>
                    {record.allocation.map((item, index) => (
                      <li key={index}>
                        Plan {item.paymentPlan
                          ? (item.paymentPlan.name || String(item.paymentPlan).slice(-6))
                          : index + 1}: KES {item.amount.toLocaleString()}
                        ({item.appliedTo.charAt(0).toUpperCase() + item.appliedTo.slice(1)})
                        {item.notes && ` - ${item.notes}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show sale information if available */}
              {record.sale && (
                <p style={{ marginTop: 10 }}>
                  <strong>Sale Reference:</strong> {record.sale.saleCode || String(record.sale).slice(-6)}<br />
                  {record.sale.property && (
                    <><strong>Property:</strong> {record.sale.property.name || 'N/A'}</>
                  )}
                </p>
              )}
            </div>
          ),
        }}
        summary={(pageData) => {
          if (pageData.length === 0) return null;

          let totalAmount = 0;
          let totalPenalty = 0;

          pageData.forEach(({ amount, penaltyAmount, includesPenalty }) => {
            totalAmount += amount || 0;
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

      {/* Add Payment Modal */}
      <AddPaymentModal
        visible={addPaymentModalVisible}
        onCancel={() => setAddPaymentModalVisible(false)}
        onSuccess={handlePaymentAdded}
      />
    </div>
  );
};

export default PaymentsList;