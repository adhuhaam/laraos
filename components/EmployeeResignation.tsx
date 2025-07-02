import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Search, 
  RefreshCw,
  Download,
  Users,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Eye,
  UserMinus,
  CheckCircle,
  Clock,
  Calendar,
  Building2
} from 'lucide-react'

interface ResignationRecord {
  id: string
  employeeName: string
  empId: string
  department: string
  designation: string
  resignationDate: string
  lastWorkingDay: string
  noticePeriod: number
  reason: string
  status: 'pending' | 'approved' | 'completed'
  exitInterviewDone: boolean
  clearanceCompleted: boolean
}

export function EmployeeResignation() {
  const [resignationRecords] = useState<ResignationRecord[]>([
    {
      id: '1',
      employeeName: 'Sarah Johnson',
      empId: 'EMP007',
      department: 'Administration',
      designation: 'Administrative Assistant',
      resignationDate: '2024-12-01',
      lastWorkingDay: '2024-12-31',
      noticePeriod: 30,
      reason: 'Career advancement opportunity',
      status: 'approved',
      exitInterviewDone: true,
      clearanceCompleted: false
    },
    {
      id: '2',
      employeeName: 'David Kumar',
      empId: 'EMP008',
      department: 'Electrical',
      designation: 'Electrician',
      resignationDate: '2024-11-15',
      lastWorkingDay: '2024-12-15',
      noticePeriod: 30,
      reason: 'Relocation to home country',
      status: 'completed',
      exitInterviewDone: true,
      clearanceCompleted: true
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRecords = useMemo(() => {
    return resignationRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.empId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [resignationRecords, searchQuery, statusFilter])

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
          <h1 className="text-2xl font-bold tracking-tight">Employee Resignation</h1>
          <p className="text-muted-foreground">
            Track and manage employee resignations • {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resignations</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resignationRecords.length}</div>
            <p className="text-xs text-muted-foreground">All-time resignations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {resignationRecords.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resignationRecords.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Processing exit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resignationRecords.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Fully processed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resignations..."
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
              <TableHead>Resignation Date</TableHead>
              <TableHead>Last Working Day</TableHead>
              <TableHead>Notice Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Exit Process</TableHead>
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
                <TableCell>{new Date(record.resignationDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(record.lastWorkingDay).toLocaleDateString()}</TableCell>
                <TableCell>{record.noticePeriod} days</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      {record.exitInterviewDone ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-gray-400" />
                      )}
                      Interview
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {record.clearanceCompleted ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-gray-400" />
                      )}
                      Clearance
                    </div>
                  </div>
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