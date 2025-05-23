"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Coffee, ClipboardList, TrendingUp, DollarSign, Flame } from "lucide-react"
import { useEmployees } from "@/hooks/use-employees"
import { useTables } from "@/hooks/use-tables"
import { useOrders } from "@/hooks/use-orders"
import { useAnalytics } from "@/hooks/use-analytics"
import { Skeleton } from "@/components/ui/skeleton"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { TopItemsChart } from "@/components/charts/top-items-chart"
import { TableStatusChart } from "@/components/charts/table-status-chart"
import { EmployeePerformanceChart } from "@/components/charts/employee-performance-chart"
import { CategoryRevenueChart } from "@/components/charts/category-revenue-chart"

export default function DashboardPage() {
  const { employees, isLoading: isLoadingEmployees } = useEmployees()
  const { tables, isLoading: isLoadingTables } = useTables()
  const { orders, isLoading: isLoadingOrders } = useOrders()
  const {
    dailySales,
    topSellingItems,
    tableOccupancy,
    employeePerformance,
    revenueByCategory,
    isLoading: isLoadingAnalytics,
  } = useAnalytics()

  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    activeEmployees: 0,
    availableTables: 0,
  })

  useEffect(() => {
    if (!isLoadingEmployees && !isLoadingTables && !isLoadingOrders) {
      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const activeOrdersCount = orders.filter((order) => order.status !== "COMPLETED").length
      const activeEmployeesCount = employees.filter((emp) => emp.isActive).length
      const availableTablesCount = tables.filter((table) => table.status === "AVAILABLE").length

      setStats({
        revenue: totalRevenue,
        activeOrders: activeOrdersCount,
        activeEmployees: activeEmployeesCount,
        availableTables: availableTablesCount,
      })
    }
  }, [employees, tables, orders, isLoadingEmployees, isLoadingTables, isLoadingOrders])

  const isLoading = isLoadingEmployees || isLoadingTables || isLoadingOrders || isLoadingAnalytics

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Flame className="mr-2 h-6 w-6 text-red-600" />
          IThotpot Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome to your restaurant management dashboard.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">+18% from last month</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <ClipboardList className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.activeOrders}</div>
                    <p className="text-xs text-muted-foreground">+2 since last hour</p>
                  </>
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
                  <>
                    <div className="text-2xl font-bold">{stats.activeEmployees}</div>
                    <p className="text-xs text-muted-foreground">+1 since yesterday</p>
                  </>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {isLoading ? (
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <Skeleton className="h-full w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RevenueChart data={dailySales} />
            )}

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders placed</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">Table {order.tableId}</p>
                        </div>
                        <div className="ml-auto font-medium">${order.totalAmount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Table Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <TableStatusChart data={tableOccupancy} />
                <CategoryRevenueChart data={revenueByCategory} />
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <ClipboardList className="h-6 w-6 text-red-600 mb-2" />
                        <span className="text-sm">New Order</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Users className="h-6 w-6 text-red-600 mb-2" />
                        <span className="text-sm">Add Employee</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Coffee className="h-6 w-6 text-red-600 mb-2" />
                        <span className="text-sm">Manage Tables</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <TrendingUp className="h-6 w-6 text-red-600 mb-2" />
                        <span className="text-sm">View Reports</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {isLoading ? (
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Skeleton className="h-full w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RevenueChart data={dailySales} />
            )}

            {isLoading ? (
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Skeleton className="h-full w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <TopItemsChart data={topSellingItems} />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <EmployeePerformanceChart data={employeePerformance} />
                <CategoryRevenueChart data={revenueByCategory} />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Reports content will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
