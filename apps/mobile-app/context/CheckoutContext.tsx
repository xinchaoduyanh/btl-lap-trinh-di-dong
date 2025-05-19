import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { CheckoutSession, CheckoutStatus, CheckoutError } from '../constants/interface';
import { config } from '../config/env'

interface CheckoutContextType {
  isCheckedIn: boolean;
  currentStatus: CheckoutStatus | null;
  checkIn: (employeeId: string, qrCode: string) => Promise<void>;
  checkOut: (employeeId: string) => Promise<void>;
  getCurrentStatus: (employeeId: string) => Promise<void>;
  loading: boolean;
  fetchHistory: (userId: string) => Promise<any[]>;
  fetchSessionsByDate: (userId: string, date: string) => Promise<any>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<CheckoutStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkIn = async (employeeId: string, qrCode: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/checkout/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, qrCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check in');
      }

      setIsCheckedIn(true);
      await getCurrentStatus(employeeId);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/checkout/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check out');
      }

      setIsCheckedIn(false);
      setCurrentStatus(null);
      Alert.alert('Success', 'Checked out successfully');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatus = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/checkout/status/${employeeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get status');
      }

      setCurrentStatus(data);
      setIsCheckedIn(data.status === 'CHECKED_IN');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/checkout/history/${userId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch history');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsByDate = async (userId: string, date: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/checkout/history/${userId}?date=${date}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sessions by date');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
      return { sessions: [], totalWorked: '' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        isCheckedIn,
        currentStatus,
        checkIn,
        checkOut,
        getCurrentStatus,
        loading,
        fetchHistory,
        fetchSessionsByDate,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
