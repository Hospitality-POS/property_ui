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
      name: 'Products',
      path: '/products',
      icon: 'ShopOutlined',
      component: './Product',
    },
    {
      name: 'Customers',
      path: '/customer',
      icon: 'UserOutlined',
      component: './Customer',
    },
    {
      name: 'Leads',
      path: '/leads',
      icon: 'UsergroupAddOutlined',
      component: './Lead',
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
      name: 'Access Control',
      path: '/access-control',
      icon: 'UserOutlined',
      component: './Vehicles',
    },
    {
      path: '*',
      component: './404',
    },
  ],

  npmClient: 'yarn',
  tailwindcss: {},
});
