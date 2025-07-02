import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  Search, 
  RefreshCw,
  Download,
  Users,
  Loader2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Eye,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  UserMinus,
  CalendarDays,
  DollarSign,
  AlertCircle,
  Trash2,
  Plus,
  Calendar,
  Building2
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface TerminationRecord {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  department: string
  designation: string
  terminationDate: string
  terminationType: 'misconduct' | 'performance' | 'absenteeism' | 'policy-violation' | 'redundancy' | 'other'
  reason: string
  noticeGiven: boolean
  noticePeriod?: number
  finalPayment: number
  benefitsPaid: boolean
  terminatedBy: string
  documents: string[]
  status: 'pending' | 'processed' | 'completed'
  appealPeriod: boolean
  createdAt: string
  updatedAt: string
}

interface ActiveEmployee {
  id: string
  empId: string
  name: string
  department: string
  designation: string
  joinDate: string
  salary: number
  avatar?: string
  employmentStatus: 'active' | 'probation'
}

type SortField = 'employeeName' | 'terminationDate' | 'department' | 'terminationType' | 'status'
type SortDirection = 'asc' | 'desc'

export function EmployeeTermination() {
  // Empty data - no dummy data
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([])
  const [terminationRecords, setTerminationRecords] = useState<TerminationRecord[]>([])

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('terminationDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [selectedRecord, setSelectedRecord] = useState<TerminationRecord | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<ActiveEmployee | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showTerminationDialog, setShowTerminationDialog] = useState(false)

  // Termination form state
  const [terminationForm, setTerminationForm] = useState({
    terminationType: 'misconduct' as TerminationRecord['terminationType'],
    terminationDate: '',
    reason: '',
    noticeGiven: true,
    noticePeriod: 30,
    finalPayment: '',
    benefitsPaid: false,
    documents: [] as File[]
  })

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTerminations = terminationRecords.length
    const thisMonthTerminations = terminationRecords.filter(
      r => new Date(r.terminationDate).getMonth() === new Date().getMonth()
    ).length
    const pendingTerminations = terminationRecords.filter(r => r.status === 'pending').length
    const completedTerminations = terminationRecords.filter(r => r.status === 'completed').length
    
    // Termination types breakdown
    const typeBreakdown = terminationRecords.reduce((acc, record) => {
      acc[record.terminationType] = (acc[record.terminationType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalTerminations,
      thisMonthTerminations,
      pendingTerminations,
      completedTerminations,
      typeBreakdown
    }
  }, [terminationRecords])

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(terminationRecords.map(r => r.department))]
    return departments.sort()
  }, [terminationRecords])

  // Filtering and sorting logic
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = terminationRecords.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.reason.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesType = typeFilter === 'all' || record.terminationType === typeFilter
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesType
    })

    // Sort records
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'terminationDate') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [terminationRecords, searchQuery, departmentFilter, statusFilter, typeFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  const getStatusColor = (status: TerminationRecord['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'processed': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getTypeColor = (type: TerminationRecord['terminationType']) => {
    switch (type) {
      case 'misconduct': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'performance': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'absenteeism': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'policy-violation': return 'bg-pink-500/10 text-pink-700 border-pink-200'
      case 'redundancy': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return `MVR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleTermination = useCallback(async () => {
    if (!selectedEmployee || !terminationForm.terminationDate || !terminationForm.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newTermination: TerminationRecord = {
        id: Date.now().toString(),
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        empId: selectedEmployee.empId,
        department: selectedEmployee.department,
        designation: selectedEmployee.designation,
        terminationDate: terminationForm.terminationDate,
        terminationType: terminationForm.terminationType,
        reason: terminationForm.reason,
        noticeGiven: terminationForm.noticeGiven,
        noticePeriod: terminationForm.noticeGiven ? terminationForm.noticePeriod : undefined,
        finalPayment: parseFloat(terminationForm.finalPayment) || 0,
        benefitsPaid: terminationForm.benefitsPaid,
        terminatedBy: 'Current User',
        documents: terminationForm.documents.map(doc => doc.name),
        status: 'pending',
        appealPeriod: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      setTerminationRecords(prev => [newTermination, ...prev])
      
      // Remove from active employees
      setActiveEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id))

      setShowTerminationDialog(false)
      setTerminationForm({
        terminationType: 'misconduct',
        terminationDate: '',
        reason: '',
        noticeGiven: true,
        noticePeriod: 30,
        finalPayment: '',
        benefitsPaid: false,
        documents: []
      })
      
      toast.success(`Termination process initiated for ${selectedEmployee.name}`)

    } catch (error) {
      toast.error('Failed to process termination. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmployee, terminationForm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Termination</h1>
          <p className="text-muted-foreground">
            Manage employee terminations and maintain termination records • {filteredAndSortedRecords.length} record{filteredAndSortedRecords.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button onClick={() => setShowTerminationDialog(true)}>
            <UserX className="h-4 w-4 mr-2" />
            New Termination
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Terminations</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalTerminations}</div>
            <p className="text-xs text-muted-foreground">
              All-time terminations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.thisMonthTerminations}</div>
            <p className="text-xs text-muted-foreground">
              Current month terminations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.pendingTerminations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.completedTerminations}</div>
            <p className="text-xs text-muted-foreground">
              Fully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search termination records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="misconduct">Misconduct</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="absenteeism">Absenteeism</SelectItem>
                <SelectItem value="policy-violation">Policy Violation</SelectItem>
                <SelectItem value="redundancy">Redundancy</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Table or Empty State */}
      {filteredAndSortedRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <UserX className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No termination records found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search filters to find records.'
                    : 'No employee terminations have been processed yet.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('employeeName')} className="h-auto p-0 font-medium">
                    Employee {getSortIcon('employeeName')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('department')} className="h-auto p-0 font-medium">
                    Department {getSortIcon('department')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('terminationDate')} className="h-auto p-0 font-medium">
                    Termination Date {getSortIcon('terminationDate')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('terminationType')} className="h-auto p-0 font-medium">
                    Type {getSortIcon('terminationType')}
                  </Button>
                </TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-medium">
                    Status {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.empId} • {record.designation}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>{new Date(record.terminationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(record.terminationType)}>
                      {record.terminationType.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={record.reason}>
                      {record.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRecord(record)
                        setShowDetailsDialog(true)
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}