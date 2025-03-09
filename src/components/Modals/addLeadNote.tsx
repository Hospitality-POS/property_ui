import {
    Modal,
    Form,
    Input
} from 'antd';

const { TextArea } = Input;

export const AddNoteModal = ({
    visible,
    leadName,
    form,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title={`Add Note for ${leadName || 'Lead'}`}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText="Add Note"
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="Note Content"
                    name="content"
                    rules={[{ required: true, message: 'Please enter note content' }]}
                >
                    <TextArea
                        rows={6}
                        placeholder="Enter your note here..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddNoteModal;