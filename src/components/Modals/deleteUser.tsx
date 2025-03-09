import { Modal } from 'antd';

export const DeleteUserModal = ({
    visible,
    user,
    isLoading,
    onDelete,
    onCancel
}) => {
    return (
        <Modal
            title="Confirm Delete"
            open={visible}
            onOk={onDelete}
            onCancel={onCancel}
            confirmLoading={isLoading}
            okText="Delete"
            okButtonProps={{ danger: true }}
        >
            <p>
                Are you sure you want to delete the user{' '}
                <strong>{user?.name}</strong>
            </p>
            <p>This action cannot be undone.</p>
        </Modal>
    );
};

export default DeleteUserModal;