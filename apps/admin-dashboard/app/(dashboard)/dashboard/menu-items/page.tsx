"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react"

// Mock data for menu items
const mockMenuItems = [
  { id: "1", name: "Burger", price: 9.99, isAvailable: true },
  { id: "2", name: "Pizza", price: 12.99, isAvailable: true },
  { id: "3", name: "Pasta", price: 8.99, isAvailable: true },
  { id: "4", name: "Salad", price: 6.99, isAvailable: false },
  { id: "5", name: "Steak", price: 19.99, isAvailable: true },
  { id: "6", name: "Fish & Chips", price: 14.99, isAvailable: true },
  { id: "7", name: "Sushi", price: 16.99, isAvailable: false },
  { id: "8", name: "Chicken Wings", price: 10.99, isAvailable: true },
  { id: "9", name: "Soup", price: 5.99, isAvailable: true },
  { id: "10", name: "Ice Cream", price: 4.99, isAvailable: true },
]

export default function MenuItemsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [menuItems, setMenuItems] = useState(mockMenuItems)

  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter(
    (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.price.toString().includes(searchTerm),
  )

  const handleAvailabilityChange = (id: string, isAvailable: boolean) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, isAvailable } : item)))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground">Manage your restaurant menu</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/menu-items/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={(checked) => handleAvailabilityChange(item.id, checked)}
                      />
                      <span>{item.isAvailable ? "Available" : "Unavailable"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/menu-items/${item.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No menu items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
