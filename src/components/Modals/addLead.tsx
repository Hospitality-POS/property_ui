import { useState, useRef } from "react";
import {
    Modal,
    Form,
    Row,
    Col,
    Input,
    Select,
    InputNumber,
    Button
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    DollarOutlined
} from "@ant-design/icons";
import AddEditUserModal from "@/pages/Users/components/modal/AddUserModal";

const { TextArea } = Input;
const { Option } = Select;

export const AddLeadModal = ({
    visible,
    isEditMode,
    form,
    agentsData,
    onOk,
    onCancel,
    onAgentAdded
}) => {
    // Create a ref to trigger the AddEditUserModal
    const userModalActionRef = useRef();

    // This is the important part - ensure the handleSelectChange function correctly opens the modal
    const handleSelectChange = (value) => {
        if (value === "add_new") {
            // Instead of using state, we'll directly trigger the userModalActionRef
            if (userModalActionRef.current) {
                userModalActionRef.current.click();
            }

            // Reset the select value to prevent issues
            setTimeout(() => {
                form.setFieldsValue({
                    assignedTo: undefined
                });
            }, 100);
        }
    };

    // Function to handle successful agent addition
    const handleAgentAdded = (newAgent) => {
        // Call the parent component's handler with the new agent data
        if (onAgentAdded && newAgent) {
            onAgentAdded(newAgent);

            // Set the form's assignedTo field to the newly created agent's ID
            form.setFieldsValue({
                assignedTo: newAgent._id
            });
        }
    };

    return (
        <>
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
                                rules={[{ required: true, message: "Please enter the lead name" }]}
                            >
                                <Input placeholder="Enter lead's full name" prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Contact Number"
                                name="phone"
                                rules={[
                                    { required: true, message: "Please enter the phone number" },
                                    {
                                        pattern: /^\+?[0-9]{10,15}$/,
                                        message: "Please enter a valid phone number"
                                    }
                                ]}
                            >
                                <Input placeholder="+254 7XX XXX XXX" prefix={<PhoneOutlined />} />
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
                                        message: "Please enter a valid email address"
                                    }
                                ]}
                            >
                                <Input placeholder="email@example.com" prefix={<MailOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="County/Location" name="county">
                                <Input placeholder="E.g., Nairobi, Mombasa, Kisumu" prefix={<EnvironmentOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Lead Source" name="source" initialValue="website">
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
                            <Form.Item label="Source Details" name="sourceDetails">
                                <Input placeholder="Additional details about the source" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Priority" name="priority" initialValue="medium">
                                <Select>
                                    <Option value="high">High</Option>
                                    <Option value="medium">Medium</Option>
                                    <Option value="low">Low</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Property Interest" name="propertyType" initialValue="both">
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
                            <Form.Item label="Budget Range (Min)" name="budgetMin">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                    placeholder="Minimum budget (KES)"
                                    prefix={<DollarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Budget Range (Max)" name="budgetMax">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                    placeholder="Maximum budget (KES)"
                                    prefix={<DollarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Assigned Agent" name="assignedTo">
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <Select
                                        placeholder="Select an agent"
                                        onChange={handleSelectChange}
                                        allowClear
                                        style={{ flex: 1 }}
                                    >
                                        {agentsData.map((agent) => (
                                            <Option key={agent._id} value={agent._id}>
                                                {agent.name}
                                            </Option>
                                        ))}
                                        <Option key="add_new" value="add_new" style={{ color: "blue" }}>
                                            + Add New Agent
                                        </Option>
                                    </Select>

                                    {/* Hidden button to be clicked programmatically via ref */}
                                    <div style={{ display: "none" }}>
                                        <AddEditUserModal
                                            actionRef={userModalActionRef}
                                            edit={false}
                                            data={null}
                                            isProfile={false}
                                            onSuccess={handleAgentAdded}
                                        />
                                    </div>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Notes" name="notes">
                        <TextArea rows={4} placeholder="Any additional information about the lead..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddLeadModal;