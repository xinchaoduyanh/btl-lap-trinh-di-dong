import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { config } from '../config/env';
import type { Table } from '../constants/interface';

interface TableContextType {
  tables: Table[];
  loading: boolean;
  fetchTables: () => Promise<void>;
  fetchTable: (id: string) => Promise<Table | null>;
  createTable: (data: Partial<Table>) => Promise<void>;
  updateTable: (id: string, data: Partial<Table>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/tables`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tables');
      setTables(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTable = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/tables/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch table');
      return data as Table;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (table: Partial<Table>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create table');
      await fetchTables();
      Alert.alert('Success', 'Table created!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTable = async (id: string, table: Partial<Table>) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/tables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update table');
      await fetchTables();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/tables/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete table');
      await fetchTables();
      Alert.alert('Success', 'Table deleted!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableContext.Provider value={{
      tables,
      loading,
      fetchTables,
      fetchTable,
      createTable,
      updateTable,
      deleteTable,
    }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) throw new Error('useTable must be used within a TableProvider');
  return context;
};
