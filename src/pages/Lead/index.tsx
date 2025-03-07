import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Form,
  Input,
  Layout,
  List,
  Menu,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import { useState, useEffect } from 'react';
import { createNewLead, fetchAllLeads, updateLead, deleteLead } from '@/services/lead';
import { fetchAllUsers, getUserInfo } from '@/services/auth.api';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;



const LeadsManagement = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [addLeadVisible, setAddLeadVisible] = useState(false);
  const [addActivityVisible, setAddActivityVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadPriorityFilter, setLeadPriorityFilter] = useState('all');
  const [leadAssigneeFilter, setLeadAssigneeFilter] = useState('all');
  const [convertLeadVisible, setConvertLeadVisible] = useState(false);
  const [addNoteVisible, setAddNoteVisible] = useState(false);
  const [addPropertyInterestVisible, setAddPropertyInterestVisible] = useState(false);
  const [form] = Form.useForm();
  const [activityForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [propertyForm] = Form.useForm();
  const [convertForm] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0);
  const [leadModalVisible, setLeadModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [leadToEdit, setLeadToEdit] = useState(null);

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


  const { data: leadsData = [], isLoading: isLoadingLeads, refetch: refetchLeads } = useQuery({
    queryKey: ['lead'], // Adding refreshKey to queryKey
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

  // Sample agents data
  const { data: agentsData = [], isLoading: isLoadngAgents, refetch: refetchAgents } = useQuery({
    queryKey: ['users'], // Adding refreshKey to queryKey
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

  // New activity form state
  const [newActivity, setNewActivity] = useState({
    type: 'call',
    date: new Date().toISOString(),
    summary: '',
    outcome: '',
    nextAction: '',
  });

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => viewLeadDetails(record)}>{text}</a>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Interest',
      key: 'interest',
      render: (_, record) => (
        <Tag color={record.interestAreas[0]?.propertyType === 'apartment' ? 'blue' :
          record.interestAreas[0]?.propertyType === 'land' ? 'green' : 'purple'}>
          {record.interestAreas[0]?.propertyType === 'apartment' ? 'Apartment' :
            record.interestAreas[0]?.propertyType === 'land' ? 'Land' : 'Both'}
        </Tag>
      ),
      filters: [
        { text: 'Apartment', value: 'apartment' },
        { text: 'Land', value: 'land' },
        { text: 'Both', value: 'both' },
      ],
      onFilter: (value, record) => record.interestAreas[0]?.propertyType === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let displayText = capitalize(status);

        if (status === 'new') color = 'blue';
        if (status === 'contacted') color = 'cyan';
        if (status === 'qualified') color = 'purple';
        if (status === 'negotiation') color = 'orange';
        if (status === 'converted') color = 'green';
        if (status === 'lost') color = 'red';

        return <Tag color={color}>{displayText}</Tag>;
      },
      filters: [
        { text: 'New', value: 'new' },
        { text: 'Contacted', value: 'contacted' },
        { text: 'Qualified', value: 'qualified' },
        { text: 'Negotiation', value: 'negotiation' },
        { text: 'Converted', value: 'converted' },
        { text: 'Lost', value: 'lost' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source) => {
        const sourceMap = {
          'website': 'Website',
          'referral': 'Referral',
          'social_media': 'Social Media',
          'direct_call': 'Direct Call',
          'walk_in': 'Walk-in',
          'other': 'Other'
        };

        let color = 'default';
        if (source === 'website') color = 'blue';
        if (source === 'referral') color = 'green';
        if (source === 'social_media') color = 'cyan';
        if (source === 'direct_call') color = 'purple';
        if (source === 'walk_in') color = 'magenta';

        return <Tag color={color}>{sourceMap[source] || 'Other'}</Tag>;
      },
      filters: [
        { text: 'Website', value: 'website' },
        { text: 'Referral', value: 'referral' },
        { text: 'Social Media', value: 'social_media' },
        { text: 'Direct Call', value: 'direct_call' },
        { text: 'Walk-in', value: 'walk_in' },
        { text: 'Other', value: 'other' },
      ],
      onFilter: (value, record) => record.source === value,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        let color = 'default';
        let displayText = capitalize(priority);

        if (priority === 'high') color = 'red';
        if (priority === 'medium') color = 'orange';
        if (priority === 'low') color = 'green';

        return <Tag color={color}>{displayText}</Tag>;
      },
      filters: [
        { text: 'High', value: 'high' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' },
      ],
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: 'Next Follow-up',
      key: 'followUpDate',
      render: (_, record) => record.followUpDate ?
        formatDate(record.followUpDate) : <Text type="secondary">--</Text>,
      sorter: (a, b) => {
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        return new Date(a.followUpDate) - new Date(b.followUpDate);
      },
    },
    {
      title: 'Agent',
      key: 'assignedTo',
      render: (_, record) => record.assignedTo?.name || '--',
      filters: agentsData.map(agent => ({ text: agent.name, value: agent._id })),
      onFilter: (value, record) => record.assignedTo?._id === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Add Activity">
            <Button
              icon={<PlusOutlined />}
              size="small"
              onClick={() => showAddActivityModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Lead">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditLead(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Lead">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
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



  // Handle edit lead
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

  // Show delete confirmation modal
  const showDeleteConfirm = (lead) => {
    setLeadToDelete(lead);
    setDeleteModalVisible(true);
  };

  // Handle delete lead
  const handleDeleteLead = () => {
    // In a real app, this would call an API to delete the lead
    console.log('Delete lead:', leadToDelete);

    // Call deleteLead service
    // deleteLead(leadToDelete._id)
    //  .then(() => {
    //     // Update UI
    //  })
    //  .catch(error => {
    //     console.error('Error deleting lead:', error);
    //  });

    setDeleteModalVisible(false);
    setLeadToDelete(null);
  };

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
    setLeadModalVisible(true); // This is the correct state to set
  };



  // Handle add lead
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

  // Handle add activity
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

        // In a real app, call the API to update the lead
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

        // For demo purposes:
        // Create a simulated updated lead
        const updatedLead = {
          ...selectedLead,
          communications: [...(selectedLead.communications || []), {
            ...formattedActivity,
            // For demo, we'll use the actual current date
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

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // State for add note modal
  // State for add property interest modal

  // Sample properties data (in a real app, this would come from an API)
  const propertiesData = [
    { _id: 'prop001', name: 'Sunset Heights Apartment 3B', type: 'apartment', location: 'Westlands, Nairobi', price: 8500000 },
    { _id: 'prop002', name: 'Greenview Estate Plot 42', type: 'land', location: 'Kiambu Road', price: 5200000 },
    { _id: 'prop003', name: 'Riverside Apartment 7A', type: 'apartment', location: 'Riverside, Nairobi', price: 12000000 },
    { _id: 'prop004', name: 'Mountain View Land 2 Acres', type: 'land', location: 'Thika', price: 4000000 },
    { _id: 'prop005', name: 'Ocean Breeze Apartment 12C', type: 'apartment', location: 'Nyali, Mombasa', price: 9500000 },
  ];

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
            _id: currentUser._id, // In a real app, this would be the logged-in user's ID
            name: currentUser.name // In a real app, this would be the logged-in user's name
          },
          addedAt: new Date().toISOString()
        };

        console.log('Add note to lead:', selectedLead._id, newNote);

        // In a real app, call the API to update the lead
        updateLead(selectedLead._id, {
          $push: { notes: newNote }
        })
          .then(updatedLead => {
            // Update the lead in UI
            const updatedLeads = leadsData.map(lead =>
              lead._id === updatedLead._id ? updatedLead : lead
            );
            // You would update your state here
            message.success('Note added successfully');
          })
          .catch(error => {
            console.error('Error adding note:', error);
            message.error('Failed to add note');
          });

        // For demo purposes:
        // Create a simulated updated lead
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

        // In a real app, call the API to update the lead
        // updateLead(selectedLead._id, { 
        //   $addToSet: { interestedProperties: selectedProperty } 
        // })
        //  .then(updatedLead => {
        //     // Update the lead in UI
        //     const updatedLeads = leadsData.map(lead => 
        //       lead._id === updatedLead._id ? updatedLead : lead
        //     );
        //     // You would update your state here
        //     message.success('Property interest added successfully');
        //  })
        //  .catch(error => {
        //     console.error('Error adding property interest:', error);
        //     message.error('Failed to add property interest');
        //  });

        // For demo purposes:
        // Create a simulated updated lead
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
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Leads"
              value={leadsData.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="New Leads (This Week)"
              value={
                leadsData.filter(
                  (lead) =>
                    new Date(lead.createdAt) >
                    new Date(new Date().setDate(new Date().getDate() - 7)),
                ).length
              }
              valueStyle={{ color: '#52c41a' }}
              prefix={<PlusOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Qualified Leads"
              value={
                leadsData.filter((lead) => lead.status === 'qualified').length
              }
              valueStyle={{ color: '#722ed1' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={Math.round(
                (leadsData.filter((lead) => lead.status === 'converted')
                  .length /
                  leadsData.length) *
                100,
              )}
              valueStyle={{ color: '#faad14' }}
              suffix="%"
              prefix={<ArrowRightOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Lead Funnel Stats */}
      <Card title="Lead Pipeline" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={4}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress
                type="circle"
                percent={100}
                format={() => leadsByStatus['new']}
                width={80}
                strokeColor="#1890ff"
              />
              <div style={{ marginTop: 8 }}>New</div>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress
                type="circle"
                percent={100}
                format={() => leadsByStatus['contacted']}
                width={80}
                strokeColor="#13c2c2"
              />
              <div style={{ marginTop: 8 }}>Contacted</div>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress
                type="circle"
                percent={100}
                format={() => leadsByStatus['qualified']}
                width={80}
                strokeColor="#722ed1"
              />
              <div style={{ marginTop: 8 }}>Qualified</div>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress
                type="circle"
                percent={100}
                format={() => leadsByStatus['negotiation']}
                width={80}
                strokeColor="#fa8c16"
              />
              <div style={{ marginTop: 8 }}>Negotiation</div>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress
                type="circle"
                percent={100}
                format={() => leadsByStatus['converted']}
                width={80}
                strokeColor="#52c41a"
              />
              <div style={{ marginTop: 8 }}>Converted</div>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress
                type="circle"
                percent={100}
                format={() => leadsByStatus['lost']}
                width={80}
                strokeColor="#f5222d"
              />
              <div style={{ marginTop: 8 }}>Lost</div>
            </div>
          </Col>
        </Row>
      </Card>

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
      <Table
        columns={columns}
        dataSource={filteredLeads}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <strong>Notes:</strong> {record.notes[0]?.content || 'No notes available'}
            </p>
          ),
        }}
      />

      {/* Lead Details Drawer */}
      <Drawer
        title={
          selectedLead ? `Lead Details: ${selectedLead.name}` : 'Lead Details'
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
        extra={
          selectedLead &&
            selectedLead.status !== 'converted' &&
            selectedLead.status !== 'lost' ? (
            <Button type="primary" onClick={() => showConvertLeadModal(selectedLead)}>
              Convert to Customer
            </Button>
          ) : null
        }
      >
        {selectedLead && (
          <>
            <div style={{ marginBottom: 24 }}>
              <Row>
                <Col span={18}>
                  <Title level={4}>{selectedLead.name}</Title>
                  <Space direction="vertical">
                    <Text>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      {selectedLead.phone}
                    </Text>
                    <Text>
                      <MailOutlined style={{ marginRight: 8 }} />
                      {selectedLead.email}
                    </Text>
                    <Text>
                      <EnvironmentOutlined style={{ marginRight: 8 }} />
                      {selectedLead.interestAreas[0]?.county || 'Location not specified'}
                    </Text>
                  </Space>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Tag
                    color={
                      selectedLead.priority === 'high'
                        ? 'red'
                        : selectedLead.priority === 'medium'
                          ? 'orange'
                          : 'green'
                    }
                  >
                    {capitalize(selectedLead.priority)} Priority
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Tag
                      color={
                        selectedLead.status === 'new'
                          ? 'blue'
                          : selectedLead.status === 'contacted'
                            ? 'cyan'
                            : selectedLead.status === 'qualified'
                              ? 'purple'
                              : selectedLead.status === 'negotiation'
                                ? 'orange'
                                : selectedLead.status === 'converted'
                                  ? 'green'
                                  : 'red'
                      }
                    >
                      {capitalize(selectedLead.status)}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Progress
              percent={getStatusCompletionPercentage(selectedLead.status)}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ marginBottom: 24 }}
            />

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic title="Source" value={capitalize(selectedLead.source.replace('_', ' '))} />
              </Col>
              <Col span={8}>
                <Statistic title="Date Added" value={formatDate(selectedLead.createdAt)} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Days in Pipeline"
                  value={Math.ceil((new Date() - new Date(selectedLead.createdAt)) / (1000 * 60 * 60 * 24))}
                  suffix="days"
                />
              </Col>
            </Row>

            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <TabPane tab="Overview" key="1">
                <Card title="Lead Information" bordered={false}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Property Interest">
                      <Tag
                        color={
                          selectedLead.interestAreas[0]?.propertyType === 'apartment'
                            ? 'blue'
                            : selectedLead.interestAreas[0]?.propertyType === 'land'
                              ? 'green'
                              : 'purple'
                        }
                      >
                        {capitalize(selectedLead.interestAreas[0]?.propertyType || 'both')}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Budget">
                      {selectedLead.interestAreas[0]?.budget ?
                        `${selectedLead.interestAreas[0].budget.min.toLocaleString()} - ${selectedLead.interestAreas[0].budget.max.toLocaleString()} KES` :
                        'Not specified'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Assigned Agent">
                      {selectedLead.assignedTo?.name || 'Not assigned'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Communication">
                      {selectedLead.communications && selectedLead.communications.length > 0 ?
                        formatDate(selectedLead.communications[selectedLead.communications.length - 1].date) : 'No communications logged'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Next Follow-up">
                      {selectedLead.followUpDate ? formatDate(selectedLead.followUpDate) : 'None scheduled'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Notes" style={{ marginTop: 16 }}>
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={selectedLead.notes}
                      renderItem={(note) => (
                        <List.Item>
                          <List.Item.Meta
                            title={note.addedBy?.name ? `Added by ${note.addedBy.name}` : ''}
                            description={
                              <>
                                <div>{note.content}</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                  {note.addedAt ? formatDate(note.addedAt) : ''}
                                </div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No notes available" />
                  )}
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginTop: 16 }}
                    onClick={() => showAddNoteModal(selectedLead)}
                  >
                    Add Note
                  </Button>
                </Card>
              </TabPane>

              <TabPane tab="Activity Timeline" key="2">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 16 }}
                  onClick={() => showAddActivityModal(selectedLead)}
                >
                  Add Activity
                </Button>

                <Timeline mode="left">
                  {selectedLead.communications && selectedLead.communications.map((comm, index) => (
                    <Timeline.Item
                      key={index}
                      label={formatDate(comm.date)}
                      color={
                        comm.type === 'call'
                          ? 'green'
                          : comm.type === 'email'
                            ? 'blue'
                            : comm.type === 'meeting'
                              ? 'orange'
                              : comm.type === 'sms'
                                ? 'cyan'
                                : 'gray'
                      }
                    >
                      <div style={{ fontWeight: 'bold' }}>{capitalize(comm.type)}</div>
                      <div>{comm.summary}</div>
                      {comm.outcome && <div><strong>Outcome:</strong> {comm.outcome}</div>}
                      {comm.nextAction && <div><strong>Next Action:</strong> {comm.nextAction}</div>}
                      {comm.by && <div style={{ fontSize: '12px', color: '#999' }}>By: {comm.by.name}</div>}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </TabPane>

              <TabPane tab="Interested Properties" key="3">
                {selectedLead.interestedProperties && selectedLead.interestedProperties.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedLead.interestedProperties}
                    renderItem={(propertyId) => {
                      // Find the property details (in a real app, this would come from an API)
                      const property = propertiesData.find(p => p._id === propertyId) ||
                        { name: `Property ID: ${propertyId}`, location: 'Unknown location', price: 0 };

                      return (
                        <List.Item
                          actions={[
                            <Button type="link">View Details</Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<EnvironmentOutlined />} />}
                            title={property.name}
                            description={
                              <>
                                <div>{property.location}</div>
                                {property.price > 0 &&
                                  <div>Price: {property.price.toLocaleString()} KES</div>}
                              </>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <Empty description="No interested properties recorded" />
                )}

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16 }}
                  onClick={() => showAddPropertyInterestModal(selectedLead)}
                >
                  Add Property Interest
                </Button>
              </TabPane>

              <TabPane tab="Follow-ups" key="4">
                <Card>
                  {selectedLead.followUpDate ? (
                    <>
                      <Title level={5}>Next Scheduled Follow-up</Title>
                      <Descriptions>
                        <Descriptions.Item label="Date" span={3}>
                          {formatDate(selectedLead.followUpDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Assigned To" span={3}>
                          {selectedLead.assignedTo?.name || 'Not assigned'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Next Action" span={3}>
                          {selectedLead.communications && selectedLead.communications.length > 0
                            ? selectedLead.communications[selectedLead.communications.length - 1].nextAction || 'Not specified'
                            : 'Not specified'}
                        </Descriptions.Item>
                      </Descriptions>
                      <div style={{ marginTop: 16 }}>
                        <Space>
                          <Button type="primary" onClick={() => {
                            // Open activity modal with "Follow-up Completed" pre-selected
                            setNewActivity({
                              type: 'call',
                              date: new Date().toISOString(),
                              summary: 'Follow-up completed',
                              outcome: '',
                              nextAction: '',
                            });
                            activityForm.setFieldsValue({
                              type: 'call',
                              date: moment(),
                              summary: 'Follow-up completed'
                            });
                            setAddActivityVisible(true);
                          }}>Complete & Log</Button>
                          <Button onClick={() => {
                            // Open the reschedule modal (we'll reuse the activity modal)
                            setNewActivity({
                              type: 'other',
                              date: new Date().toISOString(),
                              summary: 'Follow-up rescheduled',
                              outcome: 'Rescheduled',
                              nextAction: '',
                            });
                            activityForm.setFieldsValue({
                              type: 'other',
                              date: moment(),
                              summary: 'Follow-up rescheduled',
                              outcome: 'Rescheduled',
                              followUpDate: moment().add(7, 'days') // Default to one week later
                            });
                            setAddActivityVisible(true);
                          }}>Reschedule</Button>
                        </Space>
                      </div>
                    </>
                  ) : (
                    <Empty description="No upcoming follow-ups scheduled" />
                  )}
                </Card>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16 }}
                  onClick={() => {
                    // Open the activity modal with follow-up date field focused
                    setNewActivity({
                      type: 'call',
                      date: new Date().toISOString(),
                      summary: 'Scheduled follow-up',
                      outcome: '',
                      nextAction: '',
                    });
                    activityForm.setFieldsValue({
                      type: 'call',
                      date: moment(),
                      summary: 'Scheduled follow-up',
                      followUpDate: moment().add(7, 'days') // Default to one week later
                    });
                    setAddActivityVisible(true);

                    // After modal is visible, focus on the followUpDate field
                    setTimeout(() => {
                      const followUpDateElement = document.querySelector('[name="followUpDate"]');
                      if (followUpDateElement) {
                        followUpDateElement.focus();
                      }
                    }, 300);
                  }}
                >
                  Schedule Follow-up
                </Button>
              </TabPane>
            </Tabs>
          </>
        )}
      </Drawer>

      {/* Add Lead Modal */}
      <Modal
        title={modalMode === 'add' ? "Add New Lead" : "Edit Lead"}
        open={leadModalVisible}
        onOk={handleAddLead}
        onCancel={() => {
          setLeadModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText={modalMode === 'add' ? "Add Lead" : "Update Lead"}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter the lead name' }]}
              >
                <Input
                  placeholder="Enter lead's full name"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Number"
                name="phone"
                rules={[
                  { required: true, message: 'Please enter the phone number' },
                  {
                    pattern: /^\+?[0-9]{10,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                ]}
              >
                <Input
                  placeholder="+254 7XX XXX XXX"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  {
                    pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address'
                  }
                ]}
              >
                <Input
                  placeholder="email@example.com"
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="County/Location"
                name="county"
              >
                <Input
                  placeholder="E.g., Nairobi, Mombasa, Kisumu"
                  prefix={<EnvironmentOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Lead Source"
                name="source"
                initialValue="website"
              >
                <Select>
                  <Option value="website">Website</Option>
                  <Option value="referral">Referral</Option>
                  <Option value="social_media">Social Media</Option>
                  <Option value="direct_call">Direct Call</Option>
                  <Option value="walk_in">Walk-in</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Source Details"
                name="sourceDetails"
              >
                <Input placeholder="Additional details about the source" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Priority"
                name="priority"
                initialValue="medium"
              >
                <Select>
                  <Option value="high">High</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Property Interest"
                name="propertyType"
                initialValue="both"
              >
                <Select>
                  <Option value="apartment">Apartment</Option>
                  <Option value="land">Land</Option>
                  <Option value="both">Both</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Budget Range (Min)"
                name="budgetMin"
              >
                <Input
                  type="number"
                  placeholder="Minimum budget (KES)"
                  prefix={<DollarOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Budget Range (Max)"
                name="budgetMax"
              >
                <Input
                  type="number"
                  placeholder="Maximum budget (KES)"
                  prefix={<DollarOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Assigned Agent"
            name="assignedTo"
          >
            <Select placeholder="Select an agent">
              {agentsData.map(agent => (
                <Option key={agent._id} value={agent._id}>{agent.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea
              rows={4}
              placeholder="Any additional information about the lead..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        title={`Add Activity for ${selectedLead?.name || 'Lead'}`}
        open={addActivityVisible}
        onOk={handleAddActivity}
        onCancel={() => {
          setAddActivityVisible(false);
          activityForm.resetFields();
        }}
        okText="Add Activity"
      >
        <Form layout="vertical" form={activityForm}>
          <Form.Item
            label="Activity Type"
            name="type"
            initialValue="call"
            rules={[{ required: true, message: 'Please select an activity type' }]}
          >
            <Select>
              <Option value="call">Phone Call</Option>
              <Option value="email">Email</Option>
              <Option value="meeting">Meeting</Option>
              <Option value="sms">SMS</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            initialValue={moment()}
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
            />
          </Form.Item>

          <Form.Item
            label="Summary"
            name="summary"
            rules={[{ required: true, message: 'Please provide a summary' }]}
          >
            <TextArea
              rows={3}
              placeholder="Summary of the activity..."
            />
          </Form.Item>

          <Form.Item
            label="Outcome"
            name="outcome"
          >
            <Input placeholder="Outcome of the activity" />
          </Form.Item>

          <Form.Item
            label="Next Action"
            name="nextAction"
          >
            <Input placeholder="What needs to be done next?" />
          </Form.Item>

          <Form.Item
            label="Schedule Next Follow-up"
            name="followUpDate"
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDeleteLead}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the lead for{' '}
          <strong>{leadToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Convert Lead to Customer Modal */}
      <Modal
        title={`Convert ${selectedLead?.name || 'Lead'} to Customer`}
        open={convertLeadVisible}
        // onOk={handleConvertLead}
        onCancel={() => {
          setConvertLeadVisible(false);
          convertForm.resetFields();
        }}
        width={700}
        okText="Convert to Customer"
      >
        <Form layout="vertical" form={convertForm}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter the customer name' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Number"
                name="phone"
                rules={[{ required: true, message: 'Please enter the phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email Address"
                name="email"
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ID Number"
                name="idNumber"
                rules={[{ required: true, message: 'Please enter ID number' }]}
              >
                <Input prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="KRA PIN"
                name="kraPin"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Customer Type"
                name="customerType"
                initialValue="individual"
              >
                <Select>
                  <Option value="individual">Individual</Option>
                  <Option value="corporate">Corporate</Option>
                  <Option value="government">Government</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="County"
                name="county"
              >
                <Input prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Additional Address"
                name="additionalAddress"
              >
                <Input placeholder="Street, building, etc." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea
              rows={4}
              placeholder="Any additional notes about this customer..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        title={`Add Note for ${selectedLead?.name || 'Lead'}`}
        open={addNoteVisible}
        onOk={handleAddNote}
        onCancel={() => {
          setAddNoteVisible(false);
          noteForm.resetFields();
        }}
        okText="Add Note"
      >
        <Form layout="vertical" form={noteForm}>
          <Form.Item
            label="Note Content"
            name="content"
            rules={[{ required: true, message: 'Please enter note content' }]}
          >
            <TextArea
              rows={6}
              placeholder="Enter your note here..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Property Interest Modal */}
      <Modal
        title={`Add Property Interest for ${selectedLead?.name || 'Lead'}`}
        open={addPropertyInterestVisible}
        onOk={handleAddPropertyInterest}
        onCancel={() => {
          setAddPropertyInterestVisible(false);
          propertyForm.resetFields();
        }}
        okText="Add Property Interest"
      >
        <Form layout="vertical" form={propertyForm}>
          <Form.Item
            label="Select Property"
            name="propertyId"
            rules={[{ required: true, message: 'Please select a property' }]}
          >
            <Select placeholder="Choose a property">
              {propertiesData.map(property => (
                <Option key={property._id} value={property._id}>
                  {property.name} - {property.location} - {property.price.toLocaleString()} KES
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              Not finding the property? <a href="#">Add new property</a>
            </Text>
          </div>
        </Form>
      </Modal>
    </>
  );
};

// Empty component for when there's no data
const Empty = ({ description }) => (
  <div style={{ textAlign: 'center', padding: '50px 0' }}>
    <UserOutlined style={{ fontSize: 48, color: '#ccc' }} />
    <p style={{ marginTop: 16, color: '#999' }}>{description}</p>
  </div>
);

export default LeadsManagement;