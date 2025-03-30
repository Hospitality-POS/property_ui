import React from 'react';
import { useLocation, useModel } from 'umi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/pages/Login';
import AccountPage from '@/pages/Account';

const queryClient = new QueryClient();

const Layout = () => {
  const location = useLocation();
  const { pathname } = location;


  return (
    <QueryClientProvider client={queryClient}>
      <div className="auth-layout">
        {/* You can add shared layout elements here, like logo, background, etc. */}
        <div className="auth-container">
          {pathname === '/login' && <LoginPage />}
          {pathname === '/delete-account' && <AccountPage />}
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default Layout;