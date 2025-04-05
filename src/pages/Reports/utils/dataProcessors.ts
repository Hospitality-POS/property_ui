import moment, { Moment } from 'moment';
import {
    Sale,
    FilterType,
    AgentCommissionReport,
    PropertyAnalysis,
    PortfolioProperty,
    AgingBalance,
    PerformanceTrends,
    Property,
    AgentAnalysis
} from '../components/types';

/**
 * Process sales data to generate agent commissions report
 * @param salesData - Raw sales data
 * @param dateRange - Date range for filtering
 * @param selectedAgents - Selected agent IDs
 * @param filterType - Filter type for commissions
 * @returns Processed report data
 */
export const generateAgentCommissionsReport = (
    salesData: Sale[],
    dateRange: [Moment | null, Moment | null],
    selectedAgents: string[],
    filterType: FilterType
): AgentCommissionReport[] => {
    if (!salesData.length) return [];

    // Filter sales by date range
    const [startDate, endDate] = dateRange || [null, null];
    let filteredSales = salesData;

    if (startDate && endDate) {
        filteredSales = salesData.filter(sale => {
            const saleDate = moment(sale.saleDate || sale.createdAt);
            return saleDate.isBetween(startDate, endDate, null, '[]');
        });
    }

    // Filter by selected agents (if any)
    if (selectedAgents.length > 0) {
        filteredSales = filteredSales.filter(sale => {
            const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent;
            return selectedAgents.includes(agentId!);
        });
    }

    // Filter by payment status if needed
    if (filterType === 'paid') {
        filteredSales = filteredSales.filter(sale => {
            return sale.commission?.status === 'paid';
        });
    } else if (filterType === 'unpaid') {
        filteredSales = filteredSales.filter(sale => {
            return !sale.commission?.status || sale.commission?.status !== 'paid';
        });
    } else if (filterType === 'partial') {
        filteredSales = filteredSales.filter(sale => {
            return sale.commission?.status === 'partial';
        });
    }

    // Group sales by agent
    const agentSalesMap: Record<string, AgentCommissionReport> = {};

    filteredSales.forEach(sale => {
        const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent;
        if (!agentId) return;

        const agentName = sale.salesAgent?.name || 'Unknown Agent';
        const agentEmail = sale.salesAgent?.email || '';

        if (!agentSalesMap[agentId]) {
            agentSalesMap[agentId] = {
                agentId,
                agentName,
                agentEmail,
                totalSales: 0,
                totalSaleValue: 0,
                totalCommission: 0,
                totalCommissionPaid: 0,
                totalCommissionPending: 0,
                commissionPaymentCount: 0,
                sales: []
            };
        }

        // Calculate commission details
        const salePrice = parseFloat(sale.salePrice.toString()) || 0;
        const commissionPercentage = parseFloat(sale.commission?.percentage?.toString() || '5');
        const commissionAmount = parseFloat(sale.commission?.amount?.toString() || '') || (salePrice * commissionPercentage / 100);
        const commissionPaid = sale.commission?.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        const commissionPending = commissionAmount - commissionPaid;
        const commissionStatus = sale.commission?.status || 'pending';
        const commissionPaymentCount = sale.commission?.payments?.length || 0;

        // Update agent totals
        agentSalesMap[agentId].totalSales += 1;
        agentSalesMap[agentId].totalSaleValue += salePrice;
        agentSalesMap[agentId].totalCommission += commissionAmount;
        agentSalesMap[agentId].totalCommissionPaid += commissionPaid;
        agentSalesMap[agentId].totalCommissionPending += commissionPending;
        agentSalesMap[agentId].commissionPaymentCount += commissionPaymentCount;

        // Add detailed sale info with all tracking fields
        agentSalesMap[agentId].sales.push({
            saleId: sale._id || sale.id || '',
            saleCode: sale.saleCode || 'N/A',
            property: sale.property?.name || 'Unknown Property',
            propertyId: sale.property?._id || sale.property?.id,
            customer: sale.customer?.name || 'Unknown Customer',
            saleDate: sale.saleDate || sale.createdAt || '',
            salePrice,
            commissionPercentage,
            commissionAmount,
            commissionPaid,
            commissionPending,
            commissionStatus,
            commissionPayments: sale.commission?.payments || [],
            paymentProgress: commissionAmount > 0 ? ((commissionPaid / commissionAmount) * 100).toFixed(1) : 0,
            unit: sale.unit?.unitType || 'Unknown Unit',
            unitId: sale.unit?.unitId || '',
            quantity: sale.quantity || 1,
            saleData: sale // Store the full sale object for reference
        });
    });

    // Convert to array and sort by total commission (highest first)
    return Object.values(agentSalesMap).sort((a, b) => b.totalCommission - a.totalCommission);
};

