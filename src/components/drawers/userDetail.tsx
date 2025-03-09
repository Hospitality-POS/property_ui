import {
    Drawer,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Divider,
    Tabs,
    Card,
    Descriptions,
    List,
    Timeline
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EditOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const UserDetailsDrawer = ({
    visible,
    user,
    activeTab,
    onTabChange,
    onClose,
    onEdit,
    formatDate
}) => {
    if (!user) {
        return null;
    }

    return (
        <Drawer
            title={`User Details: ${user.name}`}
            placement="right"
            onClose={onClose}
            open={visible}
            width={700}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        style={{ marginRight: 8 }}
                        onClick={onEdit}
                    >
                        Edit User
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            }
        >
            <div style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Title level={4}>{user.name}</Title>
                        <Space direction="vertical">
                            <Text>
                                <UserOutlined style={{ marginRight: 8 }} />
                                {user.id}
                            </Text>
                            <Text>
                                <MailOutlined style={{ marginRight: 8 }} />
                                {user.email}
                            </Text>
                            <Text>
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {user.phone}
                            </Text>
                        </Space>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Tag
                            color={user.status === 'Active' ? 'green' : 'red'}
                            style={{ fontSize: '14px', padding: '4px 8px' }}
                        >
                            {user.status}
                        </Tag>
                        <div style={{ marginTop: 8 }}>
                            <Text strong>Joined:</Text>{' '}
                            {formatDate(user.createdAt) || user.dateJoined || 'Unknown'}
                        </div>
                        <div style={{ marginTop: 4 }}>
                            <Text strong>Last Login:</Text>{' '}
                            {user.lastLogin || 'Never'}
                        </div>
                    </Col>
                </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}>
                <TabPane tab="Basic Information" key="1">
                    <Card title="User Information" style={{ marginBottom: 16 }}>
                        <Descriptions
                            bordered
                            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                        >
                            <Descriptions.Item label="Full Name">
                                {user.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">
                                {user.gender || 'Not specified'}
                            </Descriptions.Item>
                            <Descriptions.Item label="ID Number">
                                {user.idNumber || 'Not specified'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Address">
                                {user.address || 'Not specified'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Role">
                                <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                                    {user.role === 'admin' ? 'Admin' :
                                        user.role === 'property_manager' ? 'Property Manager' :
                                            user.role === 'sales_agent' ? 'Sales Agent' :
                                                user.role === 'valuer' ? 'Valuation Officer' :
                                                    user.role === 'finance_officer' ? 'Finance Officer' :
                                                        'Customer'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </TabPane>

                <TabPane tab="Permissions" key="2">
                    <Card title="User Permissions">
                        <List
                            bordered
                            dataSource={user.permissions || []}
                            renderItem={item => (
                                <List.Item>
                                    <CheckCircleOutlined style={{ color: 'green', marginRight: 8 }} />
                                    <span style={{ textTransform: 'capitalize' }}>
                                        {item.replace(/_/g, ' ')}
                                    </span>
                                </List.Item>
                            )}
                            locale={{ emptyText: 'No permissions assigned' }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Activity Log" key="3">
                    <Timeline>
                        <Timeline.Item>
                            <p><strong>Last Login</strong>: {user.lastLogin || 'Never logged in'}</p>
                        </Timeline.Item>
                        <Timeline.Item>
                            <p><strong>Account Created</strong>: {formatDate(user.createdAt) || user.dateJoined || 'Unknown'}</p>
                        </Timeline.Item>
                    </Timeline>
                </TabPane>
            </Tabs>
        </Drawer>
    );
};

export default UserDetailsDrawer;