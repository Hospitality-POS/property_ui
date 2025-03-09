import {
    Modal,
    Form,
    Select,
    Input,
    DatePicker
} from 'antd';

const { Option } = Select;
const { TextArea } = Input;

export const CommunicationModal = ({
    visible,
    form,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title="Log Communication"
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText="Save"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="type"
                    label="Communication Type"
                    rules={[{ required: true, message: 'Please select a communication type' }]}
                >
                    <Select placeholder="Select type">
                        <Option value="call">Call</Option>
                        <Option value="email">Email</Option>
                        <Option value="meeting">Meeting</Option>
                        <Option value="sms">SMS</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="date"
                    label="Date & Time"
                    rules={[{ required: true, message: 'Please select date and time' }]}
                >
                    <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder="Select date and time"
                    />
                </Form.Item>

                <Form.Item
                    name="summary"
                    label="Summary"
                    rules={[{ required: true, message: 'Please enter a summary' }]}
                >
                    <TextArea
                        rows={2}
                        placeholder="Brief summary of the communication"
                    />
                </Form.Item>

                <Form.Item
                    name="outcome"
                    label="Outcome"
                >
                    <TextArea
                        rows={2}
                        placeholder="What was the result of this communication?"
                    />
                </Form.Item>

                <Form.Item
                    name="nextAction"
                    label="Next Action"
                >
                    <TextArea
                        rows={2}
                        placeholder="What needs to be done next?"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CommunicationModal;