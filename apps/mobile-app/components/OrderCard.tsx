'use client'

import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'

interface Order {
  id: string
  table: string
  items: number
  status: string
  time: string
  details?: string
}

interface OrderCardProps {
  order: Order
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { colors } = useTheme()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return colors.primary
      case 'Preparing':
        return colors.info
      case 'Ready':
        return colors.success
      case 'Delivered':
        return colors.tertiary
      case 'Completed':
        return '#666'
      default:
        return '#666'
    }
  }

  const getOrderImage = (details = '') => {
    if (details.toLowerCase().includes('spicy')) {
      return 'https://img.freepik.com/free-photo/spicy-hot-pot_74190-4240.jpg'
    } else if (details.toLowerCase().includes('seafood')) {
      return 'https://img.freepik.com/free-photo/seafood-hot-pot_74190-7520.jpg'
    } else if (details.toLowerCase().includes('vegetarian')) {
      return 'https://img.freepik.com/free-photo/vegetable-hot-pot_74190-7286.jpg'
    }
    return 'https://img.freepik.com/free-photo/hot-pot-asian-food_74190-7540.jpg'
  }

  return (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <Image source={{ uri: getOrderImage(order.details) }} style={styles.orderImage} />

        <View style={styles.orderDetailsContainer}>
          <View style={styles.orderInfo}>
            <Feather name="map-pin" size={16} color="#666" />
            <Text style={styles.orderInfoText}>{order.table}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Feather name="shopping-bag" size={16} color="#666" />
            <Text style={styles.orderInfoText}>{order.items} items</Text>
          </View>
          <View style={styles.orderInfo}>
            <Feather name="clock" size={16} color="#666" />
            <Text style={styles.orderInfoText}>{order.time}</Text>
          </View>

          {order.details && (
            <Text style={styles.orderDetailsText} numberOfLines={2}>
              {order.details}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="eye" size={16} color={colors.info} />
          <Text style={[styles.actionText, { color: colors.info }]}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Feather name="edit-2" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Feather name="check-circle" size={16} color={colors.success} />
          <Text style={[styles.actionText, { color: colors.success }]}>Complete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  orderDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderInfoText: {
    marginLeft: 4,
    color: '#666',
  },
  orderDetailsText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontWeight: '500',
  },
})
