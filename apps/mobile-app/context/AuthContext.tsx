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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      // Store user data
      await AsyncStorage.setItem("userToken", data.id) // Using id as token for now
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
      throw error // Re-throw to let the component handle navigation
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (fullName: string, email: string, password: string) => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      // This is where you would integrate your API
      // For now, we'll just simulate a successful registration

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      Alert.alert("Registration Successful", "Your account has been created successfully. Please login.")
    } catch (error) {
      Alert.alert("Registration Failed", (error as Error).message)
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
