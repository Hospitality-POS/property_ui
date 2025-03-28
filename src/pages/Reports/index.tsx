import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, message } from 'antd';
import { FiltersProvider } from './context/FiltersContext';
import ReportHeader from './components/ReportHeader';
import ReportTabs from './components/ReportTabs';
import { TabKey, Sale, User, Property } from './components/types';
import { fetchAllSales } from '@/services/sales';
import { fetchAllUsers } from '@/services/auth.api';
import { fetchAllProperties } from '@/services/property';
import CommissionPaymentModal from '@/components/Modals/AddCommisionPayment';

const ReportsPage: React.FC = () => {
    // State for tab and modal
    const [activeTab, setActiveTab] = useState<TabKey>('agent-commissions');
    const [isCommissionModalVisible, setIsCommissionModalVisible] = useState<boolean>(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);

    // Fetch all sales data
    const {
        data: salesData = [],
        isLoading: isLoadingSales,
        refetch: refetchSales
    } = useQuery({
        queryKey: ['sales-for-reports', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllSales();
                console.log('Sales data fetched for reports:', response);
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                message.error('Failed to fetch sales data for reports');
                console.error('Error fetching sales data:', error);
                return [];
            }
        }
    });

    // Fetch all users/agents data
    const {
        data: usersData = [],
        isLoading: isLoadingUsers
    } = useQuery({
        queryKey: ['users-for-reports', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllUsers();
                // Handle different possible response structures
                let usersArray: User[] = [];
                if (response.data && Array.isArray(response.data)) {
                    usersArray = response.data;
                } else if (Array.isArray(response)) {
                    usersArray = response;
                } else if (response.users && Array.isArray(response.users)) {
                    usersArray = response.users;
                }

                // Process user data and extract agents
                const agents = usersArray.filter(user =>
                    user.role === 'sales_agent' ||
                    user.role === 'agent' ||
                    (user.role && user.role.toLowerCase().includes('agent'))
                );
                return agents;
            } catch (error) {
                message.error('Failed to fetch agents data');
                console.error('Error fetching agents:', error);
                return [];
            }
        }
    });

    // Fetch all properties data
    const {
        data: propertiesData = [],
        isLoading: isLoadingProperties
    } = useQuery({
        queryKey: ['properties-for-reports', refreshKey],
        queryFn: async () => {
            try {
                const response = await fetchAllProperties();
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                message.error('Failed to fetch properties data');
                console.error('Error fetching properties:', error);
                return [];
            }
        }
    });

    // Handle commission payment success
    const handleCommissionPaymentSuccess = () => {
        refetchSales({ force: true });
        message.success(`Commission payment added successfully for sale ${selectedSale?.saleCode || ''}`);
        setIsCommissionModalVisible(false);
        setSelectedSale(null);
    };

    // Show commission payment modal - improved error handling
    const showCommissionPaymentModal = (sale: Sale) => {
        console.log('Showing commission payment modal for sale:', sale);

        if (!sale) {
            message.error('Invalid sale data. Cannot add payment.');
            return;
        }

        // Ensure required properties exist
        if (!sale._id && !sale.id) {
            message.error('Sale ID is missing. Cannot add payment.');
            console.error('Sale ID is missing:', sale);
            return;
        }

        if (!sale.salePrice) {
            message.warning('Sale price information is missing or incomplete.');
        }

        // Set the selected sale and show the modal
        setSelectedSale(sale);
        setIsCommissionModalVisible(true);
    };

    // Refresh data
    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
        refetchSales({ force: true });
    };

    return (
        <FiltersProvider>
            <div className="reports-page">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <ReportHeader
                            title="Sales & Commission Reports"
                            onRefresh={handleRefresh}
                        />
                    </Col>

                    <Col span={24}>
                        <ReportTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            salesData={salesData}
                            usersData={usersData}
                            propertiesData={propertiesData}
                            isLoadingSales={isLoadingSales}
                            isLoadingUsers={isLoadingUsers}
                            isLoadingProperties={isLoadingProperties}
                            refetchSales={refetchSales}
                            showCommissionPaymentModal={showCommissionPaymentModal}
                        />
                    </Col>
                </Row>

                {/* Commission Payment Modal */}
                <CommissionPaymentModal
                    visible={isCommissionModalVisible}
                    onCancel={() => {
                        console.log('Cancelling commission payment modal');
                        setIsCommissionModalVisible(false);
                        setSelectedSale(null);
                    }}
                    sale={selectedSale}
                    onSuccess={handleCommissionPaymentSuccess}
                    agents={usersData}
                />
            </div>
        </FiltersProvider>
    );
};

export default ReportsPage;