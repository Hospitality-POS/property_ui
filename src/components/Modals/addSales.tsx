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
    Divider,
    Alert
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useEffect } from 'react';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

export const AddSaleModal = ({
    visible,
    isEditMode,
    saleToEdit,
    form,
    installments,
    setInstallments,
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

    // Prefill installments from existing payment plans when in edit mode
    useEffect(() => {
        console.log('AddSaleModal useEffect triggered with:', {
            isEditMode,
            saleToEdit: saleToEdit?.id || saleToEdit?._id,
            hasPaymentPlans: Boolean(saleToEdit?.paymentPlans?.length),
            saleStatus: saleToEdit?.status
        });

        // If the sale is already paid, show a notification
        if (isEditMode && saleToEdit?.status === 'paid') {
            Modal.info({
                title: 'Paid Sale',
                content: 'This sale has already been paid. Most fields are read-only.',
                okText: 'Understood'
            });
        }

        if (isEditMode && saleToEdit && saleToEdit.paymentPlans && saleToEdit.paymentPlans.length > 0) {
            // Set form fields for the first available payment plan
            form.setFieldsValue({
                paymentPlan: saleToEdit.paymentPlanType || 'Installment',
                initialPayment: saleToEdit.paymentPlans[0]?.initialDeposit || 0,
                paymentDate: moment(saleToEdit.paymentPlans[0]?.startDate),
                paymentMethod: 'M-Pesa'
            });

            // Create installments from all payment plans
            const allInstallments = [];

            console.log('Processing payment plans:', saleToEdit.paymentPlans);

            // For each payment plan, we need to create installments
            saleToEdit.paymentPlans.forEach((paymentPlan) => {
                console.log(`Processing payment plan: ${paymentPlan._id}, status: ${paymentPlan.status}`);

                // Skip completed payment plans if needed - comment this out if you want to show all plans
                // if (paymentPlan.status === 'completed') {
                //    console.log(`Skipping completed payment plan ${paymentPlan._id}`);
                //    return;
                // }

                // Create a special label for this payment plan to group installments
                allInstallments.push({
                    key: `plan-header-${paymentPlan._id}`,
                    isHeader: true,
                    label: `Payment Plan ${paymentPlan._id.substr(-4)} - ${paymentPlan.status}`,
                    amount: paymentPlan.installmentAmount,
                    initialDeposit: paymentPlan.initialDeposit,
                    paymentPlanId: paymentPlan._id
                });

                if (paymentPlan.installments && paymentPlan.installments.length > 0) {
                    console.log(`Payment plan ${paymentPlan._id} has ${paymentPlan.installments.length} installments`);
                    paymentPlan.installments.forEach((installment, index) => {
                        allInstallments.push({
                            key: `${paymentPlan._id}-${index}`,
                            amount: installment.amount || paymentPlan.installmentAmount,
                            dueDate: moment(installment.dueDate),
                            method: installment.paymentMethod || 'M-Pesa',
                            status: installment.status || 'Not Due',
                            paymentPlanId: paymentPlan._id
                        });
                    });
                } else {
                    // If no existing installments, create placeholders based on payment plan details
                    console.log(`Creating placeholder installments for payment plan ${paymentPlan._id}`);
                    const startDate = paymentPlan.startDate ? moment(paymentPlan.startDate) : null;
                    const endDate = paymentPlan.endDate ? moment(paymentPlan.endDate) : null;
                    const installmentAmount = paymentPlan.installmentAmount;
                    const frequency = paymentPlan.installmentFrequency;

                    if (startDate && endDate && installmentAmount) {
                        const duration = moment.duration(endDate.diff(startDate));
                        let numberOfInstallments = 0;

                        // Calculate number of installments based on frequency
                        if (frequency === 'monthly') {
                            numberOfInstallments = Math.ceil(duration.asMonths());
                        } else if (frequency === 'weekly') {
                            numberOfInstallments = Math.ceil(duration.asWeeks());
                        } else if (frequency === 'quarterly') {
                            numberOfInstallments = Math.ceil(duration.asMonths() / 3);
                        } else if (frequency === 'custom' && paymentPlan.customFrequencyDays) {
                            numberOfInstallments = Math.ceil(duration.asDays() / paymentPlan.customFrequencyDays);
                        }

                        const maxInstallments = Math.min(numberOfInstallments || 0, 12);
                        console.log(`Creating ${maxInstallments} placeholder installments`);

                        for (let i = 0; i < maxInstallments; i++) {
                            let dueDate;
                            if (frequency === 'monthly') {
                                dueDate = moment(startDate).add(i + 1, 'months');
                            } else if (frequency === 'weekly') {
                                dueDate = moment(startDate).add((i + 1) * 7, 'days');
                            } else if (frequency === 'quarterly') {
                                dueDate = moment(startDate).add((i + 1) * 3, 'months');
                            } else if (frequency === 'custom' && paymentPlan.customFrequencyDays) {
                                dueDate = moment(startDate).add((i + 1) * paymentPlan.customFrequencyDays, 'days');
                            }

                            allInstallments.push({
                                key: `${paymentPlan._id}-${i}`,
                                amount: installmentAmount,
                                dueDate,
                                method: 'M-Pesa',
                                status: 'Not Due',
                                paymentPlanId: paymentPlan._id
                            });
                        }
                    }
                }
            });

            console.log(`Created ${allInstallments.length} total installments`);
            if (allInstallments.length > 0) {
                setInstallments(allInstallments);
            } else {
                // Fallback - create at least one default installment if none were created
                console.log('No installments created, adding default installment');
                setInstallments([{
                    key: 'default-0',
                    amount: 0,
                    dueDate: moment().add(1, 'month'),
                    method: 'M-Pesa',
                    status: 'Not Due'
                }]);
            }
        } else if (isEditMode && saleToEdit && form.getFieldValue('paymentPlan') === 'Installment') {
            // If we're in edit mode but no payment plans, add a default installment
            console.log('Edit mode with no payment plans, adding default installment');
            if (installments.length === 0) {
                setInstallments([{
                    key: 'default-0',
                    amount: 0,
                    dueDate: moment().add(1, 'month'),
                    method: 'M-Pesa',
                    status: 'Not Due'
                }]);
            }
        }
    }, [isEditMode, saleToEdit, form]); // Removed setInstallments from dependencies

    // Calculate the total of all installments for a specific payment plan
    const calculatePlanTotal = (planId) => {
        return installments
            .filter(inst => !inst.isHeader && inst.paymentPlanId === planId)
            .reduce((sum, inst) => sum + (inst.amount || 0), 0);
    };

    // Calculate the remaining amount that can be allocated for a payment plan
    const calculateRemainingAmount = (planId) => {
        const plan = saleToEdit?.paymentPlans?.find(p => p._id === planId);
        if (!plan) return 0;

        const totalPlanAmount = plan.totalAmount || 0;
        const initialDeposit = plan.initialDeposit || 0;
        const installmentsTotal = calculatePlanTotal(planId);

        // The remaining amount is the total minus initial deposit minus existing installments
        return Math.max(0, totalPlanAmount - initialDeposit - installmentsTotal);
    };

    // Add this helper function to add a new installment if none exist
    const ensureInstallments = () => {
        if (form.getFieldValue('paymentPlan') === 'Installment') {
            // Find if we have any non-header installments
            const hasRealInstallments = installments.some(inst => !inst.isHeader);

            if (!hasRealInstallments) {
                // If we're in edit mode and have payment plans but no real installments, add a default one
                onAddInstallment(saleToEdit?.paymentPlans?.[0]?._id);
            }
        }
    };

    // Modified onAddInstallment function to support adding to a specific payment plan
    const handleAddInstallment = (paymentPlanId) => {
        if (!paymentPlanId && saleToEdit?.paymentPlans?.length > 0) {
            // If no specific payment plan ID provided, use the first active plan
            const activePlan = saleToEdit.paymentPlans.find(plan => plan.status !== 'completed');
            paymentPlanId = activePlan?._id || saleToEdit.paymentPlans[0]._id;
        }

        // Check if we can add more installments (if total amount not exceeded)
        const remainingAmount = calculateRemainingAmount(paymentPlanId);
        if (remainingAmount <= 0) {
            // Show modal or notification that max amount reached
            Modal.warning({
                title: 'Maximum Amount Reached',
                content: 'Cannot add more installments as the total sale amount would be exceeded.',
            });
            return;
        }

        // Call the original function with the suggested installment amount
        onAddInstallment(paymentPlanId, remainingAmount);
    };

    return (
        <Modal
            title={isEditMode ? `Edit Sale` : "Create New Sale"}
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
                                        disabled={isEditMode} // Disable in edit mode
                                    >
                                        {propertiesData &&
                                            propertiesData
                                                .filter((property) =>
                                                    // If we're editing, include the current property even if not available
                                                    property.status === "available" ||
                                                    (isEditMode && saleToEdit && (property._id || property.id) === (saleToEdit.property?._id || saleToEdit.property))
                                                )
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
                                        disabled={isEditMode} // Disable in edit mode
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
                                    <Select
                                        style={{ width: '100%' }}
                                        disabled={isEditMode && saleToEdit && saleToEdit.paymentPlans && saleToEdit.paymentPlans.length > 0}
                                        onChange={(value) => {
                                            if (value === 'Installment') {
                                                // Ensure we have at least one installment when switching to installment mode
                                                setTimeout(ensureInstallments, 0);
                                            }
                                        }}
                                    >
                                        <Option value="Full Payment">Full Payment</Option>
                                        <Option value="Installment">Installment</Option>
                                    </Select>
                                </Form.Item>
                                {isEditMode && saleToEdit && saleToEdit.paymentPlans && saleToEdit.paymentPlans.length > 0 && (
                                    <div style={{ marginTop: '-20px', marginBottom: '10px' }}>
                                        <small style={{ color: '#999' }}>Payment plan type cannot be changed for existing sales</small>
                                    </div>
                                )}
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
                                disabled={isEditMode && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')}
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Date"
                                    name="paymentDate"
                                    rules={[{ required: true, message: 'Please select the payment date' }]}
                                >
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        disabled={isEditMode && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Method"
                                    name="paymentMethod"
                                    rules={[{ required: true, message: 'Please select a payment method' }]}
                                >
                                    <Select
                                        style={{ width: '100%' }}
                                        disabled={isEditMode && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')}
                                    >
                                        <Option value="Bank Transfer">Bank Transfer</Option>
                                        <Option value="M-Pesa">M-Pesa</Option>
                                        <Option value="Cash">Cash</Option>
                                        <Option value="Check">Check</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Reference Number" name="reference">
                            <Input
                                placeholder="Enter reference number"
                                disabled={isEditMode && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')}
                            />
                        </Form.Item>

                        <Form.Item
                            shouldUpdate={(prevValues, currentValues) => prevValues.paymentPlan !== currentValues.paymentPlan}
                            noStyle
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('paymentPlan') === 'Installment' ? (
                                    <>
                                        <Divider>Installment Schedule</Divider>

                                        {isEditMode && saleToEdit && saleToEdit.paymentPlans && saleToEdit.paymentPlans.length > 0 && (
                                            <Alert
                                                message="Installment Schedule"
                                                description="Below are all installments for this sale. Paid installments cannot be modified."
                                                type="info"
                                                showIcon
                                                icon={<InfoCircleOutlined />}
                                                style={{ marginBottom: 16 }}
                                            />
                                        )}

                                        {/* Debug information */}
                                        <div style={{ marginBottom: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                            Debug: {installments.length} installments found
                                        </div>

                                        {/* Display all installments */}
                                        {installments.length > 0 ? (
                                            installments.map((installment) =>
                                                installment.isHeader ? (
                                                    // Render a header/divider for each payment plan
                                                    <div key={installment.key} style={{ marginBottom: '16px', marginTop: '24px' }}>
                                                        <Divider orientation="left">
                                                            <span style={{
                                                                fontWeight: 'bold',
                                                                color: installment.label.includes('completed') ? '#52c41a' : '#1890ff'
                                                            }}>
                                                                {installment.label}
                                                            </span>
                                                        </Divider>
                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item label="Total Amount" style={{ marginBottom: '12px' }}>
                                                                    <InputNumber
                                                                        style={{ width: '100%' }}
                                                                        value={installment.amount}
                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                        disabled={true}
                                                                        addonBefore="KES"
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item label="Initial Deposit" style={{ marginBottom: '12px' }}>
                                                                    <InputNumber
                                                                        style={{ width: '100%' }}
                                                                        value={installment.initialDeposit}
                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                        disabled={true}
                                                                        addonBefore="KES"
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item label="Remaining Amount" style={{ marginBottom: '12px' }}>
                                                                    <InputNumber
                                                                        style={{ width: '100%' }}
                                                                        value={calculateRemainingAmount(installment.paymentPlanId)}
                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                        disabled={true}
                                                                        addonBefore="KES"
                                                                        className={calculateRemainingAmount(installment.paymentPlanId) <= 0 ? 'ant-input-number-status-error' : ''}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                ) : (
                                                    // Render regular installment rows
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
                                                                        onChange={(value) => {
                                                                            // Prevent changes if sale is already paid
                                                                            if (saleToEdit?.status === 'paid') {
                                                                                Modal.warning({
                                                                                    title: 'Cannot Modify Paid Sale',
                                                                                    content: 'This sale has already been paid and cannot be modified.',
                                                                                });
                                                                                return;
                                                                            }

                                                                            // Calculate current total excluding this installment
                                                                            const plan = saleToEdit?.paymentPlans?.find(p => p._id === installment.paymentPlanId);
                                                                            if (plan) {
                                                                                const currentTotal = calculatePlanTotal(installment.paymentPlanId);
                                                                                const currentInstallmentAmount = installment.amount || 0;
                                                                                const otherInstallmentsTotal = currentTotal - currentInstallmentAmount;
                                                                                const initialDeposit = plan.initialDeposit || 0;
                                                                                const totalPlanAmount = plan.totalAmount || 0;

                                                                                // Calculate maximum allowed value
                                                                                const maxAllowed = Math.max(0, totalPlanAmount - initialDeposit - otherInstallmentsTotal);

                                                                                // Limit the value if needed
                                                                                if (value > maxAllowed) {
                                                                                    Modal.warning({
                                                                                        title: 'Amount Exceeds Limit',
                                                                                        content: `The maximum allowed amount is ${maxAllowed.toLocaleString()} to avoid exceeding the total sale amount.`,
                                                                                    });
                                                                                    onInstallmentChange(installment.key, 'amount', maxAllowed);
                                                                                } else {
                                                                                    onInstallmentChange(installment.key, 'amount', value);
                                                                                }
                                                                            } else {
                                                                                onInstallmentChange(installment.key, 'amount', value);
                                                                            }
                                                                        }}
                                                                        min={0}
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'paid'}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={6}>
                                                                <Form.Item label="Due Date" required>
                                                                    <DatePicker
                                                                        style={{ width: '100%' }}
                                                                        value={installment.dueDate}
                                                                        onChange={(date) => onInstallmentChange(installment.key, 'dueDate', date)}
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'paid'}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={6}>
                                                                <Form.Item label="Payment Method">
                                                                    <Select
                                                                        style={{ width: '100%' }}
                                                                        value={installment.method || 'M-Pesa'}
                                                                        onChange={(value) => onInstallmentChange(installment.key, 'method', value)}
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'paid'}
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
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'paid'}
                                                                    >
                                                                        <Option value="Pending">Pending</Option>
                                                                        <Option value="Not Due">Not Due</Option>
                                                                        {(installment.status === 'Paid' || installment.status === 'completed') && (
                                                                            <Option value={installment.status}>{installment.status === 'Paid' ? 'Paid' : 'Completed'}</Option>
                                                                        )}
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={2} style={{ marginTop: '30px', textAlign: 'center' }}>
                                                                <Button
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => onRemoveInstallment(installment.key)}
                                                                    disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'paid'}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            // Show a message if no installments exist yet
                                            <div style={{ textAlign: 'center', margin: '20px 0', color: '#999' }}>
                                                No installments defined yet. Click "Add Installment" to create one.
                                            </div>
                                        )}

                                        <Form.Item>
                                            {saleToEdit?.paymentPlans?.length > 0 ? (
                                                // If we have multiple payment plans, show a button for each active plan
                                                <div>
                                                    {saleToEdit.paymentPlans
                                                        .filter(plan => plan.status !== 'completed')
                                                        .map(plan => {
                                                            const remainingAmount = calculateRemainingAmount(plan._id);
                                                            const isDisabled = remainingAmount <= 0 || saleToEdit?.status === 'paid';
                                                            const disabledReason = saleToEdit?.status === 'paid'
                                                                ? "Sale is already paid"
                                                                : "Maximum amount reached";

                                                            return (
                                                                <Button
                                                                    key={plan._id}
                                                                    type="dashed"
                                                                    style={{
                                                                        marginRight: 8,
                                                                        marginBottom: 8,
                                                                        opacity: isDisabled ? 0.5 : 1
                                                                    }}
                                                                    icon={<PlusOutlined />}
                                                                    onClick={() => handleAddInstallment(plan._id)}
                                                                    disabled={isDisabled}
                                                                    title={isDisabled ? disabledReason : ""}
                                                                >
                                                                    Add to Plan {plan._id.substr(-4)}
                                                                    {isDisabled && (saleToEdit?.status === 'paid'
                                                                        ? " (Sale paid)"
                                                                        : " (Max reached)")}
                                                                </Button>
                                                            );
                                                        })}

                                                    {/* If all plans are completed, still offer a button for the first plan */}
                                                    {saleToEdit.paymentPlans.every(plan => plan.status === 'completed') && (
                                                        <Button
                                                            type="dashed"
                                                            block
                                                            icon={<PlusOutlined />}
                                                            onClick={() => handleAddInstallment(saleToEdit.paymentPlans[0]._id)}
                                                            disabled={calculateRemainingAmount(saleToEdit.paymentPlans[0]._id) <= 0 || saleToEdit?.status === 'paid'}
                                                            title={saleToEdit?.status === 'paid' ? "Sale is already paid" : "Maximum amount reached"}
                                                        >
                                                            Add Installment
                                                            {saleToEdit?.status === 'paid' ? " (Sale paid)" : calculateRemainingAmount(saleToEdit.paymentPlans[0]._id) <= 0 ? " (Max reached)" : ""}
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                // Default single button if no payment plans
                                                <Button
                                                    type="dashed"
                                                    block
                                                    icon={<PlusOutlined />}
                                                    onClick={() => onAddInstallment()}
                                                >
                                                    Add Installment
                                                </Button>
                                            )}
                                        </Form.Item>
                                    </>
                                ) : null
                            }
                        </Form.Item>
                    </TabPane>
                </Tabs>
            </Form>
        </Modal>
    );
};

export default AddSaleModal;