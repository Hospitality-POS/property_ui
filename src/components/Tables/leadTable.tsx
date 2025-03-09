import { Table, Space, Button, Tooltip, Tag, Typography } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export const LeadsTable = ({
    leads,
    agentsData,
    onView,
    onAddActivity,
    onEdit,
    onDelete,
    capitalize,
    formatDate
}) => {
    // Table columns
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <a onClick={() => onView(record)}>{text}</a>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Contact',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Interest',
            key: 'interest',
            render: (_, record) => (
                <Tag color={record.interestAreas[0]?.propertyType === 'apartment' ? 'blue' :
                    record.interestAreas[0]?.propertyType === 'land' ? 'green' : 'purple'}>
                    {record.interestAreas[0]?.propertyType === 'apartment' ? 'Apartment' :
                        record.interestAreas[0]?.propertyType === 'land' ? 'Land' : 'Both'}
                </Tag>
            ),
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Land', value: 'land' },
                { text: 'Both', value: 'both' },
            ],
            onFilter: (value, record) => record.interestAreas[0]?.propertyType === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let displayText = capitalize(status);

                if (status === 'new') color = 'blue';
                if (status === 'contacted') color = 'cyan';
                if (status === 'qualified') color = 'purple';
                if (status === 'negotiation') color = 'orange';
                if (status === 'converted') color = 'green';
                if (status === 'lost') color = 'red';

                return <Tag color={color}>{displayText}</Tag>;
            },
            filters: [
                { text: 'New', value: 'new' },
                { text: 'Contacted', value: 'contacted' },
                { text: 'Qualified', value: 'qualified' },
                { text: 'Negotiation', value: 'negotiation' },
                { text: 'Converted', value: 'converted' },
                { text: 'Lost', value: 'lost' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (source) => {
                const sourceMap = {
                    'website': 'Website',
                    'referral': 'Referral',
                    'social_media': 'Social Media',
                    'direct_call': 'Direct Call',
                    'walk_in': 'Walk-in',
                    'other': 'Other'
                };

                let color = 'default';
                if (source === 'website') color = 'blue';
                if (source === 'referral') color = 'green';
                if (source === 'social_media') color = 'cyan';
                if (source === 'direct_call') color = 'purple';
                if (source === 'walk_in') color = 'magenta';

                return <Tag color={color}>{sourceMap[source] || 'Other'}</Tag>;
            },
            filters: [
                { text: 'Website', value: 'website' },
                { text: 'Referral', value: 'referral' },
                { text: 'Social Media', value: 'social_media' },
                { text: 'Direct Call', value: 'direct_call' },
                { text: 'Walk-in', value: 'walk_in' },
                { text: 'Other', value: 'other' },
            ],
            onFilter: (value, record) => record.source === value,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                let color = 'default';
                let displayText = capitalize(priority);

                if (priority === 'high') color = 'red';
                if (priority === 'medium') color = 'orange';
                if (priority === 'low') color = 'green';

                return <Tag color={color}>{displayText}</Tag>;
            },
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' },
            ],
            onFilter: (value, record) => record.priority === value,
        },
        {
            title: 'Next Follow-up',
            key: 'followUpDate',
            render: (_, record) => record.followUpDate ?
                formatDate(record.followUpDate) : <Text type="secondary">--</Text>,
            sorter: (a, b) => {
                if (!a.followUpDate) return 1;
                if (!b.followUpDate) return -1;
                return new Date(a.followUpDate) - new Date(b.followUpDate);
            },
        },
        {
            title: 'Agent',
            key: 'assignedTo',
            render: (_, record) => record.assignedTo?.name || '--',
            filters: agentsData.map(agent => ({ text: agent.name, value: agent._id })),
            onFilter: (value, record) => record.assignedTo?._id === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Add Activity">
                        <Button
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => onAddActivity(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Lead">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Lead">
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
            dataSource={leads}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            expandable={{
                expandedRowRender: (record) => (
                    <p style={{ margin: 0 }}>
                        <strong>Notes:</strong> {record.notes[0]?.content || 'No notes available'}
                    </p>
                ),
            }}
        />
    );
};

export default LeadsTable;