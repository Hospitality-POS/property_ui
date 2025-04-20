import { UserSwitchOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { Card, Divider, Spin, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

export type LeadStatusChartProps = {
  leads: any[];
  loading?: boolean;
};

const LeadStatusChart: React.FC<LeadStatusChartProps> = ({
  leads = [],
  loading = false,
}) => {
  const leadStatusData = React.useMemo(() => {
    // Ensure leads is an array before using reduce
    const safeLeads = Array.isArray(leads) ? leads : [];

    const statusCount = safeLeads.reduce((acc, lead) => {
      if (!lead) return acc;
      // Make sure status is a string and not null/undefined
      const status = lead.status ? String(lead.status) : 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(statusCount).map(([status, count]) => ({
      status: status || 'Unknown', // Ensure status is never null
      count,
    }));

    // If no data, return a default entry
    return result.length > 0 ? result : [{ status: 'No Data', count: 1 }];
  }, [leads]);

  console.log('leadStatusData', leadStatusData);

  // Define colors for different lead statuses with more vibrant colors
  const getStatusColor = (status: string) => {
    // Handle null or undefined status
    if (!status) return '#d9d9d9';

    const colorMap: Record<string, string> = {
      new: '#7B68EE', // Medium Slate Blue
      contacted: '#1890ff', // Daybreak Blue
      qualified: '#52c41a', // Lime
      proposal: '#faad14', // Sunset Orange
      closed: '#f5222d', // Dust Red
      lost: '#8c8c8c', // Gray
      active: '#13c2c2', // Cyan
      pending: '#fa8c16', // Volcano
      'no data': '#d9d9d9', // Light Gray
      unknown: '#d9d9d9', // Light Gray for unknown
      null: '#d9d9d9', // Light Gray for null
      undefined: '#d9d9d9', // Light Gray for undefined
    };

    try {
      return colorMap[status.toLowerCase()] || '#d9d9d9';
    } catch (e) {
      // If status is not a string or has no toLowerCase method
      return '#d9d9d9';
    }
  };

  // Get total leads count
  const totalLeads = React.useMemo(() => {
    return Array.isArray(leads) ? leads.length : 0;
  }, [leads]);

  const config = {
    data: leadStatusData,
    angleField: 'count',
    colorField: 'status',
    radius: 0.8,
    color: ({ status }: { status: string }) => getStatusColor(status),
    label: {
      type: 'outer',
      position: 'spider',
      text: (data: any) => `${data.status}\n ${data.count}`,
      content: (data: any) => {
        const total = leadStatusData.reduce((sum, item) => sum + item.count, 0);
        const percentage = ((data.count / total) * 100).toFixed(1);
        return `${percentage}%`;
      },
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        fill: 'rgba(0, 0, 0, 0.85)',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
    // tooltip: {
    //   showTitle: true
    // },
    interactions: [
      { type: 'element-active' },
      { type: 'pie-statistic-active' },
    ],
    statistic: {
      title: {
        style: {
          fontSize: '14px',
          lineHeight: 1.2,
          color: 'rgba(0, 0, 0, 0.45)',
        },
        content: 'Total',
      },
      content: {
        style: {
          fontSize: '24px',
          lineHeight: 1.2,
          color: 'rgba(0, 0, 0, 0.85)',
          fontWeight: 'bold',
        },
        content: totalLeads.toString(),
      },
    },
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1200,
        easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
    state: {
      active: {
        style: {
          lineWidth: 0,
          fillOpacity: 0.9,
        },
      },
    },
    pieStyle: {
      stroke: 'white',
      lineWidth: 2,
    },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserSwitchOutlined
            style={{ color: '#7B68EE', marginRight: 8, fontSize: 18 }}
          />
          <span>Lead Status Distribution</span>
        </div>
      }
      className="h-full"
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
        <Text type="secondary">
          Distribution of leads by their current status
        </Text>
        <Text strong>{totalLeads} total leads</Text>
      </div>
      <Divider style={{ margin: '0 0 16px 0' }} />
      <Spin spinning={loading}>
        <div style={{ height: 320 }}>
          <Pie {...config} />
        </div>
      </Spin>
    </Card>
  );
};

export default LeadStatusChart;
