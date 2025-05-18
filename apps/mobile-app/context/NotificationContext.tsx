import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { config } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa interface cho Notification
export interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

// Định nghĩa interface cho NotificationAssignment
export interface NotificationAssignment {
  id: string;
  notificationId: string;
  employeeId: string;
  isRead: boolean;
  isDelete: boolean;
  notification: Notification;
}

// Định nghĩa interface cho NotificationItem (hiển thị trong UI)
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
  assignmentId: string;
}

// Định nghĩa interface cho NotificationContext
interface NotificationContextType {
  notifications: NotificationItem[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (assignmentId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (assignmentId: string) => Promise<void>;
  countUnread: () => Promise<number>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Hàm chuyển đổi từ NotificationAssignment sang NotificationItem
  const mapToNotificationItem = (assignment: NotificationAssignment): NotificationItem => {
    // Xác định loại thông báo dựa trên nội dung
    let type = 'message';
    const message = assignment.notification.message.toLowerCase();
    
    if (message.includes('order') || message.includes('đơn hàng')) {
      type = 'order';
    } else if (message.includes('schedule') || message.includes('lịch')) {
      type = 'schedule';
    } else if (message.includes('table') || message.includes('bàn')) {
      type = 'table';
    } else if (message.includes('inventory') || message.includes('kho')) {
      type = 'inventory';
    }

    // Tạo tiêu đề từ nội dung thông báo
    let title = 'Thông báo mới';
    if (type === 'order') title = 'Đơn hàng mới';
    if (type === 'schedule') title = 'Cập nhật lịch';
    if (type === 'table') title = 'Thông báo bàn';
    if (type === 'inventory') title = 'Cảnh báo kho';

    // Định dạng thời gian
    const createdAt = new Date(assignment.notification.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    let timeString = '';
    if (diffMins < 60) {
      timeString = `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      timeString = `${diffHours} giờ trước`;
    } else {
      timeString = `${diffDays} ngày trước`;
    }

    return {
      id: assignment.notification.id,
      title,
      message: assignment.notification.message,
      time: timeString,
      read: assignment.isRead,
      type,
      assignmentId: assignment.id
    };
  };

  // Lấy danh sách thông báo từ API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Lấy ID của nhân viên đang đăng nhập
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      const user = JSON.parse(userData);
      const employeeId = user.id;

      // Gọi API để lấy thông báo
      const response = await fetch(`${config.API_URL}/notification-assignments/employee/${employeeId}`);
      
      if (!response.ok) {
        throw new Error('Không thể lấy thông báo');
      }
      
      const data = await response.json();
      
      // Lọc ra các thông báo chưa bị xóa và chuyển đổi sang định dạng NotificationItem
      const notificationItems = data
        .filter(item => !item.isDelete)
        .map(mapToNotificationItem);
      
      setNotifications(notificationItems);
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu thông báo đã đọc
  const markAsRead = async (assignmentId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/notification-assignments/${assignmentId}/read`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error('Không thể đánh dấu thông báo đã đọc');
      }
      
      // Cập nhật state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.assignmentId === assignmentId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notification => !notification.read);
      
      // Nếu không có thông báo chưa đọc, không cần thực hiện gì
      if (unreadNotifications.length === 0) {
        return;
      }
      
      // Đánh dấu từng thông báo là đã đọc
      const promises = unreadNotifications.map(notification => 
        fetch(`${config.API_URL}/notification-assignments/${notification.assignmentId}/read`, {
          method: 'PATCH'
        })
      );
      
      await Promise.all(promises);
      
      // Cập nhật state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      Alert.alert('Thành công', 'Tất cả thông báo đã được đánh dấu là đã đọc');
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  // Xóa thông báo
  const deleteNotification = async (assignmentId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/notification-assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isDelete: true })
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa thông báo');
      }
      
      // Cập nhật state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.assignmentId !== assignmentId)
      );
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  // Đếm số lượng thông báo chưa đọc
  const countUnread = async (): Promise<number> => {
    try {
      // Lấy ID của nhân viên đang đăng nhập
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        return 0;
      }
      
      const user = JSON.parse(userData);
      const employeeId = user.id;

      // Gọi API để lấy số lượng thông báo chưa đọc
      const response = await fetch(`${config.API_URL}/notification-assignments/employee/${employeeId}/unread-count`);
      
      if (!response.ok) {
        return 0;
      }
      
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Lỗi khi đếm thông báo chưa đọc:', error);
      return 0;
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      countUnread
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification phải được sử dụng trong NotificationProvider');
  }
  return context;
};
