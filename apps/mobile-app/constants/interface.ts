// User & Employee
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Employee extends UserData {
  // Có thể mở rộng thêm nếu cần
}

// TableStatus enum
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

// Table
export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  orders?: Order[];
}

// Role enum
export type Role = 'WAITER' | 'CASHIER' | 'MANAGER' | 'ADMIN';

// FoodCategory enum
export type FoodCategory =
  | 'MAIN_COURSE'
  | 'APPETIZER'
  | 'DESSERT'
  | 'BEVERAGE'
  | 'SOUP'
  | 'SALAD'
  | 'SIDE_DISH';

// Food
export interface Food {
  id: string;
  name: string;
  price: number;
  category: FoodCategory;
  isAvailable: boolean;
  imageUrl: string;
  image?: string;
  orderItems?: OrderItem[];
}

// OrderItemStatus enum
export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETE';

// OrderItem
export interface OrderItem {
  id: string;
  orderId: string;
  foodId: string;
  quantity: number;
  status: OrderItemStatus;
  food?: Food;
}

// Order
export interface Order {
  id: string;
  tableId: string;
  employeeId: string;
  status: string;
  createdAt: string;
  timeOut?: string;
  employee?: Employee;
  table?: Table;
  orderItems?: OrderItem[] ;
}

// Notification
export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  employeeId: string;
  createdAt: string;
  employee?: Employee;
}

// Shift
export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

// Attendance
export interface Attendance {
  id: string;
  employeeId: string;
  shiftId: string;
  checkIn: string;
  checkOut?: string;
  createdAt: string;
  employee?: Employee;
  shift?: Shift;
}

// CheckoutSession & Status giữ nguyên
export interface CheckoutSession {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut: string | null;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  createdAt: string;
  updatedAt: string;
  employee: Employee;
}

export interface CheckoutStatus {
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  session: {
    checkIn: string;
  };
  total_time: string;
}

export interface CheckoutError {
  message: string;
  error: string;
  statusCode: number;
}

export interface CreateOrderRequest {
  tableId: string;
  employeeId: string;
  status: "RESERVED" | "PAID";
}
