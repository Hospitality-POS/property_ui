import { Modal } from 'antd';

export const CancelSaleModal = ({ visible, sale, onOk, onCancel }) => {
    return (
        <Modal
            title="Confirm Sale Cancellation"
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText="Cancel Sale"
            okButtonProps={{ danger: true }}
        >
            <p>
                Are you sure you want to cancel the sale <strong>{sale?.id}</strong> for property{' '}
                <strong>{sale?.property?.title || sale?.property?.name || 'Unknown Property'}</strong>?
            </p>
            <p>
                This action will mark the sale as canceled. Any existing payments may need to be refunded separately.
            </p>
        </Modal>
    );
};

export default CancelSaleModal;