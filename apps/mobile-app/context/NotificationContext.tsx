import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { config } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa interface cho Notification
export interface Notification {
  id: string;
  message: string;
  title: string;
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
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (assignmentId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (assignmentId: string) => Promise<void>;
  countUnread: () => Promise<number>;
  refreshUnreadCount: () => Promise<void>;
  lastFetchTime: number | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Cập nhật số lượng thông báo chưa đọc khi component được mount
  useEffect(() => {
    refreshUnreadCount();

    // Thiết lập interval để cập nhật số lượng thông báo chưa đọc mỗi 10 giây
    const intervalId = setInterval(() => {
      refreshUnreadCount();
    }, 10000); // Thay đổi từ 15000 (15s) thành 10000 (10s)

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Hàm chuyển đổi từ NotificationAssignment sang NotificationItem
  const mapToNotificationItem = (assignment: NotificationAssignment): NotificationItem => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!assignment || !assignment.notification) {
        console.log('Dữ liệu thông báo không hợp lệ:', assignment);
        return {
          id: assignment?.id || '0',
          title: 'Thông báo không xác định',
          message: 'Không thể hiển thị nội dung thông báo',
          time: 'Không xác định',
          read: assignment?.isRead || false,
          type: 'message',
          assignmentId: assignment?.id || '0'
        };
      }

      // Xác định loại thông báo dựa trên nội dung
      let type = 'message';
      const message = assignment.notification.message?.toLowerCase() || '';

      if (message.includes('order') || message.includes('đơn hàng')) {
        type = 'order';
      } else if (message.includes('schedule') || message.includes('lịch')) {
        type = 'schedule';
      } else if (message.includes('table') || message.includes('bàn')) {
        type = 'table';
      } else if (message.includes('inventory') || message.includes('kho')) {
        type = 'inventory';
      }

      // Sử dụng title từ API nếu có, nếu không thì tạo title dựa trên loại thông báo
      let title = assignment.notification.title || 'Thông báo mới';
      
      // Nếu không có title từ API, tạo title dựa trên loại thông báo
      if (!assignment.notification.title) {
        if (type === 'order') title = 'Đơn hàng mới';
        if (type === 'schedule') title = 'Cập nhật lịch';
        if (type === 'table') title = 'Thông báo bàn';
        if (type === 'inventory') title = 'Cảnh báo kho';
      }

      // Định dạng thời gian
      let timeString = 'Vừa xong';

      if (assignment.notification.createdAt) {
        const createdAt = new Date(assignment.notification.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) {
          timeString = `${diffMins} phút trước`;
        } else if (diffHours < 24) {
          timeString = `${diffHours} giờ trước`;
        } else {
          timeString = `${diffDays} ngày trước`;
        }
      }

      return {
        id: assignment.notification.id || '0',
        title,
        message: assignment.notification.message || 'Không có nội dung',
        time: timeString,
        read: assignment.isRead || false,
        type,
        assignmentId: assignment.id || '0'
      };
    } catch (error) {
      console.error('Lỗi khi chuyển đổi thông báo:', error);
      return {
        id: '0',
        title: 'Lỗi thông báo',
        message: 'Đã xảy ra lỗi khi hiển thị thông báo này',
        time: 'Không xác định',
        read: false,
        type: 'message',
        assignmentId: '0'
      };
    }
  };

  // Lấy danh sách thông báo từ API
  const fetchNotifications = useCallback(async () => {
    // Kiểm tra thời gian từ lần fetch cuối cùng
    const now = Date.now();
    // Nếu đã fetch trong vòng 5 giây, không fetch lại
    if (lastFetchTime && now - lastFetchTime < 5000) {
      console.log('Đã fetch gần đây, bỏ qua');
      return;
    }

    setLoading(true);
    try {
      // Lấy ID của nhân viên đang đăng nhập
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.log('Không tìm thấy thông tin người dùng');
        setNotifications([]);
        return;
      }

      const user = JSON.parse(userData);
      const employeeId = user.id;

      // Thiết lập timeout cho fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout

      try {
        // Gọi API để lấy thông báo
        const response = await fetch(
          `${config.API_URL}/notification-assignments/employee/${employeeId}/all`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.log('Không thể lấy thông báo, status:', response.status);
          // Sử dụng dữ liệu giả nếu không thể kết nối với API
          setNotifications([
            {
              id: '1',
              title: 'Thông báo mẫu',
              message: 'Đây là thông báo mẫu khi không thể kết nối với server.',
              time: 'Vừa xong',
              read: false,
              type: 'message',
              assignmentId: '1'
            }
          ]);
          setUnreadCount(1);
          return;
        }

        const data = await response.json();

        // Kiểm tra xem data có phải là mảng không
        if (!Array.isArray(data)) {
          console.log('Dữ liệu từ API không phải là mảng:', data);
          setNotifications([
            {
              id: '1',
              title: 'Lỗi dữ liệu',
              message: 'Dữ liệu thông báo không đúng định dạng',
              time: 'Vừa xong',
              read: false,
              type: 'message',
              assignmentId: '1'
            }
          ]);
          setUnreadCount(1);
          return;
        }

        // Lọc ra các thông báo chưa bị xóa và chuyển đổi sang định dạng NotificationItem
        const notificationItems = data
          .filter((item: NotificationAssignment) => item && !item.isDelete)
          .map(mapToNotificationItem);

        setNotifications(notificationItems);

        // Cập nhật số lượng thông báo chưa đọc
        await refreshUnreadCount();
        
        // Cập nhật thời gian fetch cuối cùng
        setLastFetchTime(Date.now());
      } catch (fetchError) {
        console.log('Lỗi khi fetch:', fetchError);
        // Sử dụng dữ liệu giả nếu không thể kết nối với API
        setNotifications([
          {
            id: '1',
            title: 'Thông báo mẫu',
            message: 'Đây là thông báo mẫu khi không thể kết nối với server.',
            time: 'Vừa xong',
            read: false,
            type: 'message',
            assignmentId: '1'
          }
        ]);
        setUnreadCount(1);
      }
    } catch (error) {
      console.log('Lỗi:', error);
      // Không hiển thị Alert vì có thể gây crash
      setNotifications([
        {
          id: '1',
          title: 'Thông báo mẫu',
          message: 'Đây là thông báo mẫu khi không thể kết nối với server.',
          time: 'Vừa xong',
          read: false,
          type: 'message',
          assignmentId: '1'
        }
      ]);
      setUnreadCount(1);
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

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

      // Cập nhật số lượng thông báo chưa đọc
      await refreshUnreadCount();
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

      // Cập nhật số lượng thông báo chưa đọc
      setUnreadCount(0);

      Alert.alert('Thành công', 'Tất cả thông báo đã được đánh dấu là đã đọc');
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  // Xóa thông báo
  const deleteNotification = async (assignmentId: string) => {
    try {
      // Kiểm tra xem thông báo có đang ở trạng thái chưa đọc không
      const notification = notifications.find(n => n.assignmentId === assignmentId);
      const wasUnread = notification && !notification.read;

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

      // Nếu thông báo đã xóa là thông báo chưa đọc, cập nhật số lượng thông báo chưa đọc
      if (wasUnread) {
        await refreshUnreadCount();
      }
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

  // Cập nhật số lượng thông báo chưa đọc
  const refreshUnreadCount = async (): Promise<void> => {
    try {
      const count = await countUnread();
      setUnreadCount(count);
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng thông báo chưa đọc:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      countUnread,
      refreshUnreadCount,
      lastFetchTime
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
