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
    Badge,
    message
} from 'antd';
import {
    FileTextOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    TagOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    // Generate property report as PDF
    const handleGenerateReport = () => {
        console.log('Generating PDF report for property:', property.name);

        // Show loading message
        message.loading('Generating PDF report...', 1.0);

        try {
            // Create a new PDF document
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Add title
            doc.setFontSize(20);
            doc.text(`${property.name} - Property Report`, pageWidth / 2, 15, { align: 'center' });

            // Add property overview
            doc.setFontSize(16);
            doc.text('Property Overview', 14, 30);

            // Add property information
            doc.setFontSize(11);
            doc.text(`Type: ${formatPropertyType(property.propertyType)}`, 14, 40);
            doc.text(`Status: ${formatStatus(property.status)}`, 14, 46);
            doc.text(`Location: ${property.location?.address}, ${property.location?.county}`, 14, 52);
            doc.text(`Total Units: ${calculateTotalUnits()}`, 14, 58);
            doc.text(`Available Units: ${calculateAvailableUnits()}`, 14, 64);
            doc.text(`Property Manager: ${property.propertyManager?.name || 'N/A'}`, 14, 70);
            doc.text(`Current Phase: ${property.currentPhase || 'None'}`, 14, 76);
            doc.text(`Total Value: KES ${calculateTotalValue().toLocaleString()}`, 14, 82);

            // Add description
            if (property.description) {
                doc.setFontSize(16);
                doc.text('Description', 14, 95);

                // Handle multi-line description
                const textLines = doc.splitTextToSize(property.description, pageWidth - 28);
                doc.setFontSize(11);
                doc.text(textLines, 14, 105);
            }

            // Add units table if available
            if (property.units && property.units.length > 0) {
                // Find appropriate y position based on content above
                const yPosition = property.description ?
                    105 + (doc.splitTextToSize(property.description, pageWidth - 28).length * 6) + 10 :
                    95;

                doc.setFontSize(16);
                doc.text('Units Information', 14, yPosition);

                // Create table data
                const tableColumn = ['Type', 'Current Price', 'Total Units', 'Available', 'Sold', 'Status'];
                const tableRows = property.units.map(unit => {
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

                    // Get price based on current phase
                    const phasePrice = property.currentPhase && unit.phasePricing
                        ? unit.phasePricing.find(p => p.phaseName === property.currentPhase)
                        : null;

                    const displayPrice = phasePrice ? phasePrice.price : unit.price;
                    const soldUnits = (unit.totalUnits || 0) - (unit.availableUnits || 0);

                    return [
                        typeMap[unit.unitType] || unit.unitType,
                        `KES ${displayPrice?.toLocaleString() || 0}`,
                        unit.totalUnits || 0,
                        unit.availableUnits || 0,
                        soldUnits,
                        formatStatus(unit.status)
                    ];
                });

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: yPosition + 5,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 3 },
                    headStyles: { fillColor: [66, 139, 202] }
                });
            }

            // Add phases if available on a new page
            if (property.phases && property.phases.length > 0) {
                doc.addPage();
                doc.setFontSize(16);
                doc.text('Pricing Phases', 14, 15);

                // Create phases table data
                const phasesColumns = ['Phase Name', 'Start Date', 'End Date', 'Description'];
                const phasesRows = property.phases.map(phase => [
                    phase.name + (phase.active ? ' (Active)' : '') + (property.currentPhase === phase.name ? ' (Current)' : ''),
                    formatDate(phase.startDate),
                    phase.endDate ? formatDate(phase.endDate) : 'Not set',
                    phase.description || 'No description'
                ]);

                autoTable(doc, {
                    head: [phasesColumns],
                    body: phasesRows,
                    startY: 20,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 3 },
                    headStyles: { fillColor: [66, 139, 202] }
                });
            }

            // Add footer with generation date
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(
                    `Generated on: ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Save the PDF and trigger download
            const fileName = `${property.name.replace(/\s+/g, '_')}_Report.pdf`;
            doc.save(fileName);

            // Show success message
            message.success(`PDF report for ${property.name} has been generated and downloaded`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            message.error('Failed to generate PDF report');
        }
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
                    <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        style={{ marginRight: 8 }}
                        onClick={handleGenerateReport}
                    >
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