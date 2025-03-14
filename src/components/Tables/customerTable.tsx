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

// Helper functions for safe data handling
const safeString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return String(value);
};

const safeAccess = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;

    const keys = Array.isArray(path) ? path : path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined || typeof result !== 'object') {
            return defaultValue;
        }
        result = result[key];
    }

    return result === null || result === undefined ? defaultValue : result;
};

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
        try {
            return moment(dateString).format('DD MMM YYYY'); // e.g. 12 Mar 2025
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = moment(dateString);
            const now = moment();

            if (now.diff(date, 'days') < 1) {
                return date.fromNow(); // e.g. "2 hours ago"
            } else if (now.diff(date, 'days') < 7) {
                return `${now.diff(date, 'days')} days ago`;
            } else {
                return formatDate(dateString);
            }
        } catch (e) {
            return 'Invalid Date';
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
                <a onClick={() => onView(record)}>{safeString(text)}</a>
            ),
            sorter: (a, b) => {
                const aId = safeString(a._id);
                const bId = safeString(b._id);
                return aId.localeCompare(bId);
            },
        },
        {
            title: 'Contact Information',
            dataIndex: 'email',
            key: 'contact',
            width: 220,
            render: (email, record) => (
                <span>
                    <div>{safeString(email)}</div>
                    <div>
                        {safeString(record.phone)}{' '}
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
            render: (type) => {
                const typeStr = safeString(type);
                return (
                    <Tag color={typeStr === 'individual' ? 'blue' : 'purple'}>
                        {typeStr.charAt(0).toUpperCase() + typeStr.slice(1)}
                    </Tag>
                );
            },
            filters: [
                { text: 'Individual', value: 'individual' },
                { text: 'Company', value: 'company' },
            ],
            onFilter: (value, record) => safeString(record.customerType) === value,
        },
        {
            title: 'Location',
            dataIndex: ['address', 'city'],
            key: 'city',
            width: 120,
            render: (city, record) => {
                const addressCity = safeAccess(record, ['address', 'city']);
                const addressCounty = safeAccess(record, ['address', 'county']);

                if (!addressCity && !addressCounty) return 'N/A';
                if (!addressCity) return addressCounty;
                if (!addressCounty) return addressCity;

                return (
                    <span>{addressCity}, {addressCounty}</span>
                );
            },
        },
        {
            title: 'Property Interests',
            dataIndex: ['preferences', 'propertyTypes'],
            key: 'propertyTypes',
            width: 150,
            render: (types, record) => {
                const propertyTypes = safeAccess(record, ['preferences', 'propertyTypes'], []);

                if (!Array.isArray(propertyTypes) || propertyTypes.length === 0) {
                    return <span>None specified</span>;
                }

                return (
                    <span>
                        {propertyTypes.map(type => (
                            <Tag key={type} color={type === 'apartment' ? 'green' : 'orange'}>
                                {safeString(type).charAt(0).toUpperCase() + safeString(type).slice(1)}
                            </Tag>
                        ))}
                    </span>
                );
            },
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Land', value: 'land' },
            ],
            onFilter: (value, record) => {
                const propertyTypes = safeAccess(record, ['preferences', 'propertyTypes'], []);
                return Array.isArray(propertyTypes) && propertyTypes.includes(value);
            },
        },
        {
            title: 'Budget Range (KES)',
            dataIndex: ['preferences', 'budgetRange'],
            key: 'budgetRange',
            width: 180,
            render: (budget, record) => {
                const min = safeAccess(record, ['preferences', 'budgetRange', 'min']);
                const max = safeAccess(record, ['preferences', 'budgetRange', 'max']);

                if (!min && !max) return 'Not specified';
                if (!min) return `Up to ${Number(max).toLocaleString()}`;
                if (!max) return `From ${Number(min).toLocaleString()}`;

                return (
                    <span>
                        {Number(min).toLocaleString()} - {Number(max).toLocaleString()}
                    </span>
                );
            },
            sorter: (a, b) => {
                const aMax = Number(safeAccess(a, ['preferences', 'budgetRange', 'max'], 0));
                const bMax = Number(safeAccess(b, ['preferences', 'budgetRange', 'max'], 0));
                return aMax - bMax;
            },
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => formatDate(date),
            sorter: (a, b) => {
                const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return aDate - bDate;
            },
        },
        {
            title: 'Last Contact',
            key: 'lastContact',
            width: 120,
            render: (_, record) => {
                if (record.communications && Array.isArray(record.communications) && record.communications.length > 0) {
                    const sortedComms = [...record.communications].sort(
                        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
                    );
                    return formatRelativeTime(sortedComms[0].date);
                }
                return <Text type="secondary">No contact</Text>;
            },
            sorter: (a, b) => {
                const getLatestCommDate = (record) => {
                    if (!record.communications || !Array.isArray(record.communications) || record.communications.length === 0) {
                        return new Date(0);
                    }

                    try {
                        const sortedComms = [...record.communications].sort(
                            (x, y) => new Date(y.date || 0) - new Date(x.date || 0)
                        );
                        return new Date(sortedComms[0].date || 0);
                    } catch (e) {
                        return new Date(0);
                    }
                };

                const aDate = getLatestCommDate(a);
                const bDate = getLatestCommDate(b);
                return bDate - aDate;
            },
        },
        {
            title: 'Purchases',
            dataIndex: 'purchases',
            key: 'purchases',
            width: 100,
            render: (purchases) => {
                let count = 0;

                if (typeof purchases === 'number') {
                    count = purchases;
                } else if (Array.isArray(purchases)) {
                    count = purchases.length;
                }

                return (
                    <Badge count={count} showZero style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }} />
                );
            },
            sorter: (a, b) => {
                const aCount = typeof a.purchases === 'number' ? a.purchases :
                    Array.isArray(a.purchases) ? a.purchases.length : 0;

                const bCount = typeof b.purchases === 'number' ? b.purchases :
                    Array.isArray(b.purchases) ? b.purchases.length : 0;

                return aCount - bCount;
            },
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
                                        onClick={() => window.open(`tel:${safeString(record.phone)}`)}
                                    >
                                        Call
                                    </Menu.Item>
                                    <Menu.Item
                                        key="2"
                                        icon={<MailOutlined />}
                                        onClick={() => window.open(`mailto:${safeString(record.email)}`)}
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
            dataSource={customers || []}
            rowKey={(record) => record._id || Math.random().toString()}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500 }}
            expandable={{
                expandedRowRender: (record) => {
                    const locations = safeAccess(record, ['preferences', 'locations'], []);
                    const requirements = safeAccess(record, ['preferences', 'otherRequirements'], 'None specified');

                    return (
                        <p style={{ margin: 0 }}>
                            <strong>Preferred Locations:</strong>{' '}
                            {Array.isArray(locations) && locations.length > 0 ? locations.join(', ') : 'None specified'}
                            <br />
                            <strong>Requirements:</strong>{' '}
                            {requirements}
                        </p>
                    );
                },
            }}
        />
    );
};

export default CustomersTable;