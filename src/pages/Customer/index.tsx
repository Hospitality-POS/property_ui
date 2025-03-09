import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Button, Space, Input, Row, Col, Select, DatePicker, Dropdown, Menu, Form, message
} from 'antd';
import {
    UserOutlined, SearchOutlined, ExportOutlined, FileExcelOutlined,
    PrinterOutlined, DownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { createNewCustomer, fetchAllCustomers, updateCustomer } from '@/services/customer';
import { fetchAllLeads, updateLead } from '@/services/lead';

import { CustomerStatisticsCards } from '../../components/statistics/customerStatistics';
import { CustomersTable } from '../../components/Tables/customerTable';
import { CustomerDetailsDrawer } from '../../components/drawers/customerDetail';
import { CustomerModal } from '../../components/Modals/addCustomer';
import { CommunicationModal } from '../../components/Modals/addCustomerCommunication';
import { NoteModal } from '../../components/Modals/addCustomerNote';
import { DeleteCustomerModal } from '../../components/Modals/deleteCustomer';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CustomerManagement = () => {
    // State for search and filters
    const [searchText, setSearchText] = useState('');
    const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // State for selected customer and drawer
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');

    // State for modals
    const [customerModalVisible, setCustomerModalVisible] = useState(false);
    const [customerModalMode, setCustomerModalMode] = useState('create'); // 'create' or 'edit'
    const [communicationModalVisible, setCommunicationModalVisible] = useState(false);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    // State for leads conversion
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);

    // Form instances
    const [customerForm] = Form.useForm();
    const [communicationForm] = Form.useForm();
    const [noteForm] = Form.useForm();

    // Refresh state
    const [refreshKey, setRefreshKey] = useState(0);

    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD MMM YYYY');
    };

    // Fetch customers data
    const { data: customersData = [], isLoading: isLoadingCustomers, refetch: refetchCustomers } = useQuery({
        queryKey: ['customer', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllCustomers();
                console.log('customers fetched successfully:', response);

                // Process data to use createdAt as dateJoined
                const processedData = Array.isArray(response.data)
                    ? response.data.map(customer => ({
                        ...customer,
                        dateJoined: formatDate(customer.createdAt) || customer.dateJoined,
                    }))
                    : [];

                return processedData;
            } catch (error) {
                message.error('Failed to fetch customers');
                console.error('Error fetching customers:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Fetch leads for the convert lead modal
    const fetchLeads = async () => {
        try {
            const response = await fetchAllLeads();
            console.log('nice data', response);
            // Filter out leads that are already converted
            const availableLeads = response.data.filter(lead => !lead.convertedToCustomer);
            setLeads(availableLeads);
        } catch (error) {
            console.error('Error fetching leads:', error);
            message.error('Failed to fetch leads');
        }
    };

    // Handle opening the convert lead modal
    const handleOpenConvertLeadModal = () => {
        fetchLeads();
        setCustomerModalMode('create');
        customerForm.resetFields();
        setCustomerModalVisible(true);
    };

    // Handle lead selection in convert modal
    const handleLeadSelect = (leadId) => {
        const lead = leads.find(lead => lead._id === leadId);
        setSelectedLead(lead);

        // Populate form with lead data
        if (lead) {
            customerForm.setFieldsValue({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                customerType: lead.name.includes('Ltd') || lead.name.includes('Limited') ? 'company' : 'individual',
                county: lead.interestAreas && lead.interestAreas.length > 0 ? lead.interestAreas[0].county : '',
                company: lead.name.includes('Ltd') || lead.name.includes('Limited') ? lead.name : '',
            });
        }
    };

    // Handle customer form submission
    const handleCustomerSubmit = async () => {
        try {
            const values = await customerForm.validateFields();

            if (customerModalMode === 'create') {
                // Create mode (convert lead)
                if (!selectedLead) {
                    message.error('Please select a lead to convert');
                    return;
                }

                // Create a new customer object from the lead and form data
                const newCustomer = {
                    lead: selectedLead._id, // Reference to the original lead
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    verifiedPhone: false,
                    alternatePhone: values.alternatePhone || '',
                    idNumber: values.idNumber,
                    idDocument: {
                        url: values.idDocumentUrl || '',
                        uploadedAt: new Date().toISOString(),
                    },
                    address: {
                        street: values.streetAddress || '',
                        city: values.city || '',
                        county: values.county || (selectedLead.interestAreas && selectedLead.interestAreas.length > 0 ? selectedLead.interestAreas[0].county : ''),
                        postalCode: values.postalCode || '',
                        country: 'Kenya',
                    },
                    occupation: values.occupation || '',
                    company: values.company || '',
                    customerType: values.customerType || 'individual',
                    preferences: {
                        propertyTypes: values.propertyTypes || [],
                        locations: values.locations || [],
                        budgetRange: {
                            min: values.budgetRange?.min || 0,
                            max: values.budgetRange?.max || 0
                        },
                        amenities: values.amenities || [],
                        otherRequirements: values.notes || '',
                    },
                    documents: [],
                    notes: [
                        {
                            content: `Converted from lead ${selectedLead._id}. ${values.notes || ''}`,
                            addedAt: new Date().toISOString(),
                        }
                    ],
                    communications: selectedLead.communications || [],
                    leadSource: selectedLead._id,
                };

                // Transfer property interests from lead to customer
                if (selectedLead.interestAreas && selectedLead.interestAreas.length > 0) {
                    // Extract property types
                    selectedLead.interestAreas.forEach(area => {
                        if (area.propertyType === 'both') {
                            if (!newCustomer.preferences.propertyTypes.includes('apartment')) {
                                newCustomer.preferences.propertyTypes.push('apartment');
                            }
                            if (!newCustomer.preferences.propertyTypes.includes('land')) {
                                newCustomer.preferences.propertyTypes.push('land');
                            }
                        } else if (!newCustomer.preferences.propertyTypes.includes(area.propertyType)) {
                            newCustomer.preferences.propertyTypes.push(area.propertyType);
                        }

                        // Extract locations (counties)
                        if (area.county && !newCustomer.preferences.locations.includes(area.county)) {
                            newCustomer.preferences.locations.push(area.county);
                        }

                        // Set budget range based on the highest values from interest areas
                        if (area.budget) {
                            if (area.budget.min < newCustomer.preferences.budgetRange.min || newCustomer.preferences.budgetRange.min === 0) {
                                newCustomer.preferences.budgetRange.min = area.budget.min;
                            }
                            if (area.budget.max > newCustomer.preferences.budgetRange.max) {
                                newCustomer.preferences.budgetRange.max = area.budget.max;
                            }
                        }
                    });
                }

                createNewCustomer(newCustomer)
                    .then(async newCustomer => {
                        await updateLead(selectedLead._id, {
                            convertedToCustomer: true,
                            customer: newCustomer._id,
                            status: 'converted',
                        });

                        setTimeout(() => {
                            setRefreshKey(prevKey => prevKey + 1);
                            refetchCustomers({ force: true });
                        }, 500);

                        // Show success message and close modal
                        message.success(`Lead ${selectedLead.name} successfully converted to customer!`);
                        setCustomerModalVisible(false);
                        customerForm.resetFields();
                        setSelectedLead(null);
                    })
                    .catch(error => {
                        console.error('Error adding customer:', error);
                        message.error('Failed to add customer. Please try again.');
                    });
            } else {
                // Edit mode
                // Create updated customer object
                const updatedCustomer = {
                    ...selectedCustomer,
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    alternatePhone: values.alternatePhone || '',
                    idNumber: values.idNumber,
                    company: values.company || '',
                    occupation: values.occupation || '',
                    customerType: values.customerType,
                    address: {
                        street: values.streetAddress || '',
                        city: values.city || '',
                        county: values.county || '',
                        postalCode: values.postalCode || '',
                        country: 'Kenya',
                    },
                    preferences: {
                        propertyTypes: values.propertyTypes || [],
                        locations: values.locations || [],
                        amenities: values.amenities || [],
                        budgetRange: {
                            min: values.budgetRange?.min || 0,
                            max: values.budgetRange?.max || 0
                        },
                        otherRequirements: values.notes || ''
                    }
                };

                // Call API to update the customer
                await updateCustomer(selectedCustomer._id, updatedCustomer);
                console.log('Customer updated:', updatedCustomer);

                // Update the local state
                setRefreshKey(prevKey => prevKey + 1);
                refetchCustomers({ force: true });

                // Show success message
                message.success(`Customer ${values.name} updated successfully!`);

                // Close the modal
                setCustomerModalVisible(false);
            }
        } catch (error) {
            console.error('Error processing customer:', error);
            message.error(`Failed to ${customerModalMode === 'create' ? 'create' : 'update'} customer`);
        }
    };

    // Handle view customer
    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        setDrawerVisible(true);
    };

    // Handle edit customer
    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerModalMode('edit');

        // Populate the form with the customer data
        customerForm.setFieldsValue({
            // For create mode (leadId)
            leadId: null,

            // Personal information
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            alternatePhone: customer.alternatePhone || '',
            idNumber: customer.idNumber,
            company: customer.company || '',
            occupation: customer.occupation || '',
            customerType: customer.customerType,

            // Address information
            streetAddress: customer.address.street || '',
            city: customer.address.city || '',
            county: customer.address.county || '',
            postalCode: customer.address.postalCode || '',

            // Preferences
            propertyTypes: customer.preferences.propertyTypes || [],
            locations: customer.preferences.locations || [],
            amenities: customer.preferences.amenities || [],
            budgetRange: {
                min: customer.preferences.budgetRange.min,
                max: customer.preferences.budgetRange.max
            },
            notes: customer.preferences.otherRequirements || ''
        });

        // Show the modal
        setCustomerModalVisible(true);
    };

    // Handle add communication
    const handleAddCommunication = (customer) => {
        setSelectedCustomer(customer);
        setCommunicationModalVisible(true);
    };

    // Handle add note
    const handleAddNote = (customer) => {
        setSelectedCustomer(customer);
        setNoteModalVisible(true);
    };

    // Handle save communication
    const handleSaveCommunication = async () => {
        try {
            const values = await communicationForm.validateFields();
            console.log('nice values', values);
            // Create the new communication entry
            const newCommunication = {
                type: values.type,
                date: values.date.format('YYYY-MM-DD HH:mm:ss'),
                summary: values.summary,
                outcome: values.outcome || '',
                nextAction: values.nextAction || '',
                addedAt: new Date().toISOString()
            };

            // Create updated customer with new communication added
            const updatedCustomer = {
                ...selectedCustomer,
                communications: [
                    newCommunication,
                    ...(selectedCustomer.communications || [])
                ]
            };

            await updateCustomer(selectedCustomer._id, updatedCustomer);

            // Update the local state
            setRefreshKey(prevKey => prevKey + 1);
            refetchCustomers({ force: true });

            // If the customer details drawer is open, update the selected customer
            if (drawerVisible) {
                setSelectedCustomer(updatedCustomer);
            }

            // Show success message
            message.success('Communication logged successfully!');

            // Close the modal
            setCommunicationModalVisible(false);
        } catch (error) {
            console.error('Error adding communication:', error);
            message.error('Failed to log communication');
        }
    };

    // Handle save note
    const handleSaveNote = async () => {
        try {
            const values = await noteForm.validateFields();

            // Create the new note entry
            const newNote = {
                content: values.content,
                addedAt: new Date().toISOString()
            };

            // Create updated customer with new note added
            const updatedCustomer = {
                ...selectedCustomer,
                notes: [
                    newNote,
                    ...(selectedCustomer.notes || [])
                ]
            };

            await updateCustomer(selectedCustomer._id, updatedCustomer);

            // Update the local state
            setRefreshKey(prevKey => prevKey + 1);
            refetchCustomers({ force: true });

            // If the customer details drawer is open, update the selected customer
            if (drawerVisible) {
                setSelectedCustomer(updatedCustomer);
            }

            // Show success message
            message.success('Note added successfully!');

            // Close the modal
            setNoteModalVisible(false);
        } catch (error) {
            console.error('Error adding note:', error);
            message.error('Failed to add note');
        }
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (customer) => {
        setCustomerToDelete(customer);
        setDeleteModalVisible(true);
    };

    // Handle delete customer
    const handleDeleteCustomer = () => {
        // In a real app, this would call an API to delete the customer
        console.log('Delete customer:', customerToDelete);
        setDeleteModalVisible(false);
        setCustomerToDelete(null);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Calculate customer statistics
    const getTotalCustomers = () => {
        return customersData.length;
    };

    const getIndividualCustomersCount = () => {
        return customersData.filter(
            (customer) => customer.customerType === 'individual'
        ).length;
    };

    const getCompanyCustomersCount = () => {
        return customersData.filter(
            (customer) => customer.customerType === 'company'
        ).length;
    };

    const getTotalPurchases = () => {
        return customersData.reduce(
            (total, customer) => total + customer.purchases,
            0
        );
    };

    // Filter customers based on search text and filters
    const filteredCustomers = customersData.filter((customer) => {
        const matchesSearch =
            customer._id.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.phone.includes(searchText);

        const matchesType =
            customerTypeFilter === 'all' ||
            customer.customerType === customerTypeFilter;

        let matchesDateRange = true;
        if (dateRange && dateRange[0] && dateRange[1]) {
            const createdDate = new Date(customer.createdAt);
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);
            matchesDateRange = createdDate >= startDate && createdDate <= endDate;
        }

        return matchesSearch && matchesType && matchesDateRange;
    });

    return (
        <>
            <Space className="mb-4" size="large">
                <Space>
                    <Button
                        type="primary"
                        icon={<UserOutlined />}
                        onClick={() => handleOpenConvertLeadModal()}
                    >
                        Create New Customer
                    </Button>
                </Space>
            </Space>

            {/* Customer Statistics Cards */}
            <CustomerStatisticsCards
                totalCustomers={getTotalCustomers()}
                individualCustomers={getIndividualCustomersCount()}
                companyCustomers={getCompanyCustomersCount()}
                totalPurchases={getTotalPurchases()}
            />

            {/* Search and Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={24} md={6}>
                    <Input
                        placeholder="Search by ID, name, email or phone..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={8} md={5}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter by Type"
                        defaultValue="all"
                        onChange={(value) => setCustomerTypeFilter(value)}
                    >
                        <Option value="all">All Types</Option>
                        <Option value="individual">Individual</Option>
                        <Option value="company">Company</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={8} md={5}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter by Property Interest"
                        defaultValue="all"
                    >
                        <Option value="all">All Properties</Option>
                        <Option value="apartment">Apartment</Option>
                        <Option value="land">Land</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={8} md={6}>
                    <RangePicker
                        style={{ width: '100%' }}
                        placeholder={['Start Date', 'End Date']}
                        onChange={handleDateRangeChange}
                    />
                </Col>
                <Col xs={24} sm={24} md={2}>
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="1" icon={<FileExcelOutlined />}>
                                    Export to Excel
                                </Menu.Item>
                                <Menu.Item key="2" icon={<PrinterOutlined />}>
                                    Print Report
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <Button style={{ width: '100%' }}>
                            <ExportOutlined /> Export <DownOutlined />
                        </Button>
                    </Dropdown>
                </Col>
            </Row>

            {/* Customers Table */}
            <CustomersTable
                customers={filteredCustomers}
                onView={handleViewCustomer}
                onContact={handleAddCommunication}
                onEdit={handleEditCustomer}
                onDelete={showDeleteConfirm}
                formatDate={formatDate}
            />

            {/* Customer Details Drawer */}
            <CustomerDetailsDrawer
                visible={drawerVisible}
                customer={selectedCustomer}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={() => setDrawerVisible(false)}
                onAddCommunication={handleAddCommunication}
                onAddNote={handleAddNote}
                formatDate={formatDate}
            />

            {/* Create/Edit Customer Modal */}
            <CustomerModal
                visible={customerModalVisible}
                mode={customerModalMode}
                form={customerForm}
                leads={leads}
                onLeadSelect={handleLeadSelect}
                onOk={handleCustomerSubmit}
                onCancel={() => {
                    setCustomerModalVisible(false);
                    customerForm.resetFields();
                    setSelectedLead(null);
                }}
            />

            {/* Communication Modal */}
            <CommunicationModal
                visible={communicationModalVisible}
                form={communicationForm}
                onOk={handleSaveCommunication}
                onCancel={() => setCommunicationModalVisible(false)}
            />

            {/* Add Note Modal */}
            <NoteModal
                visible={noteModalVisible}
                form={noteForm}
                onOk={handleSaveNote}
                onCancel={() => setNoteModalVisible(false)}
            />

            {/* Delete Confirmation Modal */}
            <DeleteCustomerModal
                visible={deleteModalVisible}
                customer={customerToDelete}
                onDelete={handleDeleteCustomer}
                onCancel={() => setDeleteModalVisible(false)}
            />
        </>
    );
};

export default CustomerManagement;