import {
    Modal,
    Form,
    Tabs,
    Row,
    Col,
    Select,
    Input,
    InputNumber,
    DatePicker,
    Button,
    Card,
    Descriptions,
    Tag,
    Checkbox,
    Upload,
    Divider
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

export const AddSaleModal = ({
    visible,
    isEditMode,
    saleToEdit,
    form,
    installments,
    propertiesData,
    customersData,
    agentsData,
    managersData,
    isLoadingProperties,
    isLoadingCustomers,
    isLoadingAgents,
    isLoadingManagers,
    onAddInstallment,
    onRemoveInstallment,
    onInstallmentChange,
    onOk,
    onCancel,
    formatCurrency,
    formatDate
}) => {
    // Handle property selection to auto-populate list price
    const handlePropertyChange = (value) => {
        const selectedProperty = propertiesData.find((property) => (property._id || property.id) === value);
        if (selectedProperty) {
            form.setFieldsValue({
                listPrice: selectedProperty.price
            });
        }
    };

    return (
        <Modal
            title={isEditMode ? `Edit Sale: ${saleToEdit?._id || 'Sale'}` : "Create New Sale"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={800}
            okText={isEditMode ? "Update Sale" : "Create Sale"}
            confirmLoading={isLoadingProperties || isLoadingCustomers || isLoadingAgents}
        >
            <Form form={form} layout="vertical">
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Basic Information" key="1">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Select Property"
                                    name="property"
                                    rules={[{ required: true, message: "Please select a property" }]}
                                >
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Search for property"
                                        optionFilterProp="children"
                                        loading={isLoadingProperties}
                                        onChange={handlePropertyChange}
                                    >
                                        {propertiesData &&
                                            propertiesData
                                                .filter((property) => property.status === "available") // Only include properties with available subdivisions
                                                .map((property) => (
                                                    <Option key={property._id || property.id} value={property._id || property.id}>
                                                        {property.name} - {property.location?.address || "No location"} -{" "}
                                                        {formatCurrency(property.price)}
                                                    </Option>
                                                ))}
                                    </Select>

                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Select Customer"
                                    name="customer"
                                    rules={[{ required: true, message: 'Please select a customer' }]}
                                >
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Search for Customer"
                                        optionFilterProp="children"
                                        loading={isLoadingCustomers}
                                    >
                                        {customersData && customersData.map(customer => (
                                            <Option key={customer._id || customer.id} value={customer._id || customer.id}>
                                                {customer.name} - {customer.email} - {customer.phone}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Sale Price (KES)"
                                    name="salePrice"
                                    rules={[{ required: true, message: 'Please enter the sale price' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter sale price"
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="List Price (KES)"
                                    name="listPrice"
                                    rules={[{ required: true, message: 'Please enter the list price' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter list price"
                                        min={0}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Sale Date"
                                    name="saleDate"
                                    rules={[{ required: true, message: 'Please select the sale date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Payment Plan"
                                    name="paymentPlan"
                                    rules={[{ required: true, message: 'Please select a payment plan' }]}
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Option value="Full Payment">Full Payment</Option>
                                        <Option value="Installment">Installment</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Assigned Agent"
                                    name="agent"
                                    rules={[{ required: true, message: 'Please select an agent' }]}
                                >
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Search for Agent"
                                        optionFilterProp="children"
                                        loading={isLoadingAgents}
                                    >
                                        {agentsData && agentsData.map(agent => (
                                            <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                                                {agent.name} - {agent.email}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Property Manager"
                                    name="propertyManager"
                                    rules={[{ required: true, message: 'Please select a property manager' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select property manager"
                                        optionFilterProp="children"
                                        loading={isLoadingManagers}
                                    >
                                        {managersData && managersData.map(manager => (
                                            <Option key={manager._id || manager.id} value={manager._id || manager.id}>
                                                {manager.name} - {manager.email}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Notes" name="notes">
                            <TextArea rows={4} placeholder="Add sales notes..." />
                        </Form.Item>

                        {isEditMode && saleToEdit && saleToEdit.paymentPlans && saleToEdit.paymentPlans.length > 0 && (
                            <Card title="Existing Payment Plan" style={{ marginBottom: 16 }}>
                                <Descriptions column={2} size="small" bordered>
                                    <Descriptions.Item label="Plan Type">
                                        {saleToEdit.paymentPlans[0].installmentFrequency?.charAt(0).toUpperCase() +
                                            saleToEdit.paymentPlans[0].installmentFrequency?.slice(1) || 'Custom'} Plan
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Amount">
                                        {formatCurrency(saleToEdit.paymentPlans[0].totalAmount)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Initial Deposit">
                                        {formatCurrency(saleToEdit.paymentPlans[0].initialDeposit)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Installment Amount">
                                        {formatCurrency(saleToEdit.paymentPlans[0].installmentAmount)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Start Date">
                                        {formatDate(saleToEdit.paymentPlans[0].startDate)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="End Date">
                                        {formatDate(saleToEdit.paymentPlans[0].endDate)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Outstanding Balance">
                                        {formatCurrency(saleToEdit.paymentPlans[0].outstandingBalance)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Tag color={saleToEdit.paymentPlans[0].status === 'active' ? 'green' : 'orange'}>
                                            {saleToEdit.paymentPlans[0].status?.charAt(0).toUpperCase() +
                                                saleToEdit.paymentPlans[0].status?.slice(1) || 'Unknown'}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}
                    </TabPane>

                    <TabPane tab="Payment Details" key="2">
                        <Form.Item
                            label="Initial Payment Amount (KES)"
                            name="initialPayment"
                            rules={[{ required: true, message: 'Please enter the initial payment amount' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder="Enter initial payment amount"
                                min={0}
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Date"
                                    name="paymentDate"
                                    rules={[{ required: true, message: 'Please select the payment date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Method"
                                    name="paymentMethod"
                                    rules={[{ required: true, message: 'Please select a payment method' }]}
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Option value="Bank Transfer">Bank Transfer</Option>
                                        <Option value="M-Pesa">M-Pesa</Option>
                                        <Option value="Cash">Cash</Option>
                                        <Option value="Check">Check</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Reference Number" name="reference">
                            <Input placeholder="Enter reference number" />
                        </Form.Item>

                        <Form.Item
                            shouldUpdate={(prevValues, currentValues) => prevValues.paymentPlan !== currentValues.paymentPlan}
                            noStyle
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('paymentPlan') === 'Installment' ? (
                                    <>
                                        <Divider>Installment Schedule</Divider>

                                        {/* Render installments */}
                                        {installments.map((installment) => (
                                            <div key={installment.key} style={{ marginBottom: '16px' }}>
                                                <Row gutter={16} align="middle">
                                                    <Col span={6}>
                                                        <Form.Item label="Amount (KES)" required>
                                                            <InputNumber
                                                                style={{ width: '100%' }}
                                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                placeholder="Amount"
                                                                value={installment.amount}
                                                                onChange={(value) => onInstallmentChange(installment.key, 'amount', value)}
                                                                min={0}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item label="Due Date" required>
                                                            <DatePicker
                                                                style={{ width: '100%' }}
                                                                value={installment.dueDate}
                                                                onChange={(date) => onInstallmentChange(installment.key, 'dueDate', date)}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item label="Payment Method">
                                                            <Select
                                                                style={{ width: '100%' }}
                                                                value={installment.method || 'M-Pesa'}
                                                                onChange={(value) => onInstallmentChange(installment.key, 'method', value)}
                                                            >
                                                                <Option value="Bank Transfer">Bank Transfer</Option>
                                                                <Option value="M-Pesa">M-Pesa</Option>
                                                                <Option value="Cash">Cash</Option>
                                                                <Option value="Check">Check</Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item label="Status">
                                                            <Select
                                                                style={{ width: '100%' }}
                                                                value={installment.status || 'Not Due'}
                                                                onChange={(value) => onInstallmentChange(installment.key, 'status', value)}
                                                            >
                                                                <Option value="Pending">Pending</Option>
                                                                <Option value="Not Due">Not Due</Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={2} style={{ marginTop: '30px', textAlign: 'center' }}>
                                                        <Button
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => onRemoveInstallment(installment.key)}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}

                                        <Form.Item>
                                            <Button
                                                type="dashed"
                                                block
                                                icon={<PlusOutlined />}
                                                onClick={onAddInstallment}
                                            >
                                                Add Installment
                                            </Button>
                                        </Form.Item>
                                    </>
                                ) : null
                            }
                        </Form.Item>
                    </TabPane>

                    {/* <TabPane tab="Documents" key="3">
                        <Form.Item name="documents" label="Required Documents">
                            <Checkbox.Group style={{ width: '100%' }}>
                                <Row>
                                    <Col span={8}>
                                        <Checkbox value="Sale Agreement">Sale Agreement</Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="Payment Receipt">Payment Receipt</Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="ID Copy">ID Copy</Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="Title Transfer">Title Transfer</Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="Bank Statement">Bank Statement</Checkbox>
                                    </Col>
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item label="Upload Documents">
                            <Upload.Dragger multiple listType="picture">
                                <p className="ant-upload-drag-icon">
                                    <FileTextOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">
                                    Support for single or bulk upload. Strictly prohibited from uploading company data or other
                                    banned files.
                                </p>
                            </Upload.Dragger>
                        </Form.Item>
                    </TabPane> */}
                </Tabs>
            </Form>
        </Modal>
    );
};

export default AddSaleModal;