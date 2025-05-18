"use client"
import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import axios from "axios"

// Components
import { Header } from "../../../components/Header"
import { NotificationItem } from "../../../components/NotificationItem"

// Định nghĩa API URL
const API_URL = "http://your-backend-url/api" // Thay thế bằng URL thực tế của backend

export default function NotificationsScreen() {
  const router = useRouter()

  // Mock data for notifications
  const initialNotifications = [
    {
      id: 1,
      title: "New Order",
      message: "Table 5 has placed a new order.",
      time: "10 minutes ago",
      read: false,
      type: "order",
    },
    {
      id: 2,
      title: "Schedule Update",
      message: "Your shift for tomorrow has been updated.",
      time: "1 hour ago",
      read: false,
      type: "schedule",
    },
    {
      id: 3,
      title: "Table Ready",
      message: "Table 3 is ready for service.",
      time: "2 hours ago",
      read: true,
      type: "table",
    },
    {
      id: 4,
      title: "Inventory Alert",
      message: "Wine stock is running low.",
      time: "3 hours ago",
      read: true,
      type: "inventory",
    },
    {
      id: 5,
      title: "New Message",
      message: "You have a new message from the manager.",
      time: "1 day ago",
      read: true,
      type: "message",
    },
  ]

  const [notifications, setNotifications] = useState(initialNotifications)

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    Alert.alert("Success", "All notifications marked as read")
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notifications"
        onBackPress={() => router.back()}
        rightIcon="check-square"
        onRightPress={markAllAsRead}
      />

      <ScrollView style={styles.content}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => markAsRead(notification.id)}
              onDelete={() => deleteNotification(notification.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
})
