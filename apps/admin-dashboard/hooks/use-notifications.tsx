"use client"

import { useState, useEffect, useCallback } from "react"
import type { Notification, CreateNotificationRequest, UpdateNotificationRequest } from "@/types/schema"
import api from "@/lib/axios"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data)
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
      const response = await api.get(`/notifications/${id}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new notification
  const createNotification = useCallback(async (notificationData: CreateNotificationRequest) => {
    try {
      const response = await api.post('/notifications', notificationData)
      setNotifications((prev) => [response.data, ...prev])
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing notification
  const updateNotification = useCallback(async (id: string, notificationData: UpdateNotificationRequest) => {
    try {
      const response = await api.patch(`/notifications/${id}`, notificationData)
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, ...response.data } : notification)),
      )
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}`, { isRead: true })
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
      )
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Since there's no specific endpoint for marking all as read,
      // we'll update each unread notification individually
      const unreadNotifications = notifications.filter(n => !n.isRead)
      await Promise.all(
        unreadNotifications.map(notification => 
          api.patch(`/notifications/${notification.id}`, { isRead: true })
        )
      )
      
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [notifications])

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      // Since there's no specific endpoint for deleting all,
      // we'll delete each notification individually
      await Promise.all(
        notifications.map(notification => 
          api.delete(`/notifications/${notification.id}`)
        )
      )
      
      setNotifications([])
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [notifications])

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
