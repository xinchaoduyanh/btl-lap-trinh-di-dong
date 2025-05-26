// Enum types
export enum Role {
  WAITER = "WAITER",
  CASHIER = "CASHIER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum TableStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  RESERVED = "RESERVED",
}

export enum OrderStatus {
  // PENDING = "PENDING",
  // IN_PROGRESS = "IN_PROGRESS",
  // COMPLETED = "COMPLETED",
  // CANCELLED = "CANCELLED",
  RESERVED = "RESERVED",
  PAID = "PAID",
}

export enum CheckoutStatus {
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
}

// Interface types
export interface Employee {
  id: string
  email: string
  password?: string // Optional for security reasons when returning data
  name: string
  role: Role
  isActive: boolean
  createdAt: string // Using string for dates in interfaces for easier serialization
  attendances?: Attendance[]
  notifications?: Notification[]
  orders?: Order[]
  checkouts?: Checkout[]
}

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  attendances?: Attendance[]
}

export interface Attendance {
  id: string
  employeeId: string
  shiftId: string
  checkIn: string
  checkOut: string | null
  createdAt: string
  employee?: Employee
  shift?: Shift
}

export interface Table {
  id: string
  number: number
  status: TableStatus
  orders?: Order[]
}

export interface Food {
  id: string
  name: string
  price: number
  category: FoodCategory
  isAvailable: boolean
  orderItems?: OrderItem[]
  imageUrl?: string
}

export enum FoodCategory {
  MAIN_COURSE = "MAIN_COURSE",
  APPETIZER = "APPETIZER",
  DESSERT = "DESSERT",
  BEVERAGE = "BEVERAGE",
  SOUP = "SOUP",
  SALAD = "SALAD",
  SIDE_DISH = "SIDE_DISH"
}

export interface Order {
  id: string
  tableId: string
  employeeId: string
  status: OrderStatus
  createdAt: string
  timeOut?: string
  table?: Table
  employee?: Employee
  orderItems?: OrderItem[]
  imageUrl?: string
}

export interface OrderItem {
  id: string
  orderId: string
  foodId: string
  quantity: number
  food?: Food
  order?: Order
}

export interface Notification {
  id: string
  message: string
  isRead: boolean
  employeeId: string
  createdAt: string
  employee?: Employee
}

export interface Checkout {
  id: string
  employeeId: string
  checkIn: string
  checkOut: string | null
  status: CheckoutStatus
  createdAt: string
  updatedAt: string
  employee?: Employee
}

// Request and response types for API calls
export interface CreateEmployeeRequest {
  email: string
  password: string
  name: string
  role: Role
  isActive?: boolean
}

export interface UpdateEmployeeRequest {
  email?: string
  password?: string
  name?: string
  role?: Role
  isActive?: boolean
}

export interface CreateShiftRequest {
  name: string
  startTime: string
  endTime: string
}

export interface UpdateShiftRequest {
  name?: string
  startTime?: string
  endTime?: string
}

export interface CreateAttendanceRequest {
  employeeId: string
  shiftId: string
  checkIn: string
  checkOut?: string | null
}

export interface UpdateAttendanceRequest {
  employeeId?: string
  shiftId?: string
  checkIn?: string
  checkOut?: string | null
}

export interface CreateTableRequest {
  number: number
  status: TableStatus
}

export interface UpdateTableRequest {
  number?: number
  status?: TableStatus
}

export interface CreateFoodRequest {
  name: string
  price: number
  category: FoodCategory
  isAvailable?: boolean
  imageUrl?: string
}

export interface UpdateFoodRequest {
  name?: string
  price?: number
  category?: FoodCategory
  isAvailable?: boolean
  imageUrl?: string
}

export interface CreateOrderRequest {
  tableId: string
  employeeId: string
  status: OrderStatus
  totalAmount: number
  orderItems?: CreateOrderItemRequest[]
}

export interface UpdateOrderRequest {
  tableId?: string
  employeeId?: string
  status?: OrderStatus
  totalAmount?: number
}

export interface CreateOrderItemRequest {
  foodId: string
  quantity: number
}

export interface UpdateOrderItemRequest {
  foodId?: string
  quantity?: number
}

export interface CreateNotificationRequest {
  message: string
  employeeId: string
  isRead?: boolean
}

export interface UpdateNotificationRequest {
  message?: string
  employeeId?: string
  isRead?: boolean
}

export interface CreateCheckoutRequest {
  employeeId: string
  checkIn?: string
  checkOut?: string | null
  status?: CheckoutStatus
}

export interface UpdateCheckoutRequest {
  employeeId?: string
  checkIn?: string
  checkOut?: string | null
  status?: CheckoutStatus
}
