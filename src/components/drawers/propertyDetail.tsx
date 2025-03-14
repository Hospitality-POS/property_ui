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
    Table
} from 'antd';
import {
    FileTextOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined
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
    formatDate
}) => {
    if (!property) {
        return null;
    }

    // Calculate total units and value
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
            return total + ((unit.price || 0) * (unit.totalUnits || 0));
        }, 0);
    };

    // Unit table columns
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
                    'penthouse': 'Penthouse',
                    'plot': 'Plot',
                    'parcel': 'Parcel',
                    'other': 'Other'
                };
                return typeMap[text] || text;
            }
        },
        {
            title: 'Price (KES)',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price?.toLocaleString() || 'N/A'
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
                                    <Descriptions.Item label="Date Added">
                                        {property.createdAt}
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