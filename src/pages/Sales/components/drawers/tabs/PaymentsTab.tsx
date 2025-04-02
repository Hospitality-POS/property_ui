import { Payment } from '@/pages/Sales/types/SalesTypes';
import formatDate from '@/utils/formatDateUtil';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import React from 'react';
import formatPaymentMethod from '../util/formatPaymentMethod';

// Component for displaying payment action buttons
const PaymentActions: React.FC<{ status?: string }> = ({ status }) => {
  return (
    <Space>
      {['Pending', 'pending'].includes(status || '') && (
        <Button size="small" type="primary">
          Confirm
        </Button>
      )}
      <Button size="small">Receipt</Button>
    </Space>
  );
};

// Component for displaying payment status tag
const PaymentStatusTag: React.FC<{ status?: string }> = ({ status }) => {
  let color = 'default';

  if (status) {
    if (['Paid', 'completed'].includes(status.toLowerCase())) {
      color = 'green';
    } else if (['Pending', 'pending'].includes(status.toLowerCase())) {
      color = 'orange';
    } else if (['Refunded', 'refunded'].includes(status.toLowerCase())) {
      color = 'red';
    }
  }

  return (
    <Tag color={color}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </Tag>
  );
};

const PaymentsTab: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const columns = [
    {
      title: 'Receipt No.',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      render: (receiptNumber?: string) => receiptNumber || 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => amount.toLocaleString(),
    },
    {
      title: 'Note',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes?: string) => notes || 'N/A',
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'method',
      filters: [
        { text: 'Cash', value: 'cash' },
        { text: 'Bank Transfer', value: 'bank_transfer' },
        { text: 'cheque', value: 'cheque' },
        { text: 'Other', value: 'Other' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
      render: formatPaymentMethod,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Paid', value: 'Paid' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Refunded', value: 'Refunded' },
        { text: 'Cancelled', value: 'Cancelled' },
        { text: 'Completed', value: 'Completed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => <PaymentStatusTag status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Payment) => (
        <PaymentActions status={record.status} />
      ),
    },
  ];

  return (
    <ProTable
      dataSource={payments}
      columns={columns}
      rowKey={'_id'}
      search={false}
      headerTitle="Payments"
      pagination={{
        pageSize: 5,
        showTotal: (total, range) => (
          <div>{`Showing ${range[0]}-${range[1]} of ${total} total payments`}</div>
        ),
      }}
    />
  );
};

export default PaymentsTab;
