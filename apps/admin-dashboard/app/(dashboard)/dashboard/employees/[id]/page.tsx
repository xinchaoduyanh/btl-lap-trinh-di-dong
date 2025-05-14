"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash, Clock, Calendar } from "lucide-react"

// Mock data for a single employee
const mockEmployee = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "MANAGER",
  isActive: true,
  createdAt: "2023-01-15T00:00:00.000Z",
}

// Mock attendance data
const mockAttendance = [
  {
    id: "1",
    shiftName: "Morning Shift",
    checkIn: "2023-05-01T08:00:00.000Z",
    checkOut: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "2",
    shiftName: "Evening Shift",
    checkIn: "2023-05-02T16:00:00.000Z",
    checkOut: "2023-05-03T00:00:00.000Z",
  },
  {
    id: "3",
    shiftName: "Morning Shift",
    checkIn: "2023-05-03T08:00:00.000Z",
    checkOut: "2023-05-03T16:00:00.000Z",
  },
]

export default function EmployeeDetailsPage() {
  const params = useParams()
  const employeeId = params.id as string
  const [employee, setEmployee] = useState(mockEmployee)
  const [attendance, setAttendance] = useState(mockAttendance)

  // In a real app, you would fetch the employee data based on the ID
  useEffect(() => {
    // Simulate API call
    console.log(`Fetching employee with ID: ${employeeId}`)
    // setEmployee(data)
  }, [employeeId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/employees">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Employee Details</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{employee.name}</CardTitle>
                <CardDescription>{employee.email}</CardDescription>
              </div>
              <Badge variant={employee.isActive ? "default" : "secondary"}>
                {employee.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p>{employee.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Joined</p>
                <p>{formatDate(employee.createdAt)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/employees/${employeeId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </CardFooter>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="attendance">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendance.map((record) => (
                      <div key={record.id} className="flex items-start gap-4 rounded-lg border p-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{record.shiftName}</p>
                          <div className="flex flex-col text-sm text-muted-foreground">
                            <span>Date: {formatDate(record.checkIn)}</span>
                            <span>Check In: {formatTime(record.checkIn)}</span>
                            <span>Check Out: {formatTime(record.checkOut)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center text-center">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">No recent orders</h3>
                      <p className="text-sm text-muted-foreground">This employee has no recent orders.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
