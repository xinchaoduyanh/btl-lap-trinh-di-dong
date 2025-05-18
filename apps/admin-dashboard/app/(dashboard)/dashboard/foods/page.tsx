'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Plus, Search, MoreHorizontal, Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFood } from '@/hooks/use-foods'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types/schema'

// Enum FoodCategory từ schema Prisma
enum FoodCategory {
  MAIN_COURSE = 'MAIN_COURSE',
  APPETIZER = 'APPETIZER',
  DESSERT = 'DESSERT',
  BEVERAGE = 'BEVERAGE',
  SOUP = 'SOUP',
  SALAD = 'SALAD',
  SIDE_DISH = 'SIDE_DISH',
}

// Hàm tiện ích để hiển thị tên danh mục dễ đọc
const formatCategoryName = (category: string): string => {
  return category.replace(/_/g, ' ')
}

// Mở rộng interface để thêm trường category
interface CreateFoodRequest extends CreateMenuItemRequest {
  category: FoodCategory
}

interface UpdateFoodRequest extends UpdateMenuItemRequest {
  category?: FoodCategory
}

export default function MenuItemsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5) // Giảm xuống 5 item mỗi trang

  const {
    menuItems,
    isLoading,
    error,
    toggleAvailability,
    deleteMenuItem,
    createMenuItem,
    updateMenuItem,
  } = useFood()

  // Form cho thêm mới món ăn
  const addForm = useForm<CreateFoodRequest>({
    defaultValues: {
      name: '',
      price: 0,
      category: FoodCategory.MAIN_COURSE,
      isAvailable: true,
    },
  })

  // Form cho chỉnh sửa món ăn
  const editForm = useForm<UpdateFoodRequest>({
    defaultValues: {
      name: '',
      price: 0,
      category: FoodCategory.MAIN_COURSE,
      isAvailable: true,
    },
  })

  // Xử lý thêm mới món ăn
  const handleAddFood = async (data: CreateFoodRequest) => {
    try {
      await createMenuItem(data)
      setIsAddDialogOpen(false)
      addForm.reset()
    } catch (error) {
      console.error('Lỗi khi thêm món ăn:', error)
    }
  }

  // Xử lý chỉnh sửa món ăn
  const handleEditFood = async (data: UpdateFoodRequest) => {
    if (!editingItem) return

    try {
      await updateMenuItem(editingItem.id, data)
      setIsEditDialogOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Lỗi khi cập nhật món ăn:', error)
    }
  }

  // Mở dialog chỉnh sửa và điền thông tin món ăn
  const openEditDialog = (item: any) => {
    setEditingItem(item)
    editForm.reset({
      name: item.name,
      price: item.price,
      category: item.category || FoodCategory.MAIN_COURSE,
      isAvailable: item.isAvailable,
    })
    setIsEditDialogOpen(true)
  }

  // Xử lý thay đổi trạng thái món ăn
  const handleAvailabilityChange = async (id: string, isAvailable: boolean) => {
    try {
      await toggleAvailability(id, isAvailable)
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái món ăn:', error)
    }
  }

  // Xử lý xóa món ăn
  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id)
    } catch (error) {
      console.error('Lỗi khi xóa món ăn:', error)
    }
  }

  // Lọc món ăn theo từ khóa tìm kiếm
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.price.toString().includes(searchTerm)
  )

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMenuItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foods</h1>
          <p className="text-muted-foreground">Manage your restaurant menu</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm món ăn mới</DialogTitle>
              <DialogDescription>Điền thông tin để thêm món ăn mới vào thực đơn.</DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddFood)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên món ăn</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên món ăn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập giá món ăn"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục món ăn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(FoodCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              {formatCategoryName(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Trạng thái</FormLabel>
                        <FormDescription>Món ăn có sẵn sàng để phục vụ không?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Thêm món ăn</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead className="w-[15%]">Price</TableHead>
              <TableHead className="w-[25%]">Availability</TableHead>
              <TableHead className="w-[20%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredMenuItems.length > 0 ? (
              currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium w-[40%]">{item.name}</TableCell>
                  <TableCell className="w-[15%]">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="w-[25%]">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={(checked) => handleAvailabilityChange(item.id, checked)}
                      />
                      <span className="min-w-[80px]">
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-[20%] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog
                          open={isEditDialogOpen && editingItem?.id === item.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setIsEditDialogOpen(false)
                              setEditingItem(null)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                openEditDialog(item)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa món ăn</DialogTitle>
                              <DialogDescription>
                                Chỉnh sửa thông tin món ăn "{item.name}"
                              </DialogDescription>
                            </DialogHeader>
                            {editingItem && (
                              <Form {...editForm}>
                                <form
                                  onSubmit={editForm.handleSubmit(handleEditFood)}
                                  className="space-y-4"
                                >
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Tên món ăn</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Nhập tên món ăn" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="price"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Giá</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder="Nhập giá món ăn"
                                            {...field}
                                            onChange={(e) =>
                                              field.onChange(parseFloat(e.target.value))
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="category"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Danh mục</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Chọn danh mục món ăn" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {Object.values(FoodCategory).map((category) => (
                                              <SelectItem key={category} value={category}>
                                                {formatCategoryName(category)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="isAvailable"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                          <FormLabel>Trạng thái</FormLabel>
                                          <FormDescription>
                                            Món ăn có sẵn sàng để phục vụ không?
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setIsEditDialogOpen(false)
                                        setEditingItem(null)
                                      }}
                                    >
                                      Hủy
                                    </Button>
                                    <Button type="submit">Lưu thay đổi</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa món ăn "{item.name}"? Hành động này không
                                thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No menu items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredMenuItems.length)} of{' '}
            {filteredMenuItems.length} items
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
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
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
    </div>
  )
}
