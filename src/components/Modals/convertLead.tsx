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
    IdcardOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

export const ConvertLeadModal = ({
    visible,
    lead,
    form,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title={`Convert ${lead?.name || 'Lead'} to Customer`}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={700}
            okText="Convert to Customer"
        >
            <Form layout="vertical" form={form}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter the customer name' }]}
                        >
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Contact Number"
                            name="phone"
                            rules={[{ required: true, message: 'Please enter the phone number' }]}
                        >
                            <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Email Address"
                            name="email"
                        >
                            <Input prefix={<MailOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="ID Number"
                            name="idNumber"
                            rules={[{ required: true, message: 'Please enter ID number' }]}
                        >
                            <Input prefix={<IdcardOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="KRA PIN"
                            name="kraPin"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Customer Type"
                            name="customerType"
                            initialValue="individual"
                        >
                            <Select>
                                <Option value="individual">Individual</Option>
                                <Option value="corporate">Corporate</Option>
                                <Option value="government">Government</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="County"
                            name="county"
                        >
                            <Input prefix={<EnvironmentOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Additional Address"
                            name="additionalAddress"
                        >
                            <Input placeholder="Street, building, etc." />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Notes"
                    name="notes"
                >
                    <TextArea
                        rows={4}
                        placeholder="Any additional notes about this customer..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ConvertLeadModal;