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
    Upload
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    FileTextOutlined,
    FileDoneOutlined
} from '@ant-design/icons';
import moment from 'moment';

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
}) => {
    const modalTitle = isEditMode ? "Edit Property Valuation" : "Request Property Valuation";
    const submitButtonText = isEditMode ? "Update Valuation" : "Submit Request";

    return (
        <Modal
            title={modalTitle}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={800}
            okText={submitButtonText}
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
                                        disabled={isEditMode} // Prevent changing property in edit mode
                                    >
                                        {propertiesData && propertiesData.map(property => (
                                            <Option key={property._id || property.id} value={property._id || property.id}>
                                                {property.name} - {property.location?.address || 'No location'} - {formatCurrency(property.price)}
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
                                        disabled={isEditMode} // Prevent changing customer in edit mode
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
                                <Form.Item
                                    label="Assigned Valuer"
                                    name="valuer"
                                    rules={[{ required: true, message: 'Please select a Valuer' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select valuer"
                                        optionFilterProp="children"
                                        loading={isLoadingUsers}
                                    >
                                        {valuersData && valuersData.map(valuer => (
                                            <Option key={valuer._id || valuer.id} value={valuer._id || valuer.id}>
                                                {valuer.name} - {valuer.email}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
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

                    {/* <TabPane tab="Required Documents" key="2">
                        <Form.Item label="Required Documents" name="documents">
                            <Checkbox.Group>
                                <Row>
                                    <Col span={8}><Checkbox value="Property Deed">Property Deed/Title</Checkbox></Col>
                                    <Col span={8}><Checkbox value="Floor Plan">Floor Plan</Checkbox></Col>
                                    <Col span={8}><Checkbox value="Property Photos">Property Photos</Checkbox></Col>
                                    <Col span={8}><Checkbox value="Survey Plan">Survey Plan</Checkbox></Col>
                                    <Col span={8}><Checkbox value="Land Certificate">Land Certificate</Checkbox></Col>
                                    <Col span={8}><Checkbox value="Building Approval">Building Approval</Checkbox></Col>
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item label="Upload Documents" name="uploadedFiles">
                            <Upload.Dragger multiple listType="picture">
                                <p className="ant-upload-drag-icon">
                                    <FileDoneOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag documents to this area to upload</p>
                                <p className="ant-upload-hint">Upload any existing documents for the property valuation.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </TabPane> */}

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