import { fetchAllSales } from '@/services/sales';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Card, Col, Empty, Row, Skeleton, Statistic } from 'antd';
import { useMemo } from 'react';

function SalesStats() {
  const {
    data: salesData = [],
    loading: isLoading,
    error,
  } = useRequest(fetchAllSales, {
    cacheKey: 'sales-stats',
    staleTime: 5 * 60 * 1000,
    refreshOnWindowFocus: true,
  });

  // Memoized statistics calculation
  const statistics = useMemo(() => {
    if (!salesData || !Array.isArray(salesData)) {
      return {
        totalSalesAmount: 0,
        completedCount: 0,
        pendingCount: 0,
        totalCommission: 0,
      };
    }

    return {
      totalSalesAmount: salesData
        .filter((sale) => !sale.status || sale.status !== 'cancelled')
        .reduce((total, sale) => total + (sale.salePrice || 0), 0),
      completedCount: salesData.filter((sale) => sale.status === 'completed')
        .length,
      pendingCount: salesData.filter(
        (sale) => sale.status !== 'completed' && sale.status !== 'cancelled',
      ).length,
      totalCommission: salesData.reduce(
        (total, sale) => total + (sale.commission?.amount || 0),
        0,
      ),
    };
  }, [salesData]);

  if (error) {
    return (
      <Empty
        description="Failed to load sales statistics"
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
            title="Total Sales Revenue (KES)"
            value={statistics.totalSalesAmount}
            valueStyle={{ color: '#1890ff' }}
            formatter={(value) => `${value.toLocaleString()}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Statistic
            title="Completed Sales"
            value={statistics.completedCount}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
            suffix={`/ ${salesData.length}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Statistic
            title="Pending Sales"
            value={statistics.pendingCount}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Statistic
            title="Total Commission (KES)"
            value={statistics.totalCommission}
            valueStyle={{ color: '#722ed1' }}
            formatter={(value) => `${value.toLocaleString()}`}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default SalesStats;
