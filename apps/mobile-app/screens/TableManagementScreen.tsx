"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"

const TableManagementScreen = ({ navigation }) => {
  // Mock data for tables
  const initialTables = [
    { id: 1, number: 1, seats: 2, status: "Available" },
    { id: 2, number: 2, seats: 4, status: "Occupied" },
    { id: 3, number: 3, seats: 4, status: "Reserved" },
    { id: 4, number: 4, seats: 6, status: "Available" },
    { id: 5, number: 5, seats: 2, status: "Occupied" },
    { id: 6, number: 6, seats: 8, status: "Cleaning" },
    { id: 7, number: 7, seats: 4, status: "Available" },
    { id: 8, number: 8, seats: 6, status: "Reserved" },
    { id: 9, number: 9, seats: 2, status: "Occupied" },
    { id: 10, number: 10, seats: 4, status: "Available" },
    { id: 11, number: 11, seats: 2, status: "Available" },
    { id: 12, number: 12, seats: 8, status: "Occupied" },
  ]

  const [tables, setTables] = useState(initialTables)
  const [activeFilter, setActiveFilter] = useState("All")

  const getStatusColor = (status) => {
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

  const filterTables = (filter) => {
    setActiveFilter(filter)
  }

  const getFilteredTables = () => {
    if (activeFilter === "All") {
      return tables
    }
    return tables.filter((table) => table.status === activeFilter)
  }

  const windowWidth = Dimensions.get("window").width
  const tableWidth = (windowWidth - 48) / 3 // 3 tables per row with padding

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Table Management</Text>
        <TouchableOpacity>
          <Feather name="refresh-cw" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["All", "Available", "Occupied", "Reserved", "Cleaning"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
              onPress={() => filterTables(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tablesContainer}>
          {getFilteredTables().map((table) => (
            <TouchableOpacity
              key={table.id}
              style={[
                styles.tableCard,
                { width: tableWidth, backgroundColor: getStatusColor(table.status) + "20" },
                { borderColor: getStatusColor(table.status) },
              ]}
            >
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(table.status) }]} />
              <Text style={styles.tableNumber}>Table {table.number}</Text>
              <Text style={styles.tableSeats}>{table.seats} Seats</Text>
              <Text style={[styles.tableStatus, { color: getStatusColor(table.status) }]}>{table.status}</Text>
            </TouchableOpacity>
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
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  activeFilterButton: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    color: "#666",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
    fontWeight: "bold",
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
  tableCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    aspectRatio: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    top: 8,
    right: 8,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  tableSeats: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  tableStatus: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: "auto",
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

export default TableManagementScreen
