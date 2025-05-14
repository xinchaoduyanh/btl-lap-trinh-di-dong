"use client"

import { useState, useEffect, useCallback } from "react"
import type { Notification, CreateNotificationRequest, UpdateNotificationRequest } from "@/types/schema"

// Mock data for development
const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "New order placed at Table 3",
    isRead: false,
    employeeId: "all",
    createdAt: "2023-05-01T12:30:00.000Z",
  },
  {
    id: "2",
    message: "Employee John Doe checked in",
    isRead: false,
    employeeId: "1",
    createdAt: "2023-05-01T08:00:00.000Z",
  },
  {
    id: "3",
    message: "Table 5 order is ready for service",
    isRead: true,
    employeeId: "all",
    createdAt: "2023-05-01T13:15:00.000Z",
  },
  {
    id: "4",
    message: "Employee Jane Smith checked out",
    isRead: true,
    employeeId: "2",
    createdAt: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "5",
    message: "Inventory alert: Low stock on menu item 'Beef Hotpot'",
    isRead: false,
    employeeId: "all",
    createdAt: "2023-05-01T14:45:00.000Z",
  },
]

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/notifications')
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setNotifications(mockNotifications)
    } catch (err) {
      setError("Failed to fetch notifications")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single notification by ID
  const getNotification = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/notifications/${id}`)
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const notification = mockNotifications.find((n) => n.id === id)
      if (!notification) throw new Error("Notification not found")
      return notification
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new notification
  const createNotification = useCallback(async (notificationData: CreateNotificationRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/notifications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const newNotification: Notification = {
        ...notificationData,
        id: Date.now().toString(),
        isRead: notificationData.isRead ?? false,
        createdAt: new Date().toISOString(),
      }
      setNotifications((prev) => [newNotification, ...prev])
      return newNotification
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing notification
  const updateNotification = useCallback(async (id: string, notificationData: UpdateNotificationRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/notifications/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, ...notificationData } : notification)),
      )
      return { id, ...notificationData }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/notifications/${id}`, { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Mark a notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        return await updateNotification(id, { isRead: true })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [updateNotification],
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      // await fetch('/api/notifications/mark-all-read', { method: 'POST' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      // await fetch('/api/notifications', { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setNotifications([])
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Load notifications on initial mount
  useEffect(() => {
    fetchNotifications()
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
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
  }
}
