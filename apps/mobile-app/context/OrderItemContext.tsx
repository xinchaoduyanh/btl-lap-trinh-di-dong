import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { Alert } from 'react-native';
import { config } from '../config/env';
import type { OrderItem } from '../constants/interface';

interface OrderItemContextType {
  loading: boolean;
  orderItems: OrderItem[];
  createOrderItem: (data: Omit<OrderItem, 'id'>) => Promise<OrderItem>;
  getAllOrderItems: () => Promise<OrderItem[]>;
  getOrderItem: (id: string) => Promise<OrderItem>;
  updateOrderItem: (id: string, data: Partial<OrderItem>) => Promise<OrderItem>;
  deleteOrderItem: (id: string) => Promise<void>;
}

const OrderItemContext = createContext<OrderItemContextType | undefined>(undefined);

export const OrderItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const createOrderItem = useCallback(async (data: Omit<OrderItem, 'id'>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/order-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status !== 201) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create order item');
      }
      return await res.json();
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllOrderItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/order-items`);
      if (res.status !== 200) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch order items');
      }
      const data = await res.json();
      setOrderItems(data);
      return data;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderItem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/order-items/${id}`);
      if (res.status !== 200) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch order item');
      }
      return await res.json();
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderItem = useCallback(async (id: string, data: Partial<OrderItem>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/order-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status !== 200) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update order item');
      }
      return await res.json();
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrderItem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/order-items/${id}`, {
        method: 'DELETE',
      });
      if (res.status !== 204) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete order item');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <OrderItemContext.Provider
      value={{
        loading,
        orderItems,
        createOrderItem,
        getAllOrderItems,
        getOrderItem,
        updateOrderItem,
        deleteOrderItem,
      }}
    >
      {children}
    </OrderItemContext.Provider>
  );
};

// Hook sử dụng context
export const useOrderItem = () => {
  const context = useContext(OrderItemContext);
  if (!context) {
    throw new Error('useOrderItem must be used within an OrderItemProvider');
  }
  return context;
};
