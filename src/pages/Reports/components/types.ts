import { Moment } from 'moment';

// Basic Types
export type TabKey = 'agent-commissions' | 'sales-analysis' | 'portfolio-progress' | 'aging-balances' | 'performance-trends' | 'due-payments' | 'payment-statistics' | 'payment-forecasts';
export type FilterType = 'all' | 'paid' | 'partial' | 'unpaid';
export type AgingFilter = 'all' | '0-30' | '31-60' | '61-90' | '91-plus';
export type PaymentStatus = 'all' | 'due' | 'overdue' | 'paid' | 'partial';
export type PaymentType = 'all' | 'installment' | 'deposit' | 'final';
export type SortOrder = 'dueDate' | 'amount' | 'customer';

// Report Data Types
export interface User {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
    role?: string;
}

export interface Property {
    _id?: string;
    id?: string;
    name: string;
    location?: string;
    propertyType?: string;
    units?: Unit[];
}

export interface Unit {
    _id?: string;
    id?: string;
    unitId?: string;
    name?: string;
    unitType?: string;
    price?: number;
    totalUnits?: number;
    availableUnits?: number;
    reservedUnits?: number;
    status?: string;
    plotSize?: string;
}

export interface Customer {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
    phone?: string;
}

export interface Payment {
    _id?: string;
    id?: string;
    amount: number;
    date: string;
    method?: string;
    reference?: string;
    notes?: string;
}

export interface Commission {
    percentage?: number;
    amount?: number;
    status?: string;
    payments?: Payment[];
}

export interface PaymentPlan {
    _id?: string;
    id?: string;
    name?: string;
    type: string;
    amount: number;
    dueDate: string;
    status?: string;
    paidAmount?: number;
    remainingAmount?: number;
    payments: Payment[];
}

export interface Sale {
    _id?: string;
    id?: string;
    saleCode?: string;
    saleDate?: string;
    createdAt?: string;
    salePrice: number;
    status?: string;
    quantity?: number;
    property?: Property;
    unit?: Unit;
    customer?: Customer;
    salesAgent?: User;
    agent?: string;
    commission?: Commission;
    paymentPlans?: PaymentPlan[];
    payments?: Payment[];
    remainingBalance?: number;
    totalPaid?: number;
}

// Processed Report Data Types
export interface AgentSaleDetails {
    saleId: string;
    saleCode: string;
    property: string;
    propertyId?: string;
    customer: string;
    saleDate: string;
    salePrice: number;
    commissionPercentage: number;
    commissionAmount: number;
    commissionPaid: number;
    commissionPending: number;
    commissionStatus: string;
    commissionPayments: Payment[];
    paymentProgress: string | number;
    unit: string;
    unitId?: string;
    quantity: number;
    saleData: Sale;
}

export interface AgentCommissionReport {
    agentId: string;
    agentName: string;
    agentEmail: string;
    totalSales: number;
    totalSaleValue: number;
    totalCommission: number;
    totalCommissionPaid: number;
    totalCommissionPending: number;
    commissionPaymentCount: number;
    sales: AgentSaleDetails[];
}

export interface PropertyAnalysis {
    propertyId: string;
    propertyName: string;
    salesCount: number;
    totalValue: number;
    units: UnitAnalysis[];
    agents: AgentAnalysis[];
    topAgent: AgentAnalysis | null;
    percentage: number | string;
}

export interface UnitAnalysis {
    unitId: string;
    unitName: string;
    salesCount: number;
    totalValue: number;
    agents: Record<string, AgentAnalysis>;
}

export interface AgentAnalysis {
    agentId: string;
    agentName: string;
    salesCount: number;
    totalValue: number;
}

export interface PortfolioProperty {
    propertyId: string;
    propertyName: string;
    location: string;
    propertyType: string;
    totalUnits: number;
    soldUnits: number;
    reservedUnits: number;
    availableUnits: number;
    totalValue: number;
    soldValue: number;
    pendingValue: number;
    availableValue: number;
    salesProgress: number | string;
    units: PortfolioUnit[];
}

export interface PortfolioUnit {
    unitId: string;
    unitType: string;
    plotSize: string;
    price: number;
    totalUnits: number;
    availableUnits: number;
    soldUnits: number;
    reservedUnits: number;
    totalValue: number;
    soldValue: number;
    availableValue: number;
    status: string;
    salesProgress: number | string;
    sales: UnitSale[];
}

