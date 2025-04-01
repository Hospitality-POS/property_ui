import formatDate from '@/utils/formatDateUtil';
import {
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Row,
  Space,
  Steps,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {
  Payment,
  PaymentPlan,
  SalesDetailsProps,
} from '../../types/SalesTypes';
import ActivitiesTab from './tabs/ActivitiesTab';
import CustomerDetailsTab from './tabs/CustomerDetailsTab';
import NotesTab from './tabs/NotesTab';
import PaymentPlansTab from './tabs/PaymentPlanTab/PaymentPlansTab';
import PaymentsTab from './tabs/PaymentsTab';
import getStatusDisplay from './util/statusDisplayUtil';

const { TabPane } = Tabs;
const { Step } = Steps;
const { Title, Text } = Typography;

const SalesDetails: React.FC<SalesDetailsProps> = ({
  onClose,
  visible,
  data,
}) => {
  const [noteText, setNoteText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('1');

  useEffect(() => {
    if (visible) {
      setActiveTab('1');
    }
  }, [visible]);

  const onTabChange = (key: string) => {
    setActiveTab(key);
  };

  const sale = data;

  if (!sale) {
    return null;
  }

  // Get unit information from the sale
  const getUnitInfo = () => {
    if (sale.unit) {
      return {
        type: sale.unit.unitType,
        plotSize: sale.unit.plotSize,
        price: sale.unit.price,
      };
    }
    return {
      type: 'Unknown Unit',
      plotSize: '',
      price: 0,
    };
  };

  const unitInfo = getUnitInfo();
  const statusInfo = getStatusDisplay(sale.status);

  // Get all payments from the sale
  const getAllPayments = () => {
    let allPayments: Payment[] = [];

    // Check if paymentPlans array exists and has items
    if (
      sale.paymentPlans &&
      Array.isArray(sale.paymentPlans) &&
      sale.paymentPlans.length > 0
    ) {
      // Collect all payments from all payment plans
      sale.paymentPlans.forEach((plan: PaymentPlan) => {
        if (plan.payments && Array.isArray(plan.payments)) {
          allPayments = [...allPayments, ...plan.payments];
        }
      });
    }

    // Fallback to sale.payments if no payments found in paymentPlans
    if (
      allPayments.length === 0 &&
      sale.payments &&
      Array.isArray(sale.payments)
    ) {
      allPayments = sale.payments;
    }

    return allPayments;
  };

  // Render tab content based on payment plan type
  const renderTabs = () => {
    const commonTabs = (
      <>
        <TabPane tab="Payments" key="2">
          <PaymentsTab payments={getAllPayments()} />
        </TabPane>

        <TabPane tab="Activities" key="3">
          <ActivitiesTab sale={sale} />
        </TabPane>

        <TabPane tab="Customer Details" key="4">
          <CustomerDetailsTab customer={sale.customer} />
        </TabPane>

        <TabPane tab="Notes" key="5">
          <NotesTab
            notes={sale.notes}
            noteText={noteText}
            setNoteText={setNoteText}
          />
        </TabPane>
      </>
    );

    // For Full Payment type
    if (sale.paymentPlanType === 'Full Payment') {
      return (
        <Tabs defaultActiveKey="2" onChange={onTabChange}>
          {commonTabs}
        </Tabs>
      );
    }

    // For Installment type
    return (
      <Tabs activeKey={activeTab} defaultActiveKey="1" onChange={onTabChange}>
        <TabPane tab="Payment Plans" key="1">
          <PaymentPlansTab sale={sale} />
        </TabPane>
        {commonTabs}
      </Tabs>
    );
  };

  return (
    <Drawer
      title="Sale Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={900}
    >
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={16}>
            <Title level={4}>
              {sale.property?.title ||
                sale.property?.name ||
                'Unnamed Property'}
            </Title>
            <Space direction="vertical">
              {sale.property && (
                <>
                  <Text>
                    <HomeOutlined style={{ marginRight: 8 }} />
                    {sale.property.propertyType || 'Unknown Type'} - Unit:{' '}
                    {unitInfo.type}
                    {unitInfo.plotSize ? ` - ${unitInfo.plotSize} sqm` : ''}
                  </Text>
                  <Text>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    {sale.property.location?.address || 'Unknown Location'}
                  </Text>
                </>
              )}
              <Text>
                <UserOutlined style={{ marginRight: 8 }} />
                Customer: {sale.customer?.name || 'Unknown Customer'}
              </Text>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Tag
              color={statusInfo.color}
              style={{ fontSize: '14px', padding: '4px 8px' }}
            >
              {statusInfo.text}
            </Tag>
            <div style={{ marginTop: 8 }}>
              <Text strong>Sale Date:</Text>{' '}
              {formatDate(sale.saleDate) || 'N/A'}
            </div>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Sale Progress Steps */}
      <div style={{ marginBottom: 24 }}>
        <Steps
          size="small"
          current={
            sale.status === 'reservation'
              ? 0
              : sale.status === 'agreement'
              ? 1
              : sale.status === 'processing'
              ? 2
              : sale.status === 'completed'
              ? 3
              : 0
          }
        >
          <Step
            title="Reservation"
            status={sale.status === 'cancelled' ? 'error' : undefined}
          />
          <Step
            title="Agreement"
            status={sale.status === 'cancelled' ? 'error' : undefined}
          />
          <Step
            title="Processing"
            status={sale.status === 'cancelled' ? 'error' : undefined}
          />
          <Step
            title="Completed"
            status={sale.status === 'cancelled' ? 'error' : undefined}
          />
        </Steps>
      </div>

      {/* Sale Overview */}
      <Card title="Sale Overview" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Sale Price">
                {sale.salePrice.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="List Price">
                {unitInfo.price.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Unit Type">
                {unitInfo.type || 'Not specified'}
              </Descriptions.Item>
              {unitInfo.plotSize && (
                <Descriptions.Item label="Plot Size">
                  {unitInfo.plotSize} sqm
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Quantity">
                {sale.quantity || 1}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Plan">
                {sale.paymentPlanType || 'Full Payment'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Agent">
                {sale.salesAgent?.name || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Property Manager">
                {sale.propertyManager?.name || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Commission">
                {sale.commission?.amount.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Commission %">
                {sale.commission?.percentage || 5}%
              </Descriptions.Item>
              <Descriptions.Item label="Reservation Fee">
                {sale.reservationFee.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Sale Date">
                {formatDate(sale.saleDate)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Tab Content */}
      {renderTabs()}
    </Drawer>
  );
};

export default SalesDetails;
