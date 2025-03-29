import { createNewCustomer, updateCustomer } from '@/services/customer';
import { fetchAllLeads } from '@/services/lead';
import {
  BuildOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Col, Divider, message, Row, Tabs } from 'antd';
import React, { useState } from 'react';

interface AddEditCustomerModalProps {
  edit?: boolean;
  data?: any;
  actionRef?: any;
}

const AddEditCustomerModal: React.FC<AddEditCustomerModalProps> = ({
  edit,
  data,
  actionRef,
}) => {
  const [mode, setMode] = useState('create');

  const [form] = ProForm.useForm();

  const { run: createCustomer, loading } = useRequest(createNewCustomer, {
    manual: true,
    onSuccess: () => {
      message.success('Customer created successfully');

      actionRef.current?.reload();
    },
    onError: (error) => {
      console.error('Customer creation error:', error);
      message.error('Failed to create customer');
    },
  });

  const { run: editCustomer } = useRequest(updateCustomer, {
    manual: true,
    onSuccess: () => {
      message.success('Customer updated successfully');

      actionRef.current?.reload();
    },
    onError: (error) => {
      console.error('Customer update error:', error);
      message.error('Failed to update customer');
    },
  });

  // fetch all leads
  const { data: leadsData, loading: isLoadingLeads } = useRequest(
    fetchAllLeads,
    {
      onError: (error) => {
        console.error('Leads fetch error:', error);
        message.error('Failed to load leads');
      },
    },
  );

  const handleFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
      };
      if (edit) {
        await editCustomer(data._id, formattedValues);
      } else {
        await createCustomer(formattedValues);
      }

      return true;
    } catch (error) {
      console.error('Submission error:', error);
      return false;
    }
  };

  // Generate modal title based on mode
  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Add New Customer';
      case 'convert':
        return 'Convert Lead to Customer';
      default:
        return 'Edit Customer';
    }
  };

  // Generate form submission button text based on mode
  const getSubmitText = () => {
    switch (mode) {
      case 'create':
        return 'Create Customer';
      case 'convert':
        return 'Convert Lead';
      default:
        return 'Save Changes';
    }
  };

  // Add this function to handle customer source changes
  const handleCustomerSourceChange = (value: any) => {
    if (value === 'fromLead') {
      setMode('convert');
    } else {
      setMode('create');
    }
  };

  // Filter out converted leads for the selection dropdown
  const filteredLeads = leadsData?.filter(
    (lead: any) => lead.status !== 'converted',
  );

  const onLeadSelect = (value: any) => {
    const lead = leadsData.find((lead) => lead._id === value);

    if (lead) {
      form.setFieldsValue({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
      });
    }
  };
  return (
    <ModalForm
      title={<span className="text-lg font-semibold">{getModalTitle()}</span>}
      form={form}
      onFinish={handleFinish}
      initialValues={
        edit
          ? {
              ...data,
              leadId: {
                value: data.leadId,
                label: data.leadName,
              },
            }
          : {}
      }
      submitter={{
        searchConfig: {
          submitText: edit ? 'Update Customer' : getSubmitText(),
        },
      }}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        centered: true,
        maskClosable: true,
        width: 800,
      }}
      trigger={
        edit ? (
          <Button
            icon={<EditOutlined />}
            size="small"
            key="edit-customer"
            className="mr-2 cursor-pointer"
          />
        ) : (
          <Button type="primary" icon={<PlusOutlined />} loading={loading}>
            Add New Customer
          </Button>
        )
      }
    >
      {/* Customer Source Section - Only for Create Mode */}
      {mode === 'create' && (
        <div className="mb-6">
          <ProFormRadio.Group
            name="customerSource"
            label={<span className="font-medium">Customer Source</span>}
            initialValue="new"
            fieldProps={{
              onChange: (e) => handleCustomerSourceChange(e.target.value),
            }}
            options={[
              {
                label: 'New Customer',
                value: 'new',
              },
              {
                label: 'Convert from Lead',
                value: 'fromLead',
              },
            ]}
          />

          <ProFormDependency name={['customerSource']}>
            {({ customerSource }) =>
              customerSource === 'fromLead' && (
                <ProFormSelect
                  name="leadId"
                  label={<span className="font-medium">Select Lead</span>}
                  placeholder="Select a lead to convert"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a lead to convert',
                    },
                  ]}
                  showSearch
                  fieldProps={{
                    loading: isLoadingLeads,
                    optionFilterProp: 'label',
                    onChange: onLeadSelect,
                  }}
                  options={leadsData.map((lead: any) => ({
                    label: `${lead.name} - ${lead.status}`,
                    value: lead._id,
                  }))}
                />
              )
            }
          </ProFormDependency>
        </div>
      )}

      {/* Lead Selection for Convert Mode */}
      {mode === 'convert' && (
        <div className="mb-6">
          <ProFormSelect
            name="leadId"
            label={<span className="font-medium">Select Lead</span>}
            placeholder="Select a lead to convert"
            rules={[
              { required: true, message: 'Please select a lead to convert' },
            ]}
            showSearch
            fieldProps={{
              loading: isLoadingLeads,
              optionFilterProp: 'label',
              onChange: onLeadSelect,
            }}
            options={filteredLeads?.map((lead: any) => ({
              label: `${lead.name} - ${lead.status}`,
              value: lead._id,
            }))}
          />
        </div>
      )}

      <Tabs defaultActiveKey="personalInfo" className="mb-4">
        {/* Personal Information Tab */}
        <Tabs.TabPane
          tab={
            <span className="flex items-center">
              <UserOutlined className="mr-2" />
              Personal Information
            </span>
          }
          key="personalInfo"
        >
          <div className=" p-4 rounded-lg">
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  name="customerType"
                  label={<span className="font-medium">Customer Type</span>}
                  initialValue="individual"
                  rules={[
                    { required: true, message: 'Please select customer type' },
                  ]}
                  options={[
                    { label: 'Individual', value: 'individual' },
                    { label: 'Company', value: 'company' },
                  ]}
                />
              </Col>
              <Col span={12}>
                <ProFormDependency name={['customerType']}>
                  {({ customerType }) => (
                    <ProFormText
                      name="name"
                      label={
                        <span className="font-medium">
                          {customerType === 'company'
                            ? 'Contact Person Name'
                            : 'Full Name'}
                        </span>
                      }
                      placeholder={
                        customerType === 'company'
                          ? 'Enter contact person name'
                          : 'Enter full name'
                      }
                      rules={[{ required: true, message: 'Please enter name' }]}
                    />
                  )}
                </ProFormDependency>
              </Col>
            </Row>

            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <ProFormDependency name={['customerType']}>
                  {({ customerType }) => (
                    <ProFormText
                      name="email"
                      label={
                        <span className="font-medium">
                          {customerType === 'company'
                            ? 'Contact Email'
                            : 'Email'}
                        </span>
                      }
                      placeholder={
                        customerType === 'company'
                          ? 'Enter contact email'
                          : 'Enter email'
                      }
                      rules={[
                        {
                          type: 'email',
                          message: 'Please enter a valid email',
                        },
                      ]}
                    />
                  )}
                </ProFormDependency>
              </Col>
              <Col span={12}>
                <ProFormDependency name={['customerType']}>
                  {({ customerType }) => (
                    <ProFormText
                      name="phone"
                      label={
                        <span className="font-medium">
                          {customerType === 'company'
                            ? 'Contact Phone'
                            : 'Phone'}
                        </span>
                      }
                      placeholder={
                        customerType === 'company'
                          ? 'Enter contact phone'
                          : 'Enter phone'
                      }
                      rules={[
                        {
                          required: true,
                          message: 'Please enter phone number',
                        },
                        {
                          pattern: /^\+?[0-9]{10,15}$/,
                          message: 'Please enter a valid phone number',
                        },
                      ]}
                    />
                  )}
                </ProFormDependency>
              </Col>
            </Row>

            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <ProFormDependency name={['customerType']}>
                  {({ customerType }) => (
                    <ProFormText
                      name="idNumber"
                      label={
                        <span className="font-medium">
                          {customerType === 'company'
                            ? 'Registration Number'
                            : 'ID Number'}
                        </span>
                      }
                      placeholder={
                        customerType === 'company'
                          ? 'Enter registration number'
                          : 'Enter ID number'
                      }
                      rules={[
                        {
                          required: true,
                          message: 'Please enter ID/registration number',
                        },
                      ]}
                    />
                  )}
                </ProFormDependency>
              </Col>
              <Col span={12}>
                <ProFormDependency name={['customerType']}>
                  {({ customerType }) => (
                    <ProFormText
                      name="alternatePhone"
                      label={
                        <span className="font-medium">
                          {customerType === 'company'
                            ? 'Alternate Contact Phone'
                            : 'Alternate Phone'}
                        </span>
                      }
                      placeholder={
                        customerType === 'company'
                          ? 'Enter alternate contact phone'
                          : 'Enter alternate phone'
                      }
                      rules={[
                        {
                          pattern: /^\+?[0-9]{10,15}$/,
                          message: 'Please enter a valid phone number',
                        },
                      ]}
                    />
                  )}
                </ProFormDependency>
              </Col>
            </Row>

            <Divider orientation="left" className="text-gray-500">
              Address Information
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <ProFormText
                  name={['address', 'street']}
                  label={<span className="font-medium">Street Address</span>}
                  placeholder="Enter street address"
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  name={['address', 'city']}
                  label={<span className="font-medium">City</span>}
                  placeholder="Enter city"
                />
              </Col>
            </Row>

            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <ProFormText
                  name={['address', 'county']}
                  label={<span className="font-medium">County</span>}
                  placeholder="Enter county"
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  name={['address', 'postalCode']}
                  label={<span className="font-medium">Postal Code</span>}
                  placeholder="Enter postal code"
                />
              </Col>
            </Row>

            <Divider orientation="left" className="text-gray-500">
              Professional Information
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <ProFormDependency name={['customerType']}>
                  {({ customerType }) => (
                    <ProFormText
                      name="occupation"
                      label={
                        <span className="font-medium">
                          {customerType === 'company'
                            ? 'Contact Position'
                            : 'Occupation'}
                        </span>
                      }
                      placeholder={
                        customerType === 'company'
                          ? 'Enter contact position'
                          : 'Enter occupation'
                      }
                    />
                  )}
                </ProFormDependency>
              </Col>
              <Col span={12}>
                <ProFormDependency name={['customerType']}>
                  {({ customerType }) => (
                    <ProFormText
                      name="company"
                      label={<span className="font-medium">Company Name</span>}
                      placeholder="Enter company name"
                      rules={[
                        customerType === 'company'
                          ? {
                              required: true,
                              message: 'Please enter company name',
                            }
                          : {},
                      ]}
                    />
                  )}
                </ProFormDependency>
              </Col>
            </Row>
          </div>
        </Tabs.TabPane>

        {/* Property Preferences Tab */}
        <Tabs.TabPane
          tab={
            <span className="flex items-center">
              <HomeOutlined className="mr-2" />
              Property Preferences
            </span>
          }
          key="propertyPreferences"
        >
          <div className=" p-4 rounded-lg">
            <Row gutter={16}>
              <Col span={12}>
                <ProFormCheckbox.Group
                  name={['preferences', 'propertyTypes']}
                  label={<span className="font-medium">Property Types</span>}
                  rules={[
                    {
                      required: true,
                      message: 'Please select at least one property type',
                    },
                  ]}
                  options={[
                    { label: 'Apartment', value: 'apartment' },
                    { label: 'Land', value: 'land' },
                  ]}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  name={['preferences', 'locations']}
                  label={
                    <span className="font-medium">Preferred Locations</span>
                  }
                  placeholder="Select or add locations"
                  mode="tags"
                  options={[
                    { label: 'Kilimani', value: 'kilimani' },
                    { label: 'Kileleshwa', value: 'kileleshwa' },
                    { label: 'Lavington', value: 'lavington' },
                    { label: 'Karen', value: 'karen' },
                    { label: 'Runda', value: 'runda' },
                    { label: 'Westlands', value: 'westlands' },
                    { label: 'Thika Road', value: 'thika_road' },
                    { label: 'Mombasa Road', value: 'mombasa_road' },
                  ]}
                />
              </Col>
            </Row>

            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <ProFormGroup
                  title={
                    <span className="font-medium">Budget Range (KES)</span>
                  }
                  size={8}
                >
                  <Row gutter={8}>
                    <Col span={11}>
                      <ProFormDigit
                        name={['preferences', 'budgetRange', 'min']}
                        label=""
                        placeholder="Minimum"
                        rules={[
                          {
                            required: true,
                            message: 'Minimum budget is required',
                          },
                        ]}
                        fieldProps={{
                          formatter: (value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                          parser: (value) =>
                            Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
                        }}
                        className="w-full"
                      />
                    </Col>
                    <Col span={2} className="flex items-center justify-center">
                      <span className="text-gray-400">-</span>
                    </Col>
                    <Col span={11}>
                      <ProFormDigit
                        name={['preferences', 'budgetRange', 'max']}
                        label=""
                        placeholder="Maximum"
                        rules={[
                          {
                            required: true,
                            message: 'Maximum budget is required',
                          },
                        ]}
                        fieldProps={{
                          formatter: (value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                          parser: (value) =>
                            Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
                        }}
                        className="w-full"
                      />
                    </Col>
                  </Row>
                </ProFormGroup>
              </Col>
              <Col span={12}>
                <ProFormSelect
                  name={['preferences', 'amenities']}
                  label={
                    <span className="font-medium">Preferred Amenities</span>
                  }
                  placeholder="Select or add amenities"
                  mode="tags"
                  options={[
                    { label: 'Swimming Pool', value: 'swimming_pool' },
                    { label: 'Gym', value: 'gym' },
                    { label: '24/7 Security', value: 'security' },
                    { label: 'Parking', value: 'parking' },
                    { label: 'Backup Generator', value: 'backup_generator' },
                    { label: 'Reliable Water Supply', value: 'water_supply' },
                  ]}
                />
              </Col>
            </Row>

            <div className="mt-4">
              <ProFormTextArea
                name={['preferences', 'otherRequirements']}
                label={<span className="font-medium">Additional Notes</span>}
                placeholder="Enter any additional property requirements"
                fieldProps={{
                  rows: 4,
                }}
              />
            </div>
          </div>
        </Tabs.TabPane>

        {/* Additional Information Tab - Only for Create or Convert Modes */}
        {(mode === 'create' || mode === 'convert') && (
          <Tabs.TabPane
            tab={
              <span className="flex items-center">
                <BuildOutlined className="mr-2" />
                Additional Information
              </span>
            }
            key="additionalInfo"
          >
            <div className=" p-4 rounded-lg">
              <ProFormDependency name={['customerSource']}>
                {({ customerSource }) =>
                  mode === 'create' &&
                  customerSource === 'new' && (
                    <ProFormSelect
                      name="leadSource"
                      label={
                        <span className="font-medium">
                          How did you hear about us?
                        </span>
                      }
                      placeholder="Select lead source"
                      options={[
                        { label: 'Referral', value: 'referral' },
                        { label: 'Social Media', value: 'social_media' },
                        { label: 'Website', value: 'website' },
                        { label: 'Advertisement', value: 'advertisement' },
                        { label: 'Walk-in', value: 'walk_in' },
                        { label: 'Other', value: 'other' },
                      ]}
                    />
                  )
                }
              </ProFormDependency>

              <div className={mode === 'create' ? 'mt-4' : ''}>
                <ProFormTextArea
                  name="notes"
                  label={<span className="font-medium">Customer Notes</span>}
                  placeholder="Add any additional notes about this customer"
                  fieldProps={{
                    rows: 4,
                  }}
                />
              </div>
            </div>
          </Tabs.TabPane>
        )}
      </Tabs>
    </ModalForm>
  );
};

export default AddEditCustomerModal;
