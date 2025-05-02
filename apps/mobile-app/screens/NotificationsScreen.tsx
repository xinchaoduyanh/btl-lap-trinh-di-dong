"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"

const NotificationsScreen = ({ navigation }) => {
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

  const getIconName = (type) => {
    switch (type) {
      case "order":
        return "shopping-bag"
      case "schedule":
        return "calendar"
      case "table":
        return "grid"
      case "inventory":
        return "package"
      case "message":
        return "message-square"
      default:
        return "bell"
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "order":
        return "#4CAF50"
      case "schedule":
        return "#2196F3"
      case "table":
        return "#FF9800"
      case "inventory":
        return "#F44336"
      case "message":
        return "#9C27B0"
      default:
        return "#666"
    }
  }

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    Alert.alert("Success", "All notifications marked as read")
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Feather name="check-square" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.unreadNotification]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationIcon}>
                <View style={[styles.iconBackground, { backgroundColor: getIconColor(notification.type) + "20" }]}>
                  <Feather name={getIconName(notification.type)} size={20} color={getIconColor(notification.type)} />
                </View>
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNotification(notification.id)}>
                <Feather name="trash-2" size={18} color="#F44336" />
              </TouchableOpacity>
            </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  notificationIcon: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    padding: 8,
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

export default NotificationsScreen
