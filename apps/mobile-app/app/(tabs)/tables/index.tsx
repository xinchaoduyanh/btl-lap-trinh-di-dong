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
import { useOrder } from "../../../context/OrderContext"
import { useAuth } from "../../../context/AuthContext"
import type { Table, TableStatus } from "../../../constants/interface"

// Components
import { Header } from "../../../components/Header"
import { FilterButton } from "../../../components/FilterButton"
import { TableCard } from "../../../components/TableCard"

const STATUS_LABELS: Record<TableStatus, string> = {
  AVAILABLE: "Trống",
  OCCUPIED: "Đang phục vụ",
  RESERVED: "Đã đặt trước",
  CLEANING: "Đang dọn dẹp",
}
const STATUS_OPTIONS: TableStatus[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"]
const FILTERS = ["Tất cả", ...Object.values(STATUS_LABELS)]

export default function TableManagementScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { tables, loading, fetchTables, updateTable } = useTable()
  const { createOrder } = useOrder()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState<string>("Tất cả")
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | null>(null)

  useEffect(() => {
    fetchTables()
  }, [])

  const getFilteredTables = () => {
    let filteredTables = tables
    if (activeFilter !== "Tất cả") {
      const statusKey = Object.keys(STATUS_LABELS).find(
        (key) => STATUS_LABELS[key as TableStatus] === activeFilter
      ) as TableStatus | undefined
      filteredTables = statusKey ? tables.filter((table) => table.status === statusKey) : tables
    }

    // Sắp xếp bàn theo số bàn
    return filteredTables.sort((a, b) => a.number - b.number)
  }

  const windowWidth = Dimensions.get("window").width
  const tableWidth = (windowWidth - 48) / 3 // 3 bàn mỗi hàng với padding

  const handleStatusChange = async () => {
    if (!editingTable || !selectedStatus) return

    if (selectedStatus === editingTable.status) {
      setEditingTable(null)
      setSelectedStatus(null)
      return
    }

    try {
      await updateTable(editingTable.id, { status: selectedStatus })

      // Tự động tạo đơn hàng khi chuyển sang trạng thái "Đang phục vụ"
      if (selectedStatus === "OCCUPIED") {
        await createOrder({
          tableId: editingTable.id,
          employeeId: user?.id || '',
        })
        Alert.alert(
          "Thành công",
          "Đã cập nhật trạng thái bàn và tạo đơn hàng mới. Bạn có thể quản lý đơn hàng trong mục Quản lý đơn hàng."
        )
      } else {
        Alert.alert("Thành công", "Cập nhật trạng thái bàn thành công!")
      }

      fetchTables()
    } catch (error) {
      console.error('Error:', error)
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái bàn")
    } finally {
      setEditingTable(null)
      setSelectedStatus(null)
    }
  }

  const handleTablePress = (table: Table) => {
    if (table.status === "OCCUPIED") {
      Alert.alert(
        "Không thể thao tác",
        "Bàn này đang được phục vụ. Vui lòng quản lý đơn hàng trong mục Quản lý đơn hàng."
      )
      return
    }
    setEditingTable(table)
    setSelectedStatus(table.status)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Quản lý bàn"
        onBackPress={() => router.back()}
        rightIcon="refresh-cw"
        onRightPress={fetchTables}
      />

      <View style={styles.restaurantMapContainer}>
        <Text style={styles.mapTitle}>Nhà hàng Lẩu Thiên Đường</Text>
        <Image
          source={{ uri: "https://posapp.vn/wp-content/uploads/2020/09/%C4%91%E1%BB%93ng-b%E1%BB%99-n%E1%BB%99i-th%E1%BA%A5t.jpg" }}
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
              onPress={() => handleTablePress(table)}
              disabled={table.status === "OCCUPIED"}
            />
          ))}
          {getFilteredTables().length === 0 && (
            <Text style={{ textAlign: "center", color: colors.text, marginTop: 32, width: "100%" }}>
              Không tìm thấy bàn nào.
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Chú thích:</Text>
        <View style={styles.legendItems}>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getStatusColor(status as TableStatus) }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Form Modal ở giữa màn hình */}
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
                {editingTable ? `Trạng thái bàn số ${editingTable.number}` : "Cập nhật bàn"}
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
                <Text style={[styles.buttonText, { color: "#D02C1A" }]}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (!selectedStatus || selectedStatus === editingTable?.status) && styles.disabledButton,
                ]}
                onPress={handleStatusChange}
                disabled={!selectedStatus || selectedStatus === editingTable?.status}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const getStatusColor = (status: TableStatus): string => {
  switch (status) {
    case "AVAILABLE":
      return "#4CAF50" // Xanh lá - trống
    case "OCCUPIED":
      return "#F44336" // Đỏ - đang phục vụ
    case "RESERVED":
      return "#FF9800" // Cam - đã đặt trước
    case "CLEANING":
      return "#2196F3" // Xanh dương - đang dọn dẹp
    default:
      return "#9E9E9E" // Xám - mặc định
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  restaurantMapContainer: {
    padding: 16,
    alignItems: "center",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  restaurantMap: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tablesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 80, // Để không bị che bởi legend
  },
  legend: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusOptionsContainer: {
    padding: 16,
  },
  statusOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusOptionActive: {
    borderWidth: 2,
    borderColor: "#333",
  },
  statusOptionText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
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
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})