/**
 * Generate sales analysis report with property & agent filters
 * @param salesData - Raw sales data
 * @param dateRange - Date range for filtering
 * @param selectedAgents - Selected agent IDs
 * @param selectedProperties - Selected property IDs
 * @returns Processed sales analysis data
 */
export const generateSalesAnalysisReport = (
    salesData: Sale[],
    dateRange: [Moment | null, Moment | null],
    selectedAgents: string[],
    selectedProperties: string[]
): PropertyAnalysis[] => {
    if (!salesData.length) return [];

    const [startDate, endDate] = dateRange || [null, null];
    let filteredSales = salesData;

    if (startDate && endDate) {
        filteredSales = salesData.filter(sale => {
            const saleDate = moment(sale.saleDate || sale.createdAt);
            return saleDate.isBetween(startDate, endDate, null, '[]');
        });
    }

    // Filter by selected agents (if any)
    if (selectedAgents.length > 0) {
        filteredSales = filteredSales.filter(sale => {
            const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent;
            return selectedAgents.includes(agentId!);
        });
    }

    // Filter by selected properties (if any)
    if (selectedProperties.length > 0) {
        filteredSales = filteredSales.filter(sale => {
            const propertyId = sale.property?._id || sale.property?.id;
            return selectedProperties.includes(propertyId!);
        });
    }

    // Group sales by property
    const propertyMap: Record<string, PropertyAnalysis> = {};
    let totalSaleValue = 0;

    filteredSales.forEach(sale => {
        const propertyId = sale.property?._id || sale.property?.id || 'unknown';
        const propertyName = sale.property?.name || 'Unknown Property';
        const salePrice = parseFloat(sale.salePrice.toString()) || 0;
        const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent || '';
        const agentName = sale.salesAgent?.name || 'Unknown Agent';

        totalSaleValue += salePrice;

        if (!propertyMap[propertyId]) {
            propertyMap[propertyId] = {
                propertyId,
                propertyName,
                salesCount: 0,
                totalValue: 0,
                units: [],
                agents: [],
                topAgent: null,
                percentage: 0
            };
        }

        const property = propertyMap[propertyId];
        property.salesCount += 1;
        property.totalValue += salePrice;

        // Track unit sales
        const unitId = sale.unit?.unitId || sale.unit?.id || 'unknown';
        const unitName = sale.unit?.name || sale.unit?.unitType || 'Unknown Unit';

        let unitIndex = property.units.findIndex(u => u.unitId === unitId);
        if (unitIndex === -1) {
            property.units.push({
                unitId,
                unitName,
                salesCount: 0,
                totalValue: 0,
                agents: {}
            });
            unitIndex = property.units.length - 1;
        }

        property.units[unitIndex].salesCount += 1;
        property.units[unitIndex].totalValue += salePrice;

        // Track agent performance
        if (agentId) {
            let agentIndex = property.agents.findIndex(a => a.agentId === agentId);
            if (agentIndex === -1) {
                property.agents.push({
                    agentId,
                    agentName,
                    salesCount: 0,
                    totalValue: 0
                });
                agentIndex = property.agents.length - 1;
            }

            property.agents[agentIndex].salesCount += 1;
            property.agents[agentIndex].totalValue += salePrice;

            // Add to unit agent tracking
            if (!property.units[unitIndex].agents[agentId]) {
                property.units[unitIndex].agents[agentId] = {
                    agentId,
                    agentName,
                    salesCount: 0,
                    totalValue: 0
                };
            }
            property.units[unitIndex].agents[agentId].salesCount += 1;
            property.units[unitIndex].agents[agentId].totalValue += salePrice;
        }
    });

    // Convert to arrays for rendering
    const propertySalesData = Object.values(propertyMap).map(property => {
        // Find top agent for this property
        let topAgent = null;
        if (property.agents.length > 0) {
            topAgent = [...property.agents].sort((a, b) => b.salesCount - a.salesCount)[0];
        }

        return {
            ...property,
            topAgent,
            percentage: totalSaleValue > 0 ? ((property.totalValue / totalSaleValue) * 100).toFixed(1) : 0
        };
    }).sort((a, b) => b.totalValue - a.totalValue);

    return propertySalesData;
};

/**
 * Generate portfolio progress report
 * @param salesData - Raw sales data 
 * @param propertiesData - Properties data
 * @param dateRange - Date range for filtering
 * @param selectedProperties - Selected property IDs
 * @returns Processed portfolio progress data
 */
