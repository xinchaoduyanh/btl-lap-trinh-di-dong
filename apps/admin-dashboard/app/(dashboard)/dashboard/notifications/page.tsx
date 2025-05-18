"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Trash, Plus, Send, Edit } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { useToast } from "@/hooks/use-toast"
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
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsPage() {
  const { toast } = useToast()
  const {
    notifications,
    isLoading,
    deleteNotification,
    createNotification,
    updateNotification,
  } = useNotifications()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    message: "",
  })
  const [editingNotification, setEditingNotification] = useState({
    id: "",
    message: "",
  })
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCreateNotification = async () => {
    if (!newNotification.message) return

    setIsSending(true)
    try {
      await createNotification({
        message: newNotification.message,
        employeeId: ""
      })

      setNewNotification({
        message: "",
      })
      setIsDialogOpen(false)
      toast({
        title: "Success",
        description: "Notification sent successfully",
      })
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

  const handleEditNotification = (notification: any) => {
    setEditingNotification({
      id: notification.id,
      message: notification.message,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateNotification = async () => {
    if (!editingNotification.message) return

    setIsUpdating(true)
    try {
      await updateNotification(editingNotification.id, {
        message: editingNotification.message,
      })

      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Notification updated successfully",
      })
    } catch (error) {
      console.error("Failed to update notification:", error)
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }



  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id)
      toast({
        description: "Notification deleted",
      })
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
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
        </div>
      </div>


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
            <Card key={notification.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-600" />
                  <CardTitle className="text-sm font-medium">
                    Notification
                  </CardTitle>
                </div>
                <CardDescription>{formatDate(notification.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditNotification(notification)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteNotification(notification.id)}>
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

      {/* Edit Notification Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>Update the notification message</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-message">Message</Label>
              <Textarea
                id="edit-message"
                value={editingNotification.message}
                onChange={(e) => setEditingNotification({ ...editingNotification, message: e.target.value })}
                placeholder="Enter your notification message here"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleUpdateNotification}
              disabled={!editingNotification.message || isUpdating}
            >
              {isUpdating ? (
                <>Updating...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Update Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
