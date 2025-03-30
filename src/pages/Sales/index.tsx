import { deleteSale, fetchAllSales } from '@/services/sales';
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  MoreOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Dropdown, message, Modal, Tag } from 'antd';
import { useRef, useState } from 'react';
import SalesDetails from './components/drawers/SalesDetails';
import AddEditSaleModal from './components/modals/AddEditSaleModal';
import SalesStats from './components/stats/SalesStats';

const SalesManagement = () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const actionRef = useRef<ActionType>();

  const onView = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const { run: DeleteSale } = useRequest(deleteSale, {
    manual: true,
    onSuccess: () => {
      actionRef.current?.reload();
      message.success('Sale deleted successfully');
    },
  });

  const onDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this sale?',
      onOk: () => DeleteSale(record._id),
      okText: 'Yes',
      width: 500,
      cancelText: 'No',
      centered: true,

      content: (
        <p>
          This action will delete the sale for property{' '}
          <strong>
            {record.property?.title ||
              record.property?.name ||
              'Unknown Property'}
          </strong>
          .
        </p>
      ),
    });
  };

  const actionColumn = {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    search: false,
    render: (_: any, record: { status: string; _id: string }) => (
      <Dropdown
        menu={{
          items: [
            {
              key: '1',
              icon: <FileTextOutlined />,
              label: 'View Details',
              onClick: () => onView(record),
            },
            {
              key: '2',
              icon: <EditOutlined />,
              label: (
                <AddEditSaleModal
                  actionRef={actionRef}
                  key={`edit-sale-${record._id}-${JSON.stringify(record)}`}
                  edit
                  data={record}
                />
              ),
            },
            {
              key: '3',
              icon: <DeleteOutlined />,
              label: 'Delete Sale',
              danger: true,
              onClick: () => onDelete(record),
            },
          ],
        }}
        trigger={['hover']}
      >
        <Button icon={<MoreOutlined />} size="small" type="text" />
      </Dropdown>
    ),
  };

  const getStatusDisplay = (status) => {
    if (!status) return { text: 'Unknown', color: 'default' };

    const statusMap = {
      reservation: { text: 'Reserved', color: 'orange' },
      agreement: { text: 'Agreement', color: 'blue' },
      processing: { text: 'Processing', color: 'cyan' },
      completed: { text: 'Completed', color: 'green' },
      cancelled: { text: 'Cancelled', color: 'red' },
    };

    const statusInfo = statusMap[status.toLowerCase()] || {
      text: status,
      color: 'default',
    };
    return {
      text: statusInfo.text,
      color: statusInfo.color,
    };
  };

  return (
    <>
      {/* sales stats */}
      <SalesStats />

      {/* sales table */}
      <ProTable
        columns={[
          {
            title: 'Property',
            dataIndex: ['property', 'name'],
            key: 'property',
            fieldProps: {
              placeholder: 'Search by property name',
            },
            sorter: (a, b) => a.property?.name.localeCompare(b.property?.name),
          },
          {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            align: 'center',
            fieldProps: {
              placeholder: 'Search by customer name',
            },
            render: (name) => name || 'Unknown Customer',
            sorter: (a, b) => {
              const nameA = a.customer?.name || '';
              const nameB = b.customer?.name || '';
              return nameA.localeCompare(nameB);
            },
          },
          {
            title: 'Unit Type',
            dataIndex: 'unit',
            key: 'unitType',
            align: 'center',
            search: false,
            render: (unit: any, record: any) => {
              if (!unit) return <Tag>Unknown</Tag>;
              return (
                <Tag
                  color={
                    unit?.unitType.toLowerCase().includes('plot')
                      ? 'green'
                      : 'blue'
                  }
                >
                  {unit?.unitType} x {record?.quantity}
                </Tag>
              );
            },
            filters: [
              { text: 'one_bedroom', value: 'one_bedroom' },
              { text: 'two_bedroom', value: 'two_bedroom' },
              { text: 'Apartment', value: 'apartment' },
              { text: 'Plot', value: 'plot' },
              { text: 'House', value: 'house' },
              { text: 'Commercial', value: 'commercial' },
            ],
            onFilter: (value, record: any) =>
              record.unit?.unitType
                ?.toLowerCase()
                .includes(value?.toLowerCase()),
          },
          {
            title: 'Unit Price',
            dataIndex: 'unit',
            key: 'unitPrice',
            align: 'center',
            search: false,
            render: (unit) => unit?.price?.toLocaleString() || 'N/A',
            sorter: (a, b) => {
              const priceA = parseFloat(a.unit?.price) || 0;
              const priceB = parseFloat(b.unit?.price) || 0;
              return priceA - priceB;
            },
          },
          {
            title: 'Sale Price',
            dataIndex: 'salePrice',
            key: 'salePrice',
            align: 'center',
            search: false,
            render: (price) => price?.toLocaleString() || 'N/A',
            sorter: (a, b) => {
              const priceA = parseFloat(a.salePrice) || 0;
              const priceB = parseFloat(b.salePrice) || 0;
              return priceA - priceB;
            },
          },
          {
            title: 'Agent',
            dataIndex: ['salesAgent', 'name'],
            key: 'agent',
            align: 'center',
            fieldProps: {
              placeholder: 'Search by agent name',
            },
            render: (name) => <span>{name ? name : 'Unassigned'}</span>,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            search: false,
            render: (status) => {
              const statusInfo = getStatusDisplay(status);
              return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
            filters: [
              { text: 'Reserved', value: 'reservation' },
              { text: 'Agreement', value: 'agreement' },
              { text: 'Processing', value: 'processing' },
              { text: 'Completed', value: 'completed' },
              { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
          },
          // {
          //     title: 'Payment Plan',
          //     dataIndex: 'paymentPlanType',
          //     key: 'paymentPlanType',
          //     align: 'center',
          //     search: false,
          //     render: (type) => type || 'Full Payment',
          //     filters: [
          //         { text: 'Full Payment', value: 'Full Payment' },
          //         { text: 'Installment', value: 'Installment' },
          //     ],
          //     onFilter: (value, record) => record.paymentPlanType === value,
          // },
          // {
          //     title: 'Reservation Fee',
          //     dataIndex: 'reservationFee',
          //     key: 'reservationFee',
          //     align: 'center',
          //     search: false,
          //     render: (fee) => formatCurrency(fee),
          // },
          {
            title: 'Sale Date',
            dataIndex: 'saleDate',
            key: 'saleDate',
            align: 'center',
            search: false,
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => {
              const dateA = a.saleDate ? new Date(a.saleDate) : new Date(0);
              const dateB = b.saleDate ? new Date(b.saleDate) : new Date(0);
              return dateA - dateB;
            },
          },
          {
            title: 'Commission',
            dataIndex: ['commission', 'amount'],
            key: 'commission',
            align: 'center',
            search: false,
            render: (amount) => amount?.toLocaleString() || 'N/A',
            sorter: (a, b) => {
              const amountA = parseFloat(a.commission?.amount) || 0;
              const amountB = parseFloat(b.commission?.amount) || 0;
              return amountA - amountB;
            },
          },
          actionColumn,
        ]}
        rowKey="_id"
        request={async () => {
          // const { current, pageSize } = params;
          const data = await fetchAllSales();
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
            <div>{`Showing ${range[0]}-${range[1]} of ${total} total sales`}</div>
          ),
        }}
        scroll={{ x: 1000 }}
        headerTitle="Sales"
        toolBarRender={() => [
          <AddEditSaleModal actionRef={actionRef} key={'add-edit-sale'} />,
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

      <SalesDetails
        visible={drawerVisible}
        data={selectedRecord}
        onClose={() => setDrawerVisible(false)}
      />
    </>
  );
};

export default SalesManagement;
