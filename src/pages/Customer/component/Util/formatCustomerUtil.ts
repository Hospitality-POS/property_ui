import moment from 'moment';

// Format a date string to DD MMM YYYY (e.g. 12 Mar 2025)
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return moment(dateString).format('DD MMM YYYY');
  } catch (e) {
    return 'Invalid Date';
  }
};

// Format a date string to DD MMM YYYY, h:mm A (e.g. 12 Mar 2025, 2:30 PM)
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return moment(dateString).format('DD MMM YYYY, h:mm A');
  } catch (e) {
    return 'Invalid Date';
  }
};

// Format a date string as relative time (e.g. "2 hours ago")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = moment(dateString);
    const now = moment();

    if (now.diff(date, 'days') < 1) {
      return date.fromNow(); // e.g. "2 hours ago"
    } else if (now.diff(date, 'days') < 7) {
      return `${now.diff(date, 'days')} days ago`;
    } else {
      return formatDate(dateString);
    }
  } catch (e) {
    return 'Invalid Date';
  }
};

// Get initials from a name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Get a color based on a completion percentage
export const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#52c41a';
  if (percentage >= 40) return '#1890ff';
  return '#faad14';
};

// Get address string from address object
export const getAddress = (address) => {
  if (!address || typeof address !== 'object') return 'No address provided';

  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);

  return parts.join(', ') || 'No address details';
};

// Get status color for different contexts
export const getStatusColor = (status, context = 'default') => {
  // For purchases
  if (context === 'purchase') {
    if (status === 'completed') return 'success';
    if (status === 'cancelled') return 'error';
    if (status === 'pending') return 'warning';
    if (status === 'reservation') return 'purple';
    return 'default';
  }

  // For payment plans
  if (context === 'payment') {
    if (status === 'completed') return 'success';
    if (status === 'inactive') return 'error';
    if (status === 'pending') return 'warning';
    return 'default';
  }

  // Default fallback
  return 'default';
};
