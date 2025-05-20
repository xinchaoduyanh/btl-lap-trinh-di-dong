'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTables } from '@/hooks/use-tables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TableStatus } from '@/types/schema'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'

function getApiErrorMessage(error: any): string {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  return 'An unexpected error occurred. Please try again later.'
}

export default function TablesPage() {
  const { tables, isLoading, error, fetchTables, createTable, updateTable, deleteTable } =
    useTables()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addFormData, setAddFormData] = useState({
    number: '',
  })
  const [editFormData, setEditFormData] = useState({
    id: '',
    number: '',
    status: 'AVAILABLE',
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [addFormError, setAddFormError] = useState<string | null>(null)
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8) // 8 bàn mỗi trang phù hợp với grid layout

  // Gọi API khi component mount
  useEffect(() => {
    // Thêm cờ để tránh gọi API nhiều lần
    let isMounted = true

    const loadTables = async () => {
      if (isMounted) {
        await fetchTables()
      }
    }

    loadTables()

    // Cleanup function để tránh memory leak và gọi API khi component unmount
    return () => {
      isMounted = false
    }
  }, []) // Loại bỏ fetchTables khỏi dependencies

  // Filter tables based on search term and status filter
  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.number.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTables = filteredTables.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTables.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="badge-success">Available</Badge>
      case 'OCCUPIED':
        return <Badge className="badge-destructive">Occupied</Badge>
      case 'RESERVED':
        return <Badge className="badge-warning">Reserved</Badge>
      case 'CLEANING':
        return <Badge className="badge-info">Cleaning</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setEditFormData((prev) => ({ ...prev, status: value }))
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAddFormError(null)

    try {
      await createTable({
        number: parseInt(addFormData.number),
        status: TableStatus.AVAILABLE, // Default status
      })

      setIsAddDialogOpen(false)
      setAddFormData({
        number: '',
      })
      toast({
        title: 'Thành công',
        description: 'Đã thêm bàn mới thành công',
      })
    } catch (error) {
      // Không log lỗi ra console
      setAddFormError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setEditFormError(null)

    try {
      await updateTable(editFormData.id, {
        number: parseInt(editFormData.number),
        status: editFormData.status as TableStatus,
      })

      setIsEditDialogOpen(false)
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật bàn thành công',
      })
    } catch (error) {
      console.error('Lỗi khi cập nhật bàn:', error)
      setEditFormError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (table: any) => {
    setEditFormData({
      id: table.id,
      number: table.number.toString(),
      status: table.status,
    })
    setIsEditDialogOpen(true)
  }
  const openDeleteDialog = (id: string) => {
    setTableToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteTable = async () => {
    if (!tableToDelete) return

    try {
      await deleteTable(tableToDelete)
      setIsDeleteDialogOpen(false)
      setTableToDelete(null)
    } catch (error) {
      console.error('Lỗi khi xóa bàn:', error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
          <p className="text-muted-foreground">Manage your restaurant tables</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Bàn
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tables base on number..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
              <SelectItem value="CLEANING">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTables.length > 0 ? (
          currentTables.map((table) => (
            <div
              key={table.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold">Table {table.number}</h3>
                <div className="mt-2">{getStatusBadge(table.status)}</div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(table)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(table.id)}
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
              <h3 className="mt-4 text-lg font-semibold">No tables found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                No tables match your search criteria. Try adjusting your filters or add a new table.
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTables.length)} of{' '}
            {filteredTables.length} tables
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value))
              setCurrentPage(1) // Reset to first page when changing items per page
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

      {/* Dialog để thêm bàn mới */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) setAddFormError(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Bàn Mới</DialogTitle>
            <DialogDescription>Nhập số bàn cần thêm</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="number">Số Bàn</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  value={addFormData.number}
                  onChange={handleAddChange}
                  required
                />
              </div>

              {addFormError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {addFormError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setAddFormError(null)
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo Bàn'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog để chỉnh sửa bàn */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Bàn</DialogTitle>
            <DialogDescription>Cập nhật thông tin bàn</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-number">Số Bàn</Label>
                <Input
                  id="edit-number"
                  name="number"
                  type="number"
                  value={editFormData.number}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng Thái</Label>
                <Select value={editFormData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Trống</SelectItem>
                    <SelectItem value="OCCUPIED">Đang Sử Dụng</SelectItem>
                    <SelectItem value="RESERVED">Đã Đặt Trước</SelectItem>
                    <SelectItem value="CLEANING">Đang Dọn Dẹp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa bàn */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bàn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bàn này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTableToDelete(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTable}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
