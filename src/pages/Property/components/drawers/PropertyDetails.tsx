import React, { useState } from 'react';
import formatDate from '@/utils/formatDateUtil';
import {
    FileTextOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    BarChartOutlined,
    PictureOutlined,
    DollarOutlined,
    SettingOutlined,
    TagsOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    TagOutlined
} from '@ant-design/icons';
import {
    Tag,
    Drawer,
    Button,
    Row,
    Col,
    Space,
    Divider,
    Tabs,
    Card,
    Descriptions,
    Table,
    Typography,
    Progress,
    Statistic,
    Badge,
    Avatar,
    Steps
} from 'antd';
import { ProCard, StatisticCard, ProTable } from '@ant-design/pro-components';
import QuickStats from './components/QuickStats';


interface PropertyDetailsProps {
    property: any;
    visible: boolean;
    onClose: () => void;
}

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

const formatStatus = (status: string) => {
    const statusMap = {
        available: 'Available',
        reserved: 'Reserved',
        sold: 'Sold',
        under_construction: 'Under Construction'
    };
    return statusMap[status] || status;
};

const formatUnitType = (type: string) => {
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
    return typeMap[type] || type;
};

const getStatusColor = (status: string) => {
    const colorMap = {
        available: 'green',
        reserved: 'orange',
        sold: 'red',
        under_construction: 'blue'
    };
    return colorMap[status] || 'default';
};

const getCurrentPrice = (unit) => {
    if (!unit.phasePricing || unit.phasePricing.length === 0) {
        return unit.basePrice || 0;
    }

    const activePhase = unit.phasePricing.find(phase => phase.active);
    return activePhase ? activePhase.price : unit.basePrice || 0;
};

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, visible, onClose }) => {
    const [activeTab, setActiveTab] = useState('1');

    if (!property) {
        return null;
    }

    // Calculate property statistics
    const totalUnits = property.units?.reduce((total, unit) => total + (unit.totalUnits || 0), 0) || 0;
    const availableUnits = property.units?.reduce((total, unit) => total + (unit.availableUnits || 0), 0) || 0;
    const soldUnits = totalUnits - availableUnits;
    const occupancyRate = totalUnits > 0 ? ((soldUnits / totalUnits) * 100).toFixed(1) : 0;

    // Use current phase pricing for value calculations
    const totalValue = property.units?.reduce((total, unit) => {
        const currentPrice = getCurrentPrice(unit);
        return total + (currentPrice * (unit.totalUnits || 0));
    }, 0) || 0;

    const soldValue = property.units?.reduce((total, unit) => {
        const currentPrice = getCurrentPrice(unit);
        return total + (currentPrice * ((unit.totalUnits || 0) - (unit.availableUnits || 0)));
    }, 0) || 0;

    // Unit table columns
    const unitColumns = [
        {
            title: 'Type',
            dataIndex: 'unitType',
            key: 'unitType',
            render: (text) => formatUnitType(text)
        },
        {
            title: 'Total Units',
            dataIndex: 'totalUnits',
            key: 'totalUnits',
            sorter: (a, b) => (a.totalUnits || 0) - (b.totalUnits || 0)
        },
        {
            title: 'Available',
            dataIndex: 'availableUnits',
            key: 'availableUnits',
            sorter: (a, b) => (a.availableUnits || 0) - (b.availableUnits || 0)
        },
        {
            title: 'Sold',
            key: 'sold',
            sorter: (a, b) => ((a.totalUnits || 0) - (a.availableUnits || 0)) - ((b.totalUnits || 0) - (b.availableUnits || 0)),
            render: (_, record) => (record.totalUnits || 0) - (record.availableUnits || 0)
        },
        {
            title: 'Current Price (KES)',
            key: 'currentPrice',
            sorter: (a, b) => getCurrentPrice(a) - getCurrentPrice(b),
            render: (_, record) => getCurrentPrice(record).toLocaleString()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Available', value: 'available' },
                { text: 'Reserved', value: 'reserved' },
                { text: 'Sold', value: 'sold' },
                { text: 'Under Construction', value: 'under_construction' }
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Badge
                    status={status === 'available' ? 'success' : status === 'reserved' ? 'warning' : status === 'sold' ? 'error' : 'processing'}
                    text={formatStatus(status)}
                />
            )
        }
    ];

    // Additional columns for land plots
    const landUnitColumns = [
        ...unitColumns.slice(0, 1),
        {
            title: 'Plot Size',
            dataIndex: 'plotSize',
            key: 'plotSize',
            sorter: (a, b) => (a.plotSize || 0) - (b.plotSize || 0),
            render: (size, record) => `${size} ${record.sizeUnit || 'sqm'}`
        },
        ...unitColumns.slice(1)
    ];

    // Determine which step the property is in
    const getCurrentStep = () => {
        switch (property.status) {
            case 'available': return 0;
            case 'reserved':
            case 'under_construction': return 1;
            case 'sold': return 2;
            default: return 0;
        }
    };

    return (
        <Drawer
            title={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <HomeOutlined className="mr-2 text-blue-600" />
                        <span className="text-lg font-medium">{property.name}</span>
                    </div>
                    <Tag color={getStatusColor(property.status)} className="px-3 py-1 text-sm">
                        {formatStatus(property.status)}
                    </Tag>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={900}
            className="property-details-drawer"
            footer={
                <div className="flex justify-end">
                    <Button icon={<FileTextOutlined />} type="default" className="mr-2">
                        Export PDF
                    </Button>

                    <Button type="primary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            }
        >
            <div className="mb-6">
                <ProCard split="vertical" className="mb-4">
                    <ProCard>
                        <div className="flex items-center">
                            <Avatar
                                size={64}
                                className="mr-4"
                                icon={<HomeOutlined />}
                            />
                            <div>
                                <Title level={4} className="m-0 mb-1">{property.name}</Title>
                                <Space direction="vertical" size="small">
                                    <Text className="flex items-center">
                                        <EnvironmentOutlined className="mr-2 text-gray-500" />
                                        {property.location?.address}, {property.location?.county}
                                    </Text>
                                    <Text className="flex items-center">
                                        <UserOutlined className="mr-2 text-gray-500" />
                                        Manager: {property.propertyManager?.name}
                                    </Text>
                                    <Text className="flex items-center">
                                        <CalendarOutlined className="mr-2 text-gray-500" />
                                        Added: {formatDate(property.createdAt)}
                                    </Text>
                                    <Text className="flex items-center">
                                        <TagOutlined className="mr-2 text-gray-500" />
                                        <strong>Current Phase: {property.currentPhase}</strong>
                                    </Text>
                                </Space>
                            </div>
                        </div>

                        <div className="mb-2 mt-2">
                            <Progress
                                percent={Number(occupancyRate)}
                                status={property.status === 'sold' ? 'success' : property.status === 'reserved' ? 'active' : 'normal'}
                                format={percent => <span>{percent}% Sold</span>}
                                strokeColor={property.status === 'sold' ? '#52c41a' : property.status === 'reserved' ? '#faad14' : '#1890ff'}
                            />
                        </div>
                    </ProCard>

                    {/* quick stats */}
                    <QuickStats
                        totalUnits={totalUnits}
                        availableUnits={availableUnits}
                        soldUnits={soldUnits}
                        totalValue={totalValue}
                    />

                </ProCard>

                {/* Property Progress Steps */}
                <ProCard className="mb-4" title="Property Status">
                    <Steps
                        current={getCurrentStep()}
                        status={property.status === 'sold' ? 'finish' : 'process'}
                        progressDot
                        className="p-4"
                    >
                        <Step
                            title="Available"
                            description={property.status === 'available' ? 'Current Status' : ''}
                        />
                        <Step
                            title="Reserved/In Progress"
                            description={property.status === 'reserved' || property.status === 'under_construction' ? 'Current Status' : ''}
                        />
                        <Step
                            title="Sold/Completed"
                            description={property.status === 'sold' ? 'Current Status' : ''}
                        />
                    </Steps>
                </ProCard>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                className="mb-6"
                items={[
                    {
                        key: '1',
                        label: (
                            <span>
                                <BarChartOutlined className="mr-2" />
                                Overview
                            </span>
                        ),
                        children: (
                            <>
                                <StatisticCard.Group direction="row" className="mb-4">
                                    <StatisticCard
                                        statistic={{
                                            title: 'Total Value (KES)',
                                            value: totalValue,
                                            precision: 0,
                                            formatter: (value) => `${value.toLocaleString()}`,
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: 'Sold Value (KES)',
                                            value: soldValue,
                                            precision: 0,
                                            formatter: (value) => `${value.toLocaleString()}`,
                                            valueStyle: { color: '#cf1322' },
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: 'Occupancy Rate',
                                            value: occupancyRate,
                                            suffix: '%',
                                            valueStyle: { color: '#3f8600' },
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: 'Current Phase',
                                            value: property.currentPhase,
                                            valueStyle: { fontSize: '16px', color: '#1890ff' },
                                        }}
                                    />
                                </StatisticCard.Group>

                                {property.description && (
                                    <ProCard
                                        title="Description"
                                        className="mb-4"
                                        bodyStyle={{ maxHeight: '150px', overflow: 'auto' }}
                                    >
                                        <Paragraph>{property.description}</Paragraph>
                                    </ProCard>
                                )}

                                <ProCard
                                    title={`${property.propertyType} Units`}
                                    className="mb-4"
                                    extra={
                                        <Tag color="blue">{`Current Phase: ${property.currentPhase}`}</Tag>
                                    }
                                >
                                    <ProTable
                                        dataSource={property.units || []}
                                        columns={property.propertyType === 'land' ? landUnitColumns : unitColumns}
                                        rowKey={(record, index) => index.toString()}
                                        size="small"
                                        pagination={{ pageSize: 5 }}
                                        scroll={{ x: 'max-content' }}
                                        search={false}
                                        options={false}
                                    />
                                </ProCard>
                            </>
                        ),
                    },
                    {
                        key: '2',
                        label: (
                            <span>
                                <PictureOutlined className="mr-2" />
                                Gallery
                            </span>
                        ),
                        children: (
                            <Card>
                                <div className="flex flex-wrap gap-4">
                                    {property.images?.length > 0 ? (
                                        property.images.map((image, index) => (
                                            <div key={index} className="relative w-32 h-32 rounded overflow-hidden">
                                                <img
                                                    src={image.url || "https://via.placeholder.com/200"}
                                                    alt={`Property ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-32 rounded">
                                            <Text type="secondary">No images available</Text>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ),
                    },
                    {
                        key: '3',
                        label: (
                            <span>
                                <EnvironmentOutlined className="mr-2" />
                                Location
                            </span>
                        ),
                        children: (
                            <ProCard
                                title="Location Details"
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <div className="h-64 rounded relative mb-4">
                                            {property.location?.coordinates?.coordinates ? (
                                                <></>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Text type="secondary">Map not available</Text>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                                            <Descriptions.Item label="Address" span={3}>
                                                {property.location?.address}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="County">
                                                {property.location?.county}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Constituency">
                                                {property.location?.constituency || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="GPS Coordinates">
                                                {property.location?.coordinates?.coordinates
                                                    ? property.location.coordinates.coordinates.join(', ')
                                                    : 'N/A'}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Col>
                                </Row>
                            </ProCard>
                        ),
                    },
                    {
                        key: '4',
                        label: (
                            <span>
                                <DollarOutlined className="mr-2" />
                                Financials
                            </span>
                        ),
                        children: (
                            <ProCard
                                title="Financial Overview"
                                className="mb-4"
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Card className="h-full">
                                            <Statistic
                                                title="Total Value (KES)"
                                                value={totalValue}
                                                precision={0}
                                                formatter={(value) => `${value.toLocaleString()}`}
                                            />
                                            <Divider style={{ margin: '16px 0' }} />
                                            <Statistic
                                                title="Price per Unit (Avg) (KES)"
                                                value={totalUnits > 0 ? totalValue / totalUnits : 0}
                                                precision={0}
                                                formatter={(value) => `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card className="h-full">
                                            <Statistic
                                                title="Sold Value (KES)"
                                                value={soldValue}
                                                precision={0}
                                                formatter={(value) => `${value.toLocaleString()}`}
                                                valueStyle={{ color: '#cf1322' }}
                                            />
                                            <Divider style={{ margin: '16px 0' }} />
                                            <Statistic
                                                title="Remaining Value (KES)"
                                                value={totalValue - soldValue}
                                                precision={0}
                                                formatter={(value) => `${value.toLocaleString()}`}
                                                valueStyle={{ color: '#3f8600' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </ProCard>
                        ),
                    },
                    {
                        key: '5',
                        label: (
                            <span>
                                <TagsOutlined className="mr-2" />
                                Phase Pricing
                            </span>
                        ),
                        children: (
                            <ProCard
                                title="Phase Pricing Details"
                                className="mb-4"
                            >
                                <ProTable
                                    dataSource={property.units?.map(unit => {
                                        return {
                                            ...unit,
                                            key: unit._id || unit.unitType,
                                            unitType: formatUnitType(unit.unitType),
                                            currentPhasePrice: getCurrentPrice(unit)
                                        };
                                    }) || []}
                                    columns={[
                                        {
                                            title: 'Unit Type',
                                            dataIndex: 'unitType',
                                            key: 'unitType',
                                        },
                                        {
                                            title: 'Base Price (KES)',
                                            dataIndex: 'basePrice',
                                            key: 'basePrice',
                                            render: (value) => (value || 0).toLocaleString()
                                        },
                                        {
                                            title: `Current Price (${property.currentPhase})`,
                                            dataIndex: 'currentPhasePrice',
                                            key: 'currentPhasePrice',
                                            render: (value) => (value || 0).toLocaleString()
                                        },
                                        {
                                            title: 'Phase Pricing',
                                            dataIndex: 'phasePricing',
                                            key: 'phasePricing',
                                            render: (phasePricing) => {
                                                if (!phasePricing || phasePricing.length === 0) {
                                                    return <Text type="secondary">No phase pricing available</Text>;
                                                }

                                                return (
                                                    <Table
                                                        dataSource={phasePricing}
                                                        rowKey="_id"
                                                        pagination={false}
                                                        size="small"
                                                        columns={[
                                                            {
                                                                title: 'Phase',
                                                                dataIndex: 'phaseName',
                                                                key: 'phaseName',
                                                                render: (text, record) => (
                                                                    <Tag color={record.active ? 'green' : 'default'}>
                                                                        {text}
                                                                    </Tag>
                                                                )
                                                            },
                                                            {
                                                                title: 'Price (KES)',
                                                                dataIndex: 'price',
                                                                key: 'price',
                                                                render: (price) => price.toLocaleString()
                                                            },
                                                            {
                                                                title: 'Status',
                                                                dataIndex: 'active',
                                                                key: 'active',
                                                                render: (active) => (
                                                                    active ?
                                                                        <Badge status="processing" text="Active" /> :
                                                                        <Badge status="default" text="Inactive" />
                                                                )
                                                            },
                                                            {
                                                                title: 'Start Date',
                                                                dataIndex: 'startDate',
                                                                key: 'startDate',
                                                                render: (date) => formatDate(date)
                                                            }
                                                        ]}
                                                    />
                                                );
                                            }
                                        }
                                    ]}
                                    pagination={false}
                                    search={false}
                                    options={false}
                                />
                            </ProCard>
                        ),
                    }
                ]}
            />
        </Drawer>
    );
};

export default PropertyDetails;