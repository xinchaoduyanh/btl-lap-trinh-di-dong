'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import useNotifications from '@/hooks/use-notifications'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useEmployees } from '@/hooks/use-employees'
import { Employee } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'

// Define the base Notification interface first
interface Notification {
  id: string
  title: string
  message: string
  createdAt: string
  updatedAt: string
}

// Then extend it with the assignment properties
interface NotificationWithAssignment extends Notification {
  assignmentId?: string
  read?: boolean
}

const NotificationsPage = () => {
  const {
    notifications: rawNotifications,
    isLoading,
    deleteNotification,
    createNotification,
    fetchNotifications,
    updateNotification,
  } = useNotifications()

  // Add useEffect to fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const { employees } = useEmployees()
  const { toast } = useToast()

  // State for notification dialog
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    employeeId: 'all',
  })

  // Add state for editing notifications
  const [editingNotification, setEditingNotification] = useState<NotificationWithAssignment | null>(
    null
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Add state for delete confirmation
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Add state for multiple employee selection
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  // Transform notifications to include assignmentId and read status
  const notifications: NotificationWithAssignment[] = useMemo(() => {
    const transformed = rawNotifications.map((notification: any) => {
      const typedNotification = notification as any
      const assignment = typedNotification.NotificationAssignments?.[0]
      return {
        ...notification,
        assignmentId: assignment?.id,
        read: assignment?.isRead || false,
      }
    })

    return transformed
  }, [rawNotifications])

  // Add a refresh function to update data
  const refreshData = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Xử lý xóa thông báo
  const handleDeleteNotificationConfirmation = (id: string) => {
    setNotificationToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Xác nhận xóa thông báo
  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return

    try {
      await deleteNotification(notificationToDelete)
      toast({
        description: 'Đã xóa thông báo thành công',
      })
      refreshData()
    } catch (error: any) {
      console.error('Lỗi khi xóa thông báo:', error)

      // Hiển thị thông báo lỗi
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa thông báo',
        variant: 'destructive',
      })

      // Vẫn refresh data để cập nhật UI
      refreshData()
    } finally {
      setNotificationToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleCreateNotification = async () => {
    if (!newNotification.message) return

    setIsSending(true)
    try {
      // If "all" is selected, use the existing logic
      if (newNotification.employeeId === 'all') {
        await createNotification({
          title: newNotification.title,
          message: newNotification.message,
          employeeId: 'all',
        })
      }
      // If multiple employees are selected
      else if (selectedEmployees.length > 0) {
        // First create the notification
        const notificationResponse = await api.post('/notifications', {
          title: newNotification.title || 'New Notification',
          message: newNotification.message,
        })

        const notification = notificationResponse.data

        // Create assignments for each selected employee
        await Promise.all(
          selectedEmployees.map((employeeId) =>
            api.post('/notification-assignments', {
              notificationId: notification.id,
              employeeId,
              isRead: false,
              isDelete: false,
            })
          )
        )

        // Refresh notifications
        await fetchNotifications()
      }
      // Single employee
      else {
        await createNotification({
          title: newNotification.title,
          message: newNotification.message,
          employeeId: newNotification.employeeId,
        })
      }

      toast({
        description: 'Notification sent successfully',
      })
      setNewNotification({
        title: '',
        message: '',
        employeeId: 'all',
      })
      setSelectedEmployees([])
      setIsNotificationDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateNotification = async () => {
    if (!editingNotification) return

    try {
      await updateNotification(editingNotification.id, {
        title: editingNotification.title,
        message: editingNotification.message,
      })

      toast({
        description: 'Notification updated successfully',
      })

      setIsEditDialogOpen(false)
      setEditingNotification(null)
      refreshData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-semibold">Notifications Management</h1>
      </div>

      <div className="flex justify-between mb-5">
        <h2 className="text-xl font-medium">Notification List</h2>
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Notification</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
              <DialogDescription>
                Create a new notification and assign it to employees.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, message: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee" className="text-right">
                  Send to
                </Label>
                <Select
                  onValueChange={(value) => {
                    setNewNotification({ ...newNotification, employeeId: value })
                    // Clear selected employees if "all" is selected
                    if (value === 'all') {
                      setSelectedEmployees([])
                    }
                  }}
                  defaultValue="all"
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Multiple employee selection */}
              {newNotification.employeeId !== 'all' && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Or select multiple</Label>
                  <div className="col-span-3 border rounded-md p-4 max-h-40 overflow-y-auto">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`employee-${employee.id}`}
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees((prev) => [...prev, employee.id])
                            } else {
                              setSelectedEmployees((prev) =>
                                prev.filter((id) => id !== employee.id)
                              )
                            }
                          }}
                        />
                        <label
                          htmlFor={`employee-${employee.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {employee.name} ({employee.role})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleCreateNotification} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Notification'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading notifications...</p>
      ) : notifications && notifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notifications.map((notification, index) => (
            <Card key={`${notification.id}-${notification.assignmentId || ''}-${index}`}>
              <CardHeader>
                <CardTitle>{notification.title}</CardTitle>
                <CardDescription>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingNotification(notification)
                    setIsEditDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteNotificationConfirmation(notification.id)}
                >
                  Xóa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No notifications found</p>
        </div>
      )}

      {/* Edit Notification Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>Make changes to the notification details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editingNotification?.title || ''}
                onChange={(e) =>
                  setEditingNotification((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-message" className="text-right">
                Message
              </Label>
              <Textarea
                id="edit-message"
                value={editingNotification?.message || ''}
                onChange={(e) =>
                  setEditingNotification((prev) =>
                    prev ? { ...prev, message: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateNotification}>
              Update Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteNotification}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NotificationsPage
