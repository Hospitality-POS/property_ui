import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import {
  Button, Col, DatePicker, Form, Input, Row, Select, Space, Statistic, message, Menu, Dropdown, Tag, Tooltip
} from 'antd';
import {
  BankOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, DownOutlined, ExportOutlined, FileExcelOutlined,
  PlusOutlined, PrinterOutlined, SearchOutlined, TagOutlined
} from '@ant-design/icons';
import { PropertyStatistics } from '../../components/statistics/propertStatistics';
import { PropertyTable } from '../../components/Tables/PropertyTable';
import { PropertyDetailsDrawer } from '../../components/drawers/propertyDetail';
import { AddPropertyModal } from '../../components/Modals/addProperty';
import { DeletePropertyModal } from '../../components/Modals/deleteProperty';
import { fetchAllProperties, createNewProperty, updateProperty, deleteProperty } from '@/services/property';
import { fetchAllUsers } from '@/services/auth.api';
const { Option } = Select;
const { RangePicker } = DatePicker;

const PropertyManager = () => {
  // State management
  const [searchText, setSearchText] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [refreshKey, setRefreshKey] = useState(0);
  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();

  // Add state to hold property managers
  const [localPropertyManagersData, setLocalPropertyManagersData] = useState([]);

  // State to hold all available phases
  const [availablePhases, setAvailablePhases] = useState([]);

  // Date formatting helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD MMM YYYY');
  };

  const { data: propertyManagersData = [], refetch: refetchPropertyManagers } = useQuery({
    queryKey: ['users', refreshKey],
    queryFn: async () => {
      try {
        const response = await fetchAllUsers();
        console.log('Users fetched successfully:', response);

        // Determine the correct data structure
        let usersArray = [];

        if (Array.isArray(response?.data)) {
          usersArray = response.data;
        } else if (Array.isArray(response)) {
          usersArray = response;
        } else if (Array.isArray(response?.users)) {
          usersArray = response.users;
        } else {
          console.error('Unexpected users API response structure:', response);
          return [];
        }

        console.log(`Processing ${usersArray.length} users`);

        // Safely map users
        const processedData = usersArray
          .map(user => ({
            ...user,
            dateJoined: user.createdAt ? formatDate(user.createdAt) : user.dateJoined,
          }))
          .filter(user => user.role === 'property_manager');

        console.log('Filtered property managers:', processedData);

        return processedData;
      } catch (error) {
        message.error('Failed to fetch users');
        console.error('Error fetching users:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      // When the query is successful, update our local state
      setLocalPropertyManagersData(data);
    }
  });

  // Data fetching
  const {
    data: propertiesData = [],
    isLoading: isLoadingProperties,
    refetch: refetchProperties
  } = useQuery({
    queryKey: ['property', refreshKey],
    queryFn: async () => {
      try {
        const response = await fetchAllProperties();
        console.log('properties fetched successfully:', response);

        // Process data to use createdAt as dateJoined
        const processedData = Array.isArray(response.data)
          ? response.data.map(property => ({
            ...property,
            dateJoined: formatDate(property.createdAt) || property.dateJoined,
          }))
          : [];

        return processedData;
      } catch (error) {
        message.error('Failed to fetch properties');
        console.error('Error fetching properties:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      // Extract all unique phases from properties
      const phases = new Set();

      if (Array.isArray(data)) {
        data.forEach(property => {
          // Add current phase if it exists
          if (property.currentPhase) {
            phases.add(property.currentPhase);
          }

          // Add all phases from the phases array
          if (Array.isArray(property.phases)) {
            property.phases.forEach(phase => {
              if (phase.name) {
                phases.add(phase.name);
              }
            });
          }
        });
      }

      setAvailablePhases(Array.from(phases));
    }
  });

  // Get property managers to use - prefer local state for immediate updates
  const activePropertyManagersData = localPropertyManagersData.length > 0
    ? localPropertyManagersData
    : propertyManagersData;

  // Property view handler
  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setDrawerVisible(true);
  };

  // Property add/edit handler
  const handleAddProperty = () => {
    form.validateFields().then(values => {
      // Format coordinates if they exist
      if (values.location && values.location.coordinates && values.location.coordinates.coordinates) {
        // Check if coordinates is a string that needs parsing
        if (typeof values.location.coordinates.coordinates === 'string') {
          // Split the string by comma or space and convert to numbers
          const coordsString = values.location.coordinates.coordinates;
          const coordsArray = coordsString
            .split(/[,\s]+/)                 // Split by comma or whitespace
            .filter(coord => coord.trim())   // Remove empty entries
            .map(coord => parseFloat(coord)) // Convert to numbers
            .filter(coord => !isNaN(coord)); // Filter out any NaN values

          // Make sure we have at least 2 coordinates
          if (coordsArray.length >= 2) {
            // Update the values object with the properly formatted coordinates
            values.location.coordinates = {
              type: 'Point',
              coordinates: coordsArray
            };
          }
        }
      }

      // Add property ID if in edit mode
      if (isEditMode && selectedProperty) {
        values._id = selectedProperty._id;
      }

      console.log('form values', values);

      // Create an API function call based on whether we're adding or editing
      const apiCall = isEditMode
        ? updateProperty(values._id, values)
        : createNewProperty(values);

      apiCall
        .then(property => {
          // Show success message
          message.success(`Property ${isEditMode ? 'updated' : 'added'} successfully!`);
          setTimeout(() => {
            setRefreshKey(prevKey => prevKey + 1);
            refetchProperties({ force: true });
          }, 500);
          // Close modal and reset form
          setAddPropertyVisible(false);
          setIsEditMode(false);
          setSelectedProperty(null);
          form.resetFields();
        })
        .catch(error => {
          // Display error message
          message.error(`Failed to ${isEditMode ? 'update' : 'add'} property: ${error.message}`);
        });
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
    });
  };

  // Modal cancel handler
  const handleModalCancel = () => {
    setAddPropertyVisible(false);
    setIsEditMode(false);
    setSelectedProperty(null);
    form.resetFields();
  };

  // Edit property handler
  const handleEditProperty = (property) => {
    // Set the edit mode flag
    setIsEditMode(true);

    // Set the selected property for reference
    setSelectedProperty(property);

    // Format specific data to match form expectations
    const formattedProperty = {
      ...property,
      // Handle property manager - convert from object to ID
      propertyManager: property.propertyManager._id,
      // Ensure location structure is preserved correctly
      location: {
        ...property.location,
        // Format coordinates for the form if they exist
        ...(property.location.coordinates && {
          coordinates: {
            ...property.location.coordinates,
            // Present coordinates as string for the form input
            coordinates: property.location.coordinates.coordinates?.join(',')
          }
        })
      }
    };

    // Set form values with the formatted property data
    form.setFieldsValue(formattedProperty);

    // Open the form modal with edit mode
    setAddPropertyVisible(true);
  };

  // Handle newly added property manager
  const handlePropertyManagerAdded = (newManager) => {
    console.log('New property manager added:', newManager);

    // Add the new manager to the local managers data
    setLocalPropertyManagersData(prevManagers => {
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
    refetchPropertyManagers({ force: true })
      .then(() => {
        message.success(`Property Manager ${newManager.name} added successfully!`);

        // Update the refreshKey to trigger UI updates
        setRefreshKey(prevKey => prevKey + 1);
      })
      .catch(error => {
        console.error('Error refreshing users after adding property manager:', error);
      });
  };

  // Delete confirmation modal
  const showDeleteConfirm = (property) => {
    setPropertyToDelete(property);
    setDeleteModalVisible(true);
  };

  // Delete property handler
  const handleDeleteProperty = async () => {
    try {
      // Check if propertyToDelete exists and has an ID
      if (!propertyToDelete || !propertyToDelete._id) {
        throw new Error('Invalid property selected for deletion');
      }

      // Show loading message
      const hideLoadingMessage = message.loading('Deleting property...', 0);

      // Call the delete API
      await deleteProperty(propertyToDelete._id);

      // Close loading message
      hideLoadingMessage();

      // Show success message
      message.success(`Property "${propertyToDelete.name}" deleted successfully`);

      // Close the modal and reset state
      setDeleteModalVisible(false);
      setPropertyToDelete(null);

      // Refresh the property list
      refetchProperties({ force: true });
    } catch (error) {
      // Handle error - display meaningful error message
      console.error('Error deleting property:', error);
      message.error(`Failed to delete property: ${error.message || 'Unknown error occurred'}`);

      // Close the modal but maintain propertyToDelete state in case user wants to retry
      setDeleteModalVisible(false);
    }
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Date range change handler
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Phase filter change handler
  const handlePhaseFilterChange = (value) => {
    setPhaseFilter(value);
  };

  // Helper to get the unit price based on phase
  const getUnitPriceForPhase = (unit, phaseName) => {
    // If there's no phase pricing or no specific phase, return the current price or base price
    if (!Array.isArray(unit.phasePricing) || !phaseName) {
      return parseFloat(unit.price) || parseFloat(unit.basePrice) || 0;
    }

    // Look for the specified phase in the unit's phase pricing
    const phasePrice = unit.phasePricing.find(p => p.phaseName === phaseName);
    if (phasePrice) {
      return parseFloat(phasePrice.price) || 0;
    }

    // Fall back to current price or base price if phase isn't found
    return parseFloat(unit.price) || parseFloat(unit.basePrice) || 0;
  };

  // Statistics calculations
  const getTotalPropertyValue = () => {
    // Calculate total value based on units prices and current phases
    return filteredProperties.reduce((total, property) => {
      // If property has units, sum their values
      if (property.units && Array.isArray(property.units)) {
        const unitsValue = property.units.reduce((unitTotal, unit) => {
          // Get the correct price based on current phase
          const price = getUnitPriceForPhase(unit, property.currentPhase);
          return unitTotal + (price * unit.totalUnits || 0);
        }, 0);
        return total + unitsValue;
      }
      return total;
    }, 0);
  };

  const getAvailablePropertiesCount = () => {
    return filteredProperties.filter((property) => property.status === 'available').length;
  };

  const getReservedPropertiesCount = () => {
    return filteredProperties.filter((property) => property.status === 'reserved').length;
  };

  const getSoldPropertiesCount = () => {
    return filteredProperties.filter((property) => property.status === 'sold').length;
  };

  // Get total units count (across all properties)
  const getTotalUnitsCount = () => {
    return filteredProperties.reduce((total, property) => {
      if (property.units && Array.isArray(property.units)) {
        const totalUnits = property.units.reduce((sum, unit) => sum + (unit.totalUnits || 0), 0);
        return total + totalUnits;
      }
      return total;
    }, 0);
  };

  // Get available units count
  const getAvailableUnitsCount = () => {
    return filteredProperties.reduce((total, property) => {
      if (property.units && Array.isArray(property.units)) {
        const availableUnits = property.units.reduce((sum, unit) => sum + (unit.availableUnits || 0), 0);
        return total + availableUnits;
      }
      return total;
    }, 0);
  };

  // Filter properties based on search and filter criteria
  const filteredProperties = propertiesData.filter((property) => {
    const matchesSearch =
      property._id?.toLowerCase().includes(searchText.toLowerCase()) ||
      property.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      property.location?.address?.toLowerCase().includes(searchText.toLowerCase()) ||
      property.propertyManager?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      (property.currentPhase && property.currentPhase.toLowerCase().includes(searchText.toLowerCase()));

    const matchesType =
      propertyTypeFilter === 'all' || property.propertyType === propertyTypeFilter;

    const matchesStatus =
      propertyStatusFilter === 'all' || property.status === propertyStatusFilter;

    const matchesPhase =
      phaseFilter === 'all' || property.currentPhase === phaseFilter;

    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const addedDate = new Date(property.createdAt);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      matchesDateRange = addedDate >= startDate && addedDate <= endDate;
    }

    return matchesSearch && matchesType && matchesStatus && matchesPhase && matchesDateRange;
  });

  // Custom property table columns to include phase information
  const getCustomPropertyTableColumns = (defaultColumns) => {
    if (!Array.isArray(defaultColumns)) return defaultColumns;

    // Find where to insert the phase column (usually after name)
    const nameColumnIndex = defaultColumns.findIndex(col => col.dataIndex === 'name');
    const insertIndex = nameColumnIndex >= 0 ? nameColumnIndex + 1 : 2; // Insert after name or at position 2



    // Create a new array with the phase column inserted
    const updatedColumns = [
      ...defaultColumns.slice(0, insertIndex),
      ...defaultColumns.slice(insertIndex)
    ];

    return updatedColumns;
  };

  return (
    <>
      <Space className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddPropertyVisible(true)}
        >
          Add Property
        </Button>
      </Space>


      <PropertyStatistics
        totalValue={getTotalPropertyValue()}
        availableCount={getAvailablePropertiesCount()}
        reservedCount={getReservedPropertiesCount()}
        soldCount={getSoldPropertiesCount()}
        totalCount={filteredProperties.length}
        totalUnits={getTotalUnitsCount()}
        availableUnits={getAvailableUnitsCount()}
      />

      {/* Search and Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={6}>
          <Input
            placeholder="Search by ID, name, location, phase or manager..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Type"
            defaultValue="all"
            onChange={(value) => setPropertyTypeFilter(value)}
          >
            <Option value="all">All Types</Option>
            <Option value="land">Land</Option>
            <Option value="apartment">Apartment</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Status"
            defaultValue="all"
            onChange={(value) => setPropertyStatusFilter(value)}
          >
            <Option value="all">All Statuses</Option>
            <Option value="available">Available</Option>
            <Option value="reserved">Reserved</Option>
            <Option value="sold">Sold</Option>
            <Option value="under_construction">Under Construction</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Phase"
            defaultValue="all"
            onChange={handlePhaseFilterChange}
          >
            <Option value="all">All Phases</Option>
            {availablePhases.map(phase => (
              <Option key={phase} value={phase}>{phase}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={4}>
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['Start Date', 'End Date']}
            onChange={handleDateRangeChange}
          />
        </Col>
        <Col xs={24} sm={24} md={2}>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" icon={<FileExcelOutlined />}>
                  Export to Excel
                </Menu.Item>
                <Menu.Item key="2" icon={<PrinterOutlined />}>
                  Print Report
                </Menu.Item>
              </Menu>
            }
          >
            <Button style={{ width: '100%' }}>
              <ExportOutlined /> Export <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>

      {/* Properties Table Component with customized columns */}
      <PropertyTable
        properties={filteredProperties}
        onView={handleViewProperty}
        onEdit={handleEditProperty}
        onDelete={showDeleteConfirm}
        formatPropertyType={formatPropertyType}
        formatStatus={formatStatus}
        formatDate={formatDate}
        getCustomColumns={getCustomPropertyTableColumns}
        getUnitPriceForPhase={getUnitPriceForPhase}
      />

      {/* Property Details Drawer with phase information */}
      <PropertyDetailsDrawer
        visible={drawerVisible}
        property={selectedProperty}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setDrawerVisible(false)}
        formatPropertyType={formatPropertyType}
        formatStatus={formatStatus}
        formatDate={formatDate}
        getUnitPriceForPhase={getUnitPriceForPhase}
      />

      {/* Add/Edit Property Modal with phase support */}
      <AddPropertyModal
        visible={addPropertyVisible}
        isEditMode={isEditMode}
        form={form}
        onOk={handleAddProperty}
        onCancel={handleModalCancel}
        propertyManagersData={activePropertyManagersData}
        onPropertyManagerAdded={handlePropertyManagerAdded}
      />

      {/* Delete Confirmation Modal */}
      <DeletePropertyModal
        visible={deleteModalVisible}
        property={propertyToDelete}
        onDelete={handleDeleteProperty}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </>
  );
};

// Helper functions
const formatStatus = (status) => {
  const statusMap = {
    'available': 'Available',
    'reserved': 'Reserved',
    'sold': 'Sold',
    'under_construction': 'Under Construction'
  };
  return statusMap[status] || status;
};

const formatPropertyType = (type) => {
  const typeMap = {
    'land': 'Land',
    'apartment': 'Apartment'
  };
  return typeMap[type] || type;
};

export default PropertyManager;