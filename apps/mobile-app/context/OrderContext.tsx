import React, { createContext, useContext, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { config } from '../config/env'
import type { Order, OrderItem, OrderItemStatus, CreateOrderRequest } from '../constants/interface'
import { useTable } from './TableContext'

interface OrderContextType {
  orders: Order[]
  preparingOrders: Order[]
  loading: boolean
  fetchOrders: () => Promise<void>
  fetchOrder: (id: string) => Promise<Order | null>
  createOrder: (data: CreateOrderRequest) => Promise<Order>
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => Promise<void>
  updateOrderItems: (orderId: string, items: OrderItem[]) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  fetchPreparingOrders: () => Promise<void>
  updateOrderPaymentStatus: (orderId: string, timeOut: string) => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  // Sử dụng TableContext để có thể cập nhật danh sách bàn
  const { fetchTables } = useTable()

  const fetchOrders = useCallback(async () => {
    // Tránh gọi API nếu đang loading
    if (loading) return

    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders')
      setOrders(data)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }, []) // Loại bỏ các dependencies không cần thiết

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch order')
      return data as Order
    } catch (error: any) {
      Alert.alert('Error', error.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = async (orderData: CreateOrderRequest) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create order')
      await fetchOrders()
      return data
    } catch (error: any) {
      console.error('Error creating order:', error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update order')
      await fetchOrders()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderItemStatus = async (
    orderId: string,
    itemId: string,
    status: OrderItemStatus
  ) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update order item status')
      await fetchOrders()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderItems = async (orderId: string, items: OrderItem[]) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders/${orderId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update order items')
      await fetchOrders()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteOrder = async (id: string) => {
    setLoading(true)
    try {
      // Gọi API xóa đơn hàng - backend sẽ xử lý cập nhật trạng thái bàn
      const res = await fetch(`${config.API_URL}/orders/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        // Xử lý lỗi từ API
        const errorData = await res.json().catch(() => ({ message: 'Failed to delete order' }))
        throw new Error(errorData.message || 'Failed to delete order')
      }

      // Cập nhật state sau khi xóa thành công
      await Promise.all([
        fetchOrders(), // Cập nhật danh sách tất cả đơn hàng
        fetchPreparingOrders(), // Cập nhật danh sách đơn hàng đang chuẩn bị
        fetchTables(), // Cập nhật danh sách bàn và trạng thái bàn
      ])

      // Không cần gọi API cập nhật trạng thái bàn vì backend đã xử lý
      console.log('Orders and tables updated after deletion')
    } catch (error: any) {
      console.error('Error deleting order:', error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchPreparingOrders = useCallback(async () => {
    // Tránh gọi API nếu đang loading
    if (loading) return

    setLoading(true)
    try {
      console.log('Fetching preparing orders from API...')
      const res = await fetch(`${config.API_URL}/orders/preparing`)

      if (!res.ok) {
        const errorData = await res.json()
        console.error('API error:', errorData)
        throw new Error(errorData.message || 'Failed to fetch preparing orders')
      }

      const data = await res.json()
      console.log('Preparing orders fetched successfully:', data.length)
      setPreparingOrders(data)
      return data
    } catch (error: any) {
      console.error('Error fetching preparing orders:', error.message)
      // Sử dụng console.error thay vì Alert để tránh hiển thị quá nhiều alert
    } finally {
      setLoading(false)
    }
  }, []) // Loại bỏ các dependencies không cần thiết

  const updateOrderPaymentStatus = async (orderId: string, timeOut: string) => {
    setLoading(true)
    try {
      console.log(`Updating order ${orderId} payment status to PAID`)
      const orderUpdateData = {
        status: 'PAID',
        timeOut: timeOut,
      }

      const res = await fetch(`${config.API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderUpdateData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to update order payment status')
      }

      // Cập nhật danh sách đơn hàng
      await fetchOrders()
      await fetchPreparingOrders()

      return await res.json()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        preparingOrders,
        loading,
        fetchOrders,
        fetchOrder,
        createOrder,
        updateOrder,
        updateOrderItemStatus,
        updateOrderItems,
        deleteOrder,
        fetchPreparingOrders,
        updateOrderPaymentStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

// Custom hook for preparing orders
export const usePreparingOrders = () => {
  const {
    preparingOrders,
    loading,
    fetchPreparingOrders,
    updateOrderItems,
    updateOrderPaymentStatus,
  } = useOrder()

  const getOrderItemsByStatus = useCallback((order: Order | null, status: OrderItemStatus) => {
    if (!order) return []
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : []
    return orderItems.filter((item) => item && item.status === status)
  }, [])

  const getTotalItems = useCallback((order: Order | null) => {
    if (!order) return 0
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : []
    return orderItems.reduce((total, item) => {
      if (!item) return total
      return total + (item.quantity || 0)
    }, 0)
  }, [])

  const getTotalAmount = useCallback((order: Order | null) => {
    if (!order) return 0
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : []
    return orderItems.reduce((total, item) => {
      if (!item || !item.food) return total
      const price = item.food.price || 0
      const quantity = item.quantity || 0
      return total + price * quantity
    }, 0)
  }, [])

  const getOrderStatus = useCallback(
    (order: Order | null) => {
      if (!order) return 'PENDING'
      const orderItems = Array.isArray(order.orderItems) ? order.orderItems : []
      if (orderItems.length === 0) return 'PENDING'

      const pendingItems = getOrderItemsByStatus(order, 'PENDING')
      const preparingItems = getOrderItemsByStatus(order, 'PREPARING')
      const readyItems = getOrderItemsByStatus(order, 'READY')
      const completeItems = getOrderItemsByStatus(order, 'COMPLETE')

      if (completeItems.length === orderItems.length) return 'COMPLETE'
      if (readyItems.length > 0) return 'READY'
      if (preparingItems.length > 0) return 'PREPARING'
      return 'PENDING'
    },
    [getOrderItemsByStatus]
  )

  return {
    preparingOrders,
    loading,
    fetchPreparingOrders,
    getOrderItemsByStatus,
    getTotalItems,
    getTotalAmount,
    getOrderStatus,
    updateOrderItems,
    updateOrderPaymentStatus,
  }
}
