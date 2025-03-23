import { reversePhoneNumber } from '@/components/phonenumber/reversePhoneNumberFormat';
import AddEditUserModal from '@/pages/Users/components/modal/AddEditUserModal';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  List,
  Row,
  Space,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;

// Define the interface for the component props
interface recordTypes {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
  dateJoined: string;
  address: string;
  department: string;
  idNumber: string;
  gender: string;
  permissions: string[];
}
interface UserDetailsDrawerProps {
  record?: recordTypes | null;
  visible?: boolean;
  onClose?: () => void;
  actionRef?: any;
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  record = null,
  visible = false,
  onClose = () => {},
  actionRef = null,
}) => {
  const [activeTab, setActiveTab] = useState('1');

  if (!record) {
    return null;
  }

  const user = record;

  const onTabChange = (key: string) => {
    setActiveTab(key);
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format phone number if the helper function exists
  const formattedPhone = user.phone
    ? typeof reversePhoneNumber === 'function'
      ? reversePhoneNumber(user.phone)?.phone || user.phone
      : user.phone
    : 'Not provided';

  // Get role display information
  const getRoleInfo = (role: keyof typeof roleMap | string) => {
    const roleMap = {
      admin: { color: 'red', text: 'Admin' },
      property_manager: { color: 'green', text: 'Property Manager' },
      sales_agent: { color: 'blue', text: 'Sales Agent' },
      valuer: { color: 'grey', text: 'Valuation Officer' },
      finance_officer: { color: 'purple', text: 'Finance Officer' },
      customer: { color: 'orange', text: 'Customer' },
    };

    return (
      roleMap[role as keyof typeof roleMap] || {
        color: 'default',
        text: role || 'Unknown',
      }
    );
  };

  const roleInfo = getRoleInfo(user.role);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part: any) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Drawer
      title={
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-2">
            <UserOutlined />
            <h4>User Details</h4>
          </div>
          <Space>
            {actionRef && typeof AddEditUserModal === 'function' ? (
              <AddEditUserModal
                actionRef={actionRef}
                data={user}
                edit
                editText="Edit User"
                key={`edit-user-${user.id}`}
              />
            ) : (
              <Button type="primary" icon={<EditOutlined />}>
                Edit User
              </Button>
            )}
          </Space>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={700}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
      destroyOnClose
    >
      <div className="w-full justify-between">
        <Row gutter={16} align="middle">
          <Col span={3}>
            <Avatar
              size={64}
              style={{
                backgroundColor: roleInfo.color || '#1890ff',
                fontSize: '20px',
              }}
            >
              {getUserInitials(user.name || user.name.split(' ')[0])}
            </Avatar>
          </Col>
          <Col span={12}>
            <Title level={4}>{user.name}</Title>
            <Space direction="vertical">
              <Text copyable>
                <MailOutlined style={{ marginRight: 8 }} />
                {user.email}
              </Text>
              <Text>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {formattedPhone}
              </Text>
            </Space>
          </Col>
          <Col span={9} style={{ textAlign: 'right' }}>
            <Tag
              color={user.status === 'Active' ? 'green' : 'red'}
              style={{ fontSize: '14px', padding: '4px 8px' }}
            >
              {user?.status}
            </Tag>
            <div style={{ marginTop: 8 }}>
              <Text strong>Joined:</Text>{' '}
              {formatDate(user.createdAt) || user.dateJoined || 'Unknown'}
            </div>
            <div style={{ marginTop: 4 }}>
              <Text strong>Last Login:</Text>{' '}
              {formatDate(user.lastLogin) || 'Never logged in'}
            </div>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <Tabs activeKey={activeTab} onChange={onTabChange}>
        <Tabs.TabPane tab="Basic Information" key="1">
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>User Information</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Full Name">
                {user?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {user?.gender || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="ID Number">
                {user?.idNumber || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {user?.address || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {user?.department || 'Not specified'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Permissions" key="2">
          <Card
            title={
              <Space>
                <TeamOutlined />
                <span>User Permissions</span>
              </Space>
            }
          >
            <List
              bordered
              dataSource={user?.permissions || []}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: 'green', marginRight: 8 }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>
                    {item?.replace(/_/g, ' ') || 'N/A'}
                  </span>
                </List.Item>
              )}
              locale={{ emptyText: 'No permissions assigned' }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Activity Log" key="3">
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>User Activity</span>
              </Space>
            }
          >
            <Timeline>
              <Timeline.Item color="blue">
                <p>
                  <strong>Last Login</strong>:{' '}
                  {formatDate(user.lastLogin) || 'Never logged in'}
                </p>
              </Timeline.Item>
              <Timeline.Item color="green">
                <p>
                  <strong>Account Created</strong>:{' '}
                  {formatDate(user.createdAt) || user.dateJoined || 'Unknown'}
                </p>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </Drawer>
  );
};

export default UserDetailsDrawer;
