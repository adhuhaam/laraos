import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Search, RefreshCw, Download, Building, ArrowRightLeft, Eye, CheckCircle, Clock } from 'lucide-react'

interface CompanyChangeRecord {
  id: string
  employeeName: string
  empId: string
  currentDepartment: string
  newDepartment: string
  currentDesignation: string
  newDesignation: string
  transferDate: string
  reason: string
  salaryChange: number
  status: 'pending' | 'approved' | 'completed'
  approvedBy?: string
}

export function EmployeeCompanyChange() {
  const [changeRecords] = useState<CompanyChangeRecord[]>([
    {
      id: '1',
      employeeName: 'Ahmed Hassan',
      empId: 'EMP013',
      currentDepartment: 'Construction',
      newDepartment: 'Electrical',
      currentDesignation: 'Helper',
      newDesignation: 'Electrical Helper',
      transferDate: '2025-01-15',
      reason: 'Skills development and career growth',
      salaryChange: 2000,
      status: 'approved',
      approvedBy: 'HR Manager'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRecords = useMemo(() => {
    return changeRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [changeRecords, searchQuery, statusFilter])

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
          <h1 className="text-2xl font-bold tracking-tight">Company Change</h1>
          <p className="text-muted-foreground">
            Manage internal transfers and department changes • {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changeRecords.length}</div>
            <p className="text-xs text-muted-foreground">All transfers</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transfers..."
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
              <TableHead>From → To</TableHead>
              <TableHead>Transfer Date</TableHead>
              <TableHead>Salary Change</TableHead>
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
                    <div className="text-sm text-muted-foreground">{record.empId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {record.currentDepartment} ({record.currentDesignation})
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowRightLeft className="h-3 w-3" />
                      {record.newDepartment} ({record.newDesignation})
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(record.transferDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={record.salaryChange > 0 ? 'text-green-600' : record.salaryChange < 0 ? 'text-red-600' : ''}>
                    {record.salaryChange > 0 ? '+' : ''}MVR {record.salaryChange.toLocaleString()}
                  </span>
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