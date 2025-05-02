'use client'

import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { useTheme } from '../context/ThemeContext'

interface Table {
  id: number
  number: number
  seats: number
  status: string
  type?: string
}

interface TableCardProps {
  table: Table
  width: number
}

export const TableCard: React.FC<TableCardProps> = ({ table, width }) => {
  const { colors } = useTheme()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return colors.success
      case 'Occupied':
        return colors.error
      case 'Reserved':
        return colors.primary
      case 'Cleaning':
        return colors.info
      default:
        return '#666'
    }
  }

  const getTableIcon = (type = 'Regular') => {
    if (type === 'Premium') {
      return 'https://img.freepik.com/free-vector/hot-pot-concept-illustration_114360-8670.jpg'
    }
    return 'https://img.freepik.com/free-vector/hand-drawn-hot-pot-illustration_23-2149175802.jpg'
  }

  return (
    <TouchableOpacity
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
      <Image source={{ uri: getTableIcon(table.type) }} style={styles.tableIcon} />
      <Text style={styles.tableNumber}>Table {table.number}</Text>
      <Text style={styles.tableSeats}>{table.seats} Seats</Text>
      {table.type === 'Premium' && (
        <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
      <Text style={[styles.tableStatus, { color: getStatusColor(table.status) }]}>
        {table.status}
      </Text>
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
  tableSeats: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  tableStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 'auto',
  },
  premiumBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  premiumText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
})
