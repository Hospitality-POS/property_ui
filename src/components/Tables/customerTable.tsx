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
    console.log('customer info', customers);
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

    // Function to get the latest communication date
    const getLatestCommunication = (communications) => {
        if (!communications || !Array.isArray(communications) || communications.length === 0) {
            return null;
        }

        try {
            const sortedComms = [...communications].sort(
                (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
            );
            return sortedComms[0];
        } catch (e) {
            return null;
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
                const aName = safeString(a.name);
                const bName = safeString(b.name);
                return aName.localeCompare(bName);
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
                    {record.alternatePhone && (
                        <div>Alt: {safeString(record.alternatePhone)}</div>
                    )}
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
            title: 'Occupation',
            dataIndex: 'occupation',
            key: 'occupation',
            width: 120,
            render: (occupation) => {
                return safeString(occupation) || 'Not specified';
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
            title: 'Lead Source',
            dataIndex: 'leadSource',
            key: 'leadSource',
            width: 120,
            render: (source) => {
                const sourceStr = safeString(source);
                if (!sourceStr) return 'Unknown';

                const colorMap = {
                    'direct': 'green',
                    'referral': 'blue',
                    'website': 'purple',
                    'social': 'cyan',
                    'agent': 'orange'
                };

                return (
                    <Tag color={colorMap[sourceStr.toLowerCase()] || 'default'}>
                        {sourceStr.charAt(0).toUpperCase() + sourceStr.slice(1)}
                    </Tag>
                );
            },
            filters: [
                { text: 'Direct', value: 'direct' },
                { text: 'Referral', value: 'referral' },
                { text: 'Website', value: 'website' },
                { text: 'Social', value: 'social' },
                { text: 'Agent', value: 'agent' }
            ],
            onFilter: (value, record) => safeString(record.leadSource).toLowerCase() === value,
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
                const latestComm = getLatestCommunication(record.communications);
                if (latestComm) {
                    return formatRelativeTime(latestComm.date);
                }
                return <Text type="secondary">No contact</Text>;
            },
            sorter: (a, b) => {
                const aComm = getLatestCommunication(a.communications);
                const bComm = getLatestCommunication(b.communications);

                const aDate = aComm && aComm.date ? new Date(aComm.date) : new Date(0);
                const bDate = bComm && bComm.date ? new Date(bComm.date) : new Date(0);

                return bDate - aDate;
            },
        },
        {
            title: 'Notes',
            key: 'notes',
            width: 100,
            render: (_, record) => {
                const notesCount = Array.isArray(record.notes) ? record.notes.length : 0;
                return (
                    <Badge
                        count={notesCount}
                        showZero
                        style={{ backgroundColor: notesCount > 0 ? '#1890ff' : '#d9d9d9' }}
                    />
                );
            },
            sorter: (a, b) => {
                const aCount = Array.isArray(a.notes) ? a.notes.length : 0;
                const bCount = Array.isArray(b.notes) ? b.notes.length : 0;
                return aCount - bCount;
            },
        },
        {
            title: 'Purchases',
            key: 'purchases',
            width: 100,
            render: (_, record) => {
                const count = Array.isArray(record.purchases) ? record.purchases.length : 0;
                return (
                    <Badge
                        count={count}
                        showZero
                        style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
                    />
                );
            },
            sorter: (a, b) => {
                const aCount = Array.isArray(a.purchases) ? a.purchases.length : 0;
                const bCount = Array.isArray(b.purchases) ? b.purchases.length : 0;
                return aCount - bCount;
            },
        },
        {
            title: 'Payment Plans',
            key: 'paymentPlans',
            width: 120,
            render: (_, record) => {
                const count = Array.isArray(record.paymentPlans) ? record.paymentPlans.length : 0;
                return (
                    <Badge
                        count={count}
                        showZero
                        style={{ backgroundColor: count > 0 ? '#fa8c16' : '#d9d9d9' }}
                    />
                );
            },
            sorter: (a, b) => {
                const aCount = Array.isArray(a.paymentPlans) ? a.paymentPlans.length : 0;
                const bCount = Array.isArray(b.paymentPlans) ? b.paymentPlans.length : 0;
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
                    const latestNote = Array.isArray(record.notes) && record.notes.length > 0
                        ? record.notes.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))[0]
                        : null;
                    const latestPurchase = Array.isArray(record.purchases) && record.purchases.length > 0
                        ? record.purchases[0]
                        : null;

                    return (
                        <div style={{ margin: 0 }}>
                            {record.company && (
                                <p><strong>Company:</strong> {safeString(record.company)}</p>
                            )}
                            <p>
                                <strong>ID Number:</strong> {safeString(record.idNumber) || 'Not provided'}
                            </p>
                            <p>
                                <strong>Preferred Locations:</strong>{' '}
                                {Array.isArray(locations) && locations.length > 0 ? locations.join(', ') : 'None specified'}
                            </p>
                            <p>
                                <strong>Requirements:</strong>{' '}
                                {requirements || 'None specified'}
                            </p>
                            {latestNote && (
                                <p>
                                    <strong>Latest Note ({formatDate(latestNote.addedAt)}):</strong>{' '}
                                    {latestNote.content}
                                </p>
                            )}
                            {latestPurchase && (
                                <p>
                                    <strong>Latest Purchase:</strong>{' '}
                                    {latestPurchase.property ? safeString(latestPurchase.property.title || latestPurchase.property.name) : 'Unknown property'} -
                                    KES {Number(latestPurchase.salePrice).toLocaleString()} -
                                    Status: <Tag color={latestPurchase.status === 'completed' ? 'green' : 'orange'}>{safeString(latestPurchase.status)}</Tag>
                                </p>
                            )}
                        </div>
                    );
                },
            }}
        />
    );
};

export default CustomersTable;