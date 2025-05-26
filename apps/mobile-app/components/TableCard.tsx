'use client'

import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import type { Table, TableStatus } from '../constants/interface'

interface TableCardProps {
  table: Table
  width: number
  onPress?: () => void
}

export const TableCard: React.FC<TableCardProps> = ({ table, width, onPress }) => {
  const { colors } = useTheme()

  const getStatusColor = (status: TableStatus | string) => {
    switch (status) {
      case 'AVAILABLE':
        return colors.success
      case 'OCCUPIED':
        return colors.error
      case 'RESERVED':
        return colors.primary
      case 'CLEANING':
        return colors.info
      default:
        return '#666'
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tableCard,
        {
          width: width,
          backgroundColor: getStatusColor(table.status) + '20',
          borderColor: getStatusColor(table.status),
        },
      ]}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(table.status) }]} />
      <Image source={{ uri: 'https://baron.vn/wp-content/uploads/2024/02/ban-an-Jcao-cap-hemera-ba05-13.jpg' }} style={styles.tableIcon} />
      <Text style={styles.tableNumber}>Table {table.number}</Text>
      <Text style={[styles.tableStatus, { color: getStatusColor(table.status) }]}> {table.status} </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tableCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    aspectRatio: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  tableIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tableStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 'auto',
  },
})
