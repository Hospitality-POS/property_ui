import {
    CheckCircleOutlined,
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    ExportOutlined,
    FileExcelOutlined,
    FileSearchOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    PlusOutlined,
    PrinterOutlined,
    ReloadOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Drawer,
    Dropdown,
    Form,
    Input,
    List,
    Menu,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Timeline,
    Tooltip,
    Typography,
    message,
} from 'antd';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { registerUser, fetchAllUsers, updateUser, deleteUser, getUserInfo } from '@/services/auth.api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const UserManagement = () => {
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [addUserVisible, setAddUserVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Added refresh key for forcing refresh
    const [currentUser, setCurrentUser] = useState(null);





    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date)
            ? date.toISOString().split('T')[0]
            : '';
    };


    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userData = await getUserInfo();

                setCurrentUser(userData.data);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch all users with automatic refresh
    const { data: usersData = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
        queryKey: ['users', refreshKey], // Adding refreshKey to queryKey
        queryFn: async () => {
            try {
                const response = await fetchAllUsers();
                console.log('Users fetched successfully:', response);

                // Process data to use createdAt as dateJoined
                const processedData = Array.isArray(response.data)
                    ? response.data.map(user => ({
                        ...user,
                        dateJoined: formatDate(user.createdAt) || user.dateJoined,
                    }))
                    : [];

                return processedData;
            } catch (error) {
                message.error('Failed to fetch users');
                console.error('Error fetching users:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Auto fetch on component mount
    useEffect(() => {
        refetchUsers();
    }, []);

    // Register user mutation
    const registerMutation = useMutation({
        mutationFn: async (values) => await registerUser(values),
        onSuccess: () => {
            message.success('User created successfully');
            // Force immediate refresh with a slight delay to ensure backend has processed
            setTimeout(() => {
                setRefreshKey(prevKey => prevKey + 1);
                refetchUsers({ force: true });
            }, 500);
        },
        onError: (error) => {
            message.error('Registration failed. Please try again later.');
            console.error('Registration error:', error);
        },
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: async ({ userId, userData }) => await updateUser(userId, userData),
        onSuccess: () => {
            message.success('User updated successfully');
            // Force immediate refresh
            setTimeout(() => {
                setRefreshKey(prevKey => prevKey + 1);
                refetchUsers({ force: true });
            }, 500);
        },
        onError: (error) => {
            message.error('Update failed. Please try again later.');
            console.error('Update error:', error);
        },
    });

    // Table columns for users list
    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            sorter: (a, b) => a.name?.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            sorter: (a, b) => a.email?.localeCompare(b.email),
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 150,
            render: (role) => {
                let color = 'blue';
                let displayText = role;

                switch (role) {
                    case 'admin':
                        color = 'red';
                        displayText = 'Admin';
                        break;
                    case 'property_manager':
                        color = 'green';
                        displayText = 'Property Manager';
                        break;
                    case 'sales_agent':
                        color = 'blue';
                        displayText = 'Sales Agent';
                        break;
                    case 'finance_officer':
                        color = 'purple';
                        displayText = 'Finance Officer';
                        break;
                    case 'customer':
                        color = 'orange';
                        displayText = 'Customer';
                        break;
                }

                return <Tag color={color}>{displayText}</Tag>;
            },
            filters: [
                { text: 'Admin', value: 'admin' },
                { text: 'Property Manager', value: 'property_manager' },
                { text: 'Sales Agent', value: 'sales_agent' },
                { text: 'Finance Officer', value: 'finance_officer' },
                { text: 'Customer', value: 'customer' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = status === 'Active' ? 'green' : 'red';
                return <Tag color={color}>{status}</Tag>;
            },
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Inactive', value: 'Inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Date Joined',
            dataIndex: 'dateJoined',
            key: 'dateJoined',
            width: 120,
            render: (text, record) => formatDate(record.createdAt) || text,
            sorter: (a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.dateJoined || 0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.dateJoined || 0);
                return dateA - dateB;
            },
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            width: 120,
            sorter: (a, b) => new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<FileSearchOutlined />}
                            size="small"
                            onClick={() => handleViewUser(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditUser(record)}
                        />
                    </Tooltip>
                    {currentUser && currentUser.role === 'admin' && (
                        <Tooltip title={record.id === currentUser.id ? "Cannot delete yourself" : "Delete"}>
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => showDeleteConfirm(record)}
                                disabled={record.id === currentUser.id}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    // Handle view user
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setDrawerVisible(true);
    };

    // Handle edit user
    const handleEditUser = (user) => {
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            idNumber: user.idNumber,
            status: user.status,
            address: user.address,
            gender: user.gender,
        });
        setSelectedUser(user);
        setAddUserVisible(true);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (user) => {
        // Check if user is trying to delete themselves
        if (currentUser && user.id === currentUser.id) {
            message.error('You cannot delete your own account');
            return;
        }

        // Check if current user has admin role
        if (currentUser && currentUser.role !== 'admin') {
            message.error('Only administrators can delete users');
            return;
        }

        // If validation passes, show the delete modal
        setUserToDelete(user);
        setDeleteModalVisible(true);
    };

    // Handle delete user
    const handleDeleteUser = async () => {
        if (!userToDelete || !userToDelete.id) {
            message.error('Invalid user to delete');
            setDeleteModalVisible(false);
            return;
        }

        setIsLoading(true);

        try {
            await deleteUser(userToDelete.id);

            message.success(`User ${userToDelete.name} has been deleted successfully`);

            // Close modal and reset state
            setDeleteModalVisible(false);
            setUserToDelete(null);

            // Refresh user list
            setTimeout(() => {
                setRefreshKey(prevKey => prevKey + 1);
                refetchUsers({ force: true });
            }, 500);
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Failed to delete user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Handle form submission
    const handleFormSubmit = () => {
        form.validateFields()
            .then(async values => {
                setIsLoading(true);

                // Process form data
                const formData = {
                    ...values,
                    // No longer set dateJoined manually - backend will handle with createdAt
                    lastLogin: '',
                    permissions: getDefaultPermissions(values.role)
                };

                // Remove temporary fields
                delete formData.confirmPassword;

                try {
                    if (selectedUser) {
                        // Update existing user
                        await updateMutation.mutateAsync({
                            userId: selectedUser.id,
                            userData: formData
                        });
                    } else {
                        // Add new user
                        await registerMutation.mutateAsync(formData);
                    }

                    setAddUserVisible(false);
                    form.resetFields();
                    setSelectedUser(null);
                } catch (error) {
                    console.error('Error saving user:', error);
                } finally {
                    setIsLoading(false);
                }
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    // Get default permissions based on role
    const getDefaultPermissions = (role) => {
        switch (role) {
            case 'admin':
                return ['users', 'properties', 'clients', 'reports', 'system_settings'];
            case 'property_manager':
                return ['properties', 'clients'];
            case 'sales_agent':
                return ['properties', 'clients'];
            case 'finance_officer':
                return ['reports', 'invoices'];
            case 'customer':
                return ['view_properties'];
            default:
                return [];
        }
    };

    // Filter users based on search text and filters
    const filteredUsers = Array.isArray(usersData) ? usersData.filter((user) => {
        const matchesSearch =
            String(user.id || '').toLowerCase().includes(searchText.toLowerCase()) ||
            String(user.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
            String(user.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
            String(user.phone || '').includes(searchText);

        const matchesRole =
            userRoleFilter === 'all' ||
            user.role === userRoleFilter;

        const matchesStatus =
            userStatusFilter === 'all' ||
            user.status === userStatusFilter;

        let matchesDateRange = true;
        if (dateRange && dateRange[0] && dateRange[1]) {
            // Use createdAt if available, otherwise fall back to dateJoined
            const joinDate = user.createdAt
                ? new Date(user.createdAt)
                : new Date(user.dateJoined || 0);

            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);
            matchesDateRange = joinDate >= startDate && joinDate <= endDate;
        }

        return matchesSearch && matchesRole && matchesStatus && matchesDateRange;
    }) : [];

    // Handle modal open - reset form if adding new user
    const handleAddUser = () => {
        form.resetFields();
        setSelectedUser(null);
        setAddUserVisible(true);
    };

    // Refresh user data - improved function
    const handleRefresh = () => {
        // Increment refresh key to force a new query
        setRefreshKey(prevKey => prevKey + 1);
        message.loading({ content: 'Refreshing user data...', key: 'refreshMessage' });

        // Explicitly call refetch and handle results
        refetchUsers({ force: true }).then(() => {
            message.success({ content: 'User data refreshed successfully!', key: 'refreshMessage', duration: 2 });
        }).catch(error => {
            message.error({ content: 'Failed to refresh user data', key: 'refreshMessage', duration: 2 });
            console.error('Error refreshing:', error);
        });
    };

    return (
        <>
            <Space className="mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddUser}
                >
                    New User
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={isLoadingUsers}
                >
                    Refresh
                </Button>
            </Space>

            {/* Search and Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={24} md={6}>
                    <Input
                        placeholder="Search by ID, name, email or phone..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={8} md={5}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter by Role"
                        defaultValue="all"
                        onChange={(value) => setUserRoleFilter(value)}
                    >
                        <Option value="all">All Roles</Option>
                        <Option value="admin">Admin</Option>
                        <Option value="property_manager">Property Manager</Option>
                        <Option value="sales_agent">Sales Agent</Option>
                        <Option value="finance_officer">Finance Officer</Option>
                        <Option value="customer">Customer</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={8} md={5}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter by Status"
                        defaultValue="all"
                        onChange={(value) => setUserStatusFilter(value)}
                    >
                        <Option value="all">All Statuses</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={8} md={6}>
                    <RangePicker
                        style={{ width: '100%' }}
                        placeholder={['Join Date From', 'Join Date To']}
                        onChange={handleDateRangeChange}
                    />
                </Col>
                <Col xs={24} sm={24} md={2}>
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="1" icon={<FileExcelOutlined />}>
                                    Export to Excel
                                </Menu.Item>
                                <Menu.Item key="2" icon={<PrinterOutlined />}>
                                    Print Report
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <Button style={{ width: '100%' }}>
                            <ExportOutlined /> Export <DownOutlined />
                        </Button>
                    </Dropdown>
                </Col>
            </Row>

            {/* Users Table */}
            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
                loading={isLoadingUsers}
                expandable={{
                    expandedRowRender: (record) => (
                        <p style={{ margin: 0 }}>
                            <strong>Address:</strong> {record.address || 'N/A'}
                            <br />
                            <strong>Department:</strong> {record.department || 'N/A'}
                        </p>
                    ),
                }}
            />

            {/* User Details Drawer */}
            <Drawer
                title={
                    selectedUser
                        ? `User Details: ${selectedUser.name}`
                        : 'User Details'
                }
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={700}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            style={{ marginRight: 8 }}
                            onClick={() => {
                                setDrawerVisible(false);
                                handleEditUser(selectedUser);
                            }}
                        >
                            Edit User
                        </Button>
                        <Button onClick={() => setDrawerVisible(false)}>Close</Button>
                    </div>
                }
            >
                {selectedUser && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Title level={4}>{selectedUser.name}</Title>
                                    <Space direction="vertical">
                                        <Text>
                                            <UserOutlined style={{ marginRight: 8 }} />
                                            {selectedUser.id}
                                        </Text>
                                        <Text>
                                            <MailOutlined style={{ marginRight: 8 }} />
                                            {selectedUser.email}
                                        </Text>
                                        <Text>
                                            <PhoneOutlined style={{ marginRight: 8 }} />
                                            {selectedUser.phone}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    <Tag
                                        color={selectedUser.status === 'Active' ? 'green' : 'red'}
                                        style={{ fontSize: '14px', padding: '4px 8px' }}
                                    >
                                        {selectedUser.status}
                                    </Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Joined:</Text>{' '}
                                        {formatDate(selectedUser.createdAt) || selectedUser.dateJoined || 'Unknown'}
                                    </div>
                                    <div style={{ marginTop: 4 }}>
                                        <Text strong>Last Login:</Text>{' '}
                                        {selectedUser.lastLogin || 'Never'}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                            <TabPane tab="Basic Information" key="1">
                                <Card title="User Information" style={{ marginBottom: 16 }}>
                                    <Descriptions
                                        bordered
                                        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                                    >
                                        <Descriptions.Item label="Full Name">
                                            {selectedUser.name}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Gender">
                                            {selectedUser.gender || 'Not specified'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="ID Number">
                                            {selectedUser.idNumber || 'Not specified'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Address">
                                            {selectedUser.address || 'Not specified'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Role">
                                            <Tag color={selectedUser.role === 'admin' ? 'red' : 'blue'}>
                                                {selectedUser.role === 'admin' ? 'Admin' :
                                                    selectedUser.role === 'property_manager' ? 'Property Manager' :
                                                        selectedUser.role === 'sales_agent' ? 'Sales Agent' :
                                                            selectedUser.role === 'finance_officer' ? 'Finance Officer' :
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
                                        dataSource={selectedUser.permissions || []}
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
                                        <p><strong>Last Login</strong>: {selectedUser.lastLogin || 'Never logged in'}</p>
                                    </Timeline.Item>
                                    <Timeline.Item>
                                        <p><strong>Account Created</strong>: {formatDate(selectedUser.createdAt) || selectedUser.dateJoined || 'Unknown'}</p>
                                    </Timeline.Item>
                                </Timeline>
                            </TabPane>
                        </Tabs>
                    </>
                )}
            </Drawer>

            {/* Add/Edit User Modal */}
            <Modal
                title={selectedUser ? "Edit User" : "Create New User"}
                open={addUserVisible}
                onOk={handleFormSubmit}
                onCancel={() => {
                    setAddUserVisible(false);
                    form.resetFields();
                    setSelectedUser(null);
                }}
                width={800}
                confirmLoading={isLoading || registerMutation.isPending || updateMutation.isPending}
                okText={selectedUser ? "Update User" : "Create User"}
            >
                <Form form={form} layout="vertical">
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Personal Information" key="1">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        label="Full Name"
                                        rules={[{ required: true, message: 'Please enter full name' }]}
                                    >
                                        <Input placeholder="Enter Full Name" />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Please enter email' },
                                            { type: 'email', message: 'Please enter a valid email' }
                                        ]}
                                    >
                                        <Input placeholder="Enter Email" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Phone"
                                        rules={[{ required: true, message: 'Please enter phone number' }]}
                                    >
                                        <Input placeholder="Enter Phone Number" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="role"
                                        label="Role"
                                        rules={[{ required: true, message: 'Please select a role' }]}
                                    >
                                        <Select placeholder="Select a role">
                                            <Option value="admin">Admin</Option>
                                            <Option value="property_manager">Property Manager</Option>
                                            <Option value="sales_agent">Sales Agent</Option>
                                            <Option value="finance_officer">Finance Officer</Option>
                                            <Option value="customer">Customer</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="idNumber"
                                        label="ID Number"
                                        rules={[{ required: true, message: 'Please enter ID number' }]}
                                    >
                                        <Input placeholder="Enter ID Number" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="gender" label="Gender">
                                        <Select placeholder="Select gender">
                                            <Option value="Male">Male</Option>
                                            <Option value="Female">Female</Option>
                                            <Option value="Other">Other</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="address" label="Address">
                                <Input.TextArea rows={2} placeholder="Enter address" />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Account & Security" key="2">
                            {!selectedUser && (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="password"
                                            label="Password"
                                            rules={[
                                                { required: !selectedUser, message: 'Please enter password' },
                                                { min: 8, message: 'Password must be at least 8 characters' }
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder="Enter password"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="confirmPassword"
                                            label="Confirm Password"
                                            dependencies={['password']}
                                            rules={[
                                                { required: !selectedUser, message: 'Please confirm password' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Passwords do not match'));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder="Confirm password"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}

                            {selectedUser && (
                                <div>
                                    <Alert
                                        message="Password Management"
                                        description="To change the user's password, use the reset password function. This will send a password reset link to the user's email."
                                        type="info"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                    <Button type="primary" icon={<LockOutlined />}>
                                        Reset Password
                                    </Button>
                                </div>
                            )}

                            <Divider />

                            <Form.Item name="status" label="Account Status">
                                <Select placeholder="Select status">
                                    <Option value="Active">Active</Option>
                                    <Option value="Inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                open={deleteModalVisible}
                onOk={handleDeleteUser}
                onCancel={() => setDeleteModalVisible(false)}
                confirmLoading={isLoading}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Are you sure you want to delete the user{' '}
                    <strong>{userToDelete?.name}</strong>
                </p>
                <p>This action cannot be undone.</p>
            </Modal>
        </>
    );
};

export default UserManagement;