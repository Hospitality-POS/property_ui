import { fetchAllCustomers } from '@/services/customer';
import {
  CrownOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Card, Col, Empty, Row, Skeleton, Statistic } from 'antd';
import { useMemo } from 'react';

function CustomerStats() {
  const {
    data: customersData = [],
    loading: isLoading,
    error,
  } = useRequest(fetchAllCustomers, {
    cacheKey: 'customer-stats',
    staleTime: 5 * 60 * 1000,
    refreshOnWindowFocus: true,
    onError: (err) => {
      console.error('Customers fetch error:', err);
    },
  });

  // Memoized statistics calculation
  const statistics = useMemo(() => {
    if (!customersData || !Array.isArray(customersData)) {
      return {
        totalCustomers: 0,
        individualCustomers: 0,
        companyCustomers: 0,
        totalPurchases: 0,
      };
    }

    return {
      totalCustomers: customersData.length,
      individualCustomers: customersData.filter(
        (customer) => customer.customerType === 'individual',
      ).length,
      companyCustomers: customersData.filter(
        (customer) => customer.customerType === 'company',
      ).length,
      totalPurchases: customersData.reduce((total, customer) => {
        // If purchases property doesn't exist or is null/undefined
        if (customer.purchases === null || customer.purchases === undefined) {
          return total;
        }

        // If purchases is a number, add it directly
        if (typeof customer.purchases === 'number') {
          return total + customer.purchases;
        }

        // If purchases is a string, try to parse it
        if (typeof customer.purchases === 'string') {
          const parsedValue = parseInt(customer.purchases, 10);
          return total + (isNaN(parsedValue) ? 0 : parsedValue);
        }

        // If purchases is an array, count them
        if (Array.isArray(customer.purchases)) {
          return total + customer.purchases.length;
        }

        return total;
      }, 0),
    };
  }, [customersData]);

  if (error) {
    return (
      <Empty
        description="Failed to load customer statistics"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  if (isLoading) {
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[...Array(4)].map((_, index) => (
          <Col key={index} xs={24} sm={12} md={6}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Statistic
            title="Total Customers"
            value={statistics.totalCustomers}
            valueStyle={{ color: '#1890ff' }}
            prefix={<TeamOutlined />}
            formatter={(value) => `${value.toLocaleString()}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Statistic
            title="Individual Customers"
            value={statistics.individualCustomers}
            valueStyle={{ color: '#52c41a' }}
            prefix={<UserOutlined />}
            suffix={
              statistics.totalCustomers > 0
                ? `/ ${statistics.totalCustomers.toLocaleString()}`
                : ''
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Statistic
            title="Corporate Customers"
            value={statistics.companyCustomers}
            valueStyle={{ color: '#722ed1' }}
            prefix={<CrownOutlined />}
            suffix={
              statistics.totalCustomers > 0
                ? `/ ${statistics.totalCustomers.toLocaleString()}`
                : ''
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Statistic
            title="Total Purchases"
            value={statistics.totalPurchases}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<ShoppingOutlined />}
            formatter={(value) => `${value.toLocaleString()}`}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default CustomerStats;
