import { Table, Space, Button, Tooltip, Tag, Typography, Dropdown, Menu, Badge } from 'antd';
import {
    FileSearchOutlined,
    EditOutlined,
    DeleteOutlined,
    MessageOutlined,
    PhoneOutlined,
    MailOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

export const CustomersTable = ({
    customers,
    onView,
    onContact,
    onEdit,
    onDelete
}) => {
    // Internal date formatting functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('DD MMM YYYY'); // e.g. 12 Mar 2025
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = moment(dateString);
        const now = moment();

        if (now.diff(date, 'days') < 1) {
            return date.fromNow(); // e.g. "2 hours ago"
        } else if (now.diff(date, 'days') < 7) {
            return `${now.diff(date, 'days')} days ago`;
        } else {
            return formatDate(dateString);
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 120,
            render: (text, record) => (
                <a onClick={() => onView(record)}>{text}</a>
            ),
            sorter: (a, b) => a._id.localeCompare(b._id),
        },
        {
            title: 'Contact Information',
            dataIndex: 'email',
            key: 'contact',
            width: 220,
            render: (email, record) => (
                <span>
                    <div>{email}</div>
                    <div>
                        {record.phone}{' '}
                        {record.verifiedPhone && (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        )}
                    </div>
                </span>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'customerType',
            key: 'customerType',
            width: 120,
            render: (type) => (
                <Tag color={type === 'individual' ? 'blue' : 'purple'}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Tag>
            ),
            filters: [
                { text: 'Individual', value: 'individual' },
                { text: 'Company', value: 'company' },
            ],
            onFilter: (value, record) => record.customerType === value,
        },
        {
            title: 'Location',
            dataIndex: ['address', 'city'],
            key: 'city',
            width: 120,
            render: (city, record) => (
                <span>{city}, {record.address.county}</span>
            ),
        },
        {
            title: 'Property Interests',
            dataIndex: ['preferences', 'propertyTypes'],
            key: 'propertyTypes',
            width: 150,
            render: (types) => (
                <span>
                    {types.map(type => (
                        <Tag key={type} color={type === 'apartment' ? 'green' : 'orange'}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Tag>
                    ))}
                </span>
            ),
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Land', value: 'land' },
            ],
            onFilter: (value, record) => record.preferences.propertyTypes.includes(value),
        },
        {
            title: 'Budget Range (KES)',
            dataIndex: ['preferences', 'budgetRange'],
            key: 'budgetRange',
            width: 180,
            render: (budget) => (
                <span>
                    {budget.min.toLocaleString()} - {budget.max.toLocaleString()}
                </span>
            ),
            sorter: (a, b) => a.preferences.budgetRange.max - b.preferences.budgetRange.max,
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Last Contact',
            key: 'lastContact',
            width: 120,
            render: (_, record) => {
                if (record.communications && record.communications.length > 0) {
                    const sortedComms = [...record.communications].sort(
                        (a, b) => new Date(b.date) - new Date(a.date)
                    );
                    return formatRelativeTime(sortedComms[0].date);
                }
                return <Text type="secondary">No contact</Text>;
            },
            sorter: (a, b) => {
                const aDate = a.communications && a.communications.length > 0
                    ? new Date(a.communications.sort((x, y) => new Date(y.date) - new Date(x.date))[0].date)
                    : new Date(0);
                const bDate = b.communications && b.communications.length > 0
                    ? new Date(b.communications.sort((x, y) => new Date(y.date) - new Date(x.date))[0].date)
                    : new Date(0);
                return bDate - aDate;
            },
        },
        {
            title: 'Purchases',
            dataIndex: 'purchases',
            key: 'purchases',
            width: 100,
            render: (count) => (
                <Badge count={count} showZero style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }} />
            ),
            sorter: (a, b) => a.purchases - b.purchases,
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 130,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<FileSearchOutlined />}
                            size="small"
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Quick Contact">
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item
                                        key="1"
                                        icon={<PhoneOutlined />}
                                        onClick={() => window.open(`tel:${record.phone}`)}
                                    >
                                        Call
                                    </Menu.Item>
                                    <Menu.Item
                                        key="2"
                                        icon={<MailOutlined />}
                                        onClick={() => window.open(`mailto:${record.email}`)}
                                    >
                                        Email
                                    </Menu.Item>
                                    <Menu.Item
                                        key="3"
                                        icon={<MessageOutlined />}
                                        onClick={() => onContact(record)}
                                    >
                                        Log Communication
                                    </Menu.Item>
                                </Menu>
                            }
                            trigger={['click']}
                        >
                            <Button
                                icon={<MessageOutlined />}
                                size="small"
                            />
                        </Dropdown>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => onDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={customers}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500 }}
            expandable={{
                expandedRowRender: (record) => (
                    <p style={{ margin: 0 }}>
                        <strong>Preferred Locations:</strong>{' '}
                        {record.preferences.locations.join(', ')}
                        <br />
                        <strong>Requirements:</strong>{' '}
                        {record.preferences.otherRequirements || 'None specified'}
                    </p>
                ),
            }}
        />
    );
};

export default CustomersTable;