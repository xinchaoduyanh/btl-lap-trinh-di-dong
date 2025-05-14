import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Role } from "@/types/schema"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    // Clear existing data
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.checkouts.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.table.deleteMany()
    await prisma.shift.deleteMany()

    // Create employees
    const hashedPassword = await bcrypt.hash("password123", 10)

    const admin = await prisma.employee.create({
      data: {
        name: "Admin User",
        email: "admin@ithotpot.com",
        password: hashedPassword,
        role: Role.ADMIN,
      },
    })

    const manager = await prisma.employee.create({
      data: {
        name: "Manager User",
        email: "manager@ithotpot.com",
        password: hashedPassword,
        role: Role.MANAGER,
      },
    })

    const cashier = await prisma.employee.create({
      data: {
        name: "Cashier User",
        email: "cashier@ithotpot.com",
        password: hashedPassword,
        role: Role.CASHIER,
      },
    })

    const waiter = await prisma.employee.create({
      data: {
        name: "Waiter User",
        email: "waiter@ithotpot.com",
        password: hashedPassword,
        role: Role.WAITER,
      },
    })

    // Create tables
    const tables = await Promise.all(
      Array.from({ length: 10 }, (_, i) => i + 1).map((number) =>
        prisma.table.create({
          data: {
            number,
            status: number % 3 === 0 ? "OCCUPIED" : number % 3 === 1 ? "RESERVED" : "AVAILABLE",
          },
        }),
      ),
    )

    // Create menu items
    const menuItems = await Promise.all([
      prisma.menuItem.create({
        data: {
          name: "Beef Hotpot",
          price: 19.99,
          isAvailable: true,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: "Seafood Hotpot",
          price: 22.99,
          isAvailable: true,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: "Vegetable Hotpot",
          price: 15.99,
          isAvailable: true,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: "Spicy Sichuan Hotpot",
          price: 21.99,
          isAvailable: false,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: "Kimchi Hotpot",
          price: 18.99,
          isAvailable: true,
        },
      }),
    ])

    // Create shifts
    const morningShift = await prisma.shift.create({
      data: {
        name: "Morning Shift",
        startTime: new Date("2023-05-01T08:00:00.000Z"),
        endTime: new Date("2023-05-01T16:00:00.000Z"),
      },
    })

    const eveningShift = await prisma.shift.create({
      data: {
        name: "Evening Shift",
        startTime: new Date("2023-05-01T16:00:00.000Z"),
        endTime: new Date("2023-05-02T00:00:00.000Z"),
      },
    })

    // Create attendance records
    await prisma.attendance.create({
      data: {
        employeeId: waiter.id,
        shiftId: morningShift.id,
        checkIn: new Date("2023-05-01T08:00:00.000Z"),
        checkOut: new Date("2023-05-01T16:00:00.000Z"),
      },
    })

    await prisma.attendance.create({
      data: {
        employeeId: cashier.id,
        shiftId: eveningShift.id,
        checkIn: new Date("2023-05-01T16:00:00.000Z"),
        checkOut: new Date("2023-05-02T00:00:00.000Z"),
      },
    })

    // Create orders
    const order1 = await prisma.order.create({
      data: {
        tableId: tables[2].id,
        employeeId: waiter.id,
        status: "PENDING",
        totalAmount: 42.98,
        orderItems: {
          create: [
            {
              menuItemId: menuItems[0].id,
              quantity: 1,
              unitPrice: 19.99,
            },
            {
              menuItemId: menuItems[2].id,
              quantity: 1,
              unitPrice: 15.99,
            },
            {
              menuItemId: menuItems[4].id,
              quantity: 1,
              unitPrice: 7.0,
            },
          ],
        },
      },
    })

    const order2 = await prisma.order.create({
      data: {
        tableId: tables[4].id,
        employeeId: waiter.id,
        status: "COMPLETED",
        totalAmount: 22.99,
        orderItems: {
          create: [
            {
              menuItemId: menuItems[1].id,
              quantity: 1,
              unitPrice: 22.99,
            },
          ],
        },
      },
    })

    // Create notifications
    await prisma.notification.create({
      data: {
        message: "New order placed at Table 3",
        employeeId: admin.id,
        isRead: false,
      },
    })

    await prisma.notification.create({
      data: {
        message: "Table 5 order is ready for service",
        employeeId: waiter.id,
        isRead: true,
      },
    })

    // Create checkouts
    await prisma.checkouts.create({
      data: {
        employeeId: waiter.id,
        checkIn: new Date("2023-05-01T08:00:00.000Z"),
        checkOut: new Date("2023-05-01T16:00:00.000Z"),
        status: "CHECKED_OUT",
      },
    })

    await prisma.checkouts.create({
      data: {
        employeeId: cashier.id,
        checkIn: new Date("2023-05-01T16:00:00.000Z"),
        status: "CHECKED_IN",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        employees: await prisma.employee.count(),
        tables: await prisma.table.count(),
        menuItems: await prisma.menuItem.count(),
        shifts: await prisma.shift.count(),
        orders: await prisma.order.count(),
        orderItems: await prisma.orderItem.count(),
        attendances: await prisma.attendance.count(),
        notifications: await prisma.notification.count(),
        checkouts: await prisma.checkouts.count(),
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}
