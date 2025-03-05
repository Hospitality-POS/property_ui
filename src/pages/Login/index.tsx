import React, { useEffect } from 'react';
import { GoogleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Divider, Typography, message } from 'antd';
import { history, useModel } from 'umi';
import bgImage from '/public/assets/images/background.svg';
import logo from '/public/assets/images/icon.png';
import { loginUser } from '@/services/auth';
import { useAppDispatch, useAppSelector } from '@/store';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);
  const { initialState, setInitialState } = useModel('@@initialState');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      history.push('/dashboard');
    }
  }, [isAuthenticated]);

  // Show error message if login fails
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSubmit = async (values) => {
    try {
      // Dispatch login action
      const resultAction = await dispatch(loginUser(values));

      if (loginUser.fulfilled.match(resultAction)) {
        // Get user data from the result
        const userData = resultAction.payload;

        // Update the initialState with user info
        await setInitialState((prevState) => ({
          ...prevState,
          currentUser: userData,
          avatar: userData?.avatar || null,
        }));

        // Redirect to dashboard
        history.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = () => {
    // Add Google OAuth logic here
    message.info('Google Login initiated');
  };

  return (
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
                  loading: isLoading,
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
                I agree to abide by Relia Property Mgt system's{' '}
                <a href="#" className="border-b border-gray-500 border-dotted">
                  Terms of Service
                </a>{' '}
                and its{' '}
                <a href="#" className="border-b border-gray-500 border-dotted">
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
  );
};

export default LoginPage;