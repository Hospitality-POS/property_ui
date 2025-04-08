import axios from 'axios';
import axiosInstance, { resetTokenPromise, getRequest, postRequest, putRequest, deleteRequest } from './request';

// DO NOT get token at module level as this only runs once on import

export const loginUser = async (
  username: string,
  password: string,
  companyCode: string,
) => {
  try {
    // For login, use vanilla axios without token
    const response = await axios.post(`${BASE_URL}/users/login`, {
      username,
      password,
      companyCode,
    });

    if (response.data.tenant) {
      localStorage.setItem('companyCode', response.data.tenant.tenant_code);
    }

    // Store the token
    localStorage.setItem('property_token', response.data.token);

    // IMPORTANT: Reset the token promise to force a reload of the new token
    resetTokenPromise();

    // Trigger an immediate lightweight API call to initialize the token
    // This helps ensure subsequent navigation has a working token
    try {
      // A simple call to get user info - don't await to avoid blocking login
      setTimeout(async () => {
        try {
          await getRequest(`${BASE_URL}/users/user-info`);
        } catch (e) {
          // Ignore errors during this initialization call
        }
      }, 100);
    } catch (e) {
      // Ignore any error from this call
    }

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const registerUser = async (userData: any) => {
  try {
    // Use the axiosInstance's postRequest which handles token automatically
    const response = await postRequest(`${BASE_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    // Use the axiosInstance's getRequest which handles token automatically
    const response = await getRequest(`${BASE_URL}/users/user-info`);
    return response.data?.data || null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchAllUsers = async () => {
  try {
    // Use the axiosInstance's getRequest which handles token automatically
    const response = await getRequest(`${BASE_URL}/users`);
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: any) => {
  try {
    // Use the axiosInstance's putRequest which handles token automatically
    const response = await putRequest(`${BASE_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    // Use the axiosInstance's deleteRequest which handles token automatically
    const response = await deleteRequest(`${BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Initiates a password reset for a user by their email
 * 
 * @param {string} email - The email of the user who needs to reset their password
 * @returns {Promise<any>} Response from the API
 */
export const resetPassword = async (email: string) => {
  try {
    // Use the axiosInstance's postRequest which handles token automatically
    const response = await postRequest(
      `${BASE_URL}/users/reset-password`,
      { email }
    );
    return response.data;
  } catch (error) {
    console.log('Reset password error:', error);
    throw error;
  }
};

/**
 * Request OTP for account deletion
 * 
 * @param {string} companyCode - The company code
 * @param {string} email - The email address
 * @returns {Promise<any>} Response from the API
 */
export const requestOTP = async (companyCode: string, email: string) => {
  try {
    const response = await postRequest(
      `${BASE_URL}/users/send-otp`,
      { companyCode, email, purpose: 'account-deletion' }
    );
    return response.data;
  } catch (error) {
    console.log('Request OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP for account deletion
 * 
 * @param {string} companyCode - The company code
 * @param {string} email - The email address
 * @param {string} otpCode - The 4-digit OTP code
 * @returns {Promise<any>} Response from the API
 */
export const verifyOTP = async (companyCode: string, email: string, otpCode: string) => {
  try {
    const response = await postRequest(
      `${BASE_URL}/users/verify-otp`,
      { companyCode, email, otpCode, purpose: 'account-deletion' }
    );
    return response.data;
  } catch (error) {
    console.log('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Delete user account
 * 
 * @param {string} companyCode - The company code
 * @param {string} email - The email address
 * @returns {Promise<any>} Response from the API
 */
export const deleteAccount = async (companyCode: string, email: string) => {
  try {
    // Use the axiosInstance's deleteRequest which handles token automatically
    const response = await deleteRequest(
      `${BASE_URL}/users/delete-account`,
      { data: { companyCode, email } }
    );
    return response.data;
  } catch (error) {
    console.log('Delete account error:', error);
    throw error;
  }
};

// Function to manually refresh authentication state
// Can be called from components if needed
export const refreshAuthState = () => {
  resetTokenPromise();
};