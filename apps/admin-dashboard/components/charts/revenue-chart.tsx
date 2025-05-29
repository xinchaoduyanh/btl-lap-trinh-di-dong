"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: { date: string; total: number }[]
  timeRange: number
  onTimeRangeChange: (days: number) => void
}

export function RevenueChart({ data, timeRange, onTimeRangeChange }: RevenueChartProps) {
  console.log("RevenueChart data prop:", data)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Daily revenue for the selected period</CardDescription>
        </div>
        <Select value={String(timeRange)} onValueChange={v => onTimeRangeChange(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between items-center mb-4 w-full">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Daily</p>
            <p className="text-2xl font-bold">{formatCurrency(averageDailyRevenue)}</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 0,
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
              <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} labelFormatter={formatDate} />
              <Area type="monotone" dataKey="total" stroke="#ef4444" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
