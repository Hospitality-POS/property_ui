import { fetchAllUsers } from '@/services/auth.api';
import { createNewProperty, updateProperty } from '@/services/property';
import { PlusOutlined, HolderOutlined, EditOutlined, DeleteOutlined, TagOutlined, HomeOutlined } from '@ant-design/icons';
import { ModalForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message, Row, Col, Form, Button, Input, Space, Tag, Popconfirm, Table, Tabs, Divider, Switch } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react'

interface AddEditPropertyModalProps {
  edit?: boolean;
  actionRef?: any;
  data?: any;
  quickMode?: boolean;
}

interface Location {
  county: string;
  constituency: string;
  address: string;
}

interface PropertyManager {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface PhasePricing {
  phaseName: string;
  price: number;
  active: boolean;
  _id: string;
  startDate: string;
}

interface Unit {
  _id: string;
  unitType: string;
  basePrice: number;
  phasePricing: PhasePricing[];
  status: string;
  totalUnits: number;
  availableUnits: number;
}

interface Phase {
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  _id: string;
}

// interface PropertyData {
//   _id: string;
//   name: string;
//   location: Location;
//   status: string;
//   propertyType: 'apartment' | 'land';
//   propertyManager: PropertyManager;
//   phases: Phase[];
//   currentPhase: string;
//   units: Unit[];
// }

const { TabPane } = Tabs;

const AddEditPropertyModal: React.FC<AddEditPropertyModalProps> = ({ edit, actionRef, data, quickMode }) => {


  const { data: propertyManagers } = useRequest(fetchAllUsers, {
    onSuccess: (data) => {
      return data.filter((user) => user.role === 'property_manager');
    }
  });



  // Add these state variables inside the component
  const [phases, setPhases] = useState<Phase[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [unitsValidationError, setUnitsValidationError] = useState<boolean>(false);
  const [editingPricingPhaseKey, setEditingPricingPhaseKey] = useState<string | null>(null);
  const [editingPricingPhaseName, setEditingPricingPhaseName] = useState<string>('');
  const [propertyType, setPropertyType] = useState<'land' | 'apartment'>(
    edit && data ? data.propertyType : 'apartment'
  );

  // Add useEffect to initialize state from props
  useEffect(() => {
    if (edit && data) {
      setPhases(data.phases.map(phase => ({
        ...phase,
        key: phase._id,
        startDate: moment(phase.startDate),
        endDate: moment(phase.endDate)
      })));

      setUnits(data.units.map(unit => ({
        ...unit,
        key: unit._id,
        phasePricing: unit.phasePricing.map(pricing => ({
          ...pricing,
          key: pricing._id
        }))
      })));

      setCurrentPhase(data.currentPhase);
    }
  }, [edit, data]);

  // Render unit form
  const renderUnitForm = () => (
    <div className="mb-4 p-4 border border-gray-300 rounded">
      <h4 className="mb-2">{data?.propertyType === 'land' ? 'Add Land Plot' : 'Add Apartment Unit'}</h4>

      <Row gutter={16}>
        {data?.propertyType === 'land' ? (
          <Col span={12}>
            <ProFormSelect
              name="plotSize"
              label="Plot Size"
              rules={[{ required: true, message: 'Please select plot size' }]}
              options={[
                { label: '50/100', value: '50/100' },
                { label: '80/100', value: '80/100' },
                { label: '100/100 (Full)', value: '100/100' },
                { label: '40/100', value: '40/100' },
                { label: '60/100', value: '60/100' },
                { label: '20/100', value: '20/100' },
                { label: '25/100', value: '25/100' },
                { label: '75/100', value: '75/100' },
              ]}
            />
          </Col>
        ) : (
          <Col span={12}>
            <ProFormSelect
              name="unit"
              label="Unit Type"
              rules={[{ required: true, message: 'Please select unit type' }]}
              options={[
                { label: 'Studio', value: 'studio' },
                { label: 'One Bedroom', value: 'one_bedroom' },
                { label: 'Two Bedroom', value: 'two_bedroom' },
                { label: 'Three Bedroom', value: 'three_bedroom' },
                { label: 'Shops', value: 'shops' },
                { label: 'Penthouse', value: 'penthouse' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </Col>
        )}
        <Col span={12}>
          <ProFormDigit
            name="totalUnits"
            label="Total Units"
            min={1}
            initialValue={1}
          />
        </Col>
        <Button
          type="primary"
          icon={<PlusOutlined />}
        >
          Add {data?.propertyType === 'apartment' ? "apartment unit" : "land plot"}
        </Button>
      </Row>
    </div>
  );

  // Render phase form
  const renderPhaseForm = () => (
    <div className="mb-4 p-4 border border-gray-300 rounded">
      <h4 className="mb-2">Add New Phase</h4>
      <Row gutter={16}>
        <Col span={8}>
          <ProFormText
            name="phaseName"
            label="Phase Name"
            rules={[{ required: true, message: 'Please enter phase name' }]}
            placeholder={'e.g., Early Bird, Phase 1'}
          />
        </Col>
        <Col span={7}>
          <ProFormDatePicker
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select start date' }]}
            fieldProps={{
              format: 'YYYY-MM-DD',
            }}
            placeholder={'e.g., 2022-01-01'}
          />
        </Col>
        <Col span={6}>
          <ProFormDatePicker
            name="phaseEndDate"
            label="End Date"
            rules={[{ required: true, message: 'Please select end date' }]}
            fieldProps={{
              format: 'YYYY-MM-DD',
            }}
            placeholder={'e.g., 2022-12-31'}
          />
        </Col>
        <Col span={3} className="flex justify-center items-center mt-1">

          <Button
            type="primary"
            icon={<PlusOutlined />}
          >
            Add
          </Button>

        </Col>
      </Row>
      <Switch
        // checked={phaseActive}
        // onChange={setPhaseActive}
        checkedChildren="Set as Active Phase"
        unCheckedChildren="Set as Active Phase"
        style={{ marginTop: 16 }}
      />
    </div>
  );

  // Render phase list with drag-and-drop rows
  const renderPhaseList = () => {
    if (!phases.length) {
      return (
        <div className="text-center p-2 text-gray-500 italic">
          No phases added yet. Add a phase using the form above.
        </div>
      );
    }

    // Sort phases by order property
    const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

    const columns = [
      {
        title: '',
        dataIndex: 'sort',
        width: 30,
        className: 'drag-visible',
        render: () => <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />,
      },
      {
        title: 'Phase Name',
        dataIndex: 'name',
        key: 'name',
        // render: (text, record) => {
        //   if (editingPhaseKey === record.key) {
        //     return (
        //       <Input
        //         value={editingPhaseName}
        //         onChange={(e) => setEditingPhaseName(e.target.value)}
        //         style={{ width: '100%' }}
        //       />
        //     );
        //   }
        //   return (
        //     <Space>
        //       {text}
        //       {record.active && <Tag color="green">Active</Tag>}
        //       {record.name === currentPhase && <Tag color="blue">Current</Tag>}
        //     </Space>
        //   );
        // }
      },
      {
        title: 'Start Date',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (date) => {
          return date ? date.format('YYYY-MM-DD') : 'Not set';
        }
      },
      {
        title: 'End Date',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (date) => {
          return date ? date.format('YYYY-MM-DD') : 'Not set';
        }
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => {
          // if (editingPhaseKey === record.key) {
          //   return (
          //     <Space>
          //       <Button
          //         type="primary"
          //         size="small"
          //         icon={<SaveOutlined />}
          //         onClick={() => savePhaseEdits(record.key)}
          //       >
          //         Save
          //       </Button>
          //       <Button
          //         size="small"
          //         icon={<CloseOutlined />}
          //         onClick={cancelEditingPhase}
          //       >
          //         Cancel
          //       </Button>
          //     </Space>
          //   );
          // }

          return (
            <Space>
              <Button
                size="small"
                onClick={() => setActivePhase(record.key)}
                disabled={record.name === currentPhase}
              >
                Set Active
              </Button>
              <Button
                size="small"
                type="default"
                icon={<EditOutlined />}
                onClick={() => startEditingPhase(record.key)}
              />
              <Popconfirm
                title="Are you sure you want to delete this phase?"
                onConfirm={() => deletePhase(record.key)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Space>
          );
        }
      }
    ];

    return (
      <div style={{ marginBottom: 16 }}>
        <p style={{ marginBottom: 8 }}>
          <HolderOutlined /> Drag rows to reorder phases
        </p>
        <ProTable
          columns={columns}
          dataSource={sortedPhases}
          pagination={false}
          rowKey="key"
          size="small"
          options={false}
          search={false}
          // Custom row to enable drag-and-drop support:
          rowClassName={() => 'cursor-move'}
          // Implement your onRow function to handle drag events as needed
          onRow={(record, index) => ({
            draggable: true,
            onDragStart: (e) => e.dataTransfer.setData('text/plain', index),
            onDragOver: (e) => e.preventDefault(),
            onDrop: (e) => {
              e.preventDefault();
              const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
              if (dragIndex !== index) {
                const newData = [...sortedPhases];
                const item = newData.splice(dragIndex, 1)[0];
                newData.splice(index, 0, item);
                handlePhaseRowReorder(newData);
              }
            },
          })}
        />
      </div>
    );
  };

  // Render unit pricing table
  const renderUnitPricingTable = () => {
    if (units.length === 0 || phases.length === 0) {
      return null;
    }

    // Sort phases by order property
    const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

    // Create columns: first column for unit name, then one column per phase
    const columns = [
      {
        title: propertyType === 'land' ? 'Plot Type' : 'Unit Type',
        dataIndex: 'unitType',
        key: 'unitType',
        // render: (_, record) => getUnitDisplayName(record),
        width: 150,
        fixed: 'left'
      }
    ];

    // Add a column for each phase
    sortedPhases.forEach((phase, index) => {
      columns.push({
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HolderOutlined style={{ cursor: 'grab', color: '#999', marginRight: 8 }} />
            {editingPricingPhaseKey === phase.key ? (
              <Input
                value={editingPricingPhaseName}
                onChange={(e) => setEditingPricingPhaseName(e.target.value)}
                onPressEnter={() => savePricingPhaseEdits(phase.key)}
                onBlur={() => savePricingPhaseEdits(phase.key)}
                style={{ width: '80%' }}
              />
            ) : (
              <div onClick={() => startEditingPricingPhase(phase.key, phase.name)} style={{ cursor: 'pointer' }}>
                {phase.name}
                {phase.name === currentPhase && <Tag color="blue" style={{ marginLeft: 5 }}>Current</Tag>}
              </div>
            )}
          </div>
        ),
        key: phase.name,
        dataIndex: phase.name,
        render: (_, record) => {
          // const price = getUnitPhasePrice(record, phase.name);

          return (
            <ProFormDigit
              name={'price'}

              min={0}
              placeholder="Enter price"
              rules={[{ required: true, message: 'Please enter a price' }]}
              fieldProps={{
                parser: (value) => Number(value.replace(/\$\s?|(,*)/g, '')),
                style: { width: '100%' }
              }}
              onChange={(value) => {
                const newUnits = [...units];
                const unitIndex = newUnits.findIndex((unit) => unit.key === record.key);
                if (unitIndex !== -1) {
                  const unit = newUnits[unitIndex];
                  const phaseIndex = unit.phasePricing.findIndex((pricing) => pricing.phaseName === phase.name);
                  if (phaseIndex !== -1) {
                    const phasePricing = unit.phasePricing[phaseIndex];
                    phasePricing.price = value;
                    newUnits[unitIndex].phasePricing[phaseIndex] = phasePricing;
                    setUnits(newUnits);
                  }
                }
              }}
              addonAfter="KES"
            />
          );
        },
        width: 180,
        onHeaderCell: () => ({
          draggable: true,
          onDragStart: (e) => {
            e.dataTransfer.setData('text/plain', index);
          },
          onDragOver: (e) => {
            e.preventDefault();
          },
          onDrop: (e) => {
            e.preventDefault();
            const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
            if (dragIndex !== index) {
              const newOrder = [...Array(sortedPhases.length).keys()];
              const item = newOrder.splice(dragIndex, 1)[0];
              newOrder.splice(index, 0, item);
              handlePhaseColumnReorder(newOrder);
            }
          }
        })
      });
    });

    return (
      <>
        <h4>Unit Prices by Phase</h4>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontStyle: 'italic' }}>
            <HolderOutlined /> Drag to reorder phases. Click on phase name to edit.
          </span>
        </div>
        <Table
          columns={columns}
          dataSource={units}
          pagination={false}
          size="small"
          rowKey={record => record.key}
          scroll={{ x: 'max-content' }}
          components={{
            header: {
              cell: ({ className, style, ...restProps }) => (
                <th
                  {...restProps}
                  className={`${className} ${restProps.draggable ? 'draggable-header' : ''}`}
                  style={{ ...style, cursor: restProps.draggable ? 'move' : 'default' }}
                />
              )
            }
          }}
        />
      </>
    );
  };

  // Render unit list
  const renderUnitList = () => {
    if (units.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '10px', color: '#999', fontStyle: 'italic' }}>
          No units added yet. Add a unit using the form above.
        </div>
      );
    }

    const columns = [
      {
        title: propertyType === 'land' ? 'Plot Type' : 'Unit Type',
        dataIndex: 'unitType',
        key: 'unitType',
        // render: (_, record) => getUnitDisplayName(record)
      },
      {
        title: propertyType === 'land' ? 'Total Plots' : 'Total Units',
        dataIndex: 'totalUnits',
        key: 'totalUnits'
      },
      {
        title: propertyType === 'land' ? 'Available Plots' : 'Available Units',
        dataIndex: 'availableUnits',
        key: 'availableUnits'
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Popconfirm
            title="Are you sure you want to delete this unit?"
            onConfirm={() => removeUnit(record.key)}
            okText="Yes"
            cancelText="No"
            disabled={record._id && edit && (record.totalUnits !== record.availableUnits)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record._id && edit && (record.totalUnits !== record.availableUnits)}
            />
          </Popconfirm>
        )
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={units}
        pagination={false}
        size="small"
        rowKey={record => record.key || record._id}
      />
    );
  };

