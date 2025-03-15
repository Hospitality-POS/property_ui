import { Modal } from 'antd';

export const DeleteLeadModal = ({ visible, lead, onDelete, onCancel }) => {
    return (
        <Modal
            title="Confirm Delete"
            open={visible}
            onOk={onDelete}
            onCancel={onCancel}
            okText="Delete"
            okButtonProps={{ danger: true }}
        >
            <p>
                Are you sure you want to delete the lead for{' '}
                <strong>{lead?.name}</strong>?
            </p>
            <p>This action cannot be undone.</p>
        </Modal>
    );
};

export default DeleteLeadModal;