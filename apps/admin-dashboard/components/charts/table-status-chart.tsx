"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface TableStatusChartProps {
  data: { status: string; count: number }[]
}

export function TableStatusChart({ data }: TableStatusChartProps) {
  // Colors for different statuses
  const COLORS = {
    AVAILABLE: "#10b981", // green
    OCCUPIED: "#ef4444", // red
    RESERVED: "#f59e0b", // amber
  }

  // Format status labels
  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table Status</CardTitle>
        <CardDescription>Current table occupancy status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                dataKey="count"
                nameKey="status"
                label={({ name, percent }) => `${formatStatus(name)} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || "#9ca3af"} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, formatStatus(name as string)]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
