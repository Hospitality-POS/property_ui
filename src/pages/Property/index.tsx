import { deletePropertyById, fetchAllProperties } from '@/services/property';
import {
  DeleteOutlined,
  DownOutlined,
  EnvironmentOutlined,
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
import PropertyDetails from './components/drawers/PropertyDetails';
import AddEditPropertyModal from './components/modals/AddEditPropertyModal';
import PropertyStats from './components/stats';

const PropertyManager = () => {
  const actionRef = useRef<ActionType>();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const onView = (property: any) => {
    setSelectedProperty(property);
    setDrawerVisible(true);
  };

  const getCurrentPrice = (unit) => {
    if (!unit.phasePricing || unit.phasePricing.length === 0) {
      return 0;
    }
    const currentPhase = unit.phasePricing.find((phase) => phase.active);
    return currentPhase?.price || 0;
  };

  const { run: deleteProperty } = useRequest(deletePropertyById, {
    manual: true,
    onSuccess: () => {
      message.success('Property deleted successfully');
    },
    onError: () => {
      message.error("Couldn't delete property");
    },
  });

  return (
    <>
      <PropertyStats />

      {/* Properties Table Component */}
      <ProTable
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            fieldProps: {
              placeholder: 'Search by name',
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: 'Type',
            dataIndex: 'propertyType',
            key: 'propertyType',
            align: 'center',
            search: false,
            render: (type) => {
              let color = type === 'land' ? 'green' : 'blue';
              return <Tag color={color}>{type}</Tag>;
            },
            filters: [
              { text: 'Land', value: 'land' },
              { text: 'Apartment', value: 'apartment' },
            ],
            onFilter: (value, record) => record.propertyType === value,
          },
          {
            title: 'Location',
            key: 'location',
            search: false,
            render: (_, record) => (
              <span>
                <EnvironmentOutlined /> {record.location?.address || 'N/A'}
              </span>
            ),
          },
          {
            title: 'Units Info',
            key: 'units',
            align: 'center',
            search: false,
            render: (_, record) => {
              const totalUnits = record.units.reduce(
                (total, unit) => total + (unit.totalUnits || 0),
                0,
              );
              const availableUnits = record.units.reduce(
                (total, unit) => total + (unit.availableUnits || 0),
                0,
              );

              return (
                <span>
                  {availableUnits} / {totalUnits} units
                  {record.propertyType === 'land' && (
                    <div>
                      <small>
                        {record.units.map((unit) => unit.plotSize).join(', ')}
                      </small>
                    </div>
                  )}
                </span>
              );
            },
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            search: false,
            render: (status) => {
              let color = 'green';
              if (status === 'reserved') color = 'orange';
              if (status === 'sold') color = 'red';
              if (status === 'under_construction') color = 'blue';
              return <Tag color={color}>{status}</Tag>;
            },
            filters: [
              { text: 'Available', value: 'available' },
              { text: 'Reserved', value: 'reserved' },
              { text: 'Sold', value: 'sold' },
              { text: 'Under Construction', value: 'under_construction' },
            ],
            onFilter: (value, record) => record.status === value,
          },
          {
            title: 'Manager',
            key: 'manager',
            fieldProps: {
              placeholder: 'Search by manager',
            },
            render: (_, record) => record.propertyManager?.name || 'N/A',
            sorter: (a, b) =>
              a.propertyManager.name.localeCompare(b.propertyManager.name),
          },
          {
            title: 'Total (KES)',
            key: 'value',
            align: 'center',
            search: false,
            render: (_, record) => {
              const totalValue =
                record.units?.reduce((total, unit) => {
                  const currentPrice = getCurrentPrice(unit);
                  return total + currentPrice * (unit.totalUnits || 0);
                }, 0) || 0;
              return <span>{totalValue.toLocaleString()}</span>;
            },
          },
          {
            title: 'createdAt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            search: false,
            sorter: (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (text) =>
              text ? new Date(text).toLocaleDateString() : 'N/A',
          },
          {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            search: false,
            render: (_, record) => (
              <Space>
                <Tooltip title="View Details">
                  <Button
                    icon={<FileSearchOutlined />}
                    size="small"
                    onClick={() => onView(record)}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <AddEditPropertyModal
                    actionRef={actionRef}
                    key={`edit-property-${record._id}-${record}`}
                    data={record}
                    edit={true}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Popconfirm
                    title="Are you sure to delete this property?"
                    onConfirm={() => deleteProperty(record._id)}
                    okText="Yes"
                    cancelText="No"
                    key={record._id}
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
          const data = await fetchAllProperties();
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
          showTotal: (total, range) => (
            <div>{`Showing ${range[0]}-${range[1]} of ${total} total properties`}</div>
          ),
        }}
        scroll={{ x: 1000 }}
        headerTitle="Properties"
        toolBarRender={() => [
          <AddEditPropertyModal
            actionRef={actionRef}
            key={'add-edit-property'}
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

      {/* Property Details Drawer */}
      <PropertyDetails
        property={selectedProperty}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </>
  );
};

export default PropertyManager;
