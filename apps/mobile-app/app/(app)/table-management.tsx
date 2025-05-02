"use client"
import React, { useState } from "react"
import { StyleSheet, View, Text, ScrollView, Dimensions, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "../../context/ThemeContext"

// Components
import { Header } from "../../components/Header"
import { FilterButton } from "../../components/FilterButton"
import { TableCard } from "../../components/TableCard"

export default function TableManagementScreen() {
  const router = useRouter()
  const { colors } = useTheme()

  // Mock data for tables
  const initialTables = [
    { id: 1, number: 1, seats: 2, status: "Available", type: "Regular" },
    { id: 2, number: 2, seats: 4, status: "Occupied", type: "Regular" },
    { id: 3, number: 3, seats: 4, status: "Reserved", type: "Regular" },
    { id: 4, number: 4, seats: 6, status: "Available", type: "Premium" },
    { id: 5, number: 5, seats: 2, status: "Occupied", type: "Regular" },
    { id: 6, number: 6, seats: 8, status: "Cleaning", type: "Premium" },
    { id: 7, number: 7, seats: 4, status: "Available", type: "Regular" },
    { id: 8, number: 8, seats: 6, status: "Reserved", type: "Premium" },
    { id: 9, number: 9, seats: 2, status: "Occupied", type: "Regular" },
    { id: 10, number: 10, seats: 4, status: "Available", type: "Regular" },
    { id: 11, number: 11, seats: 2, status: "Available", type: "Regular" },
    { id: 12, number: 12, seats: 8, status: "Occupied", type: "Premium" },
  ]

  const [tables, setTables] = useState(initialTables)
  const [activeFilter, setActiveFilter] = useState("All")

  const filters = ["All", "Available", "Occupied", "Reserved", "Cleaning"]

  const getFilteredTables = () => {
    if (activeFilter === "All") {
      return tables
    }
    return tables.filter((table) => table.status === activeFilter)
  }

  const windowWidth = Dimensions.get("window").width
  const tableWidth = (windowWidth - 48) / 3 // 3 tables per row with padding

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Table Management"
        onBackPress={() => router.back()}
        rightIcon="refresh-cw"
        onRightPress={() => {}}
      />

      <View style={styles.restaurantMapContainer}>
        <Text style={styles.mapTitle}>ITHotpot Restaurant Layout</Text>
        <Image
          source={{ uri: "https://img.freepik.com/free-vector/restaurant-floor-plan-template_23-2147980214.jpg" }}
          style={styles.restaurantMap}
          resizeMode="contain"
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <FilterButton
              key={filter}
              title={filter}
              isActive={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tablesContainer}>
          {getFilteredTables().map((table) => (
            <TableCard key={table.id} table={table} width={tableWidth} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          {["Available", "Occupied", "Reserved", "Cleaning"].map((status) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getStatusColor(status) }]} />
              <Text style={styles.legendText}>{status}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "#4CAF50"
    case "Occupied":
      return "#F44336"
    case "Reserved":
      return "#FF9800"
    case "Cleaning":
      return "#2196F3"
    default:
      return "#666"
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  restaurantMapContainer: {
    backgroundColor: "white",
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C00",
    marginBottom: 8,
  },
  restaurantMap: {
    width: "100%",
    height: 120,
    borderRadius: 5,
  },
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tablesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legend: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
})
