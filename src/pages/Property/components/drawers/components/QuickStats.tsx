import { TagsOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Col, Row, Statistic } from 'antd';
import React from 'react';

interface QuickStatsProps {
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  totalValue: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  totalUnits,
  availableUnits,
  soldUnits,
  totalValue,
}) => {
  return (
    <ProCard title="Quick Stats">
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="Total Units"
            value={totalUnits}
            prefix={<TagsOutlined />}
            className="mb-2"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Available"
            value={availableUnits}
            valueStyle={{ color: '#52c41a' }}
            className="mb-2"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Sold"
            value={soldUnits}
            valueStyle={{ color: '#cf1322' }}
            className="mb-2"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Total Value (KES)"
            value={totalValue}
            precision={0}
            formatter={(value) => `${value.toLocaleString()}`}
          />
        </Col>
      </Row>
    </ProCard>
  );
};

export default QuickStats;
