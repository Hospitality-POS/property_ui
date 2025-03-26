import {
  CalendarOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import {
  Avatar,
  Badge,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Tag,
  Typography,
} from 'antd';
import moment from 'moment';

const { Title, Text } = Typography;

const UserProfile = () => {
  const { initialState } = useModel('@@initialState');

  const userData = initialState?.currentUser || {};

  const formatDate = (dateString: moment.MomentInput) => {
    return moment(dateString).format('MMMM D, YYYY [at] h:mm A');
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Tag color="#27C6C1">{role?.toUpperCase()}</Tag>;
      case 'manager':
        return <Tag color="blue">{role?.toUpperCase()}</Tag>;
      case 'user':
        return <Tag color="green">{role?.toUpperCase()}</Tag>;
      default:
        return <Tag color="default">{role?.toUpperCase()}</Tag>;
    }
  };
  return (
    <div className="flex">
      <div className="flex flex-1 overflow-hidden">
        {/* Profile Info */}
        <div className="flex flex-col w-full p-8overflow-y-auto">
          <div className="w-full mx-auto">
            {userData && (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card
                    variant="borderless"
                    className="shadow-sm h-full"
                    style={{ borderRadius: '8px' }}
                  >
                    <div className="text-center">
                      <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: '#27C6C1',
                          marginBottom: 16,
                        }}
                      />
                      <Title level={3} style={{ marginBottom: '8px' }}>
                        {userData.name}
                      </Title>
                      <div>
                        {getRoleBadge(userData.role)}
                        <Badge
                          status={userData.isActive ? 'success' : 'error'}
                          text={userData.status}
                          style={{ marginLeft: 8 }}
                        />
                      </div>
                      <Divider />
                      <div className="text-left">
                        <p className="flex items-center mb-3">
                          <MailOutlined className="text-gray-400 mr-3" />
                          <span>{userData.email}</span>
                        </p>
                        <p className="flex items-center mb-3">
                          <PhoneOutlined className="text-gray-400 mr-3" />
                          <span>{userData.phone}</span>
                        </p>
                        <p className="flex items-center mb-3">
                          <UserOutlined className="text-gray-400 mr-3" />
                          <span>{userData.username}</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={16}>
                  <Card
                    title="Account Details"
                    variant="borderless"
                    className="shadow-sm mb-6"
                  >
                    <Descriptions layout="vertical" column={{ xs: 1, sm: 2 }}>
                      {/* <Descriptions.Item label="User ID">
                                                <Text copyable>{userData.id}</Text>
                                            </Descriptions.Item> */}
                      <Descriptions.Item label="ID Number">
                        <div className="flex items-center">
                          <IdcardOutlined className="text-gray-400 mr-2" />
                          {userData.idNumber}
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">
                        {userData.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Badge
                          status={userData.isActive ? 'success' : 'error'}
                          text={userData.status}
                        />
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card
                    title="Activity Information"
                    variant="borderless"
                    className="shadow-sm"
                  >
                    <Descriptions layout="vertical" column={{ xs: 1, sm: 2 }}>
                      <Descriptions.Item label="Account Created">
                        <div className="flex items-center">
                          <CalendarOutlined className="text-gray-400 mr-2" />
                          {formatDate(userData.createdAt)}
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Login">
                        <div className="flex items-center">
                          <CalendarOutlined className="text-gray-400 mr-2" />
                          {formatDate(userData.lastLogin)}
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Account Role" span={2}>
                        {getRoleBadge(userData.role)}
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {userData.role === 'admin'
                            ? 'Full system access and management privileges'
                            : userData.role === 'manager'
                            ? 'Property and user management privileges'
                            : 'Standard user access'}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
