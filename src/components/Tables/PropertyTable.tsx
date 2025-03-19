import { Table, Space, Button, Tooltip, Tag, Typography, Progress } from 'antd';
import {
    FileSearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    TagOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export const PropertyTable = ({
    properties,
    onView,
    onEdit,
    onDelete,
    formatPropertyType,
    formatStatus,
    formatDate,
    getCustomColumns,
    getUnitPriceForPhase
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

    // Calculate property value using phase-specific pricing
    const calculatePropertyValue = (property) => {
        if (!property.units || !Array.isArray(property.units)) return 0;
        return property.units.reduce((total, unit) => {
            // Get the price based on the current phase
            const price = getUnitPriceForPhase
                ? getUnitPriceForPhase(unit, property.currentPhase)
                : (unit.price || unit.basePrice || 0);

            return total + (price * (unit.totalUnits || 0));
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
    const defaultColumns = [
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
            width: 100,
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
            title: 'Current Phase',
            dataIndex: 'currentPhase',
            key: 'currentPhase',
            width: 130,
            render: (phase, record) => {
                if (!phase) return <span>-</span>;

                // Find the phase in the property's phases array to get more details
                const phaseDetails = record.phases?.find(p => p.name === phase);
                const isActive = phaseDetails?.active;

                return (
                    <Tooltip title={isActive ? 'Active phase' : 'Phase set but not active'}>
                        <Tag color={isActive ? 'blue' : 'default'} icon={<TagOutlined />}>
                            {phase}
                        </Tag>
                    </Tooltip>
                );
            },
            filters: Array.from(new Set(properties
                .filter(p => p.currentPhase)
                .map(p => p.currentPhase)))
                .map(phase => ({ text: phase, value: phase })),
            onFilter: (value, record) => record.currentPhase === value,
        },
        {
            title: 'Location',
            key: 'location',
            width: 140,
            render: (_, record) => (
                <span>
                    <EnvironmentOutlined style={{ marginRight: 5 }} /> {record.location?.address || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Units Info',
            key: 'units',
            width: 130,
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
            width: 150,
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
            width: 140,
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
            width: 120,
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
            width: 150,
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

    // Use custom columns if provided, otherwise use default
    const columns = getCustomColumns ? getCustomColumns(defaultColumns) : defaultColumns;

    return (
        <Table
            columns={columns}
            dataSource={properties}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1600 }}
            // expandable={{
            //     expandedRowRender: (record) => (
            //         <div style={{ margin: 0 }}>
            //             <p><strong>Description:</strong> {record.description}</p>
            //             {record.currentPhase && (
            //                 <p><strong>Current Phase:</strong> {record.currentPhase}</p>
            //             )}
            //             {record.phases && record.phases.length > 0 && (
            //                 <div>
            //                     <strong>Available Phases:</strong>
            //                     <ul>
            //                         {record.phases.map((phase, index) => (
            //                             <li key={index}>
            //                                 {phase.name} {phase.active ? '(Active)' : ''}
            //                                 {phase.startDate ? ` - Started: ${formatDate(phase.startDate)}` : ''}
            //                                 {phase.endDate ? ` - Ends: ${formatDate(phase.endDate)}` : ''}
            //                             </li>
            //                         ))}
            //                     </ul>
            //                 </div>
            //             )}
            //             {record.units && record.units.length > 0 && (
            //                 <div>
            //                     <strong>Unit Types:</strong>
            //                     <ul>
            //                         {record.units.map((unit, index) => {
            //                             // Get the current price for this unit based on the phase
            //                             const currentPrice = getUnitPriceForPhase
            //                                 ? getUnitPriceForPhase(unit, record.currentPhase)
            //                                 : (unit.price || unit.basePrice || 0);

            //                             // Format the unit type name for display
            //                             const unitTypeDisplay = unit.unitType === 'plot' || unit.unitType === 'parcel'
            //                                 ? `${unit.unitType} ${unit.plotSize || ''}`
            //                                 : unit.unitType;

            //                             // Show base price and current phase price if they differ
            //                             const basePriceDisplay = unit.basePrice && unit.basePrice !== currentPrice
            //                                 ? ` (Base: KES ${unit.basePrice.toLocaleString()})`
            //                                 : '';

            //                             return (
            //                                 <li key={index}>
            //                                     {unitTypeDisplay}: {unit.availableUnits}/{unit.totalUnits} units available
            //                                     - KES {currentPrice.toLocaleString()}{basePriceDisplay}
            //                                     {unit.phasePricing && unit.phasePricing.length > 0 && (
            //                                         <ul>
            //                                             {unit.phasePricing.map((phasePrice, i) => (
            //                                                 <li key={i} style={{ fontSize: '0.9em' }}>
            //                                                     Phase "{phasePrice.phaseName}": KES {phasePrice.price.toLocaleString()}
            //                                                     {phasePrice.active && ' (Active)'}
            //                                                 </li>
            //                                             ))}
            //                                         </ul>
            //                                     )}
            //                                 </li>
            //                             );
            //                         })}
            //                     </ul>
            //                 </div>
            //             )}
            //         </div>
            //     ),
            // }}
            summary={(pageData) => {
                if (pageData.length === 0) return null;

                let pageTotal = 0;
                pageData.forEach((record) => {
                    pageTotal += calculatePropertyValue(record);
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