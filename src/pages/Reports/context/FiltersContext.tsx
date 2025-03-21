import React, { createContext, useContext, useState, ReactNode } from 'react';
import moment, { Moment } from 'moment';
import {
    FiltersContextType,
    FilterType,
    AgingFilter
} from '../components/types';

// Create context with default values
const FiltersContext = createContext<FiltersContextType>({
    dateRange: [moment().startOf('month'), moment()],
    setDateRange: () => { },
    selectedAgents: [],
    setSelectedAgents: () => { },
    selectedProperties: [],
    setSelectedProperties: () => { },
    filterType: 'all',
    setFilterType: () => { },
    selectedAgingFilter: 'all',
    setSelectedAgingFilter: () => { },
    refreshKey: 0,
    refreshData: () => { },
});

interface FiltersProviderProps {
    children: ReactNode;
}

export const FiltersProvider: React.FC<FiltersProviderProps> = ({ children }) => {
    // State for filters
    const [dateRange, setDateRange] = useState<[Moment | null, Moment | null]>([
        moment().startOf('month'),
        moment()
    ]);
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [selectedAgingFilter, setSelectedAgingFilter] = useState<AgingFilter>('all');
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshData = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    const contextValue: FiltersContextType = {
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
        refreshKey,
        refreshData,
    };

    return (
        <FiltersContext.Provider value={contextValue}>
            {children}
        </FiltersContext.Provider>
    );
};

// Custom hook to use the filters context
export const useFilters = () => useContext(FiltersContext);