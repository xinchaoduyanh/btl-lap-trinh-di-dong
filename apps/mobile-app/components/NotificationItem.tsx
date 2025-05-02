import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  type: string
}

interface NotificationItemProps {
  notification: Notification
  onPress: () => void
  onDelete: () => void
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const getIconName = (type: string) => {
    switch (type) {
      case 'order':
        return 'shopping-bag'
      case 'schedule':
        return 'calendar'
      case 'table':
        return 'grid'
      case 'inventory':
        return 'package'
      case 'message':
        return 'message-square'
      default:
        return 'bell'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#4CAF50'
      case 'schedule':
        return '#2196F3'
      case 'table':
        return '#FF9800'
      case 'inventory':
        return '#F44336'
      case 'message':
        return '#9C27B0'
      default:
        return '#666'
    }
  }

  return (
    <TouchableOpacity
      style={[styles.notificationCard, !notification.read && styles.unreadNotification]}
      onPress={onPress}
    >
      <View style={styles.notificationIcon}>
        <View
          style={[
            styles.iconBackground,
            { backgroundColor: getIconColor(notification.type) + '20' },
          ]}
        >
          <Feather
            name={getIconName(notification.type)}
            size={20}
            color={getIconColor(notification.type)}
          />
        </View>
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Feather name="trash-2" size={18} color="#F44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationIcon: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
})
