import { fetchAllPayments } from '@/services/payments';
import {
  DownOutlined,
  ExportOutlined,
  EyeOutlined,
  FileExcelOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Button, Dropdown, Space, Tag, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import PaymentDrawer from './components/drawer/PaymentDrawer';
import PaymentModal from './components/modal/PaymentsModal';
import PaymentStats from './components/stats/PaymentStats';

const PaymentsList = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const actionRef = useRef<ActionType>();

  const onView = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
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
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onView(record)}
          />
        </Tooltip>
      </Space>
    ),
  };

  return (
    <>
      <PaymentStats />

      {/* Payment Details Drawer */}
      <PaymentDrawer
        visible={drawerVisible}
        record={selectedRecord}
        onClose={() => setDrawerVisible(false)}
      />

      <ProTable
        columns={[
          // {
          //   title: 'Property',
          //   dataIndex: ['property', 'name'],
          //   key: 'property',
          //   fieldProps: {
          //     placeholder: 'Search by property name',
          //   },
          //   fixed: true,
          //   width: 200,
          //   render: (text) => (
          //     <Space>
          //       <HomeOutlined />
          //       {text || 'N/A'}
          //     </Space>
          //   ),
          //   sorter: (a, b) => {
          //     const nameA = a.sale?.property?.name || '';
          //     const nameB = b.sale?.property?.name || '';
          //     return nameA.localeCompare(nameB);
          //   },
          // },
          {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            fieldProps: {
              placeholder: 'Search by customer name',
            },
            render: (text) => text || 'N/A',
            sorter: (a, b) => {
              const nameA = a.customer?.name || '';
              const nameB = b.customer?.name || '';
              return nameA.localeCompare(nameB);
            },
          },
          // {
          //   title: 'Payment Plan',
          //   dataIndex: ['paymentPlan', 'totalAmount'],
          //   key: 'paymentPlan',
          //   width: 130,
          //   render: (amount) => `KES ${amount?.toLocaleString() || 0}`,
          // },
          {
            title: 'Amount (KES)',
            dataIndex: 'amount',
            key: 'amount',
            search: false,
            align: 'center',
            render: (amount) => (amount || 0).toLocaleString(),
            sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
          },
          {
            title: 'Date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            search: false,
            width: 120,
            render: (date) =>
              date ? new Date(date).toLocaleDateString() : 'N/A',
            sorter: (a, b) => {
              if (!a.paymentDate) return -1;
              if (!b.paymentDate) return 1;
              return new Date(a.paymentDate) - new Date(b.paymentDate);
            },
          },
          {
            title: 'Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            search: false,
            align: 'center',
            filters: [
              { text: 'M-Pesa', value: 'mpesa' },
              { text: 'Bank Transfer', value: 'bank_transfer' },
              { text: 'Cash', value: 'cash' },
              { text: 'Cheque', value: 'cheque' },
              { text: 'Other', value: 'other' },
            ],
            onFilter: (value, record) => record.paymentMethod === value,
            render: (method) => {
              let methodText = 'Other';
              let color = 'gray';

              switch (method) {
                case 'mpesa':
                  methodText = 'M-Pesa';
                  color = 'green';
                  break;
                case 'bank_transfer':
                  methodText = 'Bank Transfer';
                  color = 'blue';
                  break;
                case 'cash':
                  methodText = 'Cash';
                  color = 'yellow';
                  break;
                case 'cheque':
                  methodText = 'Cheque';
                  color = 'purple';
                  break;
              }
              return <Tag color={color}>{methodText}</Tag>;
            },
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            search: false,
            align: 'center',
            filters: [
              { text: 'Pending', value: 'pending' },
              { text: 'Completed', value: 'completed' },
              { text: 'Failed', value: 'failed' },
              { text: 'Refunded', value: 'refunded' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
              let color = 'gray';
              let text = status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : 'Unknown';

              switch (status) {
                case 'pending':
                  color = 'orange';
                  break;
                case 'completed':
                  color = 'green';
                  break;
                case 'failed':
                  color = 'red';
                  break;
                case 'refunded':
                  color = 'purple';
                  break;
              }
              return <Tag color={color}>{text}</Tag>;
            },
          },
          {
            title: 'Receipt #',
            dataIndex: 'receiptNumber',
            key: 'receiptNumber',
            search: false,
            render: (text) => text || <span className="text-gray-400">-</span>,
          },
          actionColumn,
        ]}
        actionRef={actionRef}
        rowKey="id"
        dateFormatter="string"
        scroll={{ x: 1000 }}
        request={async () => {
          const data = await fetchAllPayments();

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
        // expandable={{
        // expandedRowRender: (record) => (
        // <UserExpandedDetails record={record} />
        // ),
        // rowExpandable: (record) => !!record.id,
        // }}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => (
            <div>{`Showing ${range[0]}-${range[1]} of ${total} total payments`}</div>
          ),
        }}
        headerTitle="Payments"
        toolBarRender={() => [
          <PaymentModal actionRef={actionRef} key={'add-payment-modal'} />,
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
    </>
  );
};

export default PaymentsList;
