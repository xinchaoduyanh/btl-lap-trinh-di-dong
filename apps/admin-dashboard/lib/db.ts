import prisma from "./prisma"

// This file provides a convenient way to access the database
// and perform common operations

// Employee operations
export async function getEmployees() {
  return await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function getEmployee(id: string) {
  return await prisma.employee.findUnique({
    where: { id },
    include: {
      attendances: true,
      orders: true,
      checkouts: true,
    },
  })
}

export async function createEmployee(data: {
  email: string
  password: string
  name: string
  role: string
  isActive?: boolean
}) {
  return await prisma.employee.create({
    data,
  })
}

export async function updateEmployee(
  id: string,
  data: {
    email?: string
    password?: string
    name?: string
    role?: string
    isActive?: boolean
  },
) {
  return await prisma.employee.update({
    where: { id },
    data,
  })
}

export async function deleteEmployee(id: string) {
  return await prisma.employee.delete({
    where: { id },
  })
}

// Table operations
export async function getTables() {
  return await prisma.table.findMany({
    orderBy: { number: "asc" },
  })
}

export async function getTable(id: string) {
  return await prisma.table.findUnique({
    where: { id },
    include: {
      orders: true,
    },
  })
}

export async function createTable(data: {
  number: number
  status: string
}) {
  return await prisma.table.create({
    data,
  })
}

export async function updateTable(
  id: string,
  data: {
    number?: number
    status?: string
  },
) {
  return await prisma.table.update({
    where: { id },
    data,
  })
}

export async function deleteTable(id: string) {
  return await prisma.table.delete({
    where: { id },
  })
}

// MenuItem operations
export async function getMenuItems() {
  return await prisma.menuItem.findMany({
    orderBy: { name: "asc" },
  })
}

export async function getMenuItem(id: string) {
  return await prisma.menuItem.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  })
}

export async function createMenuItem(data: {
  name: string
  price: number
  isAvailable?: boolean
}) {
  return await prisma.menuItem.create({
    data,
  })
}

export async function updateMenuItem(
  id: string,
  data: {
    name?: string
    price?: number
    isAvailable?: boolean
  },
) {
  return await prisma.menuItem.update({
    where: { id },
    data,
  })
}

export async function deleteMenuItem(id: string) {
  return await prisma.menuItem.delete({
    where: { id },
  })
}

// Order operations
export async function getOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
      table: {
        select: {
          number: true,
        },
      },
    },
  })
}

export async function getOrder(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      employee: true,
      table: true,
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
  })
}

export async function createOrder(data: {
  tableId: string
  employeeId: string
  status: string
  totalAmount: number
  orderItems?: {
    menuItemId: string
    quantity: number
    unitPrice: number
  }[]
}) {
  const { orderItems, ...orderData } = data

  return await prisma.order.create({
    data: {
      ...orderData,
      orderItems: orderItems
        ? {
            create: orderItems,
          }
        : undefined,
    },
    include: {
      orderItems: true,
    },
  })
}

export async function updateOrder(
  id: string,
  data: {
    tableId?: string
    employeeId?: string
    status?: string
    totalAmount?: number
  },
) {
  return await prisma.order.update({
    where: { id },
    data,
  })
}

export async function deleteOrder(id: string) {
  // First delete all order items
  await prisma.orderItem.deleteMany({
    where: { orderId: id },
  })

  // Then delete the order
  return await prisma.order.delete({
    where: { id },
  })
}

// OrderItem operations
export async function createOrderItem(data: {
  orderId: string
  menuItemId: string
  quantity: number
  unitPrice: number
}) {
  return await prisma.orderItem.create({
    data,
  })
}

export async function updateOrderItem(
  id: string,
  data: {
    quantity?: number
    unitPrice?: number
  },
) {
  return await prisma.orderItem.update({
    where: { id },
    data,
  })
}

export async function deleteOrderItem(id: string) {
  return await prisma.orderItem.delete({
    where: { id },
  })
}

// Shift operations
export async function getShifts() {
  return await prisma.shift.findMany({
    orderBy: { startTime: "asc" },
  })
}

export async function getShift(id: string) {
  return await prisma.shift.findUnique({
    where: { id },
    include: {
      attendances: true,
    },
  })
}

export async function createShift(data: {
  name: string
  startTime: Date
  endTime: Date
}) {
  return await prisma.shift.create({
    data,
  })
}

export async function updateShift(
  id: string,
  data: {
    name?: string
    startTime?: Date
    endTime?: Date
  },
) {
  return await prisma.shift.update({
    where: { id },
    data,
  })
}

export async function deleteShift(id: string) {
  return await prisma.shift.delete({
    where: { id },
  })
}

// Attendance operations
export async function getAttendances() {
  return await prisma.attendance.findMany({
    orderBy: { checkIn: "desc" },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
      shift: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function getAttendance(id: string) {
  return await prisma.attendance.findUnique({
    where: { id },
    include: {
      employee: true,
      shift: true,
    },
  })
}

export async function createAttendance(data: {
  employeeId: string
  shiftId: string
  checkIn: Date
  checkOut?: Date | null
}) {
  return await prisma.attendance.create({
    data,
  })
}

export async function updateAttendance(
  id: string,
  data: {
    employeeId?: string
    shiftId?: string
    checkIn?: Date
    checkOut?: Date | null
  },
) {
  return await prisma.attendance.update({
    where: { id },
    data,
  })
}

export async function deleteAttendance(id: string) {
  return await prisma.attendance.delete({
    where: { id },
  })
}

// Notification operations
export async function getNotifications() {
  return await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function getNotification(id: string) {
  return await prisma.notification.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  })
}

export async function createNotification(data: {
  message: string
  employeeId: string
  isRead?: boolean
}) {
  return await prisma.notification.create({
    data,
  })
}

export async function updateNotification(
  id: string,
  data: {
    message?: string
    employeeId?: string
    isRead?: boolean
  },
) {
  return await prisma.notification.update({
    where: { id },
    data,
  })
}

export async function deleteNotification(id: string) {
  return await prisma.notification.delete({
    where: { id },
  })
}

export async function markAllNotificationsAsRead() {
  return await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  })
}

// Checkout operations
export async function getCheckouts() {
  return await prisma.checkouts.findMany({
    orderBy: { checkIn: "desc" },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function getCheckout(id: string) {
  return await prisma.checkouts.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  })
}

export async function createCheckout(data: {
  employeeId: string
  checkIn?: Date
  checkOut?: Date | null
  status?: string
}) {
  return await prisma.checkouts.create({
    data,
  })
}

export async function updateCheckout(
  id: string,
  data: {
    employeeId?: string
    checkIn?: Date
    checkOut?: Date | null
    status?: string
  },
) {
  return await prisma.checkouts.update({
    where: { id },
    data,
  })
}

export async function deleteCheckout(id: string) {
  return await prisma.checkouts.delete({
    where: { id },
  })
}

export async function getActiveCheckouts() {
  return await prisma.checkouts.findMany({
    where: { status: "CHECKED_IN" },
    include: {
      employee: true,
    },
  })
}
