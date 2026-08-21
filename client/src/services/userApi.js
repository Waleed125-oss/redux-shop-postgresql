import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getProfileAPI = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API}/api/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

//UpdateProfileAPI

export const updateProfileAPI = async (userData) => {

  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API}/api/users/profile`,
    userData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};