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
        name="order-table"
        options={{
          title: 'Order Table'
        }}
      />
      <Stack.Screen
        name="notification"
        options={{
          title: 'Notification'
        }}
      />
      {/* Thêm các screens khác ở đây */}
    </Stack>
  )
}
