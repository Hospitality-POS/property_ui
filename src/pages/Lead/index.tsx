import { fetchAllLeads } from '@/services/lead';
import {
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileSearchOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { useRef, useState } from 'react';

import { ActionType, ProTable } from '@ant-design/pro-components';
import LeadDetails from './components/drawer/LeadDetails';
import AddEditLeadModal from './components/modals/AddEditLeadModal';
import LeadsStats from './components/stats/LeadsStats';

const LeadsManagement = () => {
  const actionRef = useRef<ActionType>();

  // State for selected lead and drawer
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const onView = (lead: any) => {
    setSelectedLead(lead);
    setDrawerVisible(true);
  };

  return (
    <>
      {/* Lead Statistics Cards */}
      <LeadsStats />

      {/* Lead Table */}
      <ProTable
        columns={[
          {
            title: 'Name',
            dataIndex: ['name'],
            key: 'name',
            fieldProps: {
              placeholder: 'Search by name',
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: 'Email',
            dataIndex: ['email'],
            key: 'email',
            copyable: true,
            ellipsis: true,
            align: 'center',
            fieldProps: {
              placeholder: 'Search by email',
            },
            sorter: (a, b) => a.email.localeCompare(b.email),
          },
          {
            title: 'Phone',
            dataIndex: ['phone'],
            key: 'phone',
            fieldProps: {
              placeholder: 'Search by phone',
            },
            sorter: (a, b) => a.phone.localeCompare(b.phone),
          },
          {
            title: 'Source',
            dataIndex: ['source'],
            key: 'source',
            align: 'center',
            search: false,
            filters: [
              { text: 'Direct', value: 'direct' },
              { text: 'Referral', value: 'referral' },
              { text: 'Website', value: 'website' },
              { text: 'Social', value: 'social' },
              { text: 'Agent', value: 'agent' },
            ],
            onFilter: (value, record) => record.source === value,
            sorter: (a, b) => a.source.localeCompare(b.source),
            render: (source) => {
              let color = 'default';
              switch (source) {
                case 'direct':
                  color = 'blue';
                  break;
                case 'referral':
                  color = 'cyan';
                  break;
                case 'website':
                  color = 'purple';
                  break;
                case 'social':
                  color = 'gold';
                  break;
                case 'agent':
                  color = 'green';
                  break;
                default:
                  color = 'default';
                  break;
              }
              return <Tag color={color}>{source}</Tag>;
            },
          },
          {
            title: 'Priority',
            dataIndex: ['priority'],
            key: 'priority',
            align: 'center',
            search: false,
            filters: [
              { text: 'High', value: 'high' },
              { text: 'Medium', value: 'medium' },
              { text: 'Low', value: 'low' },
            ],
            onFilter: (value, record) => record.priority === value,
            sorter: (a, b) => a.priority.localeCompare(b.priority),
            render: (priority) => {
              let color = 'default';
              switch (priority) {
                case 'high':
                  color = 'red';
                  break;
                case 'medium':
                  color = 'orange';
                  break;
                case 'low':
                  color = 'green';
                  break;
                default:
                  color = 'default';
                  break;
              }
              return <Tag color={color}>{priority}</Tag>;
            },
          },
          {
            title: 'Status',
            dataIndex: ['status'],
            key: 'status',
            align: 'center',
            search: false,
            filters: [
              { text: 'New', value: 'new' },
              { text: 'Contacted', value: 'contacted' },
              { text: 'Qualified', value: 'qualified' },
              { text: 'Negotiation', value: 'negotiation' },
              { text: 'Converted', value: 'converted' },
              { text: 'Lost', value: 'lost' },
            ],
            onFilter: (value, record) => record.status === value,
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (status) => {
              let color = 'default';
              switch (status) {
                case 'new':
                  color = 'blue';
                  break;
                case 'contacted':
                  color = 'cyan';
                  break;
                case 'qualified':
                  color = 'purple';
                  break;
                case 'negotiation':
                  color = 'gold';
                  break;
                case 'converted':
                  color = 'green';
                  break;
                case 'lost':
                  color = 'red';
                  break;
                default:
                  color = 'default';
                  break;
              }
              return <Tag color={color}>{status}</Tag>;
            },
          },
          {
            title: 'Assigned To',
            dataIndex: ['assignedTo', 'name'],
            key: 'assignedTo',
            search: false,
            sorter: (a, b) =>
              a.assignedTo.name.localeCompare(b.assignedTo.name),
          },
          {
            title: 'Created',
            dataIndex: ['createdAt'],
            key: 'createdAt',
            align: 'center',
            search: false,
            render: (date) =>
              date ? new Date(date).toLocaleDateString() : 'N/A',
            sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
          },
          {
            title: 'Actions',
            key: 'actions',
            align: 'center' as const,
            search: false,
            render: (_: any, record: any) => (
              <Space>
                <Tooltip title="View Details">
                  <Button
                    icon={<FileSearchOutlined />}
                    size="small"
                    onClick={() => onView(record)}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <AddEditLeadModal
                    actionRef={actionRef}
                    key={`edit-lead-${record._id}-${JSON.stringify(record)}`}
                    edit
                    data={record}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Popconfirm
                    title="Are you sure you want to delete this lead?"
                    // onConfirm={() => handleDeleteLead(record._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button icon={<DeleteOutlined />} size="small" danger />
                  </Popconfirm>
                </Tooltip>
              </Space>
            ),
          },
        ]}
        rowKey="_id"
        request={async () => {
          const data = await fetchAllLeads();
          return {
            data: data?.data,
            success: true,
            total: data?.data.length,
          };
        }}
        search={{
          searchText: 'Search',
          resetText: 'Reset',
          labelWidth: 'auto',
          layout: 'vertical',
        }}
        actionRef={actionRef}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => (
            <div>{`Showing ${range[0]}-${range[1]} of ${total} total leads`}</div>
          ),
        }}
        scroll={{ x: 1000 }}
        headerTitle="Leads"
        toolBarRender={() => [
          <AddEditLeadModal actionRef={actionRef} key={'add-edit-lead'} />,
          <Dropdown
            key={'export'}
            menu={{
              items: [
                {
                  key: '1',
                  icon: <FileExcelOutlined />,
                  label: 'Export to Excel',
                },
                {
                  key: '2',
                  icon: <PrinterOutlined />,
                  label: 'Export to PDF',
                },
              ],
            }}
          >
            <Button style={{ width: '100%' }}>
              <ExportOutlined /> Export <DownOutlined />
            </Button>
          </Dropdown>,
        ]}
      />

      <LeadDetails
        lead={selectedLead}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </>
  );
};

export default LeadsManagement;
