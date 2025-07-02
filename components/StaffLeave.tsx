import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'
import { 
  Search,
  RefreshCw,
  Download,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  FileText,
  Plane,
  Heart,
  Baby,
  UserCheck,
  Zap,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Building,
  Briefcase,
  Info
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { format, addDays, differenceInDays, parseISO, eachDayOfInterval, isAfter, isBefore, isSameDay } from 'date-fns'
import { useHRData } from './HRDataContext'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

// Company Holidays for 2025
const COMPANY_HOLIDAYS_2025 = [
  { date: new Date('2025-01-01'), name: 'New Year Day' },
  { date: new Date('2025-03-01'), name: 'First of Ramadan' },
  { date: new Date('2025-03-31'), name: 'Eid-ul Fithr' },
  { date: new Date('2025-05-01'), name: 'Labour Day' },
  { date: new Date('2025-06-05'), name: 'Hajj Day' },
  { date: new Date('2025-06-06'), name: 'Eid-ul Al\'haa' },
  { date: new Date('2025-07-26'), name: 'Independence Day' }
]

// Business Days Calculator
const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  if (!startDate || !endDate || isAfter(startDate, endDate)) {
    return 0
  }

  let businessDays = 0
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
  
  for (const date of dateRange) {
    // Skip Fridays (day 5 in JavaScript, where Sunday is 0)
    if (date.getDay() === 5) {
      continue
    }
    
    // Skip company holidays
    const isHoliday = COMPANY_HOLIDAYS_2025.some(holiday => 
      isSameDay(date, holiday.date)
    )
    
    if (!isHoliday) {
      businessDays++
    }
  }
  
  return businessDays
}

// Holiday checker function
const isCompanyHoliday = (date: Date): { isHoliday: boolean; holidayName?: string } => {
  const holiday = COMPANY_HOLIDAYS_2025.find(h => isSameDay(date, h.date))
  return {
    isHoliday: !!holiday,
    holidayName: holiday?.name
  }
}

// Leave Types Configuration
const leaveTypes = {
  'annual': {
    label: 'Annual Leave',
    icon: Plane,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    description: 'Regular vacation leave'
  },
  'medical': {
    label: 'Medical Leave',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    description: 'Medical or sick leave'
  },
  'maternity': {
    label: 'Maternity Leave',
    icon: Baby,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    description: 'Maternity leave for mothers'
  },
  'paternity': {
    label: 'Paternity Leave',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    description: 'Paternity leave for fathers'
  },
  'emergency': {
    label: 'Emergency Leave',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    description: 'Emergency or urgent leave'
  },
  'no-pay': {
    label: 'No Pay Leave',
    icon: DollarSign,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    description: 'Leave without pay'
  },
  'hajj': {
    label: 'Hajj Leave',
    icon: MapPin,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    description: 'Religious pilgrimage leave'
  },
  'umrah': {
    label: 'Umrah Leave',
    icon: MapPin,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    description: 'Religious pilgrimage leave'
  }
}

// Leave Status Configuration
const leaveStatusConfig = {
  'pending': {
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: Clock,
    description: 'Awaiting approval'
  },
  'approved': {
    label: 'Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle,
    description: 'Leave approved'
  },
  'rejected': {
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
    description: 'Leave rejected'
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    icon: XCircle,
    description: 'Leave cancelled'
  }
}

