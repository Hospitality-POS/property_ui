import { fetchAllUsers } from '@/services/auth.api';
import { fetchAllCustomers } from '@/services/customer';
import { fetchAllProperties } from '@/services/property';
import { createNewValuation, updateValuation } from '@/services/valuation';
import {
  EditOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, message, Tabs } from 'antd';
import React from 'react';

interface AddEditValuationModalProps {
  actionRef?: any;
  edit?: boolean;
  data?: any;
  editText?: string;
  quickMode?: boolean;
}

const AddEditValuationModal: React.FC<AddEditValuationModalProps> = ({
  actionRef,
  edit,
  data,
  quickMode,
}) => {
  const [form] = ProForm.useForm();

  // Fetch data requests
  const { data: propertiesData, loading: isLoadingProperties } = useRequest(
    fetchAllProperties,
    {
      onError: (error) => {
        console.error('Properties fetch error:', error);
        message.error('Failed to load properties');
      },
    },
  );

  const { data: customersData, loading: isLoadingCustomers } = useRequest(
    fetchAllCustomers,
    {
      onError: (error) => {
        console.error('Customers fetch error:', error);
        message.error('Failed to load customers');
      },
    },
  );

  const { data: valuersData, loading: isLoadingUsers } = useRequest(
    fetchAllUsers,
    {
      onError: (error) => {
        console.error('Users fetch error:', error);
        message.error('Failed to load valuers');
      },
      onSuccess: (response) => {
        console.log('All users:', response);
        // Filter users to only valuers
        const valuers = response?.filter((user: any) => user.role === 'Valuer');
        return valuers;
      },
    },
  );

  const { run: createValuation, loading } = useRequest(createNewValuation, {
    manual: true,
    onSuccess: () => {
      message.success('Valuation created successfully');
      actionRef.current?.reload();
    },
    onError: (error) => {
      console.error('Valuation creation error:', error);
      message.error('Failed to create valuation');
    },
  });

  const { run: editValuation } = useRequest(updateValuation, {
    manual: true,
    onSuccess: () => {
      message.success('Valuation updated successfully');
      actionRef.current?.reload();
    },
    onError: (error) => {
      console.error('Valuation update error:', error);
      message.error('Failed to update valuation');
    },
  });

  const handleFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        status: 'Pending Inspection',
        // Additional formatting as needed
      };
      if (edit) {
        await editValuation(data._id, formattedValues);
      } else {
        await createValuation(formattedValues);
      }
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      return false;
    }
  };

  return (
    <ModalForm
      title={edit ? 'Edit Valuation' : 'Add New Valuation'}
      form={form}
      onFinish={handleFinish}
      initialValues={
        edit
          ? {
              ...data,
              status: 'Pending Inspection',
              valuer: { label: data.valuer.name, value: data.valuer._id },
              property: { label: data.property.name, value: data.property._id },
              requestedBy: {
                label: data.requestedBy.name,
                value: data.requestedBy._id,
              },
              //   certificateDocument: data.certificateDocument?.[0],
              //   reportDocument: data.reportDocument?.[0],
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
          submitText: edit ? 'Update Valuation' : 'Create Valuation',
        },
      }}
      trigger={
        edit ? (
          <Button
            icon={<EditOutlined />}
            size="small"
            key="edit-valuation"
            className="mr-2 cursor-pointer"
          />
        ) : quickMode ? (
          <span className="flex gap-2">
            <PaperClipOutlined />
            New Valuation
          </span>
        ) : (
          <Button type="primary" icon={<PlusOutlined />} loading={loading}>
            Add New Valuation
          </Button>
        )
      }
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Basic Information" key="1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProFormSelect
              name="property"
              label="Select Property"
              placeholder="Search for property"
              rules={[{ required: true, message: 'Please select a property' }]}
              fieldProps={{
                showSearch: true,
                loading: isLoadingProperties,
                disabled: edit,
                className: 'w-full',
              }}
              options={propertiesData?.map((property) => ({
                label: `${property.name} - ${property.propertyType}`,
                value: property._id || property.id,
              }))}
            />

            <ProFormSelect
              name="requestedBy"
              label="Select Customer"
              placeholder="Search for Customer"
              rules={[{ required: true, message: 'Please select a customer' }]}
              fieldProps={{
                showSearch: true,
                loading: isLoadingCustomers,
                disabled: edit,
                className: 'w-full',
              }}
              options={customersData?.map((customer) => ({
                label: `${customer.name}`,
                value: customer._id || customer.id,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProFormSelect
              name="valuationPurpose"
              label="Valuation Purpose"
              placeholder="Select purpose"
              rules={[{ required: true, message: 'Please select a purpose' }]}
              fieldProps={{
                className: 'w-full',
              }}
              options={[
                { label: 'Sale', value: 'sale' },
                { label: 'Purchase', value: 'purchase' },
                { label: 'Mortgage', value: 'mortgage' },
                { label: 'Insurance', value: 'insurance' },
                { label: 'Other', value: 'other' },
              ]}
            />

            <ProFormSelect
              name="valuer"
              label="Select Valuer"
              placeholder="Select valuer"
              rules={[{ required: true, message: 'Please select a valuer' }]}
              fieldProps={{
                showSearch: true,
                loading: isLoadingUsers,
                className: 'w-full',
              }}
              options={valuersData?.map((valuer) => ({
                label: `${valuer.name}`,
                value: valuer._id,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProFormDatePicker
              name="valuationDate"
              label="Valuation Date"
              rules={[{ required: true, message: 'Please select a date' }]}
              fieldProps={{
                className: 'w-full',
              }}
            />

            <ProFormText
              name="marketValue"
              label="Market Value (KES)"
              rules={[{ required: true, message: 'Please enter market value' }]}
              fieldProps={{
                type: 'number',
                className: 'w-full',
              }}
            />

            <ProFormText
              name="valuationFee"
              label="Valuation Fee (KES)"
              rules={[
                { required: true, message: 'Please enter valuation fee' },
              ]}
              fieldProps={{
                type: 'number',
                className: 'w-full',
              }}
            />
          </div>

          <ProFormTextArea
            name="notes"
            label="Special Instructions"
            placeholder="Any special requirements or instructions..."
            fieldProps={{
              rows: 4,
              className: 'w-full',
            }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Methodology" key="3">
          <div className="flex flex-col gap-4">
            <ProFormCheckbox.Group
              name="methodology"
              label="Valuation Methodology"
              width="lg"
              options={[
                'Market Approach',
                'Income Approach',
                'Cost Approach',
                'Residual Method',
              ]}
            />
          </div>

          <ProFormTextArea
            name="methodologyNotes"
            label="Additional Notes on Methodology"
            placeholder="Any specific requirements for the valuation approach..."
            fieldProps={{
              rows: 4,
              className: 'w-full',
            }}
          />

          {edit && (
            <ProFormText
              name="forcedSaleValue"
              label="Forced Sale Value (KES)"
              fieldProps={{
                type: 'number',
                className: 'w-full',
              }}
              placeholder="Enter forced sale value (optional)"
            />
          )}
        </Tabs.TabPane>

        {edit && (
          <Tabs.TabPane tab="Report Documents" key="4">
            {/* figure out how to handle files in mongodb .....rem to update the name of the fields*/}
            <ProFormUploadDragger
              name="reportDocumento"
              label="Upload Valuation Report"
              icon={<FileTextOutlined />}
              title="Click or drag valuation report to upload"
              description="Supports single file upload"
              max={1}
            />

            <ProFormUploadDragger
              name="certificateDocumento"
              label="Upload Valuation Certificate"
              icon={<FileDoneOutlined />}
              title="Click or drag valuation certificate to upload"
              description="Supports single file upload"
              max={1}
            />
          </Tabs.TabPane>
        )}
      </Tabs>
    </ModalForm>
  );
};

export default AddEditValuationModal;
