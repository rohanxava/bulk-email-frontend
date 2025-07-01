// services/user.js
import api from './api';

export const register = async (formData) => {
const res = await api.post('/auth/register', formData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  console.log("API Response:", res.data);
  return res.data; 
};
export const verifyOtp = async (data) => {
  const res = await api.post('/auth/verify-otp', data);
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await api.post('/auth/resend-otp', { email });
  return res.data;
};