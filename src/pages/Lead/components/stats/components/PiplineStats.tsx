import { ProCard } from '@ant-design/pro-components';
import { Col, Progress, Row, Typography } from 'antd';

const { Title, Text } = Typography;

type StatusColor =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'negotiation'
  | 'converted'
  | 'lost';

// Helper function to determine appropriate colors for different statuses
const getStatusColor = (status: string) => {
  const colorMap: Record<StatusColor, string> = {
    new: '#1890ff', // Blue
    contacted: '#13c2c2', // Cyan
    qualified: '#722ed1', // Purple
    negotiation: '#fa8c16', // Orange
    converted: '#52c41a', // Green
    lost: '#f5222d', // Red
  };
  return colorMap[status as StatusColor] || '#1890ff';
};

const PipelineStats = ({ leadsData = [] }) => {
  // Process lead data by status
  const statusCategories = [
    'new',
    'contacted',
    'qualified',
    'negotiation',
    'converted',
    'lost',
  ];
  const leadsByStatus = statusCategories.reduce((acc, status) => {
    acc[status] = leadsData.filter((lead) => lead.status === status).length;
    return acc;
  }, {});

  // Calculate total for percentage calculation
  const totalLeads = Object.values(leadsByStatus).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Calculate conversion rate (if there are any leads)
  const conversionRate =
    totalLeads > 0
      ? Math.round((leadsByStatus.converted / totalLeads) * 100)
      : 0;

  return (
    <ProCard className="mb-8">
      <div className="mb-4">
        <Title level={4}>Sales Pipeline Overview</Title>
        <Text type="secondary">
          Total Leads: {totalLeads} | Conversion Rate: {conversionRate}%
        </Text>
      </div>

      <Row gutter={[16, 24]}>
        {statusCategories.map((status) => {
          const count = leadsByStatus[status] || 0;
          const percentage =
            totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

          return (
            <Col key={status} xs={12} sm={8} md={8} lg={4}>
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={percentage}
                  format={() => count}
                  size="small"
                  strokeColor={getStatusColor(status)}
                  strokeWidth={10}
                />
                <div className="mt-2">
                  <Text strong className="capitalize">
                    {status}
                  </Text>
                  <div>
                    <Text type="secondary">{percentage}%</Text>
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </ProCard>
  );
};

export default PipelineStats;
