import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

export type StatsCardsProps = {
  properties: any[];
  sales: any[];
  leads: any[];
  payments: any[];
  loading: boolean;
};

export const StatsCards: React.FC<StatsCardsProps> = ({
  properties = [],
  sales = [],
  leads = [],
  loading = false,
}) => {
  // Calculate some mock trends for demonstration
  const getTrend = (index: number) => {
    const trends = [12, -5, 8, 15];
    return trends[index % trends.length];
  };

  const stats = [
    {
      title: 'Total Properties',
      value: properties.length,
      icon: <ShopOutlined style={{ fontSize: 28 }} />,
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
      trend: getTrend(0),
    },
    {
      title: 'Total Sales',
      value: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
      prefix: '$',
      icon: <DollarOutlined style={{ fontSize: 28 }} />,
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #b7eb8f 100%)',
      trend: getTrend(1),
    },
    {
      title: 'Active Leads',
      value: leads.filter((lead) => lead.status === 'active').length,
      icon: <UserOutlined style={{ fontSize: 28 }} />,
      color: '#faad14',
      gradient: 'linear-gradient(135deg, #faad14 0%, #ffd666 100%)',
      trend: getTrend(2),
    },
    {
      title: 'Locations',
      value: new Set(properties.map((p) => p.location)).size,
      icon: <EnvironmentOutlined style={{ fontSize: 28 }} />,
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
      trend: getTrend(3),
    },
  ];

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card
            loading={loading}
            className="stat-card"
            bodyStyle={{ padding: '24px 20px' }}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: 'none',
              position: 'relative',
            }}
          >
            {/* Gradient background */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: stat.gradient,
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  {stat.title}
                </Text>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    marginTop: 8,
                  }}
                >
                  <Title
                    level={3}
                    style={{ margin: '0 8px 0 0', fontSize: '28px' }}
                  >
                    {typeof stat.value === 'number'
                      ? (stat.prefix || '') + stat.value.toLocaleString()
                      : stat.value}
                  </Title>
                  {stat.trend && (
                    <div
                      style={{
                        color: stat.trend > 0 ? '#52c41a' : '#f5222d',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {stat.trend > 0 ? (
                        <ArrowUpOutlined style={{ marginRight: 4 }} />
                      ) : (
                        <ArrowDownOutlined style={{ marginRight: 4 }} />
                      )}
                      {Math.abs(stat.trend)}%
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: stat.gradient,
                  borderRadius: '12px',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px -4px ${stat.color}40`,
                }}
              >
                {React.cloneElement(stat.icon, {
                  style: { ...stat.icon.props.style, color: '#fff' },
                })}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
