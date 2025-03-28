import React from 'react';
import { Modal, Typography, Alert, Spin } from 'antd';

const { Text } = Typography;

export const DeleteCustomerModal = ({
    visible,
    customer,
    onDelete,
    onCancel,
    isDeleting = false,
    hasSales = false,
    errorMessage = null
}) => {
    return (
        <Modal
            title="Delete Customer"
            open={visible}
            onOk={onDelete}
            onCancel={onCancel}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
                danger: true,
                disabled: hasSales || isDeleting
            }}
        >
            {isDeleting ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '10px' }}>
                        <Text>Deleting customer...</Text>
                    </div>
                </div>
            ) : (
                <>
                    {hasSales && (
                        <Alert
                            message="Cannot Delete Customer"
                            description="This customer has purchase records and cannot be deleted. Consider marking them as inactive instead."
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}

                    {errorMessage && (
                        <Alert
                            message="Error"
                            description={errorMessage}
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}

                    {!hasSales && (
                        <Text>
                            Are you sure you want to delete customer {customer?.name} This action cannot be undone.
                        </Text>
                    )}
                </>
            )}
        </Modal>
    );
};