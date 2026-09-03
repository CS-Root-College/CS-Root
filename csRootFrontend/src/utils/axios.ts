import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    const message =
      response.data?.message ||
      response.data?.data?.message;

    if (message) {
      toast.success(message);
    }

    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong";

    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;