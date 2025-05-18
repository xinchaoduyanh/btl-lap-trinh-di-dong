"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash, Plus, Send } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { useEmployees } from "@/hooks/use-employees"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,
  } = useNotifications()

  const { employees, isLoading: isLoadingEmployees } = useEmployees()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    employeeId: "all",
  })
  const [isSending, setIsSending] = useState(false)

  const handleCreateNotification = async () => {
    if (!newNotification.message) return

    setIsSending(true)
    try {
      await createNotification({
        message: newNotification.message,
        employeeId: newNotification.employeeId,
        isRead: false
      })

      setNewNotification({
        title: "",
        message: "",
        employeeId: "all",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to create notification:", error)
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Bell className="mr-2 h-6 w-6 text-red-600" />
            Notifications
          </h1>
          <p className="text-muted-foreground">View and manage your notifications</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>Create a notification to send to employees</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select
                    value={newNotification.employeeId}
                    onValueChange={(value) => setNewNotification({ ...newNotification, employeeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {!isLoadingEmployees &&
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Notification title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Enter your notification message here"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleCreateNotification}
                  disabled={!newNotification.message || isSending}
                >
                  {isSending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => markAllAsRead()} disabled={unreadCount === 0 || isLoading}>
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
          <Button
            variant="outline"
            onClick={() => deleteAllNotifications()}
            disabled={notifications.length === 0 || isLoading}
          >
            <Trash className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {unreadCount > 0 && !isLoading && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <div className="flex justify-end gap-2 w-full">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.isRead ? "bg-muted/40" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className={`h-4 w-4 ${notification.isRead ? "text-muted-foreground" : "text-red-600"}`} />
                  <CardTitle className="text-sm font-medium">
                    {!notification.isRead && (
                      <Badge variant="default" className="mr-2 bg-red-600">
                        New
                      </Badge>
                    )}
                    {notification.employeeId === "all" ? "Broadcast" : `To: ${notification.employee?.name || "Employee"}`}
                  </CardTitle>
                </div>
                <CardDescription>{formatDate(notification.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={notification.isRead ? "text-muted-foreground" : ""}>{notification.message}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {!notification.isRead && (
                  <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => deleteNotification(notification.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground">You don't have any notifications at the moment.</p>
            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
