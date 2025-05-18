import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { config } from '../config/env';
import type { Order, OrderItem, OrderItemStatus } from '../constants/interface';

interface OrderContextType {
  orders: Order[];
  preparingOrders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<Order | null>;
  createOrder: (order: Partial<Order>) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => Promise<void>;
  updateOrderItems: (orderId: string, items: OrderItem[]) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  fetchPreparingOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
      setOrders(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch order');
      return data as Order;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const createOrder = async (order: Partial<Order>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create order');
      await fetchOrders();
      Alert.alert('Success', 'Order created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order');
      await fetchOrders();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderItemStatus = async (orderId: string, itemId: string, status: OrderItemStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order item status');
      await fetchOrders();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderItems = async (orderId: string, items: OrderItem[]) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders/${orderId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order items');
      await fetchOrders();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete order');
      await fetchOrders();
      Alert.alert('Success', 'Order deleted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreparingOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/orders/preparing`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch preparing orders');
      setPreparingOrders(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <OrderContext.Provider value={{
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
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};

// Custom hook for preparing orders
export const usePreparingOrders = () => {
  const { preparingOrders, loading, fetchPreparingOrders, updateOrderItems } = useOrder();

  const getOrderItemsByStatus = useCallback((order: Order | null, status: OrderItemStatus) => {
    if (!order) return [];
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
    return orderItems.filter(item => item && item.status === status);
  }, []);

  const getTotalItems = useCallback((order: Order | null) => {
    if (!order) return 0;
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
    return orderItems.reduce((total, item) => {
      if (!item) return total;
      return total + (item.quantity || 0);
    }, 0);
  }, []);

  const getTotalAmount = useCallback((order: Order | null) => {
    if (!order) return 0;
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
    return orderItems.reduce((total, item) => {
      if (!item || !item.food) return total;
      const price = item.food.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  }, []);

  const getOrderStatus = useCallback((order: Order | null) => {
    if (!order) return 'PENDING';
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
    if (orderItems.length === 0) return 'PENDING';

    const pendingItems = getOrderItemsByStatus(order, 'PENDING');
    const preparingItems = getOrderItemsByStatus(order, 'PREPARING');
    const readyItems = getOrderItemsByStatus(order, 'READY');
    const completeItems = getOrderItemsByStatus(order, 'COMPLETE');

    if (completeItems.length === orderItems.length) return 'COMPLETE';
    if (readyItems.length > 0) return 'READY';
    if (preparingItems.length > 0) return 'PREPARING';
    return 'PENDING';
  }, [getOrderItemsByStatus]);

  return {
    preparingOrders,
    loading,
    fetchPreparingOrders,
    getOrderItemsByStatus,
    getTotalItems,
    getTotalAmount,
    getOrderStatus,
    updateOrderItems,
  };
};
