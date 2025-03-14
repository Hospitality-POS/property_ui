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
    formatStatus,
    formatDate
}) => {
    // Calculate total units and value for a property
    const calculatePropertyUnits = (property) => {
        if (!property.units || !Array.isArray(property.units)) return 0;
        return property.units.reduce((total, unit) => total + (unit.totalUnits || 0), 0);
    };

    const calculateAvailableUnits = (property) => {
        if (!property.units || !Array.isArray(property.units)) return 0;
        return property.units.reduce((total, unit) => total + (unit.availableUnits || 0), 0);
    };

    const calculatePropertyValue = (property) => {
        if (!property.units || !Array.isArray(property.units)) return 0;
        return property.units.reduce((total, unit) => {
            return total + ((unit.price || 0) * (unit.totalUnits || 0));
        }, 0);
    };

    // Calculate sale progress as percentage of sold units
    const calculateSaleProgress = (property) => {
        const totalUnits = calculatePropertyUnits(property);
        if (totalUnits === 0) return 0;

        const availableUnits = calculateAvailableUnits(property);
        const soldUnits = totalUnits - availableUnits;

        return Math.round((soldUnits / totalUnits) * 100);
    };

    // Get plot sizes for land properties
    const getPlotSizes = (property) => {
        if (property.propertyType !== 'land' || !property.units || !Array.isArray(property.units)) {
            return 'N/A';
        }

        // Get unique plot sizes
        const plotSizes = [...new Set(property.units
            .filter(unit => unit.plotSize)
            .map(unit => unit.plotSize))];

        return plotSizes.join(', ');
    };

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
                    <EnvironmentOutlined style={{ marginRight: 5 }} /> {record.location?.address || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Units Info',
            key: 'units',
            width: 140,
            render: (_, record) => {
                const totalUnits = calculatePropertyUnits(record);
                const availableUnits = calculateAvailableUnits(record);

                return (
                    <span>
                        {availableUnits} / {totalUnits} units
                        {record.propertyType === 'land' && (
                            <div><small>{getPlotSizes(record)}</small></div>
                        )}
                    </span>
                );
            },
        },
        {
            title: 'Total Value (KES)',
            key: 'value',
            width: 160,
            render: (_, record) => {
                const value = calculatePropertyValue(record);
                return value > 0 ? value.toLocaleString() : <Text>N/A</Text>;
            },
            sorter: (a, b) => calculatePropertyValue(a) - calculatePropertyValue(b),
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
            render: (_, record) => record.propertyManager?.name || 'N/A',
            filters: Array.from(new Set(properties
                .filter(p => p.propertyManager?.name)
                .map(p => p.propertyManager.name)))
                .map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record.propertyManager?.name === value,
        },
        {
            title: 'Date Added',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (text) => formatDate(text),
        },
        {
            title: 'Sale Progress',
            key: 'salesProgress',
            width: 160,
            render: (_, record) => {
                const progress = calculateSaleProgress(record);

                if (progress === 100) {
                    return <Progress percent={100} size="small" status="success" />;
                }

                if (progress > 0) {
                    return <Progress percent={progress} size="small" status="active" />;
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
                    <div style={{ margin: 0 }}>
                        <p><strong>Description:</strong> {record.description}</p>
                        {record.units && record.units.length > 0 && (
                            <div>
                                <strong>Unit Types:</strong>
                                <ul>
                                    {record.units.map((unit, index) => (
                                        <li key={index}>
                                            {unit.unitType}: {unit.availableUnits}/{unit.totalUnits} units available
                                            ({unit.propertyType === 'land' ? unit.plotSize : ''}) -
                                            KES {unit.price?.toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ),
            }}
            summary={(pageData) => {
                if (pageData.length === 0) return null;

                let pageTotal = 0;
                pageData.forEach((record) => {
                    pageTotal += calculatePropertyValue(record);
                });

                return (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4}>
                                <strong>Page Total</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4}>
                                <Text type="danger">KES {pageTotal.toLocaleString()}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5} colSpan={5}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
};

export default PropertyTable;