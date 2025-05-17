'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash } from 'lucide-react'
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

  // Gọi API khi component mount
  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  // Filter tables based on search term
  const filteredTables = tables.filter(
    (table) =>
      table.number.toString().includes(searchTerm) ||
      table.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

    try {
      await createTable({
        number: parseInt(addFormData.number),
        status: TableStatus.AVAILABLE, // Default status
      })

      setIsAddDialogOpen(false)
      setAddFormData({
        number: '',
      })
    } catch (error) {
      console.error('Lỗi khi tạo bàn:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateTable(editFormData.id, {
        number: parseInt(editFormData.number),
        status: editFormData.status as TableStatus,
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Lỗi khi cập nhật bàn:', error)
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

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tables..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTables.map((table) => (
          <div key={table.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold">Table {table.number}</h3>
              <div className="mt-2">{getStatusBadge(table.status)}</div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(table)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(table.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog để thêm bàn mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
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
