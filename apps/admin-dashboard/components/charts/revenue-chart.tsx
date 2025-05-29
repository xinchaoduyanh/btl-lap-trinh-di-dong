"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: { date: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  console.log("RevenueChart data prop:", data)
  const [timeRange, setTimeRange] = useState("7days")

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate total revenue
  const totalRevenue = data.reduce((sum, item) => sum + item.total, 0)

  // Calculate average daily revenue
  const averageDailyRevenue = totalRevenue / data.length

  // Calculate percentage change from first to last day
  const percentageChange = data.length >= 2 ? ((data[data.length - 1].total - data[0].total) / data[0].total) * 100 : 0

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Daily revenue for the selected period</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Daily</p>
            <p className="text-2xl font-bold">{formatCurrency(averageDailyRevenue)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Growth</p>
            <p className={`text-2xl font-bold ${percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {percentageChange >= 0 ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} labelFormatter={formatDate} />
              <Area type="monotone" dataKey="total" stroke="#ef4444" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
