import React, { useState, useEffect } from 'react';
import { Form, Spin, Typography, Card, message, Modal, Select, InputNumber, DatePicker } from 'antd';
import { useLocation, history } from '@umijs/max';

// Import API services
import { fetchAllUsers } from '@/services/auth.api';
import { fetchAllProperties } from '@/services/property';
import { fetchAllCustomers } from '@/services/customer';
import { fetchAllLeads } from '@/services/lead';
import { fetchAllSales } from '@/services/sales';

// Import all form components
import AddPropertyModal from "../../components/Modals/addProperty";
import AddLeadModal from "../../components/Modals/addLead";
import CustomerModal from "../../components/Modals/addCustomer";
import AddUserModal from "@/pages/Users/components/modal/AddUserModal";
import AddSaleModal from "../../components/Modals/addSales";
import AddValuationModal from "../../components/Modals/addValuation";
import PaymentModal from "../../components/Modals/addPayment";

const { Title } = Typography;
const { Option } = Select;

const QuickPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const formType = queryParams.get('form');

    // Get the returnUrl from the query params if available
    const returnUrl = queryParams.get('returnUrl') || '/dashboard';

    const [propertiesForm] = Form.useForm();
    const [leadsForm] = Form.useForm();
    const [customersForm] = Form.useForm();
    const [usersForm] = Form.useForm();
    const [salesForm] = Form.useForm();
    const [valuationsForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const [loading, setLoading] = useState(true);

    // State for data needed by modals
    const [userData, setUserData] = useState([]);
    const [propertiesData, setPropertiesData] = useState([]);
    const [customersData, setCustomersData] = useState([]);
    const [leadsData, setLeadsData] = useState([]);
    const [salesData, setSalesData] = useState([]);

    // Fetch the necessary data based on form type
    useEffect(() => {
        const fetchFormData = async () => {
            setLoading(true);
            try {
                // Fetch data based on form type
                if (formType === 'property') {
                    const userResponse = await fetchAllUsers();
                    setUserData(processUserData(userResponse));
                }
                else if (formType === 'lead') {
                    const userResponse = await fetchAllUsers();
                    setUserData(processUserData(userResponse));
                }
                else if (formType === 'customer') {
                    const leadsResponse = await fetchAllLeads();
                    setLeadsData(Array.isArray(leadsResponse.data) ? leadsResponse.data : []);
                }
                else if (formType === 'sale') {
                    const [userResponse, propertiesResponse, customersResponse] = await Promise.all([
                        fetchAllUsers(),
                        fetchAllProperties(),
                        fetchAllCustomers()
                    ]);
                    setUserData(processUserData(userResponse));
                    setPropertiesData(Array.isArray(propertiesResponse.data) ? propertiesResponse.data : []);
                    setCustomersData(Array.isArray(customersResponse.data) ? customersResponse.data : []);
                }
                else if (formType === 'payment') {
                    const [userResponse, salesResponse, customersResponse] = await Promise.all([
                        fetchAllUsers(),
                        fetchAllSales(),
                        fetchAllCustomers()
                    ]);
                    setUserData(processUserData(userResponse));
                    setSalesData(Array.isArray(salesResponse.data) ? salesResponse.data : []);
                    setCustomersData(Array.isArray(customersResponse.data) ? customersResponse.data : []);
                }
                else if (formType === 'valuation') {
                    const [userResponse, propertiesResponse, customersResponse] = await Promise.all([
                        fetchAllUsers(),
                        fetchAllProperties(),
                        fetchAllCustomers()
                    ]);
                    setUserData(processUserData(userResponse));
                    setPropertiesData(Array.isArray(propertiesResponse.data) ? propertiesResponse.data : []);
                    setCustomersData(Array.isArray(customersResponse.data) ? customersResponse.data : []);
                }
            } catch (error) {
                console.error("Error fetching data for form:", error);
                message.error("Failed to load data for the form");
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [formType]);

    // Process user data to extract agents, property managers, and valuers
    const processUserData = (response) => {
        let usersArray = [];

        // Handle different possible response structures
        if (response?.data && Array.isArray(response.data)) {
            usersArray = response.data;
        } else if (Array.isArray(response)) {
            usersArray = response;
        } else if (response?.users && Array.isArray(response.users)) {
            usersArray = response.users;
        } else {
            console.error('Unexpected users API response structure:', response);
            return [];
        }

        // Map the users with a defensive approach
        return usersArray.map(user => ({
            ...user,
            _id: user._id || user.id || `temp-${Date.now()}-${Math.random()}`,
            role: user.role || user.userRole || 'unknown'
        }));
    };

    // Filter users for different roles
    const getPropertyManagersData = () => {
        return userData.filter(user =>
            user.role === 'property_manager' ||
            user.role === 'manager' ||
            user.role?.toLowerCase().includes('manager')
        );
    };

    const getAgentsData = () => {
        return userData.filter(user =>
            user.role === 'sales_agent' ||
            user.role === 'agent' ||
            user.role?.toLowerCase().includes('agent')
        );
    };

    const getValuersData = () => {
        return userData.filter(user =>
            user.role === 'valuer' ||
            user.role?.toLowerCase().includes('valuer') ||
            user.role?.toLowerCase().includes('appraiser')
        );
    };

    // Form submission handler
    const handleFormSubmit = async (values) => {
        console.log(`${formType} form values:`, values);

        try {
            // Call the appropriate API service based on form type
            let response;

            switch (formType) {
                case 'property':
                    const { createNewProperty } = await import('@/services/property');
                    response = await createNewProperty(values);
                    break;

                case 'lead':
                    const { createNewLead } = await import('@/services/lead');
                    response = await createNewLead(values);
                    break;

                case 'customer':
                    const { createNewCustomer } = await import('@/services/customer');
                    response = await createNewCustomer(values);
                    break;

                case 'user':
                    // Handle user creation - this may use a different pattern
                    // Get the function reference from the modal via onSuccess
                    return; // Let the modal handle submission via onSuccess

                case 'sale':
                    const { createNewSale } = await import('@/services/sales');
                    response = await createNewSale(values);
                    break;

                case 'payment':
                    const { createNewPayment } = await import('@/services/payments');
                    response = await createNewPayment(values);
                    break;

                case 'valuation':
                    const { createNewValuation } = await import('@/services/valuation');
                    response = await createNewValuation(values);
                    break;

                default:
                    console.error("Unknown form type:", formType);
                    return;
            }

            // Show success message
            message.success(`${formType.charAt(0).toUpperCase() + formType.slice(1)} created successfully!`);

            console.log("API Response:", response);

            // After successful submission, navigate back with a slight delay
            setTimeout(() => handleCancel(), 500);

        } catch (error) {
            console.error(`Error submitting ${formType} form:`, error);
            message.error(`Failed to create ${formType}. Please try again.`);
        }
    };

    // Cancel handler to navigate back
    const handleCancel = () => {
        // Navigate to the return URL from the query parameters
        console.log("Navigating to:", returnUrl);
        history.push(returnUrl);
    };

    // Handle newly added user - for example, a property manager or agent
    const handleUserAdded = (newUser) => {
        setUserData(prevUsers => {
            // Check if user already exists
            const userExists = prevUsers.some(
                user => user._id === newUser._id || user.email === newUser.email
            );

            if (userExists) {
                // Replace existing user
                return prevUsers.map(user =>
                    (user._id === newUser._id || user.email === newUser.email) ? newUser : user
                );
            } else {
                // Add new user
                return [...prevUsers, newUser];
            }
        });
    };

    // Render the appropriate form based on the formType from URL
    const renderForm = () => {
        if (loading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <Spin size="large" />
                </div>
            );
        }

        // Style to make modals look like pages
        const pageStyle = {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '24px'
        };

        // Prepare data for modals based on form type
        switch (formType) {
            case 'property':
                const propertyManagersData = getPropertyManagersData();
                return (
                    <Card title="Add Property" style={pageStyle}>
                        <AddPropertyModal
                            visible={true}
                            isEditMode={false}
                            form={propertiesForm}
                            onOk={() => handleFormSubmit(propertiesForm.getFieldsValue())}
                            onCancel={handleCancel}
                            propertyManagersData={propertyManagersData}
                            onPropertyManagerAdded={handleUserAdded}
                            isLoading={false}
                        />
                    </Card>
                );
            case 'lead':
                const agentsData = getAgentsData();
                return (
                    <Card title="Add Lead" style={pageStyle}>
                        <AddLeadModal
                            visible={true}
                            isEditMode={false}
                            form={leadsForm}
                            onOk={() => handleFormSubmit(leadsForm.getFieldsValue())}
                            onCancel={handleCancel}
                            agentsData={agentsData}
                            isLoading={false}
                            onAgentAdded={handleUserAdded}
                        />
                    </Card>
                );
            case 'customer':
                return (
                    <Card title="Add Customer" style={pageStyle}>
                        <CustomerModal
                            visible={true}
                            mode="create"
                            form={customersForm}
                            onOk={() => handleFormSubmit(customersForm.getFieldsValue())}
                            onCancel={handleCancel}
                            leads={leadsData}
                            onLeadSelect={() => { }}
                        />
                    </Card>
                );
            case 'user':
                return (
                    <Card title="Add User" style={pageStyle}>
                        <AddUserModal
                            visible={true}
                            edit={false}
                            form={usersForm}
                            data={null}
                            onSuccess={(values) => {
                                console.log("User form submitted with values:", values);
                                // The AddUserModal likely handles the API call internally
                                // Just show success message and redirect
                                message.success('User created successfully!');
                                setTimeout(() => handleCancel(), 800); // Wait for message before returning to previous page
                            }}
                            onCancel={handleCancel}
                        />
                    </Card>
                );
            case 'sale':
                const salesAgentsData = getAgentsData();
                const salesManagersData = getPropertyManagersData();
                return (
                    <Card title="Add Sale" style={pageStyle}>
                        <AddSaleModal
                            visible={true}
                            isEditMode={false}
                            form={salesForm}
                            onOk={() => handleFormSubmit(salesForm.getFieldsValue())}
                            onCancel={handleCancel}
                            propertiesData={propertiesData}
                            customersData={customersData}
                            agentsData={salesAgentsData}
                            managersData={salesManagersData}
                            isLoadingProperties={false}
                            isLoadingCustomers={false}
                            isLoadingAgents={false}
                            isLoadingManagers={false}
                            installments={[]}
                            setInstallments={() => { }}
                            onAddInstallment={() => { }}
                            onRemoveInstallment={() => { }}
                            onInstallmentChange={() => { }}
                            formatCurrency={(val) => `KES ${val?.toLocaleString() || '0'}`}
                            formatDate={(date) => date}
                            onAgentAdded={handleUserAdded}
                            onPropertyManagerAdded={handleUserAdded}
                        />
                    </Card>
                );
            case 'payment':
                return (
                    <Card title="Make Payment" style={pageStyle}>
                        <PaymentModal
                            visible={true}
                            form={paymentForm}
                            onOk={() => handleFormSubmit(paymentForm.getFieldsValue())}
                            onCancel={handleCancel}
                            salesData={salesData}
                            customersData={customersData}
                            formatCurrency={(val) => `KES ${val?.toLocaleString() || '0'}`}
                        />
                    </Card>
                );
            case 'valuation':
                const valuersData = getValuersData();
                return (
                    <Card title="Add Valuation" style={pageStyle}>
                        <AddValuationModal
                            visible={true}
                            isEditMode={false}
                            form={valuationsForm}
                            onOk={() => handleFormSubmit(valuationsForm.getFieldsValue())}
                            onCancel={handleCancel}
                            propertiesData={propertiesData}
                            customersData={customersData}
                            valuersData={valuersData}
                            isLoadingCustomers={false}
                            isLoadingProperties={false}
                            isLoadingUsers={false}
                            formatCurrency={(val) => `KES ${val?.toLocaleString() || '0'}`}
                            onValuerAdded={handleUserAdded}
                        />
                    </Card>
                );
            default:
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Please select a form from the Create menu</Title>
                    </div>
                );
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            {renderForm()}
        </div>
    );
};
export default QuickPage;