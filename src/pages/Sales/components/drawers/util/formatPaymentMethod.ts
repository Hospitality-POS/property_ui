const formatPaymentMethod = (method?: string) => {
  if (!method) return 'N/A';
  return method
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default formatPaymentMethod;
