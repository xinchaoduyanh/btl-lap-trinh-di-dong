"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react"

// Mock data for shifts
const mockShifts = [
  {
    id: "1",
    name: "Morning Shift",
    startTime: "2023-05-01T08:00:00.000Z",
    endTime: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "2",
    name: "Evening Shift",
    startTime: "2023-05-01T16:00:00.000Z",
    endTime: "2023-05-02T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Night Shift",
    startTime: "2023-05-01T00:00:00.000Z",
    endTime: "2023-05-01T08:00:00.000Z",
  },
  {
    id: "4",
    name: "Weekend Morning",
    startTime: "2023-05-06T09:00:00.000Z",
    endTime: "2023-05-06T17:00:00.000Z",
  },
  {
    id: "5",
    name: "Weekend Evening",
    startTime: "2023-05-06T17:00:00.000Z",
    endTime: "2023-05-07T01:00:00.000Z",
  },
]

export default function ShiftsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter shifts based on search term
  const filteredShifts = mockShifts.filter((shift) => shift.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
          <p className="text-muted-foreground">Manage your restaurant shifts</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shifts/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shifts..."
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
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.length > 0 ? (
              filteredShifts.map((shift) => {
                const start = new Date(shift.startTime)
                const end = new Date(shift.endTime)
                const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

                return (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">{shift.name}</TableCell>
                    <TableCell>{formatTime(shift.startTime)}</TableCell>
                    <TableCell>{formatTime(shift.endTime)}</TableCell>
                    <TableCell>{durationHours} hours</TableCell>
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
                            <Link href={`/dashboard/shifts/${shift.id}/edit`}>
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
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No shifts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
