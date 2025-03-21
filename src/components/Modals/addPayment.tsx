import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Checkbox,
    Spin,
    message,
    Button,
    Typography,
    Divider,
    Space
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetchAllCustomers } from '@/services/customer';
import { createPayment } from '@/services/payments';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const AddPaymentModal = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customerSales, setCustomerSales] = useState([]);
    const [salePaymentPlans, setSalePaymentPlans] = useState([]);

    // Fetch customers
    const {
        data: customersData = [],
        isLoading: isLoadingCustomers
    } = useQuery({
        queryKey: ['customers-for-payment'],
        queryFn: async () => {
            try {
                const response = await fetchAllCustomers();
                console.log('my customers info', response);
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.error('Error fetching customers:', error);
                message.error('Failed to load customers');
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Reset form when modal is opened/closed
    useEffect(() => {
        if (visible) {
            form.resetFields();
            setSelectedCustomer(null);
            setSelectedSale(null);
            setSelectedPaymentPlan(null);
            setCustomerSales([]);
            setSalePaymentPlans([]);
        }
    }, [visible, form]);

    // Handle customer selection
    const handleCustomerChange = (customerId) => {
        const customer = customersData.find(c => c._id === customerId);
        setSelectedCustomer(customer);

        // Clear previous selections
        setSelectedSale(null);
        setSelectedPaymentPlan(null);
        form.setFieldsValue({
            sale: undefined,
            paymentPlan: undefined,
            amount: undefined
        });

        // Extract sales from the selected customer
        if (customer && customer.purchases && Array.isArray(customer.purchases)) {
            const sales = customer.purchases.map(sale => ({
                ...sale,
                propertyName: sale.property?.name || 'Unnamed Property',
                // Ensure these properties are available for display
                price: sale.price || sale.totalAmount || 0,
                unitType: sale.unitType || sale.property?.unitType || 'N/A'
            }));
            setCustomerSales(sales);
        } else {
            setCustomerSales([]);
        }
    };

    // Handle sale selection
    const handleSaleChange = (saleId) => {
        const sale = customerSales.find(s => s._id === saleId);

        setSelectedSale(sale);

        // Clear previous payment plan selection
        setSelectedPaymentPlan(null);
        form.setFieldsValue({ paymentPlan: undefined, amount: undefined });

        // Extract active payment plans from the selected sale
        if (sale && sale.paymentPlans && Array.isArray(sale.paymentPlans)) {
            const activePlans = sale.paymentPlans.filter(plan => plan.status !== 'completed').map(plan => ({
                ...plan,
                saleName: sale.propertyName
            }));
            setSalePaymentPlans(activePlans);
        } else {
            setSalePaymentPlans([]);
        }
    };

    // Handle payment plan selection
    const handlePaymentPlanChange = (paymentPlanId) => {
        const plan = salePaymentPlans.find(p => p._id === paymentPlanId);
        setSelectedPaymentPlan(plan);

        // Pre-fill the amount with the remaining balance
        if (plan && plan.installmentAmount) {
            form.setFieldsValue({ amount: plan.installmentAmount });
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Format date to ISO string
            const formattedValues = {
                ...values,
                paymentDate: values.paymentDate.format('YYYY-MM-DD'),
                status: 'completed',
                saleId: selectedSale?._id, // Include saleId in the payment data
                paymentPlanId: selectedPaymentPlan?._id // Include paymentPlanId in the payment data
            };

            // Call API to create payment
            const response = await createPayment(formattedValues);

            message.success('Payment recorded successfully');

            // Call success callback with the new payment data
            if (onSuccess) {
                onSuccess(response);
            }

            // Close modal
            onCancel();
        } catch (error) {
            console.error('Error submitting payment:', error);
            message.error('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Record New Payment"
            open={visible}
            onCancel={onCancel}
            width={700}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Submit Payment
                </Button>
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    paymentDate: moment(),
                    status: 'completed',
                    paymentMethod: 'mpesa',
                    includesPenalty: false
                }}
            >
                {/* Customer Selection */}
                <Form.Item
                    name="customer"
                    label="Customer"
                    rules={[{ required: true, message: 'Please select a customer' }]}
                >
                    <Select
                        placeholder="Select customer"
                        onChange={handleCustomerChange}
                        loading={isLoadingCustomers}
                        showSearch
                        optionFilterProp="children"
                    >
                        {customersData.map(customer => (
                            <Option key={customer._id} value={customer._id}>
                                {customer.name} {customer.email ? `(${customer.email})` : ''}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Sale Selection - Now using saleCode instead of property name */}
                <Form.Item
                    name="sale"
                    label="Sale"
                    rules={[{ required: true, message: 'Please select a sale' }]}
                >
                    <Select
                        placeholder="Select sale by code"
                        onChange={handleSaleChange}
                        disabled={!selectedCustomer || customerSales.length === 0}
                    >
                        {customerSales.map(sale => (
                            <Option key={sale._id} value={sale._id}>
                                {sale.saleCode || 'No Code'} - {sale.propertyName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Sale Details - Show additional details about selected sale */}
                {selectedSale && (
                    <div className="bg-gray-50 p-3 mb-4 rounded">
                        <Text strong>Sale Details:</Text>
                        <ul className="mt-1">
                            <li>Sale Code: {selectedSale.saleCode || 'Not available'}</li>
                            <li>Property: {selectedSale.propertyName}</li>
                            <li>Sale Price: KES {selectedSale.salePrice?.toLocaleString() || '0'}</li>
                            <li>Status: {selectedSale.status || 'Unknown'}</li>
                        </ul>
                    </div>
                )}

                {/* Payment Plan Selection */}
                <Form.Item
                    name="paymentPlan"
                    label="Payment Plan"
                    rules={[{ required: true, message: 'Please select a payment plan' }]}
                >
                    <Select
                        placeholder="Select payment plan"
                        onChange={handlePaymentPlanChange}
                        disabled={!selectedSale || salePaymentPlans.length === 0}
                    >
                        {salePaymentPlans.map(plan => (
                            <Option key={plan._id} value={plan._id}>
                                KES {plan.installmentAmount?.toLocaleString() || '0'} outstanding
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedPaymentPlan && (
                    <div className="bg-gray-50 p-3 mb-4 rounded">
                        <Text strong>Payment Plan Details:</Text>
                        <ul className="mt-1">
                            <li>Total Amount: KES {selectedPaymentPlan.totalAmount?.toLocaleString() || '0'}</li>
                            <li>Outstanding: KES {selectedPaymentPlan.outstandingBalance?.toLocaleString() || '0'}</li>
                            <li>Status: {selectedPaymentPlan.status}</li>
                        </ul>
                    </div>
                )}

                <Divider />

                {/* Payment Details */}
                <Form.Item
                    name="amount"
                    label="Payment Amount (KES)"
                    rules={[{ required: true, message: 'Please enter payment amount' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        step={1000}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Space style={{ width: '100%' }} size="large">
                    <Form.Item
                        name="paymentDate"
                        label="Payment Date"
                        rules={[{ required: true, message: 'Please select payment date' }]}
                        style={{ width: '100%' }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="paymentMethod"
                        label="Payment Method"
                        rules={[{ required: true, message: 'Please select payment method' }]}
                        style={{ width: '100%' }}
                    >
                        <Select>
                            <Option value="mpesa">M-Pesa</Option>
                            <Option value="bank_transfer">Bank Transfer</Option>
                            <Option value="cash">Cash</Option>
                            <Option value="cheque">Cheque</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>
                </Space>

                <Form.Item
                    name="includesPenalty"
                    valuePropName="checked"
                >
                    <Checkbox>Includes Penalty</Checkbox>
                </Form.Item>

                {/* Conditionally show penalty amount if includes penalty is checked */}
                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                        prevValues.includesPenalty !== currentValues.includesPenalty
                    }
                >
                    {({ getFieldValue }) =>
                        getFieldValue('includesPenalty') ? (
                            <Form.Item
                                name="penaltyAmount"
                                label="Penalty Amount (KES)"
                                rules={[{ required: true, message: 'Please enter penalty amount' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        ) : null
                    }
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Notes"
                >
                    <TextArea rows={3} placeholder="Add any additional notes about this payment" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPaymentModal;