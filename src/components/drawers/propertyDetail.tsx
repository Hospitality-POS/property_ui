import {
    Drawer,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Divider,
    Steps,
    Card,
    Tabs,
    Descriptions,
    Table,
    Tooltip,
    Badge
} from 'antd';
import {
    FileTextOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    TagOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

export const PropertyDetailsDrawer = ({
    visible,
    property,
    activeTab,
    onTabChange,
    onClose,
    formatPropertyType,
    formatStatus,
    formatDate,
    getUnitPriceForPhase
}) => {
    if (!property) {
        return null;
    }

    // Calculate total units and value based on phase pricing
    const calculateTotalUnits = () => {
        if (!property.units || !Array.isArray(property.units)) return 0;
        return property.units.reduce((total, unit) => total + (unit.totalUnits || 0), 0);
    };

    const calculateAvailableUnits = () => {
        if (!property.units || !Array.isArray(property.units)) return 0;
        return property.units.reduce((total, unit) => total + (unit.availableUnits || 0), 0);
    };

    const calculateTotalValue = () => {
        if (!property.units || !Array.isArray(property.units)) return 0;
        return property.units.reduce((total, unit) => {
            // Use getUnitPriceForPhase if available to get correct phase price
            const unitPrice = getUnitPriceForPhase
                ? getUnitPriceForPhase(unit, property.currentPhase)
                : (unit.price || 0);

            return total + (unitPrice * (unit.totalUnits || 0));
        }, 0);
    };

    // Unit table columns with phase pricing
    const unitColumns = [
        {
            title: 'Type',
            dataIndex: 'unitType',
            key: 'unitType',
            render: (text) => {
                const typeMap = {
                    'studio': 'Studio',
                    'one_bedroom': 'One Bedroom',
                    'two_bedroom': 'Two Bedroom',
                    'three_bedroom': 'Three Bedroom',
                    'shops': 'Shops',
                    'penthouse': 'Penthouse',
                    'plot': 'Plot',
                    'parcel': 'Parcel',
                    'other': 'Other'
                };
                return typeMap[text] || text;
            }
        },
        {
            title: 'Base Price',
            dataIndex: 'basePrice',
            key: 'basePrice',
            render: (basePrice) => `KES ${basePrice?.toLocaleString() || 0}`
        },
        {
            title: () => (
                <span>
                    Current Price {property.currentPhase && (
                        <Tooltip title={`Based on current phase: ${property.currentPhase}`}>
                            <Tag color="blue">{property.currentPhase}</Tag>
                        </Tooltip>
                    )}
                </span>
            ),
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => {
                // Get current phase price if available
                const phasePrice = property.currentPhase && record.phasePricing
                    ? record.phasePricing.find(p => p.phaseName === property.currentPhase)
                    : null;

                const displayPrice = phasePrice ? phasePrice.price : price;
                return `KES ${displayPrice?.toLocaleString() || 0}`;
            }
        },
        {
            title: 'Total Units',
            dataIndex: 'totalUnits',
            key: 'totalUnits'
        },
        {
            title: 'Available',
            dataIndex: 'availableUnits',
            key: 'availableUnits'
        },
        {
            title: 'Sold',
            key: 'sold',
            render: (_, record) => (record.totalUnits || 0) - (record.availableUnits || 0)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'reserved') color = 'orange';
                if (status === 'sold') color = 'red';
                if (status === 'under_construction') color = 'blue';
                return <Tag color={color}>{formatStatus(status)}</Tag>;
            }
        }
    ];

    // Additional columns for land plots
    const landUnitColumns = [
        ...unitColumns.slice(0, 1),
        {
            title: 'Plot Size',
            dataIndex: 'plotSize',
            key: 'plotSize'
        },
        ...unitColumns.slice(1)
    ];

    // Columns for the phases table
    const phaseColumns = [
        {
            title: 'Phase Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space>
                    {name}
                    {record.active && <Tag color="green">Active</Tag>}
                    {property.currentPhase === name && <Tag color="blue">Current</Tag>}
                </Space>
            )
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: date => formatDate(date)
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: date => date ? formatDate(date) : 'Not set'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: description => description || 'No description'
        }
    ];

    // Unit pricing details for each phase
    const renderUnitPhasePricing = () => {
        if (!property.units || !property.phases ||
            !Array.isArray(property.units) || !Array.isArray(property.phases) ||
            property.units.length === 0 || property.phases.length === 0) {
            return <Text>No phase pricing information available</Text>;
        }

        // Create columns: unit type and one column per phase
        const columns = [
            {
                title: 'Unit Type',
                dataIndex: 'unitType',
                key: 'unitType',
                fixed: 'left',
                width: 150,
                render: (text) => {
                    const typeMap = {
                        'studio': 'Studio',
                        'one_bedroom': 'One Bedroom',
                        'two_bedroom': 'Two Bedroom',
                        'three_bedroom': 'Three Bedroom',
                        'penthouse': 'Penthouse',
                        'shops': 'Shops',
                        'plot': 'Plot',
                        'parcel': 'Parcel',
                        'other': 'Other'
                    };
                    return typeMap[text] || text;
                }
            },
            {
                title: 'Base Price',
                dataIndex: 'basePrice',
                key: 'basePrice',
                fixed: 'left',
                width: 120,
                render: price => `KES ${price?.toLocaleString() || 0}`
            },
            ...property.phases.map(phase => ({
                title: (
                    <div>
                        {phase.name}
                        {phase.name === property.currentPhase &&
                            <Badge status="processing" style={{ marginLeft: 5 }} />
                        }
                    </div>
                ),
                dataIndex: phase.name,
                key: phase.name,
                width: 120,
                render: (_, record) => {
                    const phasePrice = record.phasePricing?.find(p => p.phaseName === phase.name);
                    if (phasePrice) {
                        return `KES ${phasePrice.price?.toLocaleString() || 0}`;
                    }
                    return `KES ${record.basePrice?.toLocaleString() || 0}`;
                }
            }))
        ];

        return (
            <Table
                dataSource={property.units}
                columns={columns}
                rowKey={record => record._id}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
            />
        );
    };

    return (
        <Drawer
            title={`Property Details`}
            placement="right"
            onClose={onClose}
            open={visible}
            width={700}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button type="primary" icon={<FileTextOutlined />} style={{ marginRight: 8 }}>
                        Generate Report
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            }
        >
            <div style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Title level={4}>{property.name}</Title>
                        <Space direction="vertical">
                            <Text>
                                <HomeOutlined style={{ marginRight: 8 }} />
                                {formatPropertyType(property.propertyType)} - {calculateTotalUnits()} units
                            </Text>
                            <Text>
                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                {property.location?.address}, {property.location?.county}
                            </Text>
                            <Text>
                                <UserOutlined style={{ marginRight: 8 }} />
                                Manager: {property.propertyManager?.name}
                            </Text>
                            {property.currentPhase && (
                                <Text>
                                    <TagOutlined style={{ marginRight: 8 }} />
                                    Current Phase: <Tag color="blue">{property.currentPhase}</Tag>
                                </Text>
                            )}
                        </Space>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Tag
                            color={
                                property.status === 'available'
                                    ? 'green'
                                    : property.status === 'reserved'
                                        ? 'orange'
                                        : property.status === 'sold'
                                            ? 'red'
                                            : 'blue'
                            }
                            style={{ fontSize: '14px', padding: '4px 8px' }}
                        >
                            {formatStatus(property.status)}
                        </Tag>
                        <div style={{ marginTop: 8 }}>
                            <Text>Added:</Text> {formatDate(property.createdAt)}
                        </div>
                        <div style={{ marginTop: 4 }}>
                            <Text>Updated:</Text> {formatDate(property.updatedAt)}
                        </div>
                    </Col>
                </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Property Progress Steps */}
            <div style={{ marginBottom: 24 }}>
                <Steps
                    size="small"
                    current={
                        property.status === 'available'
                            ? 0
                            : property.status === 'reserved'
                                ? 1
                                : property.status === 'sold'
                                    ? 2
                                    : property.status === 'under_construction'
                                        ? 1
                                        : 0
                    }
                >
                    <Step title="Available" />
                    <Step title="Reserved/In Progress" />
                    <Step title="Sold/Completed" />
                </Steps>
            </div>

            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}>
                <TabPane tab="Overview" key="1">
                    <Card title="Property Overview" style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Property Type">
                                        {formatPropertyType(property.propertyType)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Units">
                                        {calculateTotalUnits()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Available Units">
                                        {calculateAvailableUnits()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Location">
                                        {property.location?.address}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="County">
                                        {property.location?.county}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Total Value">
                                        KES {calculateTotalValue().toLocaleString()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        {formatStatus(property.status)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Property Manager">
                                        {property.propertyManager?.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Constituency">
                                        {property.location?.constituency || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Current Phase">
                                        {property.currentPhase || 'None'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Description" style={{ marginBottom: 16 }}>
                        <Paragraph>{property.description}</Paragraph>
                    </Card>

                    <Card title={`${formatPropertyType(property.propertyType)} Units`} style={{ marginBottom: 16 }}>
                        <Table
                            dataSource={property.units || []}
                            columns={property.propertyType === 'land' ? landUnitColumns : unitColumns}
                            rowKey={(record) => record._id}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Pricing Phases" key="2">
                    <Card title="Property Phases" style={{ marginBottom: 16 }}>
                        {property.phases && property.phases.length > 0 ? (
                            <Table
                                dataSource={property.phases}
                                columns={phaseColumns}
                                rowKey={(record) => record._id || record.name}
                                pagination={false}
                                size="small"
                            />
                        ) : (
                            <Text>No phases defined for this property</Text>
                        )}
                    </Card>

                    <Card title="Unit Pricing by Phase" style={{ marginBottom: 16 }}>
                        {renderUnitPhasePricing()}
                    </Card>
                </TabPane>

                <TabPane tab="Location" key="3">
                    <Card>
                        <Descriptions title="Location Details" bordered>
                            <Descriptions.Item label="Address" span={3}>
                                {property.location?.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="County">
                                {property.location?.county}
                            </Descriptions.Item>
                            <Descriptions.Item label="Constituency">
                                {property.location?.constituency || 'N/A'}
                            </Descriptions.Item>
                            {property.location?.coordinates?.coordinates && (
                                <Descriptions.Item label="GPS Coordinates">
                                    {property.location.coordinates.coordinates.join(', ')}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </TabPane>
            </Tabs>
        </Drawer>
    );
};

export default PropertyDetailsDrawer;