import React from 'react';
import {
  DashboardOutlined,
  LogoutOutlined,
  ShopOutlined,
  UserOutlined,
  PlusOutlined,
  HomeOutlined,
  UserAddOutlined,
  DollarOutlined,
  PhoneOutlined,
  TeamOutlined,
  CalculatorOutlined,
  BankOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { history, RunTimeLayoutConfig, useNavigate } from '@umijs/max';
import {
  Avatar,
  Breadcrumb,
  Dropdown,
  MenuProps,
  Space,
  Typography,
  Button,
  Tooltip,
  Menu,
} from 'antd';
import Loading from './loading';
import { getUserInfo } from './services/auth.api';
import logo from '/public/assets/images/icon.png';

// Non-authenticated paths that should not redirect to login
const PUBLIC_PATHS = ['/login', '/delete-account', '/terms-privacy'];

const checkIfUserIsValid = async () => {
  try {
    const userData = await getUserInfo();
    return userData;
  } catch (e) {
    localStorage.removeItem('property_token');
    return null;
  }
};

const handleLogout = () => {
  // Clear the token from localStorage
  localStorage.removeItem('property_token');

  // Redirect to login page
  history.push('/login');
};

export async function getInitialState(): Promise<any> {
  const currentPath = window.location.pathname;

  // Check if the current path is public (doesn't require authentication)
  const isPublicPath = PUBLIC_PATHS.some(path => currentPath === path);

  // For public paths, don't try to fetch user data or redirect
  if (isPublicPath) {
    return { currentUser: null, fetchUserInfo: getUserInfo };
  }

  // Get token only for protected routes
  let token = localStorage.getItem('property_token');

  // Protected routes logic
  if (token) {
    try {
      const userData = await checkIfUserIsValid();

      if (!userData) {
        history.push('/login');
        return { currentUser: null, fetchUserInfo: getUserInfo };
      }

      return { currentUser: userData, fetchUserInfo: getUserInfo };
    } catch (error) {
      history.push('/login');
      return { currentUser: null, fetchUserInfo: getUserInfo };
    }
  }

  // No token for protected routes - redirect to login
  history.push('/login');
  return { currentUser: null, fetchUserInfo: getUserInfo };
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  loading,
  setInitialState,
}) => {
  // Function to go to quick page with a specific form opened
  const goToQuickWithForm = (formType: string) => {
    // Get the current path to use as return URL
    const currentPath = window.location.pathname;
    // Navigate to quick form with returnUrl parameter
    history.push(`/quick?form=${formType}&returnUrl=${encodeURIComponent(currentPath)}`);
  };

  const queryClient = new QueryClient();

  const currentPath = window.location.pathname;
  const isPublicPath = PUBLIC_PATHS.some(path => currentPath === path);

  return {
    logo: `${logo}`,
    title: 'RPM System',
    layout: 'mix',
    colorPrimary: '#27C6C1',
    menu: {
      locale: false,
    },
    // Only show menu for authenticated paths
    menuRender: isPublicPath ? false : undefined,
    // Hide header on public paths
    headerRender: isPublicPath ? false : undefined,
    childrenRender: (children) => {
      if (loading) {
        return <Loading />;
      }

      // For public paths, render without PageContainer
      if (isPublicPath) {
        return (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
      }

      // For authenticated paths, render with PageContainer
      return (
        <QueryClientProvider client={queryClient}>
          <PageContainer
            header={{
              extra: [
                <Space key="headerActions" size="middle">
                  <Breadcrumb key="breadcrumb">
                    <Breadcrumb.Item>
                      <DashboardOutlined />
                      <span>Dashboard</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                      <ShopOutlined />
                      <span>Products</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                      <UserOutlined />
                      <span>Customers</span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </Space>
              ],
            }}
          >
            {children}
          </PageContainer>
        </QueryClientProvider>
      );
    },
    menuFooterRender: (props) => {
      if (props?.collapsed) return undefined;
      return (
        <div
          style={{
            textAlign: 'center',
            paddingBlockStart: 12,
          }}
        >
          <div>© {new Date().getFullYear()} Powered By ReliaTech Solutions</div>
        </div>
      );
    },
    avatarProps: {
      shape: 'circle',
      icon: <UserOutlined />,
      render: () => {
        const accountItems: MenuProps['items'] = [
          {
            key: '1',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => {
              history.push('/profile');
              setInitialState(null);
            },
          },
          {
            type: 'divider',
          },
          {
            key: '2',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: () => {
              handleLogout();
              setInitialState(null);
            },
          },
        ];

        // Custom menu component for larger, grouped dropdown
        const QuickCreateMenu = () => (
          <Menu
            onClick={(e) => {
              // Map the menu key back to the form type
              goToQuickWithForm(e.key);
            }}
            style={{ width: 220, padding: '8px 0' }}
          >
            <Menu.ItemGroup title="Properties" style={{ fontWeight: 'bold' }}>
              <Menu.Item key="property" icon={<HomeOutlined />} style={{ height: 40, lineHeight: '40px' }}>
                New Property
              </Menu.Item>
              <Menu.Item key="valuation" icon={<CalculatorOutlined />} style={{ height: 40, lineHeight: '40px' }}>
                New Valuation
              </Menu.Item>
            </Menu.ItemGroup>

            <Menu.Divider />

            <Menu.ItemGroup title="People" style={{ fontWeight: 'bold' }}>
              <Menu.Item key="user" icon={<UserOutlined />} style={{ height: 40, lineHeight: '40px' }}>
                New User
              </Menu.Item>
              <Menu.Item key="customer" icon={<TeamOutlined />} style={{ height: 40, lineHeight: '40px' }}>
                New Customer
              </Menu.Item>
              <Menu.Item key="lead" icon={<PhoneOutlined />} style={{ height: 40, lineHeight: '40px' }}>
                New Lead
              </Menu.Item>
            </Menu.ItemGroup>

            <Menu.Divider />

            <Menu.ItemGroup title="Finance" style={{ fontWeight: 'bold' }}>
              <Menu.Item key="sale" icon={<DollarOutlined />} style={{ height: 40, lineHeight: '40px' }}>
                New Sale
              </Menu.Item>
              <Menu.Item key="payment" icon={<BankOutlined />} style={{ height: 40, lineHeight: '40px' }}>
                Make Payment
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu>
        );

        return (
          <>
            <Space size="middle">
              {/* Quick Create Button */}
              <Dropdown
                dropdownRender={() => <QuickCreateMenu />}
                trigger={['click']}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    backgroundColor: '#27C6C1',
                    borderRadius: '4px',
                    marginRight: '8px'
                  }}
                >
                  Create
                </Button>
              </Dropdown>

              {/* User Account Dropdown */}
              <Dropdown menu={{ items: accountItems }} trigger={['click']}>
                <Space className="md:flex items-center">
                  {initialState?.avatar ? (
                    <Avatar src={initialState?.avatar} />
                  ) : (
                    <Avatar icon={<UserOutlined />} />
                  )}{' '}
                  <Typography>My Account</Typography>
                </Space>
              </Dropdown>
            </Space>
          </>
        );
      },
    },
    onPageChange: () => {
      // No redirects in page change handler
      return true;
    },
  };
};