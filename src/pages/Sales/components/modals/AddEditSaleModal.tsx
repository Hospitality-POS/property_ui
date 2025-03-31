import { fetchAllUsers } from '@/services/auth.api';
import { fetchAllCustomers } from '@/services/customer';
import { fetchAllProperties } from '@/services/property';
import { createNewSale, updateSale } from '@/services/sales';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Col, message, Row, Tabs } from 'antd';
import React, { useRef } from 'react';

interface AddEditSaleModalProps {
  edit?: boolean;
  actionRef?: any;
  data?: any;
}

const { TabPane } = Tabs;

const AddEditSaleModal: React.FC<AddEditSaleModalProps> = ({
  edit,
  actionRef,
  data,
}) => {
  const [form] = ProForm.useForm();

  const formRef = useRef<any>();

  const { run: createSale, loading } = useRequest(createNewSale, {
    manual: true,
    onSuccess: () => {
      message.success('Sale created successfully');

      actionRef.current?.reload();
    },
    onError: (error) => {
      console.error('Sale creation error:', error);
      message.error('Failed to create sale');
    },
  });

  const { run: editSale } = useRequest(updateSale, {
    manual: true,
    onSuccess: () => {
      message.success('Sale updated successfully');
      setOpen(false);
      actionRef.current?.reload();
    },
    onError: (error) => {
      console.error('Sale update error:', error);
      message.error('Failed to update sale');
    },
  });

  // fetchAllProperties
  const { data: propertiesData, loading: isLoadingProperties } = useRequest(
    fetchAllProperties,
    {
      onError: (error) => {
        console.error('Properties fetch error:', error);
        message.error('Failed to load properties');
      },
    },
  );
  // fetchAllCustomers
  const { data: customersData, loading: isLoadingCustomers } = useRequest(
    fetchAllCustomers,
    {
      onError: (error) => {
        console.error('Customers fetch error:', error);
        message.error('Failed to load customers');
      },
    },
  );
  // fetchAllAgents
  const { data: agentsData, loading: isLoadingAgents } = useRequest(
    fetchAllUsers,
    {
      onError: (error) => {
        console.error('Agents fetch error:', error);
        message.error('Failed to load agents');
      },
    },
  );

  const handleFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
      };
      if (edit) {
        await editSale(data._id, formattedValues);
      } else {
        await createSale(formattedValues);
      }

      return true;
    } catch (error) {
      console.error('Submission error:', error);
      return false;
    }
  };

  return (
    <ModalForm
      title={edit ? `Edit Sale` : 'Create New Sale'}
      formRef={formRef}
      form={form}
      onFinish={handleFinish}
      initialValues={
        edit
          ? {
              ...data,
              property: {
                label: data.property?.name,
                value: data.property?._id,
              },
              customer: {
                label: data.customer?.name,
                value: data.customer?._id,
              },
              unit: { label: data.unit?.unitType, value: data.unit?._id },
              agent: {
                label: data.salesAgent?.name,
                value: data.salesAgent?._id,
              },
              propertyManager: {
                label: data.propertyManager?.name,
                value: data.propertyManager?._id,
              },
            }
          : {}
      }
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        centered: true,
        maskClosable: true,
        width: 800,
      }}
      submitter={{
        searchConfig: {
          submitText: edit ? 'Update Sale' : 'Create Sale',
        },
      }}
      trigger={
        edit ? (
          <span className="ml-2">Edit Sale</span>
        ) : (
          <Button type="primary" icon={<PlusOutlined />} loading={loading}>
            Add New Sale
          </Button>
        )
      }
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Basic Information" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="property"
                label="Select Property"
                placeholder="Search for property"
                showSearch
                rules={[
                  { required: true, message: 'Please select a property' },
                ]}
                fieldProps={{
                  showSearch: true,
                  loading: isLoadingProperties,
                  disabled: edit,
                  className: 'w-full',
                }}
                options={propertiesData?.map((property: any) => ({
                  label: `${property.name} - ${property.propertyType}`,
                  value: property._id,
                }))}
              />
            </Col>

            <Col span={12}>
              <ProFormSelect
                name="customer"
                label="Select Customer"
                placeholder="Search for Customer"
                showSearch
                rules={[
                  { required: true, message: 'Please select a customer' },
                ]}
                fieldProps={{
                  showSearch: true,
                  loading: isLoadingCustomers,
                  disabled: edit,
                  className: 'w-full',
                }}
                options={customersData?.map((customer: any) => ({
                  label: `${customer.name}`,
                  value: customer._id,
                }))}
              />
            </Col>
          </Row>

          {/* Unit Selection Row */}
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="unit"
                label="Select Unit"
                placeholder="Select unit"
                showSearch
                rules={[{ required: true, message: 'Please select a unit' }]}
                fieldProps={{
                  showSearch: true,
                  loading: isLoadingProperties,
                  disabled: edit,
                  className: 'w-full',
                }}
                // options={propertiesData?.map((property) => (
                //      const units = property.units ? property.units.filter(unit =>
                //          unit.status !== 'sold' && unit.availableUnits > 0
                //      ) : [];

                //     return {
                //     label: `${unit.unitType || unit.type} - ${unit.plotSize ? `${unit.plotSize} sqm -` : ''} ${Unit.formatCurrency(unit.price)}`,
                //     value: unit._id,
                // }))}
              />
            </Col>
            <Col span={12}>
              <ProFormDigit
                name="quantity"
                label="Quantity"
                min={1}
                initialValue={1}
                fieldProps={{
                  disabled: edit,
                  className: 'w-full',
                }}
                rules={[{ required: true, message: 'Please enter quantity' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <ProFormDigit
                name="salePrice"
                label="Sale Price (KES)"
                fieldProps={{
                  formatter: (value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                  parser: (value) =>
                    Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
                  className: 'w-full',
                  min: 0,
                  // onChange: () => calculateTotalAfterDiscount()
                }}
                rules={[
                  { required: true, message: 'Please enter the sale price' },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormDigit
                name="listPrice"
                label="List Price (KES)"
                fieldProps={{
                  formatter: (value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                  parser: (value) =>
                    Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
                  className: 'w-full',
                  min: 0,
                  disabled: true,
                }}
                rules={[
                  { required: true, message: 'Please enter the list price' },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormDigit
                name="discount"
                label="Discount (KES)"
                fieldProps={{
                  formatter: (value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                  parser: (value) =>
                    Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
                  className: 'w-full',
                  min: 0,
                  // onChange: handleDiscountChange
                }}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <ProFormDatePicker
                name="saleDate"
                label="Sale Date"
                width="100%"
                rules={[
                  { required: true, message: 'Please select the sale date' },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="paymentPlanType"
                label="Payment Plans"
                rules={[
                  { required: true, message: 'Please select a payment plan' },
                ]}
                options={[
                  { label: 'Full Payment', value: 'Full Payment' },
                  { label: 'Installment', value: 'Installment' },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="status"
                label="Sale Status"
                initialValue="reservation"
                options={[
                  { label: 'Reservation', value: 'reservation' },
                  { label: 'Agreement', value: 'agreement' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Cancelled', value: 'cancelled' },
                ]}
                rules={[{ required: true, message: 'Please select a status' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <ProFormSelect
                name="agent"
                label="Select Agent"
                placeholder="Search for Agent"
                showSearch
                rules={[{ required: true, message: 'Please select an agent' }]}
                fieldProps={{
                  showSearch: true,
                  loading: isLoadingAgents,
                  className: 'w-full',
                }}
                options={agentsData?.map((agent: any) => ({
                  label: `${agent.name}`,
                  value: agent._id || agent.id,
                }))}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="propertyManager"
                label="Property Manager"
                placeholder="Select property manager"
                rules={[
                  {
                    required: true,
                    message: 'Please select a property manager',
                  },
                ]}
                fieldProps={{
                  showSearch: true,
                  // loading: isLoadingManagers,
                  className: 'w-full',
                }}
                // options={managersData?.map((manager) => ({
                //     label: `${manager.name}`,
                //     value: manager._id || manager.id,
                // }))}
              />
            </Col>
            <Col span={8}>
              <ProFormDigit
                name="commissionPercentage"
                label="Commission (%)"
                initialValue={5}
                min={0}
                max={100}
                fieldProps={{
                  precision: 2,
                }}
              />
            </Col>
          </Row>

          <ProFormTextArea
            name="notes"
            label="Notes"
            placeholder="Add sales notes..."
            fieldProps={{
              rows: 4,
            }}
          />
        </TabPane>

        <TabPane tab="Payment Details" key="2">
          <ProFormDigit
            name="initialPayment"
            label="Initial Payment Amount (KES)"
            fieldProps={{
              formatter: (value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
              parser: (value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
              className: 'w-full',
              min: 0,
              // disabled: edit && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')
            }}
            rules={[
              {
                required: true,
                message: 'Please enter the initial payment amount',
              },
            ]}
          />

          <Row gutter={16}>
            <Col span={12}>
              <ProFormDatePicker
                name="paymentDate"
                label="Payment Date"
                width="lg"
                // fieldProps={{
                //     disabled: edit && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')
                // }}
                rules={[
                  { required: true, message: 'Please select the payment date' },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="paymentMethod"
                label="Payment Method"
                options={[
                  { label: 'Bank Transfer', value: 'Bank Transfer' },
                  { label: 'M-Pesa', value: 'M-Pesa' },
                  { label: 'Cash', value: 'Cash' },
                  { label: 'Cheque', value: 'cheque' },
                ]}
                // fieldProps={{
                //     disabled: edit && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')
                // }}
                rules={[
                  { required: true, message: 'Please select a payment method' },
                ]}
              />
            </Col>
          </Row>

          <ProFormText
            name="reference"
            label="Reference Number"
            placeholder="Enter reference number"
            // fieldProps={{
            //     disabled: isEditMode && saleToEdit?.payments?.some(p => p.paymentType === 'deposit')
            // }}
          />
        </TabPane>
      </Tabs>
    </ModalForm>
  );
};
export default AddEditSaleModal;
