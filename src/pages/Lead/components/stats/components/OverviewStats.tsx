import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Statistic, Tooltip } from 'antd';
import React, { useMemo } from 'react';

const OverviewStats: React.FC<{ leadsData: any[]; isLoading: boolean }> = ({
  leadsData,
  isLoading,
}) => {
  // Memoized statistics calculation
  const statistics = useMemo(() => {
    if (!leadsData || !Array.isArray(leadsData)) {
      return {
        totalLeads: 0,
        newLeadsThisWeek: 0,
        qualifiedLeads: 0,
        conversionRate: 0,
      };
    }

    return {
      totalLeads: leadsData.length,
      newLeadsThisWeek: leadsData.filter(
        (lead) =>
          new Date(lead.createdAt) >
          new Date(new Date().setDate(new Date().getDate() - 7)),
      ).length,
      qualifiedLeads: leadsData.filter((lead) => lead.status === 'qualified')
        .length,
      conversionRate: Math.round(
        (leadsData.filter((lead) => lead.status === 'converted').length /
          leadsData.length) *
          100,
      ),
    };
  }, [leadsData]);

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Total Leads">
              <Statistic
                title="Total Leads"
                value={statistics?.totalLeads}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Total new leads this week">
              <Statistic
                title="New Leads (This Week)"
                value={statistics?.newLeadsThisWeek}
                valueStyle={{ color: '#52c41a' }}
                prefix={<PlusOutlined />}
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Qualified Leads">
              <Statistic
                title="Qualified Leads"
                value={statistics?.qualifiedLeads}
                valueStyle={{ color: '#722ed1' }}
                prefix={<CheckCircleOutlined />}
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Tooltip title="Conversion Rate">
              <Statistic
                title="Conversion Rate"
                value={statistics?.conversionRate}
                valueStyle={{ color: '#faad14' }}
                suffix="%"
                prefix={<ArrowRightOutlined />}
              />
            </Tooltip>
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewStats;
