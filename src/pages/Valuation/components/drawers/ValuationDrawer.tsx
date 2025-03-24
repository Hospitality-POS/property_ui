import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Input,
  Rate,
  Row,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import React, { useState } from 'react';

interface ValuationDrawerProps {
  onClose: () => void;
  visible: boolean;
  selectedValuation: any;
}

const { Text, Title, Paragraph } = Typography;

export const ValuationDrawer: React.FC<ValuationDrawerProps> = ({
  onClose,
  visible,
  selectedValuation,
}) => {
  const [activeTab, setActiveTab] = useState('1');

  if (!selectedValuation) {
    return null;
  }

  // Helper function to determine status tag color
  const getStatusTagColor = (purpose: string) => {
    switch (purpose) {
      case 'sale':
        return 'orange';
      case 'inspection':
        return 'blue';
      case 'purchase':
        return 'green';
      default:
        return 'red';
    }
  };

  return (
    <Drawer
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Valuation Details</span>
          <Tag
            color={getStatusTagColor(selectedValuation.valuationPurpose)}
            style={{ margin: 0, fontSize: '12px' }}
          >
            {selectedValuation.valuationPurpose}
          </Tag>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={750}
      footer={
        <div className="flex justify-end">
          <Button type="primary" icon={<FileTextOutlined />}>
            Download Full Report
          </Button>
        </div>
      }
    >
      <div style={{ padding: '0 16px' }}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={16}>
            <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
              {selectedValuation.property.name}
            </Title>
            <Space direction="vertical" size="small">
              <Text>
                <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                {selectedValuation.property.propertyType} -{' '}
                {selectedValuation.property.status}
              </Text>
              <Text>
                <EnvironmentOutlined
                  style={{ marginRight: 8, color: '#52c41a' }}
                />
                {selectedValuation.property?.location?.address}
              </Text>
              <Text>
                <UserOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Client: {selectedValuation?.requestedBy?.name}
              </Text>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <div>
              <Text strong>Request Date:</Text>{' '}
              {new Date(selectedValuation.valuationDate).toDateString()}
            </div>
            {selectedValuation.completionDate && (
              <div style={{ marginTop: 4 }}>
                <Text strong>Completion Date:</Text>{' '}
                {selectedValuation.completionDate}
              </div>
            )}
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {/* Progress Steps with Improved Styling */}
        <div style={{ marginBottom: 24 }}>
          <Steps
            type="navigation"
            current={
              selectedValuation.status === 'Pending Inspection'
                ? 0
                : selectedValuation.status === 'In Progress'
                ? 1
                : selectedValuation.status === 'Completed'
                ? 2
                : 0
            }
          >
            <Steps.Step title="Inspection" description="Initial Site Visit" />
            <Steps.Step title="Valuation" description="Property Assessment" />
            <Steps.Step title="Report" description="Final Documentation" />
          </Steps>
        </div>

        {/* Valuation Overview */}
        <Card title="Valuation Overview" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Valuation Purpose">
                  {selectedValuation.valuationPurpose}
                </Descriptions.Item>
                <Descriptions.Item label="Valuer">
                  {selectedValuation.valuer?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Valuation Fee">
                  KES{' '}
                  {selectedValuation?.valuationFee
                    ? selectedValuation?.valuationFee.toLocaleString()
                    : 0}
                </Descriptions.Item>
                <Descriptions.Item label="Methodology">
                  {selectedValuation.methodology.join(', ') ||
                    'Not determined yet'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Market Value">
                  {selectedValuation?.marketValue
                    ? `KES ${selectedValuation.marketValue.toLocaleString()}`
                    : 'Pending'}
                </Descriptions.Item>
                <Descriptions.Item label="Forced Sale Value">
                  {selectedValuation?.forcedSaleValue
                    ? `KES ${selectedValuation.forcedSaleValue.toLocaleString()}`
                    : 'Pending'}
                </Descriptions.Item>
                <Descriptions.Item label="Report">
                  {selectedValuation?.report || 'Not available yet'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={setActiveTab}
        >
          <TabPane tab="Property Details" key="1">
            <Card title="Property Information" style={{ marginBottom: 16 }}>
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="Property Type">
                  {selectedValuation.property.propertyType}
                </Descriptions.Item>
                <Descriptions.Item label="status">
                  {selectedValuation.property.status}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {selectedValuation.property?.location?.address}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedValuation.status !== 'Pending Inspection' &&
              selectedValuation?.propertyRatings && (
                <Card title="Property Ratings" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    {Object.entries(selectedValuation.propertyRatings).map(
                      ([key, value]) => (
                        <Col span={12} key={key} style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text style={{ textTransform: 'capitalize' }}>
                              {key}:
                            </Text>
                            <Rate disabled defaultValue={value as number} />
                          </div>
                        </Col>
                      ),
                    )}
                  </Row>
                </Card>
              )}
            {selectedValuation.comparableProperties &&
              selectedValuation.comparableProperties.length > 0 && (
                <Card
                  title="Comparable Properties"
                  style={{ marginBottom: 16 }}
                >
                  <Table
                    columns={[
                      {
                        title: 'ID',
                        dataIndex: 'id',
                        key: 'id',
                      },
                      {
                        title: 'Address',
                        dataIndex: 'address',
                        key: 'address',
                      },
                      {
                        title: 'Size',
                        dataIndex: 'size',
                        key: 'size',
                      },
                      {
                        title: 'Price (KES)',
                        dataIndex: 'price',
                        key: 'price',
                        render: (price) => price.toLocaleString(),
                      },
                    ]}
                    dataSource={selectedValuation.comparableProperties}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                </Card>
              )}
          </TabPane>

          <TabPane tab="Timeline" key="2">
            <Timeline mode="left">
              {selectedValuation.timeline &&
                selectedValuation.timeline.map((item: any, index: number) => (
                  <Timeline.Item
                    key={index}
                    label={item.date}
                    color={
                      item.event === 'Final Report'
                        ? 'green'
                        : item.event === 'Draft Report'
                        ? 'blue'
                        : item.event === 'Site Visit'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                    <div>{item.description}</div>
                  </Timeline.Item>
                ))}

              {selectedValuation.status !== 'Completed' &&
                selectedValuation.status !== 'Canceled' && (
                  <Timeline.Item
                    label="Upcoming"
                    color="gray"
                    dot={<ClockCircleOutlined />}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      {selectedValuation.status === 'Pending Inspection'
                        ? 'Site Inspection'
                        : 'Finalize Report'}
                    </div>
                    <div>Scheduled activity in the valuation process</div>
                  </Timeline.Item>
                )}
            </Timeline>

            {selectedValuation.status !== 'Completed' &&
              selectedValuation.status !== 'Canceled' && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16 }}
                  block
                >
                  Add Event
                </Button>
              )}
          </TabPane>

          <TabPane tab="Client Details" key="3">
            <Card>
              <Descriptions title="Client Information" bordered column={1}>
                <Descriptions.Item label="Name">
                  {selectedValuation?.requestedBy?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Client Type">
                  <Tag
                    color={
                      selectedValuation?.requestedBy?.customerType ===
                      'Institution'
                        ? 'gold'
                        : 'blue'
                    }
                  >
                    {selectedValuation?.requestedBy?.customerType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Contact Number">
                  {selectedValuation.requestedBy?.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedValuation?.requestedBy?.email}
                </Descriptions.Item>
              </Descriptions>
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Space>
                  <Button icon={<MailOutlined />}>Send Email</Button>
                  <Button icon={<PhoneOutlined />}>Call</Button>
                  <Button type="primary" icon={<UserOutlined />}>
                    View Profile
                  </Button>
                </Space>
              </div>
            </Card>
          </TabPane>

          <TabPane tab="Notes" key="5">
            <Card>
              <Paragraph>
                {selectedValuation.notes || 'No notes available.'}
              </Paragraph>
              {selectedValuation.status !== 'Completed' && (
                <div style={{ marginTop: 16 }}>
                  <Input.TextArea rows={4} placeholder="Add notes here..." />
                  <Button type="primary" style={{ marginTop: 8 }}>
                    Save Notes
                  </Button>
                </div>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </Drawer>
  );
};

export default ValuationDrawer;
