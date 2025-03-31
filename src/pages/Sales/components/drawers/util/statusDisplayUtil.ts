// Helper functions
const getStatusDisplay = (status?: string) => {
  if (!status) return { text: 'Unknown', color: 'default' };

  const statusMap = {
    reservation: { text: 'Reserved', color: 'orange' },
    agreement: { text: 'Agreement', color: 'blue' },
    processing: { text: 'Processing', color: 'cyan' },
    completed: { text: 'Completed', color: 'green' },
    cancelled: { text: 'Cancelled', color: 'red' },
  };

  const statusInfo = statusMap[status.toLowerCase()] || {
    text: status,
    color: 'default',
  };
  return statusInfo;
};

export default getStatusDisplay;
