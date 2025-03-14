import React, { useState, useEffect } from 'react';
import {
    Calendar, Badge, Modal, Row, Col, Card,
    Typography, Avatar, List, Tabs, Tag, Tooltip, message, Button
} from 'antd';
import {
    CalendarOutlined, ClockCircleOutlined, UserOutlined, BellOutlined,
    HomeOutlined, ShopOutlined, PhoneOutlined, TeamOutlined,
    EnvironmentOutlined, DollarOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { fetchAllSales } from '@/services/sales';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Main Calendar Component
const EventCalendar = () => {
    const [salesActivities, setSalesActivities] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [selectedView, setSelectedView] = useState('week'); // Default to weekly view
    const [currentDate, setCurrentDate] = useState(moment());

    // Create a ref to hold the Ant Design Calendar instance
    const [calendarMode, setCalendarMode] = useState('week'); // This tracks the actual calendar mode

    // Fetch sales activities from API
    const { data: salesDataValue = {
        salesActivities: []
    }, isLoading } = useQuery({
        queryKey: ['calendar-sales'],
        queryFn: async () => {
            try {
                const response = await fetchAllSales();

                // Extract activities from sales data
                const activities = [];

                if (response.data && Array.isArray(response.data)) {
                    response.data.forEach(sale => {
                        if (sale.activities && Array.isArray(sale.activities)) {
                            sale.activities.forEach(activity => {
                                activities.push({
                                    saleId: sale._id,
                                    property: sale.property?.name || 'Unknown Property',
                                    propertyLocation: sale.property?.location?.address || 'Unknown Location',
                                    customer: sale.customer?.name || 'Unknown Customer',
                                    salesAgent: sale.salesAgent?.name || 'Unknown Agent',
                                    activityType: activity.activityType,
                                    date: activity.date || sale.saleDate,
                                    description: activity.description,
                                    byId: activity.by?._id,
                                    byName: activity.by?.name
                                });
                            });
                        }

                        // Add sale date as an activity if it doesn't already exist
                        const saleActivity = sale.activities?.find(act =>
                            act.activityType === 'Sale Agreement' &&
                            moment(act.date).isSame(moment(sale.saleDate), 'day')
                        );

                        if (!saleActivity) {
                            activities.push({
                                saleId: sale._id,
                                activityType: 'Sale Agreement',
                                date: sale.saleDate,
                                description: `Sale of ${sale.property?.name || 'property'} to ${sale.customer?.name || 'customer'}`,
                                property: sale.property?.name || 'Unknown Property',
                                propertyLocation: sale.property?.location?.address || 'Unknown Location',
                                customer: sale.customer?.name || 'Unknown Customer',
                                salesAgent: sale.salesAgent?.name || 'Unknown Agent',
                                byName: sale.salesAgent?.name || 'Unknown Agent',
                                amount: sale.salePrice
                            });
                        }

                        // Only add payment followup if there's no upcoming payment activity
                        const hasUpcomingPayment = sale.activities?.some(act =>
                            act.activityType === 'Payment' &&
                            moment(act.date).isAfter(moment())
                        );

                        if (!hasUpcomingPayment) {
                            const paymentDate = moment(sale.saleDate).add(1, 'month');
                            activities.push({
                                saleId: sale._id,
                                activityType: 'Payment',
                                date: paymentDate.toDate(),
                                description: `Payment follow-up for ${sale.property?.name || 'property'}`,
                                property: sale.property?.name || 'Unknown Property',
                                propertyLocation: sale.property?.location?.address || 'Unknown Location',
                                customer: sale.customer?.name || 'Unknown Customer',
                                salesAgent: sale.salesAgent?.name || 'Unknown Agent',
                                byName: sale.salesAgent?.name || 'Unknown Agent'
                            });
                        }
                    });
                }

                // Create some sample activities if none exist
                if (activities.length === 0) {
                    const today = moment();

                    // Add some sample activities distributed across different days
                    // Today
                    activities.push({
                        saleId: 'sample0',
                        activityType: 'Meeting',
                        date: today.clone().toDate(),
                        description: 'Morning briefing with sales team',
                        property: 'Office',
                        propertyLocation: 'Headquarters',
                        byName: 'Sales Manager'
                    });

                    // Tomorrow
                    activities.push({
                        saleId: 'sample1',
                        activityType: 'Meeting',
                        date: today.clone().add(1, 'day').toDate(),
                        description: 'Client meeting for Karen property',
                        property: 'Karen Land',
                        propertyLocation: 'Karen, Nairobi',
                        customer: 'John Doe',
                        salesAgent: 'Jane Njeri',
                        byName: 'Jane Njeri'
                    });

                    // Day after tomorrow
                    activities.push({
                        saleId: 'sample2',
                        activityType: 'Other',
                        date: today.clone().add(2, 'days').toDate(),
                        description: 'Site visit to Kitengela Land',
                        property: 'Kitengela Land',
                        propertyLocation: 'Kitengela, Kajiado',
                        customer: 'Sarah Smith',
                        salesAgent: 'James Otieno',
                        byName: 'James Otieno'
                    });

                    // 3 days from now
                    activities.push({
                        saleId: 'sample3',
                        activityType: 'Other',
                        date: today.clone().add(3, 'days').toDate(),
                        description: 'Follow-up call with potential buyer',
                        property: 'Westlands Apartment',
                        propertyLocation: 'Westlands, Nairobi',
                        customer: 'Michael Johnson',
                        salesAgent: 'Peter Kipchoge',
                        byName: 'Peter Kipchoge'
                    });

                    // 5 days from now
                    activities.push({
                        saleId: 'sample4',
                        activityType: 'Payment',
                        date: today.clone().add(5, 'days').toDate(),
                        description: 'Payment collection for Lavington property',
                        property: 'Lavington Apartment',
                        propertyLocation: 'Lavington, Nairobi',
                        customer: 'Emily Williams',
                        salesAgent: 'Jane Njeri',
                        byName: 'Jane Njeri',
                        amount: 950000
                    });

                    // Last week
                    activities.push({
                        saleId: 'sample5',
                        activityType: 'Sale Agreement',
                        date: today.clone().subtract(7, 'days').toDate(),
                        description: 'Closed deal on Kilimani property',
                        property: 'Kilimani Apartment',
                        propertyLocation: 'Kilimani, Nairobi',
                        customer: 'Robert Brown',
                        salesAgent: 'Peter Kipchoge',
                        byName: 'Peter Kipchoge',
                        amount: 1250000
                    });

                    // Next week
                    activities.push({
                        saleId: 'sample6',
                        activityType: 'Meeting',
                        date: today.clone().add(7, 'days').toDate(),
                        description: 'Property viewing with potential client',
                        property: 'Spring Valley Villa',
                        propertyLocation: 'Spring Valley, Nairobi',
                        customer: 'David Wilson',
                        salesAgent: 'James Otieno',
                        byName: 'James Otieno'
                    });
                }

                return { salesActivities: activities };
            } catch (error) {
                message.error('Failed to fetch sales activities');
                console.error('Error fetching sales activities:', error);
                return { salesActivities: [] };
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Update activities when salesDataValue changes
    useEffect(() => {
        if (salesDataValue.salesActivities && salesDataValue.salesActivities.length > 0) {
            const formattedActivities = salesDataValue.salesActivities.map((activity, index) => ({
                id: `activity_${activity.saleId || index}_${index}`,
                title: activity.description || `${activity.activityType} Activity`,
                date: moment(activity.date),
                type: mapActivityTypeToEventType(activity.activityType),
                description: activity.description || `${activity.activityType} Activity`,
                activityType: activity.activityType || 'Other',
                property: activity.property,
                propertyLocation: activity.propertyLocation,
                customer: activity.customer,
                salesAgent: activity.salesAgent,
                byName: activity.byName,
                amount: activity.amount,
                priority: determinePriority(activity)
            }));

            setSalesActivities(formattedActivities);
        }
    }, [salesDataValue]);

    // Helper function to determine priority based on activity
    const determinePriority = (activity) => {
        if (activity.activityType === 'Payment' || activity.activityType === 'Final Payment' ||
            activity.activityType === 'Sale Agreement' || activity.activityType === 'Cancellation') {
            return 'high';
        } else if (activity.activityType === 'Meeting' || activity.activityType === 'Refund') {
            return 'medium';
        }
        return 'low';
    };

    // Helper function to map activity types to event types
    const mapActivityTypeToEventType = (activityType) => {
        const typeMap = {
            'Meeting': 'meeting',
            'Payment': 'payment',
            'Final Payment': 'payment',
            'Refund': 'payment',
            'Sale Agreement': 'sale',
            'Cancellation': 'sale',
            'Other': 'task'
        };
        return typeMap[activityType] || 'task';
    };

    // Function to handle date selection
    const onSelect = (value) => {
        setSelectedDate(value);
        const dateActivities = salesActivities.filter(activity =>
            activity.date && activity.date.isSame(value, 'day')
        );

        if (dateActivities.length > 0) {
            // If there are activities on this date, show them
            setIsModalVisible(true);
        }
    };

    // View activity details
    const viewActivity = (activity) => {
        setCurrentActivity(activity);
    };

    // Function to render activities for a specific date
    const dateCellRender = (value) => {
        // Only show activities for the current day
        const dateActivities = salesActivities.filter(activity =>
            activity.date && activity.date.isSame(value, 'day')
        );

        if (dateActivities.length === 0) {
            return null;
        }

        // Sort activities by priority
        const sortedActivities = [...dateActivities].sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
        });

        return (
            <ul className="activities-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {sortedActivities.slice(0, 3).map(activity => (
                    <li key={activity.id} style={{ marginBottom: 3 }}>
                        <Tooltip title={`${activity.title} (${activity.activityType})`}>
                            <Badge
                                style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.85em'
                                }}
                                color={getActivityTypeColor(activity.type)}
                                text={activity.title}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    viewActivity(activity);
                                }}
                            />
                        </Tooltip>
                    </li>
                ))}
                {dateActivities.length > 3 && (
                    <li style={{ fontSize: '0.8em', color: '#999' }}>
                        +{dateActivities.length - 3} more...
                    </li>
                )}
            </ul>
        );
    };

    // Get color for activity type
    const getActivityTypeColor = (type) => {
        const colorMap = {
            'meeting': 'blue',
            'task': 'orange',
            'payment': 'gold',
            'sale': 'red'
        };
        return colorMap[type] || 'blue';
    };

    // Get icon for activity type
    const getActivityTypeIcon = (type) => {
        switch (type) {
            case 'meeting':
                return <TeamOutlined />;
            case 'payment':
                return <DollarOutlined />;
            case 'sale':
                return <ShopOutlined />;
            default:
                return <CalendarOutlined />;
        }
    };

    useEffect(() => {
        // Set the current date to today when component mounts
        setCurrentDate(moment());
    }, []);

    // Function to render the header of the calendar
    const renderHeader = ({ value, type, onChange, onTypeChange }) => {
        const start = value.clone().startOf(type);
        const end = value.clone().endOf(type);

        return (
            <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Button
                        type="primary"
                        icon={<LeftOutlined />}
                        onClick={() => {
                            const newDate = value.clone().subtract(1, type);
                            onChange(newDate);
                            setCurrentDate(newDate);
                        }}
                        style={{ marginRight: 8 }}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={() => {
                            const newDate = moment();
                            onChange(newDate);
                            setCurrentDate(newDate);
                        }}
                        style={{ marginRight: 8 }}
                    >
                        Today
                    </Button>
                    <Button
                        type="primary"
                        icon={<RightOutlined />}
                        onClick={() => {
                            const newDate = value.clone().add(1, type);
                            onChange(newDate);
                            setCurrentDate(newDate);
                        }}
                    >
                        Next
                    </Button>
                </div>
                <Title level={4} style={{ margin: 0 }}>
                    {type === 'month'
                        ? value.format('MMMM YYYY')
                        : type === 'week'
                            ? `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`
                            : value.format('dddd, MMMM D, YYYY')
                    }
                </Title>
                <div>
                    <Button.Group>
                        <Button
                            type={calendarMode === 'day' ? 'primary' : 'default'}
                            onClick={() => {
                                setCalendarMode('day');
                                onTypeChange('day');
                            }}
                        >
                            Day
                        </Button>
                        <Button
                            type={calendarMode === 'week' ? 'primary' : 'default'}
                            onClick={() => {
                                setCalendarMode('week');
                                onTypeChange('week');
                            }}
                        >
                            Week
                        </Button>
                        <Button
                            type={calendarMode === 'month' ? 'primary' : 'default'}
                            onClick={() => {
                                setCalendarMode('month');
                                onTypeChange('month');
                            }}
                        >
                            Month
                        </Button>
                    </Button.Group>
                </div>
            </div>
        );
    };

    // Get upcoming activities for the next 7 days
    const upcomingActivities = salesActivities
        .filter(activity => {
            const today = moment().startOf('day');
            const activityDate = activity.date.clone().startOf('day');
            const diff = activityDate.diff(today, 'days');
            return diff >= 0 && diff < 7; // Activities in the next 7 days
        })
        .sort((a, b) => a.date.diff(b.date));

    // Group activities by date
    const groupedActivities = salesActivities.reduce((acc, activity) => {
        const dateKey = activity.date.format('YYYY-MM-DD');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(activity);
        return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(groupedActivities).sort((a, b) =>
        moment(a).diff(moment(b))
    );

    // Custom styling for calendar cells to ensure proper height
    const calendarCellStyle = {
        height: '80px',
        overflow: 'hidden'
    };

    return (
        <div className="calendar-container">
            <Card>
                <Tabs defaultActiveKey="calendar">
                    <TabPane tab={<span><CalendarOutlined /> Calendar</span>} key="calendar">
                        <Calendar
                            value={moment()}
                            headerRender={renderHeader}
                            dateCellRender={dateCellRender}
                            onSelect={onSelect}
                            mode={calendarMode}
                            fullscreen={true}
                            defaultValue={moment()}
                            // Add panel change handler to update the mode state
                            onPanelChange={(date, mode) => {
                                setCurrentDate(date);
                                setCalendarMode(mode);
                            }}
                        />
                    </TabPane>
                    <TabPane tab={<span><BellOutlined /> Upcoming Activities</span>} key="upcoming">
                        <Card>
                            <Title level={4}>Upcoming Activities (Next 7 Days)</Title>
                            {upcomingActivities.length === 0 ? (
                                <div className="ant-alert ant-alert-info">
                                    <div className="ant-alert-content">
                                        <div className="ant-alert-message">No upcoming activities in the next 7 days</div>
                                    </div>
                                </div>
                            ) : (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={upcomingActivities}
                                    renderItem={activity => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        icon={getActivityTypeIcon(activity.type)}
                                                        style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                                                    />
                                                }
                                                title={
                                                    <div>
                                                        {activity.title}
                                                        <Tag color={getActivityTypeColor(activity.type)} style={{ marginLeft: 8 }}>
                                                            {activity.activityType}
                                                        </Tag>
                                                    </div>
                                                }
                                                description={
                                                    <div>
                                                        <div>
                                                            <CalendarOutlined style={{ marginRight: 4 }} />
                                                            {activity.date.format('dddd, MMMM D, YYYY')}
                                                            {activity.date.format('HH:mm') !== '00:00' && (
                                                                <span> at {activity.date.format('HH:mm')}</span>
                                                            )}
                                                        </div>
                                                        {activity.description && <div>{activity.description}</div>}
                                                        {activity.property && (
                                                            <div>
                                                                <HomeOutlined style={{ marginRight: 4 }} />
                                                                Property: {activity.property}
                                                            </div>
                                                        )}
                                                        {activity.propertyLocation && (
                                                            <div>
                                                                <EnvironmentOutlined style={{ marginRight: 4 }} />
                                                                Location: {activity.propertyLocation}
                                                            </div>
                                                        )}
                                                        {activity.customer && (
                                                            <div>
                                                                <UserOutlined style={{ marginRight: 4 }} />
                                                                Customer: {activity.customer}
                                                            </div>
                                                        )}
                                                        {activity.amount && (
                                                            <div>
                                                                <DollarOutlined style={{ marginRight: 4 }} />
                                                                Amount: KES {activity.amount.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Card>
                    </TabPane>
                    <TabPane tab={<span><CalendarOutlined /> All Activities</span>} key="activities">
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {sortedDates.map(dateKey => (
                                <Card
                                    key={dateKey}
                                    title={moment(dateKey).format('dddd, MMMM D, YYYY')}
                                    size="small"
                                    style={{ marginBottom: 16 }}
                                >
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={groupedActivities[dateKey]}
                                        renderItem={activity => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            icon={getActivityTypeIcon(activity.type)}
                                                            style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                                                        />
                                                    }
                                                    title={
                                                        <div>
                                                            {activity.title}
                                                            <Tag color={getActivityTypeColor(activity.type)} style={{ marginLeft: 8 }}>
                                                                {activity.activityType}
                                                            </Tag>
                                                            {activity.date.format('HH:mm') !== '00:00' && (
                                                                <Tag icon={<ClockCircleOutlined />} color="default" style={{ marginLeft: 8 }}>
                                                                    {activity.date.format('HH:mm')}
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    }
                                                    description={
                                                        <div>
                                                            {activity.description}
                                                            {activity.property && (
                                                                <div style={{ marginTop: 4 }}>
                                                                    <Text type="secondary">
                                                                        <HomeOutlined style={{ marginRight: 4 }} />
                                                                        Property: {activity.property}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            {activity.propertyLocation && (
                                                                <div>
                                                                    <Text type="secondary">
                                                                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                                                                        Location: {activity.propertyLocation}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            {activity.customer && (
                                                                <div>
                                                                    <Text type="secondary">
                                                                        <UserOutlined style={{ marginRight: 4 }} />
                                                                        Customer: {activity.customer}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            {activity.byName && (
                                                                <div>
                                                                    <Text type="secondary">
                                                                        <TeamOutlined style={{ marginRight: 4 }} />
                                                                        By: {activity.byName}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            {activity.amount && (
                                                                <div>
                                                                    <Text type="secondary">
                                                                        <DollarOutlined style={{ marginRight: 4 }} />
                                                                        Amount: KES {activity.amount.toLocaleString()}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            ))}
                        </div>
                    </TabPane>
                </Tabs>
            </Card>

            {/* View Activities Modal */}
            <Modal
                title={`Activities on ${selectedDate?.format('MMMM D, YYYY')}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsModalVisible(false)}
                    >
                        Close
                    </Button>
                ]}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={salesActivities.filter(activity =>
                        activity.date && selectedDate && activity.date.isSame(selectedDate, 'day')
                    )}
                    renderItem={activity => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        icon={getActivityTypeIcon(activity.type)}
                                        style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                                    />
                                }
                                title={activity.title}
                                description={
                                    <>
                                        <Tag color={getActivityTypeColor(activity.type)}>{activity.activityType}</Tag>
                                        {activity.date.format('HH:mm') !== '00:00' && (
                                            <Tag icon={<ClockCircleOutlined />}>{activity.date.format('HH:mm')}</Tag>
                                        )}
                                        {activity.description && <div>{activity.description}</div>}
                                        {activity.property && <div>Property: {activity.property}</div>}
                                        {activity.propertyLocation && <div>Location: {activity.propertyLocation}</div>}
                                        {activity.customer && <div>Customer: {activity.customer}</div>}
                                        {activity.byName && <div>By: {activity.byName}</div>}
                                        {activity.amount && <div>Amount: KES {activity.amount.toLocaleString()}</div>}
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default EventCalendar;