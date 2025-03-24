import { fetchAllValuations } from '@/services/valuation';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Card, Col, Empty, Row, Skeleton, Statistic } from 'antd';
import { useMemo } from 'react';

function ValuationStats() {
  const {
    data: valuationsData,
    loading: isLoading,
    error,
  } = useRequest(fetchAllValuations, {
    cacheKey: 'valuation-stats',
    staleTime: 5 * 60 * 1000,
    refreshOnWindowFocus: true,
  });

  // Memoized statistics calculation
  const statistics = useMemo(() => {
    if (!valuationsData || !Array.isArray(valuationsData)) {
      return {
        totalPropertyValue: 0,
        completedCount: 0,
        pendingCount: 0,
        totalValuationFees: 0,
      };
    }

    return {
      totalPropertyValue: valuationsData
        .filter((valuation) => valuation.marketValue)
        .reduce((total, valuation) => total + (valuation.marketValue || 0), 0),
      completedCount: valuationsData.filter(
        (valuation) => valuation.status === 'Completed',
      ).length,
      pendingCount: valuationsData.filter(
        (valuation) =>
          valuation.status !== 'Completed' && valuation.status !== 'Canceled',
      ).length,
      totalValuationFees: valuationsData.reduce(
        (total, valuation) => total + (valuation.valuationFee || 0),
        0,
      ),
    };
  }, [valuationsData]);

  if (error) {
    return (
      <Empty
        description="Failed to load valuations statistics"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="Total Property Value (KES)"
              value={statistics.totalPropertyValue}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="Completed Valuations"
              value={statistics.completedCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${valuationsData?.length || 0}`}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="Pending Valuations"
              value={statistics.pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="Total Valuation Fees (KES)"
              value={statistics.totalValuationFees}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
}

export default ValuationStats;
