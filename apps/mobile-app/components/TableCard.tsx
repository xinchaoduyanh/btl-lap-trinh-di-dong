'use client'

import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import type { Table, TableStatus } from '../constants/interface'

interface TableCardProps {
  table: Table
  width: number
  onPress: () => void
  disabled?: boolean
}

export function TableCard({ table, width, onPress, disabled }: TableCardProps) {
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
      style={[
        styles.tableCard,
        {
          width: width,
          backgroundColor: getStatusColor(table.status) + '20',
          borderColor: getStatusColor(table.status),
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(table.status) }]} />
      <Image source={{ uri: 'https://baron.vn/wp-content/uploads/2024/02/ban-an-Jcao-cap-hemera-ba05-13.jpg' }} style={styles.tableIcon} />
      <Text style={styles.tableNumber}>Bàn {table.number}</Text>
      <Text style={[styles.tableStatus, { color: getStatusColor(table.status) }]}>
        {table.status === 'AVAILABLE' ? 'Trống' :
         table.status === 'OCCUPIED' ? 'Đang phục vụ' :
         table.status === 'RESERVED' ? 'Đã đặt trước' :
         'Đang dọn dẹp'}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tableCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    width: 50,
    height: 50,
    marginBottom: 8,
    borderRadius: 8,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tableStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 'auto',
  },
})
