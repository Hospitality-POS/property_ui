import {
    Modal,
    Form,
    Select,
    Tabs,
    Row,
    Col,
    Input,
    InputNumber,
    Checkbox,
    Upload,
    Button,
    Radio
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

export const CustomerModal = ({
    visible,
    mode,
    form,
    leads,
    onLeadSelect,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title={
                mode === 'create'
                    ? "Add New Customer"
                    : mode === 'convert'
                        ? "Convert Lead to Customer"
                        : "Edit Customer"
            }
            open={visible}
            onCancel={onCancel}
            onOk={onOk}
            okText={
                mode === 'create'
                    ? "Create Customer"
                    : mode === 'convert'
                        ? "Convert Lead"
                        : "Save Changes"
            }
            width={1000}
        >
            <Form layout="vertical" form={form}>
                {mode === 'create' && (
                    <>
                        <Form.Item
                            label="Customer Source"
                            name="customerSource"
                            initialValue="new"
                        >
                            <Radio.Group>
                                <Radio value="new">New Customer</Radio>
                                <Radio value="fromLead">Convert from Lead</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.customerSource !== currentValues.customerSource
                            }
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('customerSource') === 'fromLead' && (
                                    <Form.Item
                                        label="Select Lead"
                                        name="leadId"
                                        rules={[
                                            {
                                                required: getFieldValue('customerSource') === 'fromLead',
                                                message: 'Please select a lead to convert'
                                            }
                                        ]}
                                    >
                                        <Select
                                            placeholder="Select a lead to convert"
                                            onChange={onLeadSelect}
                                            loading={leads.length === 0}
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {leads.map(lead => (
                                                <Option key={lead._id} value={lead._id}>
                                                    {lead.name} - {lead.phone} - {lead.status}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                )
                            }
                        </Form.Item>
                    </>
                )}

                {mode === 'convert' && (
                    <Form.Item
                        label="Select Lead"
                        name="leadId"
                        rules={[
                            {
                                required: mode === 'convert',
                                message: 'Please select a lead to convert'
                            }
                        ]}
                    >
                        <Select
                            placeholder="Select a lead to convert"
                            onChange={onLeadSelect}
                            loading={leads.length === 0}
                            showSearch
                            optionFilterProp="children"
                        >
                            {leads.map(lead => (
                                <Option key={lead._id} value={lead._id}>
                                    {lead.name} - {lead.phone} - {lead.status}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Tabs defaultActiveKey="personalInfo">
                    <TabPane tab="Personal Information" key="personalInfo">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Customer Type"
                                    name="customerType"
                                    initialValue="individual"
                                    rules={[{ required: true, message: 'Please select customer type' }]}
                                >
                                    <Select>
                                        <Option value="individual">Individual</Option>
                                        <Option value="company">Company</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                        prevValues.customerType !== currentValues.customerType
                                    }
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            label={getFieldValue('customerType') === 'company' ? "Contact Person Name" : "Full Name"}
                                            name="name"
                                            rules={[{ required: true, message: 'Please enter name' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                        prevValues.customerType !== currentValues.customerType
                                    }
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            label={getFieldValue('customerType') === 'company' ? "Contact Email" : "Email"}
                                            name="email"
                                            rules={[{
                                                type: 'email',
                                                message: 'Please enter a valid email'
                                            }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                        prevValues.customerType !== currentValues.customerType
                                    }
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            label={getFieldValue('customerType') === 'company' ? "Contact Phone" : "Phone"}
                                            name="phone"
                                            rules={[
                                                { required: true, message: 'Please enter phone number' },
                                                {
                                                    pattern: /^\+?[0-9]{10,15}$/,
                                                    message: 'Please enter a valid phone number'
                                                }
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                        prevValues.customerType !== currentValues.customerType
                                    }
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            label={getFieldValue('customerType') === 'company' ? "Registration Number" : "ID Number"}
                                            name="idNumber"
                                            rules={[{ required: true, message: 'Please enter ID/registration number' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                        prevValues.customerType !== currentValues.customerType
                                    }
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            label={getFieldValue('customerType') === 'company' ? "Alternate Contact Phone" : "Alternate Phone"}
                                            name="alternatePhone"
                                            rules={[{
                                                pattern: /^\+?[0-9]{10,15}$/,
                                                message: 'Please enter a valid phone number',
                                                validateTrigger: 'onChange'
                                            }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Street Address"
                                    name={['address', 'street']}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="City"
                                    name={['address', 'city']}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="County"
                                    name={['address', 'county']}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Postal Code"
                                    name={['address', 'postalCode']}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                        prevValues.customerType !== currentValues.customerType
                                    }
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            label={getFieldValue('customerType') === 'company' ? "Contact Position" : "Occupation"}
                                            name="occupation"
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                        prevValues.customerType !== currentValues.customerType
                                    }
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            label="Company Name"
                                            name="company"
                                            rules={[
                                                getFieldValue('customerType') === 'company'
                                                    ? { required: true, message: 'Please enter company name' }
                                                    : {}
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* {(mode === 'create' || mode === 'convert') && (
                            <Form.Item
                                label="ID Document Upload"
                                name="idDocument"
                            >
                                <Upload
                                    name="idDocument"
                                    listType="picture"
                                    maxCount={1}
                                    beforeUpload={() => false} // Prevent automatic upload
                                >
                                    <Button icon={<UploadOutlined />}>Upload ID Document</Button>
                                </Upload>
                            </Form.Item>
                        )} */}
                    </TabPane>

                    <TabPane tab="Property Preferences" key="propertyPreferences">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Property Types"
                                    name={['preferences', 'propertyTypes']}
                                    rules={[{ required: true, message: 'Please select at least one property type' }]}
                                >
                                    <Checkbox.Group>
                                        <Row>
                                            <Col span={12}>
                                                <Checkbox value="apartment">Apartment</Checkbox>
                                            </Col>
                                            <Col span={12}>
                                                <Checkbox value="land">Land</Checkbox>
                                            </Col>
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Preferred Locations"
                                    name={['preferences', 'locations']}
                                >
                                    <Select mode="tags" placeholder="Select or add locations">
                                        <Option value="kilimani">Kilimani</Option>
                                        <Option value="kileleshwa">Kileleshwa</Option>
                                        <Option value="lavington">Lavington</Option>
                                        <Option value="karen">Karen</Option>
                                        <Option value="runda">Runda</Option>
                                        <Option value="westlands">Westlands</Option>
                                        <Option value="thika_road">Thika Road</Option>
                                        <Option value="mombasa_road">Mombasa Road</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Budget Range (KES)" required>
                                    <Input.Group compact>
                                        <Form.Item
                                            name={['preferences', 'budgetRange', 'min']}
                                            noStyle
                                            rules={[{ required: true, message: 'Minimum budget is required' }]}
                                        >
                                            <InputNumber
                                                style={{ width: '45%' }}
                                                placeholder="Minimum"
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                        <Input
                                            style={{ width: '10%', textAlign: 'center' }}
                                            placeholder="~"
                                            disabled
                                        />
                                        <Form.Item
                                            name={['preferences', 'budgetRange', 'max']}
                                            noStyle
                                            rules={[{ required: true, message: 'Maximum budget is required' }]}
                                        >
                                            <InputNumber
                                                style={{ width: '45%' }}
                                                placeholder="Maximum"
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                    </Input.Group>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Preferred Amenities"
                                    name={['preferences', 'amenities']}
                                >
                                    <Select mode="tags" placeholder="Select or add amenities">
                                        <Option value="swimming_pool">Swimming Pool</Option>
                                        <Option value="gym">Gym</Option>
                                        <Option value="security">24/7 Security</Option>
                                        <Option value="parking">Parking</Option>
                                        <Option value="backup_generator">Backup Generator</Option>
                                        <Option value="water_supply">Reliable Water Supply</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Additional Notes"
                            name={['preferences', 'otherRequirements']}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </TabPane>

                    {(mode === 'create' || mode === 'convert') && (
                        <TabPane tab="Additional Information" key="additionalInfo">
                            <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) =>
                                    prevValues.customerSource !== currentValues.customerSource
                                }
                            >
                                {({ getFieldValue }) => (
                                    mode === 'create' && getFieldValue('customerSource') === 'new' && (
                                        <Form.Item
                                            label="How did you hear about us?"
                                            name="leadSource"
                                        >
                                            <Select placeholder="Select lead source">
                                                <Option value="referral">Referral</Option>
                                                <Option value="social_media">Social Media</Option>
                                                <Option value="website">Website</Option>
                                                <Option value="advertisement">Advertisement</Option>
                                                <Option value="walk_in">Walk-in</Option>
                                                <Option value="other">Other</Option>
                                            </Select>
                                        </Form.Item>
                                    )
                                )}
                            </Form.Item>

                            <Form.Item
                                label="Customer Notes"
                                name="notes"
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Add any additional notes about this customer"
                                />
                            </Form.Item>
                        </TabPane>
                    )}
                </Tabs>
            </Form>
        </Modal>
    );
};

export default CustomerModal;