  // Add this handler for unit validation
  // const validateUnits = () => {
  //   if (units.length === 0) {
  //     setUnitsValidationError(true);
  //     return false;
  //   }
  //   setUnitsValidationError(false);
  //   return true;
  // };

  // Add this handler for phase pricing editing
  const startEditingPricingPhase = (key: string, name: string) => {
    setEditingPricingPhaseKey(key);
    setEditingPricingPhaseName(name);
  };

  const savePricingPhaseEdits = () => {
    // Add your save logic here
    setEditingPricingPhaseKey(null);
    setEditingPricingPhaseName('');
  };

  return (
    <ModalForm
      title={edit ? "Edit Property" : "Add New Property"}
      initialValues={
        edit && data ? {
          name: data.name,
          propertyType: data.propertyType,
          status: data.status,
          address: data.location.address,
          county: data.location.county,
          constituency: data.location.constituency,
          propertyManager: {
            label: data.propertyManager.name,
            value: data.propertyManager._id
          },
          units: data.units.map(unit => ({
            ...unit,
            key: unit._id,
            phasePricing: unit.phasePricing.map(pricing => ({
              ...pricing,
              key: pricing._id
            }))
          })),
          phases: data.phases.map(phase => ({
            ...phase,
            key: phase._id,
            startDate: moment(phase.startDate),
            endDate: moment(phase.endDate)
          }))
        } : undefined
      }
      onFinish={async (values) => {
        const formData = {
          name: values.name,
          propertyType: values.propertyType,
          status: values.status,
          location: {
            address: values.address,
            county: values.county,
            constituency: values.constituency
          },
          propertyManager: values.propertyManager.value,
          phases: phases.map(phase => ({
            name: phase.name,
            startDate: phase.startDate.toISOString(),
            endDate: phase.endDate.toISOString(),
            active: phase.active
          })),
          currentPhase,
          units: units
        };

        try {
          if (edit) {
            // Call your update API
            await updateProperty(data._id, formData);
            message.success('Property updated successfully');
          } else {
            // Call your create API
            await createNewProperty(formData);
            message.success('Property created successfully');
          }
          actionRef?.current?.reload();
          return true;
        } catch (error) {
          message.error('An error occurred');
          return false;
        }
      }}
      modalProps={{
        destroyOnClose: true,
        centered: true,
      }}
      autoFocusFirstInput
      width={800}
      submitter={{
        searchConfig: {
          submitText: edit ? "Update Property" : "Create Property",
        },
      }}
      trigger={
        edit ? (
          <Button icon={<EditOutlined />} size="small">

          </Button>
        ) : quickMode ? <span className='flex gap-2'>
          <HomeOutlined />New Property
        </span> : (
          <Button type="primary" icon={<PlusOutlined />}>
            Add New Property
          </Button>
        )
      }
    >
      <Tabs defaultActiveKey="1">
        {/* Basic Information */}
        <TabPane tab="Basic Information" key="1">
          <Row gutter={16}>
            <Col span={16}>
              <ProFormText
                label="Property Name"
                name="name"
                rules={[{ required: true, message: 'Please enter property name' }]}
                fieldProps={{
                  placeholder: 'Enter property name',
                  disabled: edit,
                  className: 'w-full'
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="propertyType"
                label="Property Type"
                rules={[{ required: true, message: 'Please select property type' }]}
                options={[
                  { label: 'Apartment', value: 'apartment' },
                  { label: 'Land', value: 'land' },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="status"
                label="Property Status"
                initialValue="reserved"
                options={[
                  { label: 'Available', value: 'available' },
                  { label: 'Sold', value: 'sold' },
                  { label: 'Reserved', value: 'reserved' },
                  { label: 'Under Construction', value: 'under_construction' },
                ]}
                rules={[{ required: true, message: 'Please select a status' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <ProFormText
                name="address"
                label="Address"
                placeholder="Street address or area"
                rules={[{ required: true, message: 'Please enter the address' }]}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="county"
                label="County"
                placeholder="County name"
                rules={[{ required: true, message: 'Please enter the county' }]}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="constituency"
                label="Constituency"
                placeholder="Constituency name"
                rules={[{ required: true, message: 'Please enter the Constituency' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <ProFormSelect
                name="propertyManager"
                label="Property Manager"
                placeholder="Select or add a new property manager"
                rules={[{ required: true, message: 'Please select a property manager' }]}
                options={propertyManagers?.map((manager: any) => ({
                  label: manager.name,
                  value: manager._id,
                }))}
                fieldProps={{
                  allowClear: true,
                }}
              />
            </Col>
          </Row>
        </TabPane>
























        {/* Units & Pricing */}
        <TabPane tab="Units & Pricing" key="2">
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
            prevValues.propertyType !== currentValues.propertyType
          }>
            {({ getFieldValue }) => {
              const propertyType = getFieldValue('propertyType');

              return (
                <>
                  {/* Hidden form fields */}
                  <ProFormText name="units" hidden><Input /></ProFormText>
                  <ProFormText name="phases" hidden><Input /></ProFormText>
                  <ProFormText name="currentPhase" hidden><Input /></ProFormText>

                  {/* Phase Management Section */}
                  <div>
                    <Divider orientation="left">
                      <Space>
                        <TagOutlined />
                        Pricing Phases
                        {currentPhase && (
                          <Tag color="blue">Current Phase: {currentPhase}</Tag>
                        )}
                      </Space>
                    </Divider>

                    {renderPhaseForm()}
                    {renderPhaseList()}
                  </div>

                  {/* Unit Management Section */}
                  <div>
                    <Divider orientation="left">
                      {propertyType === 'land' ? 'Land Plots' : 'Property Units'}
                    </Divider>

                    {renderUnitForm()}

                    {/* Units validation error message */}
                    {unitsValidationError && (
                      <div style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                        Please add at least one {propertyType === 'land' ? 'plot' : 'unit'} to the property
                      </div>
                    )}

                    {renderUnitList()}
                  </div>

                  {/* Unit Pricing Matrix Section */}
                  {phases.length > 0 && units.length > 0 && (
                    <div>
                      <Divider orientation="left">Phase Pricing</Divider>
                      {renderUnitPricingTable()}
                    </div>
                  )}
                </>
              );
            }}
          </Form.Item>
        </TabPane>
      </Tabs>
    </ModalForm >
  );
};
export default AddEditPropertyModal