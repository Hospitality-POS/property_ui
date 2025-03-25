import { fetchAllPayments } from '@/services/payments';
import { CheckCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Card, Col, Empty, Row, Skeleton, Statistic, Tooltip } from 'antd';
import moment from 'moment';
import { useMemo } from 'react';

function PaymentStats() {
  const {
    data: paymentsData,
    loading: isLoading,
    error,
  } = useRequest(fetchAllPayments, {
    cacheKey: 'payment-stats',
    staleTime: 5 * 60 * 1000,
    refreshOnWindowFocus: true,
  });

  // Use useMemo to prevent recalculations on re-renders
  const statistics = useMemo(() => {
    if (!paymentsData || !Array.isArray(paymentsData)) {
      return {
        totalCount: 0,
        totalAmount: 0,
        recentCount: 0,
        averageAmount: 0,
        mostCommonMethod: 'N/A',
      };
    }

    const payments = paymentsData;
    const thirtyDaysAgo = moment().subtract(30, 'days');

    // Calculate total amount in one pass
    const { sum, recentCount, methodCounts } = payments.reduce(
      (acc, payment) => {
        const amount = Number(payment?.amount) || 0;

        // Count recent payments
        if (moment(payment.paymentDate).isAfter(thirtyDaysAgo)) {
          acc.recentCount += 1;
        }

        // Count payment methods
        const method = payment?.paymentMethod || 'other';
        acc.methodCounts[method] = (acc.methodCounts[method] || 0) + 1;

        return {
          ...acc,
          sum: acc.sum + amount,
        };
      },
      { sum: 0, recentCount: 0, methodCounts: {} },
    );

    // Find most common payment method
    const mostCommonMethod =
      Object.entries(methodCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([method]) => method)[0] || 'N/A';

    return {
      totalCount: payments.length,
      totalAmount: sum,
      recentCount,
      averageAmount: payments.length ? sum / payments.length : 0,
      mostCommonMethod,
    };
  }, [paymentsData]);

  // Helper function to get method display name
  const getMethodDisplayName = (method) => {
    const methodMap = {
      mpesa: 'M-Pesa',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      cheque: 'Cheque',
    };

    return methodMap[method] || 'Other';
  };

  // Handle error state
  if (error) {
    return (
      <Empty
        description="Failed to load payment statistics"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Most common payment method">
              <Statistic
                title=" Most used payment method"
                value={getMethodDisplayName(statistics.mostCommonMethod)}
                valueStyle={{ color: '#faad14' }}
                prefix={<StarOutlined />}
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Total number of payment transactions">
              <Statistic
                title="Total Number of Payments"
                value={statistics.totalCount}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Total amount received across all transactions">
              <Statistic
                title="Total Amount Received (KES)"
                value={statistics.totalAmount}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) =>
                  `${value.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}`
                }
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Average amount per transaction">
              <Statistic
                title="Average Payment Amount (KES)"
                value={statistics.averageAmount}
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) =>
                  `${value.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}`
                }
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
}

export default PaymentStats;
