export const getToken = () => {
  try {
    // Get the raw token from localStorage
    const rawToken = localStorage.getItem('property_token');

    // Check if token exists and is properly formatted
    if (!rawToken) {
      return { token: null };
    }

    // Validate the token's basic structure before returning
    // A JWT should have 3 parts separated by dots
    if (typeof rawToken === 'string' && rawToken.split('.').length === 3) {
      return { token: rawToken };
    } else {
      // If token is malformed, clear it and return null
      localStorage.removeItem('property_token');
      return { token: null };
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return { token: null };
  }
};
