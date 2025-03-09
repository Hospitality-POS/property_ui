import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button, Input, Row, Col, Space, Select, Dropdown, Menu, Form, message
} from 'antd';
import {
  PlusOutlined, SearchOutlined, DownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { createNewLead, fetchAllLeads, updateLead, deleteLead } from '@/services/lead';
import { fetchAllUsers, getUserInfo } from '@/services/auth.api';

import { LeadStatisticsCards } from '../../components/statistics/leadStatistics';
import { LeadPipeline } from '../../components/statistics/leadPipeline';
import { LeadsTable } from '../../components/Tables/leadTable';
import { LeadDetailsDrawer } from '../../components/drawers/leadDetail';
import { AddLeadModal } from '../../components/Modals/addLead';
import { AddActivityModal } from '../../components/Modals/addLeadActivity';
import { DeleteLeadModal } from '../../components/Modals/deleteLead';
import { ConvertLeadModal } from '../../components/Modals/convertLead';
import { AddNoteModal } from '../../components/Modals/addLeadNote';
import { AddPropertyInterestModal } from '../../components/Modals/addPropertyInterest';

const { Option } = Select;

const LeadsManagement = () => {
  // State for search and filters
  const [searchText, setSearchText] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadPriorityFilter, setLeadPriorityFilter] = useState('all');
  const [leadAssigneeFilter, setLeadAssigneeFilter] = useState('all');

  // State for selected lead and drawer
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // State for modals
  const [leadModalVisible, setLeadModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [addActivityVisible, setAddActivityVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [convertLeadVisible, setConvertLeadVisible] = useState(false);
  const [addNoteVisible, setAddNoteVisible] = useState(false);
  const [addPropertyInterestVisible, setAddPropertyInterestVisible] = useState(false);

  // Form instances
  const [form] = Form.useForm();
  const [activityForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [propertyForm] = Form.useForm();
  const [convertForm] = Form.useForm();

  // Refresh state
  const [refreshKey, setRefreshKey] = useState(0);

  // New lead form state
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'website',
    sourceDetails: '',
    interestAreas: [{
      county: 'Nairobi',
      propertyType: 'both',
      budget: {
        min: 0,
        max: 0
      }
    }],
    priority: 'medium',
    assignedTo: '',
    notes: [{
      content: ''
    }]
  });

  // New activity form state
  const [newActivity, setNewActivity] = useState({
    type: 'call',
    date: new Date().toISOString(),
    summary: '',
    outcome: '',
    nextAction: '',
  });

  // Fetch leads data
  const { data: leadsData = [], isLoading: isLoadingLeads, refetch: refetchLeads } = useQuery({
    queryKey: ['lead', refreshKey],
    queryFn: async () => {
      try {
        const response = await fetchAllLeads();
        console.log('leaders fetched successfully:', response);

        // Process data to use createdAt as dateJoined
        const processedData = Array.isArray(response.data)
          ? response.data.map(lead => ({
            ...lead,
            dateJoined: formatDate(lead.createdAt) || lead.dateJoined,
          }))
          : [];

        return processedData;
      } catch (error) {
        message.error('Failed to fetch lead');
        console.error('Error fetching lead:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch agents data
  const { data: agentsData = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await fetchAllUsers();
        console.log('Users fetched successfully:', response);

        // Process data to use createdAt as dateJoined
        const processedData = Array.isArray(response.data)
          ? response.data.map(user => ({
            ...user,
            dateJoined: formatDate(user.createdAt) || user.dateJoined,
          })).filter(user => user.role === 'sales_agent')
          : [];

        return processedData;
      } catch (error) {
        message.error('Failed to fetch users');
        console.error('Error fetching users:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Sample properties data (in a real app, this would come from an API)
  const propertiesData = [
    { _id: 'prop001', name: 'Sunset Heights Apartment 3B', type: 'apartment', location: 'Westlands, Nairobi', price: 8500000 },
    { _id: 'prop002', name: 'Greenview Estate Plot 42', type: 'land', location: 'Kiambu Road', price: 5200000 },
    { _id: 'prop003', name: 'Riverside Apartment 7A', type: 'apartment', location: 'Riverside, Nairobi', price: 12000000 },
    { _id: 'prop004', name: 'Mountain View Land 2 Acres', type: 'land', location: 'Thika', price: 4000000 },
    { _id: 'prop005', name: 'Ocean Breeze Apartment 12C', type: 'apartment', location: 'Nyali, Mombasa', price: 9500000 },
  ];

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD MMM YYYY');
  };

  // View lead details in drawer
  const viewLeadDetails = (lead) => {
    console.log('my lead', lead);
    setSelectedLead(lead);
    setDrawerVisible(true);
  };

  // Show add lead modal
  const showAddLeadModal = () => {
    setModalMode('add');
    setLeadToEdit(null);
    form.resetFields();
    // Set any default values for the add form
    form.setFieldsValue({
      source: 'website',
      priority: 'medium',
      propertyType: 'both'
    });
    setLeadModalVisible(true);
  };

  // Show edit lead modal
  const handleEditLead = (lead) => {
    setModalMode('edit');
    setLeadToEdit(lead);

    // Set the form values based on the selected lead
    form.setFieldsValue({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      sourceDetails: lead.sourceDetails,
      county: lead.interestAreas[0]?.county || '',
      propertyType: lead.interestAreas[0]?.propertyType || 'both',
      budgetMin: lead.interestAreas[0]?.budget?.min || 0,
      budgetMax: lead.interestAreas[0]?.budget?.max || 0,
      priority: lead.priority,
      assignedTo: lead.assignedTo?._id,
      notes: lead.notes[0]?.content || ''
    });

    setLeadModalVisible(true);
  };

  // Handle add/edit lead submission
  const handleAddLead = () => {
    form.validateFields()
      .then(values => {
        // Format the values to match the schema
        const formattedLead = {
          name: values.name,
          phone: values.phone,
          email: values.email,
          source: values.source,
          sourceDetails: values.sourceDetails,
          interestAreas: [{
            county: values.county,
            propertyType: values.propertyType,
            budget: {
              min: values.budgetMin,
              max: values.budgetMax
            }
          }],
          priority: values.priority,
          assignedTo: values.assignedTo,
          notes: [{
            content: values.notes
          }]
        };

        if (modalMode === 'add') {
          // Call createLead service
          createNewLead(formattedLead)
            .then(newLead => {
              // Show success message
              message.success('Lead added successfully!');
              setTimeout(() => {
                setRefreshKey(prevKey => prevKey + 1);
                refetchLeads({ force: true });
              }, 500);

              // Close modal
              setLeadModalVisible(false);
              form.resetFields();
            })
            .catch(error => {
              console.error('Error adding lead:', error);
              message.error('Failed to add lead. Please try again.');
            });
        } else {
          // Call updateLead service
          updateLead(leadToEdit._id, formattedLead)
            .then(updatedLead => {
              // Show success message
              message.success('Lead updated successfully!');
              setTimeout(() => {
                setRefreshKey(prevKey => prevKey + 1);
                refetchLeads({ force: true });
              }, 500);

              // Close modal
              setLeadModalVisible(false);
              form.resetFields();
            })
            .catch(error => {
              console.error('Error updating lead:', error);
              message.error('Failed to update lead. Please try again.');
            });
        }
      })
      .catch(errorInfo => {
        console.log('Validation failed:', errorInfo);
      });
  };

  // Show add activity modal
  const showAddActivityModal = (lead) => {
    setSelectedLead(lead);
    setNewActivity({
      type: 'call',
      date: new Date().toISOString(),
      summary: '',
      outcome: '',
      nextAction: '',
    });
    activityForm.resetFields();
    setAddActivityVisible(true);
  };

  // Handle add activity submission
  const handleAddActivity = () => {
    activityForm.validateFields()
      .then(values => {
        // Format the values to match the schema
        const formattedActivity = {
          type: values.type,
          date: values.date.toISOString(),
          summary: values.summary,
          outcome: values.outcome,
          nextAction: values.nextAction,
          by: {
            _id: 'currentUser', // In a real app, this would be the logged-in user's ID
            name: 'Current User' // In a real app, this would be the logged-in user's name
          }
        };

        // Create update data with the new communication
        const updateData = {
          communications: [...(selectedLead.communications || []), formattedActivity]
        };

        // If there's a follow-up date, update that too
        if (values.followUpDate) {
          updateData.followUpDate = values.followUpDate.toISOString();
        }

        console.log('Add activity to lead:', selectedLead._id, updateData);

        // Call the API to update the lead
        updateLead(selectedLead._id, updateData)
          .then(updatedLead => {
            // Update the lead in UI
            const updatedLeads = leadsData.map(lead =>
              lead._id === updatedLead._id ? updatedLead : lead
            );
            // You would update your state here
            message.success('Activity added successfully');
          })
          .catch(error => {
            console.error('Error adding activity:', error);
            message.error('Failed to add activity');
          });

        // Create a simulated updated lead for immediate UI feedback
        const updatedLead = {
          ...selectedLead,
          communications: [...(selectedLead.communications || []), {
            ...formattedActivity,
            date: new Date().toISOString()
          }]
        };

        if (values.followUpDate) {
          updatedLead.followUpDate = values.followUpDate.toISOString();
        }

        // Update the selected lead
        setSelectedLead(updatedLead);

        // Show success message
        message.success('Activity added successfully');

        // Close the modal and reset form
        setAddActivityVisible(false);
        activityForm.resetFields();
      })
      .catch(errorInfo => {
        console.log('Validation failed:', errorInfo);
      });
  };

  // Show delete confirmation modal
  const showDeleteConfirm = (lead) => {
    setLeadToDelete(lead);
    setDeleteModalVisible(true);
  };

  // Handle delete lead
  const handleDeleteLead = async () => {
    try {
      // Check if leadToDelete exists and has an ID
      if (!leadToDelete || !leadToDelete._id) {
        throw new Error('Invalid lead selected for deletion');
      }

      // Show loading message
      const hideLoadingMessage = message.loading('Deleting lead...', 0);

      // Call the delete API
      await deleteLead(leadToDelete._id);

      // Close loading message
      hideLoadingMessage();

      // Show success message
      message.success(`Lead "${leadToDelete.name}" deleted successfully`);

      // Close the modal and reset state
      setDeleteModalVisible(false);
      setLeadToDelete(null);

      // Refresh the leads list
      refetchLeads({ force: true });
    } catch (error) {
      // Handle error - display meaningful error message
      console.error('Error deleting lead:', error);
      message.error(`Failed to delete lead: ${error.message || 'Unknown error occurred'}`);

      // Close the modal
      setDeleteModalVisible(false);
    }
  };

  // Show convert lead modal
  const showConvertLeadModal = (lead) => {
    setSelectedLead(lead);
    // Prefill form with lead data
    convertForm.setFieldsValue({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      county: lead.interestAreas[0]?.county || '',
      customerType: 'individual'
    });
    setConvertLeadVisible(true);
  };

  // Show add note modal
  const showAddNoteModal = (lead) => {
    setSelectedLead(lead);
    setAddNoteVisible(true);
    noteForm.resetFields();
  };

  // Handle add note
  const handleAddNote = async () => {
    let currentUser = await getUserInfo();
    noteForm.validateFields()
      .then(values => {
        // Format the note to match the schema
        const newNote = {
          content: values.content,
          addedBy: {
            _id: currentUser._id,
            name: currentUser.name
          },
          addedAt: new Date().toISOString()
        };

        console.log('Add note to lead:', selectedLead._id, newNote);

        // Call the API to update the lead
        updateLead(selectedLead._id, {
          $push: { notes: newNote }
        })
          .then(updatedLead => {
            // Update the lead in UI
            const updatedLeads = leadsData.map(lead =>
              lead._id === updatedLead._id ? updatedLead : lead
            );
            message.success('Note added successfully');
          })
          .catch(error => {
            console.error('Error adding note:', error);
            message.error('Failed to add note');
          });

        // Create a simulated updated lead for immediate UI feedback
        const updatedLead = {
          ...selectedLead,
          notes: [...(selectedLead.notes || []), newNote]
        };

        // Update the selected lead
        setSelectedLead(updatedLead);

        // Show success message
        message.success('Note added successfully');

        // Close the modal and reset form
        setAddNoteVisible(false);
        noteForm.resetFields();
      })
      .catch(errorInfo => {
        console.log('Validation failed:', errorInfo);
      });
  };

  // Show add property interest modal
  const showAddPropertyInterestModal = (lead) => {
    setSelectedLead(lead);
    setAddPropertyInterestVisible(true);
    propertyForm.resetFields();
  };

  // Handle add property interest
  const handleAddPropertyInterest = () => {
    propertyForm.validateFields()
      .then(values => {
        // Get the selected property
        const selectedProperty = values.propertyId;

        console.log('Add property interest to lead:', selectedLead._id, selectedProperty);

        // Create a simulated updated lead for immediate UI feedback
        const updatedLead = {
          ...selectedLead,
          interestedProperties: [
            ...(selectedLead.interestedProperties || []),
            selectedProperty
          ]
        };

        // Update the selected lead
        setSelectedLead(updatedLead);

        // Show success message
        message.success('Property interest added successfully');

        // Close the modal and reset form
        setAddPropertyInterestVisible(false);
        propertyForm.resetFields();
      })
      .catch(errorInfo => {
        console.log('Validation failed:', errorInfo);
      });
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Filter leads based on search text and filters
  const filteredLeads = leadsData.filter(
    (lead) =>
      (lead.name.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.phone.includes(searchText)) &&
      (leadStatusFilter === 'all' || lead.status === leadStatusFilter) &&
      (leadPriorityFilter === 'all' || lead.priority === leadPriorityFilter) &&
      (leadAssigneeFilter === 'all' ||
        lead.assignedTo?._id === leadAssigneeFilter),
  );

  // Lead status distribution for stats
  const leadsByStatus = {
    'new': leadsData.filter(lead => lead.status === 'new').length,
    'contacted': leadsData.filter(lead => lead.status === 'contacted').length,
    'qualified': leadsData.filter(lead => lead.status === 'qualified').length,
    'negotiation': leadsData.filter(lead => lead.status === 'negotiation').length,
    'converted': leadsData.filter(lead => lead.status === 'converted').length,
    'lost': leadsData.filter(lead => lead.status === 'lost').length,
  };

  // Calculate completion percentage for lead statuses
  const getStatusCompletionPercentage = (status) => {
    switch (status) {
      case 'new': return 16;
      case 'contacted': return 33;
      case 'qualified': return 50;
      case 'negotiation': return 66;
      case 'converted': return 100;
      case 'lost': return 100;
      default: return 0;
    }
  };

  return (
    <>
      <Space className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddLeadModal}
        >
          Add Lead
        </Button>
      </Space>

      {/* Lead Statistics Cards */}
      <LeadStatisticsCards
        totalLeads={leadsData.length}
        newLeadsThisWeek={
          leadsData.filter(
            (lead) => new Date(lead.createdAt) > new Date(new Date().setDate(new Date().getDate() - 7))
          ).length
        }
        qualifiedLeads={leadsData.filter((lead) => lead.status === 'qualified').length}
        conversionRate={
          Math.round(
            (leadsData.filter((lead) => lead.status === 'converted').length / leadsData.length) * 100
          )
        }
      />

      {/* Lead Pipeline Stats */}
      <LeadPipeline leadsByStatus={leadsByStatus} />

      {/* Search and Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Input
            placeholder="Search leads by name, email or phone..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} md={16}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={(value) => setLeadStatusFilter(value)}
            >
              <Option value="all">All Statuses</Option>
              <Option value="new">New</Option>
              <Option value="contacted">Contacted</Option>
              <Option value="qualified">Qualified</Option>
              <Option value="negotiation">Negotiation</Option>
              <Option value="converted">Converted</Option>
              <Option value="lost">Lost</Option>
            </Select>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={(value) => setLeadPriorityFilter(value)}
            >
              <Option value="all">All Priorities</Option>
              <Option value="high">High Priority</Option>
              <Option value="medium">Medium Priority</Option>
              <Option value="low">Low Priority</Option>
            </Select>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={(value) => setLeadAssigneeFilter(value)}
            >
              <Option value="all">All Agents</Option>
              {agentsData.map(agent => (
                <Option key={agent._id} value={agent._id}>{agent.name}</Option>
              ))}
            </Select>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Export to CSV</Menu.Item>
                  <Menu.Item key="2">Print List</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="3">Bulk Edit</Menu.Item>
                  <Menu.Item key="4">Bulk Delete</Menu.Item>
                </Menu>
              }
            >
              <Button>
                More Actions <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {/* Leads Table */}
      <LeadsTable
        leads={filteredLeads}
        agentsData={agentsData}
        onView={viewLeadDetails}
        onAddActivity={showAddActivityModal}
        onEdit={handleEditLead}
        onDelete={showDeleteConfirm}
        capitalize={capitalize}
        formatDate={formatDate}
      />

      {/* Lead Details Drawer */}
      <LeadDetailsDrawer
        visible={drawerVisible}
        lead={selectedLead}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setDrawerVisible(false)}
        onConvert={showConvertLeadModal}
        onAddActivity={showAddActivityModal}
        onAddNote={showAddNoteModal}
        onAddPropertyInterest={showAddPropertyInterestModal}
        propertiesData={propertiesData}
        capitalize={capitalize}
        formatDate={formatDate}
        getStatusCompletionPercentage={getStatusCompletionPercentage}
      />

      {/* Add/Edit Lead Modal */}
      <AddLeadModal
        visible={leadModalVisible}
        isEditMode={modalMode === 'edit'}
        form={form}
        agentsData={agentsData}
        onOk={handleAddLead}
        onCancel={() => {
          setLeadModalVisible(false);
          form.resetFields();
        }}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        visible={addActivityVisible}
        leadName={selectedLead?.name}
        form={activityForm}
        onOk={handleAddActivity}
        onCancel={() => {
          setAddActivityVisible(false);
          activityForm.resetFields();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteLeadModal
        visible={deleteModalVisible}
        lead={leadToDelete}
        onDelete={handleDeleteLead}
        onCancel={() => setDeleteModalVisible(false)}
      />

      {/* Convert Lead to Customer Modal */}
      <ConvertLeadModal
        visible={convertLeadVisible}
        lead={selectedLead}
        form={convertForm}
        onCancel={() => {
          setConvertLeadVisible(false);
          convertForm.resetFields();
        }}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        visible={addNoteVisible}
        leadName={selectedLead?.name}
        form={noteForm}
        onOk={handleAddNote}
        onCancel={() => {
          setAddNoteVisible(false);
          noteForm.resetFields();
        }}
      />

      {/* Add Property Interest Modal */}
      <AddPropertyInterestModal
        visible={addPropertyInterestVisible}
        leadName={selectedLead?.name}
        form={propertyForm}
        propertiesData={propertiesData}
        onOk={handleAddPropertyInterest}
        onCancel={() => {
          setAddPropertyInterestVisible(false);
          propertyForm.resetFields();
        }}
      />
    </>
  );
};

export default LeadsManagement;