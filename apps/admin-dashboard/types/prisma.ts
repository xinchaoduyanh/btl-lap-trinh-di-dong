export type Role = 'WAITER' | 'CASHIER' | 'MANAGER' | 'ADMIN';

export interface Employee {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface Shift {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  shiftId: string;
  checkIn: Date;
  checkOut?: Date;
  createdAt: Date;
  employee?: Employee;
  shift?: Shift;
}

export interface Table {
  id: string;
  number: number;
  status: string;
}

export interface Food {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  tableId: string;
  employeeId: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  employee?: Employee;
  table?: Table;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodId: string;
  quantity: number;
  food?: Food;
  order?: Order;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  employeeId: string;
  createdAt: Date;
  employee?: Employee;
}

export interface Checkout {
  id: string;
  employeeId: string;
  checkIn: Date;
  checkOut?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  employee?: Employee;
}
