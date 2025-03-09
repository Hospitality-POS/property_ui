import {
    Modal, Form, Tabs, Row, Col, Input, Select,
    InputNumber, Upload, DatePicker
} from 'antd';
import {
    PictureOutlined,
    FileTextOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

export const AddPropertyModal = ({
    visible,
    isEditMode,
    form,
    onOk,
    onCancel
}) => {
    return (
        <Modal
            title={isEditMode ? "Edit Property" : "Add New Property"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={1000}
            okText={isEditMode ? "Update Property" : "Add Property"}
        >
            <Form layout="vertical" form={form}>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Basic Information" key="1">
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    label="Property Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please enter property name' }]}
                                >
                                    <Input placeholder="Enter property name" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Property Type"
                                    name="propertyType"
                                    rules={[{ required: true, message: 'Please select property type' }]}
                                >
                                    <Select placeholder="Select property type">
                                        <Option value="land">Land</Option>
                                        <Option value="apartment">Apartment</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Description"
                            name="description"
                            rules={[{ required: true, message: 'Please enter a description' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Detailed description of the property..." />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Price (KES)"
                                    name="price"
                                    rules={[{ required: true, message: 'Please enter the price' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter property price"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Status" name="status" initialValue="available">
                                    <Select>
                                        <Option value="available">Available</Option>
                                        <Option value="reserved">Reserved</Option>
                                        <Option value="sold">Sold</Option>
                                        <Option value="under_construction">Under Construction</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Address"
                                    name={['location', 'address']}
                                    rules={[{ required: true, message: 'Please enter the address' }]}
                                >
                                    <Input placeholder="Street address or area" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="County"
                                    name={['location', 'county']}
                                    rules={[{ required: true, message: 'Please enter the county' }]}
                                >
                                    <Input placeholder="County name" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Constituency" name={['location', 'constituency']}>
                                    <Input placeholder="Constituency name" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="GPS Coordinates (Longitude, Latitude)"
                                    name={['location', 'coordinates', 'coordinates']}
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();

                                                let coords;
                                                if (typeof value === 'string') {
                                                    // Parse string coordinates
                                                    coords = value
                                                        .split(/[,\s]+/)
                                                        .filter(coord => coord.trim())
                                                        .map(coord => parseFloat(coord))
                                                        .filter(coord => !isNaN(coord));

                                                    if (coords.length !== 2) {
                                                        return Promise.reject('Please enter two numbers for coordinates');
                                                    }
                                                } else if (Array.isArray(value)) {
                                                    coords = value;
                                                    if (coords.length !== 2) {
                                                        return Promise.reject('Please enter two numbers for coordinates');
                                                    }
                                                } else {
                                                    return Promise.reject('Invalid coordinates format');
                                                }

                                                const [longitude, latitude] = coords;
                                                if (longitude < -180 || longitude > 180) {
                                                    return Promise.reject('Longitude must be between -180 and 180');
                                                }
                                                if (latitude < -90 || latitude > 90) {
                                                    return Promise.reject('Latitude must be between -90 and 90');
                                                }

                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                    help="Enter as longitude,latitude (e.g., 36.8219,-1.2921 for Nairobi)"
                                >
                                    <Input placeholder="e.g., 36.8219,-1.2921" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Property Manager"
                                    name="propertyManager"
                                    rules={[{ required: true, message: 'Please select a property manager' }]}
                                >
                                    <Select placeholder="Select property manager">
                                        <Option value="U001">John Kimani</Option>
                                        <Option value="U002">Sarah Wanjiku</Option>
                                        <Option value="U003">David Maina</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="Property Details" key="2">
                        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
                            prevValues.propertyType !== currentValues.propertyType
                        }>
                            {({ getFieldValue }) => {
                                const propertyType = getFieldValue('propertyType');

                                return propertyType === 'land' ? (
                                    <>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Plot Number"
                                                    name="plotNumber"
                                                    rules={[{ required: true, message: 'Please enter the plot number' }]}
                                                >
                                                    <Input placeholder="Plot/LR Number" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Land Size"
                                                    name="landSize"
                                                    rules={[{ required: true, message: 'Please enter land size' }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="Size amount" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label="Size Unit" name="sizeUnit" initialValue="acres">
                                                    <Select>
                                                        <Option value="acres">Acres</Option>
                                                        <Option value="hectares">Hectares</Option>
                                                        <Option value="square_meters">Square Meters</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Land Rate per Unit"
                                                    name="landRatePerUnit"
                                                    rules={[{ required: true, message: 'Please enter land rate per unit' }]}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        min={0}
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                        placeholder="Rate per unit"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={24}>
                                                <Form.Item
                                                    label="Title Deed Number"
                                                    name="titleDeedNumber"
                                                    rules={[{ required: true, message: 'Please enter title deed number' }]}
                                                >
                                                    <Input placeholder="Title deed number" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </>
                                ) : propertyType === 'apartment' ? (
                                    <>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Unit Number"
                                                    name="unitNumber"
                                                    rules={[{ required: true, message: 'Please enter unit number' }]}
                                                >
                                                    <Input placeholder="Apartment unit number" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Building Name"
                                                    name="buildingName"
                                                    rules={[{ required: true, message: 'Please enter building name' }]}
                                                >
                                                    <Input placeholder="Name of the building/complex" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item
                                                    label="Bedrooms"
                                                    name="bedrooms"
                                                    rules={[{ required: true, message: 'Please enter number of bedrooms' }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} min={0} placeholder="Number of bedrooms" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    label="Bathrooms"
                                                    name="bathrooms"
                                                    rules={[{ required: true, message: 'Please enter number of bathrooms' }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} min={0} placeholder="Number of bathrooms" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    label="Size (sq m)"
                                                    name="apartmentSize"
                                                    rules={[{ required: true, message: 'Please enter apartment size' }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} min={0} placeholder="Size in square meters" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label="Floor" name="floor">
                                                    <InputNumber style={{ width: '100%' }} min={0} placeholder="Floor number" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label="Construction Status" name="constructionStatus" initialValue="ready">
                                                    <Select>
                                                        <Option value="ready">Ready</Option>
                                                        <Option value="under_construction">Under Construction</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item label="Amenities" name="amenities">
                                            <Select mode="tags" style={{ width: '100%' }} placeholder="Add apartment amenities">
                                                <Option value="Balcony">Balcony</Option>
                                                <Option value="Parking Space">Parking Space</Option>
                                                <Option value="Swimming Pool">Swimming Pool</Option>
                                                <Option value="Gym">Gym</Option>
                                                <Option value="Security">Security</Option>
                                                <Option value="Rooftop Garden">Rooftop Garden</Option>
                                            </Select>
                                        </Form.Item>
                                    </>
                                ) : null;
                            }}
                        </Form.Item>
                    </TabPane>

                    <TabPane tab="Documents & Images" key="3">
                        <Form.Item label="Property Images">
                            <Upload.Dragger listType="picture-card" multiple>
                                <p className="ant-upload-drag-icon">
                                    <PictureOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag images to upload</p>
                                <p className="ant-upload-hint">Upload clear images of the property</p>
                            </Upload.Dragger>
                        </Form.Item>

                        <Form.Item label="Property Documents">
                            <Upload.Dragger multiple>
                                <p className="ant-upload-drag-icon">
                                    <FileTextOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag documents to upload</p>
                                <p className="ant-upload-hint">Upload relevant property documents (PDF, DOCX)</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </TabPane>
                </Tabs>
            </Form>
        </Modal>
    );
};

export default AddPropertyModal;