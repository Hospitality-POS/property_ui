import {
  AppstoreOutlined,
  CalendarOutlined,
  CommentOutlined,
  CreditCardOutlined,
  DollarOutlined,
  DownloadOutlined,
  EnvironmentFilled,
  EnvironmentOutlined,
  FilePdfOutlined,
  HomeFilled,
  IdcardOutlined,
  InfoCircleOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  PlusOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ProCard,
  ProDescriptions,
  ProList,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  message,
  Row,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import generateCustomerStatementPDF from '../Util/generateCustomerStatementPDF';

interface CustomerDrawerProps {
  visible: boolean;
  customer: any;
  onClose: () => void;
}

interface PropertyPreferences {
  propertyTypes?: string[];
  locations?: string[];
  budgetRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  otherRequirements?: string;
}

const { Text } = Typography;

const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  visible,
  customer,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    if (visible) {
      setActiveTab('1');
    }
  }, [visible]);

  if (!customer) {
    return null;
  }

  const onAddCommunication = (customer: any) => {
    console.log('add communication', customer);
  };

  const onAddNote = (customer: any) => {
    console.log('add note', customer);
  };
  // Internal date formatting functions with safety checks
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return moment(dateString).format('DD MMM YYYY'); // e.g. 12 Mar 2025
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return moment(dateString).format('DD MMM YYYY, h:mm A'); // e.g. 12 Mar 2025, 2:30 PM
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = moment(dateString);
      const now = moment();

      if (now.diff(date, 'days') < 1) {
        return date.fromNow(); // e.g. "2 hours ago"
      } else if (now.diff(date, 'days') < 7) {
        return `${now.diff(date, 'days')} days ago`;
      } else {
        return formatDate(dateString);
      }
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Handle potentially missing fields in the customer object
  const getAddress = () => {
    if (!customer.address || typeof customer.address !== 'object')
      return 'No address provided';

    const parts = [];
    if (customer.address.street) parts.push(customer.address.street);
    if (customer.address.city) parts.push(customer.address.city);
    if (customer.address.country) parts.push(customer.address.country);

    return parts.join(', ') || 'No address details';
  };

  // Count purchases and payment plans safely
  const purchaseCount = (() => {
    if (!customer.purchases) return 0;
    if (typeof customer.purchases === 'number') return customer.purchases;
    if (Array.isArray(customer.purchases)) return customer.purchases.length;
    return 0;
  })();

  const paymentPlanCount = (() => {
    if (!customer.paymentPlans) return 0;
    if (typeof customer.paymentPlans === 'number') return customer.paymentPlans;
    if (Array.isArray(customer.paymentPlans))
      return customer.paymentPlans.length;
    return 0;
  })();

  const communicationCount = (() => {
    if (!customer.communications) return 0;
    if (typeof customer.communications === 'number')
      return customer.communications;
    if (Array.isArray(customer.communications))
      return customer.communications.length;
    return 0;
  })();

  // Super-safe data processing for tables
  const safelyProcessArray = (arr: any, processor: any) => {
    if (!arr) return [];
    if (!Array.isArray(arr)) return [];
    return arr.map(processor).filter(Boolean); // Filter out any null/undefined results
  };

  // Process purchase data safely
  const processPurchase = (purchase: any) => {
    if (!purchase || typeof purchase !== 'object') return null;

    try {
      return {
        key: purchase._id || Math.random().toString(),
        id: purchase._id,
        property: purchase.property,
        date: purchase.saleDate,
        amount: purchase.salePrice,
        status: purchase.status,
      };
    } catch (err) {
      console.error('Error processing purchase:', err);
      return null;
    }
  };

  // Process payment plan data safely
  const processPaymentPlan = (plan: any) => {
    if (!plan || typeof plan !== 'object') return null;

    try {
      return {
        key: plan._id,
        id: plan._id,
        totalAmount: plan.totalAmount,
        initialDeposit: plan.initialDeposit,
        outstandingBalance: plan.outstandingBalance,
        status: plan.status,
        completionPercentage:
          plan.totalAmount > 0
            ? Math.round(
                ((plan.totalAmount - plan.outstandingBalance) /
                  plan.totalAmount) *
                  100,
              )
            : 0,
      };
    } catch (err) {
      console.error('Error processing payment plan:', err);
      return null;
    }
  };

  // Create safe data sources for tables
  const purchasesData = safelyProcessArray(customer.purchases, processPurchase);
  const paymentPlansData = safelyProcessArray(
    customer.paymentPlans,
    processPaymentPlan,
  );

  // Process communications data
  const processCommunication = (comm: any) => {
    if (!comm || typeof comm !== 'object') return null;

    try {
      return {
        ...comm,
        key: comm._id || Math.random().toString(),
        formattedDate: formatDateTime(comm.date),
      };
    } catch (err) {
      console.error('Error processing communication:', err);
      return null;
    }
  };

  const communicationsData = customer.communications
    ? [...customer.communications]
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
        )
        .map(processCommunication)
        .filter(Boolean)
    : [];

  // Function to handle statement extraction
  const handleExtractStatement = async (planId = null) => {
    try {
      message.loading({
        content: 'Generating statement...',
        key: 'pdfGeneration',
      });

      // Generate the PDF
      const pdfBlob = await generateCustomerStatementPDF(customer, planId);

      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob);

      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = planId
        ? `${customer.name.replace(
            /\s+/g,
            '-',
          )}-plan-statement-${planId?.substring(0, 8)}.pdf`
        : `${customer.name.replace(/\s+/g, '-')}-customer-statement.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success({
        content: 'Statement generated successfully!',
        key: 'pdfGeneration',
        duration: 2,
      });
    } catch (error) {
      console.error('Error generating statement:', error);
      message.error({
        content: 'Failed to generate statement',
        key: 'pdfGeneration',
        duration: 2,
      });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Get status color for payment plan progress
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 40) return '#1890ff';
    return '#faad14';
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneOutlined className="text-blue-500" />;
      case 'email':
        return <MailOutlined className="text-purple-500" />;
      case 'meeting':
        return <TeamOutlined className="text-green-500" />;
      case 'sms':
        return <MessageOutlined className="text-orange-500" />;
      default:
        return <MessageOutlined className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, context = 'default') => {
    // For purchases
    if (context === 'purchase') {
      if (status === 'completed') return 'success';
      if (status === 'cancelled') return 'error';
      if (status === 'pending') return 'warning';
      if (status === 'reservation') return 'purple';
      return 'default';
    }

    // For payment plans
    if (context === 'payment') {
      if (status === 'completed') return 'success';
      if (status === 'inactive') return 'error';
      if (status === 'pending') return 'warning';
      return 'default';
    }

    // Default fallback
    return 'default';
  };

  console.log('customer?', customer);

  // Safely get preferences
  const getPreferences = (): PropertyPreferences => {
    if (!customer.preferences || typeof customer.preferences !== 'object') {
      return {};
    }
    return customer.preferences;
  };

  const preferences = getPreferences();
  const hasPreferences =
    preferences &&
    ((Array.isArray(preferences.propertyTypes) &&
      preferences.propertyTypes.length > 0) ||
      (Array.isArray(preferences.locations) &&
        preferences.locations.length > 0) ||
      (preferences.budgetRange &&
        (preferences.budgetRange.min || preferences.budgetRange.max)) ||
      (Array.isArray(preferences.amenities) &&
        preferences.amenities.length > 0) ||
      preferences.otherRequirements);

  return (
    <Drawer
      title={
        <div className="flex items-center">
          <Avatar
            size={40}
            className="mr-3 bg-blue-600 flex items-center justify-center"
            icon={<UserOutlined />}
          >
            {getInitials(customer.name)}
          </Avatar>
          <div>
            <div className="text-lg font-medium">{customer.name}</div>
            <div className="text-xs text-gray-500">
              <Text className="mr-2">ID: {customer.idNumber}</Text>
              <Tag
                color={
                  customer.customerType === 'individual' ? 'blue' : 'purple'
                }
                className="ml-1"
              >
                {customer.customerType === 'individual'
                  ? 'Individual'
                  : 'Company'}
              </Tag>
            </div>
          </div>
        </div>
      }
      destroyOnClose={true}
      width={800}
      styles={{ body: { padding: '16px' } }}
      footer={
        <div className="flex justify-between">
          <Button onClick={onClose}>Close</Button>
          <Space>
            <Button
              onClick={() => handleExtractStatement()}
              icon={<FilePdfOutlined />}
            >
              Extract Statement
            </Button>
            <Button
              onClick={() => onAddCommunication(customer)}
              icon={<MessageOutlined />}
            >
              Log Communication
            </Button>
            <Button
              onClick={() => onAddNote(customer)}
              icon={<CommentOutlined />}
            >
              Add Note
            </Button>
            <Button type="primary" onClick={onClose}>
              Save & Close
            </Button>
          </Space>
        </div>
      }
      open={visible}
      onClose={onClose}
    >
      <div className="mb-4">
        <ProCard className="rounded-lg w-full" headerBordered>
          <Row gutter={16} className="w-full">
            <Col xs={24} md={12} className="w-full">
              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex items-center">
                  <PhoneOutlined className="text-blue-500 mr-2" />
                  <Text className="mr-2">{customer.phone}</Text>
                  {customer.verifiedPhone === true && (
                    <Badge status="success" text="Verified" />
                  )}
                </div>

                {customer.alternatePhone && (
                  <div className="flex items-center">
                    <PhoneOutlined className="text-gray-400 mr-2" />
                    <Text type="secondary" className="mr-2">
                      {customer.alternatePhone}
                    </Text>
                    <Badge status="default" text="Alternate" />
                  </div>
                )}

                <div className="flex items-center">
                  <MailOutlined className="text-blue-500 mr-2" />
                  <Text ellipsis={true} title={customer.email}>
                    {customer.email}
                  </Text>
                </div>

                <div className="flex items-start">
                  <EnvironmentOutlined className="text-blue-500 mr-2 mt-1" />
                  <Text>{getAddress()}</Text>
                </div>
              </Space>
            </Col>

            <Col xs={24} md={12} className="w-full">
              <Space direction="vertical" size="middle" className="w-full">
                {customer.company && (
                  <div className="mb-2 flex items-center">
                    <TeamOutlined className="mr-2 text-blue-500" />
                    <Text strong>Company:</Text>{' '}
                    <Text className="ml-1">{customer.company}</Text>
                  </div>
                )}

                {customer.occupation && (
                  <div className="mb-2 flex items-center">
                    <IdcardOutlined className="mr-2 text-blue-500" />
                    <Text strong>Occupation:</Text>{' '}
                    <Text className="ml-1">{customer.occupation}</Text>
                  </div>
                )}

                {customer.leadSource && (
                  <div className="mb-2 flex items-center">
                    <InfoCircleOutlined className="mr-2 text-blue-500" />
                    <Text strong>Source:</Text>{' '}
                    <Tag color="orange" className="ml-1">
                      {customer.leadSource || 'Not specified'}
                    </Tag>
                  </div>
                )}

                <div className="mb-2 flex items-center">
                  <CalendarOutlined className="mr-2 text-blue-500" />
                  <Text strong>Since:</Text>{' '}
                  <Text className="ml-1">{formatDate(customer.createdAt)}</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </ProCard>
      </div>

      <StatisticCard.Group className="mb-4" direction="row">
        <StatisticCard
          statistic={{
            title: 'Purchases',
            value: purchaseCount,
            icon: <ShoppingOutlined className="text-blue-500" />,
            valueStyle: { color: '#1890ff' },
            suffix: purchaseCount === 1 ? 'item' : 'items',
          }}
        />
        <StatisticCard
          statistic={{
            title: 'Payment Plans',
            value: paymentPlanCount,
            icon: <CreditCardOutlined className="text-green-600" />,
            valueStyle: { color: '#52c41a' },
            suffix: paymentPlanCount === 1 ? 'plan' : 'plans',
          }}
        />
        <StatisticCard
          statistic={{
            title: 'Communications',
            value: communicationCount,
            icon: <MessageOutlined className="text-purple-600" />,
            valueStyle: { color: '#722ed1' },
            suffix: communicationCount === 1 ? 'log' : 'logs',
          }}
        />
      </StatisticCard.Group>

      <Tabs
        defaultActiveKey="1"
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
      >
        <Tabs.TabPane tab="Overview" key="1">
          <ProCard title="Customer Information" className="mb-4 rounded-lg">
            <ProDescriptions
              column={2}
              bordered
              dataSource={customer}
              columns={[
                {
                  title: 'Full Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Phone Number',
                  dataIndex: 'phone',
                  key: 'phone',
                  render: (text) => (
                    <Space>
                      {text}
                      {customer.verifiedPhone && (
                        <Badge status="success" text="Verified" />
                      )}
                    </Space>
                  ),
                },
                {
                  title: 'Alt. Phone',
                  dataIndex: 'alternatePhone',
                  key: 'alternatePhone',
                  hideInDescriptions: !customer.alternatePhone,
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                },
                {
                  title: 'ID Number',
                  dataIndex: 'idNumber',
                  key: 'idNumber',
                },
                {
                  title: 'Customer Type',
                  dataIndex: 'customerType',
                  key: 'customerType',
                  valueEnum: {
                    individual: { text: 'Individual', status: 'Success' },
                    company: { text: 'Company', status: 'Processing' },
                  },
                },
                {
                  title: 'Company',
                  dataIndex: 'company',
                  key: 'company',
                  hideInDescriptions: !customer.company,
                },
                {
                  title: 'Lead Source',
                  dataIndex: ['leadSource'],
                  key: 'leadSource',
                  render: (text) => text || 'Not specified',
                },
              ]}
            />
          </ProCard>

          <ProCard title="Address Information" className="mb-4 rounded-lg">
            <ProDescriptions
              column={2}
              bordered
              dataSource={customer.address || {}}
              columns={[
                {
                  title: 'Street',
                  dataIndex: 'street',
                  key: 'street',
                  render: (text) => text || 'Not provided',
                },
                {
                  title: 'City',
                  dataIndex: 'city',
                  key: 'city',
                  render: (text) => text || 'Not provided',
                },
                {
                  title: 'Postal Code',
                  dataIndex: 'postalCode',
                  key: 'postalCode',
                  render: (text) => text || 'Not provided',
                },
                {
                  title: 'County',
                  dataIndex: 'county',
                  key: 'county',
                  render: (text) => text || 'Not provided',
                },
                {
                  title: 'Country',
                  dataIndex: 'country',
                  key: 'country',
                  render: (text) => text || 'Not provided',
                },
              ]}
            />
          </ProCard>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Preferences" key="7">
          {hasPreferences ? (
            <ProCard title="Property Preferences" className="rounded-lg mb-4">
              <Row gutter={[16, 16]}>
                {preferences.propertyTypes &&
                  preferences.propertyTypes.length > 0 && (
                    <Col xs={24} md={12}>
                      <Card
                        title={
                          <>
                            <HomeFilled className="text-blue-500 mr-2" />
                            Property Types
                          </>
                        }
                        size="small"
                        className="h-full"
                      >
                        <div className="mt-2">
                          {preferences.propertyTypes.map((type, index) => (
                            <Tag
                              key={index}
                              color="blue"
                              className="mb-2 mr-2 px-3 py-1 rounded-lg text-sm capitalize"
                            >
                              {type}
                            </Tag>
                          ))}
                        </div>
                      </Card>
                    </Col>
                  )}

                {preferences.locations && preferences.locations.length > 0 && (
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <>
                          <EnvironmentFilled className="text-red-500 mr-2" />
                          Preferred Locations
                        </>
                      }
                      size="small"
                      className="h-full"
                    >
                      <div className="mt-2">
                        {preferences.locations.map((location, index) => (
                          <Tag
                            key={index}
                            color="red"
                            className="mb-2 mr-2 px-3 py-1 rounded-lg text-sm"
                          >
                            {location}
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  </Col>
                )}

                {preferences.budgetRange &&
                  (preferences.budgetRange.min ||
                    preferences.budgetRange.max) && (
                    <Col xs={24} md={12}>
                      <Card
                        title={
                          <>
                            <DollarOutlined className="text-green-500 mr-2" />
                            Budget Range
                          </>
                        }
                        size="small"
                        className="h-full"
                      >
                        <div className="flex items-center justify-center mt-3">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              KES {preferences.budgetRange.min.toLocaleString()}{' '}
                              - {preferences.budgetRange.max.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  )}

                {preferences.amenities && preferences.amenities.length > 0 && (
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <>
                          <AppstoreOutlined className="text-purple-500 mr-2" />
                          Preferred Amenities
                        </>
                      }
                      size="small"
                      className="h-full"
                    >
                      <div className="mt-2">
                        {preferences.amenities.map((amenity, index) => (
                          <Tag
                            key={index}
                            color="purple"
                            className="mb-2 mr-2 px-3 py-1 rounded-lg text-sm"
                          >
                            {amenity}
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  </Col>
                )}

                {preferences.otherRequirements && (
                  <Col xs={24}>
                    <Card
                      title={
                        <>
                          <InfoCircleOutlined className="text-orange-500 mr-2" />
                          Other Requirements
                        </>
                      }
                      size="small"
                    >
                      <div className="p-2">{preferences.otherRequirements}</div>
                    </Card>
                  </Col>
                )}
              </Row>
            </ProCard>
          ) : (
            <ProCard className="rounded-lg">
              <Empty description="No preferences recorded yet" />
            </ProCard>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="Communications" key="2">
          {communicationCount > 0 ? (
            <ProList
              rowKey="key"
              className="bg-white rounded-lg p-4"
              dataSource={communicationsData}
              metas={{
                title: {
                  render: (_, entity) => (
                    <Space className="font-medium">
                      {getCommunicationIcon(entity.type)}
                      <span className="capitalize">{entity.type}</span>
                      <span className="text-gray-400 text-sm font-normal">
                        {formatDateTime(entity.date)}
                      </span>
                    </Space>
                  ),
                },
                description: {
                  render: (_, entity) => (
                    <div className="mt-2">
                      <div className="mb-1">
                        <Text strong className="mr-2">
                          Summary:
                        </Text>
                        <Text>{entity.summary}</Text>
                      </div>
                      <div className="mb-1">
                        <Text strong className="mr-2">
                          Outcome:
                        </Text>
                        <Text>{entity.outcome}</Text>
                      </div>
                      {entity.nextAction && (
                        <div>
                          <Text strong className="mr-2">
                            Next Action:
                          </Text>
                          <Text>{entity.nextAction}</Text>
                        </div>
                      )}
                    </div>
                  ),
                },
              }}
            />
          ) : (
            <ProCard className="rounded-lg">
              <Empty description="No communications recorded yet" />
            </ProCard>
          )}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            className="mt-4 w-full"
            onClick={() => onAddCommunication(customer)}
            block
          >
            Add Communication
          </Button>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Notes" key="3">
          {Array.isArray(customer.notes) && customer.notes.length > 0 ? (
            <ProList
              rowKey={(item, index) => index.toString()}
              className=" rounded-lg p-4"
              dataSource={[...customer.notes].sort(
                (a, b) =>
                  new Date(b.addedAt || 0).getTime() -
                  new Date(a.addedAt || 0).getTime(),
              )}
              metas={{
                title: {
                  render: (_, entity) => (
                    <div className="font-medium text-gray-500 pl-2">
                      <CalendarOutlined className="mr-2" />
                      {formatRelativeTime(entity.addedAt)}
                    </div>
                  ),
                },
                description: {
                  render: (_, entity) => (
                    <div className="mt-2 whitespace-pre-line pl-2">
                      {entity.content}
                    </div>
                  ),
                },
              }}
            />
          ) : (
            <ProCard className="rounded-lg">
              <Empty description="No notes added yet" />
            </ProCard>
          )}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            className="mt-4 w-full"
            onClick={() => onAddNote(customer)}
            block
          >
            Add Note
          </Button>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Purchases" key="4">
          {purchaseCount > 0 ? (
            <ProTable
              columns={[
                {
                  title: 'Property',
                  dataIndex: ['property', 'name'],
                  key: 'property',
                  render: (text, record) => {
                    const propertyName = record.property?.name || 'N/A';
                    return (
                      <Tooltip title={propertyName}>
                        <HomeFilled /> {propertyName}
                      </Tooltip>
                    );
                  },
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  align: 'center',
                  render: (text) => (text ? formatDate(text) : 'N/A'),
                },
                {
                  title: 'Amount (KES)',
                  dataIndex: 'amount',
                  key: 'amount',
                  align: 'right',
                  render: (amount) => {
                    return typeof amount === 'number'
                      ? amount.toLocaleString()
                      : 'N/A';
                  },
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  filters: [
                    { text: 'Pending', value: 'pending' },
                    { text: 'Completed', value: 'completed' },
                    { text: 'Cancelled', value: 'cancelled' },
                  ],
                  onFilter: (value, record) => record.status === value,
                  render: (status) => {
                    const statusText = status
                      ? status.charAt(0).toUpperCase() + status.slice(1)
                      : ('Unknown' as const);
                    return (
                      <Badge
                        status={getStatusColor(status, 'purchase')}
                        text={statusText}
                      />
                    );
                  },
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      {/* <Button size="small" icon={<FileTextOutlined />}>
                                                View
                                            </Button> */}
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        icon={<FilePdfOutlined />}
                        onClick={() => handleExtractStatement(record.id)}
                      >
                        PDF
                      </Button>
                    </Space>
                  ),
                },
              ]}
              dataSource={purchasesData}
              search={false}
              options={false}
              pagination={{
                pageSize: 5,
                showTotal: (total, range) => (
                  <div>{`Showing ${range[0]}-${range[1]} of ${total} total purchases`}</div>
                ),
              }}
              rowKey="key"
              className="rounded-lg"
            />
          ) : (
            <ProCard className="rounded-lg">
              <Empty description="No purchases yet" />
            </ProCard>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="Payment Plans" key="6">
          {paymentPlanCount > 0 ? (
            <ProCard
              className="rounded-lg mb-4"
              title="Payment Plans"
              extra={
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => handleExtractStatement()}
                >
                  Extract Full Statement
                </Button>
              }
            >
              <ProTable
                columns={[
                  {
                    title: 'Initial Deposit',
                    dataIndex: 'initialDeposit',
                    key: 'initialDeposit',
                    render: (amount) => {
                      return typeof amount === 'number'
                        ? amount.toLocaleString()
                        : 'N/A';
                    },
                  },
                  {
                    title: 'Total Amount',
                    dataIndex: 'totalAmount',
                    key: 'totalAmount',
                    render: (amount) => {
                      return typeof amount === 'number'
                        ? amount.toLocaleString()
                        : 'N/A';
                    },
                  },
                  {
                    title: 'Outstanding',
                    dataIndex: 'outstandingBalance',
                    key: 'outstandingBalance',
                    render: (amount) => {
                      return typeof amount === 'number'
                        ? amount.toLocaleString()
                        : 'N/A';
                    },
                  },
                  {
                    title: 'Completion',
                    dataIndex: 'completionPercentage',
                    key: 'completionPercentage',
                    render: (percentage) => (
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">
                            {percentage}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getProgressColor(percentage),
                            }}
                          ></div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    align: 'center',
                    search: false,
                    render: (status: string) => {
                      const statusText = status
                        ? status.charAt(0).toUpperCase() + status.slice(1)
                        : 'Unknown';
                      return (
                        <Badge
                          status={getStatusColor(status, 'payment')}
                          text={statusText}
                        />
                      );
                    },
                    filters: [
                      { text: 'Pending', value: 'pending' },
                      { text: 'Completed', value: 'completed' },
                      { text: 'Cancelled', value: 'cancelled' },
                    ],
                    onFilter: (value, record) => record.status === value,
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        {/* <Button size="small" icon={<FileTextOutlined />}>
                                                    View
                                                </Button> */}
                        <Button
                          size="small"
                          type="primary"
                          ghost
                          icon={<FilePdfOutlined />}
                          onClick={() => handleExtractStatement(record.id)}
                        >
                          PDF
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={paymentPlansData}
                search={false}
                options={false}
                pagination={{
                  pageSize: 5,
                  showTotal: (total, range) => (
                    <div>{`Showing ${range[0]}-${range[1]} of ${total} total purchases`}</div>
                  ),
                }}
                rowKey="key"
              />
            </ProCard>
          ) : (
            <ProCard className="rounded-lg">
              <Empty description="No payment plans yet" />
            </ProCard>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Drawer>
  );
};

export default CustomerDrawer;
