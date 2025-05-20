"use client"
import React, { useState, useEffect, useCallback } from "react"
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator, Modal, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useRouter, useFocusEffect } from "expo-router"

// Components
import { Header } from "../../../components/Header"
import { NotificationItem } from "../../../components/NotificationItem"
import { useNotification } from "../../../context/NotificationContext"

/**
 * Màn hình Thông báo
 * Hiển thị danh sách các thông báo của người dùng
 * Cho phép đánh dấu đã đọc và xóa thông báo
 */
export default function NotificationsScreen() {
  const router = useRouter()
  // Lấy các hàm và state từ NotificationContext
  const {
    notifications, // Danh sách thông báo
    loading, // Trạng thái đang tải
    unreadCount, // Số lượng thông báo chưa đọc
    fetchNotifications, // Hàm lấy danh sách thông báo
    markAsRead, // Hàm đánh dấu thông báo đã đọc
    markAllAsRead, // Hàm đánh dấu tất cả thông báo đã đọc
    deleteNotification, // Hàm xóa thông báo
    refreshUnreadCount // Hàm cập nhật số lượng thông báo chưa đọc
  } = useNotification()

  // State cho dialog chi tiết thông báo
  const [selectedNotification, setSelectedNotification] = useState<null | {
    title: string;
    message: string;
    time: string;
    type: string;
  }>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State để theo dõi số lượng thông báo chưa đọc trước đó
  const [previousUnreadCount, setPreviousUnreadCount] = useState<number | null>(null)
  
  // Sử dụng useFocusEffect để theo dõi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      // Khi màn hình được focus (người dùng vào màn hình)
      const loadData = async () => {
        try {
          // Lấy số lượng thông báo chưa đọc hiện tại
          await refreshUnreadCount()
          
          // Nếu đây là lần đầu vào màn hình hoặc có sự thay đổi số lượng
          if (previousUnreadCount === null || previousUnreadCount !== unreadCount) {
            setError(null)
            await fetchNotifications()
            setPreviousUnreadCount(unreadCount)
          }
        } catch (error) {
          console.error("Lỗi khi tải thông báo:", error)
          setError("Không thể tải thông báo. Vui lòng thử lại sau.")
        }
      }
      
      loadData()
      
      // Cleanup function khi màn hình không còn focus
      return () => {
        // Không cần cleanup gì đặc biệt
      }
    }, [unreadCount, previousUnreadCount, refreshUnreadCount, fetchNotifications])
  )

  // Xử lý đánh dấu thông báo đã đọc và hiển thị chi tiết
  const handleNotificationPress = useCallback(async (notification: any, assignmentId: string) => {
    try {
      // Đánh dấu thông báo đã đọc
      await markAsRead(assignmentId)
      
      // Hiển thị dialog chi tiết
      setSelectedNotification({
        title: notification.title,
        message: notification.message,
        time: notification.time,
        type: notification.type
      })
      setModalVisible(true)
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error)
      Alert.alert("Lỗi", "Không thể đánh dấu thông báo đã đọc")
    }
  }, [markAsRead])

  // Xử lý xóa thông báo
  const handleDeleteNotification = useCallback(async (assignmentId: string) => {
    try {
      await deleteNotification(assignmentId)
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error)
      Alert.alert("Lỗi", "Không thể xóa thông báo")
    }
  }, [deleteNotification])

  // Xử lý đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error)
      Alert.alert("Lỗi", "Không thể đánh dấu tất cả thông báo đã đọc")
    }
  }, [markAllAsRead])

  // Hàm rút gọn nội dung thông báo
  const truncateMessage = useCallback((message: string, maxLength: number = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }, [])

  // Lấy màu icon dựa trên loại thông báo
  const getIconColor = useCallback((type: string) => {
    switch (type) {
      case 'order': return '#4CAF50' // Xanh lá
      case 'schedule': return '#2196F3' // Xanh dương
      case 'table': return '#FF9800' // Cam
      case 'inventory': return '#F44336' // Đỏ
      default: return '#9E9E9E' // Xám
    }
  }, [])

  // Lấy tên icon dựa trên loại thông báo
  const getIconName = useCallback((type: string) => {
    switch (type) {
      case 'order': return 'shopping-bag'
      case 'schedule': return 'calendar'
      case 'table': return 'grid'
      case 'inventory': return 'box'
      default: return 'bell'
    }
  }, [])

  // Hàm refresh thủ công
  const handleRefresh = useCallback(async () => {
    try {
      setError(null)
      await fetchNotifications()
    } catch (error) {
      console.error("Lỗi khi tải lại thông báo:", error)
      setError("Không thể tải thông báo. Vui lòng thử lại sau.")
    }
  }, [fetchNotifications])

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với nút quay lại và nút đánh dấu tất cả đã đọc */}
      <Header
        title="Thông báo"
        onBackPress={() => router.back()}
        rightIcon="check-square"
        onRightPress={handleMarkAllAsRead}
      />

      <ScrollView style={styles.content}>
        {loading ? (
          // Hiển thị loading khi đang tải dữ liệu
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#FF8C00" />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : error ? (
          // Hiển thị lỗi nếu có
          <View style={styles.emptyContainer}>
            <Feather name="alert-circle" size={64} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>Tải lại</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length > 0 ? (
          // Hiển thị danh sách thông báo nếu có dữ liệu
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={{
                id: Number(notification.id),
                title: notification.title,
                message: truncateMessage(notification.message), // Rút gọn nội dung
                time: notification.time,
                read: notification.read,
                type: notification.type
              }}
              onPress={() => handleNotificationPress(notification, notification.assignmentId || notification.id)} // Sử dụng assignmentId nếu có, nếu không thì dùng id
              onDelete={() => handleDeleteNotification(notification.assignmentId || notification.id)}
            />
          ))
        ) : (
          // Hiển thị thông báo trống nếu không có dữ liệu
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có thông báo</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal hiển thị chi tiết thông báo - PHIÊN BẢN CHUYÊN NGHIỆP */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedNotification && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <Feather 
                      name={getIconName(selectedNotification.type)} 
                      size={24} 
                      color={getIconColor(selectedNotification.type)} 
                    />
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                    <Text style={styles.modalTime}>{selectedNotification.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Feather name="x" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalDivider} />
                
                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999", // Màu chữ nhạt cho thông báo trống
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666", // Màu chữ cho thông báo đang tải
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#F44336", // Màu chữ đỏ cho thông báo lỗi
    textAlign: "center",
    marginHorizontal: 20,
  },
  refreshButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FF8C00",
    borderRadius: 4,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  
  // Styles cho modal - Phiên bản chuyên nghiệp
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 12,
    color: '#888',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
  modalBody: {
    padding: 16,
    maxHeight: 300,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  modalCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
