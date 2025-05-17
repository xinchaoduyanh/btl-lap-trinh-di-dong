import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("API BASE URL:", process.env.NEXT_PUBLIC_API_URL);

// Request interceptor (không cần xử lý token nữa)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor (có thể giữ lại để xử lý lỗi chung)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu muốn xử lý lỗi 401 thì giữ lại, không thì có thể xoá luôn
    return Promise.reject(error);
  }
);

export default api;
