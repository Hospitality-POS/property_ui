import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {
    theme: {
      'primary-color': '#1890ff',
    },
  },
  esbuildMinifyIIFE: true,
  define: {
    BASE_URL: 'https://api.property.reliatech.co.ke',
    //BASE_URL: 'http://localhost:5000',
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
      path: '/',
      redirect: '/dashboard',
    },
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
      path: '/property',
      icon: 'ShopOutlined',
      component: './Property',
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
      name: 'Profile',
      path: '/profile',
      icon: 'UserOutlined',
      hideInMenu: true,
      component: './Profile',
    },
    {
      name: 'Quick Access',
      path: '/quick',
      icon: 'UserOutlined',
      hideInMenu: true,
      component: './Quick',
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

    // {
    //   name: 'Settings',
    //   path: '/settings',
    //   icon: 'SettingOutlined',
    //   routes: [
    //     {
    //       name: 'Property Types',
    //       path: '/settings/reports',
    //       component: './Vehicles',
    //       icon: 'HomeOutlined',
    //       hideInMenu: false,
    //     },
    //     {
    //       name: 'Counties',
    //       path: '/settings/reports',
    //       component: './Vehicles',
    //       icon: 'GlobalOutlined',
    //       hideInMenu: true,
    //     },
    //     {
    //       name: 'Roles',
    //       path: '/settings/reports',
    //       component: './Vehicles',
    //       icon: 'TeamOutlined',
    //       hideInMenu: true,
    //     },
    //     {
    //       name: 'Doc Types',
    //       path: '/settings/reports',
    //       component: './Vehicles',
    //       icon: 'FileOutlined',
    //       hideInMenu: true,
    //     },
    //     {
    //       name: 'Valuation Methodologies',
    //       path: '/settings/reports',
    //       component: './Vehicles',
    //       icon: 'CalculatorOutlined',
    //       hideInMenu: true,
    //     },
    //     {
    //       name: 'Status',
    //       path: '/settings/reports',
    //       component: './Vehicles',
    //       icon: 'CheckCircleOutlined',
    //       hideInMenu: true,
    //     },
    //   ],
    // },
    {
      name: 'Reports',
      path: '/reports',
      icon: 'BarChartOutlined',
      component: './Reports',
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