export interface UnitSale {
    saleId: string;
    saleCode: string;
    customer: string;
    saleDate: string;
    salePrice: number;
    quantity: number;
    agentName: string;
    agentId?: string;
    status: string;
}

export interface AgingBalance {
    saleId: string;
    saleCode: string;
    customerName: string;
    customerId?: string;
    customerContact: string;
    propertyName: string;
    propertyId?: string;
    unitType: string;
    saleDate: string;
    salePrice: number;
    totalPaid: number;
    outstandingBalance: number;
    paymentProgress: number | string;
    daysSinceSale: number;
    agingPeriod: string;
    status: string;
    paymentPlans: any[];
    agentName: string;
}

export interface AgingSummary {
    total: number;
    totalOutstanding: number;
    aging: {
        '0-30': { count: number; value: number };
        '31-60': { count: number; value: number };
        '61-90': { count: number; value: number };
        '90+': { count: number; value: number };
    };
}

export interface MonthlyPerformance {
    yearMonth: string;
    monthName: string;
    salesCount: number;
    salesValue: number;
    agentSales: Record<string, AgentMonthlyPerformance>;
}

export interface AgentMonthlyPerformance {
    agentId: string;
    agentName: string;
    salesCount: number;
    salesValue: number;
}

export interface AgentPerformance {
    agentId: string;
    agentName: string;
    monthlySales: MonthlyPerformance[];
    totalSales: number;
    totalValue: number;
}

export interface PerformanceTrends {
    monthlyData: MonthlyPerformance[];
    agentData: AgentPerformance[];
}

// Payment Analysis Types
export interface DuePaymentItem {
    id: string;
    saleId: string;
    saleCode: string;
    planType: string;
    propertyName: string;
    propertyId?: string;
    customerName: string;
    customerId?: string;
    customerContact: string;
    agentName: string;
    agentId?: string;
    dueDate: string;
    paymentAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    daysUntilDue: number;
    daysOverdue: number;
    progress: number;
    sale: Sale;
    paymentPlan: PaymentPlan;
}

export interface DuePaymentsSummary {
    totalDuePayments: number;
    totalDueAmount: number;
    totalOverduePayments: number;
    totalOverdueAmount: number;
    upcomingDuePayments: number;
    upcomingDueAmount: number;
    averageDaysOverdue: number;
}

export interface PaymentMethodBreakdown {
    method: string;
    count: number;
    amount: number;
}

export interface PaymentTypeBreakdown {
    type: string;
    count: number;
    amount: number;
}

export interface MonthlyCollection {
    month: string;
    monthDisplay: string;
    count: number;
    amount: number;
}

export interface PaymentStatistics {
    collectionRate: number;
    totalPayments: number;
    totalAmountCollected: number;
    totalSalesValue: number;
    paymentMethodBreakdown: PaymentMethodBreakdown[];
    paymentTypeBreakdown: PaymentTypeBreakdown[];
    monthlyCollections: MonthlyCollection[];
}

export interface PaymentForecast {
    month: string;
    monthDisplay: string;
    expectedAmount: number;
    duePayments: number;
    salesTarget?: number;
    cashflowTarget?: number;
}

// Context and Props Types
export interface FiltersContextType {
    dateRange: [Moment | null, Moment | null];
    setDateRange: (range: [Moment | null, Moment | null]) => void;
    selectedAgents: string[];
    setSelectedAgents: (agents: string[]) => void;
    selectedProperties: string[];
    setSelectedProperties: (properties: string[]) => void;
    filterType: FilterType;
    setFilterType: (type: FilterType) => void;
    selectedAgingFilter: AgingFilter;
    setSelectedAgingFilter: (filter: AgingFilter) => void;
    refreshKey: number;
    refreshData: () => void;
}

// Extended Props Types for Payment Analysis Tabs
export interface DuePaymentsTabProps {
    salesData: Sale[];
    propertiesData: Property[];
    isLoading: boolean;
    paymentStatus?: PaymentStatus;
    paymentType?: PaymentType;
}

export interface PaymentStatisticsTabProps {
    salesData: Sale[];
    isLoading: boolean;
}

export interface PaymentForecastsTabProps {
    salesData: Sale[];
    isLoading: boolean;
}

export interface ReportTabsProps {
    activeTab: TabKey;
    setActiveTab: (key: TabKey) => void;
    salesData: Sale[];
    usersData: User[];
    propertiesData: Property[];
    isLoadingSales: boolean;
    isLoadingUsers: boolean;
    isLoadingProperties: boolean;
    refetchSales: () => void;
}