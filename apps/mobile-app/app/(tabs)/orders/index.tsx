"use client"
import { useState, useMemo, useCallback } from "react"
import { StyleSheet, ScrollView, View, Image, Text, TouchableOpacity, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "../../../context/ThemeContext"
import { Feather } from "@expo/vector-icons"

// Components
import { Header } from "../../../components/Header"
import { TabBar } from "../../../components/TabBar"

// Import interfaces
import { Table, Food, OrderItem, Order, OrderItemStatus } from "../../../constants/interface"

// Order status colors
const STATUS_COLORS: Record<OrderItemStatus | 'DELIVERED' | 'COMPLETED', string> = {
  PENDING: "#FF9800",
  PREPARING: "#2196F3",
  READY: "#4CAF50",
  DELIVERED: "#9C27B0",
  COMPLETED: "#607D8B",
  COMPLETE: "#4CAF50"
}

// Mock data based on your schema
const TABLES: Table[] = [
  { id: "t1", number: 1, status: "AVAILABLE" },
  { id: "t2", number: 2, status: "OCCUPIED" },
  { id: "t3", number: 3, status: "OCCUPIED" },
  { id: "t4", number: 4, status: "RESERVED" },
  { id: "t5", number: 5, status: "OCCUPIED" },
  { id: "t6", number: 6, status: "CLEANING" },
  { id: "t7", number: 7, status: "AVAILABLE" },
  { id: "t8", number: 8, status: "OCCUPIED" },
]

const FOODS: Food[] = [
  { id: "f1", name: "Spicy Sichuan Hot Pot", price: 25.99, category: "MAIN_COURSE", isAvailable: true },
  { id: "f2", name: "Beef Slices", price: 12.99, category: "MAIN_COURSE", isAvailable: true },
  { id: "f3", name: "Tofu", price: 5.99, category: "SIDE_DISH", isAvailable: true },
  { id: "f4", name: "Vegetables", price: 7.99, category: "SIDE_DISH", isAvailable: true },
  { id: "f5", name: "Seafood Mix", price: 18.99, category: "MAIN_COURSE", isAvailable: true },
  { id: "f6", name: "Mushroom Platter", price: 8.99, category: "APPETIZER", isAvailable: true },
  { id: "f7", name: "Noodles", price: 4.99, category: "SIDE_DISH", isAvailable: true },
  { id: "f8", name: "Pork Slices", price: 11.99, category: "MAIN_COURSE", isAvailable: true },
  { id: "f9", name: "Tomato Hot Pot", price: 23.99, category: "MAIN_COURSE", isAvailable: true },
  { id: "f10", name: "Soft Drinks", price: 2.99, category: "BEVERAGE", isAvailable: true },
]

// Mock orders with OrderItems based on your schema
const ORDERS: Order[] = [
  {
    id: "ord1",
    tableId: "t5",
    employeeId: "emp1",
    status: "PENDING",
    createdAt: "2023-05-17T10:30:00Z",
    timeOut: undefined,
    orderItems: [
      { id: "oi1", orderId: "ord1", foodId: "f1", quantity: 1, status: "PENDING" },
      { id: "oi2", orderId: "ord1", foodId: "f2", quantity: 2, status: "PENDING" },
      { id: "oi3", orderId: "ord1", foodId: "f3", quantity: 1, status: "PENDING" },
      { id: "oi4", orderId: "ord1", foodId: "f4", quantity: 1, status: "PENDING" },
    ],
  },
  {
    id: "ord2",
    tableId: "t3",
    employeeId: "emp2",
    status: "PREPARING",
    createdAt: "2023-05-17T10:15:00Z",
    timeOut: undefined,
    orderItems: [
      { id: "oi5", orderId: "ord2", foodId: "f9", quantity: 1, status: "PREPARING" },
      { id: "oi6", orderId: "ord2", foodId: "f8", quantity: 1, status: "PENDING" },
    ],
  },
  {
    id: "ord3",
    tableId: "t8",
    employeeId: "emp1",
    status: "READY",
    createdAt: "2023-05-17T10:10:00Z",
    timeOut: undefined,
    orderItems: [
      { id: "oi7", orderId: "ord3", foodId: "f1", quantity: 1, status: "READY" },
      { id: "oi8", orderId: "ord3", foodId: "f2", quantity: 1, status: "READY" },
      { id: "oi9", orderId: "ord3", foodId: "f7", quantity: 1, status: "READY" },
      { id: "oi10", orderId: "ord3", foodId: "f4", quantity: 1, status: "READY" },
      { id: "oi11", orderId: "ord3", foodId: "f7", quantity: 1, status: "READY" },
      { id: "oi12", orderId: "ord3", foodId: "f3", quantity: 1, status: "READY" },
    ],
  },
  {
    id: "ord4",
    tableId: "t1",
    employeeId: "emp3",
    status: "DELIVERED",
    createdAt: "2023-05-17T10:00:00Z",
    timeOut: "2023-05-17T10:45:00Z",
    orderItems: [
      { id: "oi13", orderId: "ord4", foodId: "f9", quantity: 1, status: "COMPLETE" },
      { id: "oi14", orderId: "ord4", foodId: "f3", quantity: 2, status: "COMPLETE" },
      { id: "oi15", orderId: "ord4", foodId: "f6", quantity: 1, status: "COMPLETE" },
    ],
  },
  {
    id: "ord5",
    tableId: "t7",
    employeeId: "emp2",
    status: "COMPLETED",
    createdAt: "2023-05-17T09:45:00Z",
    timeOut: "2023-05-17T11:15:00Z",
    orderItems: [
      { id: "oi16", orderId: "ord5", foodId: "f9", quantity: 1, status: "COMPLETE" },
      { id: "oi17", orderId: "ord5", foodId: "f2", quantity: 1, status: "COMPLETE" },
      { id: "oi18", orderId: "ord5", foodId: "f5", quantity: 1, status: "COMPLETE" },
      { id: "oi19", orderId: "ord5", foodId: "f6", quantity: 1, status: "COMPLETE" },
      { id: "oi20", orderId: "ord5", foodId: "f7", quantity: 1, status: "COMPLETE" },
    ],
  },
]

export default function OrderManagementScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState("All Orders")
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tabs = ["All Orders", "PENDING", "PREPARING", "READY", "DELIVERED"]

  const filteredOrders = useMemo(() => {
    return activeTab === "All Orders"
      ? ORDERS
      : ORDERS.filter((order) => order.status === activeTab)
  }, [activeTab])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // Simulate a data refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  const formatTime = useCallback((dateString: string) => {
    try {
      const orderDate = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - orderDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 60) {
        return `${diffMins} mins ago`
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)} hours ago`
      } else {
        return `${Math.floor(diffMins / 1440)} days ago`
      }
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Invalid time'
    }
  }, [])

  const getTableNumber = useCallback((tableId: string) => {
    const table = TABLES.find((t) => t.id === tableId)
    return table ? table.number : "Unknown"
  }, [])

  const getFoodDetails = useCallback((foodId: string) => {
    return FOODS.find((f) => f.id === foodId) || { name: "Unknown Item", price: 0 }
  }, [])

  const calculateOrderTotal = useCallback((orderItems: OrderItem[]) => {
    return orderItems.reduce((total: number, item: OrderItem) => {
      const food = getFoodDetails(item.foodId)
      return total + food.price * item.quantity
    }, 0)
  }, [getFoodDetails])

  const handleAddOrder = useCallback(() => {
    router.push("/(tabs)/orders/add-order")
  }, [router])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Order Management"
        onBackPress={() => router.back()}
        rightIcon="plus"
        onRightPress={handleAddOrder}
      />

      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: "https://img.freepik.com/free-photo/hot-pot-asian-food_74190-7540.jpg" }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Hot Pot Paradise</Text>
          <Text style={styles.bannerSubtitle}>Manage all customer orders</Text>
        </View>
      </View>

      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCardContainer}>
              <View style={styles.orderCardHeader}>
                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] }]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
              </View>

              <View style={styles.orderCardBody}>
                <View style={styles.orderInfoRow}>
                  <View style={styles.orderInfoItem}>
                    <Feather name="users" size={16} color="#D02C1A" />
                    <Text style={styles.orderInfoText}>Table {getTableNumber(order.tableId)}</Text>
                  </View>
                  <View style={styles.orderInfoItem}>
                    <Feather name="clock" size={16} color="#D02C1A" />
                    <Text style={styles.orderInfoText}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.itemsTitle}>Order Items:</Text>
                {order.orderItems?.map((item) => {
                  const food = getFoodDetails(item.foodId)
                  return (
                    <View key={item.id} style={styles.orderItem}>
                      <View style={styles.orderItemDetails}>
                        <View style={styles.itemNameContainer}>
                          <Text style={styles.itemName}>{food.name}</Text>
                          <View style={[styles.itemStatusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                            <Text style={styles.itemStatusText}>{item.status}</Text>
                          </View>
                        </View>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>${(food.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  )
                })}

                <View style={styles.divider} />

                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>${calculateOrderTotal(order.orderItems ?? []).toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.orderCardFooter}>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="edit-2" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: order.status === "COMPLETED" ? "#607D8B" : "#4CAF50" },
                  ]}
                  disabled={order.status === "COMPLETED"}
                >
                  <Feather
                    name={order.status === "COMPLETED" ? "check-circle" : "arrow-right"}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.actionButtonText}>
                    {order.status === "COMPLETED" ? "Completed" : "Next Status"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fabButton} onPress={handleAddOrder}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bannerContainer: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerImage: {
    width: 100,
    height: 100,
  },
  bannerTextContainer: {
    flex: 1,
    padding: 15,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D02C1A", // Hot pot red color
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  orderCardContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderTime: {
    color: "#666",
    fontSize: 12,
  },
  orderCardBody: {
    padding: 12,
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderInfoText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  itemNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  itemName: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  itemStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemStatusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D02C1A", // Hot pot red color
  },
  orderCardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#D02C1A", // Hot pot red color
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  fabButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D02C1A", // Hot pot red color
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
})
