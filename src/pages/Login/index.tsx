import { loginUser } from '@/services/auth.api';
import { LockOutlined, UserOutlined, BankOutlined } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import { history } from '@umijs/max';
import { Divider, message, Typography, Form, Checkbox } from 'antd';
import bgImage from '/public/assets/images/background.svg';
import logo from '/public/assets/images/icon.png';

const queryClient = new QueryClient();

const LoginPage = () => {
  const loginMutation = useMutation({
    mutationFn: async (values) =>
      await loginUser(values?.username, values?.password, values?.companyCode),
    onSuccess: (data) => {
      localStorage.setItem('property_token', JSON.stringify(data.token));
      history.push('/dashboard');
      message.success('Login successful! Redirecting...');
    },
    onError: (error) => {
      // Handle different error scenarios
      if (error.response && error.response.status === 401) {
        message.error('Invalid username or password');
      } else if (error.response && error.response.status === 403) {
        message.error('Invalid company code');
      } else {
        message.error('Login failed. Please try again later.');
      }
    },
  });

  const handleSubmit = async (values) => {
    try {
      // Pass the values directly to mutateAsync
      await loginMutation.mutateAsync(values);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-50">
        <div className="flex flex-1 shadow-2xl rounded-3xl m-4 overflow-hidden">
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
                onFinish={handleSubmit}
                submitter={{
                  searchConfig: {
                    submitText: 'Sign In',
                  },
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
                  {/* Social Login Options - Disabled */}
                  <div className="flex">
                    <button
                      className="w-full flex justify-center items-center border border-gray-200 rounded-lg cursor-not-allowed opacity-60 py-2 px-4"
                      disabled={true}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Sign in with Google
                    </button>
                  </div>

                  <div className="relative">
                    <Divider plain>
                      <span className="text-gray-400 px-2">or sign in with credentials</span>
                    </Divider>
                  </div>

                  {/* Company Code Input - First Field */}
                  <ProFormText
                    name="companyCode"
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
                    className="rounded-lg"
                  />

                  {/* Username Input */}
                  <ProFormText
                    name="username"
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
                    className="rounded-lg"
                  />

                  {/* Password Input */}
                  <ProFormText.Password
                    name="password"
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
                    className="rounded-lg"
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
                  By signing in, you agree to Relia Property Mgt system's{' '}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Privacy Policy
                  </a>
                </div>
              </ProForm>
            </div>
          </div>

          {/* Right Side - Background Image with Overlay */}
          <div
            className="hidden lg:flex lg:w-1/2 bg-teal-500 relative items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/50 to-emerald-700/50 z-10"></div>
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.9
              }}
            ></div>

            {/* Content overlay */}
            <div className="relative z-20 text-white max-w-md p-12">
              <Typography.Title level={2} className="text-white mb-8">
                Relia Property Sales Portal
              </Typography.Title>
              <Typography.Paragraph className="text-white/90 text-lg mb-8">
                Your comprehensive sales management solution for apartments and land. Track listings, monitor sales progress, and optimize your real estate business performance.
              </Typography.Paragraph>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/90">Inventory & listing management</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/90">Sales pipeline tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/90">Performance & revenue reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default LoginPage;