import {
    Modal,
    Form,
    Select,
    Typography
} from 'antd';

const { Text } = Typography;
const { Option } = Select;

export const AddPropertyInterestModal = ({
    visible,
    leadName,
    form,
    propertiesData,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title={`Add Property Interest for ${leadName || 'Lead'}`}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText="Add Property Interest"
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="Select Property"
                    name="propertyId"
                    rules={[{ required: true, message: 'Please select a property' }]}
                >
                    <Select placeholder="Choose a property">
                        {propertiesData.map(property => (
                            <Option key={property._id} value={property._id}>
                                {property?.name} - {property.location?.address} - {property.price.toLocaleString()} KES
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                        Not finding the property? <a href="#">Add new property</a>
                    </Text>
                </div>
            </Form>
        </Modal>
    );
};

export default AddPropertyInterestModal;