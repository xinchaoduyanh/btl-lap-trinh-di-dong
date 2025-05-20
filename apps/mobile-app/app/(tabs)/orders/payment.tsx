'use client'
import React, { useState, useEffect, useCallback } from 'react'

import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTheme } from '../../../context/ThemeContext'
import { Feather } from '@expo/vector-icons'
import { useOrder } from '../../../context/OrderContext'
import { useTable } from '../../../context/TableContext'
import { useAuth } from '../../../context/AuthContext'

// Payment methods - chỉ giữ lại tiền mặt và QR
const PAYMENT_METHODS = [
  { id: 'cash', name: 'Tiền mặt', icon: 'dollar-sign' },
  { id: 'qr', name: 'Mã QR', icon: 'smartphone' },
]

// Mock QR code data
const MOCK_QR_CODE = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment_order_'

export default function PaymentScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams()
  const orderId = params.id as string

  // Sử dụng các context
  const { fetchOrder, updateOrderPaymentStatus } = useOrder()
  const { updateTable } = useTable() // Sử dụng hàm updateTable hiện có
  const { user } = useAuth()
  const { fetchTables } = useTable()

  // State
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash')
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [paymentSteps, setPaymentSteps] = useState({
    updatingOrder: false,
    updatingTable: false,
  })

  // Fetch order data
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng')
        return
      }

      setLoading(true)
      try {
        const orderData = await fetchOrder(orderId)
        if (orderData) {
          setOrder(orderData)
        } else {
          setError('Không thể tải thông tin đơn hàng')
        }
      } catch (error) {
        console.error('Lỗi khi tải đơn hàng:', error)
        setError('Không thể tải thông tin đơn hàng')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId, fetchOrder])

  // Tạo QR code khi chọn phương thức thanh toán QR
  useEffect(() => {
    if (selectedPaymentMethod === 'qr' && order) {
      setShowQRCode(true)
      // Tạo mock QR code URL với orderId
      setQrCodeUrl(`${MOCK_QR_CODE}${order.id}_${Date.now()}`)
    } else {
      setShowQRCode(false)
    }
  }, [selectedPaymentMethod, order])

  // Calculate subtotal
  const calculateSubtotal = useCallback(() => {
    if (!order || !order.orderItems || !Array.isArray(order.orderItems)) return 0
    return order.orderItems.reduce((total: number, item: any) => {
      if (!item || !item.food) return total
      return total + (item.food.price || 0) * (item.quantity || 0)
    }, 0)
  }, [order])

  // Calculate tax (10%)
  const calculateTax = useCallback(() => {
    return calculateSubtotal() * 0.1
  }, [calculateSubtotal])

  // Calculate total
  const calculateTotal = useCallback(() => {
    return calculateSubtotal() + calculateTax()
  }, [calculateSubtotal, calculateTax])

  // Handle payment
  const handleProcessPayment = useCallback(async () => {
    if (processing || !order || !user) return

    setProcessing(true)

    try {
      // 1. Cập nhật trạng thái đơn hàng thành PAID và thêm timeOut
      setPaymentSteps(prev => ({ ...prev, updatingOrder: true }))
      const currentTime = new Date().toISOString()
      await updateOrderPaymentStatus(order.id, currentTime)
      setPaymentSteps(prev => ({ ...prev, updatingOrder: false, updatingTable: true }))

      // 2. Cập nhật trạng thái bàn thành CLEANING
      if (order.tableId) {
        await updateTable(order.tableId, { status: 'CLEANING' })
      }
      setPaymentSteps(prev => ({ ...prev, updatingTable: false }))

      // 3. Hiển thị thông báo thành công
      Alert.alert(
        'Thanh toán thành công',
        `Thanh toán ${Math.round(calculateTotal())}đ đã được xử lý thành công.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error)
      Alert.alert('Lỗi', 'Không thể hoàn tất thanh toán. Vui lòng thử lại sau.')
    } finally {
      setProcessing(false)
      setPaymentSteps({
        updatingOrder: false,
        updatingTable: false,
      })
    }
  }, [
    processing,
    order,
    user,
    updateOrderPaymentStatus,
    updateTable, // Sử dụng updateTable thay vì updateTableStatus
    calculateTotal,
    router,
  ])

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

  if (error || !order) {
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
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error || 'Không thể tải thông tin đơn hàng'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
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
              <Text style={styles.orderInfoText}>
                Bàn {order.table ? order.table.number : 'N/A'}
              </Text>
            </View>
            <View style={styles.orderInfoItem}>
              <Feather name="clock" size={16} color="#D02C1A" />
              <Text style={styles.orderInfoText}>
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>

          {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
            order.orderItems.map((item: any) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>
                    {item && item.food ? item.food.name : 'Món không xác định'}
                  </Text>
                  <Text style={styles.orderItemQuantity}>x{item ? item.quantity : 0}</Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  {Math.round(
                    ((item && item.food ? item.food.price : 0) || 0) * (item ? item.quantity : 0)
                  )}
                  đ
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>Không có món ăn nào</Text>
          )}

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
                  color={selectedPaymentMethod === method.id ? '#fff' : '#333'}
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

        {showQRCode && (
          <View style={styles.qrCodeContainer}>
            <Image source={{ uri: qrCodeUrl }} style={styles.qrCodeImage} resizeMode="contain" />
            <Text style={styles.qrCodeText}>
              Quét mã QR để thanh toán {Math.round(calculateTotal())}đ
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.processButton, processing && styles.processingButton]}
          onPress={handleProcessPayment}
          disabled={processing}
        >
          <Text style={styles.processButtonText}>
            {processing ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
          </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D02C1A',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  noItemsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  summarySection: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  paymentMethodsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
  },
  selectedPaymentMethod: {
    backgroundColor: '#D02C1A',
    borderColor: '#D02C1A',
  },
  paymentMethodText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
  },
  selectedPaymentMethodText: {
    color: '#fff',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  qrCodeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  processButton: {
    backgroundColor: '#D02C1A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  processingButton: {
    opacity: 0.7,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D02C1A',
  },
  cancelButtonText: {
    color: '#D02C1A',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#D02C1A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
