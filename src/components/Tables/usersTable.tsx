import { Table, Space, Button, Tooltip, Tag } from 'antd';
import {
    FileSearchOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

export const UsersTable = ({
    users,
    currentUser,
    formatDate,
    onView,
    onEdit,
    onDelete,
    loading
}) => {
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
                    case 'valuer':
                        color = 'yellow';
                        displayText = 'Valuation Officer';
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
                { text: 'Valuation Officer', value: 'valuer' },
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
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    {currentUser && currentUser.role === 'admin' && (
                        <Tooltip title={record.id === currentUser.id ? "Cannot delete yourself" : "Delete"}>
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => onDelete(record)}
                                disabled={record.id === currentUser.id}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            loading={loading}
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
    );
};

export default UsersTable;