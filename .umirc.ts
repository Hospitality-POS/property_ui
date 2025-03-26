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
    // BASE_URL: 'http://localhost:5000',
    'process.env.COMMIT_HASH': process.env.COMMIT_HASH || '',
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  targets: {
    chrome: 80,
    firefox: 75,
    safari: 13,
    ios: 13,
    node: 12,
  },
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
      component: '@/pages/Login',
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
      name: 'User Mgt',
      path: '/user-management',
      icon: 'UserOutlined',
      component: './Users',
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: 'BarChartOutlined',
      component: './Reports',
    },
    {
      name: 'Account',
      path: '/delete-account',
      icon: 'UserOutlined',
      layout: false,
      component: './AccountDeletion',
    },
    {
      name: 'Terms',
      path: '/terms-privacy',
      layout: false,
      component: './Terms',
    },
    {
      path: '*',
      component: './404',
    },
  ],
  npmClient: 'yarn',
  tailwindcss: {},
});
