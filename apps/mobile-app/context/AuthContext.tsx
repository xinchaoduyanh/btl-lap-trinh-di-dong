"use client"

import React, { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"
import { config } from '../config/env'

// Define the shape of our context
type AuthContextType = {
  isLoggedIn: boolean
  isLoading: boolean
  user: {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
  } | null
  login: (email: string, password: string) => Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
  }>
  register: (fullName: string, email: string, password: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  userEmail: string | null
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  login: async () => ({
    id: "",
    email: "",
    name: "",
    role: "",
    isActive: false
  }),
  register: async () => {},
  logout: async () => {},
  userEmail: null,
  sendOtp: async () => {},
  verifyOtp: async () => {},
})

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [user, setUser] = useState<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
  } | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken")
        const email = await AsyncStorage.getItem("userEmail")
        const userData = await AsyncStorage.getItem("user")
        setIsLoggedIn(userToken !== null)
        setUserEmail(email)
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.log("Error checking login status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkLoginStatus()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Vui lòng nhập email và mật khẩu")
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || 'Đăng nhập thất bại'
        } catch {
          errorMessage = errorText || 'Đăng nhập thất bại'
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Store user data
      await AsyncStorage.setItem("userToken", data.id)
      await AsyncStorage.setItem("userEmail", data.email)
      const userData = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: data.isActive
      }
      await AsyncStorage.setItem("user", JSON.stringify(userData))

      setUserEmail(data.email)
      setUser(userData)
      setIsLoggedIn(true)

      return userData
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Đăng nhập thất bại')
      }
      throw new Error('Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (fullName: string, email: string, password: string, otp: string) => {
    if (!fullName || !email || !password || !otp) {
      throw new Error("Vui lòng điền đầy đủ thông tin")
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${config.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          code: otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data: data
          }
        }
      }

      return data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Đăng ký thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken")
      await AsyncStorage.removeItem("userEmail")
      await AsyncStorage.removeItem("user")
      setIsLoggedIn(false)
      setUserEmail(null)
      setUser(null)
    } catch (error) {
      Alert.alert("Error", "Failed to log out")
    }
  }

  const sendOtp = async (email: string) => {
    if (!email) throw new Error("Vui lòng nhập email");
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gửi OTP thất bại");
    } catch (error: any) {
      throw new Error(error.message || "Gửi OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    if (!email || !otp) throw new Error("Vui lòng nhập email và OTP");
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP không hợp lệ");
    } catch (error: any) {
      throw new Error(error.message || "OTP không hợp lệ");
    } finally {
      setIsLoading(false);
    }
  };

  // Value object that will be passed to consumers
  const value = {
    isLoggedIn,
    isLoading,
    user,
    login,
    register,
    logout,
    userEmail,
    sendOtp,
    verifyOtp,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
