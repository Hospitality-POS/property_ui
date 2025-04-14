import { fetchAllLeads } from '@/services/lead';
import { fetchAllPayments } from '@/services/payments';
import { fetchAllProperties } from '@/services/property';
import { fetchAllSales } from '@/services/sales';
import {
  CalendarOutlined,
  DashboardOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRequest } from '@umijs/max';
import { Card, Col, Row, Spin, Tabs, Typography } from 'antd';
import React from 'react';
import EventCalendar from '../Calendar';
import {
  LeadStatusChart,
  PropertyTypeChart,
  RecentActivities,
  SalesTrendChart,
  StatsCards,
} from './components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const { TabPane } = Tabs;
const { Title } = Typography;

// Main Dashboard Component Content
const DashboardContent: React.FC = () => {
  // Fetch data using useRequest
  const {
    data: properties = [],
    loading: loadingProperties,
    refresh: refreshProperties,
  } = useRequest(fetchAllProperties);
  const {
    data: sales = [],
    loading: loadingSales,
    refresh: refreshSales,
  } = useRequest(fetchAllSales);
  const {
    data: leads = [],
    loading: loadingLeads,
    refresh: refreshLeads,
  } = useRequest(fetchAllLeads);
  const {
    data: payments = [],
    loading: loadingPayments,
    refresh: refreshPayments,
  } = useRequest(fetchAllPayments);

  const isLoading =
    loadingProperties || loadingSales || loadingLeads || loadingPayments;

  // Function to refresh all data
  const refreshAllData = () => {
    refreshProperties();
    refreshSales();
    refreshLeads();
    refreshPayments();
  };

  // Ensure data is always an array
  const safeData = {
    properties: Array.isArray(properties) ? properties : [],
    sales: Array.isArray(sales) ? sales : [],
    leads: Array.isArray(leads) ? leads : [],
    payments: Array.isArray(payments) ? payments : [],
  };

  return (
    <Card className="dashboard-container" style={{ padding: '12px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Dashboard Overview
        </Title>
        <div
          onClick={refreshAllData}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#1890ff',
            fontSize: '14px',
            transition: 'all 0.3s',
          }}
        >
          <ReloadOutlined spin={isLoading} style={{ marginRight: 8 }} />
          Refresh Data
        </div>
      </div>

      <Spin spinning={isLoading} tip="Loading dashboard data...">
        <StatsCards
          properties={safeData.properties}
          sales={safeData.sales}
          leads={safeData.leads}
          payments={safeData.payments}
          loading={isLoading}
        />

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <PropertyTypeChart
              properties={safeData.properties}
              loading={loadingProperties}
            />
          </Col>
          <Col xs={24} md={12}>
            <LeadStatusChart leads={safeData.leads} loading={loadingLeads} />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <SalesTrendChart sales={safeData.sales} loading={loadingSales} />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <RecentActivities
              properties={safeData.properties}
              sales={safeData.sales}
              leads={safeData.leads}
              payments={safeData.payments}
              loading={isLoading}
            />
          </Col>
        </Row>
      </Spin>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Card
      className="dashboard-wrapper"
      style={{ minHeight: 'calc(100vh - 64px)' }}
      styles={{ body: { padding: 0 } }}
    >
      <Tabs
        defaultActiveKey="1"
        type="card"
        size="large"
        className="dashboard-tabs"
        style={{
          marginBottom: 16,
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '8px 16px 0',
        }}
      >
        <TabPane
          tab={
            <span>
              <DashboardOutlined /> Dashboard
            </span>
          }
          key="1"
        >
          <DashboardContent />
        </TabPane>
        <TabPane
          tab={
            <span>
              <CalendarOutlined /> Calendar
            </span>
          }
          key="2"
        >
          <EventCalendar />
        </TabPane>
      </Tabs>
    </Card>
  );
};

// Wrap the entire Dashboard with QueryClientProvider to fix the React Query error
const DashboardWithQueryClient: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
};

export default DashboardWithQueryClient;
