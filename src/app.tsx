// 运行时配置

import {
  DashboardOutlined,
  LogoutOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RunTimeLayoutConfig } from '@umijs/max';
import {
  Avatar,
  Breadcrumb,
  Dropdown,
  MenuProps,
  Space,
  Typography,
} from 'antd';
import { Provider } from 'react-redux';
import { store } from '@/store';
import Loading from './loading';
import logo from '/public/assets/images/download.png';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<any> {
  return { name: 'Real Estate Management Portal' };
}

// Add rootContainer to wrap the entire app with Redux Provider
export function rootContainer(container) {
  return <Provider store={store}>{container}</Provider>;
}

export const layout: RunTimeLayoutConfig = ({ initialState, loading }) => {
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
        // const navigate = useNavigate();
        const items: MenuProps['items'] = [
          {
            key: '1',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => '',
          },
          {
            type: 'divider',
          },
          {
            key: '2',
            label: 'Logout',
            icon: <LogoutOutlined />,
            // onClick: () => navigate('/login'),
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
                <Typography>My Account</Typography>
              </Space>
            </Dropdown>
          </>
        );
      },
    },
  };
};