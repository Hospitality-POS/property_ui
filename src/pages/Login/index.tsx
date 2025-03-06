import { loginUser } from '@/services/auth.api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import { history } from '@umijs/max';
import { Divider, message, Typography } from 'antd';
import bgImage from '/public/assets/images/background.svg';
import logo from '/public/assets/images/icon.png';

const queryClient = new QueryClient();

const LoginPage = () => {
  const loginMutation = useMutation({
    mutationFn: async (values) =>
      await loginUser(values?.username, values?.password),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      history.push('/dashboard');
      message.success('Login successful! Redirecting...');
    },
    onError: (error) => {
      // Handle different error scenarios
      if (error.response && error.response.status === 401) {
        message.error('Invalid username or password');
      } else {
        message.error('Login failed. Please try again later.');
      }
    },
  });

  const handleSubmit = async (values) => {
    try {
      // Add login logic here
      await loginMutation.mutateAsync(values);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen">
        <div className="flex flex-1">
          {/* Left Side - Login Form */}
          <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="mb-8 text-center">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="mx-auto h-48 w-auto"
                />
                <div className="text-center text-2xl font-bold text-gray-900">
                  <Typography.Paragraph>
                    Streamline Your Property Management Platform
                  </Typography.Paragraph>
                </div>
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
                    },
                    loading: loginMutation.isPending,
                  },
                }}
              >
                {/* Uncomment for Google Login
              <Button
                icon={<GoogleOutlined />}
                onClick={handleGoogleLogin}
                className="w-full mb-4"
                size="large"
              >
                Sign In with Google
              </Button>

              <Divider>or</Divider>
              */}

                <Divider>sign in with Username</Divider>

                {/* Username Input */}
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
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
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                  }}
                  placeholder="Password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ]}
                />

                {/* Terms of Service */}
                <div className="text-center text-xs text-gray-600 mt-8 mb-8">
                  I agree to abide by Relia Property Mgt system&apos;s{' '}
                  <a
                    href="#"
                    className="border-b border-gray-500 border-dotted"
                  >
                    Terms of Service
                  </a>{' '}
                  and its{' '}
                  <a
                    href="#"
                    className="border-b border-gray-500 border-dotted"
                  >
                    Privacy Policy
                  </a>
                </div>
              </ProForm>
            </div>
          </div>

          {/* Right Side - Background Image */}
          <div
            className="hidden lg:block lg:w-1/2 bg-green-100"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default LoginPage;