// Leave Application Interface
interface LeaveApplication {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  department: string
  designation: string
  nationality: string
  leaveType: keyof typeof leaveTypes
  startDate: Date
  endDate: Date
  totalDays: number
  businessDays: number
  reason: string
  status: keyof typeof leaveStatusConfig
  appliedDate: Date
  approvedBy?: string
  approvedDate?: Date
  rejectionReason?: string
  emergencyContact?: string
  emergencyPhone?: string
  medicalCertificate?: boolean
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Leave Form Interface
interface LeaveForm {
  employeeId: string
  leaveType: string
  startDate: Date | null
  endDate: Date | null
  reason: string
  emergencyContact: string
  emergencyPhone: string
  medicalCertificate: boolean
}

export function StaffLeave() {
  const { employees } = useHRData()

  // State management
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Ahmed Hassan Al-Mansouri',
      empId: 'EMP001',
      department: 'Construction',
      designation: 'Project Manager',
      nationality: 'Maldivian',
      leaveType: 'annual',
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-02-25'),
      totalDays: 11,
      businessDays: 8, // Excluding Fridays and any holidays in that period
      reason: 'Family vacation to Dubai',
      status: 'approved',
      appliedDate: new Date('2024-01-20'),
      approvedBy: 'HR Manager',
      approvedDate: new Date('2024-01-22'),
      emergencyContact: 'Fatima Al-Mansouri',
      emergencyPhone: '+960 777 1234',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Rajesh Kumar Patel',
      empId: 'EMP002',
      department: 'Construction',
      designation: 'Site Engineer',
      nationality: 'Indian',
      leaveType: 'medical',
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-02-14'),
      totalDays: 5,
      businessDays: 4, // Excluding Friday
      reason: 'Medical treatment for back pain',
      status: 'pending',
      appliedDate: new Date('2024-02-05'),
      emergencyContact: 'Priya Patel',
      emergencyPhone: '+91 98765 43210',
      medicalCertificate: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05')
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Ali Hassan Khan',
      empId: 'EMP003',
      department: 'Electrical',
      designation: 'Electrician',
      nationality: 'Pakistani',
      leaveType: 'emergency',
      startDate: new Date('2024-02-08'),
      endDate: new Date('2024-02-09'),
      totalDays: 2,
      businessDays: 2, // No Friday or holiday in this period
      reason: 'Family emergency - father hospitalized',
      status: 'approved',
      appliedDate: new Date('2024-02-07'),
      approvedBy: 'Department Head',
      approvedDate: new Date('2024-02-07'),
      emergencyContact: 'Sara Khan',
      emergencyPhone: '+92 300 1234567',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-02-07'),
      updatedAt: new Date('2024-02-07')
    },
    {
      id: '4',
      employeeId: '4',
      employeeName: 'Priya Sharma',
      empId: 'EMP004',
      department: 'Administration',
      designation: 'HR Assistant',
      nationality: 'Sri Lankan',
      leaveType: 'maternity',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-01'),
      totalDays: 93,
      businessDays: 67, // Calculated excluding Fridays and holidays
      reason: 'Maternity leave for childbirth',
      status: 'approved',
      appliedDate: new Date('2024-01-15'),
      approvedBy: 'HR Manager',
      approvedDate: new Date('2024-01-16'),
      emergencyContact: 'Rajesh Sharma',
      emergencyPhone: '+94 77 123 4567',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [leaveForm, setLeaveForm] = useState<LeaveForm>({
    employeeId: '',
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalCertificate: false
  })

  // Calculate business days for the form
  const formBusinessDays = useMemo(() => {
    if (leaveForm.startDate && leaveForm.endDate) {
      return calculateBusinessDays(leaveForm.startDate, leaveForm.endDate)
    }
    return 0
  }, [leaveForm.startDate, leaveForm.endDate])

  // Calculate total calendar days for the form
  const formTotalDays = useMemo(() => {
    if (leaveForm.startDate && leaveForm.endDate) {
      return differenceInDays(leaveForm.endDate, leaveForm.startDate) + 1
    }
    return 0
  }, [leaveForm.startDate, leaveForm.endDate])

  // Filter applications
  const filteredApplications = useMemo(() => {
    return leaveApplications.filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.department.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesLeaveType = leaveTypeFilter === 'all' || app.leaveType === leaveTypeFilter
      const matchesDepartment = departmentFilter === 'all' || app.department === departmentFilter
      
      return matchesSearch && matchesStatus && matchesLeaveType && matchesDepartment
    }).sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
  }, [leaveApplications, searchQuery, statusFilter, leaveTypeFilter, departmentFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalApplications = leaveApplications.length
    const pendingCount = leaveApplications.filter(app => app.status === 'pending').length
    const approvedCount = leaveApplications.filter(app => app.status === 'approved').length
    const rejectedCount = leaveApplications.filter(app => app.status === 'rejected').length
    const cancelledCount = leaveApplications.filter(app => app.status === 'cancelled').length
    
    // Leave type breakdown
    const leaveTypeBreakdown = Object.keys(leaveTypes).reduce((acc, type) => {
      acc[type] = leaveApplications.filter(app => app.leaveType === type).length
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalApplications,
      pendingCount,
      approvedCount,
      rejectedCount,
      cancelledCount,
      leaveTypeBreakdown
    }
  }, [leaveApplications])

