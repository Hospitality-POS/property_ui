import { deleteCustomer, fetchAllCustomers } from '@/services/customer';
import {
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileSearchOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Dropdown,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd';
import { useRef, useState } from 'react';
import CustomerDrawer from './component/drawers/CustomerDrawer';
import AddEditCustomerModal from './component/modal/AddEditCustomerModal';
import CustomerStats from './component/stats/CustomerStats';

const CustomerManagement = () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const actionRef = useRef<ActionType>();

  const onViewCustomer = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const { run: handleDeleteCustomer } = useRequest(deleteCustomer, {
    manual: true,
    onSuccess: () => {
      actionRef.current?.reload();
      message.success('Customer deleted successfully');
    },
  });

  const actionColumn = {
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
            onClick={() => onViewCustomer(record)}
          />
        </Tooltip>
        <Tooltip title="Edit">
          <AddEditCustomerModal
            data={record}
            edit
            key={`edit-customer-${record._id}-${JSON.stringify(record)}`}
            actionRef={actionRef}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this customer?"
            onConfirm={() => handleDeleteCustomer(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Tooltip>
      </Space>
    ),
  };

  return (
    <>
      {/* Customer Statistics Cards */}
      <CustomerStats />

      {/* Customers Table */}
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
            title: 'Address',
            dataIndex: ['address', 'city'],
            key: 'address',
            search: false,
            fieldProps: {
              placeholder: 'Search by address',
            },
            render: (city, record) => {
              const addressCity = record.address.city;
              const addressCounty = record.address.county;

              if (!addressCity && !addressCounty) return 'N/A';
              if (!addressCity) return addressCounty;
              if (!addressCounty) return addressCity;

              return (
                <span>
                  {addressCity}, {addressCounty}
                </span>
              );
            },
            sorter: (a, b) => a.address.localeCompare(b.address),
          },
          {
            title: 'Occupation',
            dataIndex: 'occupation',
            key: 'occupation',
            align: 'center',
            search: false,
            fieldProps: {
              placeholder: 'Search by occupation',
            },
            render: (occupation) =>
              occupation === '' ? 'Not specified' : occupation,
            sorter: (a, b) => {
              const occupationA = a.occupation || 'Not specified';
              const occupationB = b.occupation || 'Not specified';
              return occupationA.localeCompare(occupationB);
            },
          },
          {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
            search: false,
            fieldProps: {
              placeholder: 'Search by company',
            },
            render: (company) => company || 'Not specified',
            sorter: (a, b) => {
              const companyA = a.company || 'Not specified';
              const companyB = b.company || 'Not specified';
              return companyA.localeCompare(companyB);
            },
          },
          {
            title: 'Type',
            dataIndex: ['customerType'],
            key: 'customerType',
            search: false,
            align: 'center',
            fieldProps: {
              placeholder: 'Search by customer type',
            },
            render: (type) => {
              return (
                <Tag color={type === 'individual' ? 'blue' : 'purple'}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Tag>
              );
            },
            sorter: (a, b) => a.customerType.localeCompare(b.customerType),
            filters: [
              { text: 'Individual', value: 'individual' },
              { text: 'Company', value: 'company' },
            ],
            onFilter: (value, record) => record.customerType === value,
          },
          {
            title: 'Date Joined',
            dataIndex: ['createdAt'],
            key: 'dateJoined',
            search: false,
            fieldProps: {
              placeholder: 'Search by date joined',
            },
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
          },
          actionColumn,
        ]}
        rowKey="_id"
        request={async () => {
          // const { current, pageSize } = params;
          const data = await fetchAllCustomers();
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
            <div>{`Showing ${range[0]}-${range[1]} of ${total} total customers`}</div>
          ),
        }}
        scroll={{ x: 1000 }}
        headerTitle="Customers"
        toolBarRender={() => [
          <AddEditCustomerModal
            actionRef={actionRef}
            key={'add-edit-customer'}
          />,
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

      {/* Customer Details Drawer */}
      <CustomerDrawer
        visible={drawerVisible}
        customer={selectedRecord}
        onClose={() => setDrawerVisible(false)}
      />
    </>
  );
};

export default CustomerManagement;
