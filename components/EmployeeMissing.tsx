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
  AlertTriangle,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react'

interface MissingRecord {
  id: string
  employeeName: string
  empId: string
  department: string
  designation: string
  lastSeenDate: string
  lastSeenLocation: string
  reportedDate: string
  reportedBy: string
  contactAttempts: number
  emergencyContactNotified: boolean
  policeReported: boolean
  status: 'reported' | 'investigating' | 'found' | 'closed'
  notes: string
}

export function EmployeeMissing() {
  const [missingRecords] = useState<MissingRecord[]>([
    {
      id: '1',
      employeeName: 'Ibrahim Al-Rashid',
      empId: 'EMP009',
      department: 'Construction',
      designation: 'Construction Worker',
      lastSeenDate: '2024-12-20',
      lastSeenLocation: 'Site A - Construction Area',
      reportedDate: '2024-12-22',
      reportedBy: 'Site Supervisor',
      contactAttempts: 5,
      emergencyContactNotified: true,
      policeReported: false,
      status: 'investigating',
      notes: 'Did not report for work for 2 consecutive days. Phone switched off.'
    },
    {
      id: '2',
      employeeName: 'Ravi Sharma',
      empId: 'EMP010',
      department: 'Electrical',
      designation: 'Electrician',
      lastSeenDate: '2024-11-28',
      lastSeenLocation: 'Accommodation - Room 15B',
      reportedDate: '2024-11-30',
      reportedBy: 'Accommodation Manager',
      contactAttempts: 8,
      emergencyContactNotified: true,
      policeReported: true,
      status: 'found',
      notes: 'Found safe. Had returned to home country due to family emergency without notice.'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRecords = useMemo(() => {
    return missingRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.empId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [missingRecords, searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'investigating': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'found': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'closed': return 'bg-gray-500/10 text-gray-700 border-gray-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Missing Employees</h1>
          <p className="text-muted-foreground">
            Track and manage missing employee cases • {filteredRecords.length} case{filteredRecords.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Missing
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missingRecords.length}</div>
            <p className="text-xs text-muted-foreground">All missing cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {missingRecords.filter(r => r.status === 'investigating').length}
            </div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Found</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {missingRecords.filter(r => r.status === 'found').length}
            </div>
            <p className="text-xs text-muted-foreground">Located safely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Police Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {missingRecords.filter(r => r.policeReported).length}
            </div>
            <p className="text-xs text-muted-foreground">Official reports filed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search missing cases..."
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
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="found">Found</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact Attempts</TableHead>
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
                <TableCell>{new Date(record.lastSeenDate).toLocaleDateString()}</TableCell>
                <TableCell>{record.lastSeenLocation}</TableCell>
                <TableCell>{record.contactAttempts}</TableCell>
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