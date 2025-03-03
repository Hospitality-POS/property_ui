import { GoogleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Divider, message, Typography } from 'antd';
import bgImage from '/public/assets/images/background.svg';
import logo from '/public/assets/images/relialogo.png';

const LoginPage = () => {
  const handleSubmit = async (values) => {
    try {
      // Add your login logic here
      console.log('Login values:', values);
      message.success('Login successful!');
    } catch (error) {
      message.error('Login failed');
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
                className="mx-auto h-24 w-auto"
              />
              <div className="text-center text-2xl font-bold text-gray-900">
                <Typography.Paragraph>
                  WE Are your property management solution
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
                },
              }}
            >
              {/* Google Login Button */}
              {/* <Button
                icon={<GoogleOutlined />}
                onClick={handleGoogleLogin}
                className="w-full mb-4"
                size="large"
              >
                Sign In with Google
              </Button> */}

              {/* Divider */}
              <Divider>sign in with E-mail</Divider>

              {/* Email Input */}
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="Email"
                rules={[
                  {
                    required: true,
                    message: 'Please input your email!',
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
