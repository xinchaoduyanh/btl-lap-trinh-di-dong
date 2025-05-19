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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Search, Plus, MoreHorizontal, Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import api from '@/lib/axios'
import * as z from 'zod'
import { useEmployees } from '@/hooks/use-employees'
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
    notifications: paginatedNotifications,
    allNotifications,
    isLoading,
    deleteNotification,
    createNotification,
    fetchNotifications,
    updateNotification,
    totalPages,
    currentPage,
    changePage,
    itemsPerPage,
    changeItemsPerPage,
  } = useNotifications()

  const { employees } = useEmployees()
  const { toast } = useToast()

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

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

  // Add state for editing employee selection
  const [editingSelectedEmployees, setEditingSelectedEmployees] = useState<string[]>([])

  // Add useEffect to fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Filter notifications based on search term
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter(
      (notification) =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allNotifications, searchTerm])

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredNotifications.slice(startIndex, endIndex)
  }, [filteredNotifications, currentPage, itemsPerPage])

  // Add a refresh function to update data
  const refreshData = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Handle delete notification confirmation
  const handleDeleteNotificationConfirmation = (id: string) => {
    setNotificationToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete notification
  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return

    try {
      await deleteNotification(notificationToDelete)
      toast({
        description: 'Notification deleted successfully',
      })
      refreshData()
    } catch (error: any) {
      console.error('Error deleting notification:', error)

      toast({
        title: 'Error',
        description: error.message || 'Could not delete notification',
        variant: 'destructive',
      })

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

  // Handle opening edit dialog
  const handleOpenEditDialog = (notification: NotificationWithAssignment) => {
    setEditingNotification(notification)

    // Get list of employees assigned to this notification
    const fetchAssignedEmployees = async () => {
      try {
        const response = await api.get(`/notifications/${notification.id}`)

        // Get employee IDs from assignments
        const employeeIds =
          response.data.NotificationAssignments?.map((assignment: any) => assignment.employeeId) ||
          []

        setEditingSelectedEmployees(employeeIds)
      } catch (error) {
        console.error('Failed to fetch notification assignments:', error)
        setEditingSelectedEmployees([])
      }
    }

    fetchAssignedEmployees()
    setIsEditDialogOpen(true)
  }

  const handleUpdateNotification = async () => {
    if (!editingNotification) return

    try {
      // Update notification information
      await updateNotification(editingNotification.id, {
        title: editingNotification.title,
        message: editingNotification.message,
      })

      // Get current assignment list
      const response = await api.get(`/notifications/${editingNotification.id}`, {
        params: { include: 'NotificationAssignments' },
      })

      const currentAssignments = response.data.NotificationAssignments || []
      const currentEmployeeIds = currentAssignments.map((a: any) => a.employeeId)

      // Remove assignments not in selected list
      const toRemove = currentAssignments.filter(
        (a: any) => !editingSelectedEmployees.includes(a.employeeId)
      )

      for (const assignment of toRemove) {
        await api.delete(`/notification-assignments/${assignment.id}`)
      }

      // Add new assignments
      const toAdd = editingSelectedEmployees.filter((id) => !currentEmployeeIds.includes(id))

      for (const employeeId of toAdd) {
        await api.post('/notification-assignments', {
          notificationId: editingNotification.id,
          employeeId,
          isRead: false,
          isDelete: false,
        })
      }

      toast({
        description: 'Notification updated successfully',
      })

      setIsEditDialogOpen(false)
      setEditingNotification(null)
      setEditingSelectedEmployees([])
      refreshData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      })
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    changePage(page)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-semibold">Notifications Management</h1>
      </div>

      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notifications..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full h-[300px] flex items-center justify-center rounded-lg border border-dashed">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Loading notifications...</h3>
            </div>
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((notification) => (
            <div
              key={notification.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="p-6 flex flex-col">
                <h3 className="text-lg font-bold">{notification.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {notification.message.length > 25
                    ? `${notification.message.substring(0, 25)}...`
                    : notification.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </p>
                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditDialog(notification)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteNotificationConfirmation(notification.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-[300px] flex items-center justify-center rounded-lg border border-dashed">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No notifications found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                No notifications match your search criteria. Try adjusting your search or create a
                new notification.
              </p>
              <Button className="mt-4" onClick={() => setIsNotificationDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of{' '}
            {filteredNotifications.length} notifications
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              changeItemsPerPage(parseInt(value))
              changePage(1) // Reset to first page when changing items per page
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="16">16</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">per page</p>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        )}
      </div>

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-employees" className="text-right">
                Send to
              </Label>
            </div>

            {/* Employee selection for editing */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Recipients</Label>
              <div className="col-span-3 border rounded-md p-4 max-h-40 overflow-y-auto">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`edit-employee-${employee.id}`}
                      checked={editingSelectedEmployees.includes(employee.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditingSelectedEmployees((prev) => [...prev, employee.id])
                        } else {
                          setEditingSelectedEmployees((prev) =>
                            prev.filter((id) => id !== employee.id)
                          )
                        }
                      }}
                    />
                    <label
                      htmlFor={`edit-employee-${employee.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {employee.name} ({employee.role})
                    </label>
                  </div>
                ))}
              </div>
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
