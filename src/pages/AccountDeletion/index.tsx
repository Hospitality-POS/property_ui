import { deleteAccount, requestOTP, verifyOTP } from '@/services/auth.api';
import {
  BankOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Input,
  message,
  Space,
  Steps,
  Typography,
} from 'antd';
import { useState } from 'react';
import bgImage from '/public/assets/images/background.svg';
import logo from '/public/assets/images/icon.png';

const { Title, Paragraph } = Typography;

const DeleteAccountPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    companyCode: '',
    email: '',
  });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  // Define startCountdown function before it's used
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Request OTP
  const { run: runRequestOTP, loading: isRequestingOTP } = useRequest(
    requestOTP,
    {
      manual: true,
      onSuccess: () => {
        message.success('Verification code sent to your email');
        setCurrentStep(1);
        startCountdown();
      },
      onError: (error: any) => {
        if (error.response?.status === 404) {
          message.error(
            'Account not found. Please check your company code and email.',
          );
        } else {
          message.error(
            'Failed to send verification code. Please try again later.',
          );
        }
      },
    },
  );

  // Verify OTP
  const { run: runVerifyOTP, loading: isVerifyingOTP } = useRequest(verifyOTP, {
    manual: true,
    onSuccess: () => {
      message.success('Verification successful');
      setCurrentStep(2);
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        message.error('Invalid verification code. Please try again.');
      } else {
        message.error('Verification failed. Please try again later.');
      }
    },
  });

  // Delete Account
  const { run: runDeleteAccount, loading: isDeletingAccount } = useRequest(
    deleteAccount,
    {
      manual: true,
      onSuccess: () => {
        message.success('Your account has been successfully deleted');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      },
      onError: () => {
        message.error('Failed to delete account. Please try again later.');
      },
    },
  );

  // Handle OTP input change
  const handleOtpChange = (index: number, inputValue: string) => {
    // Create a new value rather than modifying the parameter
    let newValue = inputValue;

    if (newValue.length > 1) {
      newValue = newValue.substring(0, 1);
    }

    // Only allow numbers
    if (newValue && !/^\d+$/.test(newValue)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    // Auto focus next input
    if (newValue && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle OTP keydown for backspace
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Verify the OTP
  const verifyOtpCode = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      message.error('Please enter all 4 digits');
      return;
    }

    runVerifyOTP(formData.companyCode, formData.email, otpCode);
  };

  // Step 1: Request OTP Form
  const renderStep1 = () => (
    <ProForm
      onFinish={async (values: any) => {
        setFormData({
          companyCode: values.companyCode,
          email: values.email,
        });
        await runRequestOTP(values.companyCode, values.email);
        return true;
      }}
      submitter={{
        searchConfig: { submitText: 'Send Verification Code' },
        render: (_, dom) => dom[1],
        submitButtonProps: {
          size: 'large',
          style: {
            width: '100%',
            backgroundColor: '#27C6C1',
            color: '#F8F8F8',
            borderRadius: '8px',
            height: '48px',
            fontWeight: '600',
            marginTop: '16px',
          },
          loading: isRequestingOTP,
          icon: <SafetyCertificateOutlined />,
        },
      }}
    >
      <Alert
        message="Account Deletion Request"
        description="To delete your account, please provide your company code and email address. A verification code will be sent to your email."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Company Code Input */}
      <ProFormText
        name="companyCode"
        fieldProps={{
          size: 'large',
          prefix: <BankOutlined className="text-gray-400" />,
          onChange: (e) => {
            // Create a new event with modified value instead of modifying the parameter
            const newEvent = { ...e };
            newEvent.target = {
              ...e.target,
              value: e.target.value.replace(/\s/g, ''),
            };
            // Use the new event
            e.target.value = newEvent.target.value;
          },
        }}
        placeholder="Company Code"
        rules={[
          {
            required: true,
            message: 'Please input your Company Code!',
          },
        ]}
      />

      {/* Email Input */}
      <ProFormText
        name="email"
        fieldProps={{
          size: 'large',
          prefix: <UserOutlined className="text-gray-400" />,
        }}
        placeholder="Email Address"
        rules={[
          {
            required: true,
            message: 'Please input your Email Address!',
          },
          {
            type: 'email',
            message: 'Please enter a valid email address!',
          },
        ]}
      />
    </ProForm>
  );

  // Step 2: OTP Verification
  const renderStep2 = () => (
    <div className="space-y-6">
      <Alert
        message="Verify Your Identity"
        description={`We've sent a 4-digit verification code to ${formData.email}. Please enter the code below to continue.`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div className="text-center">
        <Paragraph>Enter 4-digit verification code</Paragraph>
        <div className="flex justify-center gap-3 my-6">
          {[0, 1, 2, 3].map((index) => (
            <Input
              id={`otp-${index}`}
              key={index}
              className="w-16 h-16 text-center text-2xl"
              value={otp[index]}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <Space>
          <Button
            type="primary"
            size="large"
            onClick={verifyOtpCode}
            loading={isVerifyingOTP}
            style={{
              backgroundColor: '#27C6C1',
              borderRadius: '8px',
            }}
          >
            Verify
          </Button>

          <Button
            type="link"
            disabled={countdown > 0}
            onClick={() => {
              setOtp(['', '', '', '']);
              runRequestOTP(formData.companyCode, formData.email);
            }}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </Button>
        </Space>
      </div>
    </div>
  );

  // Step 3: Confirmation
  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <Alert
        message="Final Confirmation"
        description="You are about to permanently delete your account. This action cannot be undone. All your data will be removed from our systems."
        type="error"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div className="p-6 border border-red-300 rounded-lg bg-red-50">
        <Title level={4} className="text-red-600">
          Warning: Permanent Account Deletion
        </Title>
        <Paragraph>Deleting your account will:</Paragraph>
        <ul className="text-left list-disc pl-8 mb-6">
          <li>Remove all your personal information</li>
          <li>Delete all your transaction history</li>
          <li>Remove access to all services</li>
          <li>Cancel any active subscriptions</li>
        </ul>
        <Paragraph strong>
          This action cannot be reversed. Are you absolutely sure?
        </Paragraph>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button
          size="large"
          onClick={() => (window.location.href = '/dashboard')}
        >
          Cancel
        </Button>

        <Button
          danger
          type="primary"
          size="large"
          icon={<DeleteOutlined />}
          loading={isDeletingAccount}
          onClick={() => runDeleteAccount(formData.companyCode, formData.email)}
        >
          Permanently Delete My Account
        </Button>
      </div>
    </div>
  );

  // Render appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="flex h-screen ">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Form */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mt-12 text-center">
              <img
                src={logo}
                alt="Company Logo"
                className="mx-auto h-24 w-auto"
              />
              <Title level={3} className="mt-4 text-gray-800">
                Account Deletion
              </Title>
              <Paragraph className="text-gray-500">
                We&apos;re sorry to see you go
              </Paragraph>
            </div>

            {/* Progress Steps */}
            <Steps
              current={currentStep}
              className=""
              items={[
                {
                  title: 'Request',
                  description: 'Verify identity',
                },
                {
                  title: 'Verify',
                  description: 'Enter OTP',
                },
                {
                  title: 'Confirm',
                  description: 'Delete account',
                },
              ]}
            />

            <Card bordered={false} className="">
              {renderStepContent()}
            </Card>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Button type="link" href="/login">
                Back to Login
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
              © 2025 ReliaProperty. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Side - Background Image with Overlay */}
        <div className="hidden lg:flex lg:w-1/2 bg-teal-500 relative items-center justify-center">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.9,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
