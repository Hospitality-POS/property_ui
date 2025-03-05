import { defineConfig } from "@umijs/max";

export default defineConfig({
  antd: {},
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
    title: 'Fleet Mgt System',
  },
  routes: [
    {
      path: '/',
      redirect: '/Dashboard',
    },
    {
      name: 'Login',
      path: '/login',
      layout: false,
      component: './Login',
    },
    {
      name: 'Dashboard',
      path: '/Dashboard',
      icon: 'DashboardOutlined',
      component: './Dashboard',
    },

    {
      name: 'Products',
      path: '/Product',
      icon: 'ShopOutlined',
      component: './Product',
    },
    {
      name: 'Customers',
      path: '/Customer',
      icon: 'UserOutlined',
      component: './Customer',
    },
    {
      name: 'Leads',
      path: '/Lead',
      icon: 'UsergroupAddOutlined',
      component: './Lead',
    },
    {
      name: 'Sales',
      path: '/Sales',
      icon: 'DollarOutlined',
      component: './Sales',
    },
    {
      name: 'Valuations',
      path: '/Valuation',
      icon: 'CalculatorOutlined',
      component: './Valuation',
    },
    {
      name: 'Payments',
      path: '/Payments',
      icon: 'CreditCardOutlined',
      component: './Payments',
    },
    {
      name: 'users',
      path: '/Vehicles',
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
