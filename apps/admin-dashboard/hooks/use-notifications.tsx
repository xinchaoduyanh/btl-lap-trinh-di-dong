"use client"

import { useState, useCallback } from "react"
import api from "@/lib/axios"

interface Notification {
  NotificationAssignments: any
  id: string
  title: string
  message: string
  createdAt: string
  updatedAt: string
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch notifications with employee data included
      const response = await api.get("/notifications", {
        params: {
          include: "NotificationAssignments.employee" // Request to include employee data in assignments
        }
      })
      
      // Ensure we have the employee data in each assignment
      const notificationsWithEmployees = response.data.map((notification: any) => {
        if (notification.NotificationAssignments) {
          notification.NotificationAssignments = notification.NotificationAssignments.map(
            (assignment: any) => {
              // Make sure employee data is available
              if (!assignment.employee && assignment.employeeId) {
                console.log(`Missing employee data for assignment ${assignment.id}, employeeId: ${assignment.employeeId}`);
              }
              return assignment;
            }
          );
        }
        return notification;
      });
      
      setNotifications(notificationsWithEmployees)
      return notificationsWithEmployees
    } catch (err) {
      console.error(err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

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
    async ({ title, message, employeeId }: { title?: string; message: string; employeeId: string }) => {
      try {
        // First create the notification using the POST Create Notifications endpoint
        const notificationResponse = await api.post("/notifications", {
          title: title || "New Notification",
          message,
        })

        const notification = notificationResponse.data
        console.log("Created notification:", notification);

        // If employeeId is "all", get all employees and create assignments for each
        if (employeeId === "all") {
          // Get all employees
          const employeesResponse = await api.get("/employees")
          const employees = employeesResponse.data
          console.log("Fetched employees:", employees);

          // Create notification assignments for each employee using POST Create Notification Assignment
          await Promise.all(
            employees.map((employee: { id: string }) =>
              api.post("/notification-assignments", {
                notificationId: notification.id,
                employeeId: employee.id,
                isRead: false,
                isDelete: false,
              }).catch(error => {
                console.error(`Error creating assignment for employee ${employee.id}:`, error.response?.data || error.message);
                throw error;
              }),
            ),
          )
        } else {
          // Create assignment for specific employee
          try {
            console.log("Creating assignment with payload:", {
              notificationId: notification.id,
              employeeId,
              isRead: false,
              isDelete: false,
            });
            
            await api.post("/notification-assignments", {
              notificationId: notification.id,
              employeeId,
              isRead: false,
              isDelete: false,
            });
          } catch (assignmentError: any) {
            console.error("Assignment creation error details:", 
              assignmentError.response?.data || assignmentError.message);
            throw assignmentError;
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
    [fetchNotifications],
  )

  const updateNotification = useCallback(async (id: string, data: any) => {
    try {
      const response = await api.patch(`/notifications/${id}`, data)

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, ...data } : notification)),
      )

      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Xóa thông báo (notification)
  const deleteNotification = useCallback(async (id: string) => {
    try {
      console.log("Đang xóa thông báo với ID:", id);
      
      try {
        // Đầu tiên, lấy tất cả assignment cho thông báo này
        const notificationData = await api.get(`/notifications/${id}`);
        const assignments = notificationData.data.NotificationAssignments || [];
        
        // Xóa tất cả assignment trước
        await Promise.all(
          assignments.map((assignment: { id: string }) => 
            api.delete(`/notification-assignments/${assignment.id}`)
          )
        );
        
        console.log("Đã xóa tất cả assignment của thông báo");
      } catch (assignmentError) {
        console.error("Lỗi khi xóa assignments:", assignmentError);
        // Tiếp tục xóa thông báo ngay cả khi có lỗi với assignments
      }
      
      try {
        // Sau đó xóa thông báo
        await api.delete(`/notifications/${id}`);
        console.log("Thông báo đã được xóa");
      } catch (deleteError: any) {
        // Kiểm tra xem deleteError có phải là đối tượng có thuộc tính response không
        let errorMessage = "Lỗi không xác định khi xóa thông báo";
        let statusCode = 0;
        
        if (deleteError && typeof deleteError === 'object') {
          if (deleteError.response) {
            statusCode = deleteError.response.status;
            errorMessage = deleteError.response.data?.message || "Lỗi server khi xóa thông báo";
          } else if (deleteError.message) {
            errorMessage = deleteError.message;
          }
        }
        
        console.error("Lỗi khi xóa thông báo:", errorMessage, "Status:", statusCode);
        
        // Nếu lỗi 500, có thể thông báo đã bị xóa hoặc không tồn tại
        if (statusCode === 500) {
          console.log("Thông báo có thể đã bị xóa hoặc không tồn tại, tiếp tục cập nhật UI");
          // Tiếp tục cập nhật UI mặc dù có lỗi từ server
        } else {
          // Nếu là lỗi khác, ném lỗi để xử lý ở nơi gọi hàm
          throw new Error(errorMessage);
        }
      }

      // Cập nhật state bất kể có lỗi hay không
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
      
      return true;
    } catch (err) {
      console.error("Lỗi trong deleteNotification:", err);
      throw err;
    }
  }, []);

  // Xóa assignment
  const deleteAssignment = useCallback(async (id: string) => {
    try {
      console.log("Đang xóa assignment với ID:", id);
      
      // Đánh dấu assignment là đã xóa
      await api.patch(`/notification-assignments/${id}`, { isDelete: true });
      console.log("Assignment đã được đánh dấu là đã xóa");

      // Cập nhật state để xóa assignment này
      setNotifications((prev) => {
        return prev
          .map((notification) => {
            const typedNotification = notification as any;
            if (typedNotification.NotificationAssignments?.some((a: { id: string }) => a.id === id)) {
              // Lọc ra assignment đã xóa
              const updatedAssignments = typedNotification.NotificationAssignments.filter((a: any) => a.id !== id);

              // Nếu không còn assignment nào, trả về undefined để lọc ra sau
              if (updatedAssignments.length === 0) {
                return undefined; // Sẽ bị lọc ra
              }

              // Nếu không thì cập nhật assignments
              return {
                ...notification,
                NotificationAssignments: updatedAssignments,
              };
            }
            return notification;
          })
          .filter((notification): notification is Notification => notification !== undefined); // Type guard để đảm bảo không null
      });
      
      return true;
    } catch (err) {
      console.error("Lỗi trong deleteAssignment:", err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Use the PATCH Update Read By Id endpoint
      const response = await api.patch(`/notification-assignments/${id}/read`)

      // Update the local state to reflect the change
      setNotifications((prev) => {
        return prev.map((notification) => {
          const typedNotification = notification as any
          if (typedNotification.NotificationAssignments?.some((a: { id: string }) => a.id === id)) {
            // Create a new notification object with updated assignment
            return {
              ...notification,
              NotificationAssignments: typedNotification.NotificationAssignments.map((a: { id: string }) =>
                a.id === id ? { ...a, isRead: true } : a,
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

  const markAllAsRead = useCallback(async () => {
    try {
      // This endpoint might not exist in the backend yet
      // You might need to implement it or handle it differently
      
      const unreadAssignments = notifications
        .flatMap((notification: any) => 
          notification.NotificationAssignments?.filter((a: any) => !a.isRead) || []
        )
        .map((assignment: any) => assignment.id);
      
      // Mark each unread assignment as read
      await Promise.all(
        unreadAssignments.map((assignmentId: string) => 
          api.patch(`/notification-assignments/${assignmentId}/read`)
        )
      );
      
      // Update local state
      setNotifications((prev) => {
        return prev.map((notification: any) => {
          if (notification.NotificationAssignments) {
            return {
              ...notification,
              NotificationAssignments: notification.NotificationAssignments.map((a: any) => ({
                ...a,
                isRead: true
              }))
            };
          }
          return notification;
        });
      });
      
      return true;
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [notifications])

  const deleteAllNotifications = useCallback(async () => {
    try {
      // This endpoint might not exist in the backend yet
      // You might need to implement it or handle it differently
      
      // Get all assignment IDs
      const assignmentIds = notifications
        .flatMap((notification: any) => 
          notification.NotificationAssignments?.map((a: any) => a.id) || []
        );
      
      // Mark each assignment as deleted
      await Promise.all(
        assignmentIds.map((assignmentId: string) => 
          api.patch(`/notification-assignments/${assignmentId}`, { isDelete: true })
        )
      );
      
      // Clear local state
      setNotifications([]);
      
      return true;
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [notifications])

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
      const response = await api.get(`/notification-assignments/employee/${employeeId}/unread-count`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

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
              NotificationAssignments: typedNotification.NotificationAssignments.map((a: { id: string }) =>
                a.id === id ? { ...a, ...data } : a,
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

  // Add function to create an assignment
  const createAssignment = useCallback(async (data: { notificationId: string; employeeId: string }) => {
    try {
      const response = await api.post("/notification-assignments", {
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
  }, [fetchNotifications])

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    getNotification,
    createNotification,
    updateNotification,
    deleteNotification,
    deleteAssignment,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    getNotificationsByEmployeeId,
    getNotificationCountByEmployee,
    updateAssignment,
    createAssignment,
  }
}

export default useNotifications