  // Get unique departments
  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(leaveApplications.map(app => app.department))]
    return departments.sort()
  }, [leaveApplications])

  // Handle form submission
  const handleCreateApplication = async () => {
    if (!leaveForm.employeeId || !leaveForm.leaveType || !leaveForm.startDate || !leaveForm.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    if (leaveForm.endDate <= leaveForm.startDate) {
      toast.error('End date must be after start date')
      return
    }

    setIsLoading(true)
    try {
      const employee = employees.find(emp => emp.id === leaveForm.employeeId)
      if (!employee) {
        throw new Error('Employee not found')
      }

      const totalDays = differenceInDays(leaveForm.endDate, leaveForm.startDate) + 1
      const businessDays = calculateBusinessDays(leaveForm.startDate, leaveForm.endDate)

      const newApplication: LeaveApplication = {
        id: `leave-${Date.now()}`,
        employeeId: leaveForm.employeeId,
        employeeName: employee.name,
        empId: employee.empId,
        department: employee.department,
        designation: employee.designation,
        nationality: employee.nationality,
        leaveType: leaveForm.leaveType as keyof typeof leaveTypes,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        totalDays,
        businessDays,
        reason: leaveForm.reason,
        status: 'pending',
        appliedDate: new Date(),
        emergencyContact: leaveForm.emergencyContact,
        emergencyPhone: leaveForm.emergencyPhone,
        medicalCertificate: leaveForm.medicalCertificate,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setLeaveApplications(prev => [newApplication, ...prev])
      setIsCreateDialogOpen(false)
      setLeaveForm({
        employeeId: '',
        leaveType: '',
        startDate: null,
        endDate: null,
        reason: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalCertificate: false
      })
      
      toast.success(`Leave application submitted for ${employee.name}`)
    } catch (error) {
      toast.error('Failed to submit leave application')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = (applicationId: string, newStatus: string, rejectionReason?: string) => {
    setLeaveApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        const updatedApp = {
          ...app,
          status: newStatus as keyof typeof leaveStatusConfig,
          updatedAt: new Date()
        }
        
        if (newStatus === 'approved') {
          updatedApp.approvedBy = 'Current User'
          updatedApp.approvedDate = new Date()
        } else if (newStatus === 'rejected' && rejectionReason) {
          updatedApp.rejectionReason = rejectionReason
        }
        
        return updatedApp
      }
      return app
    }))
    
    const statusConfig = leaveStatusConfig[newStatus as keyof typeof leaveStatusConfig]
    toast.success(`Application ${statusConfig.label.toLowerCase()}`)
  }

  // Get status badge
  const getStatusBadge = (status: keyof typeof leaveStatusConfig) => {
    const config = leaveStatusConfig[status]
    const IconComponent = config.icon
    
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-current`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Get leave type badge
  const getLeaveTypeBadge = (leaveType: keyof typeof leaveTypes) => {
    const config = leaveTypes[leaveType]
    const IconComponent = config.icon
    
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-current`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy')
  }

  // Check if a date is disabled (company holiday or Friday)
  const isDateDisabled = (date: Date) => {
    // Disable Fridays
    if (date.getDay() === 5) return true
    
    // Disable company holidays
    return isCompanyHoliday(date).isHoliday
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Staff Leave Management
          </h1>
          <p className="text-muted-foreground">
            Manage employee leave applications and approvals
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">All leave requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.approvedCount}</div>
            <p className="text-xs text-muted-foreground">Approved requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryStats.rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Rejected requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Holidays Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Company Holidays 2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPANY_HOLIDAYS_2025.map((holiday, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium text-sm">{holiday.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(holiday.date)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Leave calculations exclude Fridays and company holidays. 
                Business days are counted for leave duration.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(leaveTypes).map(([key, config]) => {
              const count = summaryStats.leaveTypeBreakdown[key] || 0
              const IconComponent = config.icon
              return (
                <div key={key} className={`text-center p-3 rounded-lg ${config.bgColor}`}>
                  <IconComponent className={`h-6 w-6 mx-auto mb-2 ${config.color}`} />
                  <div className={`text-xl font-bold ${config.color}`}>{count}</div>
                  <div className="text-sm text-muted-foreground">{config.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(leaveTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((department) => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Badge variant="outline" className="text-sm">
              {filteredApplications.length} applications
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={application.avatar} alt={application.employeeName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {application.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{application.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {application.empId} • {application.department}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLeaveTypeBadge(application.leaveType)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.businessDays} business days</div>
                      <div className="text-sm text-muted-foreground">
                        {application.totalDays} total days
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(application.startDate)} - {formatDate(application.endDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(application.status)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(application.appliedDate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedApplication(application)
                          setIsDetailsDialogOpen(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {application.status === 'pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'approved')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'rejected', 'Insufficient leave balance')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Leave Application Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Leave Application</DialogTitle>
            <DialogDescription>
              Submit a new leave application for approval
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee *</Label>
                <Select
                  value={leaveForm.employeeId}
                  onValueChange={(value) => setLeaveForm(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(emp => emp.status === 'active').slice(0, 20).map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {employee.empId} • {employee.department}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  value={leaveForm.leaveType}
                  onValueChange={(value) => setLeaveForm(prev => ({ ...prev, leaveType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(leaveTypes).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaveForm.startDate ? formatDate(leaveForm.startDate) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={leaveForm.startDate || undefined}
                      onSelect={(date) => setLeaveForm(prev => ({ ...prev, startDate: date || null }))}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaveForm.endDate ? formatDate(leaveForm.endDate) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={leaveForm.endDate || undefined}
                      onSelect={(date) => setLeaveForm(prev => ({ ...prev, endDate: date || null }))}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {leaveForm.startDate && leaveForm.endDate && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Calendar Days:</span> {formTotalDays}
                  </div>
                  <div>
                    <span className="font-medium">Business Days:</span> {formBusinessDays}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  * Business days exclude Fridays and company holidays
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide reason for leave..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Contact person name"
                  value={leaveForm.emergencyContact}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="+960 xxx xxxx"
                  value={leaveForm.emergencyPhone}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                />
              </div>
            </div>

            {leaveForm.leaveType === 'medical' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="medicalCertificate"
                  checked={leaveForm.medicalCertificate}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, medicalCertificate: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="medicalCertificate" className="text-sm">
                  Medical certificate attached
                </Label>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateApplication} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Leave Application Details</DialogTitle>
            <DialogDescription>
              Complete information about the leave application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedApplication.avatar} alt={selectedApplication.employeeName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedApplication.employeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedApplication.employeeName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.empId} • {selectedApplication.department} • {selectedApplication.designation}
                  </p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Leave Type</Label>
                    <div className="mt-1">
                      {getLeaveTypeBadge(selectedApplication.leaveType)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <div className="mt-1">
                      <div className="font-medium">{selectedApplication.businessDays} business days</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedApplication.totalDays} total calendar days
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(selectedApplication.startDate)} to {formatDate(selectedApplication.endDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Applied Date</Label>
                    <div className="mt-1 text-sm">{formatDate(selectedApplication.appliedDate)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Emergency Contact</Label>
                    <div className="mt-1">
                      <div className="font-medium">{selectedApplication.emergencyContact}</div>
                      <div className="text-sm text-muted-foreground">{selectedApplication.emergencyPhone}</div>
                    </div>
                  </div>
                  
                  {selectedApplication.approvedBy && (
                    <div>
                      <Label className="text-sm font-medium">Approved By</Label>
                      <div className="mt-1">
                        <div className="font-medium">{selectedApplication.approvedBy}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedApplication.approvedDate && formatDate(selectedApplication.approvedDate)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.medicalCertificate && (
                    <div>
                      <Label className="text-sm font-medium">Medical Certificate</Label>
                      <div className="mt-1 text-sm text-green-600">✓ Attached</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Reason</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  {selectedApplication.reason}
                </div>
              </div>

              {selectedApplication.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {selectedApplication.rejectionReason}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Business Days Calculation:</strong> This leave spans {selectedApplication.businessDays} business days 
                  out of {selectedApplication.totalDays} total calendar days, excluding Fridays and company holidays.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}