export const generatePortfolioProgressReport = (
    salesData: Sale[],
    propertiesData: Property[],
    dateRange: [Moment | null, Moment | null],
    selectedProperties: string[]
): PortfolioProperty[] => {
    if (!propertiesData.length) return [];

    // Filter by selected properties if any
    let filteredProperties = propertiesData;
    if (selectedProperties.length > 0) {
        filteredProperties = propertiesData.filter(property => {
            const propertyId = property._id || property.id;
            return selectedProperties.includes(propertyId!);
        });
    }

    // Filter sales by date range
    const [startDate, endDate] = dateRange || [null, null];
    let filteredSales = salesData;
    if (startDate && endDate) {
        filteredSales = salesData.filter(sale => {
            const saleDate = moment(sale.saleDate || sale.createdAt);
            return saleDate.isBetween(startDate, endDate, null, '[]');
        });
    }

    // Extract all properties with their units
    const propertyUnitsMap: Record<string, PortfolioProperty> = {};

    // First, build a complete inventory of all units
    filteredProperties.forEach(property => {
        const propertyId = property._id || property.id || 'unknown';
        const propertyName = property.name || 'Unknown Property';

        if (!propertyUnitsMap[propertyId!]) {
            propertyUnitsMap[propertyId!] = {
                propertyId: propertyId!,
                propertyName,
                location: property.location || 'Unknown Location',
                propertyType: property.propertyType || 'Unknown Type',
                totalUnits: 0,
                soldUnits: 0,
                reservedUnits: 0,
                availableUnits: 0,
                totalValue: 0,
                soldValue: 0,
                pendingValue: 0,
                availableValue: 0,
                salesProgress: '0',
                units: []
            };
        }

        // Add all units from the property
        if (property.units && Array.isArray(property.units)) {
            property.units.forEach(unit => {
                const unitId = unit._id || unit.id || 'unknown';
                const totalUnitCount = unit.totalUnits || 0;
                const availableUnitCount = unit.availableUnits || 0;
                const soldUnitCount = totalUnitCount - availableUnitCount;
                const unitPrice = parseFloat(unit.price?.toString() || '0');
                const totalUnitValue = unitPrice * totalUnitCount;
                const soldUnitValue = unitPrice * soldUnitCount;
                const availableUnitValue = unitPrice * availableUnitCount;

                propertyUnitsMap[propertyId!].totalUnits += totalUnitCount;
                propertyUnitsMap[propertyId!].soldUnits += soldUnitCount;
                propertyUnitsMap[propertyId!].availableUnits += availableUnitCount;
                propertyUnitsMap[propertyId!].totalValue += totalUnitValue;
                propertyUnitsMap[propertyId!].soldValue += soldUnitValue;
                propertyUnitsMap[propertyId!].availableValue += availableUnitValue;

                propertyUnitsMap[propertyId!].units.push({
                    unitId: unitId,
                    unitType: unit.unitType || 'Unknown Type',
                    plotSize: unit.plotSize || 'N/A',
                    price: unitPrice,
                    totalUnits: totalUnitCount,
                    availableUnits: availableUnitCount,
                    soldUnits: soldUnitCount,
                    reservedUnits: unit.reservedUnits || 0,
                    totalValue: totalUnitValue,
                    soldValue: soldUnitValue,
                    availableValue: availableUnitValue,
                    status: unit.status || 'available',
                    salesProgress: totalUnitCount > 0 ? ((soldUnitCount / totalUnitCount) * 100).toFixed(1) : '0',
                    sales: [] // Will be populated with sales data
                });
            });
        }
    });

    // Now, add sales data to each unit
    filteredSales.forEach(sale => {
        if (!sale.property || !sale.unit) return;

        const propertyId = sale.property._id || sale.property.id;
        const unitId = sale.unit.unitId || sale.unit._id || sale.unit.id;

        if (propertyUnitsMap[propertyId!]) {
            const unitIndex = propertyUnitsMap[propertyId!].units.findIndex(u => u.unitId === unitId);

            if (unitIndex !== -1) {
                const saleData = {
                    saleId: sale._id || sale.id || '',
                    saleCode: sale.saleCode || 'N/A',
                    customer: sale.customer?.name || 'Unknown Customer',
                    saleDate: sale.saleDate || sale.createdAt || '',
                    salePrice: parseFloat(sale.salePrice.toString()) || 0,
                    quantity: sale.quantity || 1,
                    agentName: sale.salesAgent?.name || 'Unknown Agent',
                    agentId: sale.salesAgent?._id || sale.salesAgent?.id,
                    status: sale.status || 'pending'
                };

                propertyUnitsMap[propertyId!].units[unitIndex].sales.push(saleData);
            }
        }
    });

    // Convert to array for rendering and calculate overall sales progress
    return Object.values(propertyUnitsMap)
        .filter(property => property.totalUnits > 0) // Only include properties with units
        .map(property => {
            const salesProgress = property.totalUnits > 0
                ? ((property.soldUnits / property.totalUnits) * 100).toFixed(1)
                : '0';

            return {
                ...property,
                salesProgress
            };
        })
        .sort((a, b) => Number(b.salesProgress) - Number(a.salesProgress));
};

