"use client"

import React, { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"
import { config } from '../config/env'

// Define the shape of our context
type AuthContextType = {
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
  }>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  userEmail: string | null
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
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
})

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken")
        const email = await AsyncStorage.getItem("userEmail")
        setIsLoggedIn(userToken !== null)
        setUserEmail(email)
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
      await AsyncStorage.setItem("user", JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: data.isActive
      }))

      setUserEmail(data.email)
      setIsLoggedIn(true)

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: data.isActive
      }
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
  const register = async (fullName: string, email: string, password: string) => {
    if (!fullName || !email || !password) {
      throw new Error("Vui lòng điền đầy đủ thông tin")
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${config.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fullName, email, password }),
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
      setIsLoggedIn(false)
      setUserEmail(null)
    } catch (error) {
      Alert.alert("Error", "Failed to log out")
    }
  }

  // Value object that will be passed to consumers
  const value = {
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    userEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
