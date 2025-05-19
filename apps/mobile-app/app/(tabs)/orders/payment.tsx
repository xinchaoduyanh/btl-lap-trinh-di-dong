"use client"
import React, { useState, useEffect, useCallback } from "react"

import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "../../../context/ThemeContext"
import { Feather } from "@expo/vector-icons"

// Mock data for testing
const MOCK_ORDER = {
  id: "ord1",
  tableId: "t5",
  tableNumber: 5,
  employeeId: "emp1",
  status: "PENDING",
  createdAt: "2023-05-17T10:30:00Z",
  timeOut: null,
  orderItems: [
    {
      id: "oi1",
      orderId: "ord1",
      foodId: "f1",
      quantity: 1,
      status: "PENDING",
      food: {
        id: "f1",
        name: "Lẩu Tứ Xuyên cay",
        price: 25.99,
        category: "MAIN_COURSE",
      },
    },
    {
      id: "oi2",
      orderId: "ord1",
      foodId: "f2",
      quantity: 2,
      status: "PENDING",
      food: {
        id: "f2",
        name: "Thịt bò thái lát",
        price: 12.99,
        category: "MAIN_COURSE",
      },
    },
    {
      id: "oi3",
      orderId: "ord1",
      foodId: "f3",
      quantity: 1,
      status: "PREPARING",
      food: {
        id: "f3",
        name: "Đậu phụ",
        price: 5.99,
        category: "SIDE_DISH",
      },
    },
    {
      id: "oi4",
      orderId: "ord1",
      foodId: "f4",
      quantity: 1,
      status: "READY",
      food: {
        id: "f4",
        name: "Rau các loại",
        price: 7.99,
        category: "SIDE_DISH",
      },
    },
  ],
}

// Payment methods
const PAYMENT_METHODS = [
  { id: "cash", name: "Tiền mặt", icon: "dollar-sign" },
  { id: "card", name: "Thẻ tín dụng", icon: "credit-card" },
  { id: "qr", name: "Mã QR", icon: "smartphone" },
]

export default function PaymentScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams()
  const orderId = params.id as string

  // State
  const [order, setOrder] = useState<any>(MOCK_ORDER)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("cash")
  const [discount, setDiscount] = useState<string>("0")
  const [tip, setTip] = useState<string>("0")

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch the order data
        // const orderData = await getOrderById(orderId)
        // setOrder(orderData)

        // For now, we'll use mock data
        setOrder(MOCK_ORDER)
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error)
        Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  // Calculate subtotal
  const calculateSubtotal = useCallback(() => {
    return order.orderItems.reduce((total: number, item: any) => {
      return total + item.food.price * item.quantity
    }, 0)
  }, [order])

  // Calculate tax (10%)
  const calculateTax = useCallback(() => {
    return calculateSubtotal() * 0.1
  }, [calculateSubtotal])

  // Calculate discount
  const getDiscount = useCallback(() => {
    const discountValue = Number.parseFloat(discount) || 0
    return discountValue > calculateSubtotal() ? calculateSubtotal() : discountValue
  }, [discount, calculateSubtotal])

  // Calculate tip
  const getTip = useCallback(() => {
    return Number.parseFloat(tip) || 0
  }, [tip])

  // Calculate total
  const calculateTotal = useCallback(() => {
    return calculateSubtotal() + calculateTax() - getDiscount() + getTip()
  }, [calculateSubtotal, calculateTax, getDiscount, getTip])

  // Handle payment
  const handleProcessPayment = useCallback(() => {
    if (processing) return

    setProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      Alert.alert("Thanh toán thành công", `Thanh toán ${Math.round(calculateTotal())}đ đã được xử lý thành công.`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    }, 1500)
  }, [processing, calculateTotal, router])

  // Handle cancel
  const handleCancel = useCallback(() => {
    router.back()
  }, [router])

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="#D02C1A" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D02C1A" />
          <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#D02C1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <View style={styles.orderInfoItem}>
              <Feather name="coffee" size={16} color="#D02C1A" />
              <Text style={styles.orderInfoText}>Bàn {order.tableNumber}</Text>
            </View>
            <View style={styles.orderInfoItem}>
              <Feather name="clock" size={16} color="#D02C1A" />
              <Text style={styles.orderInfoText}>
                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Các món đã đặt</Text>
          {order.orderItems.map((item: any) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.food.name}</Text>
                <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.orderItemPrice}>{Math.round(item.food.price * item.quantity)}đ</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{Math.round(calculateSubtotal())}đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế (10%)</Text>
              <Text style={styles.summaryValue}>{Math.round(calculateTax())}đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Text style={styles.inputSuffix}>đ</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tiền tip</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Text style={styles.inputSuffix}>đ</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{Math.round(calculateTotal())}đ</Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentMethodsCard}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodButton,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <Feather
                  name={method.icon as any}
                  size={24}
                  color={selectedPaymentMethod === method.id ? "#fff" : "#333"}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethodText,
                  ]}
                >
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.processButton, processing && styles.processingButton]}
          onPress={handleProcessPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.processButtonText}>Xác nhận thanh toán</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={processing}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D02C1A",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: "#333",
  },
  orderItemQuantity: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  summarySection: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 36,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    textAlign: "right",
  },
  inputSuffix: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D02C1A",
  },
  paymentMethodsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethods: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentMethodButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
  },
  selectedPaymentMethod: {
    backgroundColor: "#D02C1A",
    borderColor: "#D02C1A",
  },
  paymentMethodText: {
    marginTop: 8,
    fontSize: 12,
    color: "#333",
  },
  selectedPaymentMethodText: {
    color: "#fff",
  },
  processButton: {
    backgroundColor: "#D02C1A",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  processingButton: {
    opacity: 0.7,
  },
  processButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D02C1A",
  },
  cancelButtonText: {
    color: "#D02C1A",
    fontSize: 16,
    fontWeight: "500",
  },
})
