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
        name: "Spicy Sichuan Hot Pot",
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
        name: "Beef Slices",
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
        name: "Tofu",
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
        name: "Vegetables",
        price: 7.99,
        category: "SIDE_DISH",
      },
    },
  ],
}

// Payment methods
const PAYMENT_METHODS = [
  { id: "cash", name: "Cash", icon: "dollar-sign" },
  { id: "card", name: "Credit Card", icon: "credit-card" },
  { id: "qr", name: "QR Code", icon: "smartphone" },
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
        console.error("Error fetching order:", error)
        Alert.alert("Error", "Failed to load order details")
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
      Alert.alert("Payment Successful", `Payment of $${calculateTotal().toFixed(2)} processed successfully.`, [
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
          <Text style={styles.loadingText}>Loading payment details...</Text>
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <View style={styles.orderInfoItem}>
              <Feather name="coffee" size={20} color="#D02C1A" />
              <Text style={styles.orderInfoText}>Table {order.tableNumber}</Text>
            </View>
            <View style={styles.orderInfoItem}>
              <Feather name="clock" size={20} color="#D02C1A" />
              <Text style={styles.orderInfoText}>
                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.orderSummaryCard}>
            {order.orderItems.map((item: any) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName}>{item.food.name}</Text>
                  <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>${(item.food.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
            </View>

            <View style={styles.discountContainer}>
              <View style={styles.discountLabelContainer}>
                <Text style={styles.summaryLabel}>Discount</Text>
              </View>
              <View style={styles.discountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.discountInput}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>
            </View>

            <View style={styles.tipContainer}>
              <View style={styles.tipLabelContainer}>
                <Text style={styles.summaryLabel}>Tip</Text>
              </View>
              <View style={styles.tipInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.tipInput}
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentMethodCard, selectedPaymentMethod === method.id && styles.selectedPaymentMethod]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <Feather
                  name={method.icon as any}
                  size={24}
                  color={selectedPaymentMethod === method.id ? "#D02C1A" : "#666"}
                />
                <Text
                  style={[
                    styles.paymentMethodName,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethodText,
                  ]}
                >
                  {method.name}
                </Text>
                {selectedPaymentMethod === method.id && (
                  <View style={styles.selectedCheckmark}>
                    <Feather name="check" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedPaymentMethod === "qr" && (
          <View style={styles.qrCodeContainer}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png",
              }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
            <Text style={styles.qrCodeText}>Scan this QR code to pay</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerButton, styles.cancelButton]} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.payButton]}
          onPress={handleProcessPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#fff" style={styles.payButtonIcon} />
              <Text style={styles.payButtonText}>Process Payment</Text>
            </>
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  orderSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    color: "#333",
  },
  orderItemQuantity: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  discountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  discountLabelContainer: {
    flex: 1,
  },
  discountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 120,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#666",
    marginRight: 4,
  },
  discountInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlign: "right",
  },
  tipContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tipLabelContainer: {
    flex: 1,
  },
  tipInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 120,
  },
  tipInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  paymentMethodsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  selectedPaymentMethod: {
    borderWidth: 2,
    borderColor: "#D02C1A",
  },
  paymentMethodName: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  selectedPaymentMethodText: {
    color: "#D02C1A",
    fontWeight: "bold",
  },
  selectedCheckmark: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#D02C1A",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 16,
    color: "#666",
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
  payButton: {
    backgroundColor: "#D02C1A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonIcon: {
    marginRight: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
