"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash, Filter, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"

// Mock data for attendance
const mockAttendance = [
  {
    id: "1",
    employeeName: "John Doe",
    shiftName: "Morning Shift",
    checkIn: "2023-05-01T08:00:00.000Z",
    checkOut: "2023-05-01T16:00:00.000Z",
    createdAt: "2023-05-01T08:00:00.000Z",
  },
  {
    id: "2",
    employeeName: "Jane Smith",
    shiftName: "Evening Shift",
    checkIn: "2023-05-01T16:00:00.000Z",
    checkOut: "2023-05-02T00:00:00.000Z",
    createdAt: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "3",
    employeeName: "Mike Johnson",
    shiftName: "Morning Shift",
    checkIn: "2023-05-02T08:00:00.000Z",
    checkOut: "2023-05-02T16:00:00.000Z",
    createdAt: "2023-05-02T08:00:00.000Z",
  },
  {
    id: "4",
    employeeName: "Sarah Williams",
    shiftName: "Evening Shift",
    checkIn: "2023-05-02T16:00:00.000Z",
    checkOut: "2023-05-03T00:00:00.000Z",
    createdAt: "2023-05-02T16:00:00.000Z",
  },
  {
    id: "5",
    employeeName: "David Brown",
    shiftName: "Morning Shift",
    checkIn: "2023-05-03T08:00:00.000Z",
    checkOut: "2023-05-03T16:00:00.000Z",
    createdAt: "2023-05-03T08:00:00.000Z",
  },
]

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [shiftFilter, setShiftFilter] = useState("ALL")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Filter attendance based on search term, shift filter, and date
  const filteredAttendance = mockAttendance.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.shiftName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesShift = shiftFilter === "ALL" || record.shiftName === shiftFilter

    const matchesDate = !selectedDate || new Date(record.checkIn).toDateString() === selectedDate.toDateString()

    return matchesSearch && matchesShift && matchesDate
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const calculateHours = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return hours.toFixed(2)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Track employee attendance</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/attendance/new">
            <Plus className="mr-2 h-4 w-4" />
            Record Attendance
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search attendance..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Shifts</SelectItem>
              <SelectItem value="Morning Shift">Morning Shift</SelectItem>
              <SelectItem value="Evening Shift">Evening Shift</SelectItem>
              <SelectItem value="Night Shift">Night Shift</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <DatePicker date={selectedDate} setDate={setSelectedDate} placeholder="Filter by date" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{record.shiftName}</TableCell>
                  <TableCell>{formatDate(record.checkIn)}</TableCell>
                  <TableCell>{formatTime(record.checkIn)}</TableCell>
                  <TableCell>{formatTime(record.checkOut)}</TableCell>
                  <TableCell>{calculateHours(record.checkIn, record.checkOut)}</TableCell>
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
                          <Link href={`/dashboard/attendance/${record.id}/edit`}>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