/**
 * Generate aging balances report
 * @param salesData - Raw sales data
 * @param dateRange - Date range for filtering
 * @param selectedAgingFilter - Aging filter
 * @param selectedProperties - Selected property IDs
 * @returns Processed aging balances data
 */
export const generateAgingBalancesReport = (
    salesData: Sale[],
    dateRange: [Moment | null, Moment | null],
    selectedAgingFilter: string,
    selectedProperties: string[]
): AgingBalance[] => {
    if (!salesData.length) return [];

    // Filter for sales with outstanding balances
    let filteredSales = salesData.filter(sale => {
        // Calculate total paid amount across all payment plans
        let totalPaid = 0;

        if (sale.paymentPlans && Array.isArray(sale.paymentPlans)) {
            sale.paymentPlans.forEach(plan => {
                if (plan.payments && Array.isArray(plan.payments)) {
                    totalPaid += plan.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                }
            });
        }

        // Consider payments array if it exists (flattened payments)
        if (sale.payments && Array.isArray(sale.payments)) {
            totalPaid = sale.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        }

        const salePrice = parseFloat(sale.salePrice.toString()) || 0;
        const outstandingBalance = salePrice - totalPaid;

        // Only include sales with outstanding balance
        return outstandingBalance > 0;
    });

    // Filter by date range
    const [startDate, endDate] = dateRange || [null, null];
    if (startDate && endDate) {
        filteredSales = filteredSales.filter(sale => {
            const saleDate = moment(sale.saleDate || sale.createdAt);
            return saleDate.isBetween(startDate, endDate, null, '[]');
        });
    }

    // Filter by selected properties if any
    if (selectedProperties.length > 0) {
        filteredSales = filteredSales.filter(sale => {
            const propertyId = sale.property?._id || sale.property?.id;
            return selectedProperties.includes(propertyId!);
        });
    }

    // Filter by aging periods if specified
    if (selectedAgingFilter !== 'all') {
        filteredSales = filteredSales.filter(sale => {
            const saleDate = moment(sale.saleDate || sale.createdAt);
            const today = moment();
            const daysDiff = today.diff(saleDate, 'days');

            switch (selectedAgingFilter) {
                case '0-30':
                    return daysDiff <= 30;
                case '31-60':
                    return daysDiff > 30 && daysDiff <= 60;
                case '61-90':
                    return daysDiff > 60 && daysDiff <= 90;
                case '91-plus':
                    return daysDiff > 90;
                default:
                    return true;
            }
        });
    }

    // Process each sale to calculate aging data
    return filteredSales.map(sale => {
        // Calculate total paid amount
        let totalPaid = 0;
        if (sale.paymentPlans && Array.isArray(sale.paymentPlans)) {
            sale.paymentPlans.forEach(plan => {
                if (plan.payments && Array.isArray(plan.payments)) {
                    totalPaid += plan.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                }
            });
        }

        // Use payments array if it exists
        if (sale.payments && Array.isArray(sale.payments)) {
            totalPaid = sale.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        }

        const salePrice = parseFloat(sale.salePrice.toString()) || 0;
        const outstandingBalance = salePrice - totalPaid;
        const saleDate = moment(sale.saleDate || sale.createdAt);
        const today = moment();
        const daysSinceSale = today.diff(saleDate, 'days');

        // Determine aging period
        let agingPeriod = '';
        if (daysSinceSale <= 30) {
            agingPeriod = '0-30 days';
        } else if (daysSinceSale <= 60) {
            agingPeriod = '31-60 days';
        } else if (daysSinceSale <= 90) {
            agingPeriod = '61-90 days';
        } else {
            agingPeriod = '90+ days';
        }

        return {
            saleId: sale._id || sale.id || '',
            saleCode: sale.saleCode || 'N/A',
            customerName: sale.customer?.name || 'Unknown Customer',
            customerId: sale.customer?._id || sale.customer?.id,
            customerContact: sale.customer?.phone || sale.customer?.email || 'N/A',
            propertyName: sale.property?.name || 'Unknown Property',
            propertyId: sale.property?._id || sale.property?.id,
            unitType: sale.unit?.unitType || 'Unknown Unit',
            saleDate: sale.saleDate || sale.createdAt || '',
            salePrice: salePrice,
            totalPaid: totalPaid,
            outstandingBalance: outstandingBalance,
            paymentProgress: salePrice > 0 ? ((totalPaid / salePrice) * 100).toFixed(1) : '0',
            daysSinceSale: daysSinceSale,
            agingPeriod: agingPeriod,
            status: sale.status || 'pending',
            paymentPlans: sale.paymentPlans || [],
            agentName: sale.salesAgent?.name || 'Unknown Agent'
        };
    }).sort((a, b) => b.outstandingBalance - a.outstandingBalance);
};

