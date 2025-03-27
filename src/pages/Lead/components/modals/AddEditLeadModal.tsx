import { PhoneInput } from '@/components/phonenumber';
import { getPhoneNumber } from '@/components/phonenumber/formatPhoneNumberUtil';
import { reversePhoneNumber } from '@/components/phonenumber/reversePhoneNumberFormat';
import { fetchAllUsers } from '@/services/auth.api';
import { createNewLead, updateLead } from '@/services/lead';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Col,
  Divider,
  Form,
  message,
  Row,
  Tag,
  Typography,
} from 'antd';
import React from 'react';

const { Text } = Typography;

interface AddEditLeadModalProps {
  edit?: boolean;
  data?: any;
  actionRef?: any;
  editText?: string;
}

const AddEditLeadModal: React.FC<AddEditLeadModalProps> = ({
  edit,
  data,
  actionRef,
  editText,
}) => {
  const [form] = Form.useForm();

  const { data: agentsData, loading: agentsLoading } = useRequest(
    fetchAllUsers,
    {
      onSuccess: (response) => {
        const agents = response.filter((agent) => agent.role === 'sales_agent');
        return agents;
      },
      onError: (error) => {
        console.error('Error fetching agents:', error);
        message.error('Failed to load agents');
      },
    },
  );

  // Handle form submission
  const onFinish = async (values: any) => {
    console.log(getPhoneNumber(values.phoneNumber));
    try {
      // Format the data for submission
      const formattedData = {
        ...values,
        interestAreas: [
          {
            budget: {
              min: values.budgetMin,
              max: values.budgetMax,
            },
            county: values.county,
            propertyType: values.propertyType,
          },
        ],
        notes: edit ? data.notes : [{ content: values.notes }],
        phone: getPhoneNumber(values.phoneNumber),
      };

      // Remove fields that have been restructured
      delete formattedData.budgetMin;
      delete formattedData.budgetMax;

      if (edit) {
        await updateLead(data._id, formattedData);

        message.success('Lead updated successfully');
      } else {
        await createNewLead(formattedData);
        message.success('Lead created successfully');
      }

      form.resetFields();
      actionRef?.current?.reload();
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      message.error(edit ? 'Failed to update lead' : 'Failed to create lead');
      return false;
    }
  };

  return (
    <ModalForm
      name="Leads"
      title={
        <div>
          {edit ? (
            <>
              <Text strong>Edit Lead: </Text>
              <Text>{data?.name}</Text>
              {data?.priority && (
                <Tag
                  color={
                    data.priority === 'high'
                      ? 'red'
                      : data.priority === 'medium'
                      ? 'orange'
                      : 'green'
                  }
                  style={{ marginLeft: 12 }}
                >
                  {data.priority.toUpperCase()}
                </Tag>
              )}
            </>
          ) : (
            'Add New Lead'
          )}
        </div>
      }
      onFinish={onFinish}
      form={form}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        width: 800,
      }}
      initialValues={
        edit
          ? {
              name: data.name,
              email: data.email,
              phoneNumber: reversePhoneNumber(data.phone),
              source: data.source,
              sourceDetails: data.sourceDetails,
              priority: data.priority,
              county: data.interestAreas?.[0]?.county || '',
              propertyType: data.interestAreas?.[0]?.propertyType || '',
              budgetMin: data.interestAreas?.[0]?.budget?.min || '',
              budgetMax: data.interestAreas?.[0]?.budget?.max || '',
              assignedTo: data.assignedTo?._id || '',
              notes: data.notes?.[0]?.content || '',
              followUpDate: data.followUpDate
                ? new Date(data.followUpDate)
                : undefined,
            }
          : {}
      }
      submitter={{
        searchConfig: {
          submitText: edit ? 'Update Lead' : 'Add Lead',
        },
        resetButtonProps: {
          style: { display: 'none' },
        },
      }}
      trigger={
        edit ? (
          <Button key="button" icon={<EditOutlined />} size="small">
            {editText || ''}
          </Button>
        ) : (
          <Button type="primary" key="button" icon={<PlusOutlined />}>
            Add New Lead
          </Button>
        )
      }
    >
      <Divider orientation="left">Personal Information</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <ProFormText
            name="name"
            label="Full Name"
            placeholder="Enter lead's full name"
            rules={[{ required: true, message: 'Please enter the lead name' }]}
          />
        </Col>
        <Col span={12}>
          <PhoneInput
            name="phone"
            label="Contact Number"
            placeholder="+254 7XX XXX XXX"
            rules={[
              { required: true, message: 'Please enter a contact number' },
            ]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ProFormText
            name="email"
            label="Email Address"
            placeholder="email@example.com"
            rules={[
              {
                type: 'email',
                message: 'Please enter a valid email address',
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormText
            name="county"
            label="County/Location"
            placeholder="E.g., Nairobi, Mombasa, Kisumu"
            rules={[{ required: true, message: 'Please enter the county' }]}
          />
        </Col>
      </Row>

      <Divider orientation="left">Lead Details</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <ProFormSelect
            name="source"
            label="Lead Source"
            placeholder="Select a source"
            options={[
              { label: 'Direct', value: 'direct' },
              { label: 'Referral', value: 'referral' },
              { label: 'Website', value: 'website' },
              { label: 'Social Media', value: 'social' },
              { label: 'Agent', value: 'agent' },
              { label: 'Other', value: 'other' },
            ]}
            rules={[{ required: true, message: 'Please select a source' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormText
            name="sourceDetails"
            label="Source Details"
            placeholder="Additional details about the source"
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormSelect
            name="priority"
            label="Priority"
            placeholder="Select a priority"
            options={[
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ]}
            rules={[{ required: true, message: 'Please select a priority' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="assignedTo"
            label="Assigned Agent"
            placeholder="Select an agent"
            loading={agentsLoading}
            options={agentsData?.map((agent) => ({
              label: agent.name,
              value: agent._id,
            }))}
            rules={[{ required: true, message: 'Please select an agent' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            name="followUpDate"
            label="Follow-up Date"
            placeholder="Select date"
            rules={[
              { required: true, message: 'Please select a follow-up date' },
            ]}
          />
        </Col>
      </Row>

      <Divider orientation="left">Property Interest</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <ProFormSelect
            name="propertyType"
            label="Property Type"
            placeholder="Select property type"
            options={[
              { label: 'Apartment', value: 'apartment' },
              { label: 'Land', value: 'land' },
              { label: 'Both', value: 'both' },
            ]}
            rules={[{ required: true, message: 'Please select property type' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormDigit
            name="budgetMin"
            label="Budget Minimum (KES)"
            placeholder="Min budget"
            fieldProps={{
              formatter: (value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
              parser: (value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
            }}
            rules={[{ required: true, message: 'Please enter minimum budget' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormDigit
            name="budgetMax"
            label="Budget Maximum (KES)"
            placeholder="Max budget"
            fieldProps={{
              formatter: (value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
              parser: (value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0),
            }}
            rules={[{ required: true, message: 'Please enter maximum budget' }]}
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="notes"
        label="Notes"
        placeholder="Any additional information about the lead..."
        fieldProps={{
          rows: 4,
          maxLength: 500,
          showCount: true,
        }}
      />
    </ModalForm>
  );
};

export default AddEditLeadModal;
