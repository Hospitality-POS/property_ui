import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ShopOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Card, Divider, List, Tag, Typography } from 'antd';
import moment from 'moment';
import React from 'react';

const { Text } = Typography;

type Activity = {
  id: string;
  type: 'sale' | 'property' | 'lead' | 'payment';
  title: string;
  description: string;
  amount?: number;
  date: string;
  status?: string;
};

export type RecentActivitiesProps = {
  sales: any[];
  properties: any[];
  leads: any[];
  payments: any[];
  loading: boolean;
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  sales = [],
  properties = [],
  leads = [],
  payments = [],
  loading = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
      case 'sold':
        return 'success';
      case 'pending':
      case 'viewing':
        return 'processing';
      case 'cancelled':
      case 'rejected':
        return 'error';
      case 'new':
        return 'blue';
      case 'qualified':
        return 'cyan';
      case 'proposal':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
      case 'sold':
        return <CheckCircleOutlined />;
      case 'pending':
      case 'viewing':
        return <SyncOutlined spin />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Process and combine recent activities
  const recentActivities = React.useMemo(() => {
    const activities: Activity[] = [];

    // Add recent sales
    sales.slice(0, 3).forEach((sale) => {
      activities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        title: `New Sale: ${sale.property?.name || 'Property'}`,
        description: `Property sold to ${sale.customer?.name || 'customer'}`,
        amount: sale.amount,
        date: sale.createdAt,
        status: 'completed',
      });
    });

    // Add recent properties
    properties.slice(0, 3).forEach((property) => {
      activities.push({
        id: `property-${property.id}`,
        type: 'property',
        title: `New Property: ${property.name || 'Untitled'}`,
        description: `${property.type} in ${property.location}`,
        amount: property.price,
        date: property.createdAt,
        status: property.status,
      });
    });

    // Add recent leads
    leads.slice(0, 3).forEach((lead) => {
      activities.push({
        id: `lead-${lead.id}`,
        type: 'lead',
        title: `New Lead: ${lead.name || 'Potential Customer'}`,
        description: `Interested in ${lead.interestedIn || 'properties'}`,
        date: lead.createdAt,
        status: lead.status,
      });
    });

    // Add recent payments
    payments.slice(0, 3).forEach((payment) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: `Payment Received`,
        description: `For ${payment.purpose || 'property purchase'}`,
        amount: payment.amount,
        date: payment.paymentDate || payment.createdAt,
        status: payment.status,
      });
    });

    // Sort by date descending
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Get top 5 most recent
  }, [sales, properties, leads, payments]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return {
          icon: <ShopOutlined style={{ fontSize: 16 }} />,
          color: '#52c41a',
          background: '#f6ffed',
        };
      case 'property':
        return {
          icon: <ShopOutlined style={{ fontSize: 16 }} />,
          color: '#1890ff',
          background: '#e6f7ff',
        };
      case 'lead':
        return {
          icon: <UserOutlined style={{ fontSize: 16 }} />,
          color: '#7B68EE',
          background: '#f0f5ff',
        };
      case 'payment':
        return {
          icon: <DollarOutlined style={{ fontSize: 16 }} />,
          color: '#722ed1',
          background: '#f9f0ff',
        };
      default:
        return {
          icon: <ClockCircleOutlined style={{ fontSize: 16 }} />,
          color: '#faad14',
          background: '#fffbe6',
        };
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BellOutlined
            style={{ color: '#7B68EE', marginRight: 8, fontSize: 18 }}
          />
          <span>Recent Activities</span>
        </div>
      }
      loading={loading}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        height: '100%',
      }}
      bodyStyle={{ padding: '12px 24px 24px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text type="secondary">Latest updates from your property business</Text>
        <Badge
          count={recentActivities.length}
          style={{ backgroundColor: '#7B68EE' }}
        />
      </div>
      <Divider style={{ margin: '0 0 16px 0' }} />

      <List
        itemLayout="horizontal"
        dataSource={recentActivities}
        renderItem={(item) => {
          const activityIcon = getActivityIcon(item.type);
          return (
            <List.Item style={{ padding: '12px 0' }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={activityIcon.icon}
                    style={{
                      backgroundColor: activityIcon.background,
                      color: activityIcon.color,
                      boxShadow: `0 3px 6px ${activityIcon.color}20`,
                    }}
                  />
                }
                title={
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong style={{ fontSize: '15px' }}>
                      {item.title}
                    </Text>
                    {item.amount && (
                      <Text
                        strong
                        style={{ color: '#52c41a', fontSize: '15px' }}
                      >
                        {formatCurrency(item.amount)}
                      </Text>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 6 }}>{item.description}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <ClockCircleOutlined
                          style={{ marginRight: 4, fontSize: 12 }}
                        />
                        {moment(item.date).fromNow()}
                      </Text>
                      {item.status && (
                        <Tag
                          color={getStatusColor(item.status)}
                          style={{
                            fontSize: 12,
                            margin: 0,
                            borderRadius: '4px',
                            padding: '0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {getStatusIcon(item.status)}
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1).toLowerCase()}
                        </Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default RecentActivities;
