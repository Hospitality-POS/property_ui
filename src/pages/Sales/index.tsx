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

    // Add state to hold agents and managers
    const [localAgentsData, setLocalAgentsData] = useState([]);
    const [localManagersData, setLocalManagersData] = useState([]);

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
            'agreement': { text: 'Agreement', color: 'blue' },
            'processing': { text: 'Processing', color: 'cyan' },
            'completed': { text: 'Completed', color: 'green' },
            'cancelled': { text: 'Cancelled', color: 'red' }
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

    const { data: userData = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
        queryKey: ['users', refreshKey], // Add refreshKey to trigger refetch
        queryFn: async () => {
            try {
                const response = await fetchAllUsers();

                // Determine the correct data structure
                let usersArray = [];

                // Handle different possible response structures
                if (response.data && Array.isArray(response.data)) {
                    usersArray = response.data;
                } else if (Array.isArray(response)) {
                    usersArray = response;
                } else if (response.users && Array.isArray(response.users)) {
                    usersArray = response.users;
                } else {
                    console.error('Unexpected users API response structure:', response);
                    return [];
                }

                // Map the users with a defensive approach
                const processedUsers = usersArray.map(user => {
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
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            // When the query is successful, update our local states
            const filteredAgents = data.filter(user => user &&
                (user.role === 'sales_agent' ||
                    user.role === 'agent' ||
                    user.role?.toLowerCase().includes('agent')));

            const filteredManagers = data.filter(user => user &&
                (user.role === 'property_manager' ||
                    user.role === 'manager' ||
                    user.role?.toLowerCase().includes('manager')));

            setLocalAgentsData(filteredAgents);
            setLocalManagersData(filteredManagers);
        }
    });

    // Filter users with more robust checks
    const agentsData = localAgentsData.length > 0
        ? localAgentsData
        : (!isLoadingUsers
            ? userData.filter(user => user &&
                (user.role === 'sales_agent' ||
                    user.role === 'agent' ||
                    user.role?.toLowerCase().includes('agent')))
            : []);

    const managersData = localManagersData.length > 0
        ? localManagersData
        : (!isLoadingUsers
            ? userData.filter(user => user &&
                (user.role === 'property_manager' ||
                    user.role === 'manager' ||
                    user.role?.toLowerCase().includes('manager')))
            : []);

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

    // Handle newly added agent
    const handleAgentAdded = (newAgent) => {
        console.log('New agent added:', newAgent);

        // Add the new agent to the local agents data
        setLocalAgentsData(prevAgents => {
            // Check if this agent is already in the list (by ID or by email)
            const agentExists = prevAgents.some(
                agent => agent._id === newAgent._id || agent.email === newAgent.email
            );

            if (agentExists) {
                // If agent already exists, replace it
                return prevAgents.map(agent =>
                    (agent._id === newAgent._id || agent.email === newAgent.email) ? newAgent : agent
                );
            } else {
                // If agent doesn't exist, add it to the list
                return [...prevAgents, newAgent];
            }
        });

        // Trigger a refetch of the users data to include the new agent in the backend
        refetchAgents({ force: true })
            .then(() => {
                message.success(`Agent ${newAgent.name} added successfully!`);

                // Update the refreshKey to trigger UI updates
                setRefreshKey(prevKey => prevKey + 1);
            })
            .catch(error => {
                console.error('Error refreshing users after adding agent:', error);
            });
    };

    // Handle newly added property manager
    const handlePropertyManagerAdded = (newManager) => {
        console.log('New property manager added:', newManager);

        // Add the new manager to the local managers data
        setLocalManagersData(prevManagers => {
            // Check if this manager is already in the list (by ID or by email)
            const managerExists = prevManagers.some(
                manager => manager._id === newManager._id || manager.email === newManager.email
            );

            if (managerExists) {
                // If manager already exists, replace it
                return prevManagers.map(manager =>
                    (manager._id === newManager._id || manager.email === newManager.email) ? newManager : manager
                );
            } else {
                // If manager doesn't exist, add it to the list
                return [...prevManagers, newManager];
            }
        });

        // Trigger a refetch of the users data to include the new manager in the backend
        refetchManagers({ force: true })
            .then(() => {
                message.success(`Property Manager ${newManager.name} added successfully!`);

                // Update the refreshKey to trigger UI updates
                setRefreshKey(prevKey => prevKey + 1);
            })
            .catch(error => {
                console.error('Error refreshing users after adding property manager:', error);
            });
    };

    // Handle adding an installment
    const handleAddInstallment = (paymentPlanId = null, suggestedAmount = null) => {
        const newInstallment = {
            key: `inst-${Date.now()}`, // unique key for React lists
            amount: suggestedAmount || null,
            dueDate: moment().add(1, 'month'),
            method: 'M-Pesa',
            status: 'Not Due',
            paymentPlanId: paymentPlanId
        };

        setInstallments([...installments, newInstallment]);
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

    // Handle viewing asale
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

    // Use the hook in your component
    const getSaleWithLatestData = useRefreshSaleData(selectedSale?._id, salesData);

    const handleAddPayment = (sale, paymentPlan = null) => {
        // If a payment plan is provided, store it in the selected sale object
        const saleWithPlan = paymentPlan ? {
            ...sale,
            selectedPaymentPlan: paymentPlan
        } : sale;

        setSelectedSale(saleWithPlan);
        setAddPaymentVisible(true);
    };

    // Fixed handlePaymentSubmit function that closes the modal immediately
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
            customerId: selectedSale.customer?._id,
            // Add a flag to indicate that payment plan status should be updated
            updatePaymentPlanStatus: true
        };

        createPayment(paymentData)
            .then(newPayment => {
                // Show success message
                message.success('Payment added successfully!');

                // Close modal immediately after successful payment
                setAddPaymentVisible(false);

                // Now update the payment plan status in the sale record
                if (paymentPlanId) {
                    // Calculate the new outstanding balance for the payment plan
                    const paymentPlan = selectedSale.selectedPaymentPlan ||
                        (selectedSale.paymentPlans && selectedSale.paymentPlans.length > 0 ?
                            selectedSale.paymentPlans[0] : null);

                    if (paymentPlan) {
                        const newOutstandingBalance = Math.max(0, (parseFloat(paymentPlan.outstandingBalance) || 0) - values.amount);
                        const isFullyPaid = newOutstandingBalance <= 0;

                        // Prepare the data for updating the payment plan
                        const updateData = {
                            paymentPlanUpdate: {
                                paymentPlanId: paymentPlanId,
                                updates: {
                                    outstandingBalance: newOutstandingBalance,
                                    status: isFullyPaid ? 'completed' : 'active',
                                    lastPaymentDate: values.paymentDate.format('YYYY-MM-DD')
                                }
                            }
                        };

                        // Update the sale with the new payment plan status
                        updateSale(selectedSale._id, updateData)
                            .then(() => {
                                console.log('Payment plan status updated successfully');

                                // After updating the payment plan, wait a moment then fetch the fresh data
                                setTimeout(() => {
                                    // Direct API call to get fresh data after payment
                                    fetchAllSales()
                                        .then(response => {
                                            const freshData = response?.data || [];
                                            // Find the matching sale
                                            const updatedSale = freshData.find(sale => sale._id === selectedSale._id);

                                            if (updatedSale) {
                                                console.log('Found updated sale data with new payment');
                                                setSelectedSale(updatedSale);

                                                // Update the refresh key to ensure other components reflect the change
                                                setRefreshKey(prevKey => prevKey + 1);
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error fetching updated sale data:', error);
                                        });
                                }, 500); // Small delay to ensure backend processing is complete
                            })
                            .catch(error => {
                                console.error('Error updating payment plan status:', error);
                                message.warning('Payment was added but plan status update failed');
                            });
                    }
                } else {
                    // No payment plan ID, just get the updated sale data
                    setTimeout(() => {
                        fetchAllSales()
                            .then(response => {
                                const freshData = response?.data || [];
                                const updatedSale = freshData.find(sale => sale._id === selectedSale._id);

                                if (updatedSale) {
                                    setSelectedSale(updatedSale);
                                    setRefreshKey(prevKey => prevKey + 1);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching updated sale data:', error);
                            });
                    }, 500);
                }
            })
            .catch(error => {
                console.error('Error adding Payment:', error);
                message.error('Failed to add Payment. Please try again.');
                setAddPaymentVisible(false);
            });
    };


    // Handle adding event
    const handleAddEvent = () => {
        eventForm.resetFields();
        setAddEventVisible(true);
    };

    // Handle event submission
    const handleEventSubmit = (values) => {
        console.log('Adding event:', values);

        // Format the event data
        const eventData = {
            activityType: values.activityType,
            date: values.date.format('YYYY-MM-DD'),
            description: values.description,
            by: values.by || (userData.length > 0 ? userData[0]._id : null)
        };

        // Ensure activities is an array
        const activities = Array.isArray(selectedSale.activities) ? selectedSale.activities : [];

        // Create the updated data structure
        const formattedData = {
            activities: [...activities, eventData],
        };

        console.log('Updating sale with:', formattedData);

        updateSale(selectedSale._id, formattedData)
            .then((response) => {
                message.success('Sale activity added successfully!');

                // Close modal first
                setAddEventVisible(false);
                eventForm.resetFields();

                // Update the selectedSale state with the new activity
                setSelectedSale(prevSale => ({
                    ...prevSale,
                    activities: [...activities, eventData]
                }));

                // Then trigger a refetch to ensure database consistency
                setRefreshKey(prevKey => prevKey + 1);
                refetchSales({ force: true });
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

    // Handle editing a sale
    const handleEditSale = (sale) => {
        setSaleToEdit(sale);
        setIsEditMode(true);

        // Reset installments - we'll let the useEffect in AddSaleModal handle this
        setInstallments([]);

        // Prepare form values with safe property access
        const formValues = {
            // Core sale information
            property: sale.property?._id || sale.property?.id || sale.property,
            customer: sale.customer?._id || sale.customer?.id || sale.customer,
            unit: sale.unit?.unitId || sale.unit?._id,
            unitType: sale.unit?.unitType,
            plotSize: sale.unit?.plotSize || '',
            quantity: sale.quantity || 1,
            salePrice: parseFloat(sale.salePrice) || 0,
            listPrice: parseFloat(sale.unit?.price) || 0,
            discount: parseFloat(sale.salePrice - sale.unit?.price) || 0,
            saleDate: sale.saleDate ? moment(sale.saleDate) : moment(),
            status: sale.status || 'reservation',

            // Personnel information
            agent: sale.salesAgent?._id || sale.salesAgent?.id || sale.agent,
            propertyManager: sale.propertyManager?._id || sale.propertyManager?.id || sale.propertyManager,
            commissionPercentage: sale.commission?.percentage || 5,

            // Payment information
            paymentPlan: sale.paymentPlanType || 'Installment',

            // Notes
            notes: sale.notes && Array.isArray(sale.notes) && sale.notes.length > 0
                ? sale.notes[0].content || sale.notes[0].text
                : (typeof sale.notes === 'string' ? sale.notes : '')
        };

        // Handle payment plan information
        if (sale.paymentPlans && sale.paymentPlans.length > 0) {
            const paymentPlan = sale.paymentPlans[0];

            formValues.initialPayment = parseFloat(paymentPlan.initialDeposit) || 0;
            formValues.paymentDate = paymentPlan.startDate ? moment(paymentPlan.startDate) : moment();
            formValues.paymentMethod = 'M-Pesa'; // Default payment method
        }

        // Set form values
        form.setFieldsValue(formValues);

        // Show modal after form is set up
        setAddSaleVisible(true);
    };


    const handleSaleFormSubmit = () => {
        form.validateFields()
            .then(values => {
                // Find the selected unit object
                const selectedUnitId = values.unit;
                const selectedProperty = propertiesData.find(p =>
                    (p._id || p.id) === values.property
                );

                const selectedUnit = selectedProperty?.units?.find(u =>
                    (u._id || u.id) === selectedUnitId
                );

                // Create the form data with modified unit field
                const formDataWithInstallments = {
                    ...values,
                    unit: selectedUnit, // Pass the entire unit object
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
        if (!saleToDelete) {
            setDeleteModalVisible(false);
            return;
        }

        const cancelData = {
            status: 'cancelled',
            events: [
                ...(Array.isArray(saleToDelete.events) ? saleToDelete.events : []),
                {
                    event: 'Sale Cancelled',
                    addedAt: new Date().toISOString()
                }
            ]
        };

        updateSale(saleToDelete._id, cancelData)
            .then((response) => {
                message.success('Sale cancelled successfully!');
                setDeleteModalVisible(false);
                setSaleToDelete(null);

                // Refresh sales data
                setRefreshKey(prevKey => prevKey + 1);
                refetchSales({ force: true });
            })
            .catch((error) => {
                console.error('Error cancelling sale:', error);
                message.error('Failed to cancel sale. Please try again.');
            });
    };

    // Handle saving notes
    const handleSaveNotes = () => {
        if (!noteText.trim()) {
            message.warning('Please enter a note before saving');
            return;
        }

        // Create a new note object
        const newNote = {
            content: noteText,
            addedAt: new Date().toISOString()
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
        console.log('Calculating payment stats for sale:', sale);
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
            .filter(sale => !sale.status || sale.status !== 'cancelled')
            .reduce((total, sale) => {
                const salePrice = parseFloat(sale.salePrice) || 0;
                return total + salePrice;
            }, 0);
    };

    const getTotalCommission = () => {
        return filteredSales
            .filter(sale => !sale.status || sale.status !== 'cancelled')
            .reduce((total, sale) => {
                const commissionAmount = parseFloat(sale.commission?.amount) || 0;
                return total + commissionAmount;
            }, 0);
    };

    const getCompletedSalesCount = () => {
        return salesData.filter(sale => sale.status === 'completed').length;
    };

    const getPendingSalesCount = () => {
        return salesData.filter(sale =>
            !sale.status || (sale.status !== 'completed' && sale.status !== 'cancelled')
        ).length;
    };

    // Filter sales based on search text and filters
    const filteredSales = salesData.filter(sale => {
        const matchesSearch =
            (sale.id && sale.id.toString().toLowerCase().includes(searchText.toLowerCase())) ||
            (sale.property?.name && sale.property.name.toLowerCase().includes(searchText.toLowerCase())) ||
            (sale.customer?.name && sale.customer.name.toLowerCase().includes(searchText.toLowerCase()));

        const matchesStatus = salesStatusFilter === 'all' || sale.status === salesStatusFilter.toLowerCase();
        const matchesAgent = salesAgentFilter === 'all' || sale.salesAgent?.name === salesAgentFilter;

        let matchesDateRange = true;
        if (dateRange && dateRange[0] && dateRange[1] && sale.saleDate) {
            const saleDate = new Date(sale.saleDate);
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);
            matchesDateRange = saleDate >= startDate && saleDate <= endDate;
        }

        return matchesSearch && matchesStatus && matchesAgent && matchesDateRange;
    });

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
                        <Option value="reservation">Reserved</Option>
                        <Option value="agreement">Agreement</Option>
                        <Option value="processing">Processing</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="cancelled">Cancelled</Option>
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
            // refreshData={refreshSaleData} // Pass the refresh function here
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
                onAgentAdded={handleAgentAdded}
                onPropertyManagerAdded={handlePropertyManagerAdded}
            />

            {/* Add Payment Modal */}
            <AddPaymentModal
                visible={addPaymentVisible}
                sale={selectedSale}
                onOk={handlePaymentSubmit}
                onCancel={() => {
                    setAddPaymentVisible(false);
                    // No refresh on cancel
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