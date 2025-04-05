// Example of how to update your FiltersContext
import React, { createContext, useContext, useState } from 'react';
import moment, { Moment } from 'moment';

// Types
type PaymentStatus = 'all' | 'due' | 'overdue' | 'paid' | 'partial';
type PaymentType = 'all' | 'deposit' | 'installment' | 'final';
type FilterType = 'all' | 'paid' | 'partial' | 'unpaid';

interface FiltersContextType {
    // Existing filters
    dateRange: [Moment | null, Moment | null];
    setDateRange: (range: [Moment | null, Moment | null]) => void;
    selectedAgents: string[];
    setSelectedAgents: (agents: string[]) => void;
    selectedProperties: string[];
    setSelectedProperties: (properties: string[]) => void;
    filterType: FilterType;
    setFilterType: (type: FilterType) => void;
    selectedAgingFilter: string;
    setSelectedAgingFilter: (filter: string) => void;

    // Add these payment-specific filters
    paymentStatus: PaymentStatus;
    setPaymentStatus: (status: PaymentStatus) => void;
    paymentType: PaymentType;
    setPaymentType: (type: PaymentType) => void;
    paymentThreshold: number;
    setPaymentThreshold: (threshold: number) => void;

    // Add a refresh function
    refreshKey: number;
    refreshData: () => void;
}

// Default values
const defaultFilters: FiltersContextType = {
    dateRange: [moment().startOf('month'), moment().add(3, 'months')],
    setDateRange: () => { },
    selectedAgents: [],
    setSelectedAgents: () => { },
    selectedProperties: [],
    setSelectedProperties: () => { },
    filterType: 'all',
    setFilterType: () => { },
    selectedAgingFilter: 'all',
    setSelectedAgingFilter: () => { },

    // Payment filter defaults
    paymentStatus: 'all',
    setPaymentStatus: () => { },
    paymentType: 'all',
    setPaymentType: () => { },
    paymentThreshold: 0,
    setPaymentThreshold: () => { },

    refreshKey: 0,
    refreshData: () => { },
};

// Create context
const FiltersContext = createContext<FiltersContextType>(defaultFilters);

// Provider component
export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State for existing filters
    const [dateRange, setDateRange] = useState<[Moment | null, Moment | null]>(defaultFilters.dateRange);
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [selectedAgingFilter, setSelectedAgingFilter] = useState('all');

    // State for payment filters
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('all');
    const [paymentType, setPaymentType] = useState<PaymentType>('all');
    const [paymentThreshold, setPaymentThreshold] = useState(0);

    // Add a refresh key
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh function to force components to update
    const refreshData = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <FiltersContext.Provider
            value={{
                dateRange,
                setDateRange,
                selectedAgents,
                setSelectedAgents,
                selectedProperties,
                setSelectedProperties,
                filterType,
                setFilterType,
                selectedAgingFilter,
                setSelectedAgingFilter,

                // Add payment filters to context
                paymentStatus,
                setPaymentStatus,
                paymentType,
                setPaymentType,
                paymentThreshold,
                setPaymentThreshold,

                refreshKey,
                refreshData,
            }}
        >
            {children}
        </FiltersContext.Provider>
    );
};

// Custom hook to use filters
export const useFilters = () => useContext(FiltersContext);

export default FiltersContext;