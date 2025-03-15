import { Table, Space, Button, Tooltip, Tag, Typography, Progress } from 'antd';
import {
    FileSearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export const PropertyTable = ({
    properties,
    onView,
    onEdit,
    onDelete,
    formatPropertyType,
    formatStatus
}) => {
    // Table columns definition
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
            title: 'Type',
            dataIndex: 'propertyType',
            key: 'propertyType',
            width: 120,
            render: (type) => {
                let color = type === 'land' ? 'green' : 'blue';
                return <Tag color={color}>{formatPropertyType(type)}</Tag>;
            },
            filters: [
                { text: 'Land', value: 'land' },
                { text: 'Apartment', value: 'apartment' },
            ],
            onFilter: (value, record) => record.propertyType === value,
        },
        {
            title: 'Location',
            key: 'location',
            width: 150,
            render: (_, record) => (
                <span>
                    <EnvironmentOutlined style={{ marginRight: 5 }} /> {record.location.address}
                </span>
            ),
        },
        {
            title: 'Size',
            key: 'size',
            width: 100,
            render: (_, record) => {
                if (record.propertyType === 'land') {
                    return `${record.landSize} ${record.sizeUnit}`;
                } else {
                    return `${record.apartmentSize} sq m`;
                }
            },
        },
        {
            title: 'Price (KES)',
            dataIndex: 'price',
            key: 'price',
            width: 160,
            render: (price) => price > 0 ? price.toLocaleString() : <Text>N/A</Text>,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => {
                let color = 'green';
                if (status === 'reserved') color = 'orange';
                if (status === 'sold') color = 'red';
                if (status === 'under_construction') color = 'blue';
                return <Tag color={color}>{formatStatus(status)}</Tag>;
            },
            filters: [
                { text: 'Available', value: 'available' },
                { text: 'Reserved', value: 'reserved' },
                { text: 'Sold', value: 'sold' },
                { text: 'Under Construction', value: 'under_construction' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Manager',
            key: 'manager',
            width: 130,
            render: (_, record) => record.propertyManager.name,
            filters: Array.from(new Set(properties.map(p => p.propertyManager.name)))
                .map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record.propertyManager.name === value,
        },
        {
            title: 'Date Added',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Sale Progress',
            key: 'salesProgress',
            width: 160,
            render: (_, record) => {
                if (record.status === 'sold') {
                    return <Progress percent={100} size="small" status="success" />;
                }
                if (record.status === 'reserved') {
                    return <Progress percent={50} size="small" status="active" />;
                }
                return <Progress percent={0} size="small" />;
            },
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
            dataSource={properties}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500 }}
            expandable={{
                expandedRowRender: (record) => (
                    <p style={{ margin: 0 }}>
                        <strong>Description:</strong> {record.description}
                    </p>
                ),
            }}
            summary={(pageData) => {
                if (pageData.length === 0) return null;

                let pageTotal = 0;
                pageData.forEach(({ price }) => {
                    pageTotal += price || 0;
                });

                return (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5}>
                                <strong>Page Total</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5}>
                                <Text type="danger">KES {pageTotal.toLocaleString()}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={6} colSpan={5}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
};

export default PropertyTable;