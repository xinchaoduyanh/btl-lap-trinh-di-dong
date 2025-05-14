"use client"

import { useState, useEffect, useCallback } from "react"
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from "@/types/schema"

// Mock data for development
const mockMenuItems: MenuItem[] = [
  { id: "1", name: "Beef Hotpot", price: 19.99, isAvailable: true },
  { id: "2", name: "Seafood Hotpot", price: 22.99, isAvailable: true },
  { id: "3", name: "Vegetable Hotpot", price: 15.99, isAvailable: true },
  { id: "4", name: "Spicy Sichuan Hotpot", price: 21.99, isAvailable: false },
  { id: "5", name: "Kimchi Hotpot", price: 18.99, isAvailable: true },
  { id: "6", name: "Tom Yum Hotpot", price: 20.99, isAvailable: true },
  { id: "7", name: "Japanese Shabu Shabu", price: 23.99, isAvailable: false },
  { id: "8", name: "Mongolian Hotpot", price: 19.99, isAvailable: true },
  { id: "9", name: "Miso Soup Base", price: 5.99, isAvailable: true },
  { id: "10", name: "Premium Beef Platter", price: 24.99, isAvailable: true },
]

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all menu items
  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/menu-items')
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setMenuItems(mockMenuItems)
    } catch (err) {
      setError("Failed to fetch menu items")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single menu item by ID
  const getMenuItem = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/menu-items/${id}`)
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const item = mockMenuItems.find((item) => item.id === id)
      if (!item) throw new Error("Menu item not found")
      return item
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new menu item
  const createMenuItem = useCallback(async (itemData: CreateMenuItemRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/menu-items', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(itemData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const newItem: MenuItem = {
        ...itemData,
        id: Date.now().toString(),
        isAvailable: itemData.isAvailable ?? true,
      }
      setMenuItems((prev) => [...prev, newItem])
      return newItem
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing menu item
  const updateMenuItem = useCallback(async (id: string, itemData: UpdateMenuItemRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/menu-items/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(itemData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item)))
      return { id, ...itemData }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a menu item
  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/menu-items/${id}`, { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setMenuItems((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Toggle menu item availability
  const toggleAvailability = useCallback(
    async (id: string, isAvailable: boolean) => {
      try {
        return await updateMenuItem(id, { isAvailable })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [updateMenuItem],
  )

  // Load menu items on initial mount
  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  return {
    menuItems,
    isLoading,
    error,
    fetchMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
  }
}
