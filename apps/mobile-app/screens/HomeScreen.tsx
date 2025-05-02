"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"

const HomeScreen = ({ navigation }) => {
  const [employeeInfo, setEmployeeInfo] = useState({
    name: "John Doe",
    position: "Waiter",
    id: "EMP001",
    department: "Service",
    joinDate: "01/01/2023",
  })

  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    // This is where you would fetch employee data from API
    // For now, we'll use mock data

    // Simulate API call to get employee info
    const fetchEmployeeInfo = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll just use the mock data
      } catch (error) {
        console.error("Error fetching employee info:", error)
      }
    }

    fetchEmployeeInfo()
  }, [])

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken")
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    } catch (error) {
      Alert.alert("Error", "Failed to log out")
    }
  }

  const actionTiles = [
    {
      id: "checkin",
      title: "Check-in/Check-out",
      icon: "clock",
      screen: "CheckInOut",
      color: "#4CAF50",
    },
    {
      id: "orders",
      title: "Order Management",
      icon: "clipboard",
      screen: "OrderManagement",
      color: "#2196F3",
    },
    {
      id: "tables",
      title: "Table Management",
      icon: "grid",
      screen: "TableManagement",
      color: "#FF9800",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "bell",
      screen: "Notifications",
      color: "#E91E63",
      badge: notifications,
    },
    {
      id: "profile",
      title: "My Profile",
      icon: "user",
      screen: "Profile",
      color: "#9C27B0",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.employeeName}>{employeeInfo.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.employeeInfoCard}>
          <View style={styles.employeeInfoHeader}>
            <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.employeeImage} />
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeName}>{employeeInfo.name}</Text>
              <Text style={styles.employeePosition}>{employeeInfo.position}</Text>
              <View style={styles.employeeIdContainer}>
                <Text style={styles.employeeId}>ID: {employeeInfo.id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.employeeInfoDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>{employeeInfo.department}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Join Date:</Text>
              <Text style={styles.infoValue}>{employeeInfo.joinDate}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.tilesContainer}>
          {actionTiles.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={[styles.tile, { backgroundColor: tile.color }]}
              onPress={() => navigation.navigate(tile.screen)}
            >
              <View style={styles.tileContent}>
                <Feather name={tile.icon} size={32} color="white" />
                <Text style={styles.tileTitle}>{tile.title}</Text>
              </View>
              {tile.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tile.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  employeeInfoCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeInfoHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  employeeImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  employeeDetails: {
    flex: 1,
    justifyContent: "center",
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  employeePosition: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  employeeIdContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  employeeId: {
    fontSize: 14,
    color: "#666",
  },
  employeeInfoDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tileContent: {
    alignItems: "center",
  },
  tileTitle: {
    color: "white",
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
})

export default HomeScreen
