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
      status: "RESERVED"
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
  const [isTableReservedAlertOpen, setIsTableReservedAlertOpen] = useState(false)


  // Function to show update alert
  const showUpdateAlert = (message: string) => {
    setUpdateMessage(message)
    setIsUpdateAlertOpen(true)
  }

  // Function to check if table is already reserved
  const isTableAlreadyReserved = (tableId: string) => {
    return orders.some(order =>
      order.tableId === tableId &&
      order.status === "RESERVED"
    )
  }


  const handleCreateOrder = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Kiểm tra xem bàn đã có đơn hàng trong trạng thái RESERVED chưa
      if (data.status === "RESERVED" && isTableAlreadyReserved(data.tableId)) {
        setIsTableReservedAlertOpen(true)
        return
      }

      // Chuyển đổi status từ UI sang giá trị hợp lệ trong backend
      // Trong Prisma schema, OrderStatus chỉ có RESERVED và PAID
      const mappedData = {
        ...data,
        // Đảm bảo status chỉ có thể là "PAID" hoặc "RESERVED"
        status: data.status === "PAID" ? "PAID" : "RESERVED"
      };

      console.log("Sending order data:", mappedData);
      await createOrder(mappedData);

      // Refresh orders list after successful creation
      await fetchOrders();

      setIsNewDialogOpen(false);
      newForm.reset();
      toast({
        title: "Order created",
        description: "The order has been successfully created."
      });
    } catch (err) {
      console.error("Error creating order:", err);

      // Check if error is about duplicate order ID
      const errorMessage = (err as Error).message;
      if (errorMessage.includes("duplicate") || errorMessage.includes("already exists") || errorMessage.includes("Unique constraint")) {
        // Set error message and open duplicate order alert dialog
        setDuplicateOrderError(errorMessage);
        setIsDuplicateOrderAlertOpen(true);
      } else {
        // Show more detailed error message
        let detailedError = errorMessage;
        if (errorMessage.includes("500")) {
          detailedError = "Lỗi server: Kiểm tra xem tableId và employeeId có tồn tại không";
        }

        toast({
          title: "Error creating order",
          description: detailedError,
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
        timeOut: data.timeOut === "" ? null : data.timeOut,
        // Đảm bảo status chỉ có thể là "PAID" hoặc "RESERVED"
        status: data.status === "PAID" ? "PAID" : "RESERVED"
      }

      console.log('Mapped update data:', cleanData)
      await updateOrder(id, cleanData)

      // Close the dialog
      setIsEditDialogOpen(false)

      // Show success alert
      showUpdateAlert("The order has been successfully updated.")

      // Refresh orders list
      fetchOrders()
    } catch (err) {
      console.error('Error in handleUpdateOrder:', err)

      // Show more detailed error message
      let errorMessage = (err as Error).message;
      if (errorMessage.includes("500")) {
        errorMessage = "Lỗi server: Kiểm tra xem tableId và employeeId có tồn tại không";
      }

      showUpdateAlert(`Error updating order: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleDeleteConfirm = (id: string) => {
    try {
      // Find order by ID
      const orderToCheck = orders.find(order => order.id === id)

      // Check if order has RESERVED status (equivalent to PENDING in UI)
      // In Prisma schema, OrderStatus chỉ có RESERVED và PAID
      // Sử dụng so sánh string để tránh lỗi kiểu dữ liệu
      if (orderToCheck && String(orderToCheck.status) === "RESERVED") {
        // Show cannot delete dialog
        setIsPendingDeleteAlertOpen(true)
        return
      }

      // If not RESERVED, continue with normal delete process
      setOrderToDelete(id)
      setIsDeleteDialogOpen(true)
    } catch (err) {
      console.error("Error in handleDeleteConfirm:", err)
      toast({
        title: "Error",
        description: "Error preparing to delete order. Please try again.",
        variant: "destructive"
      })
    }
  }


  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      await deleteOrder(orderToDelete)
      // Refresh orders list after successful deletion
      await fetchOrders()
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted."
      })
    } catch (err) {
      console.error("Error deleting order:", err)

      // Process error details
      let errorMessage = (err as Error).message

      // Check if error is related to timeOut or server 500
      if (errorMessage.includes("500") || errorMessage.includes("timeOut")) {
        errorMessage = "Cannot delete order. Please check timeOut information or contact administrator."

        // Still need to update order list to ensure UI is in sync with server
        try {
          await fetchOrders()
        } catch (fetchErr) {
          console.error("Error refreshing orders after delete error:", fetchErr)
        }
      }

      toast({
        title: "Error deleting order",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      // Always close dialog and clear orderToDelete regardless of errors
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
        status: "RESERVED"
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
      (order.table?.number?.toString() || '').includes(searchTerm) ||
      (order.employee?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESERVED":
        return <Badge className="badge-warning">Reserved</Badge>
      case "PAID":
        return <Badge className="badge-success">Paid</Badge>
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
              <SelectItem value="RESERVED">Reserved</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table Number</TableHead>
              <TableHead>Employee Email</TableHead>
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
                  <TableCell>{order.table?.number || 'N/A'}</TableCell>
                  <TableCell>{order.employee?.email || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.timeOut ? formatDate(order.timeOut) : 'N/A'}</TableCell>
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
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
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
                      <p className="text-sm font-medium text-muted-foreground">Table Number</p>
                      <p>{selectedOrder.table?.number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employee Email</p>
                      <p>{selectedOrder.employee?.email || 'N/A'}</p>
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
                          <SelectItem value="RESERVED">Reserved</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                        </SelectContent>
                      </Select>
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
              <AlertCircle className="h-5 w-5" /> Cannot Delete Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cannot delete order with <span className="font-bold text-primary">Reserved</span> status.
              <br /><br />
              Please change the order status before attempting to delete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary flex items-center gap-2">
              <Check className="h-4 w-4" /> Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



