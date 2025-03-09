import {
    Modal,
    Form,
    Tabs,
    Row,
    Col,
    Input,
    Select,
    Divider,
    Button,
    Alert
} from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

export const AddEditUserModal = ({
    visible,
    user,
    form,
    isLoading,
    onOk,
    onCancel
}) => {
    const isEditMode = !!user;

    return (
        <Modal
            title={isEditMode ? "Edit User" : "Create New User"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={800}
            confirmLoading={isLoading}
            okText={isEditMode ? "Update User" : "Create User"}
        >
            <Form form={form} layout="vertical">
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Personal Information" key="1">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Full Name"
                                    rules={[{ required: true, message: 'Please enter full name' }]}
                                >
                                    <Input placeholder="Enter Full Name" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Please enter email' },
                                        { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                >
                                    <Input placeholder="Enter Email" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="phone"
                                    label="Phone"
                                    rules={[{ required: true, message: 'Please enter phone number' }]}
                                >
                                    <Input placeholder="Enter Phone Number" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="role"
                                    label="Role"
                                    rules={[{ required: true, message: 'Please select a role' }]}
                                >
                                    <Select placeholder="Select a role">
                                        <Option value="admin">Admin</Option>
                                        <Option value="property_manager">Property Manager</Option>
                                        <Option value="sales_agent">Sales Agent</Option>
                                        <Option value="finance_officer">Finance Officer</Option>
                                        <Option value="customer">Customer</Option>
                                        <Option value="valuer">Valuation Officer</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="idNumber"
                                    label="ID Number"
                                    rules={[{ required: true, message: 'Please enter ID number' }]}
                                >
                                    <Input placeholder="Enter ID Number" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="gender" label="Gender">
                                    <Select placeholder="Select gender">
                                        <Option value="Male">Male</Option>
                                        <Option value="Female">Female</Option>
                                        <Option value="Other">Other</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="address" label="Address">
                            <Input.TextArea rows={2} placeholder="Enter address" />
                        </Form.Item>
                    </TabPane>

                    <TabPane tab="Account & Security" key="2">
                        {!user && (
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="password"
                                        label="Password"
                                        rules={[
                                            { required: !user, message: 'Please enter password' },
                                            { min: 8, message: 'Password must be at least 8 characters' }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Enter password"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        dependencies={['password']}
                                        rules={[
                                            { required: !user, message: 'Please confirm password' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Passwords do not match'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Confirm password"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        {user && (
                            <div>
                                <Alert
                                    message="Password Management"
                                    description="To change the user's password, use the reset password function. This will send a password reset link to the user's email."
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                <Button type="primary" icon={<LockOutlined />}>
                                    Reset Password
                                </Button>
                            </div>
                        )}

                        <Divider />

                        <Form.Item name="status" label="Account Status">
                            <Select placeholder="Select status">
                                <Option value="Active">Active</Option>
                                <Option value="Inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </TabPane>
                </Tabs>
            </Form>
        </Modal>
    );
};

export default AddEditUserModal;