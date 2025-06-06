'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '../../../context/ThemeContext'
import { Feather } from '@expo/vector-icons'
import { useFood } from '../../../context/FoodContext'
import { useTable } from '../../../context/TableContext'
import { useOrder } from '../../../context/OrderContext'
import { useOrderItem } from '../../../context/OrderItemContext'
import { useAuth } from '../../../context/AuthContext'
import { useLocalSearchParams } from 'expo-router'

// Components
import { Header } from '../../../components/Header'

// Import interfaces
import type {
  Table,
  Food,
  FoodCategory,
  OrderItemStatus,
  CreateOrderRequest,
} from '../../../constants/interface'

// Food categories based on your schema
const FOOD_CATEGORIES = [
  { id: 'cat1', name: 'MAIN_COURSE', icon: 'disc', label: 'Món chính' },
  { id: 'cat2', name: 'APPETIZER', icon: 'coffee', label: 'Khai vị' },
  { id: 'cat3', name: 'DESSERT', icon: 'heart', label: 'Tráng miệng' },
  { id: 'cat4', name: 'BEVERAGE', icon: 'coffee', label: 'Đồ uống' },
  { id: 'cat5', name: 'SOUP', icon: 'thermometer', label: 'Súp' },
  { id: 'cat6', name: 'SALAD', icon: 'feather', label: 'Salad' },
  { id: 'cat7', name: 'SIDE_DISH', icon: 'square', label: 'Món phụ' },
]

interface SelectedItem extends Food {
  quantity: number
  status: OrderItemStatus
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const DEFAULT_FOOD_IMAGE =
  'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'

export default function AddOrderScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const existingOrderId = params.orderId as string
  const existingTableId = params.tableId as string
  const isAddingToExistingOrder = params.isAddingToExistingOrder === 'true'

  // Modify title based on mode
  const screenTitle = isAddingToExistingOrder ? 'Thêm món vào đơn hàng' : 'Thêm đơn hàng mới'

  const { colors } = useTheme()
  const { foods, loading: foodsLoading, fetchFoods } = useFood()
  const { tables, loading: tablesLoading, fetchTables } = useTable()
  const { createOrder, loading: orderLoading, orders } = useOrder()
  const { createOrderItem } = useOrderItem()
  const { user } = useAuth()

  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('MAIN_COURSE')
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [itemModalVisible, setItemModalVisible] = useState(false)
  const [orderSummaryVisible, setOrderSummaryVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState<(Food & { image: string }) | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [tableNumber, setTableNumber] = useState('')
  const [tableModalVisible, setTableModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Animation values
  const cartBounceAnim = useState(new Animated.Value(1))[0]
  const successScaleAnim = useState(new Animated.Value(0))[0]

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchFoods(), fetchTables()])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()

