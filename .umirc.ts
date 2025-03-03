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
    },

    {
      name: 'Products',
      path: '/Drivers',
      icon: 'ShopOutlined',
      component: './Drivers',
    },
    {
      name: 'Customers',
      path: '/Location',
      icon: 'UserOutlined',
      component: './Location',
    },
    {
      name: 'Leads',
      path: '/Leads',
      icon: 'UsergroupAddOutlined',
      component: './Location',
    },
    {
      name: 'Sales',
      path: '/Sales',
      icon: 'DollarOutlined',
      component: './Location',
    },
    {
      name: 'Valuations',
      path: '/Valuation',
      icon: 'CalculatorOutlined',
      component: './Location',
    },
    {
      name: 'Payments',
      path: '/Payments',
      icon: 'CreditCardOutlined',
      component: './Location',
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
