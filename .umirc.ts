import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {
    theme: {
      'primary-color': '#1890ff',
    },
  },
  define: {
    BASE_URL: 'http://localhost:5000',
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'en-US',
    antd: true,
    title: false,
  },
  layout: {
    title: 'RPM System',
  },
  routes: [
    {
      name: 'Login',
      path: '/login',
      layout: false,
      component: '@/components/Layout',
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'DashboardOutlined',
      component: './Dashboard',
    },
    {
      name: 'Portfolio',
      path: '/products',
      icon: 'ShopOutlined',
      component: './Product',
    },
    {
      name: 'Leads',
      path: '/leads',
      icon: 'UsergroupAddOutlined',
      component: './Lead',
    },
    {
      name: 'Customers',
      path: '/customer',
      icon: 'UserOutlined',
      component: './Customer',
    },
    {
      name: 'Sales',
      path: '/sales',
      icon: 'DollarOutlined',
      component: './Sales',
    },
    {
      name: 'Valuations',
      path: '/valuation',
      icon: 'CalculatorOutlined',
      component: './Valuation',
    },
    {
      name: 'Payments',
      path: '/payments',
      icon: 'CreditCardOutlined',
      component: './Payments',
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: 'UserOutlined',
      component: './Vehicles',
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: 'SettingOutlined',
      routes: [
        {
          name: 'Property Types',
          path: '/settings/reports',
          component: './Vehicles',
          icon: 'HomeOutlined',
          hideInMenu: true,
        },
        {
          name: 'Counties',
          path: '/settings/reports',
          component: './Vehicles',
          icon: 'GlobalOutlined',
          hideInMenu: true,
        },
        {
          name: 'Roles',
          path: '/settings/reports',
          component: './Vehicles',
          icon: 'TeamOutlined',
          hideInMenu: true,
        },
        {
          name: 'Doc Types',
          path: '/settings/reports',
          component: './Vehicles',
          icon: 'FileOutlined',
          hideInMenu: true,
        },
        {
          name: 'Valuation Methodologies',
          path: '/settings/reports',
          component: './Vehicles',
          icon: 'CalculatorOutlined',
          hideInMenu: true,
        },
        {
          name: 'Status',
          path: '/settings/reports',
          component: './Vehicles',
          icon: 'CheckCircleOutlined',
          hideInMenu: true,
        },
      ],
    },
    {
      name: 'User Management',
      path: '/user-management',
      icon: 'UserOutlined',
      component: './Users',
    },
    {
      path: '*',
      component: './404',
    },
  ],
  npmClient: 'yarn',
  tailwindcss: {},
});
