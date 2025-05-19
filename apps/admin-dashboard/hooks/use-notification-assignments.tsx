'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/axios'

interface NotificationAssignment {
  id: string
  notificationId: string
  employeeId: string
  isRead: boolean
  isDelete: boolean
  notification?: {
    id: string
    title: string
    message: string
    createdAt: string
    updatedAt: string
  }
  employee?: {
    id: string
    name: string
    role: string
  }
}

interface CreateNotificationAssignmentDto {
  notificationId: string
  employeeId: string
  isRead?: boolean
  isDelete?: boolean
}

interface UpdateNotificationAssignmentDto {
  isRead?: boolean
  isDelete?: boolean
}

const useNotificationAssignments = () => {
  const [assignments, setAssignments] = useState<NotificationAssignment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  // Fetch all assignments
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/notification-assignments')
      setAssignments(response.data)
      return response.data
    } catch (err) {
      console.error(err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single assignment by ID
  const getAssignment = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/notification-assignments/${id}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new assignment
  const createAssignment = useCallback(async (data: CreateNotificationAssignmentDto) => {
    try {
      const response = await api.post('/notification-assignments', {
        notificationId: data.notificationId,
        employeeId: data.employeeId,
        isRead: data.isRead ?? false,
        isDelete: data.isDelete ?? false,
      })

      // Update local state
      setAssignments((prev) => [...prev, response.data])

      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an assignment
  const updateAssignment = useCallback(
    async (id: string, data: UpdateNotificationAssignmentDto) => {
      try {
        const response = await api.patch(`/notification-assignments/${id}`, data)

        // Update local state
        setAssignments((prev) =>
          prev.map((assignment) => (assignment.id === id ? { ...assignment, ...data } : assignment))
        )

        return response.data
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    []
  )

  // Delete an assignment
  const deleteAssignment = useCallback(async (id: string) => {
    try {
      await api.delete(`/notification-assignments/${id}`)

      // Update local state
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id))

      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Mark an assignment as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await api.patch(`/notification-assignments/${id}/read`)

      // Update local state
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === id ? { ...assignment, isRead: true } : assignment
        )
      )

      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Mark an assignment as deleted (soft delete)
  const markAsDeleted = useCallback(async (id: string) => {
    try {
      const response = await api.patch(`/notification-assignments/${id}`, { isDelete: true })

      // Update local state
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === id ? { ...assignment, isDelete: true } : assignment
        )
      )

      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Get assignments by employee ID
  const getAssignmentsByEmployee = useCallback(
    async (employeeId: string, includeDeleted: boolean = false) => {
      try {
        const response = await api.get(`/notification-assignments/employee/${employeeId}/all`, {
          params: { includeDeleted: includeDeleted.toString() },
        })
        return response.data
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    []
  )

  // Get unread count by employee ID
  const getUnreadCountByEmployee = useCallback(async (employeeId: string) => {
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

  // Get assignments by notification ID
  const getAssignmentsByNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await api.get(`/notification-assignments/notification/${notificationId}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Mark all assignments as read
  const markAllAsRead = useCallback(
    async (employeeId?: string) => {
      try {
        let assignmentsToUpdate: NotificationAssignment[] = []

        if (employeeId) {
          // Get all unread assignments for this employee
          const employeeAssignments = await getAssignmentsByEmployee(employeeId)
          assignmentsToUpdate = employeeAssignments.filter((a: NotificationAssignment) => !a.isRead)
        } else {
          // Use the current state if no employeeId is provided
          assignmentsToUpdate = assignments.filter((a) => !a.isRead)
        }

        // Mark each assignment as read
        await Promise.all(
          assignmentsToUpdate.map((assignment) =>
            api.patch(`/notification-assignments/${assignment.id}/read`)
          )
        )

        // Update local state
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignmentsToUpdate.some((a) => a.id === assignment.id)
              ? { ...assignment, isRead: true }
              : assignment
          )
        )

        return true
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [assignments, getAssignmentsByEmployee]
  )

  // Delete all assignments (soft delete)
  const deleteAllAssignments = useCallback(
    async (employeeId?: string) => {
      try {
        let assignmentsToDelete: NotificationAssignment[] = []

        if (employeeId) {
          // Get all assignments for this employee
          const employeeAssignments = await getAssignmentsByEmployee(employeeId, true)
          assignmentsToDelete = employeeAssignments.filter(
            (a: NotificationAssignment) => !a.isDelete
          )
        } else {
          // Use the current state if no employeeId is provided
          assignmentsToDelete = assignments.filter((a) => !a.isDelete)
        }

        // Mark each assignment as deleted
        await Promise.all(
          assignmentsToDelete.map((assignment) =>
            api.patch(`/notification-assignments/${assignment.id}`, { isDelete: true })
          )
        )

        // Update local state
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignmentsToDelete.some((a) => a.id === assignment.id)
              ? { ...assignment, isDelete: true }
              : assignment
          )
        )

        return true
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [assignments, getAssignmentsByEmployee]
  )

  return {
    assignments,
    isLoading,
    error,
    fetchAssignments,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    markAsRead,
    markAsDeleted,
    getAssignmentsByEmployee,
    getUnreadCountByEmployee,
    getAssignmentsByNotification,
    markAllAsRead,
    deleteAllAssignments,
  }
}

export default useNotificationAssignments
