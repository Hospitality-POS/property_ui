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
    Button
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
            title={mode === 'create' ? "Convert Lead to Customer" : "Edit Customer"}
            open={visible}
            onCancel={onCancel}
            onOk={onOk}
            okText={mode === 'create' ? "Convert Lead" : "Save Changes"}
            width={1000}
        >
            <Form layout="vertical" form={form}>
                {mode === 'create' && (
                    <Form.Item
                        label="Select Lead"
                        name="leadId"
                        rules={[{ required: true, message: 'Please select a lead to convert' }]}
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

                {(mode === 'edit' || leads.length > 0) && (
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
                                        label="Full Name"
                                        name="name"
                                        rules={[{ required: true, message: 'Please enter customer name' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[{
                                            type: 'email',
                                            message: 'Please enter a valid email'
                                        }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Phone"
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
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="ID Number"
                                        name="idNumber"
                                        rules={[{ required: true, message: 'Please enter ID number' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Alternate Phone"
                                        name="alternatePhone"
                                        rules={[{
                                            pattern: /^\+?[0-9]{10,15}$/,
                                            message: 'Please enter a valid phone number',
                                            validateTrigger: 'onChange'
                                        }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Street Address"
                                        name="streetAddress"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="City"
                                        name="city"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="County"
                                        name="county"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Postal Code"
                                        name="postalCode"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Occupation"
                                        name="occupation"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Company"
                                        name="company"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {mode === 'create' && (
                                <Form.Item
                                    label="ID Document Upload"
                                    name="idDocumentUpload"
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
                            )}
                        </TabPane>

                        <TabPane tab="Property Preferences" key="propertyPreferences">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Property Types"
                                        name="propertyTypes"
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
                                        name="locations"
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
                                                name={['budgetRange', 'min']}
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
                                                name={['budgetRange', 'max']}
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
                                        name="amenities"
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
                                name="notes"
                            >
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </TabPane>
                    </Tabs>
                )}
            </Form>
        </Modal>
    );
};

export default CustomerModal;