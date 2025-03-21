// Modified AddPropertyModal.jsx
import {
    Modal, Form, Tabs, Row, Col, Input, Select,
    InputNumber, Button, Table, message
} from 'antd';
import { useState, useEffect, useRef } from 'react';
import {
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import AddEditUserModal from "@/pages/Users/components/modal/AddEditUserModal";

const { TabPane } = Tabs;
const { Option } = Select;

export const AddPropertyModal = ({
    visible,
    isEditMode,
    form,
    onOk,
    onCancel,
    propertyManagersData,
    onPropertyManagerAdded
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
    // Track validation status
    const [managerValidationDisabled, setManagerValidationDisabled] = useState(false);
    // Track if there's a validation error for units
    const [unitsValidationError, setUnitsValidationError] = useState(false);

    // Ref for user modal
    const userModalActionRef = useRef();

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

    // Load existing units when editing
    useEffect(() => {
        if (isEditMode && visible) {
            const formValues = form.getFieldsValue(true);

            if (formValues && formValues.units && Array.isArray(formValues.units)) {
                // Add key property for table rendering
                const unitsWithKeys = formValues.units.map((unit, index) => ({
                    ...unit,
                    key: `existing-${index}-${Date.now()}`
                }));
                setUnits(unitsWithKeys);

                // Also set the units in the form field
                form.setFieldsValue({
                    units: formValues.units
                });

                // Set property type from form
                if (formValues.propertyType) {
                    setPropertyType(formValues.propertyType);
                }

                // If we're in edit mode and have a property manager, disable validation
                if (formValues.propertyManager) {
                    setManagerValidationDisabled(true);
                }

                // Clear any unit validation error if we have units
                if (unitsWithKeys.length > 0) {
                    setUnitsValidationError(false);
                }
            }
        } else if (!visible) {
            // Reset units when modal is closed
            setUnits([]);
            setManagerValidationDisabled(false);
            setUnitsValidationError(false);
        }
    }, [isEditMode, visible, form]);

    // Check if form has propertyManager value
    useEffect(() => {
        if (visible) {
            const currentManager = form.getFieldValue('propertyManager');
            if (currentManager && currentManager !== 'add_new') {
                setManagerValidationDisabled(true);
            }
        }
    }, [visible, form]);

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
        // Validate unit details
        if (!unitDetails.price) {
            message.error('Please enter a price for the unit');
            return;
        }

        const newUnit = { ...unitDetails, key: Date.now() };
        const updatedUnits = [...units, newUnit];
        setUnits(updatedUnits);

        // Create a clean version of units without the UI-specific keys
        const cleanUnits = updatedUnits.map(({ key, ...rest }) => rest);

        // Update form field
        form.setFieldsValue({
            units: cleanUnits
        });

        // Clear any unit validation error as we now have at least one unit
        setUnitsValidationError(false);

        // Reset unit details form for next entry based on property type
        if (propertyType === 'land') {
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
    };

    // Remove a unit from the list
    const removeUnit = (unitKey) => {
        const updatedUnits = units.filter(unit => unit.key !== unitKey);
        setUnits(updatedUnits);

        // Create a clean version of units without the UI-specific keys
        const cleanUnits = updatedUnits.map(({ key, ...rest }) => rest);

        // Update form field
        form.setFieldsValue({
            units: cleanUnits
        });

        // If no units left, set validation error
        if (updatedUnits.length === 0) {
            setUnitsValidationError(true);
        }
    };

    // Handle property manager select change
    const handlePropertyManagerChange = (value) => {

        if (value && value !== 'add_new') {
            // If a valid manager is selected, disable validation error
            setManagerValidationDisabled(true);
        }

        if (value === "add_new") {
            // Trigger the user modal via ref
            if (userModalActionRef.current) {
                userModalActionRef.current.click();
            }

            // Don't reset the field value - we'll handle it differently
        }
    };

    // Function to handle successful property manager addition
    const handlePropertyManagerAdded = (newManager) => {

        // Call the parent component's handler with the new manager data
        if (onPropertyManagerAdded && newManager) {
            onPropertyManagerAdded(newManager);

            // Set the form's propertyManager field to the newly created manager's ID
            form.setFieldsValue({
                propertyManager: newManager._id
            });

            // Disable validation error since we have a valid value now
            setManagerValidationDisabled(true);
        }
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
            render: (price) => `KES ${price?.toLocaleString() || 0}`
        },
        {
            title: 'Total Units',
            dataIndex: 'totalUnits',
            key: 'totalUnits',
        },
        {
            title: 'Available Units',
            dataIndex: 'availableUnits',
            key: 'availableUnits',
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
                    disabled={record._id && isEditMode && (record.totalUnits !== record.availableUnits)}
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
            render: (price) => `KES ${price?.toLocaleString() || 0}`
        },
        {
            title: 'Total Plots',
            dataIndex: 'totalUnits',
            key: 'totalUnits',
        },
        {
            title: 'Available Plots',
            dataIndex: 'availableUnits',
            key: 'availableUnits',
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
                    disabled={record._id && isEditMode && (record.totalUnits !== record.availableUnits)}
                />
            )
        }
    ];

    // Handle form submission
    const handleSubmit = () => {
        // Check if there are any units before proceeding
        if (units.length === 0) {
            setUnitsValidationError(true);
            message.error('Please add at least one unit to the property');
            return;
        }

        // Ensure units are set in form data
        const formUnits = form.getFieldValue('units') || [];

        if (Array.isArray(formUnits) && formUnits.length === 0 && units.length > 0) {
            // If no units in form but units in state, update form
            const cleanUnits = units.map(({ key, ...rest }) => rest);
            form.setFieldsValue({
                units: cleanUnits
            });
        }

        // Check the propertyManager value before submitting
        const propertyManagerValue = form.getFieldValue('propertyManager');
        if (propertyManagerValue === "add_new") {
            // If it's still set to "add_new", clear it to avoid validation issues
            form.setFieldsValue({
                propertyManager: undefined
            });
        }

        // Call the parent onOk handler
        onOk();
    };

    // Reset modal state when closed
    const handleCancel = () => {
        setUnits([]);
        setUnitDetails({
            unitType: 'one_bedroom',
            price: 0,
            totalUnits: 1,
            availableUnits: 1
        });
        setManagerValidationDisabled(false);
        setUnitsValidationError(false);
        onCancel();
    };

    return (
        <Modal
            title={isEditMode ? "Edit Property" : "Add New Property"}
            open={visible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            width={1000}
            okText={isEditMode ? "Update Property" : "Add Property"}
        >
            <Form layout="vertical" form={form} initialValues={{ units: [] }}>
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
                                        disabled={isEditMode} // Prevent changing property type when editing
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
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please select a property manager',
                                            // Skip validation if managerValidationDisabled is true
                                            validator: (_, value) => {
                                                if (managerValidationDisabled || value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject('Please select a property manager');
                                            }
                                        }
                                    ]}
                                >
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <Select
                                            placeholder="Select a property manager"
                                            onChange={handlePropertyManagerChange}
                                            style={{ flex: 1 }}
                                        >
                                            {propertyManagersData.map(user => (
                                                <Option key={user._id} value={user._id}>{user.name}</Option>
                                            ))}
                                            <Option key="add_new" value="add_new" style={{ color: "blue" }}>
                                                + Add New Property Manager
                                            </Option>
                                        </Select>

                                        {/* Hidden button to be clicked programmatically via ref */}
                                        <div style={{ display: "none" }}>
                                            <AddEditUserModal
                                                actionRef={userModalActionRef}
                                                edit={false}
                                                data={null}
                                                isProfile={false}
                                                onSuccess={handlePropertyManagerAdded}
                                                // Set initial role value for property manager
                                                initialValues={{ role: 'property_manager' }}
                                            />
                                        </div>
                                    </div>
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

                                            {/* Units form field */}
                                            <Form.Item name="units" hidden>
                                                <Input />
                                            </Form.Item>

                                            {/* Units validation error message */}
                                            {unitsValidationError && (
                                                <div style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                                                    Please add at least one plot to the property
                                                </div>
                                            )}

                                            {units.length > 0 && (
                                                <>
                                                    <h4>Added Plots</h4>
                                                    <Table
                                                        columns={landUnitsColumns}
                                                        dataSource={units}
                                                        pagination={false}
                                                        size="small"
                                                        rowKey={record => record.key || record._id}
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

                                            {/* Units form field */}
                                            <Form.Item name="units" hidden>
                                                <Input />
                                            </Form.Item>

                                            {/* Units validation error message */}
                                            {unitsValidationError && (
                                                <div style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                                                    Please add at least one unit to the property
                                                </div>
                                            )}

                                            {units.length > 0 && (
                                                <>
                                                    <h4>Added Units</h4>
                                                    <Table
                                                        columns={apartmentUnitsColumns}
                                                        dataSource={units}
                                                        pagination={false}
                                                        size="small"
                                                        rowKey={record => record.key || record._id}
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