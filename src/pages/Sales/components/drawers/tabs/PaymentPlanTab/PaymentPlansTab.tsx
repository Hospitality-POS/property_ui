import { PaymentPlan } from '@/pages/Sales/types/SalesTypes';
import formatDate from '@/utils/formatDateUtil';
import { ProTable } from '@ant-design/pro-components';
import { Alert, Card, Tag } from 'antd';
import React from 'react';
import PayemntDetailsExpandable from './PayemntDetailsExpandable';

const PaymentPlansTab: React.FC<{ sale: any }> = ({ sale }) => {
  if (!sale.paymentPlans || sale.paymentPlans.length === 0) {
    return (
      <Card>
        <Alert
          message="No Payment Plans"
          description="This sale doesn't have any payment plans yet."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <ProTable
      dataSource={sale.paymentPlans}
      rowKey={(record) => record._id || Math.random().toString()}
      expandable={{
        expandedRowRender: (plan: PaymentPlan) => (
          <PayemntDetailsExpandable plan={plan} />
        ),
      }}
      columns={[
        {
          title: 'Amount',
          dataIndex: 'installmentAmount',
          key: 'installmentAmount',
          render: (installmentAmount) => installmentAmount.toLocaleString(),
        },
        {
          title: 'Total Amount',
          dataIndex: 'totalAmount',
          key: 'totalAmount',
          render: (amount) => amount.toLocaleString(),
        },
        {
          title: 'Deposit',
          dataIndex: 'initialDeposit',
          key: 'deposit',
          render: (amount) => amount.toLocaleString(),
        },
        {
          title: 'Remaining',
          dataIndex: 'outstandingBalance',
          key: 'remaining',
          render: (amount) => amount.toLocaleString(),
        },
        {
          title: 'Start Date',
          dataIndex: 'startDate',
          key: 'startDate',
          render: formatDate,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          filters: [
            { text: 'Active', value: 'active' },
            { text: 'Completed', value: 'completed' },
            { text: 'Pending', value: 'pending' },
          ],
          onFilter: (value, record) => record.status === value,
          render: (status) => (
            <Tag
              color={
                status === 'active'
                  ? 'green'
                  : status === 'completed'
                  ? 'blue'
                  : status === 'pending'
                  ? 'orange'
                  : 'red'
              }
            >
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : 'Unknown'}
            </Tag>
          ),
        },
      ]}
      search={false}
      pagination={{
        pageSize: 5,
        showTotal: (total, range) => (
          <div>{`Showing ${range[0]}-${range[1]} of ${total} total payment plans`}</div>
        ),
      }}
      headerTitle="Payment Plans"
    />
  );
};

export default PaymentPlansTab;
