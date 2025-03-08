import {
    BankOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    DollarOutlined,
    DownOutlined,
    EditOutlined,
    EnvironmentOutlined,
    ExportOutlined,
    FileDoneOutlined,
    FileExcelOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    HomeOutlined,
    MailOutlined,
    PhoneOutlined,
    PlusOutlined,
    PrinterOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
    IdcardOutlined,
    CommentOutlined,
    MessageOutlined,
    ShoppingOutlined,
    BellOutlined,
    CreditCardOutlined,
    CrownOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Drawer,
    Dropdown,
    Empty,
    Form,
    Input,
    InputNumber,
    Layout,
    List,
    Menu,
    message,
    Modal,
    Rate,
    Row,
    Select,
    Space,
    Statistic,
    Steps,
    Table,
    Tabs,
    Tag,
    Timeline,
    Tooltip,
    Typography,
    Upload,
    Badge,
} from 'antd';
import { useState } from 'react';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
import { createNewCustomer, fetchAllCustomers, updateCustomer } from '@/services/customer';
import { fetchAllLeads, updateLead } from '@/services/lead';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';




const CustomerManagement = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [addCustomerVisible, setAddCustomerVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [communicationModalVisible, setCommunicationModalVisible] = useState(false);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [convertLeadVisible, setConvertLeadVisible] = useState(false);
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [convertForm] = Form.useForm();
    const [refreshKey, setRefreshKey] = useState(0);
    const [customerModalVisible, setCustomerModalVisible] = useState(false);
    const [customerModalMode, setCustomerModalMode] = useState('create'); // 'create' or 'edit'
    const [customerForm] = Form.useForm();
    const [communicationForm] = Form.useForm();
    const [noteForm] = Form.useForm();




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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD MMM YYYY');
    };

    const { data: customersData = [], isLoading: isLoadingCustomers, refetch: refetchCustomers } = useQuery({
        queryKey: ['customer'], // Adding refreshKey to queryKey
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
                message.error('Failed to fetch lead');
                console.error('Error fetching lead:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

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

    // Handle convert lead form submission


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

                // In a real app, you would call an API to update the customer
                // For example: 
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


    // Table columns for customers list
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 120,
            render: (text, record) => (
                <a onClick={() => handleViewCustomer(record)}>{text}</a>
            ),
            sorter: (a, b) => a._id.localeCompare(b._id),
        },
        {
            title: 'Contact Information',
            dataIndex: 'email',
            key: 'contact',
            width: 220,
            render: (email, record) => (
                <span>
                    <div>{email}</div>
                    <div>
                        {record.phone}{' '}
                        {record.verifiedPhone && (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        )}
                    </div>
                </span>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'customerType',
            key: 'customerType',
            width: 120,
            render: (type) => (
                <Tag color={type === 'individual' ? 'blue' : 'purple'}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Tag>
            ),
            filters: [
                { text: 'Individual', value: 'individual' },
                { text: 'Company', value: 'company' },
            ],
            onFilter: (value, record) => record.customerType === value,
        },
        {
            title: 'Location',
            dataIndex: ['address', 'city'],
            key: 'city',
            width: 120,
            render: (city, record) => (
                <span>{city}, {record.address.county}</span>
            ),
        },
        {
            title: 'Property Interests',
            dataIndex: ['preferences', 'propertyTypes'],
            key: 'propertyTypes',
            width: 150,
            render: (types) => (
                <span>
                    {types.map(type => (
                        <Tag key={type} color={type === 'apartment' ? 'green' : 'orange'}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Tag>
                    ))}
                </span>
            ),
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Land', value: 'land' },
            ],
            onFilter: (value, record) => record.preferences.propertyTypes.includes(value),
        },
        {
            title: 'Budget Range (KES)',
            dataIndex: ['preferences', 'budgetRange'],
            key: 'budgetRange',
            width: 180,
            render: (budget) => (
                <span>
                    {budget.min.toLocaleString()} - {budget.max.toLocaleString()}
                </span>
            ),
            sorter: (a, b) => a.preferences.budgetRange.max - b.preferences.budgetRange.max,
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Last Contact',
            key: 'lastContact',
            width: 120,
            render: (_, record) => {
                if (record.communications && record.communications.length > 0) {
                    const sortedComms = [...record.communications].sort(
                        (a, b) => new Date(b.date) - new Date(a.date)
                    );
                    return sortedComms[0].date;
                }
                return <Text type="secondary">No contact</Text>;
            },
            sorter: (a, b) => {
                const aDate = a.communications && a.communications.length > 0
                    ? new Date(a.communications.sort((x, y) => new Date(y.date) - new Date(x.date))[0].date)
                    : new Date(0);
                const bDate = b.communications && b.communications.length > 0
                    ? new Date(b.communications.sort((x, y) => new Date(y.date) - new Date(x.date))[0].date)
                    : new Date(0);
                return bDate - aDate;
            },
        },
        {
            title: 'Purchases',
            dataIndex: 'purchases',
            key: 'purchases',
            width: 100,
            render: (count) => (
                <Badge count={count} showZero style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }} />
            ),
            sorter: (a, b) => a.purchases - b.purchases,
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 130,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<FileSearchOutlined />}
                            size="small"
                            onClick={() => handleViewCustomer(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Quick Contact">
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item
                                        key="1"
                                        icon={<PhoneOutlined />}
                                        onClick={() => window.open(`tel:${record.phone}`)}
                                    >
                                        Call
                                    </Menu.Item>
                                    <Menu.Item
                                        key="2"
                                        icon={<MailOutlined />}
                                        onClick={() => window.open(`mailto:${record.email}`)}
                                    >
                                        Email
                                    </Menu.Item>
                                    <Menu.Item
                                        key="3"
                                        icon={<MessageOutlined />}
                                        onClick={() => handleAddCommunication(record)}
                                    >
                                        Log Communication
                                    </Menu.Item>
                                </Menu>
                            }
                            trigger={['click']}
                        >
                            <Button
                                icon={<MessageOutlined />}
                                size="small"
                            />
                        </Dropdown>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditCustomer(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handle view customer
    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        setDrawerVisible(true);
    };

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

    // New function to save note
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
    }


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
            {/* Convert Lead to Customer Modal */}
            <Modal
                title={customerModalMode === 'create' ? "Convert Lead to Customer" : "Edit Customer"}
                open={customerModalVisible}
                onCancel={() => {
                    setCustomerModalVisible(false);
                    customerForm.resetFields();
                    setSelectedLead(null);
                }}
                onOk={handleCustomerSubmit}
                okText={customerModalMode === 'create' ? "Convert Lead" : "Save Changes"}
                width={1000}
            >
                <Form layout="vertical" form={customerForm}>
                    {customerModalMode === 'create' && (
                        <Form.Item
                            label="Select Lead"
                            name="leadId"
                            rules={[{ required: true, message: 'Please select a lead to convert' }]}
                        >
                            <Select
                                placeholder="Select a lead to convert"
                                onChange={handleLeadSelect}
                                loading={leads.length === 0}
                                showSearch
                                optionFilterProp="children"
                            >
                                {leads.map(lead => (
                                    <Option key={lead._id} value={lead._id}>
                                        {lead.name} - {lead.phone} - {lead.status}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    {(customerModalMode === 'edit' || selectedLead) && (
                        <Tabs defaultActiveKey="personalInfo">
                            <Tabs.TabPane tab="Personal Information" key="personalInfo">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Customer Type"
                                            name="customerType"
                                            initialValue="individual"
                                            rules={[{ required: true, message: 'Please select customer type' }]}
                                        >
                                            <Select>
                                                <Option value="individual">Individual</Option>
                                                <Option value="company">Company</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Full Name"
                                            name="name"
                                            rules={[{ required: true, message: 'Please enter customer name' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[{
                                                type: 'email',
                                                message: 'Please enter a valid email'
                                            }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Phone"
                                            name="phone"
                                            rules={[
                                                { required: true, message: 'Please enter phone number' },
                                                {
                                                    pattern: /^\+?[0-9]{10,15}$/,
                                                    message: 'Please enter a valid phone number'
                                                }
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="ID Number"
                                            name="idNumber"
                                            rules={[{ required: true, message: 'Please enter ID number' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Alternate Phone"
                                            name="alternatePhone"
                                            rules={[{
                                                pattern: /^\+?[0-9]{10,15}$/,
                                                message: 'Please enter a valid phone number',
                                                validateTrigger: 'onChange'
                                            }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Street Address"
                                            name="streetAddress"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="City"
                                            name="city"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="County"
                                            name="county"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Postal Code"
                                            name="postalCode"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Occupation"
                                            name="occupation"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Company"
                                            name="company"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {customerModalMode === 'create' && (
                                    <Form.Item
                                        label="ID Document Upload"
                                        name="idDocumentUpload"
                                    >
                                        <Upload
                                            name="idDocument"
                                            listType="picture"
                                            maxCount={1}
                                            beforeUpload={() => false} // Prevent automatic upload
                                        >
                                            <Button icon={<UploadOutlined />}>Upload ID Document</Button>
                                        </Upload>
                                    </Form.Item>
                                )}
                            </Tabs.TabPane>

                            <Tabs.TabPane tab="Property Preferences" key="propertyPreferences">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Property Types"
                                            name="propertyTypes"
                                            rules={[{ required: true, message: 'Please select at least one property type' }]}
                                        >
                                            <Checkbox.Group>
                                                <Row>
                                                    <Col span={12}>
                                                        <Checkbox value="apartment">Apartment</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="land">Land</Checkbox>
                                                    </Col>
                                                </Row>
                                            </Checkbox.Group>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Preferred Locations"
                                            name="locations"
                                        >
                                            <Select mode="tags" placeholder="Select or add locations">
                                                <Option value="kilimani">Kilimani</Option>
                                                <Option value="kileleshwa">Kileleshwa</Option>
                                                <Option value="lavington">Lavington</Option>
                                                <Option value="karen">Karen</Option>
                                                <Option value="runda">Runda</Option>
                                                <Option value="westlands">Westlands</Option>
                                                <Option value="thika_road">Thika Road</Option>
                                                <Option value="mombasa_road">Mombasa Road</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Budget Range (KES)" required>
                                            <Input.Group compact>
                                                <Form.Item
                                                    name={['budgetRange', 'min']}
                                                    noStyle
                                                    rules={[{ required: true, message: 'Minimum budget is required' }]}
                                                >
                                                    <InputNumber
                                                        style={{ width: '45%' }}
                                                        placeholder="Minimum"
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                    />
                                                </Form.Item>
                                                <Input
                                                    style={{ width: '10%', textAlign: 'center' }}
                                                    placeholder="~"
                                                    disabled
                                                />
                                                <Form.Item
                                                    name={['budgetRange', 'max']}
                                                    noStyle
                                                    rules={[{ required: true, message: 'Maximum budget is required' }]}
                                                >
                                                    <InputNumber
                                                        style={{ width: '45%' }}
                                                        placeholder="Maximum"
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                    />
                                                </Form.Item>
                                            </Input.Group>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Preferred Amenities"
                                            name="amenities"
                                        >
                                            <Select mode="tags" placeholder="Select or add amenities">
                                                <Option value="swimming_pool">Swimming Pool</Option>
                                                <Option value="gym">Gym</Option>
                                                <Option value="security">24/7 Security</Option>
                                                <Option value="parking">Parking</Option>
                                                <Option value="backup_generator">Backup Generator</Option>
                                                <Option value="water_supply">Reliable Water Supply</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    label="Additional Notes"
                                    name="notes"
                                >
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Tabs.TabPane>
                        </Tabs>
                    )}
                </Form>
            </Modal>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Customers"
                            value={getTotalCustomers()}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Individual Customers"
                            value={getIndividualCustomersCount()}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<UserOutlined />}
                            suffix={`/ ${getTotalCustomers()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Corporate Customers"
                            value={getCompanyCustomersCount()}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<CrownOutlined />}
                            suffix={`/ ${getTotalCustomers()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Purchases"
                            value={getTotalPurchases()}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

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
            <Table
                columns={columns}
                dataSource={filteredCustomers}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1500 }}
                expandable={{
                    expandedRowRender: (record) => (
                        <p style={{ margin: 0 }}>
                            <strong>Preferred Locations:</strong>{' '}
                            {record.preferences.locations.join(', ')}
                            <br />
                            <strong>Requirements:</strong>{' '}
                            {record.preferences.otherRequirements || 'None specified'}
                        </p>
                    ),
                }}
            />

            {/* Customer Details Drawer */}
            <Drawer
                title={
                    selectedCustomer
                        ? `Customer Details: ${selectedCustomer.name}`
                        : 'Customer Details'
                }
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={700}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            onClick={() => handleAddCommunication(selectedCustomer)}
                            icon={<MessageOutlined />}
                            style={{ marginRight: 8 }}
                        >
                            Log Communication
                        </Button>
                        <Button
                            onClick={() => handleAddNote(selectedCustomer)}
                            icon={<CommentOutlined />}
                            style={{ marginRight: 8 }}
                        >
                            Add Note
                        </Button>
                        <Button onClick={() => setDrawerVisible(false)}>Close</Button>
                    </div>
                }
            >
                {selectedCustomer && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Title level={4}>{selectedCustomer.name}</Title>
                                    <Space direction="vertical">
                                        <Text>
                                            <PhoneOutlined style={{ marginRight: 8 }} />
                                            {selectedCustomer.phone}{' '}
                                            {selectedCustomer.verifiedPhone && (
                                                <Tag color="success">Verified</Tag>
                                            )}
                                        </Text>
                                        <Text>
                                            <MailOutlined style={{ marginRight: 8 }} />
                                            {selectedCustomer.email}
                                        </Text>
                                        <Text>
                                            <IdcardOutlined style={{ marginRight: 8 }} />
                                            ID: {selectedCustomer.idNumber}
                                        </Text>
                                        <Text>
                                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                                            {selectedCustomer.address.street}, {selectedCustomer.address.city}, {selectedCustomer.address.county}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    <Tag
                                        color={selectedCustomer.customerType === 'individual' ? 'blue' : 'purple'}
                                        style={{ fontSize: '14px', padding: '4px 8px' }}
                                    >
                                        {selectedCustomer.customerType === 'individual' ? 'Individual' : 'Company'}
                                    </Tag>
                                    {selectedCustomer.company && (
                                        <div style={{ marginTop: 8 }}>
                                            <Text strong>Company:</Text>{' '}
                                            {selectedCustomer.company}
                                        </div>
                                    )}
                                    {selectedCustomer.occupation && (
                                        <div style={{ marginTop: 8 }}>
                                            <Text strong>Occupation:</Text>{' '}
                                            {selectedCustomer.occupation}
                                        </div>
                                    )}
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Customer Since:</Text>{' '}
                                        {selectedCustomer.createdAt}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Customer Status Overview */}
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Purchases"
                                        value={selectedCustomer.purchases}
                                        prefix={<ShoppingOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Payment Plans"
                                        value={selectedCustomer.paymentPlans}
                                        prefix={<CreditCardOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Communications"
                                        value={selectedCustomer.communications ? selectedCustomer.communications.length : 0}
                                        prefix={<MessageOutlined />}
                                        valueStyle={{ color: '#722ed1' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                            <TabPane tab="Preferences" key="1">
                                <Card title="Property Preferences" style={{ marginBottom: 16 }}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label="Property Types">
                                                    {selectedCustomer.preferences.propertyTypes.map(type => (
                                                        <Tag key={type} color={type === 'apartment' ? 'green' : 'orange'}>
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </Tag>
                                                    ))}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Preferred Locations">
                                                    {selectedCustomer.preferences.locations.join(', ')}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Budget Range">
                                                    KES {selectedCustomer.preferences.budgetRange.min.toLocaleString()} - {selectedCustomer.preferences.budgetRange.max.toLocaleString()}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Col>
                                        <Col span={12}>
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label="Desired Amenities">
                                                    {selectedCustomer.preferences.amenities.length > 0
                                                        ? selectedCustomer.preferences.amenities.join(', ')
                                                        : 'None specified'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Other Requirements">
                                                    {selectedCustomer.preferences.otherRequirements || 'None specified'}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Col>
                                    </Row>
                                </Card>
                            </TabPane>

                            <TabPane tab="Communications" key="2">
                                {selectedCustomer.communications && selectedCustomer.communications.length > 0 ? (
                                    <Timeline mode="left" style={{ marginTop: 20 }}>
                                        {[...selectedCustomer.communications]
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((comm, index) => (
                                                <Timeline.Item
                                                    key={index}
                                                    label={comm.date}
                                                    color={
                                                        comm.type === 'call'
                                                            ? 'blue'
                                                            : comm.type === 'meeting'
                                                                ? 'green'
                                                                : comm.type === 'email'
                                                                    ? 'purple'
                                                                    : 'gray'
                                                    }
                                                    dot={
                                                        comm.type === 'call' ? <PhoneOutlined /> :
                                                            comm.type === 'email' ? <MailOutlined /> :
                                                                comm.type === 'meeting' ? <TeamOutlined /> :
                                                                    comm.type === 'sms' ? <MessageOutlined /> :
                                                                        <MessageOutlined />
                                                    }
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {comm?.type ? comm.type.charAt(0).toUpperCase() + comm.type.slice(1) : ''}
                                                    </div>
                                                    <div><strong>Summary:</strong> {comm?.summary || ''}</div>
                                                    <div><strong>Summary:</strong> {comm.summary}</div>
                                                    <div><strong>Outcome:</strong> {comm.outcome}</div>
                                                    {comm.nextAction && (
                                                        <div><strong>Next Action:</strong> {comm.nextAction}</div>
                                                    )}
                                                </Timeline.Item>
                                            ))}
                                    </Timeline>
                                ) : (
                                    <Empty description="No communications recorded yet" />
                                )}

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                    onClick={() => handleAddCommunication(selectedCustomer)}
                                    block
                                >
                                    Add Communication
                                </Button>
                            </TabPane>

                            <TabPane tab="Notes" key="3">
                                {selectedCustomer.notes && selectedCustomer.notes.length > 0 ? (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={[...selectedCustomer.notes].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))}
                                        renderItem={(note, index) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    title={<span>{new Date(note.addedAt).toLocaleString()}</span>}
                                                    description={note.content}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty description="No notes added yet" />
                                )}

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                    onClick={() => handleAddNote(selectedCustomer)}
                                    block
                                >
                                    Add Note
                                </Button>
                            </TabPane>

                            <TabPane tab="Documents" key="4">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={selectedCustomer.documents || []}
                                    renderItem={(doc) => (
                                        <List.Item
                                            actions={[
                                                <Button type="link">View</Button>,
                                                <Button type="link">Download</Button>,
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<FileTextOutlined />} />}
                                                title={doc.name}
                                                description={
                                                    <>
                                                        <Tag color="blue">{doc.type}</Tag>
                                                        <span style={{ marginLeft: 8 }}>
                                                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                                        </span>
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                >
                                    Upload Document
                                </Button>
                            </TabPane>

                            <TabPane tab="Purchases" key="5">
                                {selectedCustomer.purchases > 0 ? (
                                    <Table
                                        dataSource={[
                                            {
                                                id: 'S001',
                                                property: 'Garden City 3-Bedroom Apartment',
                                                date: '2025-02-01',
                                                amount: 8900000,
                                                status: 'Completed',
                                            },
                                        ]}
                                        columns={[
                                            {
                                                title: 'Sale ID',
                                                dataIndex: 'id',
                                                key: 'id',
                                            },
                                            {
                                                title: 'Property',
                                                dataIndex: 'property',
                                                key: 'property',
                                            },
                                            {
                                                title: 'Date',
                                                dataIndex: 'date',
                                                key: 'date',
                                            },
                                            {
                                                title: 'Amount (KES)',
                                                dataIndex: 'amount',
                                                key: 'amount',
                                                render: (amount) => amount.toLocaleString(),
                                            },
                                            {
                                                title: 'Status',
                                                dataIndex: 'status',
                                                key: 'status',
                                                render: (status) => (
                                                    <Tag color="green">{status}</Tag>
                                                ),
                                            },
                                            {
                                                title: 'Actions',
                                                key: 'actions',
                                                render: () => (
                                                    <Button size="small" icon={<FileSearchOutlined />}>
                                                        View
                                                    </Button>
                                                ),
                                            },
                                        ]}
                                        pagination={false}
                                    />
                                ) : (
                                    <Empty description="No purchases yet" />
                                )}
                            </TabPane>

                            <TabPane tab="Payment Plans" key="6">
                                {selectedCustomer.paymentPlans > 0 ? (
                                    <Table
                                        dataSource={[
                                            {
                                                id: 'PP001',
                                                property: 'Garden City 3-Bedroom Apartment',
                                                startDate: '2025-01-15',
                                                amount: 8900000,
                                                paid: 2225000,
                                                remaining: 6675000,
                                                status: 'Active',
                                            },
                                        ]}
                                        columns={[
                                            {
                                                title: 'Plan ID',
                                                dataIndex: 'id',
                                                key: 'id',
                                            },
                                            {
                                                title: 'Property',
                                                dataIndex: 'property',
                                                key: 'property',
                                            },
                                            {
                                                title: 'Start Date',
                                                dataIndex: 'startDate',
                                                key: 'startDate',
                                            },
                                            {
                                                title: 'Total (KES)',
                                                dataIndex: 'amount',
                                                key: 'amount',
                                                render: (amount) => amount.toLocaleString(),
                                            },
                                            {
                                                title: 'Paid (KES)',
                                                dataIndex: 'paid',
                                                key: 'paid',
                                                render: (paid) => paid.toLocaleString(),
                                            },
                                            {
                                                title: 'Status',
                                                dataIndex: 'status',
                                                key: 'status',
                                                render: (status) => (
                                                    <Tag color="blue">{status}</Tag>
                                                ),
                                            },
                                            {
                                                title: 'Actions',
                                                key: 'actions',
                                                render: () => (
                                                    <Button size="small" icon={<FileSearchOutlined />}>
                                                        View
                                                    </Button>
                                                ),
                                            },
                                        ]}
                                        pagination={false}
                                    />
                                ) : (
                                    <Empty description="No payment plans yet" />
                                )}
                            </TabPane>
                        </Tabs>
                    </>
                )}
            </Drawer>

            <Modal
                title="Log Communication"
                open={communicationModalVisible}
                onOk={handleSaveCommunication}
                onCancel={() => setCommunicationModalVisible(false)}
                okText="Save"
            >
                <Form form={communicationForm} layout="vertical">
                    <Form.Item
                        name="type"
                        label="Communication Type"
                        rules={[{ required: true, message: 'Please select a communication type' }]}
                    >
                        <Select placeholder="Select type">
                            <Option value="call">Call</Option>
                            <Option value="email">Email</Option>
                            <Option value="meeting">Meeting</Option>
                            <Option value="sms">SMS</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Date & Time"
                        rules={[{ required: true, message: 'Please select date and time' }]}
                    >
                        <DatePicker
                            showTime
                            style={{ width: '100%' }}
                            placeholder="Select date and time"
                        />
                    </Form.Item>

                    <Form.Item
                        name="summary"
                        label="Summary"
                        rules={[{ required: true, message: 'Please enter a summary' }]}
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Brief summary of the communication"
                        />
                    </Form.Item>

                    <Form.Item name="outcome" label="Outcome">
                        <Input.TextArea
                            rows={2}
                            placeholder="What was the result of this communication?"
                        />
                    </Form.Item>

                    <Form.Item name="nextAction" label="Next Action">
                        <Input.TextArea
                            rows={2}
                            placeholder="What needs to be done next?"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Note Modal */}
            <Modal
                title="Add Note"
                open={noteModalVisible}
                onOk={handleSaveNote}
                onCancel={() => setNoteModalVisible(false)}
                okText="Save"
            >
                <Form form={noteForm} layout="vertical">
                    <Form.Item
                        name="content"
                        label="Note"
                        rules={[{ required: true, message: 'Please enter note content' }]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder="Enter note content"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Confirmation"
                open={deleteModalVisible}
                onOk={handleDeleteCustomer}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Are you sure you want to delete the customer{' '}
                    <strong>{customerToDelete?.name}</strong>?
                </p>
                <p>This action cannot be undone.</p>
            </Modal>
        </>
    );
};



export default CustomerManagement;