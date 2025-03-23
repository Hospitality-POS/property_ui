import {
    Modal, Form, Tabs, Row, Col, Input, Select,
    InputNumber, Button, Table, message, Space, Tag, DatePicker, Divider,
    Tooltip, Popconfirm
} from 'antd';
import { useState, useEffect, useRef } from 'react';
import {
    PlusOutlined,
    DeleteOutlined,
    TagOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    MenuOutlined,
    HolderOutlined
} from '@ant-design/icons';
import AddEditUserModal from "@/pages/Users/components/modal/AddUserModal";
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;

export const AddPropertyModal = ({
    visible,
    isEditMode,
    form,
    onOk,
    onCancel,
    propertyManagersData,
    onPropertyManagerAdded
}) => {
    // State for unit details
    const [unitDetails, setUnitDetails] = useState({
        unitType: 'one_bedroom',
        totalUnits: 1,
        availableUnits: 1
    });

    // State to track units and phases
    const [units, setUnits] = useState([]);
    const [phases, setPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState(null);
    const [propertyType, setPropertyType] = useState('apartment');
    const [unitsValidationError, setUnitsValidationError] = useState(false);
    const [managerValidationDisabled, setManagerValidationDisabled] = useState(false);

    // Phase form state
    const [phaseName, setPhaseName] = useState('');
    const [phaseStartDate, setPhaseStartDate] = useState(moment());
    const [phaseEndDate, setPhaseEndDate] = useState(null);
    const [phaseActive, setPhaseActive] = useState(false);

    // Phase editing state
    const [editingPhaseKey, setEditingPhaseKey] = useState(null);
    const [editingPhaseName, setEditingPhaseName] = useState('');
    const [editingPhaseStartDate, setEditingPhaseStartDate] = useState(null);
    const [editingPhaseEndDate, setEditingPhaseEndDate] = useState(null);

    // Phase editing in pricing table
    const [editingPricingPhaseKey, setEditingPricingPhaseKey] = useState(null);
    const [editingPricingPhaseName, setEditingPricingPhaseName] = useState('');

    // Ref for user modal
    const userModalActionRef = useRef();

    // Update property type when form changes
    useEffect(() => {
        const type = form.getFieldValue('propertyType');
        if (type) {
            setPropertyType(type);
            resetUnitDetails(type);
        }
    }, [form.getFieldValue('propertyType')]);

    // Reset unit details based on property type
    const resetUnitDetails = (type) => {
        if (type === 'land') {
            setUnitDetails({
                unitType: 'plot',
                totalUnits: 1,
                availableUnits: 1,
                plotSize: '50/100'
            });
        } else {
            setUnitDetails({
                unitType: 'one_bedroom',
                totalUnits: 1,
                availableUnits: 1
            });
        }
    };

    // Load existing data when editing
    useEffect(() => {
        if (isEditMode && visible) {
            const formValues = form.getFieldsValue(true);

            // Load units
            if (formValues.units && Array.isArray(formValues.units)) {
                const unitsWithKeys = formValues.units.map((unit, index) => ({
                    ...unit,
                    key: `existing-${index}-${Date.now()}`
                }));
                setUnits(unitsWithKeys);
                form.setFieldsValue({ units: formValues.units });

                if (unitsWithKeys.length > 0) {
                    setUnitsValidationError(false);
                }
            }

            // Load phases
            if (formValues.phases && Array.isArray(formValues.phases)) {
                const phasesWithKeys = formValues.phases.map((phase, index) => ({
                    ...phase,
                    key: `existing-phase-${index}-${Date.now()}`,
                    startDate: phase.startDate ? moment(phase.startDate) : null,
                    endDate: phase.endDate ? moment(phase.endDate) : null,
                    order: phase.order !== undefined ? phase.order : index // Use existing order or default to index
                }));
                setPhases(phasesWithKeys);

                if (formValues.currentPhase) {
                    setCurrentPhase(formValues.currentPhase);
                }
            }

            // Set property type
            if (formValues.propertyType) {
                setPropertyType(formValues.propertyType);
            }

            // Set manager validation
            if (formValues.propertyManager) {
                setManagerValidationDisabled(true);
            }
        } else if (!visible) {
            // Reset state when modal is closed
            setUnits([]);
            setPhases([]);
            setCurrentPhase(null);
            setPhaseName('');
            setPhaseStartDate(moment());
            setPhaseEndDate(null);
            setPhaseActive(false);
            setManagerValidationDisabled(false);
            setUnitsValidationError(false);
            setEditingPhaseKey(null);
            setEditingPricingPhaseKey(null);
            resetUnitDetails(propertyType);
        }
    }, [isEditMode, visible, form]);

    // UNIT MANAGEMENT FUNCTIONS

    // Handle unit form changes
    const handleUnitChange = (field, value) => {
        setUnitDetails(prev => {
            const updated = { ...prev, [field]: value };
            // Auto-update availableUnits when totalUnits changes
            if (field === 'totalUnits') {
                updated.availableUnits = value;
            }
            return updated;
        });
    };

    // Add a unit
    const addUnit = () => {
        const newUnit = {
            ...unitDetails,
            key: Date.now(),
            // Create an empty phasePricing array
            phasePricing: []
        };

        // Initialize prices for all existing phases
        if (phases.length > 0) {
            // Sort phases by order for consistent initialization
            const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

            sortedPhases.forEach(phase => {
                newUnit.phasePricing.push({
                    phaseName: phase.name,
                    price: 0, // Default price is 0
                    active: phase.name === currentPhase
                });
            });
        }

        const updatedUnits = [...units, newUnit];
        setUnits(updatedUnits);

        // Update form field with clean units
        const cleanUnits = updatedUnits.map(({ key, ...rest }) => rest);
        form.setFieldsValue({ units: cleanUnits });

        // Clear validation error
        setUnitsValidationError(false);

        // Reset unit details for next entry
        resetUnitDetails(propertyType);
    };

    // Remove a unit
    const removeUnit = (unitKey) => {
        const updatedUnits = units.filter(unit => unit.key !== unitKey);
        setUnits(updatedUnits);

        // Update form field
        const cleanUnits = updatedUnits.map(({ key, ...rest }) => rest);
        form.setFieldsValue({ units: cleanUnits });

        // Set validation error if no units left
        if (updatedUnits.length === 0) {
            setUnitsValidationError(true);
        }
    };

    // PHASE MANAGEMENT FUNCTIONS

    // Handle phase table row reordering
    const handlePhaseRowReorder = (newDataSource) => {
        // Update order property based on new sequence
        const reorderedPhases = newDataSource.map((phase, index) => ({
            ...phase,
            order: index
        }));

        setPhases(reorderedPhases);

        // Update form field
        form.setFieldsValue({
            phases: reorderedPhases.map(({ key, ...rest }) => ({
                ...rest,
                startDate: rest.startDate ? rest.startDate.toISOString() : null,
                endDate: rest.endDate ? rest.endDate.toISOString() : null,
                order: rest.order
            }))
        });
    };

    // Handle phase columns reordering in pricing table
    const handlePhaseColumnReorder = (newOrder) => {
        // Get current order of phases
        const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

        // Create a mapping of old to new positions
        const reorderedPhases = phases.map(phase => {
            // Find current index in sorted phases
            const currentIndex = sortedPhases.findIndex(p => p.key === phase.key);
            // Find new index based on column order
            const newIndex = newOrder.indexOf(currentIndex);

            return {
                ...phase,
                order: newIndex !== -1 ? newIndex : phase.order
            };
        });

        setPhases(reorderedPhases);

        // Update form field
        form.setFieldsValue({
            phases: reorderedPhases.map(({ key, ...rest }) => ({
                ...rest,
                startDate: rest.startDate ? rest.startDate.toISOString() : null,
                endDate: rest.endDate ? rest.endDate.toISOString() : null,
                order: rest.order
            }))
        });
    };

    // Start editing a pricing table phase
    const startEditingPricingPhase = (phaseKey, phaseName) => {
        setEditingPricingPhaseKey(phaseKey);
        setEditingPricingPhaseName(phaseName);
    };

    // Cancel editing a pricing table phase
    const cancelEditingPricingPhase = () => {
        setEditingPricingPhaseKey(null);
        setEditingPricingPhaseName('');
    };

    // Save pricing table phase edits
    const savePricingPhaseEdits = (phaseKey) => {
        // Validate phase name
        if (!editingPricingPhaseName.trim()) {
            message.error('Phase name cannot be empty');
            return;
        }

        // Check if the new name already exists in other phases
        const isNameExists = phases.some(phase =>
            phase.key !== phaseKey && phase.name === editingPricingPhaseName.trim()
        );

        if (isNameExists) {
            message.error('A phase with this name already exists');
            return;
        }

        // Find the old phase name
        const oldPhase = phases.find(phase => phase.key === phaseKey);
        if (!oldPhase) return;

        // Update the phase name
        const updatedPhases = phases.map(phase => {
            if (phase.key === phaseKey) {
                return {
                    ...phase,
                    name: editingPricingPhaseName.trim()
                };
            }
            return phase;
        });

        setPhases(updatedPhases);

        // If we updated the current phase name, update currentPhase too
        if (oldPhase.name === currentPhase) {
            setCurrentPhase(editingPricingPhaseName.trim());
        }

        // Update all units' phasePricing with the new phase name
        const updatedUnits = units.map(unit => {
            const unitCopy = { ...unit };
            if (unitCopy.phasePricing && Array.isArray(unitCopy.phasePricing)) {
                unitCopy.phasePricing = unitCopy.phasePricing.map(pricing => {
                    if (pricing.phaseName === oldPhase.name) {
                        return {
                            ...pricing,
                            phaseName: editingPricingPhaseName.trim()
                        };
                    }
                    return pricing;
                });
            }
            return unitCopy;
        });

        setUnits(updatedUnits);

        // Update form fields
        form.setFieldsValue({
            phases: updatedPhases.map(({ key, ...rest }) => ({
                ...rest,
                startDate: rest.startDate ? rest.startDate.toISOString() : null,
                endDate: rest.endDate ? rest.endDate.toISOString() : null
            })),
            units: updatedUnits.map(({ key, ...rest }) => rest),
            currentPhase: oldPhase.name === currentPhase ? editingPricingPhaseName.trim() : currentPhase
        });

        // Exit editing mode
        cancelEditingPricingPhase();
        message.success('Phase name updated successfully');
    };

    // Start editing a phase
    const startEditingPhase = (phaseKey) => {
        const phaseToEdit = phases.find(phase => phase.key === phaseKey);
        if (phaseToEdit) {
            setEditingPhaseKey(phaseKey);
            setEditingPhaseName(phaseToEdit.name);
            setEditingPhaseStartDate(phaseToEdit.startDate);
            setEditingPhaseEndDate(phaseToEdit.endDate);
        }
    };

    // Cancel editing a phase
    const cancelEditingPhase = () => {
        setEditingPhaseKey(null);
        setEditingPhaseName('');
        setEditingPhaseStartDate(null);
        setEditingPhaseEndDate(null);
    };

    // Save phase edits
    const savePhaseEdits = (phaseKey) => {
        // Validate phase name
        if (!editingPhaseName.trim()) {
            message.error('Phase name cannot be empty');
            return;
        }

        // Check if the new name already exists in other phases
        const isNameExists = phases.some(phase =>
            phase.key !== phaseKey && phase.name === editingPhaseName.trim()
        );

        if (isNameExists) {
            message.error('A phase with this name already exists');
            return;
        }

        // Find the old phase name
        const oldPhase = phases.find(phase => phase.key === phaseKey);
        if (!oldPhase) return;

        // Update the phase
        const updatedPhases = phases.map(phase => {
            if (phase.key === phaseKey) {
                const updatedPhase = {
                    ...phase,
                    name: editingPhaseName.trim(),
                    startDate: editingPhaseStartDate,
                    endDate: editingPhaseEndDate
                };
                return updatedPhase;
            }
            return phase;
        });

        setPhases(updatedPhases);

        // If we updated the current phase name, update currentPhase too
        if (oldPhase.name === currentPhase) {
            setCurrentPhase(editingPhaseName.trim());
        }

        // Update all units' phasePricing with the new phase name
        const updatedUnits = units.map(unit => {
            const unitCopy = { ...unit };
            if (unitCopy.phasePricing && Array.isArray(unitCopy.phasePricing)) {
                unitCopy.phasePricing = unitCopy.phasePricing.map(pricing => {
                    if (pricing.phaseName === oldPhase.name) {
                        return {
                            ...pricing,
                            phaseName: editingPhaseName.trim()
                        };
                    }
                    return pricing;
                });
            }
            return unitCopy;
        });

        setUnits(updatedUnits);

        // Update form fields
        form.setFieldsValue({
            phases: updatedPhases.map(({ key, ...rest }) => ({
                ...rest,
                startDate: rest.startDate ? rest.startDate.toISOString() : null,
                endDate: rest.endDate ? rest.endDate.toISOString() : null
            })),
            units: updatedUnits.map(({ key, ...rest }) => rest),
            currentPhase: oldPhase.name === currentPhase ? editingPhaseName.trim() : currentPhase
        });

        // Exit editing mode
        cancelEditingPhase();
        message.success('Phase updated successfully');
    };

    // Add a phase
    const addPhase = () => {
        // Validate phase name
        if (!phaseName.trim()) {
            message.error('Please enter a phase name');
            return;
        }

        // Check if phase name already exists
        if (phases.some(phase => phase.name === phaseName.trim())) {
            message.error('A phase with this name already exists');
            return;
        }

        // Get next order index
        const nextOrder = phases.length;

        // Create new phase
        const newPhase = {
            name: phaseName.trim(),
            startDate: phaseStartDate,
            endDate: phaseEndDate,
            active: phaseActive,
            order: nextOrder,
            key: `phase-${Date.now()}`
        };

        // If this is the first phase or it's set as active
        if (phases.length === 0 || phaseActive) {
            // Update all phases to be inactive if this one is active
            const updatedPhases = phases.map(phase => ({
                ...phase,
                active: false
            }));

            // Add the new phase
            updatedPhases.push(newPhase);
            setPhases(updatedPhases);

            // Set as current phase
            setCurrentPhase(newPhase.name);

            // Update all units with this phase's pricing
            const updatedUnits = units.map(unit => {
                const unitCopy = { ...unit };

                // Initialize phasePricing array if it doesn't exist
                if (!unitCopy.phasePricing) {
                    unitCopy.phasePricing = [];
                }

                // Add pricing for this phase if it doesn't exist
                if (!unitCopy.phasePricing.some(p => p.phaseName === newPhase.name)) {
                    unitCopy.phasePricing.push({
                        phaseName: newPhase.name,
                        price: 0,
                        active: true
                    });
                }

                return unitCopy;
            });

            setUnits(updatedUnits);

            // Update form fields
            form.setFieldsValue({
                currentPhase: newPhase.name,
                units: updatedUnits.map(({ key, ...rest }) => rest)
            });
        } else {
            // Just add the phase without changing current phase
            const updatedPhases = [...phases, newPhase];
            setPhases(updatedPhases);

            // Add this phase to all units' phasePricing
            const updatedUnits = units.map(unit => {
                const unitCopy = { ...unit };

                // Initialize phasePricing array if it doesn't exist
                if (!unitCopy.phasePricing) {
                    unitCopy.phasePricing = [];
                }

                // Add pricing for this phase if it doesn't exist
                if (!unitCopy.phasePricing.some(p => p.phaseName === newPhase.name)) {
                    unitCopy.phasePricing.push({
                        phaseName: newPhase.name,
                        price: 0,
                        active: false
                    });
                }

                return unitCopy;
            });

            setUnits(updatedUnits);

            // Update form field for units
            form.setFieldsValue({
                units: updatedUnits.map(({ key, ...rest }) => rest)
            });
        }

        // Create a clean version of phases for the form
        const cleanPhases = [...phases, newPhase].map(({ key, ...rest }) => ({
            ...rest,
            startDate: rest.startDate ? rest.startDate.toISOString() : null,
            endDate: rest.endDate ? rest.endDate.toISOString() : null,
            order: rest.order
        }));

        // Update form field
        form.setFieldsValue({ phases: cleanPhases });

        // Reset phase form
        setPhaseName('');
        setPhaseStartDate(moment());
        setPhaseEndDate(null);
        setPhaseActive(false);

        message.success(`Phase "${phaseName}" added successfully`);
    };

    // Remove a phase
    const deletePhase = (phaseKey) => {
        const phaseToDelete = phases.find(phase => phase.key === phaseKey);
        if (!phaseToDelete) return;

        // Check if this is the current active phase
        const isCurrentPhase = currentPhase === phaseToDelete.name;

        // Remove the phase
        const updatedPhases = phases.filter(phase => phase.key !== phaseKey);

        // Update order property to maintain sequence
        const reorderedPhases = updatedPhases.map((phase, index) => ({
            ...phase,
            order: index
        }));

        // If we removed the current phase, set a new one if available
        if (isCurrentPhase && reorderedPhases.length > 0) {
            const newCurrentPhase = reorderedPhases[0].name;
            setCurrentPhase(newCurrentPhase);
            form.setFieldsValue({ currentPhase: newCurrentPhase });

            // Update active status for phases
            reorderedPhases[0].active = true;
        } else if (reorderedPhases.length === 0) {
            setCurrentPhase(null);
            form.setFieldsValue({ currentPhase: null });
        }

        // Remove this phase from all units' phasePricing
        const updatedUnits = units.map(unit => {
            const unitCopy = { ...unit };
            if (unitCopy.phasePricing && Array.isArray(unitCopy.phasePricing)) {
                unitCopy.phasePricing = unitCopy.phasePricing.filter(
                    p => p.phaseName !== phaseToDelete.name
                );
            }
            return unitCopy;
        });

        setPhases(reorderedPhases);
        setUnits(updatedUnits);

        // Update form fields
        form.setFieldsValue({
            phases: reorderedPhases.map(({ key, ...rest }) => ({
                ...rest,
                startDate: rest.startDate ? rest.startDate.toISOString() : null,
                endDate: rest.endDate ? rest.endDate.toISOString() : null,
                order: rest.order
            })),
            units: updatedUnits.map(({ key, ...rest }) => rest)
        });

        message.success(`Phase "${phaseToDelete.name}" deleted successfully`);
    };

    // Set a phase as active
    const setActivePhase = (phaseKey) => {
        const phaseToActivate = phases.find(phase => phase.key === phaseKey);
        if (!phaseToActivate) return;

        // Update phases to set the selected one as active
        const updatedPhases = phases.map(phase => ({
            ...phase,
            active: phase.key === phaseKey
        }));

        setPhases(updatedPhases);
        setCurrentPhase(phaseToActivate.name);

        // Update all units' phase pricing
        const updatedUnits = units.map(unit => {
            const unitCopy = { ...unit };

            if (unitCopy.phasePricing && Array.isArray(unitCopy.phasePricing)) {
                unitCopy.phasePricing = unitCopy.phasePricing.map(pricing => ({
                    ...pricing,
                    active: pricing.phaseName === phaseToActivate.name
                }));
            }

            return unitCopy;
        });

        setUnits(updatedUnits);

        // Update form fields
        form.setFieldsValue({
            currentPhase: phaseToActivate.name,
            phases: updatedPhases.map(({ key, ...rest }) => ({
                ...rest,
                startDate: rest.startDate ? rest.startDate.toISOString() : null,
                endDate: rest.endDate ? rest.endDate.toISOString() : null
            })),
            units: updatedUnits.map(({ key, ...rest }) => rest)
        });

        message.success(`Phase "${phaseToActivate.name}" set as active`);
    };

    // Update price for a unit in a specific phase
    const updateUnitPhasePrice = (unitKey, phaseName, price) => {
        // Find the unit
        const unitIndex = units.findIndex(unit => unit.key === unitKey);
        if (unitIndex === -1) return;

        // Create a copy of units array
        const updatedUnits = [...units];
        const unit = { ...updatedUnits[unitIndex] };

        // Initialize phasePricing if not exists
        if (!unit.phasePricing) {
            unit.phasePricing = [];
        }

        // Find if pricing for this phase already exists
        const phaseIndex = unit.phasePricing.findIndex(p => p.phaseName === phaseName);

        if (phaseIndex !== -1) {
            // Update existing pricing
            unit.phasePricing[phaseIndex].price = price;
        } else {
            // Add new phase pricing
            unit.phasePricing.push({
                phaseName: phaseName,
                price: price,
                active: phaseName === currentPhase
            });
        }

        // Update the unit
        updatedUnits[unitIndex] = unit;
        setUnits(updatedUnits);

        // Update form field
        form.setFieldsValue({
            units: updatedUnits.map(({ key, ...rest }) => rest)
        });
    };

    // Get unit display name
    const getUnitDisplayName = (unit) => {
        if (propertyType === 'land') {
            return `${unit.plotSize} Plot`;
        } else {
            const types = {
                'studio': 'Studio',
                'one_bedroom': 'One Bedroom',
                'two_bedroom': 'Two Bedroom',
                'three_bedroom': 'Three Bedroom',
                'penthouse': 'Penthouse',
                'shops': 'Shops',
                'other': 'Other'
            };
            return types[unit.unitType] || unit.unitType;
        }
    };

    // Get current price for a unit in a phase
    const getUnitPhasePrice = (unit, phaseName) => {
        if (!unit.phasePricing || !Array.isArray(unit.phasePricing)) {
            return 0;
        }

        const phasePrice = unit.phasePricing.find(p => p.phaseName === phaseName);
        return phasePrice ? phasePrice.price : 0;
    };

    // PROPERTY MANAGER FUNCTIONS

    // Handle property manager select change
    const handlePropertyManagerChange = (value) => {
        if (value && value !== 'add_new') {
            setManagerValidationDisabled(true);
        }

        if (value === "add_new") {
            if (userModalActionRef.current) {
                userModalActionRef.current.click();
            }
        }
    };

    // Handle new property manager added
    const handlePropertyManagerAdded = (newManager) => {
        if (onPropertyManagerAdded && newManager) {
            onPropertyManagerAdded(newManager);
            form.setFieldsValue({ propertyManager: newManager._id });
            setManagerValidationDisabled(true);
        }
    };

    // FORM SUBMISSION

    // Handle form submission
    const handleSubmit = () => {
        // Check for units
        if (units.length === 0) {
            setUnitsValidationError(true);
            message.error('Please add at least one unit to the property');
            return;
        }

        // Update form fields with current state
        form.setFieldsValue({
            units: units.map(({ key, ...rest }) => rest),
            phases: phases.map(({ key, ...rest }) => ({
                ...rest,
                startDate: rest.startDate ? rest.startDate.toISOString() : null,
                endDate: rest.endDate ? rest.endDate.toISOString() : null,
                order: rest.order
            })),
            currentPhase: currentPhase
        });

        // Check propertyManager value
        const propertyManagerValue = form.getFieldValue('propertyManager');
        if (propertyManagerValue === "add_new") {
            form.setFieldsValue({ propertyManager: undefined });
        }

        // Call the parent onOk handler
        onOk();
    };

    // Handle disabledDate function for DatePicker to fix date selection issues
    const disabledDate = (current) => {
        // Don't disable any dates - this allows selection of any date
        return false;
    };

    // RENDER FUNCTIONS

    // Render unit form
    const renderUnitForm = () => (
        <div style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
            <h4>{propertyType === 'land' ? 'Add Land Plot' : 'Add Apartment Unit'}</h4>
            <Row gutter={16}>
                {propertyType === 'land' ? (
                    <Col span={12}>
                        <Form.Item label="Plot Size">
                            <Select
                                value={unitDetails.plotSize}
                                onChange={(value) => handleUnitChange('plotSize', value)}
                            >
                                <Option value="50/100">50/100</Option>
                                <Option value="80/100">80/100</Option>
                                <Option value="100/100">100/100 (Full)</Option>
                                <Option value="40/100">40/100</Option>
                                <Option value="60/100">60/100</Option>
                                <Option value="20/100">20/100</Option>
                                <Option value="25/100">25/100</Option>
                                <Option value="75/100">75/100</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                ) : (
                    <Col span={12}>
                        <Form.Item label="Unit Type">
                            <Select
                                value={unitDetails.unitType}
                                onChange={(value) => handleUnitChange('unitType', value)}
                            >
                                <Option value="studio">Studio</Option>
                                <Option value="one_bedroom">One Bedroom</Option>
                                <Option value="two_bedroom">Two Bedroom</Option>
                                <Option value="three_bedroom">Three Bedroom</Option>
                                <Option value="shops">Shops</Option>
                                <Option value="penthouse">Penthouse</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                )}
                <Col span={12}>
                    <Form.Item label="Total Units">
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            value={unitDetails.totalUnits}
                            onChange={(value) => handleUnitChange('totalUnits', value)}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addUnit}
            >
                Add {propertyType === 'land' ? 'Plot' : 'Unit'}
            </Button>
        </div>
    );

    // Render phase form
    const renderPhaseForm = () => (
        <div style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
            <h4>Add New Phase</h4>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Phase Name">
                        <Input
                            placeholder="e.g., Early Bird, Phase 1"
                            value={phaseName}
                            onChange={(e) => setPhaseName(e.target.value)}
                        />
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item label="Start Date">
                        <DatePicker
                            style={{ width: '100%' }}
                            value={phaseStartDate}
                            onChange={(date) => setPhaseStartDate(date)}
                            disabledDate={disabledDate}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item label="End Date (Optional)">
                        <DatePicker
                            style={{ width: '100%' }}
                            value={phaseEndDate}
                            onChange={(date) => setPhaseEndDate(date)}
                            disabledDate={disabledDate}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>
                </Col>
                <Col span={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Form.Item label=" " colon={false}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={addPhase}
                            disabled={!phaseName.trim()}
                        >
                            Add
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
            <label>
                <input
                    type="checkbox"
                    checked={phaseActive}
                    onChange={(e) => setPhaseActive(e.target.checked)}
                    style={{ marginRight: 8 }}
                />
                Make this the active phase
            </label>
        </div>
    );

    // Render phase list with drag-and-drop rows
    const renderPhaseList = () => {
        if (phases.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '10px', color: '#999', fontStyle: 'italic' }}>
                    No phases added yet. Add a phase using the form above.
                </div>
            );
        }

        // Sort phases by order property
        const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

        const columns = [
            {
                title: '',
                dataIndex: 'sort',
                width: 30,
                className: 'drag-visible',
                render: () => <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />,
            },
            {
                title: 'Order',
                key: 'order',
                render: (_, record) => record.order + 1,
                width: 70
            },
            {
                title: 'Phase Name',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => {
                    if (editingPhaseKey === record.key) {
                        return (
                            <Input
                                value={editingPhaseName}
                                onChange={(e) => setEditingPhaseName(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        );
                    }
                    return (
                        <Space>
                            {text}
                            {record.active && <Tag color="green">Active</Tag>}
                            {record.name === currentPhase && <Tag color="blue">Current</Tag>}
                        </Space>
                    );
                }
            },
            {
                title: 'Start Date',
                dataIndex: 'startDate',
                key: 'startDate',
                render: (date, record) => {
                    if (editingPhaseKey === record.key) {
                        return (
                            <DatePicker
                                value={editingPhaseStartDate}
                                onChange={(date) => setEditingPhaseStartDate(date)}
                                style={{ width: '100%' }}
                                disabledDate={disabledDate}
                                format="YYYY-MM-DD"
                            />
                        );
                    }
                    return date ? date.format('YYYY-MM-DD') : 'Not set';
                }
            },
            {
                title: 'End Date',
                dataIndex: 'endDate',
                key: 'endDate',
                render: (date, record) => {
                    if (editingPhaseKey === record.key) {
                        return (
                            <DatePicker
                                value={editingPhaseEndDate}
                                onChange={(date) => setEditingPhaseEndDate(date)}
                                style={{ width: '100%' }}
                                disabledDate={disabledDate}
                                format="YYYY-MM-DD"
                            />
                        );
                    }
                    return date ? date.format('YYYY-MM-DD') : 'Not set';
                }
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => {
                    if (editingPhaseKey === record.key) {
                        return (
                            <Space>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<SaveOutlined />}
                                    onClick={() => savePhaseEdits(record.key)}
                                >
                                    Save
                                </Button>
                                <Button
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={cancelEditingPhase}
                                >
                                    Cancel
                                </Button>
                            </Space>
                        );
                    }

                    return (
                        <Space>
                            <Button
                                size="small"
                                onClick={() => setActivePhase(record.key)}
                                disabled={record.name === currentPhase}
                            >
                                Set Active
                            </Button>
                            <Button
                                size="small"
                                type="default"
                                icon={<EditOutlined />}
                                onClick={() => startEditingPhase(record.key)}
                            />
                            <Popconfirm
                                title="Are you sure you want to delete this phase?"
                                onConfirm={() => deletePhase(record.key)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </Space>
                    );
                }
            }
        ];

        return (
            <div style={{ marginBottom: 16 }}>
                <p style={{ marginBottom: 8 }}>
                    <HolderOutlined /> Drag rows to reorder phases
                </p>
                <Table
                    dataSource={sortedPhases}
                    columns={columns}
                    pagination={false}
                    rowKey={record => record.key}
                    size="small"
                    components={{
                        body: {
                            row: ({ className, style, ...restProps }) => {
                                // Get the index of this row's data
                                const index = sortedPhases.findIndex(item => item.key === restProps['data-row-key']);

                                // Make the row draggable
                                return (
                                    <tr
                                        {...restProps}
                                        className={`${className} draggable-row`}
                                        style={{ ...style, cursor: 'move' }}
                                        draggable
                                        onDragStart={e => {
                                            e.dataTransfer.setData('text/plain', index);
                                        }}
                                        onDragOver={e => {
                                            e.preventDefault();
                                        }}
                                        onDrop={e => {
                                            e.preventDefault();
                                            const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                            if (dragIndex !== index) {
                                                const newData = [...sortedPhases];
                                                const item = newData.splice(dragIndex, 1)[0];
                                                newData.splice(index, 0, item);
                                                handlePhaseRowReorder(newData);
                                            }
                                        }}
                                    />
                                );
                            }
                        }
                    }}
                />
            </div>
        );
    };

    // Render unit pricing table
    const renderUnitPricingTable = () => {
        if (units.length === 0 || phases.length === 0) {
            return null;
        }

        // Sort phases by order property
        const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

        // Create columns: first column for unit name, then one column per phase
        const columns = [
            {
                title: propertyType === 'land' ? 'Plot Type' : 'Unit Type',
                dataIndex: 'unitType',
                key: 'unitType',
                render: (_, record) => getUnitDisplayName(record),
                width: 150,
                fixed: 'left'
            }
        ];

        // Add a column for each phase
        sortedPhases.forEach((phase, index) => {
            columns.push({
                title: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <HolderOutlined style={{ cursor: 'grab', color: '#999', marginRight: 8 }} />
                        {editingPricingPhaseKey === phase.key ? (
                            <Input
                                value={editingPricingPhaseName}
                                onChange={(e) => setEditingPricingPhaseName(e.target.value)}
                                onPressEnter={() => savePricingPhaseEdits(phase.key)}
                                onBlur={() => savePricingPhaseEdits(phase.key)}
                                style={{ width: '80%' }}
                            />
                        ) : (
                            <div onClick={() => startEditingPricingPhase(phase.key, phase.name)} style={{ cursor: 'pointer' }}>
                                {phase.name}
                                {phase.name === currentPhase && <Tag color="blue" style={{ marginLeft: 5 }}>Current</Tag>}
                            </div>
                        )}
                    </div>
                ),
                key: phase.name,
                dataIndex: phase.name,
                render: (_, record) => {
                    const price = getUnitPhasePrice(record, phase.name);

                    return (
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            value={price}
                            onChange={(value) => updateUnitPhasePrice(record.key, phase.name, value)}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="KES"
                        />
                    );
                },
                width: 180,
                onHeaderCell: () => ({
                    draggable: true,
                    onDragStart: (e) => {
                        e.dataTransfer.setData('text/plain', index);
                    },
                    onDragOver: (e) => {
                        e.preventDefault();
                    },
                    onDrop: (e) => {
                        e.preventDefault();
                        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        if (dragIndex !== index) {
                            const newOrder = [...Array(sortedPhases.length).keys()];
                            const item = newOrder.splice(dragIndex, 1)[0];
                            newOrder.splice(index, 0, item);
                            handlePhaseColumnReorder(newOrder);
                        }
                    }
                })
            });
        });

        return (
            <>
                <h4>Unit Prices by Phase</h4>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ fontStyle: 'italic' }}>
                        <HolderOutlined /> Drag to reorder phases. Click on phase name to edit.
                    </span>
                </div>
                <Table
                    columns={columns}
                    dataSource={units}
                    pagination={false}
                    size="small"
                    rowKey={record => record.key}
                    scroll={{ x: 'max-content' }}
                    components={{
                        header: {
                            cell: ({ className, style, ...restProps }) => (
                                <th
                                    {...restProps}
                                    className={`${className} ${restProps.draggable ? 'draggable-header' : ''}`}
                                    style={{ ...style, cursor: restProps.draggable ? 'move' : 'default' }}
                                />
                            )
                        }
                    }}
                />
            </>
        );
    };

    // Render unit list
    const renderUnitList = () => {
        if (units.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '10px', color: '#999', fontStyle: 'italic' }}>
                    No units added yet. Add a unit using the form above.
                </div>
            );
        }

        const columns = [
            {
                title: propertyType === 'land' ? 'Plot Type' : 'Unit Type',
                key: 'unitType',
                render: (_, record) => getUnitDisplayName(record)
            },
            {
                title: propertyType === 'land' ? 'Total Plots' : 'Total Units',
                dataIndex: 'totalUnits',
                key: 'totalUnits'
            },
            {
                title: propertyType === 'land' ? 'Available Plots' : 'Available Units',
                dataIndex: 'availableUnits',
                key: 'availableUnits'
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                    <Popconfirm
                        title="Are you sure you want to delete this unit?"
                        onConfirm={() => removeUnit(record.key)}
                        okText="Yes"
                        cancelText="No"
                        disabled={record._id && isEditMode && (record.totalUnits !== record.availableUnits)}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record._id && isEditMode && (record.totalUnits !== record.availableUnits)}
                        />
                    </Popconfirm>
                )
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={units}
                pagination={false}
                size="small"
                rowKey={record => record.key || record._id}
            />
        );
    };

    return (
        <Modal
            title={isEditMode ? "Edit Property" : "Add New Property"}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            width={1000}
            okText={isEditMode ? "Update Property" : "Add Property"}
        >
            <Form layout="vertical" form={form} initialValues={{ units: [], phases: [] }}>
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
                                    <Select
                                        placeholder="Select property type"
                                        onChange={(value) => setPropertyType(value)}
                                        disabled={isEditMode} // Prevent changing property type when editing
                                    >
                                        <Option value="land">Land</Option>
                                        <Option value="apartment">Apartment</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
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
                            <Col span={8}>
                                <Form.Item
                                    label="Address"
                                    name={['location', 'address']}
                                    rules={[{ required: true, message: 'Please enter the address' }]}
                                >
                                    <Input placeholder="Street address or area" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="County"
                                    name={['location', 'county']}
                                    rules={[{ required: true, message: 'Please enter the county' }]}
                                >
                                    <Input placeholder="County name" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Constituency" name={['location', 'constituency']}
                                    rules={[{ required: true, message: 'Please enter the Constituency' }]}

                                >
                                    <Input placeholder="Constituency name" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Property Manager"
                                    name="propertyManager"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please select a property manager',
                                            validator: (_, value) => {
                                                if (managerValidationDisabled || value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject('Please select a property manager');
                                            }
                                        }
                                    ]}
                                >
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <Select
                                            placeholder="Select a property manager"
                                            onChange={handlePropertyManagerChange}
                                            style={{ flex: 1 }}
                                        >
                                            {propertyManagersData.map(user => (
                                                <Option key={user._id} value={user._id}>{user.name}</Option>
                                            ))}
                                            <Option key="add_new" value="add_new" style={{ color: "blue" }}>
                                                + Add New Property Manager
                                            </Option>
                                        </Select>

                                        {/* Hidden button to be clicked programmatically via ref */}
                                        <div style={{ display: "none" }}>
                                            <AddEditUserModal
                                                actionRef={userModalActionRef}
                                                edit={false}
                                                data={null}
                                                isProfile={false}
                                                onSuccess={handlePropertyManagerAdded}
                                                initialValues={{ role: 'property_manager' }}
                                            />
                                        </div>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="Units & Pricing" key="2">
                        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
                            prevValues.propertyType !== currentValues.propertyType
                        }>
                            {({ getFieldValue }) => {
                                const propertyType = getFieldValue('propertyType');

                                return (
                                    <>
                                        {/* Hidden form fields */}
                                        <Form.Item name="units" hidden><Input /></Form.Item>
                                        <Form.Item name="phases" hidden><Input /></Form.Item>
                                        <Form.Item name="currentPhase" hidden><Input /></Form.Item>

                                        {/* Phase Management Section */}
                                        <div>
                                            <Divider orientation="left">
                                                <Space>
                                                    <TagOutlined />
                                                    Pricing Phases
                                                    {currentPhase && (
                                                        <Tag color="blue">Current Phase: {currentPhase}</Tag>
                                                    )}
                                                </Space>
                                            </Divider>

                                            {renderPhaseForm()}
                                            {renderPhaseList()}
                                        </div>

                                        {/* Unit Management Section */}
                                        <div>
                                            <Divider orientation="left">
                                                {propertyType === 'land' ? 'Land Plots' : 'Property Units'}
                                            </Divider>

                                            {renderUnitForm()}

                                            {/* Units validation error message */}
                                            {unitsValidationError && (
                                                <div style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                                                    Please add at least one {propertyType === 'land' ? 'plot' : 'unit'} to the property
                                                </div>
                                            )}

                                            {renderUnitList()}
                                        </div>

                                        {/* Unit Pricing Matrix Section */}
                                        {phases.length > 0 && units.length > 0 && (
                                            <div>
                                                <Divider orientation="left">Phase Pricing</Divider>
                                                {renderUnitPricingTable()}
                                            </div>
                                        )}
                                    </>
                                );
                            }}
                        </Form.Item>
                    </TabPane>
                </Tabs>
            </Form>
        </Modal>
    );
};

export default AddPropertyModal;