/**
 * Generate performance trends report
 * @param salesData - Raw sales data
 * @param dateRange - Date range for filtering
 * @returns Processed performance trends data
 */
export const generatePerformanceTrendsReport = (
    salesData: Sale[],
    dateRange: [Moment | null, Moment | null]
): PerformanceTrends => {
    if (!salesData.length) {
        return {
            monthlyData: [],
            agentData: []
        };
    }

    const [startDate, endDate] = dateRange || [null, null];
    if (!startDate || !endDate) {
        return {
            monthlyData: [],
            agentData: []
        };
    }

    // Group sales by month
    const monthlySales: Record<string, MonthlyPerformance> = {};
    const agentPerformance: Record<string, AgentPerformance> = {};

    salesData.forEach(sale => {
        const saleDate = moment(sale.saleDate || sale.createdAt);
        if (!saleDate.isBetween(startDate, endDate, null, '[]')) return;

        const yearMonth = saleDate.format('YYYY-MM');
        const monthName = saleDate.format('MMM YYYY');
        const salePrice = parseFloat(sale.salePrice.toString()) || 0;

        // Initialize month data if not exists
        if (!monthlySales[yearMonth]) {
            monthlySales[yearMonth] = {
                yearMonth,
                monthName,
                salesCount: 0,
                salesValue: 0,
                agentSales: {}
            };
        }

        // Update monthly totals
        monthlySales[yearMonth].salesCount += 1;
        monthlySales[yearMonth].salesValue += salePrice;

        // Track agent performance
        const agentId = sale.salesAgent?._id || sale.salesAgent?.id || sale.agent || '';
        const agentName = sale.salesAgent?.name || 'Unknown Agent';

        if (agentId) {
            // Add agent to monthly tracking
            if (!monthlySales[yearMonth].agentSales[agentId]) {
                monthlySales[yearMonth].agentSales[agentId] = {
                    agentId,
                    agentName,
                    salesCount: 0,
                    salesValue: 0
                };
            }

            monthlySales[yearMonth].agentSales[agentId].salesCount += 1;
            monthlySales[yearMonth].agentSales[agentId].salesValue += salePrice;

            // Add agent to overall tracking
            if (!agentPerformance[agentId]) {
                agentPerformance[agentId] = {
                    agentId,
                    agentName,
                    monthlySales: [],
                    totalSales: 0,
                    totalValue: 0
                };
            }

            agentPerformance[agentId].totalSales += 1;
            agentPerformance[agentId].totalValue += salePrice;
        }
    });

    // Convert to arrays and sort
    const monthlyData = Object.values(monthlySales).sort((a, b) =>
        moment(a.yearMonth).diff(moment(b.yearMonth))
    );

    // Process agent performance data
    const agentData = Object.values(agentPerformance)
        .sort((a, b) => b.totalValue - a.totalValue)
        .map(agent => {
            // Convert agent's monthly sales to array and ensure all months are represented
            const agentMonthlyData: MonthlyPerformance[] = [];

            // For each month in the range, find agent's data or create empty data
            monthlyData.forEach(month => {
                const yearMonth = month.yearMonth;
                const monthAgentData = monthlySales[yearMonth].agentSales[agent.agentId];

                if (monthAgentData) {
                    agentMonthlyData.push({
                        yearMonth,
                        monthName: month.monthName,
                        salesCount: monthAgentData.salesCount,
                        salesValue: monthAgentData.salesValue,
                        agentSales: {}
                    });
                } else {
                    agentMonthlyData.push({
                        yearMonth,
                        monthName: month.monthName,
                        salesCount: 0,
                        salesValue: 0,
                        agentSales: {}
                    });
                }
            });

            return {
                ...agent,
                monthlySales: agentMonthlyData.sort((a, b) =>
                    moment(a.yearMonth).diff(moment(b.yearMonth))
                )
            };
        });

    return {
        monthlyData,
        agentData
    };
};