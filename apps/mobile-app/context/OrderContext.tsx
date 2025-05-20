import React, { createContext, useContext, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { config } from '../config/env'
import type { Order, OrderItem, OrderItemStatus, CreateOrderRequest } from '../constants/interface'

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
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders')
      setOrders(data)
    } catch (error: any) {
      console.error('Error fetching orders:', error.message)
    } finally {
      setLoading(false)
    }
  }

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
      // Bỏ thông báo Alert ở đây để tránh trùng lặp
      return data
    } catch (error: any) {
      console.error('Error creating order:', error.message)
      throw error // Ném lỗi để component gọi hàm này có thể xử lý
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
      // Trước khi xóa, lấy thông tin đơn hàng để biết tableId
      const orderToDelete = orders.find((order) => order.id === id)
      const tableId = orderToDelete?.tableId

      const res = await fetch(`${config.API_URL}/orders/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete order')

      // Sau khi xóa đơn hàng thành công, cập nhật trạng thái bàn thành CLEANING
      if (tableId) {
        const tableRes = await fetch(`${config.API_URL}/tables/${tableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CLEANING' }),
        })
        if (!tableRes.ok) {
          console.error('Failed to update table status')
        }
      }

      await fetchOrders()
      // Bỏ thông báo Alert ở đây để tránh trùng lặp
    } catch (error: any) {
      // Chỉ log lỗi, không hiển thị Alert
      console.error('Error deleting order:', error.message)
      throw error // Ném lỗi để component gọi hàm này có thể xử lý
    } finally {
      setLoading(false)
    }
  }

  const fetchPreparingOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${config.API_URL}/orders/preparing`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch preparing orders')
      setPreparingOrders(data)
    } catch (error: any) {
      if (error.message != 'No preparing orders found')
        console.error('Error fetching preparing orders:', error.message)
    } finally {
      setLoading(false)
    }
  }, [])

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
  const { preparingOrders, loading, fetchPreparingOrders, updateOrderItems } = useOrder()

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
  }
}
