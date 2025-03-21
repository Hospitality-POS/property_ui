// 运行时配置
import {
  BellOutlined,
  DashboardOutlined,
  DownOutlined,
  LockOutlined,
  LogoutOutlined,
  MacCommandOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  ShopOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { history, RunTimeLayoutConfig } from '@umijs/max';
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Flex,
  Menu,
  MenuProps,
  Space,
  Typography,
} from 'antd';
import { RPM_THEME_STORAGE_KEY } from './constants';
import Loading from './loading';
import AddEditPropertyModal from './pages/Property/components/modals/AddEditPropertyModal';
import AddEditValuationModal from './pages/Valuation/components/modals/AddEditValuationModal';
import { getUserInfo } from './services/auth.api';
import { toggleTheme } from './utils/toggleTheme';
import logo from '/public/assets/images/icon.png';

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
  try {
    let token = localStorage.getItem('property_token');
    if (token) {
      const userData = await checkIfUserIsValid();

      if (!userData) {
        history.push('/login');
        return { currentUser: null, fetchUserInfo: getUserInfo };
      }

      const savedTheme = localStorage.getItem(RPM_THEME_STORAGE_KEY) || 'light';

      return {
        currentUser: userData,
        fetchUserInfo: getUserInfo,
        theme: savedTheme,
      };
    }
  } catch (error) {
    console.log('??????????>>>>>error', error);
  }
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  loading,
  setInitialState,
  refresh,
}) => {
  const queryClient = new QueryClient();
  return {
    logo: `${logo}`,
    title: 'RPM System',
    layout: 'mix',
    colorPrimary: '#27C6C1',
    navTheme: initialState?.theme || 'light',
    menu: {
      locale: false,
    },
    childrenRender: (children) => {
      if (loading) {
        return <Loading />;
      }
      return (
        <QueryClientProvider client={queryClient}>
          {history.location.pathname === '/login' ? (
            <>{children}</>
          ) : (
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
                  </Space>,
                ],
              }}
            >
              {children}
              <Space
                key="footerActions"
                size="middle"
                className="flex items-center justify-center gap-4 align-center mt-4"
                aria-label="User Actions"
              >
                <Typography.Text
                  key="footer"
                  className="text-center text-gray-500 text-xs mt-4"
                >
                  © {new Date().getFullYear()} Powered by ReliaTech solutions
                </Typography.Text>
              </Space>
            </PageContainer>
          )}
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
          <div>© Build: {process.env.COMMIT_HASH}</div>
        </div>
      );
    },
    avatarProps: {
      shape: 'circle',
      icon: <UserOutlined />,
      onClick: () => refresh(),
      render: () => {
        const accountItems: MenuProps['items'] = [
          {
            key: '1',
            label: 'My Account',
            icon: <UserOutlined />,
            onClick: () => {
              history.push('/profile');
            },
          },
          { key: '2', label: 'Settings', icon: <SettingOutlined /> },
          { key: '3', label: 'Support', icon: <QuestionCircleOutlined /> },
          {
            key: '4',
            label: 'Terms & Privacy',
            icon: <SecurityScanOutlined />,
            onClick: () => history.push('/terms-privacy'),
          },
          {
            type: 'divider',
          },
          {
            key: '5',
            label: `${
              initialState?.theme === 'realDark' ? 'Light' : 'Dark'
            } Mode`,
            icon:
              initialState?.theme === 'realDark' ? (
                <SunOutlined />
              ) : (
                <MoonOutlined />
              ),
            onClick: () => toggleTheme({ initialState, setInitialState }),
          },
          { key: '6', label: 'Lock screen', icon: <LockOutlined /> },
          {
            key: '7',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
              handleLogout();
              setInitialState(null);
            },
          },
        ];

        // Custom menu component for larger, grouped dropdown
        // const QuickCreateMenu = () => (
        //   <Menu>
        //     <Menu.ItemGroup title="Properties" style={{ fontWeight: 'bold' }}>
        //       <Menu.Item
        //         key="property"
        //         icon={<HomeOutlined />}
        //         style={{ height: 40, lineHeight: '40px' }}
        //       >
        //         New Property
        //       </Menu.Item>
        //       <Menu.Item
        //         key="valuation"
        //         icon={<CalculatorOutlined />}
        //         style={{ height: 40, lineHeight: '40px' }}
        //       >
        //         New Valuation
        //       </Menu.Item>
        //     </Menu.ItemGroup>

        //     <Menu.Divider />

        //     <Menu.ItemGroup title="People" style={{ fontWeight: 'bold' }}>
        //       <Menu.Item
        //         key="user"
        //         icon={<UserOutlined />}
        //         style={{ height: 40, lineHeight: '40px' }}
        //       >
        //         New User
        //       </Menu.Item>
        //       <Menu.Item
        //         key="customer"
        //         icon={<TeamOutlined />}
        //         style={{ height: 40, lineHeight: '40px' }}
        //       >
        //         New Customer
        //       </Menu.Item>
        //       <Menu.Item
        //         key="lead"
        //         icon={<PhoneOutlined />}
        //         style={{ height: 40, lineHeight: '40px' }}
        //       >
        //         New Lead
        //       </Menu.Item>
        //     </Menu.ItemGroup>

        //     <Menu.Divider />

        //     <Menu.ItemGroup title="Finance" style={{ fontWeight: 'bold' }}>
        //       <Menu.Item
        //         key="sale"
        //         icon={<DollarOutlined />}
        //         style={{ height: 40, lineHeight: '40px' }}
        //       >
        //         New Sale
        //       </Menu.Item>
        //       <Menu.Item
        //         key="payment"
        //         icon={<BankOutlined />}
        //         style={{ height: 40, lineHeight: '40px' }}
        //       >
        //         Make Payment
        //       </Menu.Item>
        //     </Menu.ItemGroup>
        //   </Menu>
        // );

        const NotificationMenu = () => (
          <Menu
            onClick={() => {
              //  handle notification click
            }}
            style={{ width: 220, padding: '8px 0' }}
          >
            <Menu.ItemGroup
              title="Notifications"
              style={{ fontWeight: 'bold' }}
            >
              <Menu.Item
                key="notification"
                icon={<BellOutlined />}
                style={{ height: 40, lineHeight: '40px' }}
              >
                Notifications 1
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu>
        );

        const QuickCreateMenu = () => (
          <Menu>
            <Menu.ItemGroup title="Quick Access" style={{ fontWeight: 'bold' }}>
              <Menu.Item key="property-create">
                <AddEditPropertyModal quickMode={true} />
              </Menu.Item>

              <Menu.Item key="valuation-create">
                <AddEditValuationModal quickMode={true} />
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu>
        );

        return (
          <Flex
            gap={4}
            justify="space-around"
            // className="flex items-center justify-center gap-4 align-center"
            aria-label="User Actions"
          >
            {/* notification dropdown */}
            <Dropdown
              dropdownRender={() => <NotificationMenu />}
              trigger={['hover']}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              overlayClassName="notification-dropdown"
            >
              <Button
                aria-label="Notification"
                className=" p-2 transition-colors "
                title="Notification"
              >
                <BellOutlined
                  className=" hover:text-gray-800"
                  style={{
                    fontSize: '20px',
                    animation: 'bellShake 1s infinite',
                  }}
                />
                Notifications
              </Button>
            </Dropdown>

            {/* Quick Create Dropdown */}
            <Dropdown
              dropdownRender={() => <QuickCreateMenu />}
              trigger={['hover']}
              placement="bottomCenter"
              arrow={{ pointAtCenter: true }}
              overlayClassName="quick-create-dropdown"
            >
              <Button
                aria-label="Quick Create"
                className="p-2 transition-colors"
                title="Quick Access Links"
              >
                <MacCommandOutlined
                  className=" hover:text-gray-800"
                  style={{ fontSize: '20px' }}
                />
                Quick Access
                <DownOutlined />
              </Button>
            </Dropdown>

            {/* User Account Dropdown */}
            <Dropdown
              menu={{ items: accountItems }}
              trigger={['hover']}
              overlayClassName="user-account-dropdown"
              placement="bottomRight"
            >
              <span
                aria-label="User Account"
                title="User Account"
                className="flex items-center cursor-pointer rounded-md p-2 gap-2 transition-colors"
              >
                {initialState?.avatar ? (
                  <Avatar
                    src={initialState.avatar}
                    alt="User Avatar"
                    className="ring-2 ring-blue-50 hover:ring-blue-100"
                    size="default"
                  />
                ) : (
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-primary-50 text-primary-600"
                    size="default"
                  />
                )}

                <Flex gap={0} vertical className="min-w-0">
                  {initialState?.currentUser?.role && (
                    <Typography.Text
                      className="hidden md:block text-xs text-gray-500 font-normal"
                      ellipsis={{ tooltip: initialState?.currentUser?.role }}
                    >
                      {initialState?.currentUser?.role}
                    </Typography.Text>
                  )}
                  <Typography.Text
                    className="hidden md:block text-sm font-medium"
                    ellipsis={{ tooltip: initialState?.currentUser?.username }}
                    strong
                  >
                    {initialState?.currentUser?.username || 'My Account'}
                  </Typography.Text>
                </Flex>
              </span>
            </Dropdown>
          </Flex>
        );
      },
    },
    // onPageChange: () => {
    //   return true;
    // },
  };
};
