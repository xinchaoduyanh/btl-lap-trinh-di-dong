import { Stack } from "expo-router"
import React from "react"

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="home"
        options={{
          title: 'Trang chủ'
        }}
      />
      <Stack.Screen
        name="check-in-out"
        options={{
          title: 'Check In/Out'
        }}
      />
      <Stack.Screen
        name="order-management"
        options={{
          title: 'Order Management'
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications'
        }}
      />
      <Stack.Screen
        name="table-management"
        options={{
          title: 'Table Management'
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile'
        }}
      />
      {/* Thêm các screens khác ở đây */}
    </Stack>
  )
}
