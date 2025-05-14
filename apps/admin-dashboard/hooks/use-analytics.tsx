"use client"

import { useState, useEffect, useCallback } from "react"

// Types for analytics data
interface DailySales {
  date: string
  total: number
}

interface TopSellingItem {
  name: string
  quantity: number
  revenue: number
}

interface TableOccupancy {
  status: string
  count: number
}

interface EmployeePerformance {
  name: string
  ordersHandled: number
  revenue: number
}

interface RevenueByCategory {
  category: string
  revenue: number
}

// Mock data for development
const mockDailySales: DailySales[] = [
  { date: "2023-05-01", total: 1250.75 },
  { date: "2023-05-02", total: 1420.5 },
  { date: "2023-05-03", total: 1100.25 },
  { date: "2023-05-04", total: 1350.0 },
  { date: "2023-05-05", total: 1800.5 },
  { date: "2023-05-06", total: 2100.75 },
  { date: "2023-05-07", total: 1950.25 },
]

const mockTopSellingItems: TopSellingItem[] = [
  { name: "Beef Hotpot", quantity: 45, revenue: 899.55 },
  { name: "Seafood Hotpot", quantity: 32, revenue: 735.68 },
  { name: "Spicy Sichuan Hotpot", quantity: 28, revenue: 615.72 },
  { name: "Vegetable Hotpot", quantity: 24, revenue: 383.76 },
  { name: "Kimchi Hotpot", quantity: 20, revenue: 379.8 },
]

const mockTableOccupancy: TableOccupancy[] = [
  { status: "AVAILABLE", count: 4 },
  { status: "OCCUPIED", count: 3 },
  { status: "RESERVED", count: 3 },
]

const mockEmployeePerformance: EmployeePerformance[] = [
  { name: "John Doe", ordersHandled: 28, revenue: 1250.5 },
  { name: "Jane Smith", ordersHandled: 24, revenue: 1100.25 },
  { name: "Mike Johnson", ordersHandled: 22, revenue: 980.75 },
  { name: "Sarah Williams", ordersHandled: 18, revenue: 850.5 },
]

const mockRevenueByCategory: RevenueByCategory[] = [
  { category: "Hotpot", revenue: 2500.75 },
  { category: "Drinks", revenue: 850.5 },
  { category: "Sides", revenue: 650.25 },
  { category: "Desserts", revenue: 450.75 },
]

export function useAnalytics() {
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([])
  const [tableOccupancy, setTableOccupancy] = useState<TableOccupancy[]>([])
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([])
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In production, use the API client
      // const dailySalesData = await analyticsAPI.getDailySales()
      // const topItemsData = await analyticsAPI.getTopSellingItems()
      // const tableOccupancyData = await analyticsAPI.getTableOccupancy()
      // const employeePerformanceData = await analyticsAPI.getEmployeePerformance()
      // const revenueByCategoryData = await analyticsAPI.getRevenueByCategory()

      // setDailySales(dailySalesData)
      // setTopSellingItems(topItemsData)
      // setTableOccupancy(tableOccupancyData)
      // setEmployeePerformance(employeePerformanceData)
      // setRevenueByCategory(revenueByCategoryData)

      // Using mock data for development
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
      setDailySales(mockDailySales)
      setTopSellingItems(mockTopSellingItems)
      setTableOccupancy(mockTableOccupancy)
      setEmployeePerformance(mockEmployeePerformance)
      setRevenueByCategory(mockRevenueByCategory)
    } catch (err) {
      setError("Failed to fetch analytics data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch daily sales for a specific date range
  const fetchDailySales = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      // In production, use the API client
      // return await analyticsAPI.getDailySales(startDate, endDate)

      // Using mock data for development
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      return mockDailySales
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Load analytics data on initial mount
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    dailySales,
    topSellingItems,
    tableOccupancy,
    employeePerformance,
    revenueByCategory,
    isLoading,
    error,
    fetchAnalytics,
    fetchDailySales,
  }
}
