'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { CreateFoodRequest, UpdateFoodRequest, FoodCategory } from "@/types/schema"

// Hàm tiện ích để hiển thị tên danh mục dễ đọc
const formatCategoryName = (category: string): string => {
  return category.replace(/_/g, ' ')
}

// Schema validation cho form thêm món ăn
const foodFormSchema = z.object({
  name: z.string().min(1, { message: "Tên món ăn không được để trống" }),
  price: z.number().min(0.01, { message: "Giá phải lớn hơn 0" }),
  category: z.nativeEnum(FoodCategory),
  isAvailable: z.boolean().default(true),
})

export default function FoodsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5) // Giảm xuống 5 item mỗi trang

  const {
    foods,
    isLoading,
    error,
    toggleAvailability,
    deleteFood,
    createFood,
    updateFood
  } = useFood()

  // Form cho thêm mới món ăn
  const addForm = useForm<z.infer<typeof foodFormSchema>>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: FoodCategory.MAIN_COURSE,
      isAvailable: true,
    },
  })

  // Form cho chỉnh sửa món ăn
  const editForm = useForm<z.infer<typeof foodFormSchema>>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: FoodCategory.MAIN_COURSE,
      isAvailable: true,
    },
  })

  // Xử lý thêm mới món ăn
  const handleAddFood = async (data: z.infer<typeof foodFormSchema>) => {
    try {
      const foodData: CreateFoodRequest = {
        name: data.name,
        price: data.price,
        category: data.category,
        isAvailable: data.isAvailable
      }
      await createFood(foodData)
      setIsAddDialogOpen(false)
      addForm.reset()
    } catch (error) {
      console.error('Lỗi khi thêm món ăn:', error)
    }
  }

  // Xử lý chỉnh sửa món ăn
  const handleEditFood = async (data: z.infer<typeof foodFormSchema>) => {
    if (!editingItem) return

    try {
      const foodData: UpdateFoodRequest = {
        name: data.name,
        price: data.price,
        category: data.category,
        isAvailable: data.isAvailable
      }
      await updateFood(editingItem.id, foodData)
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
      await deleteFood(id)
    } catch (error) {
      console.error('Lỗi khi xóa món ăn:', error)
    }
  }

  // Lọc món ăn theo từ khóa tìm kiếm và danh mục
  const filteredFoods = foods.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.price.toString().includes(searchTerm)
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredFoods.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage)

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
              Add Food
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => {
                            if (e.target.value === '0') {
                              e.target.value = ''
                            }
                          }}
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
                  <Button
                    type="submit"
                    disabled={!addForm.formState.isValid || addForm.formState.isSubmitting}
                  >
                    {addForm.formState.isSubmitting ? 'Đang thêm...' : 'Thêm món ăn'}
                  </Button>
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
            placeholder="Search foods..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {Object.values(FoodCategory).map((category) => (
              <SelectItem key={category} value={category}>
                {formatCategoryName(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            ) : filteredFoods.length > 0 ? (
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
                                              field.onChange(parseFloat(e.target.value) || 0)
                                            }
                                            onFocus={(e) => {
                                              if (e.target.value === '0') {
                                                e.target.value = ''
                                              }
                                            }}
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
                                    <Button
                                      type="submit"
                                      disabled={!editForm.formState.isValid || editForm.formState.isSubmitting}
                                    >
                                      {editForm.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </Button>
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
                  No foods found.
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
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFoods.length)} of{' '}
            {filteredFoods.length} items
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
              {(() => {
                // Logic để hiển thị tối đa 10 trang
                const maxVisiblePages = 5; // Số trang hiển thị ở mỗi bên của trang hiện tại
                const pages = [];

                // Luôn hiển thị trang đầu tiên
                if (currentPage > 1 + maxVisiblePages) {
                  pages.push(
                    <Button
                      key={1}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </Button>
                  );

                  // Thêm dấu ... nếu cần
                  if (currentPage > 2 + maxVisiblePages) {
                    pages.push(
                      <Button
                        key="ellipsis-start"
                        variant="outline"
                        size="sm"
                        disabled
                      >
                        ...
                      </Button>
                    );
                  }
                }

                // Tính toán phạm vi trang hiển thị
                const startPage = Math.max(1, currentPage - maxVisiblePages);
                const endPage = Math.min(totalPages, currentPage + maxVisiblePages);

                // Thêm các trang trong phạm vi
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                    >
                      {i}
                    </Button>
                  );
                }

                // Luôn hiển thị trang cuối cùng
                if (currentPage < totalPages - maxVisiblePages) {
                  // Thêm dấu ... nếu cần
                  if (currentPage < totalPages - 1 - maxVisiblePages) {
                    pages.push(
                      <Button
                        key="ellipsis-end"
                        variant="outline"
                        size="sm"
                        disabled
                      >
                        ...
                      </Button>
                    );
                  }

                  pages.push(
                    <Button
                      key={totalPages}
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pages;
              })()}
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
