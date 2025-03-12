import { useLogin } from '@/hooks/useLogin';
import { BankOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Checkbox, Divider, Form, Typography } from 'antd';
import bgImage from '/public/assets/images/background.svg';
import logo from '/public/assets/images/icon.png';

// const queryClient = new QueryClient();

const LoginPage = () => {
  const { loginMutation, handleLogin } = useLogin();

  return (
    // <QueryClientProvider client={queryClient}>
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-6 text-center">
              <img
                src={logo}
                alt="Company Logo"
                className="mx-auto h-40 w-auto"
              />
              <Typography.Title level={3} className="mt-4 text-gray-800">
                Welcome Back
              </Typography.Title>
              <Typography.Paragraph className="text-gray-500">
                Real Estate Sales Management Portal
              </Typography.Paragraph>
            </div>

            {/* Login Form */}
            <ProForm
              onFinish={handleLogin}
              submitter={{
                searchConfig: { submitText: 'Sign In' },
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
                  loading: loginMutation.isPending,
                },
              }}
            >
              <div className="space-y-6">
                <div className="relative">
                  <Divider plain>
                    <span className="text-gray-400 px-2">
                      or sign in with credentials
                    </span>
                  </Divider>
                </div>

                {/* Company Code Input */}
                <ProFormText
                  name="companyCode"
                  initialValue="RPOS-Q8QALD"
                  fieldProps={{
                    size: 'large',
                    prefix: <BankOutlined className="text-gray-400" />,
                  }}
                  placeholder="Company Code"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Company Code!',
                    },
                  ]}
                />

                {/* Username Input */}
                <ProFormText
                  name="username"
                  initialValue="michael@gmail.com"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined className="text-gray-400" />,
                  }}
                  placeholder="Username"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Username!',
                    },
                  ]}
                />

                {/* Password Input */}
                <ProFormText.Password
                  name="password"
                  initialValue="Kinuthia#98"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className="text-gray-400" />,
                  }}
                  placeholder="Password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ]}
                />

                {/* Remember Me Option */}
                <div className="flex items-center">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                </div>
              </div>

              {/* Terms of Service */}
              <div className="text-center text-xs text-gray-500 mt-8 mb-4">
                By signing in, you agree to Relia Property Mgt system&apos;s{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </a>
              </div>
            </ProForm>
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
    // </QueryClientProvider>
  );
};

export default LoginPage;
