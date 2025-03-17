import {
    Modal,
    Form,
    Select,
    DatePicker,
    Input,
    Button
} from 'antd';

const { Option } = Select;
const { TextArea } = Input;

export const AddEventModal = ({
    visible,
    form,
    onOk,
    onCancel
}) => {

    return (
        <Modal
            title="Add Activities"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={onOk}>
                <Form.Item
                    name="activityType"
                    label="Event Type"
                    rules={[{ required: true, message: 'Please enter an event type' }]}
                >
                    <Select placeholder="Select event type">
                        <Option value="Sale Agreement">Sale Agreement</Option>
                        <Option value="Payment">Payment</Option>
                        <Option value="Cancellation">Cancellation</Option>
                        <Option value="Meeting">Meeting</Option>
                        <Option value="Final Payment">Final Payment</Option>
                        <Option value="Refund">Refund</Option>
                        <Option value="Other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="date"
                    label="Event Date"
                    rules={[{ required: true, message: 'Please select a date' }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter a description' }]}
                >
                    <TextArea rows={4} placeholder="Enter event description..." />
                </Form.Item>

                <div style={{ textAlign: 'right' }}>
                    <Button style={{ marginRight: 8 }} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Add to Timeline
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddEventModal;