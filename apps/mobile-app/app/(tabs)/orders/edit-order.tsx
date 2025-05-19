"use client"
import { useState, useEffect, useCallback } from "react"
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams } from "expo-router"

import { useTheme } from "../../../context/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useOrderItem } from "../../../context/OrderItemContext"
import { useOrder } from "../../../context/OrderContext"

// Import interfaces
import type { OrderItemStatus } from "../../../constants/interface"
import { router } from "expo-router"

// Order status colors
const STATUS_COLORS: Record<OrderItemStatus | string, string> = {
  PENDING: "#FF9800",
  PREPARING: "#2196F3",
  READY: "#4CAF50",
  DELIVERED: "#9C27B0",
  COMPLETED: "#607D8B",
  COMPLETE: "#4CAF50",
}

export default function EditOrderScreen() {
  const params = useLocalSearchParams()
  const orderId = params.id as string

  const { colors } = useTheme()

  // Use context hooks
  const { fetchOrder: fetchOrderById } = useOrder()
  const { updateOrderItem, deleteOrderItem, loading: orderItemLoading } = useOrderItem()

  // State
  const [order, setOrder] = useState<any>(null)
  const [editedItems, setEditedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize edited items from order
  useEffect(() => {
    if (order && order.orderItems) {
      setEditedItems([...order.orderItems])
    }
  }, [order])

  // Check if there are changes
  useEffect(() => {
    if (order && order.orderItems) {
      const hasAnyChanges = JSON.stringify(order.orderItems) !== JSON.stringify(editedItems)
      setHasChanges(hasAnyChanges)
    }
  }, [order, editedItems])

  // Fetch order data
  useEffect(() => {
    fetchOrderById(orderId).then(setOrder)
  }, [orderId])

  // Update item quantity
  const handleUpdateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setEditedItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }, [])

  // Update item status
  const handleUpdateStatus = useCallback((itemId: string) => {
    const statusOrder: OrderItemStatus[] = ["PENDING", "PREPARING", "READY", "COMPLETE"]
    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentIndex = statusOrder.indexOf(item.status as OrderItemStatus)
          const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
          return { ...item, status: nextStatus }
        }
        return item
      }),
    )
  }, [])

  // Remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    Alert.alert("Xóa món", "Bạn có chắc muốn xóa món này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setEditedItems((prev) => prev.filter((item) => item.id !== itemId))
        },
      },
    ])
  }, [])

  // Save changes
  const handleSaveChanges = useCallback(async () => {
    if (!hasChanges) return
    setSaving(true)
    try {
      for (const item of editedItems) {
        const originalItem = order.orderItems.find((oi: any) => oi.id === item.id)
        if (!originalItem) {
          // Handle new item if needed
        } else if (JSON.stringify(originalItem) !== JSON.stringify(item)) {
          await updateOrderItem(item.id, {
            status: item.status,
            quantity: item.quantity
          })
        }
      }
      const deletedItems = order.orderItems.filter(
        (oi: any) => !editedItems.find(item => item.id === oi.id)
      )
      for (const item of deletedItems) {
        await deleteOrderItem(item.id)
      }
      Alert.alert("Thành công", "Đơn hàng đã được cập nhật thành công")
      router.replace('/(tabs)/orders')
    } catch (error) {
      console.error("Lỗi khi lưu thay đổi:", error)
      Alert.alert("Lỗi", "Không thể lưu thay đổi")
    } finally {
      setSaving(false)
    }
  }, [hasChanges, editedItems, order, router, updateOrderItem, deleteOrderItem])

  // Cancel changes
  const handleCancelChanges = useCallback(() => {
    if (hasChanges) {
      Alert.alert("Hủy thay đổi", "Bạn có chắc muốn hủy các thay đổi?", [
        { text: "Tiếp tục chỉnh sửa", style: "cancel" },
        {
          text: "Hủy",
          style: "destructive",
          onPress: () => router.replace('/(tabs)/orders'),
        },
      ])
    } else {
      router.replace('/(tabs)/orders')
    }
  }, [hasChanges, router])

  // Calculate total
  const calculateTotal = useCallback(() => {
    return editedItems.reduce((total, item) => {
      return total + item.food.price * item.quantity
    }, 0)
  }, [editedItems])

  if (loading || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="#D02C1A" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D02C1A" />
          <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#D02C1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancelChanges}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.orderInfoCard}>
        <View style={styles.orderInfoRow}>
          <View style={styles.orderInfoItem}>
            <Feather name="coffee" size={20} color="#D02C1A" />
            <Text style={styles.orderInfoText}>Bàn {order.tableNumber}</Text>
          </View>
          <View style={styles.orderInfoItem}>
            <Feather name="clock" size={20} color="#D02C1A" />
            <Text style={styles.orderInfoText}>
              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Các món đã đặt</Text>

        <ScrollView style={styles.itemsList}>
          {editedItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.food.name}</Text>
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}
                  onPress={() => handleUpdateStatus(item.id)}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Giá:</Text>
                  <Text style={styles.priceValue}>{item.food.price.toFixed(2)}đ</Text>
                </View>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Feather name="minus" size={18} color="#D02C1A" />
                  </TouchableOpacity>

                  <Text style={styles.quantityValue}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Feather name="plus" size={18} color="#D02C1A" />
                  </TouchableOpacity>
                </View>

                <View style={styles.subtotalContainer}>
                  <Text style={styles.subtotalLabel}>Thành tiền:</Text>
                  <Text style={styles.subtotalValue}>{(item.food.price * item.quantity).toFixed(2)}đ</Text>
                </View>

                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
                  <Feather name="trash-2" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>{calculateTotal().toFixed(2)}đ</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerButton, styles.cancelButton]} onPress={handleCancelChanges}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.saveButton, !hasChanges && styles.disabledButton]}
          onPress={handleSaveChanges}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Cập nhật đơn hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#D02C1A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  orderInfoCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderInfoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  itemsList: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  itemDetails: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D02C1A",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  subtotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  subtotalLabel: {
    fontSize: 14,
    color: "#666",
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D02C1A",
  },
  removeButton: {
    alignSelf: "center",
    backgroundColor: "#F44336",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  totalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D02C1A",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#607D8B",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
})
