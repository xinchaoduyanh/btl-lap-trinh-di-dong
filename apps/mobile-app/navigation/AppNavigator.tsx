"use client"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"



// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen"
import RegisterScreen from "../screens/auth/RegisterScreen"

// App Screens
import HomeScreen from "../screens/home/HomeScreen"
import CheckInOutScreen from "../screens/features/CheckInOutScreen"
import OrderManagementScreen from "../screens/features/OrderManagementScreen"
import TableManagementScreen from "../screens/features/TableManagementScreen"
import NotificationsScreen from "../screens/features/NotificationsScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"

// Context
import { useAuth } from "../context/AuthContext"

// Types
import type { RootStackParamList } from "./types"

// Create stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>()

const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    // You could return a loading screen here
    return null
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CheckInOut" component={CheckInOutScreen} />
          <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
          <Stack.Screen name="TableManagement" component={TableManagementScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default AppNavigator
