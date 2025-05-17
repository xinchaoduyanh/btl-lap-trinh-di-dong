import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { authService, LoginCredentials } from "@/lib/services/auth.service";
import { getApiErrorMessage } from "@/lib/error-handler";
import { Employee } from "@/types";

export const useAuth = () => {
  const { login: contextLogin, logout, user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setLoading(true);
    try {
      const user = await authService.login(credentials);
      if (user.role !== "ADMIN") {
        throw new Error("Bạn không có quyền truy cập vào trang admin");
      }
      contextLogin(user); // cập nhật context + localStorage + redirect
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    user,
    loading,
    error,
  };
};
