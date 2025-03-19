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
    Alert,
    Radio
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    CalculatorOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useEffect, useState, useRef } from 'react';
import AddEditUserModal from "@/pages/Users/components/modal/AddUserModal";

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
    formatDate,
    onAgentAdded,
    onPropertyManagerAdded
}) => {
    // New state for payment plan options
    const [paymentFrequency, setPaymentFrequency] = useState('monthly');
    const [numberOfMonths, setNumberOfMonths] = useState(12);
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [quantity, setQuantity] = useState(1);

    // New state for phase selection
    const [availablePhases, setAvailablePhases] = useState([]);
    const [selectedPhase, setSelectedPhase] = useState(null);

    // Refs for user modals
    const agentModalActionRef = useRef();
    const managerModalActionRef = useRef();

    // Handle property selection to auto-populate list price and units
    const handlePropertyChange = (value) => {
        const property = propertiesData.find((p) => (p._id || p.id) === value);
        if (property) {
            setSelectedProperty(property);

            // Get available phases from the property
            const phases = property.phases ? property.phases.filter(phase => phase) : [];
            setAvailablePhases(phases);

            // Set current phase as default if available
            if (property.currentPhase) {
                setSelectedPhase(property.currentPhase);
                form.setFieldsValue({
                    phase: property.currentPhase
                });
            } else if (phases.length > 0) {
                // Otherwise set the first phase as default
                const activePhase = phases.find(phase => phase.active);
                if (activePhase) {
                    setSelectedPhase(activePhase.name);
                    form.setFieldsValue({
                        phase: activePhase.name
                    });
                } else {
                    setSelectedPhase(phases[0].name);
                    form.setFieldsValue({
                        phase: phases[0].name
                    });
                }
            }

            // Reset unit selection
            form.setFieldsValue({
                unit: undefined,
                listPrice: undefined,
                salePrice: undefined
            });

            // Clear available units until phase is selected
            setAvailableUnits([]);
        }
    };

    // Handle phase selection
    const handlePhaseChange = (phaseName) => {
        setSelectedPhase(phaseName);

        if (!selectedProperty) return;

        // Filter units based on selected phase and availability
        const filteredUnits = selectedProperty.units ? selectedProperty.units.filter(unit => {
            // Check if unit has the selected phase in pricing and is available
            const hasPhase = unit.phasePricing && unit.phasePricing.some(
                pricing => pricing.phaseName === phaseName
            );
            return hasPhase && unit.status !== 'sold' && unit.availableUnits > 0;
        }) : [];

        setAvailableUnits(filteredUnits);

        // Reset unit selection
        form.setFieldsValue({
            unit: undefined,
            listPrice: undefined,
            salePrice: undefined
        });
    };

    // Handle unit selection
    const handleUnitChange = (unitId) => {
        if (!selectedProperty || !unitId || !selectedPhase) return;

        const unit = selectedProperty.units.find(u => (u._id || u.id) === unitId);
        if (unit) {
            // Find the price for the selected phase
            const phasePrice = unit.phasePricing.find(
                pricing => pricing.phaseName === selectedPhase
            );

            // Use phase price if available, otherwise use base price
            const price = phasePrice ? phasePrice.price : unit.basePrice;

            form.setFieldsValue({
                listPrice: price,
                salePrice: price
            });

            // Update form with unit details
            form.setFieldsValue({
                unitType: unit.unitType,
                plotSize: unit.plotSize || ''
            });

            calculateTotalAfterDiscount();
        }
    };

    // Handle quantity change
    const handleQuantityChange = (value) => {
        setQuantity(value || 1);

        // Update price based on quantity
        const unitPrice = form.getFieldValue('listPrice') || 0;
        form.setFieldsValue({
            salePrice: unitPrice * value
        });

        calculateTotalAfterDiscount();
    };

    // Handle discount calculation
    const handleDiscountChange = (value) => {
        setDiscount(value || 0);
        calculateTotalAfterDiscount();
    };

    // Calculate total after discount
    const calculateTotalAfterDiscount = () => {
        const salePrice = form.getFieldValue('salePrice') || 0;
        const discountAmount = discount || 0;
        const total = salePrice - discountAmount;
        setTotalAfterDiscount(total);
        return total;
    };

    // Handle agent selection change
    const handleAgentChange = (value) => {
        if (value === "add_new") {
            // Trigger the user modal via ref
            if (agentModalActionRef.current) {
                agentModalActionRef.current.click();
            }

            // Reset the select value to prevent issues
            setTimeout(() => {
                form.setFieldsValue({
                    agent: undefined
                });
            }, 100);
        }
    };

    // Handle property manager selection change
    const handlePropertyManagerChange = (value) => {
        if (value === "add_new") {
            // Trigger the user modal via ref
            if (managerModalActionRef.current) {
                managerModalActionRef.current.click();
            }

            // Reset the select value to prevent issues
            setTimeout(() => {
                form.setFieldsValue({
                    propertyManager: undefined
                });
            }, 100);
        }
    };

    // Function to handle successful agent addition
    const handleAgentAdded = (newAgent) => {
        // Call the parent component's handler with the new agent data
        if (onAgentAdded && newAgent) {
            onAgentAdded(newAgent);

            // Set the form's agent field to the newly created agent's ID
            form.setFieldsValue({
                agent: newAgent._id
            });
        }
    };

    // Function to handle successful property manager addition
    const handlePropertyManagerAdded = (newManager) => {
        // Call the parent component's handler with the new manager data
        if (onPropertyManagerAdded && newManager) {
            onPropertyManagerAdded(newManager);

            // Set the form's propertyManager field to the newly created manager's ID
            form.setFieldsValue({
                propertyManager: newManager._id
            });
        }
    };

    // Generate payment plans based on selected options
    const generatePaymentPlans = () => {
        const total = calculateTotalAfterDiscount();
        const initialPayment = form.getFieldValue('initialPayment') || 0;
        const remainingAmount = total - initialPayment;
        const numMonths = numberOfMonths;

        if (numMonths <= 0 || remainingAmount <= 0) {
            Modal.warning({
                title: 'Invalid Input',
                content: 'Please ensure the number of months is greater than 0 and there is a remaining amount after initial payment.',
            });
            return;
        }

        // Calculate monthly installment amount
        const monthlyAmount = Math.round(remainingAmount / numMonths);

        // Create new installments array
        const newInstallments = [];
        const startDate = form.getFieldValue('paymentDate') || moment();

        // Add installments
        for (let i = 0; i < numMonths; i++) {
            newInstallments.push({
                key: `generated-${i}`,
                amount: i === numMonths - 1
                    ? remainingAmount - (monthlyAmount * (numMonths - 1)) // Last payment adjusts for rounding
                    : monthlyAmount,
                dueDate: moment(startDate).add(i + 1, 'months'),
                method: 'M-Pesa',
                status: 'Not Due'
            });
        }

        // Update installments
        setInstallments(newInstallments);

        Modal.success({
            title: 'Payment Plan Generated',
            content: `Created ${numMonths} monthly installments of approximately ${formatCurrency(monthlyAmount)} each.`,
        });
    };

    // Prefill installments from existing payment plans when in edit mode
    useEffect(() => {
        // If the sale is already paid, show a notification
        if (isEditMode && saleToEdit?.status === 'completed') {
            Modal.info({
                title: 'Completed Sale',
                content: 'This sale has already been completed. Most fields are read-only.',
                okText: 'Understood'
            });
        }

        // Set unit details if in edit mode
        if (isEditMode && saleToEdit) {
            // Set the quantity
            setQuantity(saleToEdit.quantity || 1);

            // If we have a property, find it and set available units and phases
            if (saleToEdit.property) {
                const property = propertiesData.find(p =>
                    (p._id || p.id) === (saleToEdit.property._id || saleToEdit.property)
                );
                if (property) {
                    setSelectedProperty(property);

                    // Set available phases
                    const phases = property.phases ? property.phases.filter(phase => phase) : [];
                    setAvailablePhases(phases);

                    // Set the phase used in the sale
                    if (saleToEdit.phase) {
                        setSelectedPhase(saleToEdit.phase);
                    } else if (property.currentPhase) {
                        setSelectedPhase(property.currentPhase);
                    }

                    // Find all available units filtered by the selected phase
                    const phaseUnits = property.units ? property.units.filter(unit => {
                        // Include the sold unit if it's the one in this sale
                        const isCurrentSaleUnit = saleToEdit.unit &&
                            ((unit._id && unit._id.toString() === saleToEdit.unit.toString()) ||
                                (unit.id && unit.id.toString() === saleToEdit.unit.toString()));

                        return isCurrentSaleUnit || (unit.status !== 'sold' && unit.availableUnits > 0);
                    }) : [];

                    setAvailableUnits(phaseUnits);
                }
            }
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

            // For each payment plan, we need to create installments
            saleToEdit.paymentPlans.forEach((paymentPlan) => {
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
                }
            });

            if (allInstallments.length > 0) {
                setInstallments(allInstallments);
            } else {
                // Fallback - create at least one default installment if none were created
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
    }, [isEditMode, saleToEdit, form, propertiesData]);

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
                                                    // Show properties with available units, or the current property if editing
                                                    (property.units && property.units.some(unit => unit.status !== 'sold' && unit.availableUnits > 0)) ||
                                                    (isEditMode && saleToEdit && (property._id || property.id) === (saleToEdit.property?._id || saleToEdit.property))
                                                )
                                                .map((property) => (
                                                    <Option key={property._id || property.id} value={property._id || property.id}>
                                                        {property.name} - {property.location?.address || "No location"}
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

                        {/* Phase Selection Row */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Select Phase"
                                    name="phase"
                                    rules={[{ required: true, message: "Please select a phase" }]}
                                >
                                    <Select
                                        style={{ width: "100%" }}
                                        placeholder="Select phase"
                                        onChange={handlePhaseChange}
                                        disabled={!selectedProperty || isEditMode} // Disable if no property selected or in edit mode
                                    >
                                        {availablePhases.map((phase) => (
                                            <Option key={phase.name} value={phase.name}>
                                                {phase.name} {phase.active ? '(Active)' : ''}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Quantity"
                                    name="quantity"
                                    initialValue={1}
                                    rules={[{ required: true, message: 'Please enter quantity' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={1}
                                        onChange={handleQuantityChange}
                                        disabled={isEditMode} // Disable in edit mode
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Unit Selection Row */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Select Unit"
                                    name="unit"
                                    rules={[{ required: true, message: "Please select a unit" }]}
                                >
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Select unit"
                                        optionFilterProp="children"
                                        onChange={handleUnitChange}
                                        disabled={!selectedProperty || !selectedPhase || isEditMode} // Disable if no property or phase selected or in edit mode
                                    >
                                        {availableUnits.map((unit) => {
                                            // Find the price for this unit in the selected phase
                                            const phasePrice = unit.phasePricing && unit.phasePricing.find(
                                                p => p.phaseName === selectedPhase
                                            );
                                            const price = phasePrice ? phasePrice.price : unit.basePrice;

                                            return (
                                                <Option key={unit._id || unit.id} value={unit._id || unit.id}>
                                                    {unit.unitType || unit.type} - {unit.plotSize ? `${unit.plotSize} sqm -` : ''} {formatCurrency(price)}
                                                </Option>
                                            );
                                        })}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Unit Type"
                                    name="unitType"
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
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
                                        onChange={() => calculateTotalAfterDiscount()}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
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
                            <Col span={8}>
                                <Form.Item
                                    label="Discount (KES)"
                                    name="discount"
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter discount amount"
                                        min={0}
                                        onChange={handleDiscountChange}
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
                                            } else if (value === 'Full Payment') {
                                                // Auto-fill for full payment
                                                const totalAmount = calculateTotalAfterDiscount();
                                                form.setFieldsValue({
                                                    initialPayment: totalAmount,
                                                    paymentDate: moment(), // Set to current date
                                                    status: 'completed' // Set sale status to completed
                                                });
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
                                    label="Sale Status"
                                    name="status"
                                    initialValue="reservation"
                                    rules={[{ required: true, message: 'Please select a status' }]}
                                >
                                    <Select>
                                        <Option value="reservation">Reservation</Option>
                                        <Option value="agreement">Agreement</Option>
                                        <Option value="processing">Processing</Option>
                                        <Option value="completed">Completed</Option>
                                        <Option value="cancelled">Cancelled</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
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
                                        onChange={handleAgentChange}
                                    >
                                        {agentsData && agentsData.map(agent => (
                                            <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                                                {agent.name} - {agent.email}
                                            </Option>
                                        ))}
                                        <Option key="add_new" value="add_new" style={{ color: "blue" }}>
                                            + Add New Agent
                                        </Option>
                                    </Select>
                                </Form.Item>

                                {/* Hidden button to be clicked programmatically via ref */}
                                <div style={{ display: "none" }}>
                                    <AddEditUserModal
                                        actionRef={agentModalActionRef}
                                        edit={false}
                                        data={null}
                                        isProfile={false}
                                        onSuccess={handleAgentAdded}
                                        initialValues={{ role: 'sales_agent' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
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
                                        onChange={handlePropertyManagerChange}
                                    >
                                        {managersData && managersData.map(manager => (
                                            <Option key={manager._id || manager.id} value={manager._id || manager.id}>
                                                {manager.name} - {manager.email}</Option>
                                        ))}
                                        <Option key="add_new" value="add_new" style={{ color: "blue" }}>
                                            + Add New Property Manager
                                        </Option>
                                    </Select>
                                </Form.Item>

                                {/* Hidden button to be clicked programmatically via ref */}
                                <div style={{ display: "none" }}>
                                    <AddEditUserModal
                                        actionRef={managerModalActionRef}
                                        edit={false}
                                        data={null}
                                        isProfile={false}
                                        onSuccess={handlePropertyManagerAdded}
                                        initialValues={{ role: 'property_manager' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Commission (%)"
                                    name="commissionPercentage"
                                    initialValue={5}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        max={100}
                                        precision={2}
                                    />
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
                                        <Option value="cheque">Cheque</Option>
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

                                        {/* New Payment Plan Generator */}
                                        {!isEditMode && (
                                            <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                                                <h4>Payment Plan Generator</h4>
                                                <Row gutter={16} align="middle">
                                                    <Col span={8}>
                                                        <Form.Item label="Payment Frequency" style={{ marginBottom: 0 }}>
                                                            <Radio.Group
                                                                value={paymentFrequency}
                                                                onChange={(e) => setPaymentFrequency(e.target.value)}
                                                                buttonStyle="solid"
                                                            >
                                                                <Radio.Button value="monthly">Monthly</Radio.Button>
                                                            </Radio.Group>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Form.Item label="Number of Months" style={{ marginBottom: 0 }}>
                                                            <InputNumber
                                                                style={{ width: '100%' }}
                                                                min={1}
                                                                max={60}
                                                                value={numberOfMonths}
                                                                onChange={(value) => setNumberOfMonths(value)}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Button
                                                            type="primary"
                                                            icon={<CalculatorOutlined />}
                                                            onClick={generatePaymentPlans}
                                                            style={{ marginTop: 22 }}
                                                        >
                                                            Generate Payment Plan
                                                        </Button>
                                                    </Col>
                                                </Row>
                                                <div style={{ marginTop: 12 }}>
                                                    <Alert
                                                        message={
                                                            <>
                                                                Total after discount: <strong>{formatCurrency(calculateTotalAfterDiscount())}</strong> |
                                                                Initial payment: <strong>{formatCurrency(form.getFieldValue('initialPayment') || 0)}</strong> |
                                                                To finance: <strong>{formatCurrency(calculateTotalAfterDiscount() - (form.getFieldValue('initialPayment') || 0))}</strong> |
                                                                Monthly payment: <strong>{formatCurrency((calculateTotalAfterDiscount() - (form.getFieldValue('initialPayment') || 0)) / numberOfMonths)}</strong>
                                                            </>
                                                        }
                                                        type="info"
                                                        showIcon
                                                    />
                                                </div>
                                            </div>
                                        )}

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
                                                            <Col span={10}>
                                                                <Form.Item label="Amount (KES)" required>
                                                                    <InputNumber
                                                                        style={{ width: '100%' }}
                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                        placeholder="Amount"
                                                                        value={installment.amount}
                                                                        onChange={(value) => {
                                                                            // Prevent changes if sale is already completed
                                                                            if (saleToEdit?.status === 'completed') {
                                                                                Modal.warning({
                                                                                    title: 'Cannot Modify Completed Sale',
                                                                                    content: 'This sale has already been completed and cannot be modified.',
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
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'completed'}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={10}>
                                                                <Form.Item label="Due Date" required>
                                                                    <DatePicker
                                                                        style={{ width: '100%' }}
                                                                        value={installment.dueDate}
                                                                        onChange={(date) => onInstallmentChange(installment.key, 'dueDate', date)}
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'completed'}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={6} style={{ display: 'none' }}>
                                                                <Form.Item label="Payment Method">
                                                                    <Select
                                                                        style={{ width: '100%' }}
                                                                        value={installment.method || 'M-Pesa'}
                                                                        onChange={(value) => onInstallmentChange(installment.key, 'method', value)}
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'completed'}
                                                                    >
                                                                        <Option value="Bank Transfer">Bank Transfer</Option>
                                                                        <Option value="M-Pesa">M-Pesa</Option>
                                                                        <Option value="Cash">Cash</Option>
                                                                        <Option value="cheque">Cheque</Option>
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={4} style={{ display: 'none' }}>
                                                                <Form.Item label="Status">
                                                                    <Select
                                                                        style={{ width: '100%' }}
                                                                        value={installment.status || 'Not Due'}
                                                                        onChange={(value) => onInstallmentChange(installment.key, 'status', value)}
                                                                        disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'completed'}
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
                                                                    disabled={installment.status === 'Paid' || installment.status === 'completed' || saleToEdit?.status === 'completed'}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            // Show a message if no installments exist yet
                                            <div style={{ textAlign: 'center', margin: '20px 0', color: '#999' }}>
                                                No installments defined yet. Use the generator above or click "Add Installment" to create one.
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
                                                            const isDisabled = remainingAmount <= 0 || saleToEdit?.status === 'completed';
                                                            const disabledReason = saleToEdit?.status === 'completed'
                                                                ? "Sale is already completed"
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
                                                                    {isDisabled && (saleToEdit?.status === 'completed'
                                                                        ? " (Sale completed)"
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
                                                            disabled={calculateRemainingAmount(saleToEdit.paymentPlans[0]._id) <= 0 || saleToEdit?.status === 'completed'}
                                                            title={saleToEdit?.status === 'completed' ? "Sale is already completed" : "Maximum amount reached"}
                                                        >
                                                            Add Installment
                                                            {saleToEdit?.status === 'completed' ? " (Sale completed)" : calculateRemainingAmount(saleToEdit.paymentPlans[0]._id) <= 0 ? " (Max reached)" : ""}
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
                                                    Add Installment Manually
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