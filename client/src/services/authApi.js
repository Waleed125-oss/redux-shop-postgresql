import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/auth";

export const loginAPI = async (userData) => {
  const response = await axios.post(`${API}/login`, userData);
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await axios.post(`${API}/register`, userData);
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await axios.post(
    `${API}/forgot-password`,
    { email }
  );

  return response.data;
};

export const resetPasswordAPI = async (token, password) => {
  const response = await axios.post(
    `${API}/reset-password/${token}`,
    { password }
  );

  return response.data;
};