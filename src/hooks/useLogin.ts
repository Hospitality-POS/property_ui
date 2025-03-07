import { loginUser } from '@/services/auth.api';
import { useMutation } from '@tanstack/react-query';
import { history, useModel } from '@umijs/max';
import { message } from 'antd';

export const useLogin = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const loginMutation = useMutation({
    mutationFn: async (values: {
      username: string;
      password: string;
      companyCode: string;
    }) => await loginUser(values.username, values.password, values.companyCode),

    onSuccess: async (data) => {
      localStorage.setItem('property_token', JSON.stringify(data.token));

      const currentUser = await initialState?.fetchUserInfo();

      await setInitialState({
        ...initialState,
        currentUser,
      });

      message.success('Login successful! Redirecting...');
      history.push('/dashboard');
    },

    onError: (error: any) => {
      if (error.response?.status === 401) {
        message.error('Invalid username or password');
      } else if (error.response?.status === 403) {
        message.error('Invalid company code');
      } else {
        message.error('Login failed. Please try again later.');
      }
    },
  });

  return {
    loginMutation,
    handleLogin: async (values: {
      username: string;
      password: string;
      companyCode: string;
    }) => {
      try {
        await loginMutation.mutateAsync(values);
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
  };
};
