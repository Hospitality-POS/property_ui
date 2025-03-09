import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker
} from 'antd';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

export const AddActivityModal = ({
    visible,
    leadName,
    form,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title={`Add Activity for ${leadName || 'Lead'}`}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText="Add Activity"
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="Activity Type"
                    name="type"
                    initialValue="call"
                    rules={[{ required: true, message: 'Please select an activity type' }]}
                >
                    <Select>
                        <Option value="call">Phone Call</Option>
                        <Option value="email">Email</Option>
                        <Option value="meeting">Meeting</Option>
                        <Option value="sms">SMS</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Date"
                    name="date"
                    initialValue={moment()}
                    rules={[{ required: true, message: 'Please select a date' }]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        showTime
                    />
                </Form.Item>

                <Form.Item
                    label="Summary"
                    name="summary"
                    rules={[{ required: true, message: 'Please provide a summary' }]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Summary of the activity..."
                    />
                </Form.Item>

                <Form.Item
                    label="Outcome"
                    name="outcome"
                >
                    <Input placeholder="Outcome of the activity" />
                </Form.Item>

                <Form.Item
                    label="Next Action"
                    name="nextAction"
                >
                    <Input placeholder="What needs to be done next?" />
                </Form.Item>

                <Form.Item
                    label="Schedule Next Follow-up"
                    name="followUpDate"
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        showTime
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddActivityModal;