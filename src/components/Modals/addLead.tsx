import {
    Modal,
    Form,
    Row,
    Col,
    Input,
    Select,
    Typography
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    DollarOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

export const AddLeadModal = ({
    visible,
    isEditMode,
    form,
    agentsData,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title={isEditMode ? "Edit Lead" : "Add New Lead"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={1000}
            okText={isEditMode ? "Update Lead" : "Add Lead"}
        >
            <Form layout="vertical" form={form}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter the lead name' }]}
                        >
                            <Input
                                placeholder="Enter lead's full name"
                                prefix={<UserOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Contact Number"
                            name="phone"
                            rules={[
                                { required: true, message: 'Please enter the phone number' },
                                {
                                    pattern: /^\+?[0-9]{10,15}$/,
                                    message: 'Please enter a valid phone number'
                                }
                            ]}
                        >
                            <Input
                                placeholder="+254 7XX XXX XXX"
                                prefix={<PhoneOutlined />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[
                                {
                                    pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                                    message: 'Please enter a valid email address'
                                }
                            ]}
                        >
                            <Input
                                placeholder="email@example.com"
                                prefix={<MailOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="County/Location"
                            name="county"
                        >
                            <Input
                                placeholder="E.g., Nairobi, Mombasa, Kisumu"
                                prefix={<EnvironmentOutlined />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Lead Source"
                            name="source"
                            initialValue="website"
                        >
                            <Select>
                                <Option value="website">Website</Option>
                                <Option value="referral">Referral</Option>
                                <Option value="social_media">Social Media</Option>
                                <Option value="direct_call">Direct Call</Option>
                                <Option value="walk_in">Walk-in</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Source Details"
                            name="sourceDetails"
                        >
                            <Input placeholder="Additional details about the source" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Priority"
                            name="priority"
                            initialValue="medium"
                        >
                            <Select>
                                <Option value="high">High</Option>
                                <Option value="medium">Medium</Option>
                                <Option value="low">Low</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Property Interest"
                            name="propertyType"
                            initialValue="both"
                        >
                            <Select>
                                <Option value="apartment">Apartment</Option>
                                <Option value="land">Land</Option>
                                <Option value="both">Both</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Budget Range (Min)"
                            name="budgetMin"
                        >
                            <Input
                                type="number"
                                placeholder="Minimum budget (KES)"
                                prefix={<DollarOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Budget Range (Max)"
                            name="budgetMax"
                        >
                            <Input
                                type="number"
                                placeholder="Maximum budget (KES)"
                                prefix={<DollarOutlined />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Assigned Agent"
                    name="assignedTo"
                >
                    <Select placeholder="Select an agent">
                        {agentsData.map(agent => (
                            <Option key={agent._id} value={agent._id}>{agent.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Notes"
                    name="notes"
                >
                    <TextArea
                        rows={4}
                        placeholder="Any additional information about the lead..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddLeadModal;