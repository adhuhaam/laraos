import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Search, RefreshCw, Download, Users, Clock, CheckCircle, Eye, Calendar } from 'lucide-react'

interface RetirementRecord {
  id: string
  employeeName: string
  empId: string
  department: string
  designation: string
  retirementDate: string
  serviceYears: number
  pensionAmount: number
  gratuityAmount: number
  status: 'pending' | 'approved' | 'completed'
}

export function EmployeeRetirement() {
  const [retirementRecords] = useState<RetirementRecord[]>([
    {
      id: '1',
      employeeName: 'Abdul Rahman',
      empId: 'EMP011',
      department: 'Administration',
      designation: 'Senior Supervisor',
      retirementDate: '2024-12-31',
      serviceYears: 25,
      pensionAmount: 120000,
      gratuityAmount: 85000,
      status: 'approved'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRecords = useMemo(() => {
    return retirementRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [retirementRecords, searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'approved': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Retirement</h1>
          <p className="text-muted-foreground">
            Manage employee retirements and benefits • {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button>
            <Clock className="h-4 w-4 mr-2" />
            New Retirement
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retirements</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retirementRecords.length}</div>
            <p className="text-xs text-muted-foreground">All retirements</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search retirements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Retirement Date</TableHead>
              <TableHead>Service Years</TableHead>
              <TableHead>Benefits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium">{record.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.empId} • {record.designation}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>{new Date(record.retirementDate).toLocaleDateString()}</TableCell>
                <TableCell>{record.serviceYears} years</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Pension: MVR {record.pensionAmount.toLocaleString()}</div>
                    <div>Gratuity: MVR {record.gratuityAmount.toLocaleString()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}