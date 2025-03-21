import {
    Modal,
    Form,
    Tabs,
    Row,
    Col,
    Select,
    Input,
    InputNumber,
    DatePicker,
    Checkbox,
    Upload,
    Tag,
    message
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    FileTextOutlined,
    FileDoneOutlined,
    UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useState, useRef, useEffect } from 'react';
import AddEditUserModal from "@/pages/Users/components/modal/AddEditUserModal";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AddValuationModal = ({
    visible,
    isEditMode,
    propertiesData,
    customersData,
    isLoadingCustomers,
    isLoadingProperties,
    valuersData,
    isLoadingUsers,
    formatCurrency,
    valuationToEdit,
    form,
    onOk,
    onCancel,
    onValuerAdded
}) => {
    const modalTitle = isEditMode ? "Edit Property Valuation" : "Request Property Valuation";
    const submitButtonText = isEditMode ? "Update Valuation" : "Submit Request";

    const [selectedValuer, setSelectedValuer] = useState(null);
    const [isAddingValuer, setIsAddingValuer] = useState(false);
    const userModalActionRef = useRef();

    useEffect(() => {
        if (isEditMode && valuationToEdit && valuationToEdit.valuer) {
            const valuer = valuationToEdit.valuer;
            const valuerData = {
                _id: valuer._id || valuer.id || valuer,
                id: valuer._id || valuer.id || valuer,
                name: valuer.name || '',
                email: valuer.email || ''
            };
            setSelectedValuer(valuerData);
        }
    }, [isEditMode, valuationToEdit]);

    useEffect(() => {
        if (visible) {
            const valuerId = form.getFieldValue('valuer');
            if (valuerId && !selectedValuer) {
                const foundValuer = valuersData.find(v =>
                    v._id === valuerId || v.id === valuerId
                );
                if (foundValuer) {
                    setSelectedValuer(foundValuer);
                }
            }
        }
    }, [visible, form, valuersData, selectedValuer]);

    const handleValuerChange = (value) => {
        if (value === null || value === undefined) {
            setSelectedValuer(null);
            return;
        }

        if (value === 'add_new') {
            setIsAddingValuer(true);
            if (userModalActionRef.current) {
                userModalActionRef.current.click();
            }
            return;
        }

        const selectedValuerObject = valuersData.find(v =>
            v._id === value || v.id === value
        );

        if (selectedValuerObject) {
            setSelectedValuer(selectedValuerObject);
        } else {
            const placeholderValuer = {
                _id: value,
                id: value,
                name: "Unknown Valuer",
                email: ""
            };
            setSelectedValuer(placeholderValuer);
        }
    };

    const handleValuerAdded = (newValuer) => {
        if (!newValuer || (!newValuer._id && !newValuer.id)) {
            setIsAddingValuer(false);
            return;
        }

        const valuerId = newValuer._id || newValuer.id;
        const valuerToStore = {
            _id: valuerId,
            id: valuerId,
            name: newValuer.name || 'New Valuer',
            email: newValuer.email || '',
            role: newValuer.role || 'valuer'
        };

        setSelectedValuer(valuerToStore);
        setIsAddingValuer(false);

        if (onValuerAdded) {
            onValuerAdded(valuerToStore);
        }

        setTimeout(() => {
            setSelectedValuer({ ...valuerToStore });
        }, 50);
    };

    const handleSubmit = () => {
        if (!selectedValuer || !selectedValuer._id) {
            message.error('Please select a valuer');
            return;
        }

        form.validateFields()
            .then(values => {
                const valuerID = selectedValuer._id || selectedValuer.id;
                const submissionData = {
                    ...values,
                    valuer: valuerID
                };

                onOk(submissionData);
            })
            .catch(errorInfo => {
                console.log('Validation failed:', errorInfo);
            });
    };

    return (
        <Modal
            title={modalTitle}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            width={800}
            okText={submitButtonText}
        // key={selectedValuer ? `modal-${selectedValuer._id}` : 'modal-empty'}
        >
            <Form layout="vertical" form={form}>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Basic Information" key="1">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Select Property"
                                    name="property"
                                    rules={[{ required: true, message: 'Please select a property' }]}
                                >
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Search for property"
                                        optionFilterProp="children"
                                        loading={isLoadingProperties}
                                        disabled={isEditMode}
                                    >
                                        {propertiesData && propertiesData.map(property => (
                                            <Option key={property._id || property.id} value={property._id || property.id}>
                                                {property.name} - {property.location?.address || 'No location'}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Select Customer"
                                    name="requestedBy"
                                    rules={[{ required: true, message: 'Please select a customer' }]}
                                >
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Search for Customer"
                                        optionFilterProp="children"
                                        loading={isLoadingCustomers}
                                        disabled={isEditMode}
                                    >
                                        {customersData && customersData.map(customer => (
                                            <Option key={customer._id || customer.id} value={customer._id || customer.id}>
                                                {customer.name} - {customer.email} - {customer.phone}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Valuation Purpose"
                                    name="valuationPurpose"
                                    rules={[{ required: true, message: 'Please select a purpose' }]}
                                >
                                    <Select placeholder="Select purpose">
                                        <Option value="sale">Sale</Option>
                                        <Option value="purchase">Purchase</Option>
                                        <Option value="mortgage">Mortgage</Option>
                                        <Option value="insurance">Insurance</Option>
                                        <Option value="other">Other</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <div className="ant-form-item">
                                    <div className="ant-form-item-label">
                                        <label className="ant-form-item-required">Assigned Valuer</label>
                                    </div>
                                    <div className="ant-form-item-control">
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <Select
                                                showSearch
                                                placeholder="Select valuer"
                                                optionFilterProp="children"
                                                loading={isLoadingUsers}
                                                value={selectedValuer ? (selectedValuer._id || selectedValuer.id) : undefined}
                                                onChange={handleValuerChange}
                                                style={{ width: '100%' }}
                                            >
                                                {valuersData && valuersData.map(valuer => (
                                                    <Option
                                                        key={valuer._id || valuer.id}
                                                        value={valuer._id || valuer.id}
                                                    >
                                                        {valuer.name} - {valuer.email}
                                                    </Option>
                                                ))}
                                                <Option key="add_new" value="add_new" style={{ color: "blue" }}>
                                                    + Add New Valuer
                                                </Option>
                                            </Select>
                                        </div>

                                        {!selectedValuer && !isAddingValuer && (
                                            <div className="ant-form-item-explain ant-form-item-explain-error">
                                                <div role="alert">Please select a valuer</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedValuer && (
                                    <div style={{ marginTop: 8, marginBottom: 16 }}>
                                        <Tag color="blue" icon={<UserOutlined />}>
                                            Selected valuer: <strong>{selectedValuer.name}</strong>
                                            {selectedValuer.email ? ` (${selectedValuer.email})` : ''}
                                        </Tag>
                                        <div style={{ fontSize: '11px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>
                                            Valuer ID: {selectedValuer._id || selectedValuer.id}
                                        </div>
                                    </div>
                                )}

                                {isAddingValuer && !selectedValuer && (
                                    <div style={{ marginTop: 8, marginBottom: 16 }}>
                                        <Tag color="processing" icon={<PlusOutlined />}>
                                            Adding new valuer...
                                        </Tag>
                                    </div>
                                )}

                                <div style={{ display: "none" }}>
                                    <AddEditUserModal
                                        actionRef={userModalActionRef}
                                        edit={false}
                                        data={null}
                                        isProfile={false}
                                        onSuccess={handleValuerAdded}
                                        initialValues={{ role: 'valuer' }}
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Valuation Date"
                                    name="valuationDate"
                                    rules={[{ required: true, message: 'Please select a date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Market Value (KES)"
                                    name="marketValue"
                                    rules={[{ required: true, message: 'Please enter market value' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter market value"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    label="Valuation Fee (KES)"
                                    name="valuationFee"
                                    rules={[{ required: true, message: 'Please enter valuation fee' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter fee amount"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Special Instructions" name="notes">
                            <TextArea rows={4} placeholder="Any special requirements or instructions..." />
                        </Form.Item>
                    </TabPane>

                    <TabPane tab="Methodology" key="3">
                        <Form.Item label="Valuation Methodology" name="methodology">
                            <Checkbox.Group>
                                <Row>
                                    <Col span={12}><Checkbox value="Market Approach">Market Approach</Checkbox></Col>
                                    <Col span={12}><Checkbox value="Income Approach">Income Approach</Checkbox></Col>
                                    <Col span={12}><Checkbox value="Cost Approach">Cost Approach</Checkbox></Col>
                                    <Col span={12}><Checkbox value="Residual Method">Residual Method</Checkbox></Col>
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item label="Additional Notes on Methodology" name="methodologyNotes">
                            <TextArea rows={4} placeholder="Any specific requirements for the valuation approach..." />
                        </Form.Item>

                        {isEditMode && (
                            <Form.Item label="Forced Sale Value (KES)" name="forcedSaleValue">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Enter forced sale value (optional)"
                                />
                            </Form.Item>
                        )}
                    </TabPane>

                    {isEditMode && (
                        <TabPane tab="Report Documents" key="4">
                            <Form.Item label="Upload Valuation Report" name="reportDocument">
                                <Upload.Dragger listType="picture" maxCount={1}>
                                    <p className="ant-upload-drag-icon">
                                        <FileTextOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag valuation report to upload</p>
                                </Upload.Dragger>
                            </Form.Item>

                            <Form.Item label="Upload Valuation Certificate" name="certificateDocument">
                                <Upload.Dragger listType="picture" maxCount={1}>
                                    <p className="ant-upload-drag-icon">
                                        <FileDoneOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag valuation certificate to upload</p>
                                </Upload.Dragger>
                            </Form.Item>

                            <Form.Item label="Expiry Date" name="expiryDate">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </TabPane>
                    )}
                </Tabs>
            </Form>
        </Modal>
    );
};

export default AddValuationModal;