    // If adding to existing order, set the table and order ID
    if (isAddingToExistingOrder && existingTableId) {
      const table = tables.find((t) => t.id === existingTableId)
      if (table) {
        setTableNumber(table.number.toString())
        setSelectedTableId(existingTableId)
        setSelectedOrderId(existingOrderId)
      }
    }
  }, []) // Chỉ chạy một lần khi component mount

  const filteredItems = useMemo(() => {
    const categoryFiltered = foods.filter(
      (item) => item.category === selectedCategory && item.isAvailable
    )

    if (!searchQuery.trim()) return categoryFiltered

    return categoryFiltered.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.price.toString().includes(searchQuery)
    )
  }, [selectedCategory, foods, searchQuery])

  const availableTables = useMemo(() => {
    return tables.filter((table) => table.status === 'OCCUPIED')
  }, [tables])

  const totalItems = useMemo(() => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0)
  }, [selectedItems])

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [selectedItems])

  const getCategoryLabel = (categoryName: FoodCategory) => {
    const category = FOOD_CATEGORIES.find((cat) => cat.name === categoryName)
    return category ? category.label : categoryName.replace('_', ' ')
  }

  const handleCategoryPress = useCallback((category: FoodCategory) => {
    setSelectedCategory(category)
  }, [])

  const handleItemPress = useCallback(
    (item: Food) => {
      if (!tableNumber) {
        Alert.alert('Chọn bàn', 'Vui lòng chọn bàn trước khi thêm món')
        return
      }
      setCurrentItem({
        ...item,
        image: '', // Để trống vì không cần hiển thị hình ảnh
      })
      setQuantity('1')
      setItemModalVisible(true)
    },
    [tableNumber]
  )

  const addItemToOrder = useCallback(() => {
    if (!currentItem) return

    const parsedQuantity = Number.parseInt(quantity)
    if (parsedQuantity < 1) {
      setError('Số lượng phải ít nhất là 1')
      return
    }

    const existingItemIndex = selectedItems.findIndex((item) => item.id === currentItem.id)

    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedItems = [...selectedItems]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + parsedQuantity,
      }
      setSelectedItems(updatedItems)
    } else {
      // Add new item
      setSelectedItems([
        ...selectedItems,
        {
          ...currentItem,
          quantity: parsedQuantity,
          status: 'PENDING',
        },
      ])
    }

    setItemModalVisible(false)
    setError(null)

    // Animate cart button
    Animated.sequence([
      Animated.timing(cartBounceAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cartBounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }, [currentItem, quantity, selectedItems, cartBounceAnim])

  const removeItem = useCallback(
    (itemId: string) => {
      setSelectedItems(selectedItems.filter((item) => item.id !== itemId))
    },
    [selectedItems]
  )

  const updateItemQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity < 1) {
        setError('Số lượng phải ít nhất là 1')
        return
      }

      const updatedItems = selectedItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
      setSelectedItems(updatedItems)
      setError(null)
    },
    [selectedItems]
  )

  const handleSelectTable = useCallback(
    (table: Table) => {
      setTableNumber(table.number.toString())
      setSelectedTableId(table.id)
      const order = orders.find((o) => o.tableId === table.id)
      setSelectedOrderId(order ? order.id : null)
      setTableModalVisible(false)
    },
    [orders]
  )

  const handlePlaceOrder = useCallback(async () => {
    // Ngăn chặn việc gọi nhiều lần khi đang xử lý
    if (isLoading) {
      console.log('Already processing order, ignoring duplicate call')
      return
    }

    if (!selectedTableId) {
      setError('Vui lòng chọn bàn trước khi thêm món')
      return
    }
    if (selectedItems.length === 0) {
      setError('Vui lòng thêm ít nhất một món')
      return
    }

    setIsLoading(true)
    try {
      if (!user || !user.id) {
        setError('Không thể xác định nhân viên. Vui lòng đăng nhập lại.')
        return
      }

      if (isAddingToExistingOrder && existingOrderId) {
        // Add items to existing order
        for (const item of selectedItems) {
          await createOrderItem({
            orderId: existingOrderId,
            foodId: item.id,
            quantity: item.quantity,
            status: item.status,
          })
        }

        // Show success modal
        setSuccessModalVisible(true)
        setOrderSummaryVisible(false)

        Animated.timing(successScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()

        // Navigate back to edit order after a short delay
        setTimeout(() => {
          setSuccessModalVisible(false)
          // Clear selected items before navigating back
          setSelectedItems([])

          // Navigate back to edit order with replace to ensure a fresh load
          router.replace({
            pathname: '/(tabs)/orders/edit-order',
            params: { id: existingOrderId },
          })
        }, 1500)
      } else {
        // Create new order (existing logic)
        const newOrderData: CreateOrderRequest = {
          tableId: selectedTableId,
          employeeId: user.id,
          orderItems: selectedItems.map((item) => ({
            foodId: item.id,
            quantity: item.quantity,
          })),
        }

        const newOrder = await createOrder(newOrderData)
        const orderId = newOrder.id

        // Thêm các món ăn vào đơn hàng
        for (const item of selectedItems) {
          await createOrderItem({
            orderId: orderId,
            foodId: item.id,
            quantity: item.quantity,
            status: item.status,
          })
        }

        // Cập nhật lại danh sách bàn sau khi đặt hàng thành công
        await fetchTables()

        setOrderSummaryVisible(false)
        setSuccessModalVisible(true)

        Animated.timing(successScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()

        setTimeout(() => {
          setSuccessModalVisible(false)
          setSelectedItems([])
          setTableNumber('')
          setSelectedOrderId(null)
          setSelectedTableId(null)
          // Điều hướng về trang danh sách đơn hàng
          router.push('/(tabs)/orders')
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || 'Không thể đặt hàng')
    } finally {
      setIsLoading(false)
    }
  }, [
    isAddingToExistingOrder,
    existingOrderId,
    selectedOrderId,
    selectedTableId,
    selectedItems,
    createOrderItem,
    createOrder,
    user,
    fetchTables,
  ])

  const incrementQuantity = useCallback(() => {
    const newQuantity = Number.parseInt(quantity) + 1
    setQuantity(String(newQuantity))
  }, [quantity])

  const decrementQuantity = useCallback(() => {
    const newQuantity = Math.max(1, Number.parseInt(quantity) - 1)
    setQuantity(String(newQuantity))
  }, [quantity])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#D02C1A" />

      <Header
        title={screenTitle}
        onBackPress={() => {
          if (isAddingToExistingOrder) {
            router.push({
              pathname: '/(tabs)/orders/edit-order',
              params: { id: existingOrderId },
            })
          } else {
            router.push('/(tabs)/orders')
          }
        }}
      />

      {/* Disable table selection when adding to existing order */}
      <View style={styles.tableInfoBar}>
        <TouchableOpacity
          style={styles.tableSelector}
          onPress={() => !isAddingToExistingOrder && setTableModalVisible(true)}
          disabled={isAddingToExistingOrder}
        >
          <Feather name="coffee" size={18} color="#D02C1A" />
          <Text style={[styles.tableSelectorText, isAddingToExistingOrder && { color: '#888' }]}>
            {tableNumber ? `Bàn ${tableNumber}` : 'Chọn bàn'}
          </Text>
          {!isAddingToExistingOrder && <Feather name="chevron-down" size={16} color="#666" />}
        </TouchableOpacity>

        {selectedItems.length > 0 && (
          <Animated.View style={[styles.cartButton, { transform: [{ scale: cartBounceAnim }] }]}>
            <TouchableOpacity
              style={styles.cartButtonInner}
              onPress={() => setOrderSummaryVisible(true)}
            >
              <Feather name="shopping-cart" size={18} color="#fff" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FOOD_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(category.name as FoodCategory)}
            >
              <Feather
                name={category.icon as keyof typeof Feather.glyphMap}
                size={16}
                color={selectedCategory === category.name ? '#fff' : '#D02C1A'}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.name && styles.categoryButtonTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

      <View style={styles.contentContainer}>
        <View style={styles.categoryHeaderContainer}>
          <Text style={styles.categoryHeaderTitle}>{getCategoryLabel(selectedCategory)}</Text>
          <Text style={styles.categoryHeaderCount}>{filteredItems.length} món</Text>
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.foodItemsGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.foodItemCard}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.imageUrl || DEFAULT_FOOD_IMAGE }}
                style={styles.foodItemImage}
                resizeMode="cover"
              />
              <View style={styles.foodItemInfo}>
                <Text style={styles.foodItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.foodItemPriceRow}>
                  <Text style={styles.foodItemPrice}>{Math.round(item.price)}đ</Text>
                  <TouchableOpacity style={styles.addButton} onPress={() => handleItemPress(item)}>
                    <Feather name="plus" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Feather name="alert-circle" size={50} color="#ccc" />
              <Text style={styles.emptyListText}>Không có món ăn</Text>
            </View>
          }
        />
      </View>

      {/* Item Quantity Modal */}
      <Modal
        visible={itemModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {currentItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Thêm vào đơn hàng</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setItemModalVisible(false)}
                  >
                    <Feather name="x" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalItemName}>{currentItem.name}</Text>
                  <Text style={styles.modalItemCategory}>
                    {getCategoryLabel(currentItem.category)}
                  </Text>
                  <Text style={styles.modalItemPrice}>Giá: {Math.round(currentItem.price)}đ</Text>

                  <View style={styles.modalQuantityContainer}>
                    <Text style={styles.modalQuantityLabel}>Số lượng:</Text>
                    <View style={styles.modalQuantityControls}>
                      <TouchableOpacity
                        style={styles.modalQuantityButton}
                        onPress={decrementQuantity}
                      >
                        <Feather name="minus" size={20} color="#D02C1A" />
                      </TouchableOpacity>

                      <TextInput
                        style={styles.modalQuantityInput}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                      />

                      <TouchableOpacity
                        style={styles.modalQuantityButton}
                        onPress={incrementQuantity}
                      >
                        <Feather name="plus" size={20} color="#D02C1A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.modalAddButton} onPress={addItemToOrder}>
                    <Text style={styles.modalAddButtonText}>Thêm vào đơn hàng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Order Summary Modal */}
      <Modal
        visible={orderSummaryVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOrderSummaryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.orderSummaryModal}>
            <View style={styles.orderSummaryHeader}>
              <Text style={styles.orderSummaryTitle}>TÓM TẮT ĐƠN HÀNG</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setOrderSummaryVisible(false)}
              >
                <Feather name="x" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.orderSummaryTableInfo}>
              <Feather name="coffee" size={20} color="#D02C1A" />
              <Text style={styles.orderSummaryTableText}>
                {tableNumber ? `Bàn ${tableNumber}` : 'Chưa chọn bàn'}
              </Text>
              {!tableNumber && (
                <TouchableOpacity
                  style={styles.selectTableButton}
                  onPress={() => {
                    setTableModalVisible(true)
                    setOrderSummaryVisible(false)
                  }}
                >
                  <Text style={styles.selectTableButtonText}>CHỌN</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedItems.length > 0 ? (
              <>
                <ScrollView style={styles.orderItemsList}>
                  {selectedItems.map((item) => (
                    <View key={item.id} style={styles.orderItemRow}>
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.orderItemPrice}>
                          {Math.round(item.price * item.quantity)}đ
                        </Text>
                      </View>

                      <View style={styles.orderItemQuantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Feather name="minus" size={16} color="#D02C1A" />
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Feather name="plus" size={16} color="#D02C1A" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeItem(item.id)}
                      >
                        <Feather name="trash-2" size={16} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.orderSummaryFooter}>
                  <View style={styles.orderTotalContainer}>
                    <Text style={styles.orderTotalLabel}>TỔNG TIỀN:</Text>
                    <Text style={styles.orderTotalAmount}>{Math.round(totalAmount)}đ</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.placeOrderButton,
                      (!selectedTableId || isLoading) && styles.placeOrderButtonDisabled,
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={!selectedTableId || isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.placeOrderButtonText}>ĐANG XỬ LÝ...</Text>
                    ) : (
                      <>
                        <Feather name="check-circle" size={18} color="#fff" />
                        <Text style={styles.placeOrderButtonText}>
                          {isAddingToExistingOrder ? 'THÊM VÀO ĐƠN HÀNG' : 'ĐẶT HÀNG'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyOrderContainer}>
                <Feather name="shopping-cart" size={50} color="#ccc" />
                <Text style={styles.emptyOrderText}>ĐƠN HÀNG TRỐNG</Text>
                <Text style={styles.emptyOrderSubtext}>Thêm món ăn từ thực đơn</Text>
                <TouchableOpacity
                  style={styles.browseMenuButton}
                  onPress={() => setOrderSummaryVisible(false)}
                >
                  <Text style={styles.browseMenuButtonText}>XEM THỰC ĐƠN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Table Selection Modal */}
      <Modal
        visible={tableModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTableModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tableModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn bàn</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setTableModalVisible(false)}
              >
                <Feather name="x" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.tableList}>
              {availableTables.length > 0 ? (
                availableTables.map((table) => (
                  <TouchableOpacity
                    key={table.id}
                    style={styles.tableItem}
                    onPress={() => handleSelectTable(table)}
                  >
                    <Feather name="coffee" size={20} color="#D02C1A" />
                    <Text style={styles.tableItemText}>Bàn {table.number}</Text>
                    <View style={styles.tableStatusBadge}>
                      <Text style={styles.tableStatusText}>{table.status}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyTableContainer}>
                  <Feather name="alert-circle" size={40} color="#ccc" />
                  <Text style={styles.emptyTableText}>Không có bàn khả dụng</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent={true} animationType="none">
        <View style={styles.successModalOverlay}>
          <Animated.View
            style={[styles.successModalContent, { transform: [{ scale: successScaleAnim }] }]}
          >
            <View style={styles.successIconContainer}>
              <Feather name="check-circle" size={50} color="#fff" />
            </View>
            <Text style={styles.successModalText}>Đơn hàng đã được thêm thành công!</Text>
          </Animated.View>
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
  tableInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableSelectorText: {
    fontSize: 14,
    color: '#333',
    marginHorizontal: 8,
  },
  cartButton: {
    position: 'relative',
  },
  cartButtonInner: {
    backgroundColor: '#D02C1A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF9800',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D02C1A',
  },
  categoryButtonActive: {
    backgroundColor: '#D02C1A',
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#D02C1A',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  categoryHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryHeaderCount: {
    fontSize: 14,
    color: '#666',
  },
  foodItemsGrid: {
    padding: 8,
  },
  foodItemCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    margin: 8,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  foodItemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  addButton: {
    backgroundColor: '#D02C1A',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyListText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
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
  },
  modalItemImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalItemCategory: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D02C1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalQuantityContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  modalQuantityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQuantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D02C1A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalQuantityInput: {
    width: 80,
    height: 44,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalAddButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#D02C1A',
  },
  modalAddButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderSummaryModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '90%',
    position: 'absolute',
    bottom: 0,
  },
  orderSummaryHeader: {
    backgroundColor: '#D02C1A',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderSummaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderSummaryTableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderSummaryTableText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  selectTableButton: {
    backgroundColor: '#D02C1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectTableButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orderItemsList: {
    maxHeight: 350,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  orderItemQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderSummaryFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D02C1A',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D02C1A',
    padding: 16,
    borderRadius: 12,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyOrderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyOrderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyOrderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 20,
  },
  browseMenuButton: {
    backgroundColor: '#D02C1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseMenuButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  tableList: {
    maxHeight: 350,
  },
  tableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  tableStatusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tableStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyTableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTableText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#D02C1A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '70%',
    maxWidth: 300,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successModalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  foodItemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 8,
  },
})
