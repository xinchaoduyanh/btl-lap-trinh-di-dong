"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/types"
import { useAuth } from "../../context/AuthContext"

// Components
import { ActionTile } from "../../components/ActionTile"
import { EmployeeInfoCard } from "../../components/EmployeeInfoCard"
import { Header } from "../../components/Header"

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { logout } = useAuth()

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
      <Header title={`Hello, ${employeeInfo.name}`} showBackButton={false} rightIcon="log-out" onRightPress={logout} />

      <ScrollView style={styles.scrollView}>
        <EmployeeInfoCard employeeInfo={employeeInfo} />

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.tilesContainer}>
          {actionTiles.map((tile) => (
            <ActionTile
              key={tile.id}
              title={tile.title}
              icon={tile.icon}
              color={tile.color}
              badge={tile.badge}
              onPress={() => navigation.navigate(tile.screen as keyof RootStackParamList)}
            />
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
  scrollView: {
    flex: 1,
    padding: 16,
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
})

export default HomeScreen
