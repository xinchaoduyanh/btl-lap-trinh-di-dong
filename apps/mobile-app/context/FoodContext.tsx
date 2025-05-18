import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { config } from '../config/env';
import type { Food, FoodCategory } from '../constants/interface';

interface FoodContextType {
  foods: Food[];
  loading: boolean;
  fetchFoods: () => Promise<void>;
  fetchFood: (id: string) => Promise<Food | null>;
  fetchFoodsByCategory: (category: FoodCategory) => Promise<Food[]>;
  createFood: (food: Partial<Food>) => Promise<void>;
  updateFood: (id: string, food: Partial<Food>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  toggleFoodAvailability: (id: string, isAvailable: boolean) => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const FoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/foods`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch foods');
      setFoods(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFood = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/foods/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch food');
      return data as Food;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodsByCategory = async (category: FoodCategory) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/foods/category/${category}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch foods by category');
      return data as Food[];
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createFood = async (food: Partial<Food>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create food');
      await fetchFoods();
      Alert.alert('Success', 'Food created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFood = async (id: string, food: Partial<Food>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/foods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update food');
      await fetchFoods();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteFood = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/foods/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete food');
      await fetchFoods();
      Alert.alert('Success', 'Food deleted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFoodAvailability = async (id: string, isAvailable: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/foods/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to toggle food availability');
      await fetchFoods();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FoodContext.Provider value={{
      foods,
      loading,
      fetchFoods,
      fetchFood,
      fetchFoodsByCategory,
      createFood,
      updateFood,
      deleteFood,
      toggleFoodAvailability,
    }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) throw new Error('useFood must be used within a FoodProvider');
  return context;
};
