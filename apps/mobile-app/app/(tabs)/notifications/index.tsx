"use client"
import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"

// Components
import { Header } from "../../../components/Header"
import { NotificationItem } from "../../../components/NotificationItem"
import { useNotification } from "../../../context/NotificationContext"

export default function NotificationsScreen() {
  const router = useRouter()
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification()

  // Lấy thông báo khi component được mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Thông báo"
        onBackPress={() => router.back()}
        rightIcon="check-square"
        onRightPress={markAllAsRead}
      />

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#FF8C00" />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={{
                id: parseInt(notification.id) || 0,
                title: notification.title,
                message: notification.message,
                time: notification.time,
                read: notification.read,
                type: notification.type
              }}
              onPress={() => markAsRead(notification.assignmentId)}
              onDelete={() => deleteNotification(notification.assignmentId)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có thông báo</Text>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
})
