export const getToken = () => {
  const tokenStr = localStorage.getItem('property_token');
  return { token: tokenStr || '' };
};
