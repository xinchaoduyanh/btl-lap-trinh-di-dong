"use client"

import  React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"

// Define the shape of our context
type AuthContextType = {
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  userEmail: string | null
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
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
      Alert.alert("Error", "Please enter both email and password")
      return
    }

    setIsLoading(true)

    try {
      // This is where you would integrate your API
      // For now, we'll just simulate a successful login

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, any login succeeds
      await AsyncStorage.setItem("userToken", "dummy-auth-token")
      await AsyncStorage.setItem("userEmail", email)
      setUserEmail(email)
      setIsLoggedIn(true)
    } catch (error) {
      Alert.alert("Login Failed", (error as Error).message)
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
