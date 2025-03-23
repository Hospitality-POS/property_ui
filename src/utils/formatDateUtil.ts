const formatDate = (dateString?: string) => {
  return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
};

export default formatDate;
