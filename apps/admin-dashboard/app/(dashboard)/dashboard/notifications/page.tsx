"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import useNotifications from "@/hooks/use-notifications"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useEmployees } from "@/hooks/use-employees"
import { Employee } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

// Define the base Notification interface first
interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// Then extend it with the assignment properties
interface NotificationWithAssignment extends Notification {
  assignmentId?: string;
  read?: boolean;
}

// Add this schema for the assignment form
const assignmentFormSchema = z.object({
  notificationId: z.string().uuid({
    message: "Please select a valid notification",
  }),
  employeeId: z.string().uuid({
    message: "Please select a valid employee",
  }),
})

const NotificationsPage = () => {
  const {
    notifications: rawNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAssignment,
    deleteAllNotifications,
    createNotification,
    getNotificationsByEmployeeId,
    getNotificationCountByEmployee,
    fetchNotifications,
    updateNotification,
    updateAssignment,
    createAssignment,
  } = useNotifications()
  
  // Add useEffect to fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const { employees } = useEmployees()
  const { toast } = useToast()
  
  // State for notification dialog
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    employeeId: "all",
  })
  
  // State for assignment dialog
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  
  // State for filtering notifications
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all")
  
  // Add state for editing notifications and assignments
  const [editingNotification, setEditingNotification] = useState<NotificationWithAssignment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Add state for editing assignments
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [isEditAssignmentDialogOpen, setIsEditAssignmentDialogOpen] = useState(false);

  // Add state for delete confirmation
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Add state for multiple employee selection
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // Thêm state cho việc xóa assignment
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [isDeleteAssignmentDialogOpen, setIsDeleteAssignmentDialogOpen] = useState(false);
  
  // Initialize the assignment form
  const assignmentForm = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      notificationId: "",
      employeeId: "",
    },
  })
  
  // Transform notifications to include assignmentId and read status
  const notifications: NotificationWithAssignment[] = useMemo(() => {
    const transformed = rawNotifications.map((notification: any) => {
      const typedNotification = notification as any;
      const assignment = typedNotification.NotificationAssignments?.[0];
      return {
        ...notification,
        assignmentId: assignment?.id,
        read: assignment?.isRead || false
      };
    });
    
    // Apply filter based on read status
    if (filterStatus === "read") {
      return transformed.filter((notification: { read: any }) => notification.read);
    } else if (filterStatus === "unread") {
      return transformed.filter((notification: { read: any }) => !notification.read);
    }
    
    return transformed;
  }, [rawNotifications, filterStatus]);

  // Add a refresh function to update both tabs
  const refreshData = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (assignmentId: string) => {
    try {
      await markAsRead(assignmentId)
      toast({
        description: "Notification marked as read",
      })
      refreshData(); // Refresh data after marking as read
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  // Xử lý xóa thông báo
  const handleDeleteNotificationConfirmation = (id: string) => {
    setNotificationToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Xử lý xóa assignment
  const handleDeleteAssignmentConfirmation = (id: string) => {
    setAssignmentToDelete(id);
    setIsDeleteAssignmentDialogOpen(true);
  };
  
  // Xác nhận xóa thông báo
  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    
    try {
      await deleteNotification(notificationToDelete);
      toast({
        description: "Đã xóa thông báo thành công",
      });
      refreshData();
    } catch (error: any) {
      console.error("Lỗi khi xóa thông báo:", error);
      
      // Hiển thị thông báo lỗi
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa thông báo",
        variant: "destructive",
      });
      
      // Vẫn refresh data để cập nhật UI
      refreshData();
    } finally {
      setNotificationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Xác nhận xóa assignment
  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    
    try {
      await deleteAssignment(assignmentToDelete);
      toast({
        description: "Đã xóa assignment thành công",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa assignment",
        variant: "destructive",
      });
    } finally {
      setAssignmentToDelete(null);
      setIsDeleteAssignmentDialogOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast({
        description: "All notifications marked as read",
      })
      refreshData(); // Refresh data after marking all as read
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications()
      toast({
        description: "All notifications deleted",
      })
      refreshData(); // Refresh data after deleting all
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all notifications",
        variant: "destructive",
      })
    }
  }

  const handleCreateNotification = async () => {
    if (!newNotification.message) return

    setIsSending(true)
    try {
      // If "all" is selected, use the existing logic
      if (newNotification.employeeId === "all") {
        await createNotification({
          title: newNotification.title,
          message: newNotification.message,
          employeeId: "all",
        });
      } 
      // If multiple employees are selected
      else if (selectedEmployees.length > 0) {
        // First create the notification
        const notificationResponse = await api.post("/notifications", {
          title: newNotification.title || "New Notification",
          message: newNotification.message,
        });
        
        const notification = notificationResponse.data;
        
        // Create assignments for each selected employee
        await Promise.all(
          selectedEmployees.map(employeeId => 
            api.post("/notification-assignments", {
              notificationId: notification.id,
              employeeId,
              isRead: false,
              isDelete: false,
            })
          )
        );
        
        // Refresh notifications
        await fetchNotifications();
      } 
      // Single employee
      else {
        await createNotification({
          title: newNotification.title,
          message: newNotification.message,
          employeeId: newNotification.employeeId,
        });
      }

      toast({
        title: "Success",
        description: "Notification sent successfully",
      })

      setNewNotification({
        title: "",
        message: "",
        employeeId: "all",
      })
      setSelectedEmployees([]);
      setIsNotificationDialogOpen(false)
      refreshData();
    } catch (error) {
      console.error("Failed to create notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleCreateAssignment = async (data: z.infer<typeof assignmentFormSchema>) => {
    setIsSending(true)
    try {
      // Use the createAssignment function from useNotifications hook
      await createAssignment({
        notificationId: data.notificationId,
        employeeId: data.employeeId
      })

      toast({
        title: "Success",
        description: "Notification assignment created successfully",
      })

      assignmentForm.reset()
      setIsAssignmentDialogOpen(false)
      refreshData(); // Refresh data after creating assignment
    } catch (error) {
      console.error("Failed to create assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create notification assignment",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Add handler for updating a notification
  const handleUpdateNotification = async () => {
    if (!editingNotification) return;
    
    try {
      await updateNotification(editingNotification.id, {
        title: editingNotification.title,
        message: editingNotification.message
      });
      
      toast({
        description: "Notification updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setEditingNotification(null);
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    }
  };

  // Add handler for updating an assignment
  const handleUpdateAssignment = async () => {
    if (!editingAssignment) return;
    
    try {
      await updateAssignment(editingAssignment.id, {
        employeeId: editingAssignment.employeeId,
        isRead: editingAssignment.isRead
      });
      
      toast({
        description: "Assignment updated successfully",
      });
      
      setIsEditAssignmentDialogOpen(false);
      setEditingAssignment(null);
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="notifications">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-semibold">Notifications Management</h1>
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDeleteAllNotifications}>
              Delete All
            </Button>
            <Button variant="secondary" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          </div>
        </div>

        <TabsContent value="notifications">
          <div className="flex justify-between mb-5">
            <h2 className="text-xl font-medium">Notification List</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-status">Filter:</Label>
                <Select 
                  onValueChange={(value: "all" | "read" | "unread") => setFilterStatus(value)}
                  defaultValue="all"
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Notification</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Notification</DialogTitle>
                    <DialogDescription>Create a new notification and assign it to employees.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
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
                        onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="employeeId" className="text-right">
                        Recipients
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={newNotification.employeeId}
                          onValueChange={(value) => {
                            setNewNotification({ ...newNotification, employeeId: value });
                            // Clear selected employees if "all" is selected
                            if (value === "all") {
                              setSelectedEmployees([]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            <SelectItem value="multiple">Select Multiple Employees</SelectItem>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Show multi-select when "multiple" is chosen */}
                        {newNotification.employeeId === "multiple" && (
                          <div className="mt-4">
                            <Label>Select Employees</Label>
                            <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                              {employees.map((employee) => (
                                <div key={employee.id} className="flex items-center space-x-2 py-1">
                                  <Checkbox 
                                    id={`employee-${employee.id}`}
                                    checked={selectedEmployees.includes(employee.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedEmployees(prev => [...prev, employee.id]);
                                      } else {
                                        setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`employee-${employee.id}`}>{employee.name}</Label>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              {selectedEmployees.length} employees selected
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleCreateNotification} disabled={isSending}>
                      {isSending ? "Sending..." : "Send Notification"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {isLoading ? (
            <p>Loading notifications...</p>
          ) : notifications && notifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {notifications.map((notification, index) => (
                <Card key={`${notification.id}-${notification.assignmentId || ''}-${index}`}>
                  <CardHeader>
                    <CardTitle>{notification.title}</CardTitle>
                    <CardDescription>{new Date(notification.createdAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{notification.message}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingNotification(notification);
                        setIsEditDialogOpen(true);
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
        </TabsContent>

        <TabsContent value="assignments">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Notification Assignments</h2>
              <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Assignment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>
                      Assign a notification to a specific employee.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...assignmentForm}>
                    <form onSubmit={assignmentForm.handleSubmit(handleCreateAssignment)} className="space-y-4">
                      <FormField
                        control={assignmentForm.control}
                        name="notificationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a notification" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {rawNotifications.map((notification: any) => (
                                  <SelectItem key={notification.id} value={notification.id}>
                                    {notification.message.substring(0, 30)}
                                    {notification.message.length > 30 ? '...' : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={assignmentForm.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {employees.map((employee) => (
                                  <SelectItem key={employee.id} value={employee.id}>
                                    {employee.name} ({employee.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isSending}>
                          {isSending ? "Creating..." : "Create Assignment"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">Loading assignments...</TableCell>
                    </TableRow>
                  ) : (
                    // Process the notification assignments data more intelligently
                    rawNotifications
                      .flatMap(notification => 
                        notification.NotificationAssignments
                          ?.filter((assignment: { isDelete: boolean }) => !assignment.isDelete)
                          .map((assignment: any) => {
                            // Find the employee from the employees array using employeeId
                            const employee = employees.find(emp => emp.id === assignment.employeeId);
                            
                            return {
                              id: assignment.id,
                              employeeName: employee ? employee.name : 
                                           (assignment.employeeId ? `Employee ${assignment.employeeId}` : "Unknown"),
                              employeeRole: employee ? employee.role : "Unknown",
                              message: notification.message || notification.title,
                              title: notification.title,
                              isRead: assignment.isRead,
                              notificationId: notification.id,
                              createdAt: notification.createdAt
                            };
                          })
                      )
                      .filter(Boolean)
                      .map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.employeeName}</TableCell>
                          <TableCell>{assignment.employeeRole}</TableCell>
                          <TableCell>{assignment.message}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${assignment.isRead ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {assignment.isRead ? "Read" : "Unread"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!assignment.isRead && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAsRead(assignment.id)}
                                >
                                  Mark as Read
                                </Button>
                              )}
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => {
                                  setEditingAssignment(assignment);
                                  setIsEditAssignmentDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteAssignmentConfirmation(assignment.id)}
                              >
                                Xóa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {/* Edit Assignment Dialog */}
      <Dialog open={isEditAssignmentDialogOpen} onOpenChange={setIsEditAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update the notification assignment details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-employee" className="text-right">
                Employee
              </Label>
              <Select 
                onValueChange={(value) => setEditingAssignment((prev: any) => prev ? {...prev, employeeId: value} : null)}
                defaultValue={editingAssignment?.employeeId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-read-status" className="text-right">
                Read Status
              </Label>
              <Select 
                onValueChange={(value) => setEditingAssignment((prev: any) => prev ? {...prev, isRead: value === "true"} : null)}
                defaultValue={editingAssignment?.isRead ? "true" : "false"}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Read</SelectItem>
                  <SelectItem value="false">Unread</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateAssignment}>
              Update Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Notification Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>
              Update the notification details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editingNotification?.title || ""}
                onChange={(e) => setEditingNotification(prev => prev ? {...prev, title: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-message" className="text-right">
                Message
              </Label>
              <Textarea
                id="edit-message"
                value={editingNotification?.message || ""}
                onChange={(e) => setEditingNotification(prev => prev ? {...prev, message: e.target.value} : null)}
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
      {/* Dialog xác nhận xóa thông báo */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteNotification}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa assignment */}
      <Dialog open={isDeleteAssignmentDialogOpen} onOpenChange={setIsDeleteAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa assignment này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAssignmentDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAssignment}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NotificationsPage
