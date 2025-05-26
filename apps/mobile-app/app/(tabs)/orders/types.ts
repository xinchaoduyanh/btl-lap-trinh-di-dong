import type { OrderItemStatus } from '../../../constants/interface'

// Order status colors
export const STATUS_COLORS: Record<OrderItemStatus | 'DELIVERED' | 'COMPLETED', string> = {
  PENDING: '#FF9800',
  PREPARING: '#2196F3',
  READY: '#4CAF50',
  DELIVERED: '#9C27B0',
  COMPLETED: '#607D8B',
  COMPLETE: '#4CAF50',
}

// Default image for food items
export const DEFAULT_FOOD_IMAGE = 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
