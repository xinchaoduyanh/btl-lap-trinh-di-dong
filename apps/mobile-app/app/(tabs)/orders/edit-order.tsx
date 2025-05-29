'use client'
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  FlatList,
  Image,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'

import { useTheme } from '../../../context/ThemeContext'
import { Feather } from '@expo/vector-icons'
import { useOrderItem } from '../../../context/OrderItemContext'
import { useOrder } from '../../../context/OrderContext'
import { useFood } from '../../../context/FoodContext'

// Import interfaces
import type { OrderItemStatus, Food } from '../../../constants/interface'
import { router } from 'expo-router'

// Order status colors
const STATUS_COLORS: Record<OrderItemStatus | string, string> = {
  PENDING: '#FF9800',
  PREPARING: '#2196F3',
  READY: '#4CAF50',
  DELIVERED: '#9C27B0',
  COMPLETED: '#607D8B',
  COMPLETE: '#4CAF50',
}

const DEFAULT_FOOD_IMAGE =
  'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'

export default function EditOrderScreen() {
  const params = useLocalSearchParams()
  const orderId = params.id as string

  const { colors } = useTheme()

  // Use context hooks
  const { fetchOrder: fetchOrderById } = useOrder()
  const {
    updateOrderItem,
    deleteOrderItem,
    createOrderItem,
    loading: orderItemLoading,
  } = useOrderItem()
  const { foods, loading: foodsLoading, fetchFoods } = useFood()

  // State
  const [order, setOrder] = useState<any>(null)
  const [editedItems, setEditedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // State for add item modal
  const [addItemModalVisible, setAddItemModalVisible] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [searchQuery, setSearchQuery] = useState('')

  // Add useFocusEffect to refresh data when screen comes into focus
  const fetchOrderData = useCallback(() => {
    setLoading(true)
    fetchOrderById(orderId)
      .then((data) => {
        setOrder(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching order:', error)
        setLoading(false)
      })
  }, [orderId, fetchOrderById])

  // Use this effect for initial load
  useEffect(() => {
    fetchOrderData()
  }, [fetchOrderData])

  // Add this to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrderData()
      return () => {
        // Cleanup if needed
      }
    }, [fetchOrderData])
  )

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

  // Fetch foods data
  useEffect(() => {
    fetchFoods()
  }, [])

  // Update item quantity
  const handleUpdateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setEditedItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    )
  }, [])

  // Update item status
  const handleUpdateStatus = useCallback((itemId: string) => {
    const statusOrder: OrderItemStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETE']
    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentIndex = statusOrder.indexOf(item.status as OrderItemStatus)
          const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
          return { ...item, status: nextStatus }
        }
        return item
      })
    )
  }, [])

  // Remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    Alert.alert('Xóa món', 'Bạn có chắc muốn xóa món này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setEditedItems((prev) => prev.filter((item) => item.id !== itemId))
        },
      },
    ])
  }, [])

  // Open add item modal
  const handleOpenAddItemModal = useCallback(() => {
    // Instead of showing the modal, navigate to add-order with params
    router.push({
      pathname: '/(tabs)/orders/add-order',
      params: {
        orderId: orderId,
        tableId: order?.tableId,
        isAddingToExistingOrder: 'true',
      },
    })
  }, [orderId, order?.tableId, router])

  // Handle select food
  const handleSelectFood = useCallback((food: Food) => {
    setSelectedFood(food)
    setQuantity('1')
  }, [])

  // Increment quantity
  const incrementQuantity = useCallback(() => {
    const newQuantity = Number.parseInt(quantity) + 1
    setQuantity(String(newQuantity))
  }, [quantity])

  // Decrement quantity
  const decrementQuantity = useCallback(() => {
    const newQuantity = Math.max(1, Number.parseInt(quantity) - 1)
    setQuantity(String(newQuantity))
  }, [quantity])

  // Add item to order
  const handleAddItemToOrder = useCallback(() => {
    if (!selectedFood) return

    const parsedQuantity = Number.parseInt(quantity)
    if (parsedQuantity < 1) {
      Alert.alert('Lỗi', 'Số lượng phải ít nhất là 1')
      return
    }

    // Check if item already exists in order
    const existingItemIndex = editedItems.findIndex((item) => item.food.id === selectedFood.id)

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      setEditedItems((prev) =>
        prev.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + parsedQuantity } : item
        )
      )
    } else {
      // Add new item
      const newItem = {
        id: `temp-${Date.now()}`, // Temporary ID, will be replaced after saving
        orderId: orderId,
        foodId: selectedFood.id,
        food: selectedFood,
        quantity: parsedQuantity,
        status: 'PENDING' as OrderItemStatus,
        isNew: true, // Flag to identify new items
      }
      setEditedItems((prev) => [...prev, newItem])
    }

    setAddItemModalVisible(false)
  }, [selectedFood, quantity, editedItems, orderId])

  // Filter foods based on search query
  const filteredFoods = useCallback(() => {
    if (!searchQuery.trim()) return foods
    return foods.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [foods, searchQuery])

  // Lưu thay đổi
  const handleSaveChanges = useCallback(async () => {
    if (!hasChanges) return

    setSaving(true)
    try {
      // Handle existing items that were modified
      for (const item of editedItems) {
        if (item.isNew) {
          // Handle new items
          await createOrderItem({
            orderId: orderId,
            foodId: item.food.id,
            quantity: item.quantity,
            status: item.status,
          })
        } else {
          const originalItem = order.orderItems.find((oi: any) => oi.id === item.id)
          if (!originalItem) {
            // Skip if original item not found
            continue
          } else if (JSON.stringify(originalItem) !== JSON.stringify(item)) {
            // Update modified items
            await updateOrderItem(item.id, {
              status: item.status,
              quantity: item.quantity,
            })
          }
        }
      }

      // Handle deleted items
      const deletedItems = order.orderItems.filter(
        (oi: any) => !editedItems.find((item) => item.id === oi.id)
      )
      for (const item of deletedItems) {
        await deleteOrderItem(item.id)
      }

      Alert.alert('Thành công', 'Đơn hàng đã được cập nhật thành công')
      router.replace('/(tabs)/orders')
    } catch (error) {
      console.error('Lỗi khi lưu thay đổi:', error)
      Alert.alert('Lỗi', 'Không thể lưu thay đổi')
    } finally {
      setSaving(false)
    }
  }, [
    hasChanges,
    editedItems,
    order,
    router,
    updateOrderItem,
    deleteOrderItem,
    createOrderItem,
    orderId,
  ])

  // Cancel changes
  const handleCancelChanges = useCallback(() => {
    if (hasChanges) {
      Alert.alert('Hủy thay đổi', 'Bạn có chắc muốn hủy các thay đổi?', [
        { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
        {
          text: 'Hủy',
          style: 'destructive',
          onPress: () => router.push('/(tabs)/orders'),
        },
      ])
    } else {
      router.push('/(tabs)/orders')
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
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Các món đã đặt</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAddItemModal}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Thêm món</Text>
          </TouchableOpacity>
        </View>

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
                  <Text style={styles.priceValue}>{Math.round(item.food.price)}đ</Text>
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
                  <Text style={styles.subtotalValue}>
                    {Math.round(item.food.price * item.quantity)}đ
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Feather name="trash-2" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>{Math.round(calculateTotal())}đ</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.cancelButton]}
          onPress={handleCancelChanges}
        >
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

      {/* Add Item Modal */}
      <Modal
        visible={addItemModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addItemModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm món vào đơn hàng</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setAddItemModalVisible(false)}
              >
                <Feather name="x" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {selectedFood ? (
              <View style={styles.selectedFoodContainer}>
                <View style={styles.selectedFoodHeader}>
                  <Text style={styles.selectedFoodTitle}>Món đã chọn</Text>
                  <TouchableOpacity
                    style={styles.backToListButton}
                    onPress={() => setSelectedFood(null)}
                  >
                    <Feather name="arrow-left" size={16} color="#D02C1A" />
                    <Text style={styles.backToListText}>Quay lại danh sách</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedFoodCard}>
                  <Image
                    source={{ uri: selectedFood?.imageUrl || DEFAULT_FOOD_IMAGE }}
                    style={styles.modalItemImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                  <Text style={styles.selectedFoodPrice}>{Math.round(selectedFood.price)}đ</Text>

                  <View style={styles.quantityControlContainer}>
                    <Text style={styles.quantityLabel}>Số lượng:</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
                        <Feather name="minus" size={18} color="#D02C1A" />
                      </TouchableOpacity>

                      <TextInput
                        style={styles.quantityInput}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="number-pad"
                      />

                      <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                        <Feather name="plus" size={18} color="#D02C1A" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.addToOrderButton} onPress={handleAddItemToOrder}>
                    <Feather name="plus" size={18} color="#fff" />
                    <Text style={styles.addToOrderButtonText}>Thêm vào đơn hàng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={filteredFoods()}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(item)}>
                    <View style={styles.foodItemInfo}>
                      <Text style={styles.foodItemName}>{item.name}</Text>
                      <Text style={styles.foodItemCategory}>{item.category}</Text>
                    </View>
                    <Text style={styles.foodItemPrice}>{Math.round(item.price)}đ</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <Feather name="alert-circle" size={40} color="#ccc" />
                    <Text style={styles.emptyListText}>
                      {searchQuery ? 'Không tìm thấy món ăn phù hợp' : 'Không có món ăn nào'}
                    </Text>
                  </View>
                }
              />
            )}
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#D02C1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderInfoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemsList: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D02C1A',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  removeButton: {
    alignSelf: 'center',
    backgroundColor: '#F44336',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#607D8B',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // New styles for add item functionality
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D02C1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#D02C1A',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  selectedFoodContainer: {
    marginBottom: 16,
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedFoodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToListText: {
    marginLeft: 4,
    color: '#D02C1A',
  },
  selectedFoodCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedFoodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D02C1A',
    borderRadius: 20,
    overflow: 'hidden',
  },
  quantityInput: {
    width: 60,
    height: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  addToOrderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToOrderButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  foodItemCategory: {
    fontSize: 14,
    color: '#666',
  },
  foodItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  emptyListContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalItemImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
})
