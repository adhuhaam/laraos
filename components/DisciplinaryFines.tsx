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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
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
  Receipt,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Target,
  Bookmark,
  Copy,
  Banknote,
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface DisciplinaryFineRecord {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  department: string
  designation: string
  fineType: 'tardiness' | 'absence' | 'dress-code' | 'policy-violation' | 'safety-violation' | 'misconduct' | 'other'
  fineCategory: 'administrative' | 'behavioral' | 'safety' | 'performance' | 'attendance'
  amount: number
  currency: 'MVR' | 'USD'
  reason: string
  description: string
  incidentDate: string
  fineDate: string
  dueDate: string
  issuedBy: string
  approvedBy?: string
  approvalDate?: string
  paymentMethod?: 'salary-deduction' | 'cash' | 'bank-transfer' | 'other'
  installments: boolean
  installmentPlan?: {
    totalInstallments: number
    paidInstallments: number
    installmentAmount: number
    nextDueDate: string
  }
  status: 'pending-approval' | 'approved' | 'issued' | 'partially-paid' | 'paid' | 'overdue' | 'waived' | 'disputed'
  paidAmount: number
  paidDate?: string
  paymentReference?: string
  linkedToLetter?: string
  previousFines: string[]
  appealSubmitted: boolean
  appealDate?: string
  appealReason?: string
  appealStatus?: 'pending' | 'approved' | 'rejected'
  waiverReason?: string
  waivedBy?: string
  waivedDate?: string
  hrNotes?: string
  managerNotes?: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

interface Employee {
  id: string
  empId: string
  name: string
  department: string
  designation: string
  salary: number
  managerId?: string
  managerName?: string
  avatar?: string
  disciplinaryFines: DisciplinaryFineRecord[]
}

type SortField = 'employeeName' | 'fineDate' | 'amount' | 'dueDate' | 'status'
type SortDirection = 'asc' | 'desc'

export function DisciplinaryFines() {
  // Empty data - no dummy data
  const [employees, setEmployees] = useState<Employee[]>([])
  const [disciplinaryFines, setDisciplinaryFines] = useState<DisciplinaryFineRecord[]>([])

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('fineDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [selectedFine, setSelectedFine] = useState<DisciplinaryFineRecord | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showAppealDialog, setShowAppealDialog] = useState(false)

  // Form state for creating/editing disciplinary fines
  const [fineForm, setFineForm] = useState({
    employeeId: '',
    fineType: 'tardiness' as DisciplinaryFineRecord['fineType'],
    fineCategory: 'administrative' as DisciplinaryFineRecord['fineCategory'],
    amount: '',
    currency: 'MVR' as DisciplinaryFineRecord['currency'],
    reason: '',
    description: '',
    incidentDate: '',
    dueDate: '',
    paymentMethod: 'salary-deduction' as DisciplinaryFineRecord['paymentMethod'],
    installments: false,
    totalInstallments: '',
    installmentAmount: '',
    hrNotes: '',
    managerNotes: '',
    attachments: [] as File[]
  })

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'salary-deduction' as DisciplinaryFineRecord['paymentMethod'],
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalFines = disciplinaryFines.length
    const activeFines = disciplinaryFines.filter(f => ['approved', 'issued', 'partially-paid', 'overdue'].includes(f.status)).length
    const overdueFines = disciplinaryFines.filter(f => f.status === 'overdue').length
    const paidFines = disciplinaryFines.filter(f => f.status === 'paid').length
    
    const totalAmount = disciplinaryFines.reduce((sum, fine) => sum + fine.amount, 0)
    const paidAmount = disciplinaryFines.reduce((sum, fine) => sum + fine.paidAmount, 0)
    const outstandingAmount = totalAmount - paidAmount
    
    // Category breakdown
    const categoryBreakdown = disciplinaryFines.reduce((acc, fine) => {
      acc[fine.fineCategory] = (acc[fine.fineCategory] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Monthly trend (last 6 months)
    const currentDate = new Date()
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      const monthFines = disciplinaryFines.filter(fine => {
        const fineDate = new Date(fine.fineDate)
        return fineDate.getMonth() === date.getMonth() && fineDate.getFullYear() === date.getFullYear()
      })
      monthlyData.push({
        month: monthName,
        count: monthFines.length,
        amount: monthFines.reduce((sum, fine) => sum + fine.amount, 0)
      })
    }
    
    return {
      totalFines,
      activeFines,
      overdueFines,
      paidFines,
      totalAmount,
      paidAmount,
      outstandingAmount,
      categoryBreakdown,
      monthlyData
    }
  }, [disciplinaryFines])

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(disciplinaryFines.map(f => f.department))]
    return departments.sort()
  }, [disciplinaryFines])

  // Filtering and sorting logic
  const filteredAndSortedFines = useMemo(() => {
    let filtered = disciplinaryFines.filter(fine => {
      const matchesSearch = fine.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fine.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fine.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fine.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDepartment = departmentFilter === 'all' || fine.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || fine.status === statusFilter
      const matchesType = typeFilter === 'all' || fine.fineType === typeFilter
      const matchesCategory = categoryFilter === 'all' || fine.fineCategory === categoryFilter
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesType && matchesCategory
    })

    // Sort fines
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'fineDate' || sortField === 'dueDate') {
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
  }, [disciplinaryFines, searchQuery, departmentFilter, statusFilter, typeFilter, categoryFilter, sortField, sortDirection])

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

  const getStatusColor = (status: DisciplinaryFineRecord['status']) => {
    switch (status) {
      case 'pending-approval': return 'bg-gray-500/10 text-gray-700 border-gray-200'
      case 'approved': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'issued': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'partially-paid': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'paid': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'overdue': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'waived': return 'bg-teal-500/10 text-teal-700 border-teal-200'
      case 'disputed': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getCategoryColor = (category: DisciplinaryFineRecord['fineCategory']) => {
    switch (category) {
      case 'administrative': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'behavioral': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'safety': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'performance': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'attendance': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'MVR') => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleCreateFine = useCallback(async () => {
    if (!fineForm.employeeId || !fineForm.reason || !fineForm.amount || !fineForm.incidentDate || !fineForm.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const amount = parseFloat(fineForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid fine amount')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const selectedEmp = employees.find(emp => emp.id === fineForm.employeeId)
      if (!selectedEmp) {
        toast.error('Employee not found')
        return
      }

      const installmentPlan = fineForm.installments && fineForm.totalInstallments ? {
        totalInstallments: parseInt(fineForm.totalInstallments),
        paidInstallments: 0,
        installmentAmount: parseFloat(fineForm.installmentAmount) || amount / parseInt(fineForm.totalInstallments),
        nextDueDate: fineForm.dueDate
      } : undefined

      const newFine: DisciplinaryFineRecord = {
        id: Date.now().toString(),
        employeeId: fineForm.employeeId,
        employeeName: selectedEmp.name,
        empId: selectedEmp.empId,
        department: selectedEmp.department,
        designation: selectedEmp.designation,
        fineType: fineForm.fineType,
        fineCategory: fineForm.fineCategory,
        amount,
        currency: fineForm.currency,
        reason: fineForm.reason,
        description: fineForm.description,
        incidentDate: fineForm.incidentDate,
        fineDate: new Date().toISOString().split('T')[0],
        dueDate: fineForm.dueDate,
        issuedBy: 'Current User',
        paymentMethod: fineForm.paymentMethod,
        installments: fineForm.installments,
        installmentPlan,
        status: 'pending-approval',
        paidAmount: 0,
        previousFines: [],
        appealSubmitted: false,
        hrNotes: fineForm.hrNotes,
        managerNotes: fineForm.managerNotes,
        attachments: fineForm.attachments.map(file => file.name),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      setDisciplinaryFines(prev => [newFine, ...prev])
      
      // Add to employee's disciplinary fines
      setEmployees(prev => prev.map(emp => 
        emp.id === fineForm.employeeId 
          ? { ...emp, disciplinaryFines: [newFine, ...emp.disciplinaryFines] }
          : emp
      ))

      setShowCreateDialog(false)
      setFineForm({
        employeeId: '',
        fineType: 'tardiness',
        fineCategory: 'administrative',
        amount: '',
        currency: 'MVR',
        reason: '',
        description: '',
        incidentDate: '',
        dueDate: '',
        paymentMethod: 'salary-deduction',
        installments: false,
        totalInstallments: '',
        installmentAmount: '',
        hrNotes: '',
        managerNotes: '',
        attachments: []
      })
      
      toast.success(`Disciplinary fine created for ${selectedEmp.name}`)

    } catch (error) {
      toast.error('Failed to create disciplinary fine. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [fineForm, employees])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disciplinary Fines</h1>
          <p className="text-muted-foreground">
            Manage disciplinary fines and track payment records • {filteredAndSortedFines.length} fine{filteredAndSortedFines.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Fines
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Receipt className="h-4 w-4 mr-2" />
            New Fine
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalFines}</div>
            <p className="text-xs text-muted-foreground">
              All disciplinary fines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summaryStats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All-time fines value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(summaryStats.outstandingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Unpaid fines amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryStats.overdueFines}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(summaryStats.categoryBreakdown).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fine Categories Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              {Object.entries(summaryStats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="flex justify-between p-2 bg-muted/30 rounded">
                  <span className="font-medium capitalize">{category.replace('-', ' ')}</span>
                  <span className="text-primary font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search disciplinary fines..."
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending-approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="partially-paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="waived">Waived</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Table or Empty State */}
      {filteredAndSortedFines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <Receipt className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No disciplinary fines found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search filters to find fines.'
                    : 'No disciplinary fines have been issued yet. Start by creating your first disciplinary fine.'}
                </p>
              </div>
              {!searchQuery && departmentFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Create First Fine
                </Button>
              )}
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
                <TableHead>Category</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('amount')} className="h-auto p-0 font-medium">
                    Amount {getSortIcon('amount')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('dueDate')} className="h-auto p-0 font-medium">
                    Due Date {getSortIcon('dueDate')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-medium">
                    Status {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>Payment Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedFines.map((fine) => (
                <TableRow key={fine.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{fine.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {fine.empId} • {fine.department}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(fine.fineCategory)}>
                      {fine.fineCategory}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={fine.reason}>
                      {fine.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(fine.amount, fine.currency)}</div>
                  </TableCell>
                  <TableCell>
                    <div className={
                      new Date(fine.dueDate) < new Date() && fine.status !== 'paid' 
                        ? 'text-red-600 font-medium' 
                        : ''
                    }>
                      {new Date(fine.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(fine.status)}>
                      {fine.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        {formatCurrency(fine.paidAmount, fine.currency)} / {formatCurrency(fine.amount, fine.currency)}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2 min-w-[60px]">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (fine.paidAmount / fine.amount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFine(fine)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {['approved', 'issued', 'partially-paid'].includes(fine.status) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFine(fine)
                            setPaymentForm({
                              amount: (fine.amount - fine.paidAmount).toString(),
                              paymentMethod: fine.paymentMethod || 'salary-deduction',
                              paymentReference: '',
                              paymentDate: new Date().toISOString().split('T')[0],
                              notes: ''
                            })
                            setShowPaymentDialog(true)
                          }}
                        >
                          <CreditCard className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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