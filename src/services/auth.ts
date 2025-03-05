// src/services/auth.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { message, notification } from "antd";
import axiosInstance from "./request";

// Define BASE_URL - make sure this is properly defined in your environment

interface UserDetails {
    username: string;
    password: string;
}

interface UserPasswordDetails {
    password: string;
    username: string;
}

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (_userDetails: UserPasswordDetails, { rejectWithValue }) => {
        try {
            console.log('base url', BASE_URL);

            const response = await axiosInstance.post(`${BASE_URL}/users/login`, _userDetails);
            localStorage.setItem('user', JSON.stringify(response.data));
            message.success('Login successful');
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            notification.error({ message: errorMessage });
            return rejectWithValue(errorMessage);
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            localStorage.removeItem('user');
            message.success('Logout successful');
            return null;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAllUsers = createAsyncThunk(
    "user/fetchAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/all`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || error.toString());
        }
    }
);

export const createUser = createAsyncThunk(
    "user/createUser",
    async (_userDetails: UserDetails, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/register`, _userDetails);
            dispatch(fetchAllUsers());
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create user';
            notification.error({ message: errorMessage });
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteUser = createAsyncThunk(
    "user/deleteUser",
    async (userId: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/${userId}`);
            dispatch(fetchAllUsers());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || error.toString());
        }
    }
);

export const fetchUserById = createAsyncThunk(
    "user/fetchUserById",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/${userId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || error.toString());
        }
    }
);

export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (userData: any, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/${userData._id}`, userData);
            dispatch(fetchAllUsers());
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update user';
            notification.error({ message: errorMessage });
            return rejectWithValue(errorMessage);
        }
    }
);