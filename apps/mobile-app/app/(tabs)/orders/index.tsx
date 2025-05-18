"use client"
import { useState, useMemo, useCallback, useEffect } from "react"
import { StyleSheet, ScrollView, View, Image, Text, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert, LogBox } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "../../../context/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { usePreparingOrders } from "../../../context/OrderContext"
import { useOrderItem } from "../../../context/OrderItemContext"

// Components
import { Header } from "../../../components/Header"
import { TabBar } from "../../../components/TabBar"

// Import interfaces
import { OrderItemStatus, Order } from "../../../constants/interface"

// Order status colors
const STATUS_COLORS: Record<OrderItemStatus | 'DELIVERED' | 'COMPLETED', string> = {
  PENDING: "#FF9800",
  PREPARING: "#2196F3",
  READY: "#4CAF50",
  DELIVERED: "#9C27B0",
  COMPLETED: "#607D8B",
  COMPLETE: "#4CAF50"
}

const EditOrderForm = ({ order, onClose, onSave }: { order: Order | null, onClose: () => void, onSave: () => void }) => {
  const [editedItems, setEditedItems] = useState<any[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const { updateOrderItem, deleteOrderItem, loading: orderItemLoading } = useOrderItem()

  useEffect(() => {
    if (order) {
      setEditedItems(order.orderItems || [])
    }
  }, [order])

  const handleUpdateItemStatus = useCallback(async (itemId: string, newStatus: OrderItemStatus) => {
    setEditedItems(prev => prev.map(item =>
      item && item.id === itemId ? { ...item, status: newStatus } : item
    ))
    setHasChanges(true)
  }, [])

  const handleUpdateItemQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setEditedItems(prev => prev.map(item =>
      item && item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
    setHasChanges(true)
  }, [])

  const handleRemoveItem = useCallback(async (itemId: string) => {
    setEditedItems(prev => prev.filter(item => item && item.id !== itemId))
    setHasChanges(true)
  }, [])

  const handleSaveChanges = useCallback(async () => {
    if (!order || !hasChanges) return

    try {
      for (const item of editedItems) {
        if (!item) continue
        const originalItem = order.orderItems?.find(oi => oi && oi.id === item.id)
        if (!originalItem) {
          // Handle new item if needed
        } else if (JSON.stringify(originalItem) !== JSON.stringify(item)) {
          await updateOrderItem(item.id, {
            status: item.status,
            quantity: item.quantity
          })
        }
      }

      const deletedItems = order.orderItems?.filter(
        oi => oi && !editedItems.find(ti => ti && ti.id === oi.id)
      ) || []

      for (const item of deletedItems) {
        if (!item) continue
        await deleteOrderItem(item.id)
      }

      setHasChanges(false)
      setShowUpdateForm(false)
      onSave()
    } catch (error) {
      console.error('Error updating order items:', error)
      Alert.alert('Error', 'Failed to save changes')
    }
  }, [order, hasChanges, editedItems, updateOrderItem, deleteOrderItem, onSave])

  const handlePayment = useCallback(() => {
    // Implement payment logic here
    Alert.alert('Thanh toán', 'Xác nhận thanh toán đơn hàng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: () => {
          // Add payment logic here
          Alert.alert('Thành công', 'Đơn hàng đã được thanh toán')
          onClose()
        }
      }
    ])
  }, [onClose])

  const handleToggleEditForm = useCallback(() => {
    if (showUpdateForm && hasChanges) {
      Alert.alert(
        'Xác nhận',
        'Bạn có muốn hủy các thay đổi?',
        [
          { text: 'Không', style: 'cancel' },
          {
            text: 'Có',
            onPress: () => {
              setEditedItems(order?.orderItems || [])
              setHasChanges(false)
              setShowUpdateForm(false)
            }
          }
        ]
      )
    } else {
      setShowUpdateForm(!showUpdateForm)
    }
  }, [showUpdateForm, hasChanges, order])

  if (!order) return null

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chỉnh sửa đơn hàng</Text>
          <View style={styles.modalHeaderButtons}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modalBody}>
          <Text style={styles.tableInfo}>
            Bàn: {order.table?.number || 'Unknown'}
          </Text>

          {showUpdateForm ? (
            <ScrollView style={styles.itemsList}>
              {editedItems.map((item) => (
                <View key={item.id} style={styles.editItemContainer}>
                  <View style={styles.editItemInfo}>
                    <Text style={styles.editItemName}>{item.food?.name}</Text>
                    <Text style={styles.editItemPrice}>${item.food?.price}</Text>
                  </View>

                  <View style={styles.editItemControls}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                        style={styles.quantityButton}
                        disabled={orderItemLoading}
                      >
                        <Feather name="minus" size={16} color="#D02C1A" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                        style={styles.quantityButton}
                        disabled={orderItemLoading}
                      >
                        <Feather name="plus" size={16} color="#D02C1A" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.statusControl}>
                      <TouchableOpacity
                        style={[styles.statusButton, { backgroundColor: STATUS_COLORS[item.status as OrderItemStatus] }]}
                        onPress={() => {
                          const statuses: OrderItemStatus[] = ['PENDING', 'PREPARING', 'READY']
                          const currentIndex = statuses.indexOf(item.status)
                          const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                          handleUpdateItemStatus(item.id, nextStatus)
                        }}
                        disabled={orderItemLoading}
                      >
                        <Text style={styles.statusButtonText}>{item.status}</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      style={styles.removeButton}
                      disabled={orderItemLoading}
                    >
                      <Feather name="trash-2" size={16} color="#D02C1A" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.itemsList}>
              {editedItems.map((item) => (
                <View key={item.id} style={styles.orderItemCard}>
                  <View style={styles.orderItemHeader}>
                    <Text style={styles.itemName}>{item.food?.name}</Text>
                    <View style={[styles.itemStatusBadge, { backgroundColor: STATUS_COLORS[item.status as OrderItemStatus] }]}>
                      <Text style={styles.itemStatusText}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.orderItemDetailsInner}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Số lượng:</Text>
                      <Text style={styles.detailValue}>x{item.quantity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Đơn giá:</Text>
                      <Text style={styles.detailValue}>${item.food?.price}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Thành tiền:</Text>
                      <Text style={styles.detailValue}>${((item.food?.price || 0) * item.quantity).toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.modalButton, styles.backButton]}
            onPress={() => {
              if (hasChanges) {
                Alert.alert(
                  'Xác nhận',
                  'Bạn có muốn hủy các thay đổi?',
                  [
                    { text: 'Không', style: 'cancel' },
                    {
                      text: 'Có',
                      onPress: () => {
                        setEditedItems(order.orderItems || [])
                        setHasChanges(false)
                        onClose()
                      }
                    }
                  ]
                )
              } else {
                onClose()
              }
            }}
          >
            <Text style={styles.backButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.updateButton]}
            onPress={handleToggleEditForm}
          >
            <Text style={styles.updateButtonText}>
              {showUpdateForm ? 'Xem chi tiết' : 'Chỉnh sửa'}
            </Text>
          </TouchableOpacity>
          {showUpdateForm && hasChanges && (
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveChanges}
              disabled={orderItemLoading}
            >
              <Text style={styles.saveButtonText}>
                {orderItemLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Text>
            </TouchableOpacity>
          )}
          {!showUpdateForm && (
            <TouchableOpacity
              style={[styles.modalButton, styles.paymentButton]}
              onPress={handlePayment}
            >
              <Text style={styles.paymentButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

export default function OrderManagementScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState("All Orders")
  const [refreshing, setRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editedItems, setEditedItems] = useState<any[]>([])
  const [showOrderItemsForm, setShowOrderItemsForm] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [tempEditedItems, setTempEditedItems] = useState<any[]>([])

  const {
    preparingOrders: orders,
    loading,
    fetchPreparingOrders: fetchOrders,
    getOrderItemsByStatus,
    getTotalItems,
    getTotalAmount,
    getOrderStatus,
  } = usePreparingOrders()

  const {
    loading: orderItemLoading,
    updateOrderItem,
    deleteOrderItem,
    createOrderItem,
  } = useOrderItem()

  const tabs = ["All Orders", "PENDING", "PREPARING", "READY", "DELIVERED"]

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    console.warn('All Orders:', orders);
    const filtered = activeTab === "All Orders"
      ? orders
      : orders.filter((order) => order && getOrderStatus(order) === activeTab);
    console.warn('Filtered Orders:', filtered);
    return filtered;
  }, [activeTab, orders, getOrderStatus])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchOrders().finally(() => {
      setRefreshing(false)
    })
  }, [fetchOrders])

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

  const handleAddOrder = useCallback(() => {
    router.push("/(tabs)/orders/add-order")
  }, [router])

  const handleEditOrder = useCallback((order: Order | null) => {
    if (!order) return;

    // Ensure we have a valid order with orderItems
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];

    setSelectedOrder(order);
    setEditedItems(orderItems);
    setTempEditedItems(orderItems);
    setHasChanges(false);
    setIsModalVisible(true);
  }, []);

  const handleUpdateItemStatus = useCallback(async (itemId: string, newStatus: OrderItemStatus) => {
    if (!selectedOrder) return;
    setTempEditedItems(prev => prev.map(item =>
      item && item.id === itemId ? { ...item, status: newStatus } : item
    ));
    setHasChanges(true);
  }, [selectedOrder]);

  const handleUpdateItemQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (!selectedOrder || newQuantity < 1) return;
    setTempEditedItems(prev => prev.map(item =>
      item && item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
    setHasChanges(true);
  }, [selectedOrder]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    if (!selectedOrder) return;
    setTempEditedItems(prev => prev.filter(item => item && item.id !== itemId));
    setHasChanges(true);
  }, [selectedOrder]);

  const handleSaveChanges = useCallback(async () => {
    if (!selectedOrder || !hasChanges) return;

    try {
      for (const item of tempEditedItems) {
        if (!item) continue;
        const originalItem = editedItems.find(oi => oi && oi.id === item.id);
        if (!originalItem) {
          await createOrderItem(item);
        } else if (JSON.stringify(originalItem) !== JSON.stringify(item)) {
          await updateOrderItem(item.id, {
            status: item.status,
            quantity: item.quantity
          });
        }
      }

      const deletedItems = editedItems.filter(
        oi => oi && !tempEditedItems.find(ti => ti && ti.id === oi.id)
      );
      for (const item of deletedItems) {
        if (!item) continue;
        await deleteOrderItem(item.id);
      }

      await fetchOrders();
      setIsModalVisible(false);
      setShowEditForm(true);
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating order items:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  }, [selectedOrder, hasChanges, tempEditedItems, editedItems, createOrderItem, updateOrderItem, deleteOrderItem, fetchOrders]);

  const handleCancelChanges = useCallback(() => {
    setTempEditedItems([...editedItems])
    setHasChanges(false)
  }, [editedItems])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D02C1A" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Order Management"
        onBackPress={() => router.back()}
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
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#D02C1A" />
          </View>
        ) : filteredOrders && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            // Add null check for order
            if (!order) return null;

            // Ensure orderItems is an array and handle all possible cases
            const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];

            return (
              <View key={order.id} style={styles.orderCardContainer}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderIdContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[getOrderStatus(order) as keyof typeof STATUS_COLORS] }]}>
                      <Text style={styles.statusText}>{getOrderStatus(order)}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderTime}>{formatTime(order.createdAt || '')}</Text>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditOrder(order)}
                  >
                    <Text style={styles.actionButtonText}>Thao tác</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.orderCardBody}>
                  <View style={styles.orderInfoRow}>
                    <View style={styles.orderInfoItem}>
                      <Feather name="users" size={16} color="#D02C1A" />
                      <Text style={styles.orderInfoText}>Table {order.table?.number || 'Unknown'}</Text>
                    </View>
                    <View style={styles.orderInfoItem}>
                      <Feather name="clock" size={16} color="#D02C1A" />
                      <Text style={styles.orderInfoText}>
                        {new Date(order.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.itemsTitle}>Order Items:</Text>
                  {orderItems.length > 0 ? (
                    orderItems.map((item) => {
                      if (!item) return null;

                      return (
                        <View key={item.id} style={styles.orderItem}>
                          <View style={styles.orderItemDetailsCard}>
                            <View style={styles.itemNameContainer}>
                              <Text style={styles.itemName}>{item.food?.name || 'Unknown Item'}</Text>
                              <View style={[styles.itemStatusBadge, { backgroundColor: STATUS_COLORS[item.status || 'PENDING'] }]}>
                                <Text style={styles.itemStatusText}>{item.status || 'PENDING'}</Text>
                              </View>
                            </View>
                            <Text style={styles.itemQuantity}>x{item.quantity || 0}</Text>
                          </View>
                          <Text style={styles.itemPrice}>${((item.food?.price || 0) * (item.quantity || 0)).toFixed(2)}</Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.emptyText}>No items in this order</Text>
                  )}

                  <View style={styles.divider} />

                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabelText}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>${getTotalAmount(order).toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="coffee" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Hiện tại không có khách</Text>
            <Text style={styles.emptySubText}>Hãy chờ đợi khách hàng đặt món</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fabButton} onPress={handleAddOrder}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <EditOrderForm
          order={selectedOrder}
          onClose={() => {
            setIsModalVisible(false)
            setSelectedOrder(null)
          }}
          onSave={() => {
            setIsModalVisible(false)
            setSelectedOrder(null)
            fetchOrders()
          }}
        />
      </Modal>

      {/* Order Items Form Modal */}
      <Modal
        visible={showOrderItemsForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderItemsForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity onPress={() => setShowOrderItemsForm(false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.orderInfoSection}>
                <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bàn số:</Text>
                  <Text style={styles.infoValue}>{selectedOrder?.table?.number || 'Unknown'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thời gian:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedOrder?.createdAt || '').toLocaleString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Trạng thái:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[getOrderStatus(selectedOrder!) as keyof typeof STATUS_COLORS] }]}>
                    <Text style={styles.statusText}>{getOrderStatus(selectedOrder!)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Danh sách món ăn</Text>
                <ScrollView style={styles.itemsList}>
                  {editedItems.map((item) => (
                    <View key={item.id} style={styles.orderItemCard}>
                      <View style={styles.orderItemHeader}>
                        <Text style={styles.itemName}>{item.food?.name}</Text>
                        <View style={[styles.itemStatusBadge, { backgroundColor: STATUS_COLORS[item.status as OrderItemStatus] }]}>
                          <Text style={styles.itemStatusText}>{item.status}</Text>
                        </View>
                      </View>
                      <View style={styles.orderItemDetailsInner}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Số lượng:</Text>
                          <Text style={styles.detailValue}>x{item.quantity}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Đơn giá:</Text>
                          <Text style={styles.detailValue}>${item.food?.price}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Thành tiền:</Text>
                          <Text style={styles.detailValue}>${((item.food?.price || 0) * item.quantity).toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabelText}>Tổng số món:</Text>
                  <Text style={styles.totalValue}>{getTotalItems(selectedOrder!)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabelText}>Tổng tiền:</Text>
                  <Text style={[styles.totalValue, { color: '#D02C1A' }]}>
                    ${getTotalAmount(selectedOrder!).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.backButton]}
                onPress={() => setShowOrderItemsForm(false)}
              >
                <Text style={styles.modalButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.paymentButton]}
              >
                <Text style={styles.modalButtonText}>Thanh toán</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Form Modal */}
      <Modal
        visible={showEditForm && !!selectedOrder}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa đơn hàng</Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity onPress={() => setShowEditForm(false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.tableInfo}>
                Bàn: {selectedOrder?.table?.number || 'Unknown'}
              </Text>

              <ScrollView style={styles.itemsList}>
                {tempEditedItems?.map((item) => (
                  <View key={item.id} style={styles.editItemContainer}>
                    <View style={styles.editItemInfo}>
                      <Text style={styles.editItemName}>{item.food?.name}</Text>
                      <Text style={styles.editItemPrice}>${item.food?.price}</Text>
                    </View>

                    <View style={styles.editItemControls}>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          onPress={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                          style={styles.quantityButton}
                          disabled={orderItemLoading}
                        >
                          <Feather name="minus" size={16} color="#D02C1A" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                          style={styles.quantityButton}
                          disabled={orderItemLoading}
                        >
                          <Feather name="plus" size={16} color="#D02C1A" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.statusControl}>
                        <TouchableOpacity
                          style={[styles.statusButton, { backgroundColor: STATUS_COLORS[item.status as OrderItemStatus] }]}
                          onPress={() => {
                            const statuses: OrderItemStatus[] = ['PENDING', 'PREPARING', 'READY']
                            const currentIndex = statuses.indexOf(item.status)
                            const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                            handleUpdateItemStatus(item.id, nextStatus)
                          }}
                          disabled={orderItemLoading}
                        >
                          <Text style={styles.statusButtonText}>{item.status}</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleRemoveItem(item.id)}
                        style={styles.removeButton}
                        disabled={orderItemLoading}
                      >
                        <Feather name="trash-2" size={16} color="#D02C1A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.backButton]}
                onPress={() => setShowEditForm(false)}
              >
                <Text style={styles.modalButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={handleSaveChanges}
                disabled={orderItemLoading || !hasChanges}
              >
                <Text style={styles.modalButtonText}>
                  {orderItemLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                </Text>
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
  orderItemDetailsCard: {
    flex: 1,
  },
  orderItemDetailsInner: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
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
  totalLabelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D02C1A", // Hot pot red color
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptySubText: {
    marginTop: 5,
    color: "#999",
    fontSize: 14,
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
  actionButton: {
    backgroundColor: "#D02C1A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    flex: 1,
  },
  tableInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  itemsList: {
    maxHeight: '70%',
  },
  editItemContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  editItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  editItemPrice: {
    fontSize: 16,
    color: '#D02C1A',
    fontWeight: '500',
  },
  editItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D02C1A',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  statusControl: {
    flex: 1,
    marginHorizontal: 10,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D02C1A',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#607D8B',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  paymentButton: {
    backgroundColor: '#D02C1A',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderInfoSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  itemsSection: {
    flex: 1,
  },
  orderItemCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalSection: {
    marginTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
})
