import {
    Modal, Form, Tabs, Row, Col, Input, Select,
    InputNumber, Button, Table
} from 'antd';
import { useState, useEffect } from 'react';
import {
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

export const AddPropertyModal = ({
    visible,
    isEditMode,
    form,
    onOk,
    onCancel,
    propertyManagersData
}) => {
    const [unitDetails, setUnitDetails] = useState({
        unitType: 'one_bedroom',
        price: 0,
        totalUnits: 1,
        availableUnits: 1
    });

    // State to track units to be added
    const [units, setUnits] = useState([]);
    // Current selected property type
    const [propertyType, setPropertyType] = useState('apartment');

    // Update property type when form changes
    useEffect(() => {
        const type = form.getFieldValue('propertyType');
        if (type) {
            setPropertyType(type);
            // Reset unit details based on property type
            if (type === 'land') {
                setUnitDetails({
                    unitType: 'plot',
                    price: 0,
                    totalUnits: 1,
                    availableUnits: 1,
                    plotSize: '50/100'
                });
            } else {
                setUnitDetails({
                    unitType: 'one_bedroom',
                    price: 0,
                    totalUnits: 1,
                    availableUnits: 1
                });
            }
        }
    }, [form.getFieldValue('propertyType')]);

    // Handle unit form changes
    const handleUnitChange = (field, value) => {
        setUnitDetails(prev => {
            const updated = { ...prev, [field]: value };
            // Auto-update availableUnits when totalUnits changes
            if (field === 'totalUnits') {
                updated.availableUnits = value;
            }
            return updated;
        });
    };

    // Add a unit type to the list
    const addUnit = () => {
        const newUnit = { ...unitDetails, key: Date.now() };
        setUnits(prev => [...prev, newUnit]);
        form.setFieldsValue({
            units: [...units, newUnit]
        });

        // Reset unit details form for next entry based on property type
        if (propertyType === 'land') {
            setUnitDetails({
                unitType: 'plot',
                price: 0,
                totalUnits: 1,
                availableUnits: 1,
                plotNumber: '',
                plotSize: '50/100'
            });
        } else {
            setUnitDetails({
                unitType: 'one_bedroom',
                price: 0,
                totalUnits: 1,
                availableUnits: 1
            });
        }
    };

    // Remove a unit from the list
    const removeUnit = (unitKey) => {
        const updatedUnits = units.filter(unit => unit.key !== unitKey);
        setUnits(updatedUnits);
        form.setFieldsValue({
            units: updatedUnits
        });
    };

    // Unit form for apartments
    const renderApartmentUnitForm = () => (
        <div style={{ marginBottom: 16, padding: 16, border: '1px dashed #d9d9d9', borderRadius: 8 }}>
            <h4>Add Apartment Unit</h4>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Unit Type">
                        <Select
                            value={unitDetails.unitType}
                            onChange={(value) => handleUnitChange('unitType', value)}
                        >
                            <Option value="studio">Studio</Option>
                            <Option value="one_bedroom">One Bedroom</Option>
                            <Option value="two_bedroom">Two Bedroom</Option>
                            <Option value="three_bedroom">Three Bedroom</Option>
                            <Option value="penthouse">Penthouse</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Price per Unit">
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            value={unitDetails.price}
                            onChange={(value) => handleUnitChange('price', value)}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Total Units Available">
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            value={unitDetails.totalUnits}
                            onChange={(value) => handleUnitChange('totalUnits', value)}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addUnit}
            >
                Add This Unit Type
            </Button>
        </div>
    );

    // Unit form for land plots
    const renderLandUnitForm = () => (
        <div style={{ marginBottom: 16, padding: 16, border: '1px dashed #d9d9d9', borderRadius: 8 }}>
            <h4>Add Land Plot</h4>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Plot Size">
                        <Select
                            value={unitDetails.plotSize}
                            onChange={(value) => handleUnitChange('plotSize', value)}
                        >
                            <Option value="50/100">50/100</Option>
                            <Option value="80/100">80/100</Option>
                            <Option value="100/100">100/100 (Full)</Option>
                            <Option value="40/100">40/100</Option>
                            <Option value="60/100">60/100</Option>
                            <Option value="20/100">20/100</Option>
                            <Option value="25/100">25/100</Option>
                            <Option value="75/100">75/100</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Price per Plot">
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            value={unitDetails.price}
                            onChange={(value) => handleUnitChange('price', value)}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Number of Plots Available">
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            value={unitDetails.totalUnits}
                            onChange={(value) => handleUnitChange('totalUnits', value)}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addUnit}
            >
                Add This Plot Type
            </Button>
        </div>
    );

    // Table columns for apartment units
    const apartmentUnitsColumns = [
        {
            title: 'Unit Type',
            dataIndex: 'unitType',
            key: 'unitType',
            render: (text) => {
                const types = {
                    'studio': 'Studio',
                    'one_bedroom': 'One Bedroom',
                    'two_bedroom': 'Two Bedroom',
                    'three_bedroom': 'Three Bedroom',
                    'penthouse': 'Penthouse',
                    'other': 'Other'
                };
                return types[text] || text;
            }
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `KES ${price.toLocaleString()}`
        },
        {
            title: 'Quantity',
            dataIndex: 'totalUnits',
            key: 'totalUnits',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeUnit(record.key)}
                />
            )
        }
    ];

    // Table columns for land units
    const landUnitsColumns = [
        {
            title: 'Plot Size',
            dataIndex: 'plotSize',
            key: 'plotSize',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `KES ${price.toLocaleString()}`
        },
        {
            title: 'Available Plots',
            dataIndex: 'totalUnits',
            key: 'totalUnits',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeUnit(record.key)}
                />
            )
        }
    ];

    return (
        <Modal
            title={isEditMode ? "Edit Property" : "Add New Property"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={1000}
            okText={isEditMode ? "Update Property" : "Add Property"}
        >
            <Form layout="vertical" form={form}>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Basic Information" key="1">
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    label="Property Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please enter property name' }]}
                                >
                                    <Input placeholder="Enter property name" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Property Type"
                                    name="propertyType"
                                    rules={[{ required: true, message: 'Please select property type' }]}
                                >
                                    <Select
                                        placeholder="Select property type"
                                        onChange={(value) => setPropertyType(value)}
                                    >
                                        <Option value="land">Land</Option>
                                        <Option value="apartment">Apartment</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label="Status" name="status" initialValue="available">
                                    <Select>
                                        <Option value="available">Available</Option>
                                        <Option value="reserved">Reserved</Option>
                                        <Option value="sold">Sold</Option>
                                        <Option value="under_construction">Under Construction</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Address"
                                    name={['location', 'address']}
                                    rules={[{ required: true, message: 'Please enter the address' }]}
                                >
                                    <Input placeholder="Street address or area" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="County"
                                    name={['location', 'county']}
                                    rules={[{ required: true, message: 'Please enter the county' }]}
                                >
                                    <Input placeholder="County name" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Constituency" name={['location', 'constituency']}>
                                    <Input placeholder="Constituency name" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Property Manager"
                                    name="propertyManager"
                                    rules={[{ required: true, message: 'Please select a property manager' }]}
                                >
                                    <Select placeholder="Select an agent">
                                        {propertyManagersData.map(user => (
                                            <Option key={user._id} value={user._id}>{user.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="Property Details" key="2">
                        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
                            prevValues.propertyType !== currentValues.propertyType
                        }>
                            {({ getFieldValue }) => {
                                const propertyType = getFieldValue('propertyType');

                                if (propertyType === 'land') {
                                    return (
                                        <>
                                            <h3>Land Plot Units</h3>
                                            {renderLandUnitForm()}

                                            {/* Table of units added */}
                                            <Form.Item name="units" hidden>
                                                <Input />
                                            </Form.Item>

                                            {units.length > 0 && (
                                                <>
                                                    <h4>Added Plots</h4>
                                                    <Table
                                                        columns={landUnitsColumns}
                                                        dataSource={units}
                                                        pagination={false}
                                                        size="small"
                                                    />
                                                </>
                                            )}
                                        </>
                                    );
                                } else if (propertyType === 'apartment') {
                                    return (
                                        <>
                                            <h3>Unit Management</h3>
                                            {renderApartmentUnitForm()}

                                            {/* Table of units added */}
                                            <Form.Item name="units" hidden>
                                                <Input />
                                            </Form.Item>

                                            {units.length > 0 && (
                                                <>
                                                    <h4>Added Units</h4>
                                                    <Table
                                                        columns={apartmentUnitsColumns}
                                                        dataSource={units}
                                                        pagination={false}
                                                        size="small"
                                                    />
                                                </>
                                            )}
                                        </>
                                    );
                                }

                                return null;
                            }}
                        </Form.Item>
                    </TabPane>
                </Tabs>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Please enter a description' }]}
                >
                    <Input.TextArea rows={4} placeholder="Detailed description of the property..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPropertyModal;