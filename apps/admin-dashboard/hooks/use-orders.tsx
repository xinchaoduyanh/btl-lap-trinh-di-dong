"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type Order,
  type OrderItem,
  OrderStatus,
  type CreateOrderRequest,
  type UpdateOrderRequest,
  type CreateOrderItemRequest,
  type UpdateOrderItemRequest,
} from "@/types/schema"

// Mock data for development
const mockOrders: Order[] = [
  {
    id: "1",
    tableId: "3",
    employeeId: "1",
    status: OrderStatus.PENDING,
    totalAmount: 45.99,
    createdAt: "2023-05-01T12:30:00.000Z",
  },
  {
    id: "2",
    tableId: "5",
    employeeId: "2",
    status: OrderStatus.COMPLETED,
    totalAmount: 32.5,
    createdAt: "2023-05-01T13:15:00.000Z",
  },
  {
    id: "3",
    tableId: "2",
    employeeId: "3",
    status: OrderStatus.IN_PROGRESS,
    totalAmount: 78.25,
    createdAt: "2023-05-01T14:00:00.000Z",
  },
  {
    id: "4",
    tableId: "7",
    employeeId: "4",
    status: OrderStatus.COMPLETED,
    totalAmount: 55.75,
    createdAt: "2023-05-01T14:45:00.000Z",
  },
  {
    id: "5",
    tableId: "1",
    employeeId: "5",
    status: OrderStatus.PENDING,
    totalAmount: 29.99,
    createdAt: "2023-05-01T15:30:00.000Z",
  },
  {
    id: "6",
    tableId: "4",
    employeeId: "6",
    status: OrderStatus.IN_PROGRESS,
    totalAmount: 42.5,
    createdAt: "2023-05-01T16:15:00.000Z",
  },
  {
    id: "7",
    tableId: "6",
    employeeId: "7",
    status: OrderStatus.COMPLETED,
    totalAmount: 68.75,
    createdAt: "2023-05-01T17:00:00.000Z",
  },
]

// Mock data for order items
const mockOrderItems: OrderItem[] = [
  {
    id: "1",
    orderId: "1",
    menuItemId: "1",
    quantity: 2,
    unitPrice: 19.99,
  },
  {
    id: "2",
    orderId: "1",
    menuItemId: "9",
    quantity: 1,
    unitPrice: 5.99,
  },
  {
    id: "3",
    orderId: "2",
    menuItemId: "3",
    quantity: 1,
    unitPrice: 15.99,
  },
  {
    id: "4",
    orderId: "2",
    menuItemId: "9",
    quantity: 1,
    unitPrice: 5.99,
  },
  {
    id: "5",
    orderId: "2",
    menuItemId: "10",
    quantity: 1,
    unitPrice: 10.52,
  },
]

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/orders')
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setOrders(mockOrders)
      setOrderItems(mockOrderItems)
    } catch (err) {
      setError("Failed to fetch orders")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single order by ID
  const getOrder = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/orders/${id}`)
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const order = mockOrders.find((o) => o.id === id)
      if (!order) throw new Error("Order not found")

      // Get order items for this order
      const items = mockOrderItems.filter((item) => item.orderId === id)
      return { ...order, orderItems: items }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new order
  const createOrder = useCallback(async (orderData: CreateOrderRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const newOrderId = Date.now().toString()

      const newOrder: Order = {
        ...orderData,
        id: newOrderId,
        createdAt: new Date().toISOString(),
      }

      setOrders((prev) => [...prev, newOrder])

      // Create order items if provided
      if (orderData.orderItems && orderData.orderItems.length > 0) {
        const newOrderItems = orderData.orderItems.map((item, index) => ({
          ...item,
          id: `${newOrderId}-${index}`,
          orderId: newOrderId,
        }))

        setOrderItems((prev) => [...prev, ...newOrderItems])
      }

      return newOrder
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing order
  const updateOrder = useCallback(async (id: string, orderData: UpdateOrderRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/orders/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, ...orderData } : order)))
      return { id, ...orderData }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete an order
  const deleteOrder = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/orders/${id}`, { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setOrders((prev) => prev.filter((order) => order.id !== id))
      // Also delete related order items
      setOrderItems((prev) => prev.filter((item) => item.orderId !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update order status
  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      try {
        return await updateOrder(id, { status })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [updateOrder],
  )

  // Add item to order
  const addOrderItem = useCallback(
    async (orderId: string, itemData: CreateOrderItemRequest) => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/orders/${orderId}/items`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(itemData)
        // })
        // const data = await response.json()

        // Using mock data for now
        await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

        const newItem: OrderItem = {
          ...itemData,
          id: Date.now().toString(),
          orderId,
        }

        setOrderItems((prev) => [...prev, newItem])

        // Update order total amount
        const order = orders.find((o) => o.id === orderId)
        if (order) {
          const newTotal = order.totalAmount + itemData.unitPrice * itemData.quantity
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, totalAmount: newTotal } : o)))
        }

        return newItem
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [orders],
  )

  // Update order item
  const updateOrderItem = useCallback(
    async (id: string, itemData: UpdateOrderItemRequest) => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/order-items/${id}`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(itemData)
        // })
        // const data = await response.json()

        // Using mock data for now
        await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

        // Find the current item to calculate price difference
        const currentItem = orderItems.find((item) => item.id === id)
        if (!currentItem) throw new Error("Order item not found")

        // Calculate price difference for order total update
        let priceDifference = 0
        if (itemData.quantity !== undefined || itemData.unitPrice !== undefined) {
          const oldTotal = currentItem.quantity * currentItem.unitPrice
          const newQuantity = itemData.quantity ?? currentItem.quantity
          const newUnitPrice = itemData.unitPrice ?? currentItem.unitPrice
          const newTotal = newQuantity * newUnitPrice
          priceDifference = newTotal - oldTotal
        }

        // Update the item
        setOrderItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item)))

        // Update order total if price changed
        if (priceDifference !== 0) {
          const orderId = currentItem.orderId
          const order = orders.find((o) => o.id === orderId)
          if (order) {
            const newTotal = order.totalAmount + priceDifference
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, totalAmount: newTotal } : o)))
          }
        }

        return { id, ...itemData }
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [orderItems, orders],
  )

  // Remove item from order
  const removeOrderItem = useCallback(
    async (id: string) => {
      try {
        // In a real app, this would be an API call
        // await fetch(`/api/order-items/${id}`, { method: 'DELETE' })

        // Using mock data for now
        await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

        // Find the current item to calculate price difference
        const currentItem = orderItems.find((item) => item.id === id)
        if (!currentItem) throw new Error("Order item not found")

        // Calculate price to subtract from order total
        const priceToSubtract = currentItem.quantity * currentItem.unitPrice

        // Remove the item
        setOrderItems((prev) => prev.filter((item) => item.id !== id))

        // Update order total
        const orderId = currentItem.orderId
        const order = orders.find((o) => o.id === orderId)
        if (order) {
          const newTotal = Math.max(0, order.totalAmount - priceToSubtract)
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, totalAmount: newTotal } : o)))
        }

        return true
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [orderItems, orders],
  )

  // Load orders on initial mount
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    orderItems,
    isLoading,
    error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
  }
}
