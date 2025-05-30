"use client"

import { useState, useEffect } from "react"
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Coffee, ClipboardList } from "lucide-react"
import { useEmployees } from "@/hooks/use-employees"
import { useTables } from "@/hooks/use-tables"
import { useOrders } from "@/hooks/use-orders"
import { Skeleton } from "@/components/ui/skeleton"


export default function DashboardPage() {
  const { employees, isLoading: isLoadingEmployees } = useEmployees()
  const { tables, isLoading: isLoadingTables } = useTables()
  const { orders, isLoading: isLoadingOrders } = useOrders()

  const [stats, setStats] = useState({
    activeOrders: 0,
    activeEmployees: 0,
    availableTables: 0,
  })

  useEffect(() => {
    if (!isLoadingEmployees && !isLoadingTables && !isLoadingOrders) {
      // Calculate stats
      const activeOrdersCount = orders.filter((order) => order.status !== "PAID").length
      const activeEmployeesCount = employees.filter((emp) => emp.isActive).length
      const availableTablesCount = tables.filter((table) => table.status === "AVAILABLE").length

      setStats({
        activeOrders: activeOrdersCount,
        activeEmployees: activeEmployeesCount,
        availableTables: availableTablesCount,
      })
    }
  }, [employees, tables, orders, isLoadingEmployees, isLoadingTables, isLoadingOrders])

  const isLoading = isLoadingEmployees || isLoadingTables || isLoadingOrders

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your restaurant management dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
            <Coffee className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.availableTables}</div>
                <p className="text-xs text-muted-foreground">Out of {tables.length} total</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
