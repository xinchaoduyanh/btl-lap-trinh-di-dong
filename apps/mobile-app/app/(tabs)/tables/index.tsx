"use client"
import { useEffect, useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "../../../context/ThemeContext"
import { useTable } from "../../../context/TableContext"
import type { Table, TableStatus } from "../../../constants/interface"

// Components
import { Header } from "../../../components/Header"
import { FilterButton } from "../../../components/FilterButton"
import { TableCard } from "../../../components/TableCard"

const STATUS_LABELS: Record<TableStatus, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  CLEANING: "Cleaning",
}
const STATUS_OPTIONS: TableStatus[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"]
const FILTERS = ["All", ...Object.values(STATUS_LABELS)]

export default function TableManagementScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { tables, loading, fetchTables, updateTable } = useTable()
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | null>(null)

  useEffect(() => {
    fetchTables()
  }, [])

  const getFilteredTables = () => {
    if (activeFilter === "All") return tables
    const statusKey = Object.keys(STATUS_LABELS).find((key) => STATUS_LABELS[key as TableStatus] === activeFilter) as
      | TableStatus
      | undefined
    return statusKey ? tables.filter((table) => table.status === statusKey) : tables
  }

  const windowWidth = Dimensions.get("window").width
  const tableWidth = (windowWidth - 48) / 3 // 3 tables per row with padding

  const handleStatusChange = async () => {
    if (!editingTable || !selectedStatus) return

    if (selectedStatus === editingTable.status) {
      setEditingTable(null)
      setSelectedStatus(null)
      return
    }

    try {
      await updateTable(editingTable.id, { status: selectedStatus })
      fetchTables()
      Alert.alert("Success", "Table status updated successfully!")
    } catch (error) {
      Alert.alert("Error", "Failed to update table status")
    } finally {
      setEditingTable(null)
      setSelectedStatus(null)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Table Management"
        onBackPress={() => router.back()}
        rightIcon="refresh-cw"
        onRightPress={fetchTables}
      />

      <View style={styles.restaurantMapContainer}>
        <Text style={styles.mapTitle}>Hot Pot Paradise</Text>
        <Image
          source={{ uri: "https://img.freepik.com/free-vector/restaurant-floor-plan-template_23-2147980214.jpg" }}
          style={styles.restaurantMap}
          resizeMode="contain"
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((filter) => (
            <FilterButton
              key={filter}
              title={filter}
              isActive={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTables} />}
      >
        <View style={styles.tablesContainer}>
          {getFilteredTables().map((table) => (
            <TableCard
              key={table.id}
              table={table}
              width={tableWidth}
              onPress={() => {
                setEditingTable(table)
                setSelectedStatus(table.status)
              }}
            />
          ))}
          {getFilteredTables().length === 0 && (
            <Text style={{ textAlign: "center", color: colors.text, marginTop: 32, width: "100%" }}>
              No tables found.
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getStatusColor(status as TableStatus) }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Centered Modal Form */}
      <Modal
        visible={editingTable !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setEditingTable(null)
          setSelectedStatus(null)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTable ? `Table ${editingTable.number} Status` : "Update Table"}
              </Text>
            </View>

            <View style={styles.statusOptionsContainer}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selectedStatus === status && styles.statusOptionActive,
                    { backgroundColor: selectedStatus === status ? getStatusColor(status) : "#f8f8f8" },
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[styles.statusOptionText, { color: selectedStatus === status ? "white" : "#333" }]}>
                    {STATUS_LABELS[status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditingTable(null)
                  setSelectedStatus(null)
                }}
              >
                <Text style={[styles.buttonText, { color: "#D02C1A" }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (!selectedStatus || selectedStatus === editingTable?.status) && styles.disabledButton,
                ]}
                disabled={!selectedStatus || selectedStatus === editingTable?.status}
                onPress={handleStatusChange}
              >
                <Text style={[styles.buttonText, { color: "white" }]}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Helper function to get status color
const getStatusColor = (status: TableStatus | string) => {
  switch (status) {
    case "AVAILABLE":
      return "#4CAF50"
    case "OCCUPIED":
      return "#F44336"
    case "RESERVED":
      return "#FF9800"
    case "CLEANING":
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#D02C1A", // Hot pot red color
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "80%",
    maxWidth: 400,
    overflow: "hidden",
    elevation: 5,
  },
  modalHeader: {
    backgroundColor: "#D02C1A", // Hot pot red color
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusOptionsContainer: {
    padding: 16,
  },
  statusOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statusOptionActive: {
    borderWidth: 0,
  },
  statusOptionText: {
    fontWeight: "500",
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderRightWidth: 0.5,
    borderRightColor: "#eee",
  },
  confirmButton: {
    backgroundColor: "#D02C1A", // Hot pot red color
    borderLeftWidth: 0.5,
    borderLeftColor: "#eee",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#D02C1A", // Hot pot red color cho Cancel, trắng cho Confirm
  },
})
