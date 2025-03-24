import { deleteValuation, fetchAllValuations } from '@/services/valuation';
import {
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileSearchOutlined,
  HomeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Dropdown,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { useRef, useState } from 'react';
import ValuationDrawer from './components/drawers/ValuationDrawer';
import AddEditValuationModal from './components/modals/AddEditValuationModal';
import ValuationStats from './components/stats/ValuationStats';

const ValuationManagement = () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const actionRef = useRef<ActionType>();

  const onView = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const { run: delValuation } = useRequest(deleteValuation, {
    manual: true,
    onSuccess: () => {
      message.success('Valuation deleted successfully');
      actionRef.current?.reload();
    },
    onError: () => {
      message.error('Error deleting valuation');
    },
  });

  const actionColumn = {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    search: false,
    render: (_: any, record: { status: string; _id: string }) => (
      <Space>
        <Tooltip title="View Details">
          <Button
            key={`view-valuation-${record?._id}`}
            icon={<FileSearchOutlined />}
            size="small"
            onClick={() => onView(record)}
          />
        </Tooltip>
        <Tooltip title="Edit">
          <AddEditValuationModal
            actionRef={actionRef}
            key={`edit-valuation-${record?._id}-${JSON.stringify(record)}`}
            data={record}
            edit
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure delete this valuation?"
            onConfirm={() => delValuation(record?._id)}
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
      <ValuationStats />

      {/* Valuations Table */}
      <ProTable
        columns={[
          {
            title: 'Property',
            dataIndex: ['property', 'name'],
            key: 'property',
            fieldProps: {
              placeholder: 'Search by property name',
            },
            render: (text) => (
              <Space>
                <HomeOutlined />
                {text || 'N/A'}
              </Space>
            ),
            sorter: (a, b) => a.property?.name.localeCompare(b.property?.name),
          },
          {
            title: 'Type',
            dataIndex: ['property', 'propertyType'],
            key: 'type',
            align: 'center',
            search: false,
            render: (type) => (
              <Tag color={type === 'apartment' ? 'blue' : 'green'}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Tag>
            ),
            filters: [
              { text: 'Apartment', value: 'apartment' },
              { text: 'Land', value: 'land' },
            ],
            onFilter: (value, record) => record.property.propertyType === value,
          },
          {
            title: 'Client',
            dataIndex: ['requestedBy', 'name'],
            key: 'requestedBy',
            align: 'center',
            search: false,
            render: (text) => <span>{text || 'Not Assigned'}</span>,
            sorter: (a, b) => {
              if (!a.requestedBy) return 1;
              if (!b.requestedBy) return -1;
              return a.requestedBy.name.localeCompare(b.requestedBy.name);
            },
          },
          {
            title: 'Purpose',
            dataIndex: 'valuationPurpose',
            key: 'purpose',
            align: 'center',
            search: false,
            filters: [
              { text: 'Sale', value: 'sale' },
              { text: 'Mortgage', value: 'mortgage' },
              { text: 'Insurance', value: 'insurance' },
              { text: 'Tax', value: 'tax' },
            ],
            onFilter: (value, record) => record?.valuationPurpose === value,
            render: (purpose) => {
              const formattedPurpose =
                purpose.charAt(0).toUpperCase() + purpose.slice(1);
              return (
                <Tag
                  color={
                    purpose === 'sale'
                      ? 'blue'
                      : purpose === 'mortgage'
                      ? 'green'
                      : purpose === 'insurance'
                      ? 'purple'
                      : 'orange'
                  }
                >
                  {formattedPurpose}
                </Tag>
              );
            },
          },
          // {
          //   title: 'Request Date',
          //   dataIndex: 'createdAt',
          //   key: 'requestDate',
          //   align: 'center',
          //   search: false,
          //   render: (date) => new Date(date).toLocaleDateString(),
          //   sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          // },
          {
            title: 'Valuation Date',
            dataIndex: 'valuationDate',
            key: 'valuationDate',
            align: 'center',
            search: false,
            render: (date) =>
              date ? (
                new Date(date).toLocaleDateString()
              ) : (
                <Text type="secondary">Pending</Text>
              ),
            sorter: (a, b) => {
              if (!a.valuationDate) return 1;
              if (!b.valuationDate) return -1;
              return new Date(a.valuationDate) - new Date(b.valuationDate);
            },
          },
          // {
          //   title: 'Status',
          //   dataIndex: 'status',
          //   key: 'status',
          //   align: 'center',
          //   search: false,
          //   render: (status) => {
          //     let color = 'default';
          //     // if (!status) status = 'Pending';
          //     if (status === 'Pending Inspection') color = 'orange';
          //     if (status === 'In Progress') color = 'blue';
          //     if (status === 'Completed') color = 'green';
          //     if (status === 'Canceled') color = 'red';

          //     return <Tag color={color}>{status}</Tag>;
          //   },
          //   filters: [
          //     { text: 'Pending', value: 'Pending' },
          //     { text: 'Pending Inspection', value: 'Pending Inspection' },
          //     { text: 'In Progress', value: 'In Progress' },
          //     { text: 'Completed', value: 'Completed' },
          //     { text: 'Canceled', value: 'Canceled' },
          //   ],
          //   onFilter: (value, record) => (record.status || 'Pending') === value,
          // },
          {
            title: 'Valuer',
            dataIndex: ['valuer', 'name'],
            key: 'valuer',
            align: 'center',
            fieldProps: {
              placeholder: 'Search by valuer name',
            },
            render: (name) => name || 'Not Assigned',
          },
          {
            title: 'Market Value (KES)',
            dataIndex: 'marketValue',
            key: 'marketValue',
            align: 'center',
            search: false,
            render: (value) => (value ? value.toLocaleString() : 'Pending'),
            sorter: (a, b) => {
              if (!a.marketValue) return 1;
              if (!b.marketValue) return -1;
              return a.marketValue - b.marketValue;
            },
          },
          actionColumn,
        ]}
        actionRef={actionRef}
        rowKey="_id"
        request={async () => {
          const data = await fetchAllValuations();
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
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => (
            <div>{`Showing ${range[0]}-${range[1]} of ${total} total valuations`}</div>
          ),
        }}
        scroll={{ x: 1000 }}
        headerTitle="Valuations"
        toolBarRender={() => [
          <AddEditValuationModal
            actionRef={actionRef}
            key={'add-valuation-modal'}
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

      {/* valuation drawe */}
      <ValuationDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        selectedValuation={selectedRecord}
      />
    </>
  );
};

export default ValuationManagement;
