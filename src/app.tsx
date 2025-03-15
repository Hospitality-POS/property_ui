// 运行时配置
import {
  DashboardOutlined,
  LogoutOutlined,
  ShopOutlined,
  UserOutlined,
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
} from 'antd';
import Loading from './loading';
import { getUserInfo } from './services/auth.api';
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
  let token = localStorage.getItem('property_token');
  if (token) {
    const userData = await checkIfUserIsValid();

    if (!userData) {
      history.push('/login');
      return { currentUser: null, fetchUserInfo: getUserInfo };
    }

    return { currentUser: userData, fetchUserInfo: getUserInfo };
  }
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  loading,
  setInitialState,
}) => {
  const queryClient = new QueryClient();
  return {
    logo: `${logo}`,
    title: 'RPM System',
    layout: 'mix',
    colorPrimary: '#27C6C1',
    // navTheme: 'realDark',
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
              // style={{ backgroundColor: 'white' }}
              header={{
                extra: [
                  <Breadcrumb key="1">
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
                  </Breadcrumb>,
                ],
              }}
            >
              {children}
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
          <div>© {new Date().getFullYear()} Powered By ReliaTech Solutions</div>
        </div>
      );
    },
    avatarProps: {
      // src: logo,
      shape: 'circle',
      icon: <UserOutlined />,
      render: () => {

        const items: MenuProps['items'] = [
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
        return (
          <>
            <Dropdown menu={{ items }} trigger={['click']}>
              <Space className="md:flex items-center">
                {initialState?.avatar ? (
                  <Avatar src={initialState?.avatar} />
                ) : (
                  <Avatar icon={<UserOutlined />} />
                )}{' '}
                {/* <Typography>{initialState?.currentUser?.name}</Typography> */}
                <Typography>My Account</Typography>
              </Space>
            </Dropdown>
          </>
        );
      },
    },
    onPageChange: () => {


      return true;
    },
  };
};
