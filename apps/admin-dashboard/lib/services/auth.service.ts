import api from '../axios';
import { Employee } from '@/types/prisma';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<Employee> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    // Vì không có token nên chỉ cần xóa thông tin user trong localStorage
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<Employee | null> {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
