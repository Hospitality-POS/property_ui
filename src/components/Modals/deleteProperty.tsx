import { Modal } from 'antd';

export const DeletePropertyModal = ({ visible, property, onDelete, onCancel }) => {
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
                Are you sure you want to delete the property{' '}
                <strong>{property?.name}</strong>?
            </p>
            <p>This action cannot be undone.</p>
        </Modal>
    );
};

export default DeletePropertyModal;