import { fetchAllProperties } from '@/services/property';
import {
    DollarOutlined,
    BankOutlined,
    CheckCircleOutlined,
    HomeOutlined,
    BarChartOutlined,
    ApartmentOutlined
} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Row, Col, Card, Statistic, Empty, Tabs, Skeleton } from 'antd';
import React, { useMemo } from 'react';

const PropertyOverviewStats = ({ statistics, loading }) => {
    const {
        totalCount,
        availableCount,
        soldCount,
        reservedCount
    } = statistics;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Total Properties"
                            value={totalCount}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<BankOutlined />}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Available Properties"
                            value={availableCount}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                            suffix={`/ ${totalCount}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Reserved Properties"
                            value={reservedCount}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<HomeOutlined />}
                            suffix={`/ ${totalCount}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Sold Properties"
                            value={soldCount}
                            valueStyle={{ color: '#f5222d' }}
                            prefix={<DollarOutlined />}
                            suffix={`/ ${totalCount}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
        </Row>
    );
};

const UnitStats = ({ statistics, loading }) => {
    const {
        totalUnits,
        availableUnits,
        soldUnits,
        reservedUnits,
        occupancyRate
    } = statistics;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Available Units"
                            value={availableUnits}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                            suffix={`/ ${totalUnits}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Reserved Units"
                            value={reservedUnits}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<HomeOutlined />}
                            suffix={`/ ${totalUnits}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Sold Units"
                            value={soldUnits}
                            valueStyle={{ color: '#f5222d' }}
                            prefix={<DollarOutlined />}
                            suffix={`/ ${totalUnits}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Occupancy Rate"
                            value={occupancyRate}
                            valueStyle={{ color: occupancyRate > 75 ? '#52c41a' : occupancyRate > 50 ? '#faad14' : '#f5222d' }}
                            prefix={<HomeOutlined />}
                            suffix="%"
                        />
                    </Skeleton>
                </Card>
            </Col>
        </Row>
    );
};

const FinancialStats = ({ statistics, loading }) => {
    const {
        totalValue,
        totalUnits,
        soldUnits,
        currentPhaseValue,
        nextPhaseValue
    } = statistics;

    // Calculate additional financial metrics
    const averageUnitValue = totalUnits > 0 ? totalValue / totalUnits : 0;
    const soldValue = soldUnits > 0 ? (soldUnits / totalUnits) * totalValue : 0;
    // const remainingValue = totalValue - soldValue;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Total Portfolio Value (KES)"
                            value={totalValue}
                            valueStyle={{ color: '#1890ff' }}
                            formatter={(value) => `${value.toLocaleString(undefined,{maximumFractionDigits: 0})}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Avg. Unit Value (KES)"
                            value={averageUnitValue}
                            valueStyle={{ color: '#722ed1' }}
                            formatter={(value) => `${value.toLocaleString(undefined,{maximumFractionDigits: 0})}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Current Phase Value (KES)"
                            value={currentPhaseValue}
                            valueStyle={{ color: '#f5222d' }}
                            formatter={(value) => `${value.toLocaleString(undefined,{maximumFractionDigits: 0})}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="h-full">
                    <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                        <Statistic
                            title="Next Phase Value (KES)"
                            value={nextPhaseValue}
                            valueStyle={{ color: '#52c41a' }}
                            formatter={(value) => `${value.toLocaleString(undefined,{maximumFractionDigits: 0})}`}
                        />
                    </Skeleton>
                </Card>
            </Col>
        </Row>
    );
};


function PropertyStats() {
    const { data: propertiesData, loading, error } = useRequest(fetchAllProperties, {
        cacheKey: 'property-managers',
        staleTime: 5 * 60 * 1000,
        refreshOnWindowFocus: true,
    });

    // Memoized calculations to prevent recalculations on each render
    const statistics = useMemo(() => {
        if (!propertiesData) {
            return {
                totalValue: 0,
                currentPhaseValue: 0,
                nextPhaseValue: 0,
                totalCount: 0,
                availableCount: 0,
                soldCount: 0,
                reservedCount: 0,
                totalUnits: 0,
                availableUnits: 0,
                soldUnits: 0,
                reservedUnits: 0,
                occupancyRate: 0
            };
        }

        let totalValue = 0;
        let currentPhaseValue = 0;
        let nextPhaseValue = 0;
        let totalUnits = 0;
        let availableUnits = 0;
        let reservedUnits = 0;
        let soldUnits = 0;

        // Property counts
        const totalCount = propertiesData.length;
        const availableCount = propertiesData.filter(property => property.status === 'available').length;
        const reservedCount = propertiesData.filter(property => property.status === 'reserved').length;
        const soldCount = propertiesData.filter(property => property.status === 'sold').length;

        // Calculate unit statistics and values based on the property data structure
        propertiesData.forEach(property => {
            if (property.units && Array.isArray(property.units)) {
                property.units.forEach(unit => {
                    // Get current phase pricing
                    const currentPhasePrice = unit.phasePricing.find(
                        phase => phase.phaseName === property.currentPhase && phase.active
                    )?.price || 0;

                    // Get next phase pricing
                    const nextPhasePrice = unit.phasePricing.find(
                        phase => phase.phaseName !== property.currentPhase
                    )?.price || 0;

                    // Add to total units
                    const unitTotal = unit.totalUnits || 0;
                    totalUnits += unitTotal;

                    // Add to available units
                    const unitAvailable = unit.availableUnits || 0;
                    availableUnits += unitAvailable;

                    // Calculate reserved units
                    const unitReserved = unit.status === 'reserved' ? (unitTotal - unitAvailable) : 0;
                    reservedUnits += unitReserved;

                    // Calculate value based on current phase pricing
                    totalValue += currentPhasePrice * unitTotal;
                    currentPhaseValue += currentPhasePrice * unitTotal;
                    nextPhaseValue += nextPhasePrice * unitTotal;
                });
            }
        });

        // Calculate sold units as total minus available and reserved
        soldUnits = totalUnits - availableUnits - reservedUnits;

        // Calculate occupancy rate
        const occupancyRate = totalUnits > 0 ? Math.round(((totalUnits - availableUnits) / totalUnits) * 100) : 0;

        return {
            totalValue,
            currentPhaseValue,
            nextPhaseValue,
            totalCount,
            availableCount,
            soldCount,
            reservedCount,
            totalUnits,
            availableUnits,
            soldUnits,
            reservedUnits,
            occupancyRate
        };
    }, [propertiesData]);


    if (error) {
        return (
            <Empty
                description="Failed to load property statistics"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    // Define tab items
    const items = [
        {
            key: "1",
            label: (
                <span className="flex items-center">
                    <BankOutlined className="mr-2" />
                    Property Overview
                </span>
            ),
            children: (
                <PropertyOverviewStats statistics={statistics} loading={loading} />
            )
        },
        {
            key: "2",
            label: (
                <span className="flex items-center">
                    <ApartmentOutlined className="mr-2" />
                    Units Breakdown
                </span>
            ),
            children: (
                <UnitStats statistics={statistics} loading={loading} />
            )
        },
        {
            key: "3",
            label: (
                <span className="flex items-center">
                    <BarChartOutlined className="mr-2" />
                    Financial Metrics
                </span>
            ),
            children: (
                <FinancialStats statistics={statistics} loading={loading} />
            )
        }
    ];

    return <Tabs defaultActiveKey="1" items={items} className="mb-4" />;
}
export default PropertyStats;