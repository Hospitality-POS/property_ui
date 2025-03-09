import { Modal } from 'antd';

export const DeleteCustomerModal = ({ visible, customer, onDelete, onCancel }) => {
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
                Are you sure you want to delete customer for{' '}
                <strong>{customer?.name}</strong>?
            </p>
            <p>This action cannot be undone.</p>
        </Modal>
    );
};

export default DeleteCustomerModal;