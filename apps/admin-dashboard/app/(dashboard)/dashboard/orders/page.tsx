"use client"


import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye, Filter, AlertCircle, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { useOrders } from "@/hooks/use-orders"
import { Order, OrderStatus } from "@/types/schema"
import api from "@/lib/axios"


export default function OrdersPage() {
  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder
  } = useOrders()

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Dialog states
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

  // Forms
  const newForm = useForm({
    defaultValues: {
      tableId: "",
      employeeId: "",
      status: "PENDING"
    }
  })

  const editForm = useForm({
    defaultValues: {
      tableId: "",
      employeeId: "",
      status: "",
      timeOut: ""
    }
  })


  // Add these state variables with your other state declarations
  const [isUpdateAlertOpen, setIsUpdateAlertOpen] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [isPendingDeleteAlertOpen, setIsPendingDeleteAlertOpen] = useState(false)
  const [isDuplicateOrderAlertOpen, setIsDuplicateOrderAlertOpen] = useState(false)
  const [duplicateOrderError, setDuplicateOrderError] = useState("")


  // Function to show update alert
  const showUpdateAlert = (message: string) => {
    setUpdateMessage(message)
    setIsUpdateAlertOpen(true)
  }


  const handleCreateOrder = async (data: any) => {
    setIsSubmitting(true)
    try {
      await createOrder(data)
      setIsNewDialogOpen(false)
      newForm.reset()
      toast({
        title: "Order created",
        description: "The order has been successfully created."
      })
    } catch (err) {
      console.error("Error creating order:", err);

      // Check if error is about duplicate order ID
      const errorMessage = (err as Error).message;
      if (errorMessage.includes("duplicate") || errorMessage.includes("already exists") || errorMessage.includes("Unique constraint")) {
        // Set error message and open duplicate order alert dialog
        setDuplicateOrderError(errorMessage);
        setIsDuplicateOrderAlertOpen(true);
      } else {
        // Show generic error toast for other errors
        toast({
          title: "Error creating order",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateOrder = async (id: string, data: any) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting update for order:', id)
      console.log('Update data:', data)

      // Clean up the data before sending
      const cleanData = {
        ...data,
        timeOut: data.timeOut === "" ? null : data.timeOut
      }

      await updateOrder(id, cleanData)

      // Close the dialog
      setIsEditDialogOpen(false)

      // Show success alert
      showUpdateAlert("The order has been successfully updated.")

      // Refresh orders list
      fetchOrders()
    } catch (err) {
      console.error('Error in handleUpdateOrder:', err)
      showUpdateAlert(`Error updating order: ${(err as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleDeleteConfirm = (id: string) => {
    // Find order by ID
    const orderToCheck = orders.find(order => order.id === id)

    // Check if order has PENDING status
    if (orderToCheck && orderToCheck.status === "PENDING") {
      // Show cannot delete dialog
      setIsPendingDeleteAlertOpen(true)
      return
    }

    // If not PENDING, continue with normal delete process
    setOrderToDelete(id)
    setIsDeleteDialogOpen(true)
  }


  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      await deleteOrder(orderToDelete)
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted."
      })
    } catch (err) {
      toast({
        title: "Error deleting order",
        description: (err as Error).message,
        variant: "destructive"
      })
    } finally {
      setOrderToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsEditDialogOpen(true)
  }


  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Reset form when opening new dialog
  useEffect(() => {
    if (isNewDialogOpen) {
      newForm.reset({
        tableId: "",
        employeeId: "",
        status: "PENDING"
      })
    }
  }, [isNewDialogOpen, newForm])

  // Populate edit form when selecting an order
  useEffect(() => {
    if (selectedOrder && isEditDialogOpen) {
      editForm.reset({
        tableId: selectedOrder.tableId,
        employeeId: selectedOrder.employeeId,
        status: selectedOrder.status,
        timeOut: selectedOrder.timeOut || ""
      })
    }
  }, [selectedOrder, isEditDialogOpen, editForm])


  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchTerm) ||
      order.tableId.includes(searchTerm) ||
      order.employeeId.includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())


    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter


    return matchesSearch && matchesStatus
  })


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="border-border bg-background text-foreground">Pending</Badge>
      case "PREPARING":
        return <Badge className="bg-secondary text-secondary-foreground">Preparing</Badge>
      case "READY":
        return <Badge className="badge-warning">Ready</Badge>
      case "DELIVERED":
        return <Badge className="bg-primary text-primary-foreground">Delivered</Badge>
      case "COMPLETED":
        return <Badge className="badge-success">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }


  const testDirectUpdate = async (id: string) => {
    try {
      // Simple test data
      const testData = {
        status: "COMPLETED"
      };

      console.log("Testing direct update for order:", id);
      console.log("Test data:", testData);

      // Make a direct API call
      const response = await api.patch(`/orders/${id}`, testData);
      console.log("Direct update response:", response);

      // Refresh orders
      fetchOrders();

      toast({
        title: "Direct update test",
        description: "Check console for details"
      });
    } catch (err) {
      console.error("Direct update error:", err);
      toast({
        title: "Direct update failed",
        description: (err as Error).message,
        variant: "destructive"
      });
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your restaurant orders</p>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>


      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PREPARING">Preparing</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table ID</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                  Error loading orders: {error.message}
                </TableCell>
              </TableRow>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.tableId.substring(0, 8)}...</TableCell>
                  <TableCell>{order.employeeId.substring(0, 8)}...</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.timeOut ? formatDate(order.timeOut) : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteConfirm(order.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Order Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Enter the details for the new order
            </DialogDescription>
          </DialogHeader>
          <Form {...newForm}>
            <form onSubmit={newForm.handleSubmit(handleCreateOrder)} className="space-y-4">
              <FormField
                control={newForm.control}
                name="tableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter table ID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={newForm.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee ID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={newForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PREPARING">Preparing</SelectItem>
                        <SelectItem value="READY">Ready</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Order"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                      <p>{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div>{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Table ID</p>
                      <p>{selectedOrder.tableId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                      <p>{selectedOrder.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created At</p>
                      <p>{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time Out</p>
                      <p>{selectedOrder.timeOut ? formatDate(selectedOrder.timeOut) : "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEditOrder(selectedOrder)
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedOrder && testDirectUpdate(selectedOrder.id)}
                  className="bg-yellow-100"
                >
                  Test Direct Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Update the order details
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <Form {...editForm}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = editForm.getValues();
                  handleUpdateOrder(selectedOrder.id, formData);
                }}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="tableId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter table ID" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter employee ID" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PREPARING">Preparing</SelectItem>
                          <SelectItem value="READY">Ready</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="timeOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Out</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                          onChange={(e) => {
                            const value = e.target.value ? new Date(e.target.value).toISOString() : "";
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Order"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Update Alert Dialog */}
      <AlertDialog open={isUpdateAlertOpen} onOpenChange={setIsUpdateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Update</AlertDialogTitle>
            <AlertDialogDescription>
              {updateMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cannot Delete Pending Order Dialog */}
      <AlertDialog open={isPendingDeleteAlertOpen} onOpenChange={setIsPendingDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Không thể xóa đơn hàng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Không thể xóa đơn hàng có trạng thái <span className="font-bold text-primary">Pending</span>.
              <br /><br />
              Vui lòng thay đổi trạng thái đơn hàng trước khi thực hiện xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary flex items-center gap-2">
              <Check className="h-4 w-4" /> Đã hiểu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Order ID Alert Dialog */}
      <AlertDialog open={isDuplicateOrderAlertOpen} onOpenChange={setIsDuplicateOrderAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Lỗi: Trùng mã đơn hàng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Không thể tạo đơn hàng mới vì mã đơn hàng đã tồn tại trong hệ thống.
              <br /><br />
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-mono">{duplicateOrderError}</p>
              </div>
              <br />
              Vui lòng kiểm tra lại thông tin và thử lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary flex items-center gap-2">
              <Check className="h-4 w-4" /> Đã hiểu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



