import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/pages/Login';

// Create a client
const queryClient = new QueryClient();

export const Layout = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <LoginPage />
        </QueryClientProvider>
    );
};