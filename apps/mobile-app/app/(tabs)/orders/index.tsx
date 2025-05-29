'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useTheme } from '../../../context/ThemeContext'
import { Feather } from '@expo/vector-icons'
import { usePreparingOrders, useOrder } from '../../../context/OrderContext'
import { useOrderItem } from '../../../context/OrderItemContext'
import { useTable } from '../../../context/TableContext'
import { config } from '../../../config/env'
import { useAuth } from '../../../context/AuthContext'

// Components
import { Header } from '../../../components/Header'

// Import interfaces and types
import type { OrderItemStatus, Order } from '../../../constants/interface'
import { STATUS_COLORS, DEFAULT_FOOD_IMAGE } from './types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function OrderManagementScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Use context hooks
  const {
    preparingOrders: orders,
    loading,
    fetchPreparingOrders: fetchOrders,
    getOrderStatus,
    getTotalItems,
    getTotalAmount,
  } = usePreparingOrders()

  const { deleteOrder } = useOrder()

  const filteredOrders = orders

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchOrders().finally(() => setRefreshing(false))
  }, [fetchOrders])

  const formatTime = useCallback((dateString: string) => {
    try {
      const orderDate = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - orderDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 60) {
        return `${diffMins} phút trước`
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)} giờ trước`
      } else {
        return `${Math.floor(diffMins / 1440)} ngày trước`
      }
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Invalid time'
    }
  }, [])

  const handleAddOrder = useCallback(() => {
    router.push('/orders/add-order')
  }, [router])

  const handleEditOrder = useCallback(
    (order: Order) => {
      router.push({
        pathname: '/(tabs)/orders/edit-order',
        params: { id: order.id },
      })
    },
    [router]
  )

  // Xử lý khi nhấn nút xóa đơn hàng - đơn giản hóa
  const handleDeleteOrder = useCallback((order: Order) => {
    setSelectedOrderId(order.id)
    setDeleteModalVisible(true)
  }, [])

  // Xác nhận xóa đơn hàng - đơn giản hóa
  const confirmDeleteOrder = useCallback(async () => {
    if (selectedOrderId) {
      try {
        setRefreshing(true) // Hiển thị trạng thái loading

        console.log(`Confirming deletion of order: ${selectedOrderId}`)
        await deleteOrder(selectedOrderId)
        Alert.alert('Thành công', 'Đơn hàng đã được xóa thành công')
      } catch (error) {
        console.error('Lỗi khi xóa đơn hàng:', error)
        Alert.alert('Lỗi', 'Không thể xóa đơn hàng. Vui lòng thử lại sau.')
      } finally {
        setRefreshing(false)
        setDeleteModalVisible(false)
        setSelectedOrderId(null)
      }
    }
  }, [selectedOrderId, deleteOrder])

  // Thay đổi hàm xử lý thanh toán để chuyển hướng sang trang payment
  const handlePayment = useCallback(
    (order: Order) => {
      router.push({
        pathname: '/(tabs)/orders/payment',
        params: { id: order.id },
      })
    },
    [router]
  )

  // Add focus effect to fetch orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders()
    }, [fetchOrders])
  )

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Quản lý đơn hàng" onBackPress={() => router.push('/(tabs)')} />

      <View style={styles.bannerContainer}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/8160608/pexels-photo-8160608.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Thiên đường lẩu</Text>
          <Text style={styles.bannerSubtitle}>Quản lý tất cả đơn hàng</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D02C1A" />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                  </View>
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handlePayment(order)}
                    >
                      <Feather name="credit-card" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteOrder(order)}
                    >
                      <Feather name="trash-2" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditOrder(order)}
                    >
                      <Feather name="edit" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.orderCardBody}>
                  <View style={styles.orderInfoRow}>
                    <View style={styles.orderInfoItem}>
                      <Feather name="coffee" size={16} color="#D02C1A" />
                      <Text style={styles.orderInfoText}>Bàn {order.table?.number}</Text>
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

                  <Text style={styles.itemsTitle}>Các món đã đặt:</Text>
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item) => (
                      <View key={item.id} style={styles.orderItem}>
                        <Image
                          source={{ uri: item.food?.imageUrl || DEFAULT_FOOD_IMAGE }}
                          style={styles.foodItemImage}
                          resizeMode="cover"
                        />
                        <View style={styles.orderItemDetails}>
                          <View style={styles.itemNameContainer}>
                            <Text style={styles.itemName}>{item.food?.name}</Text>
                            <View
                              style={[
                                styles.itemStatusBadge,
                                {
                                  backgroundColor:
                                    STATUS_COLORS[item.status as keyof typeof STATUS_COLORS],
                                },
                              ]}
                            >
                              <Text style={styles.itemStatusText}>{item.status}</Text>
                            </View>
                          </View>
                          <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>
                          {Math.round((item.food?.price || 0) * (item.quantity || 0))}đ
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>Không có món nào</Text>
                  )}

                  <View style={styles.divider} />

                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng tiền:</Text>
                    <Text style={styles.totalValue}>{Math.round(getTotalAmount(order))}đ</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={{
                  uri: 'https://gifdb.com/images/high/positive-vibes-positive-energy-care-bears-xknwls1qzeaw7as3.gif',
                }}
                style={styles.emptyImage}
                resizeMode="cover"
              />
              <View style={styles.messageContainer}>
                <Text style={styles.emptyTitle}>Chúc mừng nhân viên yêu dấu!</Text>
                <View style={styles.divider} />
                <Text style={styles.emptySubtitle}>
                  Vì hiện tại không có Bàn nào đang cần phục vụ.{'\n'}Hãy nghỉ ngơi 1 lúc nhé &lt;3
                </Text>
                <View style={styles.iconContainer}>
                  <Feather name="star" size={24} color="#FFD700" style={styles.icon} />
                  <Feather name="heart" size={24} color="#FF69B4" style={styles.icon} />
                  <Feather name="award" size={24} color="#D02C1A" style={styles.icon} />
                </View>
                <Text style={styles.emptyMessage}>Bạn luôn là Nhân viên số 1</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal xác nhận xóa đơn hàng */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác nhận xóa</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Feather name="x" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Feather name="alert-triangle" size={50} color="#F44336" style={styles.modalIcon} />
              <Text style={styles.modalMessage}>Bạn có chắc chắn muốn xóa đơn hàng này?</Text>
              <Text style={styles.modalSubMessage}>
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteOrder}
              >
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bannerContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
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
    fontWeight: 'bold',
    color: '#D02C1A',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderTime: {
    color: '#666',
    fontSize: 12,
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#D02C1A',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  orderCardBody: {
    padding: 12,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  itemStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyImage: {
    width: 400,
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D02C1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emptyMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D02C1A',
    textAlign: 'center',
    marginTop: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  icon: {
    marginHorizontal: 12,
  },
  addOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D02C1A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addOrderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D02C1A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    backgroundColor: '#D02C1A',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalSubMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  okButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  okButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paymentModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentModalBody: {
    padding: 16,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  paymentValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D02C1A',
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
  confirmPaymentButton: {
    flexDirection: 'row',
    backgroundColor: '#D02C1A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  confirmPaymentText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  foodItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
})
