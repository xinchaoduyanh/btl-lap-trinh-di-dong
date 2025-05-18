import { useState, useCallback } from "react"
import api from "@/lib/axios"
import { Order, OrderStatus } from "@/types/schema"


export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)


  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get("/orders")
      setOrders(response.data)
      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])


  // Get a single order by ID
  const getOrder = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])


  // Create a new order
  const createOrder = useCallback(async (orderData: Partial<Order>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post("/orders", orderData)
      setOrders(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])


  // Update an order
  const updateOrder = useCallback(async (id: string, orderData: Partial<Order>) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Updating order ${id} with data:`, orderData);

      // Make sure we're using the correct endpoint and method
      const response = await api.patch(`/orders/${id}`, orderData);
      console.log('Update response:', response);

      // Update the local state with the updated order
      setOrders(prev => prev.map(order =>
        order.id === id ? { ...order, ...response.data } : order
      ));

      return response.data;
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [])


  // Update order status
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.patch(`/orders/${id}`, { status })
      setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order))
      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])


  // Delete an order
  const deleteOrder = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Trước khi xóa, kiểm tra order có timeOut trong tương lai không
      const orderToDelete = orders.find(order => order.id === id)

      // Nếu order có timeOut và timeOut là ngày trong tương lai, xử lý đặc biệt
      if (orderToDelete?.timeOut) {
        try {
          // Chuyển đổi timeOut thành đối tượng Date
          const timeOutDate = new Date(orderToDelete.timeOut)

          // Nếu timeOut là ngày trong tương lai, thực hiện xóa với xử lý đặc biệt
          if (timeOutDate > new Date()) {
            console.log("Deleting order with future timeOut:", timeOutDate)
          }
        } catch (timeOutErr) {
          console.error("Error parsing timeOut:", timeOutErr)
        }
      }

      // Tiếp tục với quá trình xóa bình thường
      await api.delete(`/orders/${id}`)
      setOrders(prev => prev.filter(order => order.id !== id))
      return true
    } catch (err) {
      console.error("Error in deleteOrder:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [orders])


  // Get order items for a specific order
  const getOrderItems = useCallback(async (orderId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get(`/order-items?orderId=${orderId}`)
      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])


  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderItems,
  }
}
