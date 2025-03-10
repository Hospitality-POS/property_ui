import UserDetailsDrawer from '@/components/drawers/userDetail';
import AddEditUserModal from '@/components/Modals/new/AddUserModal';
import { reversePhoneNumber } from '@/components/phonenumber/reversePhoneNumberFormat';
import { fetchAllUsers } from '@/services/auth.api';
import {
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileSearchOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Button, Dropdown, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { useRef, useState } from 'react';

const UserManagement = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const actionRef = useRef<ActionType>();

  // Added missing function definitions
  const onView = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const onDelete = (record) => {
    // Implement delete logic here
    console.log('Delete user:', record);
  };

  // Added missing formatDate function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const actionColumn = {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center' as const,
    hideInSearch: true,
    render: (_, record: any) => (
      <Space>
        <Tooltip title="View Details">
          <Button
            icon={<FileSearchOutlined />}
            size="small"
            onClick={() => onView(record)}
          />
        </Tooltip>
        <Tooltip title="Edit">
          {/* <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          /> */}
          <AddEditUserModal
            actionRef={actionRef}
            data={record}
            edit
            key={'edit-user'}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure delete this user?"
          onConfirm={() => onDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    ),
  };

  return (
    <>
      <ProTable
        columns={[
          {
            title: 'Full Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name?.localeCompare(b.name),
          },
          {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            copyable: true,
            sorter: (a, b) => a.email?.localeCompare(b.email),
          },
          {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => reversePhoneNumber(text)?.phone || text,
          },
          {
            title: 'Role',
            dataIndex: 'role',
            search: false,
            align: 'center',
            key: 'role',
            render: (role) => {
              let color = 'blue';
              let displayText = role;
              switch (role) {
                case 'admin':
                  color = 'red';
                  displayText = 'Admin';
                  break;
                case 'property_manager':
                  color = 'green';
                  displayText = 'Property Manager';
                  break;
                case 'sales_agent':
                  color = 'blue';
                  displayText = 'Sales Agent';
                  break;
                case 'finance_officer':
                  color = 'purple';
                  displayText = 'Finance Officer';
                  break;
                case 'customer':
                  color = 'orange';
                  displayText = 'Customer';
                  break;
                case 'valuer':
                  color = 'yellow';
                  displayText = 'Valuation Officer';
                  break;
              }
              return <Tag color={color}>{displayText}</Tag>;
            },
            filters: [
              { text: 'Admin', value: 'admin' },
              { text: 'Property Manager', value: 'property_manager' },
              { text: 'Sales Agent', value: 'sales_agent' },
              { text: 'Finance Officer', value: 'finance_officer' },
              { text: 'Customer', value: 'customer' },
              { text: 'Valuation Officer', value: 'valuer' },
            ],
            onFilter: (value, record) => record.role === value,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            search: false,
            align: 'center',
            key: 'status',
            render: (status) => {
              let color = status === 'Active' ? 'green' : 'red';
              return <Tag color={color}>{status}</Tag>;
            },
            filters: [
              { text: 'Active', value: 'Active' },
              { text: 'Inactive', value: 'Inactive' },
            ],
            onFilter: (value, record) => record.status === value,
          },
          {
            title: 'Date Joined',
            dataIndex: 'dateJoined',
            align: 'center',
            search: false,
            key: 'dateJoined',
            render: (text, record) => formatDate(record.createdAt) || text,
            sorter: (a, b) => {
              const dateA = a.createdAt
                ? new Date(a.createdAt)
                : new Date(a.dateJoined || 0);
              const dateB = b.createdAt
                ? new Date(b.createdAt)
                : new Date(b.dateJoined || 0);
              return dateA - dateB;
            },
          },
          actionColumn,
        ]}
        actionRef={actionRef}
        rowKey="id"
        dateFormatter="string"
        request={async () => {
          const data = await fetchAllUsers();

          return {
            data: data,
            success: true,
            total: data.length,
          };
        }}
        search={{
          searchText: 'Search User',
          resetText: 'Reset',
          labelWidth: 'auto',
          layout: 'vertical',
        }}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <strong>Address:</strong> {record.address || 'N/A'}
              <br />
              <strong>Department:</strong> {record.department || 'N/A'}
              <br />
              <strong>Last Login:</strong>{' '}
              {new Date(record.lastLogin).toLocaleString() || 'Never'}
            </p>
          ),
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => (
            <div>{`Showing ${range[0]}-${range[1]} of ${total} total users`}</div>
          ),
        }}
        headerTitle="Users"
        toolBarRender={() => [
          <AddEditUserModal actionRef={actionRef} key={'add-user-modal'} />,
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

      <UserDetailsDrawer
        record={selectedRecord}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        actionRef={actionRef}
      />
    </>
  );
};

export default UserManagement;
