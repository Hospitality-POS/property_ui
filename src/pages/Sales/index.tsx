import React, { useState } from 'react';
import {
    Layout,
    Card,
    Table,
    Tag,
    Space,
    Button,
    Input,
    InputNumber,
    Row,
    Col,
    Typography,
    Breadcrumb,
    Dropdown,
    Menu,
    Modal,
    Divider,
    Tabs,
    Form,
    Select,
    DatePicker,
    Tooltip,
    Progress,
    Badge,
    Timeline,
    Drawer,
    Avatar,
    List,
    Statistic,
    Descriptions,
    Steps,
    Popover,
    Checkbox,
    Upload,
    message
} from 'antd';
import {
    DollarOutlined,
    SearchOutlined,
    PlusOutlined,
    FileTextOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    FilterOutlined,
    DownOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    HomeOutlined,
    BankOutlined,
    PrinterOutlined,
    ExportOutlined,
    FileDoneOutlined,
    FileExcelOutlined,
    MailOutlined,
    PhoneOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TeamOutlined,
    BarChartOutlined,
    PieChartOutlined,
    CheckOutlined,
    CloseOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import { fetchAllProperties } from '@/services/property';
import { useQuery } from '@tanstack/react-query';
import { fetchAllCustomers } from '@/services/customer';
import { fetchAllUsers } from '@/services/auth.api';
import moment from 'moment';
import { createNewSale, fetchAllSales, updateSale } from '@/services/sales';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;


const SalesManagement = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [addSaleVisible, setAddSaleVisible] = useState(false);
    const [addPaymentVisible, setAddPaymentVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [salesStatusFilter, setSalesStatusFilter] = useState('all');
    const [salesAgentFilter, setSalesAgentFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [form] = Form.useForm(); // Add this for form control
    const [isEditMode, setIsEditMode] = useState(false);
    const [installments, setInstallments] = useState([]);
    const [saleToEdit, setSaleToEdit] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [addEventVisible, setAddEventVisible] = useState(false);
    const [eventForm] = Form.useForm();
    const [noteText, setNoteText] = useState('');



    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD MMM YYYY');
    };

    // Handle add event
    const handleAddEvent = () => {
        eventForm.resetFields();
        setAddEventVisible(true);
    };

    // Handle event submission
    const handleEventSubmit = (values) => {
        console.log('Adding event:', values);

        // In a real app, this would call an API to add the event to the timeline

        // Show success message and close modal
        message.success('Event added to timeline successfully!');
        setAddEventVisible(false);

        // Refresh data in a real app
        // refetchSales();
    };



    const { data: salesData = [], isLoading: isLoadingSales, refetch: refetchSales } = useQuery({
        queryKey: ['sale'], // Adding refreshKey to queryKey
        queryFn: async () => {
            try {
                const response = await fetchAllSales();
                console.log('sales fetched successfully:', response);

                // Process data to use createdAt as dateJoined
                const processedData = Array.isArray(response.data)
                    ? response.data.map(sale => ({
                        ...sale,
                        dateJoined: formatDate(sale.createdAt) || sale.dateJoined,
                    }))
                    : [];

                return processedData;
            } catch (error) {
                message.error('Failed to fetch sale');
                console.error('Error fetching sale:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });


    const { data: userData = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            try {
                const response = await fetchAllUsers();
                console.log('Users fetched successfully:', response);

                // Return all users
                return Array.isArray(response.data) ? response.data.map(user => ({
                    ...user
                })) : [];
            } catch (error) {
                message.error('Failed to fetch users');
                console.error('Error fetching users:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Filter the fetched data for agents and managers
    const agentsData = userData.filter(user => user.role === 'sales_agent');
    const managersData = userData.filter(user => user.role === 'property_manager');

    // Create refetch functions that call the main refetch
    const refetchAgents = refetchUsers;
    const refetchManagers = refetchUsers;

    // Loading states
    const isLoadingAgents = isLoadingUsers;
    const isLoadingManagers = isLoadingUsers;



    const { data: customersData = [], isLoading: isLoadingCustomers, refetch: refetchCustomers } = useQuery({
        queryKey: ['customer'], // Adding refreshKey to queryKey
        queryFn: async () => {
            try {
                const response = await fetchAllCustomers();
                return response.data;
            } catch (error) {
                message.error('Failed to fetch properties');
                console.error('Error fetching properties:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });


    const { data: propertiesData = [], isLoading: isLoadingProperties, refetch: refetchProperties } = useQuery({
        queryKey: ['property'], // Adding refreshKey to queryKey
        queryFn: async () => {
            try {
                const response = await fetchAllProperties();
                return response.data;
            } catch (error) {
                message.error('Failed to fetch properties');
                console.error('Error fetching properties:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });


    const handleAddInstallment = () => {
        const newInstallments = [...installments, {
            id: `inst-${installments.length + 1}`,
            amount: null,
            dueDate: null,
            key: Date.now() // unique key for React lists
        }];
        setInstallments(newInstallments);
    };

    // Function to remove an installment
    const handleRemoveInstallment = (installmentKey) => {
        setInstallments(installments.filter(inst => inst.key !== installmentKey));
    };

    // Function to update an installment field
    const handleInstallmentChange = (installmentKey, field, value) => {
        setInstallments(installments.map(inst =>
            inst.key === installmentKey ? { ...inst, [field]: value } : inst
        ));
    };

    // Modified edit sale function
    const handleEditSale = (sale) => {
        setSaleToEdit(sale);
        setIsEditMode(true);

        // Get payments from paymentPlans
        let allPayments = [];
        let paymentPlanData = null;

        // Check if paymentPlans array exists and has items
        if (sale.paymentPlans && Array.isArray(sale.paymentPlans) && sale.paymentPlans.length > 0) {
            // Store payment plan data
            paymentPlanData = sale.paymentPlans[0];

            // Get payments from payment plan
            if (paymentPlanData.payments && Array.isArray(paymentPlanData.payments)) {
                allPayments = paymentPlanData.payments;
            }
        } else if (sale.payments && Array.isArray(sale.payments)) {
            // Fallback to sale.payments if paymentPlans doesn't exist
            allPayments = sale.payments;
        }

        // Reset installments - prepare pending payments as installments
        const saleInstallments = allPayments
            .filter(payment => payment.status !== 'Paid' && payment.status !== 'completed')
            .map((payment, index) => ({
                id: `inst-${index + 1}`,
                amount: payment.amount,
                dueDate: payment.paymentDate ? moment(payment.paymentDate) : null,
                method: payment.paymentMethod || 'Bank Transfer',
                key: Date.now() + index
            }));

        setInstallments(saleInstallments);

        // Set form values with safe property access
        const formValues = {
            property: sale.property?._id || sale.property?.id,
            customer: sale.customer?._id || sale.customer?.id,
            salePrice: parseFloat(sale.salePrice) || 0,
            propertyManager: sale.propertyManager?._id || sale.propertyManager?.id,
            listPrice: parseFloat(sale.listPrice) || 0,
            saleDate: sale.saleDate ? moment(sale.saleDate) : null,
            paymentPlan: paymentPlanData ? 'Installment' : 'Full Payment',
            agent: sale.salesAgent?._id || sale.salesAgent?.id || sale.agent?._id || sale.agent?.id,
            notes: sale.notes && Array.isArray(sale.notes) && sale.notes.length > 0 ? sale.notes[0].content : ''
        };

        // Get initial payment information from the first payment plan
        if (paymentPlanData) {
            formValues.initialPayment = parseFloat(paymentPlanData.initialDeposit) || 0;
            formValues.paymentDate = paymentPlanData.depositDate ? moment(paymentPlanData.depositDate) : null;

            // Find initial payment from payments
            const initialPayment = allPayments.find(p => p.notes && p.notes.includes('Initial deposit'));
            if (initialPayment) {
                formValues.paymentMethod = initialPayment.paymentMethod || 'Bank Transfer';
                formValues.reference = initialPayment.transactionReference || '';
            } else {
                formValues.paymentMethod = 'Bank Transfer';
                formValues.reference = '';
            }
        } else {
            // Try to find a completed payment
            const paidPayment = allPayments.find(p => p && (p.status === 'Paid' || p.status === 'completed'));
            if (paidPayment) {
                formValues.initialPayment = parseFloat(paidPayment.amount) || 0;
                formValues.paymentDate = paidPayment.paymentDate ? moment(paidPayment.paymentDate) : null;
                formValues.paymentMethod = paidPayment.paymentMethod || 'Bank Transfer';
                formValues.reference = paidPayment.transactionReference || paidPayment.reference || '';
            } else {
                formValues.initialPayment = 0;
                formValues.paymentDate = null;
                formValues.paymentMethod = 'Bank Transfer';
                formValues.reference = '';
            }
        }

        form.setFieldsValue(formValues);

        setAddSaleVisible(true);
    };

    const handleSaleFormSubmit = () => {
        form.validateFields().then(values => {
            // Attach installments to values as paymentPlanData
            const formDataWithInstallments = {
                ...values,
                paymentPlanData: installments
            };

            console.log('Form values:', formDataWithInstallments);

            // In a real app, this would call an API to create or update the sale
            if (isEditMode) {
                updateSale(saleToEdit._id, formDataWithInstallments)
                    .then(updatedSale => {
                        // Show success message
                        message.success('sale updated successfully!');
                        setTimeout(() => {
                            setRefreshKey(prevKey => prevKey + 1);
                            refetchSales({ force: true });
                        }, 500);

                        // Close modal
                        setAddSaleVisible(false);
                        form.resetFields();
                    })
                    .catch(error => {
                        console.error('Error updating lead:', error);
                        message.error('Failed to update lead. Please try again.');
                    });
            } else {
                createNewSale(formDataWithInstallments)
                    .then(newSale => {
                        // Show success message
                        message.success('sale added successfully!');
                        setTimeout(() => {
                            setRefreshKey(prevKey => prevKey + 1);
                            refetchSales({ force: true });
                        }, 500);

                        // Close modal
                        setAddSaleVisible(false);
                        form.resetFields();
                    })
                    .catch(error => {
                        console.error('Error adding sale:', error);
                        message.error('Failed to add sale. Please try again.');
                    });
                console.log('Creating new sale with values:', formDataWithInstallments);
                message.success('sale created successfully!');
            }

            // Reset form and states
            form.resetFields();
            setInstallments([]);
            setIsEditMode(false);
            setSaleToEdit(null);
            setAddSaleVisible(false);
        }).catch(errorInfo => {
            console.log('Validation failed:', errorInfo);
        });
    };

    const handleAddSaleClick = () => {
        setIsEditMode(false);
        setSaleToEdit(null);
        form.resetFields();
        setInstallments([]);
        setAddSaleVisible(true);
    };

    // Reset form when modal is closed
    const handleModalCancel = () => {
        form.resetFields();
        setInstallments([]);
        setIsEditMode(false);
        setSaleToEdit(null);
        setAddSaleVisible(false);
    };

    const formatCurrency = (amount) => {
        // Check if amount is a valid number, return 0 if it's NaN or undefined
        if (amount === undefined || amount === null || isNaN(amount)) {
            return 'KES 0';
        }
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    const getStatusDisplay = (status) => {
        if (!status) return { text: 'Unknown', color: 'default' };

        const statusMap = {
            'reservation': { text: 'Reserved', color: 'orange' },
            'processing': { text: 'Processing', color: 'blue' },
            'in_progress': { text: 'In Progress', color: 'cyan' },
            'completed': { text: 'Completed', color: 'green' },
            'canceled': { text: 'Canceled', color: 'red' }
        };

        const statusInfo = statusMap[status.toLowerCase()] || { text: status, color: 'default' };
        return {
            text: statusInfo.text,
            color: statusInfo.color
        };
    };

    const columns = [
        {
            title: 'Property',
            dataIndex: ['property', 'name'],
            key: 'property',
            fixed: 'left',
            width: 180,
            render: (text, record) => (
                <a onClick={() => handleViewSale(record)}>{text || 'Unnamed Property'}</a>
            ),
            sorter: (a, b) => {
                const nameA = a.property?.name || '';
                const nameB = b.property?.name || '';
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: 'Type',
            dataIndex: ['property', 'propertyType'],
            key: 'type',
            width: 110,
            render: (type) => {
                if (!type) return <Tag>Unknown</Tag>;
                return (
                    <Tag color={type === 'apartment' ? 'blue' : 'green'}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Tag>
                );
            },
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Land', value: 'land' },
            ],
            onFilter: (value, record) => record.property?.propertyType === value,
        },
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            width: 150,
            render: (name) => name || 'Unknown Customer',
            sorter: (a, b) => {
                const nameA = a.customer?.name || '';
                const nameB = b.customer?.name || '';
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: 'Sale Price (KES)',
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: 150,
            render: (price) => formatCurrency(price),
            sorter: (a, b) => {
                const priceA = parseFloat(a.salePrice) || 0;
                const priceB = parseFloat(b.salePrice) || 0;
                return priceA - priceB;
            },
        },
        {
            title: 'Sale Date',
            dataIndex: 'saleDate',
            key: 'saleDate',
            width: 120,
            render: (date) => formatDate(date) || 'No date',
            sorter: (a, b) => {
                const dateA = a.saleDate ? new Date(a.saleDate) : new Date(0);
                const dateB = b.saleDate ? new Date(b.saleDate) : new Date(0);
                return dateA - dateB;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusInfo = getStatusDisplay(status);
                return (
                    <Tag color={statusInfo.color}>
                        {statusInfo.text}
                    </Tag>
                );
            },
            filters: [
                { text: 'Reserved', value: 'reservation' },
                { text: 'Processing', value: 'processing' },
                { text: 'In Progress', value: 'in_progress' },
                { text: 'Completed', value: 'completed' },
                { text: 'Canceled', value: 'canceled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Reservation Fee',
            dataIndex: 'reservationFee',
            key: 'reservationFee',
            width: 150,
            render: (fee) => formatCurrency(fee),
        },
        {
            title: 'Agent',
            dataIndex: ['salesAgent', 'name'],
            key: 'agent',
            width: 120,
            render: (name) => name || 'Unassigned',
            filters: salesData
                .map(sale => sale.salesAgent?.name)
                .filter((name, index, self) => name && self.indexOf(name) === index)
                .map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record.salesAgent?.name === value,
        },
        {
            title: 'Commission',
            dataIndex: ['commission', 'amount'],
            key: 'commission',
            width: 140,
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => {
                const amountA = parseFloat(a.commission?.amount) || 0;
                const amountB = parseFloat(b.commission?.amount) || 0;
                return amountA - amountB;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<FileTextOutlined />}
                            size="small"
                            onClick={() => handleViewSale(record)}
                        />
                    </Tooltip>
                    {(!record.status || record.status !== 'completed' && record.status !== 'canceled') && (
                        <Tooltip title="Add Payment">
                            <Button
                                icon={<DollarOutlined />}
                                size="small"
                                type="primary"
                                onClick={() => handleAddPayment(record)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Edit Sale">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditSale(record)}
                        />
                    </Tooltip>
                    {(!record.status || record.status !== 'completed') && (
                        <Tooltip title="Cancel Sale">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => showDeleteConfirm(record)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    // Handle view sale
    const handleViewSale = (sale) => {
        setSelectedSale(sale);
        setDrawerVisible(true);
    };


    // Handle add payment
    const handleAddPayment = (sale) => {
        setSelectedSale(sale);
        setAddPaymentVisible(true);
    };

    // Handle payment submission
    const handlePaymentSubmit = (values) => {
        console.log('Adding payment:', values);

        // Find the payment plan ID to attach this payment to
        let paymentPlanId = null;

        if (selectedSale.paymentPlans && selectedSale.paymentPlans.length > 0) {
            paymentPlanId = selectedSale.paymentPlans[0]._id;
        }

        // Prepare payment object
        const paymentData = {
            amount: values.amount,
            paymentDate: values.paymentDate.format('YYYY-MM-DD'),
            paymentMethod: values.paymentMethod,
            transactionReference: values.reference,
            notes: values.notes,
            paymentPlanId: paymentPlanId,
            saleId: selectedSale._id,
            customerId: selectedSale.customer?._id
        };

        // In a real app, this would call an API to add the payment
        console.log('Payment data to be sent to API:', paymentData);

        // Show success message and close modal
        message.success('Payment added successfully!');
        setAddPaymentVisible(false);

        // Refresh data in a real app
        // refetchSales();
    };
    const showDeleteConfirm = (sale) => {
        setSaleToDelete(sale);
        setDeleteModalVisible(true);
    };

    // Handle delete/cancel sale
    const handleCancelSale = () => {
        // In a real app, this would call an API to cancel the sale
        console.log('Cancel sale:', saleToDelete);
        setDeleteModalVisible(false);
        setSaleToDelete(null);
    };



    // Handle save notes
    const handleSaveNotes = () => {
        if (!noteText.trim()) {
            message.warning('Please enter a note before saving');
            return;
        }

        console.log('Adding note:', noteText, 'to sale:', selectedSale?._id);

        // In a real app, this would call an API to add the note

        // Show success message
        message.success('Note added successfully!');

        // Clear the note text
        setNoteText('');

        // Refresh data in a real app
        // refetchSales();
    };
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Calculate sales totals
    const getTotalSalesAmount = () => {
        return salesData
            .filter(sale => !sale.status || sale.status !== 'Canceled')
            .reduce((total, sale) => {
                const salePrice = parseFloat(sale.salePrice) || 0;
                return total + salePrice;
            }, 0);
    };

    const getTotalCommission = () => {
        return filteredSales
            .filter(sale => !sale.status || sale.status !== 'canceled')
            .reduce((total, sale) => {
                const commissionAmount = parseFloat(sale.commission?.amount) || 0;
                return total + commissionAmount;
            }, 0);
    };

    const getCompletedSalesCount = () => {
        return salesData.filter(sale => sale.status === 'Completed').length;
    };

    const getPendingSalesCount = () => {
        return salesData.filter(sale =>
            !sale.status || (sale.status !== 'Completed' && sale.status !== 'Canceled')
        ).length;
    };

    // Calculate payment stats for a sale
    const calculatePaymentStats = (sale) => {
        if (!sale) {
            return {
                totalAmount: 0,
                paidAmount: 0,
                pendingAmount: 0,
                remainingAmount: 0,
                paidPercentage: 0
            };
        }

        const totalAmount = parseFloat(sale.salePrice) || 0;

        // Get payments from the paymentPlans array
        let allPayments = [];

        // Check if paymentPlans array exists and has items
        if (sale.paymentPlans && Array.isArray(sale.paymentPlans) && sale.paymentPlans.length > 0) {
            // Collect all payments from all payment plans
            sale.paymentPlans.forEach(plan => {
                if (plan.payments && Array.isArray(plan.payments)) {
                    allPayments = [...allPayments, ...plan.payments];
                }
            });
        }

        // Fallback to sale.payments if it exists
        if ((!allPayments || allPayments.length === 0) && sale.payments && Array.isArray(sale.payments)) {
            allPayments = sale.payments;
        }

        // Calculate paid amount from completed payments
        const paidAmount = allPayments
            .filter(payment => payment && (payment.status === 'Paid' || payment.status === 'completed'))
            .reduce((total, payment) => {
                const paymentAmount = parseFloat(payment.amount) || 0;
                return total + paymentAmount;
            }, 0);

        // Calculate pending amount from pending payments
        const pendingAmount = allPayments
            .filter(payment => payment && (payment.status === 'Pending' || payment.status === 'pending'))
            .reduce((total, payment) => {
                const paymentAmount = parseFloat(payment.amount) || 0;
                return total + paymentAmount;
            }, 0);

        const remainingAmount = totalAmount - paidAmount - pendingAmount;
        const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

        return {
            totalAmount,
            paidAmount,
            pendingAmount,
            remainingAmount,
            paidPercentage
        };
    };

    // Filter sales based on search text and filters
    const filteredSales = salesData.filter(
        (sale) => {
            const matchesSearch =
                (sale.id && sale.id.toString().toLowerCase().includes(searchText.toLowerCase())) ||
                (sale.property?.name && sale.property.name.toLowerCase().includes(searchText.toLowerCase())) ||
                (sale.customer?.name && sale.customer.name.toLowerCase().includes(searchText.toLowerCase()));

            const matchesStatus = salesStatusFilter === 'all' || sale.status === salesStatusFilter;
            const matchesAgent = salesAgentFilter === 'all' || sale.salesAgent?.name === salesAgentFilter;

            let matchesDateRange = true;
            if (dateRange && dateRange[0] && dateRange[1] && sale.saleDate) {
                const saleDate = new Date(sale.saleDate);
                const startDate = new Date(dateRange[0]);
                const endDate = new Date(dateRange[1]);
                matchesDateRange = saleDate >= startDate && saleDate <= endDate;
            }

            return matchesSearch && matchesStatus && matchesAgent && matchesDateRange;
        }
    );

    return (
        <>
            <Space className="mb-4">
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSaleClick}>
                    Add Sale
                </Button>
            </Space>

            {/* Sales Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Sales Revenue"
                            value={getTotalSalesAmount()}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<DollarOutlined />}
                            formatter={value => `KES ${value.toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Completed Sales"
                            value={getCompletedSalesCount()}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                            suffix={`/ ${salesData.length}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Pending Sales"
                            value={getPendingSalesCount()}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Commission"
                            value={getTotalCommission()}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<TeamOutlined />}
                            formatter={value => `KES ${value.toLocaleString()}`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Search and Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={24} md={6}>
                    <Input
                        placeholder="Search by ID, property or customer..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={8} md={5}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter by Status"
                        defaultValue="all"
                        onChange={value => setSalesStatusFilter(value)}
                    >
                        <Option value="all">All Statuses</Option>
                        <Option value="Reserved">Reserved</Option>
                        <Option value="Processing">Processing</Option>
                        <Option value="In Progress">In Progress</Option>
                        <Option value="Completed">Completed</Option>
                        <Option value="Canceled">Canceled</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={8} md={5}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter by Agent"
                        defaultValue="all"
                        onChange={value => setSalesAgentFilter(value)}
                    >
                        <Option value="all">All Agents</Option>
                        <Option value="Jane Njeri">Jane Njeri</Option>
                        <Option value="James Otieno">James Otieno</Option>
                        <Option value="Peter Kipchoge">Peter Kipchoge</Option>
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
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item key="1" icon={<FileExcelOutlined />}>Export to Excel</Menu.Item>
                            <Menu.Item key="2" icon={<PrinterOutlined />}>Print Report</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item key="3" icon={<BarChartOutlined />}>Sales Analytics</Menu.Item>
                        </Menu>
                    }>
                        <Button style={{ width: '100%' }}>
                            <ExportOutlined /> Export <DownOutlined />
                        </Button>
                    </Dropdown>
                </Col>
            </Row>

            {/* Sales Table */}
            <Table
                columns={columns}
                dataSource={filteredSales}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1500 }}
                expandable={{
                    expandedRowRender: record => (
                        <p style={{ margin: 0 }}>
                            <strong>Notes:</strong> {record.notes || 'No notes available'}
                        </p>
                    ),
                }}
                summary={pageData => {
                    if (pageData.length === 0) return null;

                    let totalSaleAmount = 0;
                    let totalCommission = 0;

                    pageData.forEach(({ salePrice, commission, status }) => {
                        if (!status || status !== 'Canceled') {
                            totalSaleAmount += parseFloat(salePrice) || 0;
                            totalCommission += parseFloat(commission?.amount) || 0;
                        }
                    });

                    return (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={4}><strong>Page Total</strong></Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                    <Text type="danger">KES {totalSaleAmount.toLocaleString()}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5} colSpan={3}></Table.Summary.Cell>
                                <Table.Summary.Cell index={8}>
                                    <Text type="danger">KES {totalCommission.toLocaleString()}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={9} colSpan={2}></Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    );
                }}
            />

            {/* Sale Details Drawer */}
            <Drawer
                title={selectedSale ? `Sale Details` : 'Sale Details'}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                width={700}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        {selectedSale && (!selectedSale.status || (selectedSale.status !== 'Completed' && selectedSale.status !== 'Canceled')) && (
                            <Button type="primary" onClick={() => handleAddPayment(selectedSale)} style={{ marginRight: 8 }}>
                                Add Payment
                            </Button>
                        )}
                        <Button onClick={() => setDrawerVisible(false)}>Close</Button>
                    </div>
                }
            >
                {selectedSale && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Title level={4}>{selectedSale.property?.title || selectedSale.property?.name || 'Unnamed Property'}</Title>
                                    <Space direction="vertical">
                                        {selectedSale.property && (
                                            <>
                                                <Text>
                                                    <HomeOutlined style={{ marginRight: 8 }} />
                                                    {selectedSale.property.propertyType || 'Unknown Type'} - {selectedSale.property.size || 'Unknown Size'}
                                                </Text>
                                                <Text>
                                                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                                                    {selectedSale.property.location?.address || 'Unknown Location'}
                                                </Text>
                                            </>
                                        )}
                                        <Text>
                                            <UserOutlined style={{ marginRight: 8 }} />
                                            Customer: {selectedSale.customer?.name || 'Unknown Customer'}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    <Tag color={
                                        !selectedSale.status ? 'default' :
                                            selectedSale.status === 'Reserved' ? 'orange' :
                                                selectedSale.status === 'Processing' ? 'blue' :
                                                    selectedSale.status === 'In Progress' ? 'cyan' :
                                                        selectedSale.status === 'Completed' ? 'green' : 'red'
                                    } style={{ fontSize: '14px', padding: '4px 8px' }}>
                                        {selectedSale.status || 'Unknown Status'}
                                    </Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Sale Date:</Text> {formatDate(selectedSale.saleDate)}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Sale Progress Steps */}
                        <div style={{ marginBottom: 24 }}>
                            <Steps size="small" current={
                                selectedSale.saleStage === 'Reservation' ? 0 :
                                    selectedSale.saleStage === 'Documentation' ? 1 :
                                        selectedSale.saleStage === 'Financing' ? 2 :
                                            selectedSale.saleStage === 'Payment Collection' ? 3 :
                                                selectedSale.saleStage === 'Completed' ? 4 : 0
                            }>
                                <Step
                                    title="Reservation"
                                    status={selectedSale.status === 'Canceled' ? 'error' : undefined}
                                />
                                <Step
                                    title="Documentation"
                                    status={selectedSale.status === 'Canceled' ? 'error' : undefined}
                                />
                                <Step
                                    title="Financing"
                                    status={selectedSale.status === 'Canceled' ? 'error' : undefined}
                                />
                                <Step
                                    title="Payment"
                                    status={selectedSale.status === 'Canceled' ? 'error' : undefined}
                                />
                                <Step
                                    title="Completed"
                                    status={selectedSale.status === 'Canceled' ? 'error' : undefined}
                                />
                            </Steps>
                        </div>

                        {/* Sale Overview */}
                        <Card title="Sale Overview" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Sale Price">{formatCurrency(selectedSale.salePrice)}</Descriptions.Item>
                                        <Descriptions.Item label="List Price">{formatCurrency(selectedSale.property?.price) || 'Not specified'}</Descriptions.Item>
                                        <Descriptions.Item label="Discount">
                                            {selectedSale.discount && parseFloat(selectedSale.discount) > 0 ? formatCurrency(selectedSale.discount) : 'None'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Payment Plan">
                                            {selectedSale.paymentPlans && selectedSale.paymentPlans.length > 0
                                                ? `Installment (${selectedSale.paymentPlans[0].installmentFrequency || 'custom'})`
                                                : 'Full Payment'}
                                        </Descriptions.Item>
                                        {selectedSale.paymentPlans && selectedSale.paymentPlans.length > 0 && (
                                            <>
                                                <Descriptions.Item label="Initial Deposit">
                                                    {formatCurrency(selectedSale.paymentPlans[0].initialDeposit)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Installment Amount">
                                                    {formatCurrency(selectedSale.paymentPlans[0].installmentAmount)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Outstanding Balance">
                                                    {formatCurrency(selectedSale.paymentPlans[0].outstandingBalance)}
                                                </Descriptions.Item>
                                            </>
                                        )}
                                    </Descriptions>
                                </Col>
                                <Col span={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Agent">{selectedSale.salesAgent?.name || 'Not assigned'}</Descriptions.Item>
                                        <Descriptions.Item label="Commission">{formatCurrency(selectedSale.commission?.amount)}</Descriptions.Item>
                                        {selectedSale.paymentPlans && selectedSale.paymentPlans.length > 0 && (
                                            <>
                                                <Descriptions.Item label="Plan Start Date">
                                                    {formatDate(selectedSale.paymentPlans[0].startDate)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Plan End Date">
                                                    {formatDate(selectedSale.paymentPlans[0].endDate)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Plan Status">
                                                    <Tag color={selectedSale.paymentPlans[0].status === 'active' ? 'green' : 'orange'}>
                                                        {selectedSale.paymentPlans[0].status?.charAt(0).toUpperCase() + selectedSale.paymentPlans[0].status?.slice(1) || 'Unknown'}
                                                    </Tag>
                                                </Descriptions.Item>
                                            </>
                                        )}
                                        <Descriptions.Item label="Reservation Fee">{formatCurrency(selectedSale.reservationFee)}</Descriptions.Item>
                                        <Descriptions.Item label="Documents">
                                            {selectedSale.documents && Array.isArray(selectedSale.documents) && selectedSale.documents.length > 0
                                                ? selectedSale.documents.join(', ')
                                                : 'None'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Sale Date">
                                            {formatDate(selectedSale.saleDate)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>
                        </Card>

                        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                            <TabPane tab="Payments" key="1">
                                {selectedSale && selectedSale.status !== 'Canceled' && (
                                    <Card style={{ marginBottom: 16 }}>
                                        {(() => {
                                            const stats = calculatePaymentStats(selectedSale);
                                            return (
                                                <>
                                                    <Row gutter={16}>
                                                        <Col span={8}>
                                                            <Statistic
                                                                title="Total Amount"
                                                                value={stats.totalAmount}
                                                                formatter={value => formatCurrency(value)}
                                                            />
                                                        </Col>
                                                        <Col span={8}>
                                                            <Statistic
                                                                title="Paid Amount"
                                                                value={stats.paidAmount}
                                                                formatter={value => formatCurrency(value)}
                                                                valueStyle={{ color: '#3f8600' }}
                                                            />
                                                        </Col>
                                                        <Col span={8}>
                                                            <Statistic
                                                                title="Remaining Amount"
                                                                value={stats.remainingAmount + stats.pendingAmount}
                                                                formatter={value => formatCurrency(value)}
                                                                valueStyle={{ color: '#cf1322' }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <div style={{ marginTop: 16 }}>
                                                        <Progress percent={Math.round(stats.paidPercentage)} status="active" />
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </Card>
                                )}

                                <Table
                                    columns={[
                                        {
                                            title: 'Payment ID',
                                            dataIndex: '_id',
                                            key: 'id',
                                            render: id => id || 'N/A'
                                        },
                                        {
                                            title: 'Date',
                                            dataIndex: 'paymentDate',
                                            key: 'date',
                                            render: date => formatDate(date) || 'N/A'
                                        },
                                        {
                                            title: 'Amount',
                                            dataIndex: 'amount',
                                            key: 'amount',
                                            render: amount => formatCurrency(amount)
                                        },
                                        {
                                            title: 'Method',
                                            dataIndex: 'paymentMethod',
                                            key: 'method',
                                            render: method => {
                                                if (!method) return 'N/A';
                                                // Convert snake_case to Title Case
                                                return method.split('_')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ');
                                            }
                                        },
                                        {
                                            title: 'Status',
                                            dataIndex: 'status',
                                            key: 'status',
                                            render: (status) => (
                                                <Tag color={
                                                    status === 'Paid' || status === 'completed' ? 'green' :
                                                        status === 'Pending' || status === 'pending' ? 'orange' :
                                                            status === 'Refunded' || status === 'refunded' ? 'red' : 'default'
                                                }>
                                                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
                                                </Tag>
                                            ),
                                        },
                                        {
                                            title: 'Reference',
                                            dataIndex: 'transactionReference',
                                            key: 'reference',
                                            render: reference => reference || 'N/A'
                                        },
                                        {
                                            title: 'Notes',
                                            dataIndex: 'notes',
                                            key: 'notes',
                                            render: notes => notes || 'N/A'
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'actions',
                                            render: (text, record) => (
                                                <Space>
                                                    {(record.status === 'Pending' || record.status === 'pending') && (
                                                        <Button size="small" type="primary">Confirm</Button>
                                                    )}
                                                    <Button size="small">Receipt</Button>
                                                </Space>
                                            ),
                                        },
                                    ]}
                                    dataSource={(() => {
                                        // Get payments from paymentPlans
                                        let allPayments = [];

                                        // Check if paymentPlans array exists and has items
                                        if (selectedSale.paymentPlans && Array.isArray(selectedSale.paymentPlans) && selectedSale.paymentPlans.length > 0) {
                                            // Collect all payments from all payment plans
                                            selectedSale.paymentPlans.forEach(plan => {
                                                if (plan.payments && Array.isArray(plan.payments)) {
                                                    allPayments = [...allPayments, ...plan.payments];
                                                }
                                            });
                                        }

                                        // Fallback to selectedSale.payments if no payments found in paymentPlans
                                        if (allPayments.length === 0 && selectedSale.payments && Array.isArray(selectedSale.payments)) {
                                            allPayments = selectedSale.payments;
                                        }

                                        return allPayments;
                                    })()}
                                    rowKey={record => record._id || Math.random().toString()}
                                    pagination={false}
                                />

                                {selectedSale.status !== 'Completed' && selectedSale.status !== 'Canceled' && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        style={{ marginTop: 16 }}
                                        onClick={() => handleAddPayment(selectedSale)}
                                    >
                                        Add Payment
                                    </Button>
                                )}
                            </TabPane>

                            <TabPane tab="Timeline" key="2">
                                <Timeline mode="left">
                                    {selectedSale && selectedSale.timeline && selectedSale.timeline.length > 0 ? (
                                        selectedSale.timeline.map((item, index) => (
                                            <Timeline.Item
                                                key={index}
                                                label={formatDate(item.date)}
                                                color={
                                                    item.event === 'Cancellation' || item.event === 'Refund' ? 'red' :
                                                        item.event === 'Sale Agreement' || item.event === 'Final Payment' ? 'green' :
                                                            'blue'
                                                }
                                            >
                                                <div style={{ fontWeight: 'bold' }}>{item.event}</div>
                                                <div>{item.description}</div>
                                            </Timeline.Item>
                                        ))
                                    ) : (
                                        <Timeline.Item>No timeline events available</Timeline.Item>
                                    )}
                                </Timeline>

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 16 }}
                                    block
                                    onClick={handleAddEvent}
                                >
                                    Add Event
                                </Button>

                                {/* Add Event Modal */}
                                <Modal
                                    title="Add Timeline Event"
                                    visible={addEventVisible}
                                    onCancel={() => setAddEventVisible(false)}
                                    footer={null}
                                >
                                    <Form form={eventForm} layout="vertical" onFinish={handleEventSubmit}>
                                        <Form.Item
                                            name="event"
                                            label="Event Type"
                                            rules={[{ required: true, message: 'Please enter an event type' }]}
                                        >
                                            <Select placeholder="Select event type">
                                                <Option value="Sale Agreement">Sale Agreement</Option>
                                                <Option value="Payment">Payment</Option>
                                                <Option value="Documentation">Documentation</Option>
                                                <Option value="Meeting">Meeting</Option>
                                                <Option value="Final Payment">Final Payment</Option>
                                                <Option value="Refund">Refund</Option>
                                                <Option value="Other">Other</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            name="date"
                                            label="Event Date"
                                            rules={[{ required: true, message: 'Please select a date' }]}
                                        >
                                            <DatePicker style={{ width: '100%' }} />
                                        </Form.Item>

                                        <Form.Item
                                            name="description"
                                            label="Description"
                                            rules={[{ required: true, message: 'Please enter a description' }]}
                                        >
                                            <Input.TextArea rows={4} placeholder="Enter event description..." />
                                        </Form.Item>

                                        <div style={{ textAlign: 'right' }}>
                                            <Button style={{ marginRight: 8 }} onClick={() => setAddEventVisible(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="primary" htmlType="submit">
                                                Add to Timeline
                                            </Button>
                                        </div>
                                    </Form>
                                </Modal>
                            </TabPane>

                            <TabPane tab="Customer Details" key="3">
                                <Card>
                                    <Descriptions title="Customer Information" bordered column={1}>
                                        <Descriptions.Item label="Name">{selectedSale.customer?.name || 'N/A'}</Descriptions.Item>
                                        <Descriptions.Item label="Contact Number">{selectedSale.customer?.contactNumber || selectedSale.customer?.phone || 'N/A'}</Descriptions.Item>
                                        <Descriptions.Item label="Email">{selectedSale.customer?.email || 'N/A'}</Descriptions.Item>
                                    </Descriptions>
                                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Space>
                                            <Button icon={<MailOutlined />}>Send Email</Button>
                                            <Button icon={<PhoneOutlined />}>Call</Button>
                                            <Button type="primary" icon={<UserOutlined />}>View Profile</Button>
                                        </Space>
                                    </div>
                                </Card>
                            </TabPane>

                            <TabPane tab="Documents" key="4">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={selectedSale.documents || []}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                <Button type="link">View</Button>,
                                                <Button type="link">Download</Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<FileTextOutlined />} />}
                                                title={item}
                                                description="Document details would appear here"
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

                            <TabPane tab="Notes" key="5">
                                <Card>
                                    {selectedSale.notes && Array.isArray(selectedSale.notes) && selectedSale.notes.length > 0 ? (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={selectedSale.notes}
                                            renderItem={(note, index) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        title={`Note ${index + 1} - ${formatDate(note.createdAt)}`}
                                                        description={note.content || note.text || '(No content)'}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Paragraph>No notes available.</Paragraph>
                                    )}
                                    <div style={{ marginTop: 16 }}>
                                        <Input.TextArea
                                            rows={4}
                                            placeholder="Add notes here..."
                                            value={noteText}
                                            onChange={e => setNoteText(e.target.value)}
                                        />
                                        <Button
                                            type="primary"
                                            style={{ marginTop: 8 }}
                                            onClick={handleSaveNotes}
                                        >
                                            Save Notes
                                        </Button>
                                    </div>
                                </Card>
                            </TabPane>
                        </Tabs>
                    </>
                )}
            </Drawer>

            {/* Add Payment Modal */}
            <Modal
                title={`Add Payment for Sale`}
                visible={addPaymentVisible}
                onCancel={() => setAddPaymentVisible(false)}
                footer={null}
                width={600}
            >
                {selectedSale && (
                    <Form layout="vertical" onFinish={handlePaymentSubmit}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Amount (KES)"
                                    name="amount"
                                    rules={[{ required: true, message: 'Please enter the payment amount' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Enter amount"
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Date"
                                    name="paymentDate"
                                    rules={[{ required: true, message: 'Please select the payment date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Payment Method"
                                    name="paymentMethod"
                                    rules={[{ required: true, message: 'Please select a payment method' }]}
                                    initialValue="bank_transfer"
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Option value="bank_transfer">Bank Transfer</Option>
                                        <Option value="mobile_money">M-Pesa</Option>
                                        <Option value="cash">Cash</Option>
                                        <Option value="check">Check</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Reference Number"
                                    name="reference"
                                >
                                    <Input placeholder="Enter reference number" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Notes"
                            name="notes"
                        >
                            <Input.TextArea rows={4} placeholder="Add payment notes..." />
                        </Form.Item>

                        <Divider />

                        {selectedSale.paymentPlans && selectedSale.paymentPlans.length > 0 ? (
                            <Card style={{ marginBottom: 16 }} size="small">
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Payment Plan">
                                        {selectedSale.paymentPlans[0].installmentFrequency?.charAt(0).toUpperCase() +
                                            selectedSale.paymentPlans[0].installmentFrequency?.slice(1) || 'Custom'} Plan
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Amount">
                                        {formatCurrency(selectedSale.paymentPlans[0].totalAmount)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Outstanding Balance">
                                        {formatCurrency(selectedSale.paymentPlans[0].outstandingBalance)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        ) : (
                            <Card style={{ marginBottom: 16 }} size="small">
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Sale Total">{formatCurrency(selectedSale.salePrice)}</Descriptions.Item>
                                    <Descriptions.Item label="Amount Paid">
                                        {formatCurrency(calculatePaymentStats(selectedSale).paidAmount)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Remaining Balance">
                                        {formatCurrency(parseFloat(selectedSale.salePrice) - calculatePaymentStats(selectedSale).paidAmount)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}

                        <div style={{ textAlign: 'right' }}>
                            <Button style={{ marginRight: 8 }} onClick={() => setAddPaymentVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Add Payment
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>

            {/* Cancel Sale Confirmation Modal */}
            <Modal
                title="Confirm Sale Cancellation"
                visible={deleteModalVisible}
                onOk={handleCancelSale}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Cancel Sale"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to cancel the sale <strong>{saleToDelete?.id}</strong> for property <strong>{saleToDelete?.property?.title || saleToDelete?.property?.name || 'Unknown Property'}</strong>?</p>
                <p>This action will mark the sale as canceled. Any existing payments may need to be refunded separately.</p>
            </Modal>

            {/* Add Sale Modal */}
            <Modal
                title={isEditMode ? `Edit Sale: ${saleToEdit?._id || 'Sale'}` : "Create New Sale"}
                visible={addSaleVisible}
                onOk={handleSaleFormSubmit}
                onCancel={handleModalCancel}
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
                                        rules={[{ required: true, message: 'Please select a property' }]}
                                    >
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="Search for property"
                                            optionFilterProp="children"
                                            loading={isLoadingProperties}
                                        >
                                            {propertiesData && propertiesData.map(property => (
                                                <Option key={property._id || property.id} value={property._id || property.id}>
                                                    {property.name} - {property.location?.address || 'No location'} - {formatCurrency(property.price)}
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
                                <Input.TextArea rows={4} placeholder="Add sales notes..." />
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
                                                                    onChange={(value) => handleInstallmentChange(installment.key, 'amount', value)}
                                                                    min={0}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item label="Due Date" required>
                                                                <DatePicker
                                                                    style={{ width: '100%' }}
                                                                    value={installment.dueDate}
                                                                    onChange={(date) => handleInstallmentChange(installment.key, 'dueDate', date)}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item label="Payment Method">
                                                                <Select
                                                                    style={{ width: '100%' }}
                                                                    value={installment.method || 'M-Pesa'}
                                                                    onChange={(value) => handleInstallmentChange(installment.key, 'method', value)}
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
                                                                    onChange={(value) => handleInstallmentChange(installment.key, 'status', value)}
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
                                                                onClick={() => handleRemoveInstallment(installment.key)}
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
                                                    onClick={handleAddInstallment}
                                                >
                                                    Add Installment
                                                </Button>
                                            </Form.Item>
                                        </>
                                    ) : null
                                }
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Documents" key="3">
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
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>
        </>
    );
};

export default SalesManagement;