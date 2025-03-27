import { fetchAllLeads } from '@/services/lead';
import { LineChartOutlined, PushpinOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Empty, Tabs } from 'antd';
import React from 'react';
import OverviewStats from './components/OverviewStats';
import PiplineStats from './components/PiplineStats';

const LeadsStats: React.FC = () => {
  const {
    data: leadsData,
    loading,
    error,
  } = useRequest(fetchAllLeads, {
    cacheKey: 'leads-stats',
    staleTime: 5 * 60 * 1000,
    refreshOnWindowFocus: true,
  });

  if (error) {
    return (
      <Empty
        description="Failed to load leads statistics"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Overview" key={1} icon={<LineChartOutlined />}>
        <OverviewStats leadsData={leadsData} isLoading={loading} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Pipelines" key={2} icon={<PushpinOutlined />}>
        <PiplineStats leadsData={leadsData} />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default LeadsStats;
