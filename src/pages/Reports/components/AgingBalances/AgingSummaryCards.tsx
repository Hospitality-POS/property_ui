import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { AlertOutlined, DollarOutlined } from '@ant-design/icons';
import { AgingSummary } from '../types';
import { formatCurrency } from '../../utils/formatters';

interface AgingSummaryCardsProps {
  agingSummary: AgingSummary;
}

const AgingSummaryCards: React.FC<AgingSummaryCardsProps> = ({ agingSummary }) => {
  return (
    <>
      <Row gutter={16} className="summary-cards">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="0-30 Days"
              value={agingSummary.aging['0-30'].count}
              valueStyle={{ color: '#52c41a' }}
              suffix={`(${formatCurrency(agingSummary.aging['0-30'].value).replace('KES ', '')})`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="31-60 Days"
              value={agingSummary.aging['31-60'].count}
              valueStyle={{ color: '#faad14' }}
              suffix={`(${formatCurrency(agingSummary.aging['31-60'].value).replace('KES ', '')})`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="61-90 Days"
              value={agingSummary.aging['61-90'].count}
              valueStyle={{ color: '#fa8c16' }}
              suffix={`(${formatCurrency(agingSummary.aging['61-90'].value).replace('KES ', '')})`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="90+ Days"
              value={agingSummary.aging['90+'].count}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={`(${formatCurrency(agingSummary.aging['90+'].value).replace('KES ', '')})`}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} className="summary-cards" style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Total Outstanding Sales"
              value={agingSummary.total}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Total Outstanding Amount"
              value={formatCurrency(agingSummary.totalOutstanding)}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AgingSummaryCards;
