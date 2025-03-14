import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Button, Space, Input, Select, Row, Col, DatePicker, Dropdown, Menu, Form, message
} from 'antd';
import {
    PlusOutlined, SearchOutlined, BarChartOutlined, PrinterOutlined,
    FileExcelOutlined, ExportOutlined, DownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { fetchAllProperties } from '@/services/property';
import { fetchAllCustomers } from '@/services/customer';
import { fetchAllUsers } from '@/services/auth.api';
import { createNewSale, fetchAllSales, updateSale } from '@/services/sales';

import { SalesStatisticsCards } from '../../components/statistics/salesStatistics';
import { SalesTable } from '../../components/Tables/salesTable';
import { SaleDetailsDrawer } from '../../components/drawers/salesDetail';
import { AddSaleModal } from '../../components/Modals/addSales';
import { AddPaymentModal } from '../../components/Modals/paymentModal';
import { CancelSaleModal } from '../../components/Modals/cancelSale';
import { AddEventModal } from '../../components/Modals/addEvent';
import { createPayment } from "../../services/payments"
import React from 'react';


const { Option } = Select;
const { RangePicker } = DatePicker;

const SalesManagement = () => {
    // State for search and filters
    const [searchText, setSearchText] = useState('');
    const [salesStatusFilter, setSalesStatusFilter] = useState('all');
    const [salesAgentFilter, setSalesAgentFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // State for selected sale and drawer
    const [selectedSale, setSelectedSale] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');

    // State for modals
    const [addSaleVisible, setAddSaleVisible] = useState(false);
    const [addPaymentVisible, setAddPaymentVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [addEventVisible, setAddEventVisible] = useState(false);

    // State for sale editing
    const [isEditMode, setIsEditMode] = useState(false);
    const [saleToEdit, setSaleToEdit] = useState(null);
    const [saleToDelete, setSaleToDelete] = useState(null);

    // State for installments and notes
    const [installments, setInstallments] = useState([]);
    const [noteText, setNoteText] = useState('');

    // Form instances
    const [form] = Form.useForm();
    const [eventForm] = Form.useForm();

    // Refresh state
    const [refreshKey, setRefreshKey] = useState(0);

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD MMM YYYY');
    };

    // Format currency helper
    const formatCurrency = (amount) => {
        // Check if amount is a valid number, return 0 if it's NaN or undefined
        if (amount === undefined || amount === null || isNaN(amount)) {
            return 'KES 0';
        }
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    // Get status display helper
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

    // Fetch sales data
    const { data: salesData = [], isLoading: isLoadingSales, refetch: refetchSales } = useQuery({
        queryKey: ['sale', refreshKey],
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
                message.error('Failed to fetch sales');
                console.error('Error fetching sales:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });
    console.log('my sales data', salesData);

    const { data: userData = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            try {
                const response = await fetchAllUsers();
                console.log('Users fetched successfully:', response);

                // Determine the correct data structure
                let usersArray = [];

                // Handle different possible response structures
                if (response.data && Array.isArray(response.data)) {
                    // Standard structure: response.data is the array
                    usersArray = response.data;
                } else if (Array.isArray(response)) {
                    // Alternative structure: response itself is the array
                    usersArray = response;
                } else if (response.users && Array.isArray(response.users)) {
                    // Alternative structure: response.users is the array
                    usersArray = response.users;
                } else {
                    console.error('Unexpected users API response structure:', response);
                    return [];
                }

                console.log(`Processing ${usersArray.length} users`);

                // Map the users with a defensive approach
                const processedUsers = usersArray.map(user => {
                    // Ensure we have an object with at least an id and role
                    return {
                        ...user,
                        _id: user._id || user.id || `temp-${Date.now()}-${Math.random()}`,
                        role: user.role || user.userRole || 'unknown'
                    };
                });

                return processedUsers;
            } catch (error) {
                message.error('Failed to fetch users');
                console.error('Error fetching users:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Debug log the fetched data
    console.log('Fetched users count:', userData.length);
    console.log('Sample user object:', userData.length > 0 ? userData[0] : 'No users found');

    // Extract roles for debugging
    if (userData.length > 0) {
        const roles = [...new Set(userData.map(user => user.role))];
        console.log('User roles present in data:', roles);
    }

    // Filter users with more robust checks
    const agentsData = !isLoadingUsers
        ? userData.filter(user => user &&
            (user.role === 'sales_agent' ||
                user.role === 'agent' ||
                user.role?.toLowerCase().includes('agent')))
        : [];

    const managersData = !isLoadingUsers
        ? userData.filter(user => user &&
            (user.role === 'property_manager' ||
                user.role === 'manager' ||
                user.role?.toLowerCase().includes('manager')))
        : [];

    // Log the filtered results
    console.log('Filtered agents count:', agentsData.length);
    console.log('Filtered managers count:', managersData.length);


    // Create refetch functions that call the main refetch
    const refetchAgents = refetchUsers;
    const refetchManagers = refetchUsers;

    // Loading states
    const isLoadingAgents = isLoadingUsers;
    const isLoadingManagers = isLoadingUsers;

    // Fetch customers data
    const { data: customersData = [], isLoading: isLoadingCustomers, refetch: refetchCustomers } = useQuery({
        queryKey: ['customer'],
        queryFn: async () => {
            try {
                const response = await fetchAllCustomers();
                return response.data;
            } catch (error) {
                message.error('Failed to fetch customers');
                console.error('Error fetching customers:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Fetch properties data
    const { data: propertiesData = [], isLoading: isLoadingProperties, refetch: refetchProperties } = useQuery({
        queryKey: ['property'],
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



    // Handle adding an installment
    const handleAddInstallment = () => {
        const newInstallments = [...installments, {
            id: `inst-${installments.length + 1}`,
            amount: null,
            dueDate: null,
            key: Date.now() // unique key for React lists
        }];
        setInstallments(newInstallments);
    };

    // Handle removing an installment
    const handleRemoveInstallment = (installmentKey) => {
        setInstallments(installments.filter(inst => inst.key !== installmentKey));
    };

    // Handle updating an installment field
    const handleInstallmentChange = (installmentKey, field, value) => {
        setInstallments(installments.map(inst =>
            inst.key === installmentKey ? { ...inst, [field]: value } : inst
        ));
    };

    // Handle viewing a sale
    const handleViewSale = (sale) => {
        setSelectedSale(sale);
        setDrawerVisible(true);
    };


    // Custom hook to handle refreshing sale data
    const useRefreshSaleData = (saleId, salesData) => {
        return React.useCallback(() => {
            if (!saleId) return null;

            // Find the updated sale data
            const updatedSale = salesData.find(s => s._id === saleId);
            return updatedSale || null;
        }, [saleId, salesData]);
    };

    // 2. Use the hook in your component
    const getSaleWithLatestData = useRefreshSaleData(selectedSale?._id, salesData);

    // Handle adding a payment
    const handleAddPayment = (sale, paymentPlan = null) => {
        // If a payment plan is provided, store it in the selected sale object
        const saleWithPlan = paymentPlan ? {
            ...sale,
            selectedPaymentPlan: paymentPlan
        } : sale;

        setSelectedSale(saleWithPlan);
        setAddPaymentVisible(true);
    };


    // Updated handlePaymentSubmit function in SalesManagement.jsx
    const handlePaymentSubmit = (values) => {
        console.log('Adding payment:', values);

        // Find the payment plan ID to attach this payment to
        let paymentPlanId = null;

        // Use the selected payment plan if available, otherwise use the first one
        if (selectedSale.selectedPaymentPlan) {
            paymentPlanId = selectedSale.selectedPaymentPlan._id;
        } else if (selectedSale.paymentPlans && selectedSale.paymentPlans.length > 0) {
            paymentPlanId = selectedSale.paymentPlans[0]._id;
        }

        // Prepare payment object
        const paymentData = {
            amount: values.amount,
            paymentDate: values.paymentDate.format('YYYY-MM-DD'),
            paymentMethod: values.paymentMethod,
            transactionReference: values.reference,
            notes: values.notes || (selectedSale.selectedPaymentPlan ?
                `Payment for installment plan #${selectedSale.selectedPaymentPlan._id.toString().substr(-6)}` : ''),
            paymentPlanId: paymentPlanId,
            saleId: selectedSale._id,
            status: 'completed',
            customerId: selectedSale.customer?._id
        };

        createPayment(paymentData)
            .then(newPayment => {
                // Show success message
                message.success('Payment added successfully!');

                // Close modal
                setAddPaymentVisible(false);

                // Refresh data
                setTimeout(() => {
                    // Refresh the sales list
                    setRefreshKey(prevKey => prevKey + 1);
                    refetchSales({ force: true })
                        .then(() => {
                            // Once sales are refreshed, update the selected sale in the drawer
                            // by fetching the updated sale data and reopening the drawer with it
                            const updatedSale = salesData.find(s => s._id === selectedSale._id);
                            if (updatedSale) {
                                setSelectedSale(updatedSale);
                            }
                        });
                }, 500);
            })
            .catch(error => {
                console.error('Error adding Payment:', error);
                message.error('Failed to add Payment. Please try again.');
            });
    };

    // Handle adding event
    const handleAddEvent = () => {
        eventForm.resetFields();
        setAddEventVisible(true);
    };

    // Update the handleEventSubmit function in SalesManagement.jsx
    const handleEventSubmit = (values) => {
        console.log('Adding event:', values);

        // Ensure activities is an array
        const activities = Array.isArray(selectedSale.activities) ? selectedSale.activities : [];
        const newValues = Array.isArray(values) ? values : [values];

        // Create the updated data structure
        const formattedData = {
            activities: [...activities, ...newValues],
        };

        console.log('Updating sale with:', formattedData);

        updateSale(selectedSale._id, formattedData)
            .then((response) => {
                message.success('Sale activity added successfully!');

                // Close modal first
                setAddEventVisible(false);
                eventForm.resetFields();

                // Important: Directly update the selectedSale state with the new activity
                // This ensures the Timeline shows the new activity immediately
                setSelectedSale(prevSale => ({
                    ...prevSale,
                    activities: [...activities, ...newValues]
                }));

                // Then trigger a refetch to ensure database consistency
                //setRefreshKey(prevKey => prevKey + 1);
                //refetchSales({ force: true });
            })
            .catch((error) => {
                console.error('Error adding sale activity:', error);
                message.error('Failed to add sale activity. Please try again.');
            });
    };


    // Handle adding new sale
    const handleAddSaleClick = () => {
        setIsEditMode(false);
        setSaleToEdit(null);
        form.resetFields();
        setInstallments([]);
        setAddSaleVisible(true);
    };

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

        // Reset installments - we'll let the useEffect in AddSaleModal handle this now
        // Just clear the existing installments so they can be properly set by the modal component

        setInstallments([]);

        // Set form values with safe property access
        const formValues = {
            property: sale.property?._id || sale.property?.id || sale.property,
            customer: sale.customer?._id || sale.customer?.id || sale.customer,
            salePrice: parseFloat(sale.salePrice) || 0,
            propertyManager: sale.propertyManager?._id || sale.propertyManager?.id || sale.propertyManager,
            listPrice: parseFloat(sale.listPrice) || parseFloat(sale.property?.price) || 0,
            saleDate: sale.saleDate ? moment(sale.saleDate) : null,
            paymentPlan: sale.paymentPlanType || (paymentPlanData ? 'Installment' : 'Full Payment'),
            agent: sale.salesAgent?._id || sale.salesAgent?.id || sale.agent?._id || sale.agent?.id || sale.agent,
            notes: sale.notes && Array.isArray(sale.notes) && sale.notes.length > 0
                ? sale.notes[0].content || sale.notes[0].text
                : (typeof sale.notes === 'string' ? sale.notes : '')
        };

        // Get initial payment information from the first payment plan
        if (paymentPlanData) {
            formValues.initialPayment = parseFloat(paymentPlanData.initialDeposit) || 0;
            formValues.paymentDate = paymentPlanData.depositDate ? moment(paymentPlanData.depositDate) :
                paymentPlanData.startDate ? moment(paymentPlanData.startDate) : null;

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

        // Set form values
        form.setFieldsValue(formValues);

        // Show modal after form is set up
        setAddSaleVisible(true);
    };

    const handleSaleFormSubmit = () => {
        form.validateFields()
            .then(values => {
                // Attach installments to values as paymentPlanData
                const formDataWithInstallments = {
                    ...values,
                    paymentPlanData: installments
                };

                console.log("Form values:", formDataWithInstallments);

                const apiCall = isEditMode
                    ? updateSale(saleToEdit._id, formDataWithInstallments)
                    : createNewSale(formDataWithInstallments);

                apiCall
                    .then(() => {
                        // Show success message
                        message.success(`Sale ${isEditMode ? "updated" : "added"} successfully!`);

                        setTimeout(() => {
                            setRefreshKey(prevKey => prevKey + 1);
                            refetchSales({ force: true });
                        }, 500);

                        // Close modal only after successful API request
                        setAddSaleVisible(false);
                        form.resetFields();
                        setInstallments([]);
                        setIsEditMode(false);
                        setSaleToEdit(null);
                    })
                    .catch(error => {
                        console.error(`Error ${isEditMode ? "updating" : "adding"} sale:`, error);
                        message.error(`Failed to ${isEditMode ? "update" : "add"} sale. Please try again.`);
                    });
            })
            .catch(errorInfo => {
                console.log("Validation failed:", errorInfo);
            });
    };

    // Reset form when modal is closed
    const handleModalCancel = () => {
        form.resetFields();
        setInstallments([]);
        setIsEditMode(false);
        setSaleToEdit(null);
        setAddSaleVisible(false);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (sale) => {
        setSaleToDelete(sale);
        setDeleteModalVisible(true);
    };

    // Handle cancel sale
    const handleCancelSale = () => {
        // In a real app, this would call an API to cancel the sale
        console.log('Cancel sale:', saleToDelete);
        setDeleteModalVisible(false);
        setSaleToDelete(null);
    };

    // Update the handleSaveNotes function in SalesManagement.jsx
    const handleSaveNotes = () => {
        if (!noteText.trim()) {
            message.warning('Please enter a note before saving');
            return;
        }

        // Create a new note object
        const newNote = {
            content: noteText,
            createdAt: new Date().toISOString(),
            createdBy: 'current-user' // You might want to add the actual user ID here
        };

        // Prepare data for API call
        const notesData = {
            notes: Array.isArray(selectedSale.notes)
                ? [...selectedSale.notes, newNote]
                : [newNote]
        };

        // Call API to update the sale with the new note
        updateSale(selectedSale._id, notesData)
            .then((response) => {
                message.success('Note added successfully!');

                // Immediately update the local state so the note appears in the UI
                setSelectedSale(prevSale => ({
                    ...prevSale,
                    notes: Array.isArray(prevSale.notes)
                        ? [...prevSale.notes, newNote]
                        : [newNote]
                }));

                // Clear the note text input
                setNoteText('');

                // Also refresh the sales data in the background for consistency
                //setRefreshKey(prevKey => prevKey + 1);
                // refetchSales({ force: true });
            })
            .catch((error) => {
                console.error('Error adding note:', error);
                message.error('Failed to add note. Please try again.');
            });
    };

    // Handle search input change
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Calculate payment stats for a sale
    const calculatePaymentStats = (sale) => {
        console.log('my sales payments', sale);
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

        // Initialize allPayments array
        let allPayments = [];

        // First check if payments exist directly in the sale object
        if (sale.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
            allPayments = sale.payments;
        }
        // If no direct payments, check paymentPlans
        else if (sale.paymentPlans && Array.isArray(sale.paymentPlans) && sale.paymentPlans.length > 0) {
            // Collect all payments from all payment plans
            sale.paymentPlans.forEach(plan => {
                if (plan.payments && Array.isArray(plan.payments)) {
                    allPayments = [...allPayments, ...plan.payments];
                }
            });
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
            <SalesStatisticsCards
                totalSalesAmount={getTotalSalesAmount()}
                completedSalesCount={getCompletedSalesCount()}
                pendingSalesCount={getPendingSalesCount()}
                totalCommission={getTotalCommission()}
                totalSalesCount={salesData.length}
            />

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
                        {agentsData.map(agent => (
                            <Option key={agent._id} value={agent.name}>{agent.name}</Option>
                        ))}
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
            <SalesTable
                sales={filteredSales}
                onView={handleViewSale}
                onAddPayment={handleAddPayment}
                onEdit={handleEditSale}
                onCancel={showDeleteConfirm}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusDisplay={getStatusDisplay}
            />

            {/* Sale Details Drawer */}
            <SaleDetailsDrawer
                visible={drawerVisible}
                sale={selectedSale}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={() => setDrawerVisible(false)}
                onAddPayment={handleAddPayment}
                onAddEvent={handleAddEvent}
                noteText={noteText}
                setNoteText={setNoteText}
                onSaveNotes={handleSaveNotes}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                calculatePaymentStats={calculatePaymentStats}
            />

            {/* Add/Edit Sale Modal */}
            <AddSaleModal
                visible={addSaleVisible}
                isEditMode={isEditMode}
                saleToEdit={saleToEdit}
                form={form}
                installments={installments}
                setInstallments={setInstallments}
                propertiesData={propertiesData}
                customersData={customersData}
                agentsData={agentsData}
                managersData={managersData}
                isLoadingProperties={isLoadingProperties}
                isLoadingCustomers={isLoadingCustomers}
                isLoadingAgents={isLoadingAgents}
                isLoadingManagers={isLoadingManagers}
                onAddInstallment={handleAddInstallment}
                onRemoveInstallment={handleRemoveInstallment}
                onInstallmentChange={handleInstallmentChange}
                onOk={handleSaleFormSubmit}
                onCancel={handleModalCancel}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />

            {/* Add Payment Modal */}
            <AddPaymentModal
                visible={addPaymentVisible}
                sale={selectedSale}
                onOk={handlePaymentSubmit}
                onCancel={() => {
                    setAddPaymentVisible(false);

                    // Refresh the selected sale data when modal is closed
                    const refreshedSale = getSaleWithLatestData();
                    if (refreshedSale) {
                        setSelectedSale(refreshedSale);
                    }
                }}
                formatCurrency={formatCurrency}
                calculatePaymentStats={calculatePaymentStats}
            />

            {/* Cancel Sale Modal */}
            <CancelSaleModal
                visible={deleteModalVisible}
                sale={saleToDelete}
                onOk={handleCancelSale}
                onCancel={() => setDeleteModalVisible(false)}
            />

            {/* Add Event Modal */}
            <AddEventModal
                visible={addEventVisible}
                form={eventForm}
                onOk={handleEventSubmit}
                onCancel={() => setAddEventVisible(false)}
            />
        </>
    );
};

export default SalesManagement;