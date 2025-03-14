import { PhoneInput } from '@/components/phonenumber';
import { getPhoneNumber } from '@/components/phonenumber/formatPhoneNumberUtil';
import { reversePhoneNumber } from '@/components/phonenumber/reversePhoneNumberFormat';
import { registerUser, updateUser, resetPassword } from '@/services/auth.api';
import ShowConfirm from '@/utils/ConfirmUtil';
import {
  EditOutlined,
  LockOutlined,
  UsergroupAddOutlined,
  KeyOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  message,
  Row,
  Space,
  Tabs,
  Tooltip,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

const { TabPane } = Tabs;

interface AddEditUserModalProps {
  actionRef: any;
  edit?: boolean;
  data?: any;
  isProfile?: boolean;
  userId?: string;
  editText?: string;
}

/**
 * Modal for adding or editing a user
 * @param {Object} props - Props for the modal
 * @param {Object} props.actionRef - Ref for the action button
 * @param {boolean} props.edit - Whether to edit the user or add a new one
 * @param {Object} props.data - Data for the user to be edited
 * @param {boolean} props.isProfile - Whether the user is a profile or a user
 * @param {string} props.userId - ID of the user to be edited
 * @param {string} props.editText - Text to be displayed in the edit button
 * @returns {JSX.Element} The modal for adding or editing a user
 * @example
 * <AddEditUserModal actionRef={actionRef} edit={edit} data={data} isProfile={isProfile} userId={userId} editText={editText} />
 */

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  actionRef,
  edit,
  data,
  isProfile,
  userId,
  editText,
}) => {
  const [form] = Form.useForm();
  const formRef = useRef<ActionType>();

  const [open, setOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        ...data,
        phoneNumber: reversePhoneNumber(data?.phone),
      });
    }
  }, [open, data, form]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.resetFields();
    }
  };

  // Function to generate a random password
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";

    // Ensure at least one uppercase, one lowercase, one number, and one special char
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)];

    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    form.setFieldsValue({
      password: password,
      confirmPassword: password,
    });
  };

  // Function to trigger password reset
  const handlePasswordReset = async () => {
    try {
      if (!data || !data.email) {
        message.error('User email is required for password reset');
        return;
      }

      setIsResetting(true);
      const confirmed = await ShowConfirm({
        title: `Are you sure you want to reset password for ${data.name}?`,
        content: 'A password reset link will be sent to the user\'s email.',
        position: true,
      });

      if (confirmed) {
        await resetPassword(data.email);
        message.success('Password reset link has been sent to the user\'s email');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      message.error('Failed to send password reset link');
    } finally {
      setIsResetting(false);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const phoneNumber = getPhoneNumber(values?.phoneNumber);
      const value = { ...values, phone: phoneNumber };
      const confirmed = await ShowConfirm({
        title: `Are you sure you want to ${edit ? 'update this' : 'add new'} ${isProfile ? 'profile' : 'user'
          }?`,
        position: true,
      });
      if (confirmed) {
        if (edit) {
          await updateUser(data._id, value);
          // Invalidate the query to update the user details
          if (isProfile) {
            await queryClient.invalidateQueries(['user', userId]);
          }
          message.success('User updated successfully');
        } else {
          await registerUser(value);

          message.success('User created successfully');
        }
        actionRef.current?.reload();
        return true;
      }
    } catch (error) {
      console.log('Error:', error);
      return false;
    }
  };

  return (
    <ModalForm
      title={
        <Space>
          {isProfile ? <EditOutlined /> : <UsergroupAddOutlined />}
          {edit ? `Edit ${isProfile ? 'Profile' : 'User'}` : 'Add New User'}
        </Space>
      }
      form={form}
      open={open}
      onOpenChange={handleOpenChange}
      formRef={formRef}
      width={800}
      trigger={
        edit ? (
          <Button
            key="button"
            icon={<EditOutlined onClick={() => form.setFieldsValue(data)} />}
            size="small"
          >
            {editText ? editText : ''}
          </Button>
        ) : (
          <Button type="primary" key="button" icon={<UsergroupAddOutlined />}>
            Add New User
          </Button>
        )
      }
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        centered: true,
        maskClosable: true,
      }}
      initialValues={
        edit
          ? {
            ...data,
            phoneNumber: reversePhoneNumber(data?.phone),
          }
          : {}
      }
      onFinish={handleFinish}
      submitter={{
        searchConfig: {
          resetText: 'Cancel',
          submitText: edit ? 'Save Profile' : 'Add New User',
        },
      }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Personal Information" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="name"
                label="Full Name"
                placeholder="Enter Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="email"
                label="Email"
                placeholder="Enter Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <PhoneInput label="Phone" owner="phoneNumber" />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="role"
                label="Role"
                placeholder="Select a role"
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'property_manager', label: 'Property Manager' },
                  { value: 'sales_agent', label: 'Sales Agent' },
                  { value: 'finance_officer', label: 'Finance Officer' },
                  { value: 'customer', label: 'Customer' },
                  { value: 'valuer', label: 'Valuation Officer' },
                ]}
                rules={[{ required: true, message: 'Please select a role' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="idNumber"
                label="ID Number"
                placeholder="Enter ID Number"
                rules={[{ required: true, message: 'Please enter ID number' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="gender"
                label="Gender"
                placeholder="Select gender"
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </Col>
          </Row>

          <ProFormTextArea
            name="address"
            label="Address"
            placeholder="Enter address"
            fieldProps={{ rows: 2 }}
          />
        </TabPane>

        <TabPane tab="Account & Security" key="2">
          {!edit && (
            <Row gutter={16}>
              <Col span={24}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={8} align="middle">
                    <Col flex="auto">
                      <ProFormText.Password
                        name="password"
                        label="Password"
                        placeholder="Enter password"
                        fieldProps={{
                          prefix: <LockOutlined />,
                        }}
                        rules={[
                          { required: true, message: 'Please enter password' },
                          {
                            min: 8,
                            message: 'Password must be at least 8 characters',
                          },
                        ]}
                      />
                    </Col>
                    <Col>
                      <Tooltip title="Generate Strong Password">
                        <Button
                          type="default"
                          icon={<KeyOutlined />}
                          onClick={generatePassword}
                          style={{ marginTop: 29 }}
                        >
                          Generate
                        </Button>
                      </Tooltip>
                    </Col>
                  </Row>
                  <ProFormText.Password
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm password"
                    fieldProps={{
                      prefix: <LockOutlined />,
                    }}
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('Passwords do not match'),
                          );
                        },
                      }),
                    ]}
                  />
                </Space>
              </Col>
            </Row>
          )}

          {edit && (
            <div>
              <Alert
                message="Password Management"
                description="To change the user's password, use the reset password function. This will send a password reset link to the user's email."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Button
                type="primary"
                icon={<SyncOutlined spin={isResetting} />}
                onClick={handlePasswordReset}
                loading={isResetting}
              >
                Reset Password
              </Button>
            </div>
          )}

          <Divider />

          <ProFormSelect
            name="status"
            label="Account Status"
            placeholder="Select status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </TabPane>
      </Tabs>
    </ModalForm>
  );
};

export default AddEditUserModal;