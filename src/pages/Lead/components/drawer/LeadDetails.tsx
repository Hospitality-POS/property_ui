import formatDate from '@/utils/formatDateUtil';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Descriptions,
  Drawer,
  Empty,
  List,
  Popconfirm,
  Progress,
  Segmented,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import React, { useState } from 'react';

import { ProCard, ProList } from '@ant-design/pro-components';

interface LeadDetailsProps {
  lead: any;
  visible: boolean;
  onClose: () => void;
}

const { Title, Text, Paragraph } = Typography;

const LeadDetails: React.FC<LeadDetailsProps> = ({
  lead,
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!lead) {
    return null;
  }

  const getStatusCompletionPercentage = (status: string) => {
    const statuses = [
      'new',
      'contacted',
      'qualified',
      'negotiation',
      'converted',
      'lost',
    ];
    const index = statuses.indexOf(status);
    return ((index + 1) / statuses.length) * 100;
  };

  const statusColors = {
    new: 'blue',
    contacted: 'cyan',
    qualified: 'purple',
    negotiation: 'orange',
    converted: 'green',
    lost: 'red',
  };

  const getTagColor = (priority: string) => {
    return priority === 'high'
      ? 'red'
      : priority === 'medium'
      ? 'orange'
      : 'green';
  };

  const renderHeader = () => (
    <div className="rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Title level={4} className="mb-1">
              {lead.name}
            </Title>
            <div className="flex flex-col gap-1">
              <Text className="flex items-center">
                <PhoneOutlined className="mr-2 text-gray-500" />
                {lead.phone}
              </Text>
              <Text className="flex items-center">
                <MailOutlined className="mr-2 text-gray-500" />
                {lead.email}
              </Text>
              <Text className="flex items-center">
                <EnvironmentOutlined className="mr-2 text-gray-500" />
                {lead?.interestedProperties?.length
                  ? lead.interestedProperties[0]?.location?.county ||
                    'Location not specified'
                  : 'Location not specified'}
              </Text>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Tag color={getTagColor(lead.priority)} className="px-3 py-1 text-sm">
            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}{' '}
            Priority
          </Tag>
          <Tag
            color={statusColors[lead.status] || 'default'}
            className="px-3 py-1 text-sm mt-2"
          >
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </Tag>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center mb-2">
          <Text className="text-gray-500 text-sm">Pipeline Progress</Text>
          <Text className="ml-auto text-sm font-medium">
            {getStatusCompletionPercentage(lead.status).toFixed()}%
          </Text>
        </div>
        <Progress
          percent={parseFloat(
            getStatusCompletionPercentage(lead.status).toFixed(),
          )}
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          showInfo={false}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className=" rounded-lg p-4">
          <Text className="text-gray-500 text-sm">Source</Text>
          <div className="text-base font-medium mt-1">
            {lead?.source
              ? lead.source.replace('_', ' ').charAt(0).toUpperCase() +
                lead.source.replace('_', ' ').slice(1)
              : 'Unknown'}
          </div>
        </div>
        <div className=" rounded-lg p-4">
          <Text className="text-gray-500 text-sm">Date Added</Text>
          <div className="text-base font-medium mt-1">
            {new Date(lead.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className=" rounded-lg p-4">
          <Text className="text-gray-500 text-sm">Days in Pipeline</Text>
          <div className="text-base font-medium mt-1">
            {Math.ceil(
              (new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24),
            )}{' '}
            days
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <>
      <ProCard
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span>Lead Information</span>
          </div>
        }
        className="mb-6"
        headerBordered
      >
        <Descriptions column={1} className="py-2">
          <Descriptions.Item
            label="Property Interest"
            styles={{ label: { color: '#6b7280' } }}
          >
            <Tag
              color={
                lead.interestAreas?.[0]?.propertyType === 'apartment'
                  ? 'blue'
                  : lead.interestAreas?.[0]?.propertyType === 'land'
                  ? 'green'
                  : 'default'
              }
            >
              {lead.interestAreas?.[0]?.propertyType || 'Both'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label="Budget"
            styles={{ label: { color: '#6b7280' } }}
          >
            <div className="flex items-center">
              <DollarOutlined className="mr-2 text-green-500" />
              {lead.interestAreas &&
              lead.interestAreas.length &&
              lead.interestAreas[0]?.budget
                ? `${lead.interestAreas[0].budget.min.toLocaleString()} - ${lead.interestAreas[0].budget.max.toLocaleString()} KES`
                : 'Not specified'}
            </div>
          </Descriptions.Item>
          <Descriptions.Item
            label="Assigned Agent"
            labelStyle={{ fontWeight: 'normal', color: '#6b7280' }}
          >
            <div className="flex items-center">
              {lead.assignedTo?.name ? (
                <>
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    className="mr-2"
                  />
                  {lead.assignedTo.name}
                </>
              ) : (
                'Not assigned'
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item
            label="Last Communication"
            styles={{ label: { color: '#6b7280' } }}
          >
            <div className="flex items-center">
              <CalendarOutlined className="mr-2 text-blue-500" />
              {lead.communications && lead.communications.length > 0
                ? formatDate(
                    lead.communications[lead.communications.length - 1].date,
                  )
                : 'No communications logged'}
            </div>
          </Descriptions.Item>
          <Descriptions.Item
            label="Next Follow-up"
            styles={{ label: { color: '#6b7280' } }}
          >
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2 text-orange-500" />
              {lead.followUpDate
                ? formatDate(lead.followUpDate)
                : 'None scheduled'}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </ProCard>

      <ProCard
        title={
          <Space className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span>Notes</span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              className="ml-auto"
            >
              Add Note
            </Button>
          </Space>
        }
        headerBordered
      >
        {lead.notes && lead.notes.length > 0 ? (
          <ProList
            itemLayout="vertical"
            dataSource={lead.notes}
            metas={{
              title: {
                render: (_, note) => (
                  <div className="font-medium">
                    {note.addedBy?.name
                      ? `Added by ${note.addedBy.name}`
                      : 'Anonymous Note'}
                  </div>
                ),
              },
              description: {
                render: (_, note) => (
                  <div className="text-xs text-gray-500">
                    {note.addedAt ? formatDate(note.addedAt) : ''}
                  </div>
                ),
              },
              content: {
                render: (_, note) => (
                  <Paragraph className="mt-2 text-gray-700">
                    {note.content}
                  </Paragraph>
                ),
              },
              actions: {
                render: (_, note) => [
                  <Popconfirm
                    title="Are you sure you want to delete this note?"
                    okText="Yes"
                    cancelText="No"
                    key={note._id}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    >
                      Delete
                    </Button>
                  </Popconfirm>,
                ],
              },
            }}
          />
        ) : (
          <Empty description="No notes available" className="py-8" />
        )}
      </ProCard>
    </>
  );

  const renderTimeline = () => (
    <ProCard
      title={
        <Space className="flex items-center justify-between w-full">
          <span>Activity Timeline</span>
          <Button type="primary" icon={<PlusOutlined />} size="small">
            Add Activity/Follow up
          </Button>
        </Space>
      }
      headerBordered
    >
      {lead.communications && lead.communications.length > 0 ? (
        <Timeline mode="left" className="mt-4">
          {lead.communications.map((comm, index) => {
            const iconColors = {
              call: 'green',
              email: 'blue',
              meeting: 'orange',
              sms: 'cyan',
            };

            return (
              <Timeline.Item
                key={index}
                label={
                  <div className="text-gray-500">{formatDate(comm.date)}</div>
                }
                color={iconColors[comm.type] || 'gray'}
              >
                <div className=" p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div className="font-medium capitalize">{comm.type}</div>
                    <Popconfirm
                      title="Delete this activity?"
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>

                  <div className="mt-2 text-gray-700">{comm.summary}</div>

                  {comm.outcome && (
                    <div className="mt-2">
                      <Text strong className="text-gray-600">
                        Outcome:
                      </Text>{' '}
                      {comm.outcome}
                    </div>
                  )}

                  {comm.nextAction && (
                    <div className="mt-1">
                      <Text strong className="text-gray-600">
                        Next Action:
                      </Text>{' '}
                      {comm.nextAction}
                    </div>
                  )}

                  {comm.by && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        className="mr-1"
                      />
                      {comm.by.name}
                    </div>
                  )}
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <Empty description="No activities recorded" className="py-12" />
      )}
    </ProCard>
  );

  const renderProperties = () => (
    <ProCard
      title={
        <Space className="flex items-center justify-between w-full">
          <span>Interested Properties</span>
          <Button type="primary" icon={<PlusOutlined />} size="small">
            Add Property Interest
          </Button>
        </Space>
      }
      headerBordered
    >
      {lead.interestedProperties && lead.interestedProperties.length > 0 ? (
        <ProList
          grid={{ gutter: 16, column: 2 }}
          dataSource={lead.interestedProperties}
          renderItem={(property) => (
            <List.Item
              key={property._id}
              actions={[
                <Button type="link" key="view">
                  View Details
                </Button>,
                <Popconfirm
                  title="Remove this property from interested list?"
                  okText="Yes"
                  cancelText="No"
                  key="remove"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Remove
                  </Button>
                </Popconfirm>,
              ]}
            >
              <ProCard className="h-full" bordered hoverable>
                <div className="flex">
                  <Avatar
                    shape="square"
                    size={64}
                    icon={<EnvironmentOutlined />}
                    className="bg-blue-100 text-blue-500 mr-4"
                  />
                  <div>
                    <div className="font-medium text-base">{property.name}</div>
                    <div className="text-gray-500 mt-1">
                      {property.location?.county || 'Unknown location'}
                    </div>
                    {property.price > 0 && (
                      <Tag color="blue" className="mt-2">
                        {property.price.toLocaleString()} KES
                      </Tag>
                    )}
                  </div>
                </div>
              </ProCard>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="No interested properties recorded"
          className="py-12"
        />
      )}
    </ProCard>
  );

  return (
    <Drawer
      title={
        <div className="flex items-center text-lg font-medium">
          Lead: {lead.name}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
      styles={{ body: { padding: '16px' } }}
    >
      {renderHeader()}

      <div className="mb-6">
        <Segmented
          block
          options={[
            { label: 'Overview', value: 'overview', icon: <UserOutlined /> },
            {
              label: 'Activity Timeline',
              value: 'timeline',
              icon: <ClockCircleOutlined />,
            },
            {
              label: 'Properties',
              value: 'properties',
              icon: <EnvironmentOutlined />,
            },
          ]}
          value={activeTab}
          onChange={(value) => setActiveTab(value as string)}
        />
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'timeline' && renderTimeline()}
      {activeTab === 'properties' && renderProperties()}
    </Drawer>
  );
};

export default LeadDetails;
