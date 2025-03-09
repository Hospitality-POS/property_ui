import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Button, Space, Row, Col, Input, Select, DatePicker, Dropdown,
    Menu, Form, message
} from 'antd';
import {
    PlusOutlined, SearchOutlined, ExportOutlined, PrinterOutlined,
    FileExcelOutlined, DownOutlined, ReloadOutlined
} from '@ant-design/icons';
import { registerUser, fetchAllUsers, updateUser, deleteUser, getUserInfo } from '@/services/auth.api';

import { UsersTable } from '../../components/Tables/usersTable';
import { UserDetailsDrawer } from '../../components/drawers/userDetail';
import { AddEditUserModal } from '../../components/Modals/addUser';
import { DeleteUserModal } from '../../components/Modals/deleteUser';

const { Option } = Select;
const { RangePicker } = DatePicker;

const UserManagement = () => {
    // Form instance
    const [form] = Form.useForm();

    // Search and filter states
    const [searchText, setSearchText] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // Selected user and drawer state
    const [selectedUser, setSelectedUser] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');

    // Modal states
    const [addUserVisible, setAddUserVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Loading and refresh states
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Current user state
    const [currentUser, setCurrentUser] = useState(null);

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date)
            ? date.toISOString().split('T')[0]
            : '';
    };

    // Fetch current user on component mount
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

    // Fetch all users
    const { data: usersData = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
        queryKey: ['users', refreshKey],
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
                        <Option value="valuer">Valuation Officer</Option>
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
            <UsersTable
                users={filteredUsers}
                currentUser={currentUser}
                formatDate={formatDate}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onDelete={showDeleteConfirm}
                loading={isLoadingUsers}
            />

            {/* User Details Drawer */}
            <UserDetailsDrawer
                visible={drawerVisible}
                user={selectedUser}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={() => setDrawerVisible(false)}
                onEdit={() => {
                    setDrawerVisible(false);
                    handleEditUser(selectedUser);
                }}
                formatDate={formatDate}
            />

            {/* Add/Edit User Modal */}
            <AddEditUserModal
                visible={addUserVisible}
                user={selectedUser}
                form={form}
                isLoading={isLoading || registerMutation.isPending || updateMutation.isPending}
                onOk={handleFormSubmit}
                onCancel={() => {
                    setAddUserVisible(false);
                    form.resetFields();
                    setSelectedUser(null);
                }}
            />

            {/* Delete Confirmation Modal */}
            <DeleteUserModal
                visible={deleteModalVisible}
                user={userToDelete}
                isLoading={isLoading}
                onDelete={handleDeleteUser}
                onCancel={() => setDeleteModalVisible(false)}
            />
        </>
    );
};

export default UserManagement;