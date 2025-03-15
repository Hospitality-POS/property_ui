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
    Carousel,
    Tabs,
    Descriptions,
    List,
    Avatar
} from 'antd';
import {
    FileTextOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    CheckCircleOutlined,
    PlusOutlined
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
    formatStatus
}) => {
    if (!property) {
        return null;
    }

    return (
        <Drawer
            title={`Property Details: ${property._id}`}
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
                                {formatPropertyType(property.propertyType)} - {
                                    property.propertyType === 'land'
                                        ? `${property.landSize} ${property.sizeUnit}`
                                        : `${property.apartmentSize} sq m`
                                }
                            </Text>
                            <Text>
                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                {property.location.address}, {property.location.county}
                            </Text>
                            <Text>
                                <UserOutlined style={{ marginRight: 8 }} />
                                Manager: {property.propertyManager.name}
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
                            <Text>Added:</Text> {property.createdAt}
                        </div>
                        <div style={{ marginTop: 4 }}>
                            <Text>Updated:</Text> {property.updatedAt}
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

            {/* Property Image Carousel */}
            {/* <Card style={{ marginBottom: 16 }}>
                <Carousel autoplay>
                    {property.images.map((image, index) => (
                        <div key={index}>
                            <div
                                style={{
                                    height: '300px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    background: '#f0f0f0',
                                }}
                            >
                                <img
                                    src={image}
                                    alt={`Property ${index + 1}`}
                                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                                />
                            </div>
                        </div>
                    ))}
                </Carousel>
            </Card> */}

            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}>
                <TabPane tab="Overview" key="1">
                    <Card title="Property Overview" style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Property Type">
                                        {formatPropertyType(property.propertyType)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Size">
                                        {property.propertyType === 'land'
                                            ? `${property.landSize} ${property.sizeUnit}`
                                            : `${property.apartmentSize} sq m`
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Location">
                                        {property.location.address}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="County">
                                        {property.location.county}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Constituency">
                                        {property.location.constituency}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Price">
                                        KES {property.price.toLocaleString()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        {formatStatus(property.status)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Property Manager">
                                        {property.propertyManager.name}
                                    </Descriptions.Item>
                                    {/* <Descriptions.Item label="Documents">
                                        {property.documents.length} documents
                                    </Descriptions.Item> */}
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

                    {property.propertyType === 'land' && (
                        <Card title="Land Details" style={{ marginBottom: 16 }}>
                            <Descriptions column={2} bordered>
                                <Descriptions.Item label="Plot Number">
                                    {property.plotNumber}
                                </Descriptions.Item>
                                <Descriptions.Item label="Land Size">
                                    {property.landSize} {property.sizeUnit}
                                </Descriptions.Item>
                                <Descriptions.Item label="Land Rate per Unit">
                                    KES {property.landRatePerUnit.toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Title Deed Number">
                                    {property.titleDeedNumber}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    )}

                    {property.propertyType === 'apartment' && (
                        <Card title="Apartment Details" style={{ marginBottom: 16 }}>
                            <Descriptions column={2} bordered>
                                <Descriptions.Item label="Unit Number">
                                    {property.unitNumber}
                                </Descriptions.Item>
                                <Descriptions.Item label="Building Name">
                                    {property.buildingName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Bedrooms">
                                    {property.bedrooms}
                                </Descriptions.Item>
                                <Descriptions.Item label="Bathrooms">
                                    {property.bathrooms}
                                </Descriptions.Item>
                                <Descriptions.Item label="Floor">
                                    {property.floor || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Construction Status">
                                    {property.constructionStatus === 'ready' ? 'Ready' : 'Under Construction'}
                                </Descriptions.Item>
                            </Descriptions>

                            {property.amenities && property.amenities.length > 0 && (
                                <>
                                    <Divider orientation="left">Amenities</Divider>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {property.amenities.map((amenity, idx) => (
                                            <Tag key={idx} color="blue">
                                                <CheckCircleOutlined /> {amenity}
                                            </Tag>
                                        ))}
                                    </div>
                                </>
                            )}
                        </Card>
                    )}
                </TabPane>

                {/* <TabPane tab="Documents" key="2">
                    <List
                        itemLayout="horizontal"
                        dataSource={property.documents}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button type="link">View</Button>,
                                    <Button type="link">Download</Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<FileTextOutlined />} />}
                                    title={item.name}
                                    description={`Type: ${item.type} | Uploaded: ${item.uploadedAt}`}
                                />
                            </List.Item>
                        )}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                    >
                        Upload Document
                    </Button>
                </TabPane> */}

                <TabPane tab="Location" key="3">
                    <Card>
                        {/* <div
                            style={{
                                height: '300px',
                                background: '#f0f0f0',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <Text type="secondary">
                                Map would be displayed here showing the property location
                                at coordinates: {property.location.coordinates.coordinates.join(', ')}
                            </Text>
                        </div> */}
                        <Descriptions title="Location Details" bordered>
                            <Descriptions.Item label="Address" span={3}>
                                {property.location.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="County">
                                {property.location.county}
                            </Descriptions.Item>
                            <Descriptions.Item label="Constituency">
                                {property.location.constituency || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="GPS Coordinates">
                                {property.location.coordinates.coordinates.join(', ')}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </TabPane>
            </Tabs>
        </Drawer>
    );
};

export default PropertyDetailsDrawer;