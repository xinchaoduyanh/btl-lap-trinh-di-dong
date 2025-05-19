'use client'

import { useState, useCallback, useMemo } from 'react'
import api from '@/lib/axios'
import useNotificationAssignments from './use-notification-assignments'

interface Notification {
  NotificationAssignments: any
  id: string
  title: string
  message: string
  createdAt: string
  updatedAt: string
}

interface PaginationParams {
  page: number
  limit: number
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)

  // Maximum length for notification messages in the list view
  const MAX_MESSAGE_LENGTH = 100

  // Sử dụng hook useNotificationAssignments
  const {
    createAssignment: createNotificationAssignment,
    deleteAssignment,
    markAsRead,
    getAssignmentsByEmployee,
    getUnreadCountByEmployee,
    updateAssignment: updateNotificationAssignment,
    markAllAsRead: markAllAssignmentsAsRead,
    deleteAllAssignments,
  } = useNotificationAssignments()

  // Truncate message to specified length
  const truncateMessage = (message: string): string => {
    if (message.length <= MAX_MESSAGE_LENGTH) return message
    return message.substring(0, MAX_MESSAGE_LENGTH) + '...'
  }

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all notifications without pagination
      const response = await api.get('/notifications')

      // Process notifications and truncate messages
      const notificationsWithEmployees = (response.data.items || response.data).map(
        (notification: any) => {
          // Truncate message for list view
          notification.displayMessage = truncateMessage(notification.message)

          if (notification.NotificationAssignments) {
            notification.NotificationAssignments = notification.NotificationAssignments.map(
              (assignment: any) => {
                if (!assignment.employee && assignment.employeeId) {
                  console.log(
                    `Missing employee data for assignment ${assignment.id}, employeeId: ${assignment.employeeId}`
                  )
                }
                return assignment
              }
            )
          }
          return notification
        }
      )

      setNotifications(notificationsWithEmployees)
      setTotalCount(notificationsWithEmployees.length)
      setTotalPages(Math.ceil(notificationsWithEmployees.length / itemsPerPage))
      return notificationsWithEmployees
    } catch (err) {
      console.error(err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [itemsPerPage])

  // Change page - handles pagination on frontend
  const changePage = useCallback(
    (page: number) => {
      if (page < 1 || (totalPages > 0 && page > totalPages)) return
      setCurrentPage(page)
    },
    [totalPages]
  )

  // Change items per page
  const changeItemsPerPage = useCallback(
    (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage)
      setCurrentPage(1) // Reset to first page when changing items per page
      setTotalPages(Math.ceil(totalCount / newItemsPerPage))
    },
    [totalCount]
  )

  // Get paginated notifications for current view
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return notifications.slice(startIndex, endIndex)
  }, [notifications, currentPage, itemsPerPage])

  const getNotification = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/notifications/${id}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  const createNotification = useCallback(
    async ({
      title,
      message,
      employeeId,
    }: {
      title?: string
      message: string
      employeeId: string
    }) => {
      try {
        // First create the notification using the POST Create Notifications endpoint
        const notificationResponse = await api.post('/notifications', {
          title: title || 'New Notification',
          message,
        })

        const notification = notificationResponse.data
        console.log('Created notification:', notification)

        // If employeeId is "all", get all employees and create assignments for each
        if (employeeId === 'all') {
          // Get all employees
          const employeesResponse = await api.get('/employees')
          const employees = employeesResponse.data
          console.log('Fetched employees:', employees)

          // Create notification assignments for each employee using POST Create Notification Assignment
          await Promise.all(
            employees.map((employee: { id: string }) =>
              createNotificationAssignment({
                notificationId: notification.id,
                employeeId: employee.id,
                isRead: false,
                isDelete: false,
              }).catch((error: { response: { data: any }; message: any }) => {
                console.error(
                  `Error creating assignment for employee ${employee.id}:`,
                  error.response?.data || error.message
                )
                throw error
              })
            )
          )
        } else {
          // Create assignment for specific employee
          try {
            console.log('Creating assignment with payload:', {
              notificationId: notification.id,
              employeeId,
              isRead: false,
              isDelete: false,
            })

            await createNotificationAssignment({
              notificationId: notification.id,
              employeeId,
              isRead: false,
              isDelete: false,
            })
          } catch (assignmentError: any) {
            console.error(
              'Assignment creation error details:',
              assignmentError.response?.data || assignmentError.message
            )
            throw assignmentError
          }
        }

        // Refresh notifications list
        await fetchNotifications()

        return notification
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [createNotificationAssignment, fetchNotifications]
  )

  const updateNotification = useCallback(async (id: string, data: any) => {
    try {
      const response = await api.patch(`/notifications/${id}`, data)

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, ...data } : notification
        )
      )

      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Xóa thông báo (notification)
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        console.log('Đang xóa thông báo với ID:', id)

        try {
          // Đầu tiên, lấy tất cả assignment cho thông báo này
          const notificationData = await getNotification(id)
          const assignments = notificationData.NotificationAssignments || []

          // Xóa tất cả assignment trước
          await Promise.all(
            assignments.map((assignment: { id: string }) => deleteAssignment(assignment.id))
          )

          console.log('Đã xóa tất cả assignment của thông báo')
        } catch (assignmentError) {
          console.error('Lỗi khi xóa assignments:', assignmentError)
          // Tiếp tục xóa thông báo ngay cả khi có lỗi với assignments
        }

        // Sau đó xóa thông báo
        await api.delete(`/notifications/${id}`)
        console.log('Thông báo đã được xóa')

        // Cập nhật state
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))

        return true
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [getNotification, deleteAssignment]
  )

  // Add function to update an assignment
  const updateAssignment = useCallback(async (id: string, data: any) => {
    try {
      const response = await api.patch(`/notification-assignments/${id}`, data)

      // Update local state if needed
      setNotifications((prev) => {
        return prev.map((notification) => {
          const typedNotification = notification as any
          if (typedNotification.NotificationAssignments?.some((a: { id: string }) => a.id === id)) {
            return {
              ...notification,
              NotificationAssignments: typedNotification.NotificationAssignments.map(
                (a: { id: string }) => (a.id === id ? { ...a, ...data } : a)
              ),
            }
          }
          return notification
        })
      })

      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Xóa assignment (sử dụng từ useNotificationAssignments)
  const deleteNotificationAssignment = useCallback(
    async (id: string) => {
      try {
        console.log('Đang xóa assignment với ID:', id)

        // Đánh dấu assignment là đã xóa
        await updateAssignment(id, { isDelete: true })
        console.log('Assignment đã được đánh dấu là đã xóa')

        // Cập nhật state để xóa assignment này
        setNotifications((prev) => {
          return prev
            .map((notification) => {
              const typedNotification = notification as any
              if (
                typedNotification.NotificationAssignments?.some((a: { id: string }) => a.id === id)
              ) {
                // Lọc ra assignment đã xóa
                const updatedAssignments = typedNotification.NotificationAssignments.filter(
                  (a: any) => a.id !== id
                )

                // Nếu không còn assignment nào, trả về undefined để lọc ra sau
                if (updatedAssignments.length === 0) {
                  return undefined // Sẽ bị lọc ra
                }

                // Nếu không thì cập nhật assignments
                return {
                  ...notification,
                  NotificationAssignments: updatedAssignments,
                }
              }
              return notification
            })
            .filter((notification): notification is Notification => notification !== undefined) // Type guard để đảm bảo không null
        })

        return true
      } catch (err) {
        console.error('Lỗi trong deleteAssignment:', err)
        throw err
      }
    },
    [updateAssignment]
  )

  // Đánh dấu thông báo đã đọc (sử dụng từ useNotificationAssignments)
  const markNotificationAsRead = useCallback(
    async (id: string) => {
      try {
        // Use the PATCH Update Read By Id endpoint
        const response = await markAsRead(id)

        // Update the local state to reflect the change
        setNotifications((prev) => {
          return prev.map((notification) => {
            const typedNotification = notification as any
            if (
              typedNotification.NotificationAssignments?.some((a: { id: string }) => a.id === id)
            ) {
              // Create a new notification object with updated assignment
              return {
                ...notification,
                NotificationAssignments: typedNotification.NotificationAssignments.map(
                  (a: { id: string }) => (a.id === id ? { ...a, isRead: true } : a)
                ),
              }
            }
            return notification
          })
        })

        return response
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [markAsRead]
  )

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadAssignments = notifications
        .flatMap(
          (notification: any) =>
            notification.NotificationAssignments?.filter((a: any) => !a.isRead) || []
        )
        .map((assignment: any) => assignment.id)

      // Mark each unread assignment as read
      await Promise.all(unreadAssignments.map((assignmentId: string) => markAsRead(assignmentId)))

      // Update local state
      setNotifications((prev) => {
        return prev.map((notification: any) => {
          if (notification.NotificationAssignments) {
            return {
              ...notification,
              NotificationAssignments: notification.NotificationAssignments.map((a: any) => ({
                ...a,
                isRead: true,
              })),
            }
          }
          return notification
        })
      })

      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [notifications, markAsRead])

  // Xóa tất cả thông báo
  const deleteAllNotifications = useCallback(async () => {
    try {
      // Get all assignment IDs
      const assignmentIds = notifications.flatMap(
        (notification: any) => notification.NotificationAssignments?.map((a: any) => a.id) || []
      )

      // Mark each assignment as deleted
      await Promise.all(
        assignmentIds.map((assignmentId: string) =>
          updateAssignment(assignmentId, { isDelete: true })
        )
      )

      // Clear local state
      setNotifications([])

      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [notifications, updateAssignment])

  const getNotificationsByEmployeeId = useCallback(async (employeeId: string) => {
    try {
      const response = await api.get(`/notification-assignments/employee/${employeeId}/all`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  const getNotificationCountByEmployee = useCallback(async (employeeId: string) => {
    try {
      const response = await api.get(
        `/notification-assignments/employee/${employeeId}/unread-count`
      )
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Add function to create an assignment
  const createAssignment = useCallback(
    async (data: { notificationId: string; employeeId: string }) => {
      try {
        const response = await api.post('/notification-assignments', {
          notificationId: data.notificationId,
          employeeId: data.employeeId,
          isRead: false,
          isDelete: false,
        })

        // Refresh notifications to include the new assignment
        await fetchNotifications()

        return response.data
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [fetchNotifications]
  )

  return {
    notifications: paginatedNotifications,
    allNotifications: notifications,
    isLoading,
    error,
    fetchNotifications,
    getNotification,
    createNotification,
    updateNotification,
    deleteNotification,
    // Pagination
    totalCount,
    totalPages,
    currentPage,
    changePage,
    itemsPerPage,
    changeItemsPerPage,
    // Message truncation
    truncateMessage,
    MAX_MESSAGE_LENGTH,
  }
}

export default useNotifications
