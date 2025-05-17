'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash } from 'lucide-react'
import { useTables } from '@/hooks/use-tables'

export default function TablesPage() {
  const { tables, isLoading, error, fetchTables } = useTables()
  const [searchTerm, setSearchTerm] = useState('')

  // Gọi API khi component mount
  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  // Filter tables based on search term
  const filteredTables = tables.filter(
    (table) =>
      table.number.toString().includes(searchTerm) ||
      table.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="badge-success">Available</Badge>
      case 'OCCUPIED':
        return <Badge className="badge-destructive">Occupied</Badge>
      case 'RESERVED':
        return <Badge className="badge-warning">Reserved</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
          <p className="text-muted-foreground">Manage your restaurant tables</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tables/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tables..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTables.map((table) => (
          <div key={table.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold">Table {table.number}</h3>
              <div className="mt-2">{getStatusBadge(table.status)}</div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/tables/${table.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
