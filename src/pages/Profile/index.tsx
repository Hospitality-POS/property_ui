import React, { useState, useEffect } from 'react';
import {
    Avatar,
    Card,
    Typography,
    Divider,
    Skeleton,
    Row,
    Col,
    message,
    Badge,
    Tag,
    Descriptions
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    CalendarOutlined,
    BankOutlined
} from '@ant-design/icons';
import { getUserInfo } from '../../services/auth.api';
import moment from 'moment';


const { Title, Text, Paragraph } = Typography;

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkIfUserIsValid = async () => {
        try {
            const userData = await getUserInfo();
            return userData;
        } catch (e) {
            localStorage.removeItem('property_token');
            return null;
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const result = await checkIfUserIsValid();
                if (result) {
                    setUserData(result);
                } else {
                    message.error('User session expired. Please login again');
                    window.location.href = '/login';
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                message.error('Failed to load user profile');
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const storedCode = localStorage.getItem('companyCode');

    const formatDate = (dateString) => {
        return moment(dateString).format('MMMM D, YYYY [at] h:mm A');
    };

    const getRoleBadge = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <Tag color="#27C6C1">{role.toUpperCase()}</Tag>;
            case 'manager':
                return <Tag color="blue">{role.toUpperCase()}</Tag>;
            case 'user':
                return <Tag color="green">{role.toUpperCase()}</Tag>;
            default:
                return <Tag color="default">{role.toUpperCase()}</Tag>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Card className="w-full mx-auto max-w-3xl my-8">
                    <Skeleton active avatar paragraph={{ rows: 6 }} />
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex flex-1 overflow-hidden">
                {/* Profile Info */}
                <div className="flex flex-col w-full p-8 bg-white overflow-y-auto">
                    <div className="w-full mx-auto">
                        {/* Header with Logo */}
                        {/* <div className="mb-6 flex items-center">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-16 w-auto mr-4"
                            />
                        </div> */}

                        <Divider />

                        {userData && (
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={8}>
                                    <Card
                                        bordered={false}
                                        className="shadow-sm h-full"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <div className="text-center">
                                            <Avatar
                                                size={100}
                                                icon={<UserOutlined />}
                                                style={{
                                                    backgroundColor: '#27C6C1',
                                                    marginBottom: 16
                                                }}
                                            />
                                            <Title level={3} style={{ marginBottom: '8px' }}>
                                                {userData.name}
                                            </Title>
                                            <div>
                                                {getRoleBadge(userData.role)}
                                                <Badge
                                                    status={userData.isActive ? "success" : "error"}
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
                                                <p className="flex items-center mb-3">
                                                    <BankOutlined className="text-gray-400 mr-3" />
                                                    <span>Company Code: {storedCode}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>

                                <Col xs={24} md={16}>
                                    <Card
                                        title="Account Details"
                                        bordered={false}
                                        className="shadow-sm mb-6"
                                        style={{ borderRadius: '8px' }}
                                        headStyle={{
                                            borderBottom: '1px solid #f0f0f0',
                                            fontWeight: 600
                                        }}
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
                                                    status={userData.isActive ? "success" : "error"}
                                                    text={userData.status}
                                                />
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>

                                    <Card
                                        title="Activity Information"
                                        bordered={false}
                                        className="shadow-sm"
                                        style={{ borderRadius: '8px' }}
                                        headStyle={{
                                            borderBottom: '1px solid #f0f0f0',
                                            fontWeight: 600
                                        }}
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
                                                    {userData.role === 'admin' ? 'Full system access and management privileges' :
                                                        userData.role === 'manager' ? 'Property and user management privileges' :
                                                            'Standard user access'}
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