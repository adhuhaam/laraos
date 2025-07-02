import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { 
  Search,
  RefreshCw,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Eye
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { format, differenceInYears, differenceInMonths, addYears } from 'date-fns'
import { useHRData } from './HRDataContext'

// Leave Balance Interface
interface LeaveBalance {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  department: string
  designation: string
  nationality: string
  joiningDate: Date
  yearsOfService: number
  leaveBalances: {
    annual: {
      entitled: number
      used: number
      remaining: number
      nextEntitlement: Date | null
      eligibilityStatus: 'eligible' | 'not-eligible' | 'pending'
    }
    medical: {
      entitled: number
      used: number
      remaining: number
    }
    maternity: {
      entitled: number
      used: number
      remaining: number
    }
    paternity: {
      entitled: number
      used: number
      remaining: number
    }
    emergency: {
      entitled: number
      used: number
      remaining: number
    }
    noPay: {
      used: number
    }
    hajj: {
      entitled: number
      used: number
      remaining: number
    }
    umrah: {
      entitled: number
      used: number
      remaining: number
    }
  }
  lastLeaveUpdate: Date
  avatar?: string
}

// Eligibility calculation based on nationality
const calculateAnnualLeaveEligibility = (nationality: string, joiningDate: Date, yearsOfService: number) => {
  const today = new Date()
  
  // Maldivian, Indian & Sri Lankan Senior Level staff
  if (['Maldivian', 'Indian', 'Sri Lankan'].includes(nationality)) {
    if (yearsOfService >= 1) {
      return {
        entitled: 30,
        eligibilityStatus: 'eligible' as const,
        nextEntitlement: addYears(joiningDate, Math.floor(yearsOfService) + 1),
        description: '30 days annual leave (eligible every year after 1 year of service)'
      }
    } else {
      return {
        entitled: 0,
        eligibilityStatus: 'not-eligible' as const,
        nextEntitlement: addYears(joiningDate, 1),
        description: 'Not eligible yet (requires 1 year of service)'
      }
    }
  }
  
  // Bangladeshi & Nepali employees
  if (['Bangladeshi', 'Nepalese'].includes(nationality)) {
    if (yearsOfService >= 2) {
      const cycleYear = Math.floor((yearsOfService - 2) / 2)
      const nextEntitlement = addYears(joiningDate, 2 + (cycleYear + 1) * 2)
      
      return {
        entitled: 60,
        eligibilityStatus: 'eligible' as const,
        nextEntitlement,
        description: '60 days annual leave (eligible every 2 years after 2 years of service)'
      }
    } else {
      return {
        entitled: 0,
        eligibilityStatus: 'not-eligible' as const,
        nextEntitlement: addYears(joiningDate, 2),
        description: 'Not eligible yet (requires 2 years of service)'
      }
    }
  }
  
  // Special case: 5+ years continuous service without annual leave
  if (yearsOfService >= 5) {
    return {
      entitled: 120,
      eligibilityStatus: 'eligible' as const,
      nextEntitlement: null,
      description: '120 days maximum leave (5+ years continuous service)'
    }
  }
  
  // Default case for other nationalities
  return {
    entitled: 30,
    eligibilityStatus: yearsOfService >= 1 ? 'eligible' as const : 'not-eligible' as const,
    nextEntitlement: yearsOfService >= 1 ? addYears(joiningDate, Math.floor(yearsOfService) + 1) : addYears(joiningDate, 1),
    description: '30 days annual leave (standard eligibility)'
  }
}

export function LeaveBalance() {
  const { employees } = useHRData()

  // Sample leave balance data
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Ahmed Hassan Al-Mansouri',
      empId: 'EMP001',
      department: 'Construction',
      designation: 'Project Manager',
      nationality: 'Maldivian',
      joiningDate: new Date('2022-01-15'),
      yearsOfService: 2.1,
      leaveBalances: {
        annual: {
          entitled: 30,
          used: 15,
          remaining: 15,
          nextEntitlement: new Date('2025-01-15'),
          eligibilityStatus: 'eligible'
        },
        medical: { entitled: 14, used: 3, remaining: 11 },
        maternity: { entitled: 0, used: 0, remaining: 0 },
        paternity: { entitled: 7, used: 0, remaining: 7 },
        emergency: { entitled: 5, used: 2, remaining: 3 },
        noPay: { used: 0 },
        hajj: { entitled: 30, used: 0, remaining: 30 },
        umrah: { entitled: 15, used: 0, remaining: 15 }
      },
      lastLeaveUpdate: new Date('2024-01-22'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Rajesh Kumar Patel',
      empId: 'EMP002',
      department: 'Construction',
      designation: 'Site Engineer',
      nationality: 'Indian',
      joiningDate: new Date('2023-03-10'),
      yearsOfService: 0.9,
      leaveBalances: {
        annual: {
          entitled: 0,
          used: 0,
          remaining: 0,
          nextEntitlement: new Date('2024-03-10'),
          eligibilityStatus: 'not-eligible'
        },
        medical: { entitled: 14, used: 5, remaining: 9 },
        maternity: { entitled: 0, used: 0, remaining: 0 },
        paternity: { entitled: 7, used: 0, remaining: 7 },
        emergency: { entitled: 5, used: 1, remaining: 4 },
        noPay: { used: 0 },
        hajj: { entitled: 0, used: 0, remaining: 0 },
        umrah: { entitled: 0, used: 0, remaining: 0 }
      },
      lastLeaveUpdate: new Date('2024-02-05'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Ali Hassan Khan',
      empId: 'EMP003',
      department: 'Electrical',
      designation: 'Electrician',
      nationality: 'Pakistani',
      joiningDate: new Date('2021-06-01'),
      yearsOfService: 2.7,
      leaveBalances: {
        annual: {
          entitled: 30,
          used: 8,
          remaining: 22,
          nextEntitlement: new Date('2025-06-01'),
          eligibilityStatus: 'eligible'
        },
        medical: { entitled: 14, used: 2, remaining: 12 },
        maternity: { entitled: 0, used: 0, remaining: 0 },
        paternity: { entitled: 7, used: 2, remaining: 5 },
        emergency: { entitled: 5, used: 2, remaining: 3 },
        noPay: { used: 0 },
        hajj: { entitled: 30, used: 0, remaining: 30 },
        umrah: { entitled: 15, used: 0, remaining: 15 }
      },
      lastLeaveUpdate: new Date('2024-02-07'),
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '4',
      employeeId: '4',
      employeeName: 'Mohammad Rahman',
      empId: 'EMP004',
      department: 'Construction',
      designation: 'Construction Worker',
      nationality: 'Bangladeshi',
      joiningDate: new Date('2021-01-10'),
      yearsOfService: 3.1,
      leaveBalances: {
        annual: {
          entitled: 60,
          used: 0,
          remaining: 60,
          nextEntitlement: new Date('2025-01-10'),
          eligibilityStatus: 'eligible'
        },
        medical: { entitled: 14, used: 0, remaining: 14 },
        maternity: { entitled: 0, used: 0, remaining: 0 },
        paternity: { entitled: 7, used: 0, remaining: 7 },
        emergency: { entitled: 5, used: 0, remaining: 5 },
        noPay: { used: 0 },
        hajj: { entitled: 30, used: 0, remaining: 30 },
        umrah: { entitled: 15, used: 0, remaining: 15 }
      },
      lastLeaveUpdate: new Date('2024-01-10'),
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '5',
      employeeId: '5',
      employeeName: 'Priya Sharma',
      empId: 'EMP005',
      department: 'Administration',
      designation: 'HR Assistant',
      nationality: 'Sri Lankan',
      joiningDate: new Date('2019-05-15'),
      yearsOfService: 4.8,
      leaveBalances: {
        annual: {
          entitled: 30,
          used: 12,
          remaining: 18,
          nextEntitlement: new Date('2024-05-15'),
          eligibilityStatus: 'eligible'
        },
        medical: { entitled: 14, used: 4, remaining: 10 },
        maternity: { entitled: 90, used: 90, remaining: 0 },
        paternity: { entitled: 0, used: 0, remaining: 0 },
        emergency: { entitled: 5, used: 1, remaining: 4 },
        noPay: { used: 0 },
        hajj: { entitled: 0, used: 0, remaining: 0 },
        umrah: { entitled: 0, used: 0, remaining: 0 }
      },
      lastLeaveUpdate: new Date('2024-01-16'),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<LeaveBalance | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Filter balances
  const filteredBalances = useMemo(() => {
    return leaveBalances.filter(balance => {
      const matchesSearch = searchQuery === '' || 
        balance.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        balance.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        balance.department.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesNationality = nationalityFilter === 'all' || balance.nationality === nationalityFilter
      const matchesDepartment = departmentFilter === 'all' || balance.department === departmentFilter
      const matchesEligibility = eligibilityFilter === 'all' || balance.leaveBalances.annual.eligibilityStatus === eligibilityFilter
      
      return matchesSearch && matchesNationality && matchesDepartment && matchesEligibility
    }).sort((a, b) => a.employeeName.localeCompare(b.employeeName))
  }, [leaveBalances, searchQuery, nationalityFilter, departmentFilter, eligibilityFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEmployees = leaveBalances.length
    const eligibleEmployees = leaveBalances.filter(b => b.leaveBalances.annual.eligibilityStatus === 'eligible').length
    const notEligibleEmployees = leaveBalances.filter(b => b.leaveBalances.annual.eligibilityStatus === 'not-eligible').length
    
    const totalAnnualEntitled = leaveBalances.reduce((sum, b) => sum + b.leaveBalances.annual.entitled, 0)
    const totalAnnualUsed = leaveBalances.reduce((sum, b) => sum + b.leaveBalances.annual.used, 0)
    const totalAnnualRemaining = leaveBalances.reduce((sum, b) => sum + b.leaveBalances.annual.remaining, 0)
    
    const utilizationRate = totalAnnualEntitled > 0 ? (totalAnnualUsed / totalAnnualEntitled) * 100 : 0
    
    return {
      totalEmployees,
      eligibleEmployees,
      notEligibleEmployees,
      totalAnnualEntitled,
      totalAnnualUsed,
      totalAnnualRemaining,
      utilizationRate
    }
  }, [leaveBalances])

  // Get unique values for filters
  const uniqueNationalities = useMemo(() => {
    const nationalities = [...new Set(leaveBalances.map(b => b.nationality))]
    return nationalities.sort()
  }, [leaveBalances])

  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(leaveBalances.map(b => b.department))]
    return departments.sort()
  }, [leaveBalances])

  // Get eligibility status badge
  const getEligibilityBadge = (status: string) => {
    switch (status) {
      case 'eligible':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Eligible
          </Badge>
        )
      case 'not-eligible':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Not Eligible
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy')
  }

  // Calculate usage percentage
  const getUsagePercentage = (used: number, entitled: number) => {
    return entitled > 0 ? (used / entitled) * 100 : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Leave Balance Management
          </h1>
          <p className="text-muted-foreground">
            Track employee leave balances and eligibility status
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.eligibleEmployees}</div>
            <p className="text-xs text-muted-foreground">For annual leave</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryStats.notEligibleEmployees}</div>
            <p className="text-xs text-muted-foreground">Awaiting eligibility</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entitled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.totalAnnualEntitled}</div>
            <p className="text-xs text-muted-foreground">Annual leave days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.utilizationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Leave usage rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Utilization Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Leave Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Utilization</span>
              <span className="font-medium">{summaryStats.utilizationRate.toFixed(1)}%</span>
            </div>
            <Progress value={summaryStats.utilizationRate} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{summaryStats.totalAnnualEntitled}</div>
                <div className="text-sm text-blue-600">Entitled</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{summaryStats.totalAnnualUsed}</div>
                <div className="text-sm text-orange-600">Used</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{summaryStats.totalAnnualRemaining}</div>
                <div className="text-sm text-green-600">Remaining</div>
              </div>
            </div>
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
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  {uniqueNationalities.map((nationality) => (
                    <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
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

              <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="not-eligible">Not Eligible</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Badge variant="outline" className="text-sm">
              {filteredBalances.length} employees
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Leave Balance Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Service Period</TableHead>
                <TableHead>Annual Leave Status</TableHead>
                <TableHead>Annual Leave Balance</TableHead>
                <TableHead>Other Leaves</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBalances.map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={balance.avatar} alt={balance.employeeName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {balance.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{balance.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {balance.empId} • {balance.nationality}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{balance.yearsOfService.toFixed(1)} years</div>
                      <div className="text-sm text-muted-foreground">
                        Since {formatDate(balance.joiningDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getEligibilityBadge(balance.leaveBalances.annual.eligibilityStatus)}
                      {balance.leaveBalances.annual.nextEntitlement && (
                        <div className="text-xs text-muted-foreground">
                          Next: {formatDate(balance.leaveBalances.annual.nextEntitlement)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used: {balance.leaveBalances.annual.used}</span>
                        <span>Remaining: {balance.leaveBalances.annual.remaining}</span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(balance.leaveBalances.annual.used, balance.leaveBalances.annual.entitled)} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground">
                        {balance.leaveBalances.annual.entitled} days entitled
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Medical: {balance.leaveBalances.medical.remaining}/{balance.leaveBalances.medical.entitled}</div>
                      <div>Emergency: {balance.leaveBalances.emergency.remaining}/{balance.leaveBalances.emergency.entitled}</div>
                      {balance.leaveBalances.maternity.entitled > 0 && (
                        <div>Maternity: {balance.leaveBalances.maternity.remaining}/{balance.leaveBalances.maternity.entitled}</div>
                      )}
                      {balance.leaveBalances.paternity.entitled > 0 && (
                        <div>Paternity: {balance.leaveBalances.paternity.remaining}/{balance.leaveBalances.paternity.entitled}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEmployee(balance)
                        setIsDetailsDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Balance Details - {selectedEmployee?.employeeName}</DialogTitle>
            <DialogDescription>
              Complete leave balance and eligibility information
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.employeeName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedEmployee.employeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedEmployee.employeeName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.empId} • {selectedEmployee.department} • {selectedEmployee.designation}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.nationality} • {selectedEmployee.yearsOfService.toFixed(1)} years of service
                  </p>
                </div>
              </div>

              {/* Annual Leave Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Annual Leave Eligibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Eligibility Status:</span>
                      {getEligibilityBadge(selectedEmployee.leaveBalances.annual.eligibilityStatus)}
                    </div>
                    
                    {selectedEmployee.leaveBalances.annual.eligibilityStatus === 'eligible' && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Annual Leave Usage</span>
                            <span>
                              {selectedEmployee.leaveBalances.annual.used} / {selectedEmployee.leaveBalances.annual.entitled} days
                            </span>
                          </div>
                          <Progress 
                            value={getUsagePercentage(
                              selectedEmployee.leaveBalances.annual.used, 
                              selectedEmployee.leaveBalances.annual.entitled
                            )} 
                            className="h-3" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-blue-700">
                              {selectedEmployee.leaveBalances.annual.entitled}
                            </div>
                            <div className="text-sm text-blue-600">Entitled</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-xl font-bold text-orange-700">
                              {selectedEmployee.leaveBalances.annual.used}
                            </div>
                            <div className="text-sm text-orange-600">Used</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-700">
                              {selectedEmployee.leaveBalances.annual.remaining}
                            </div>
                            <div className="text-sm text-green-600">Remaining</div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedEmployee.leaveBalances.annual.nextEntitlement && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium">Next Entitlement</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(selectedEmployee.leaveBalances.annual.nextEntitlement)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Other Leave Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other Leave Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Medical Leave</span>
                        <span className="text-sm">
                          {selectedEmployee.leaveBalances.medical.remaining} / {selectedEmployee.leaveBalances.medical.entitled}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(
                          selectedEmployee.leaveBalances.medical.used,
                          selectedEmployee.leaveBalances.medical.entitled
                        )} 
                        className="h-2" 
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Emergency Leave</span>
                        <span className="text-sm">
                          {selectedEmployee.leaveBalances.emergency.remaining} / {selectedEmployee.leaveBalances.emergency.entitled}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(
                          selectedEmployee.leaveBalances.emergency.used,
                          selectedEmployee.leaveBalances.emergency.entitled
                        )} 
                        className="h-2" 
                      />
                    </div>

                    {selectedEmployee.leaveBalances.maternity.entitled > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Maternity Leave</span>
                          <span className="text-sm">
                            {selectedEmployee.leaveBalances.maternity.remaining} / {selectedEmployee.leaveBalances.maternity.entitled}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(
                            selectedEmployee.leaveBalances.maternity.used,
                            selectedEmployee.leaveBalances.maternity.entitled
                          )} 
                          className="h-2" 
                        />
                      </div>
                    )}

                    {selectedEmployee.leaveBalances.paternity.entitled > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Paternity Leave</span>
                          <span className="text-sm">
                            {selectedEmployee.leaveBalances.paternity.remaining} / {selectedEmployee.leaveBalances.paternity.entitled}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(
                            selectedEmployee.leaveBalances.paternity.used,
                            selectedEmployee.leaveBalances.paternity.entitled
                          )} 
                          className="h-2" 
                        />
                      </div>
                    )}

                    {selectedEmployee.leaveBalances.hajj.entitled > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Hajj Leave</span>
                          <span className="text-sm">
                            {selectedEmployee.leaveBalances.hajj.remaining} / {selectedEmployee.leaveBalances.hajj.entitled}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(
                            selectedEmployee.leaveBalances.hajj.used,
                            selectedEmployee.leaveBalances.hajj.entitled
                          )} 
                          className="h-2" 
                        />
                      </div>
                    )}

                    {selectedEmployee.leaveBalances.umrah.entitled > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Umrah Leave</span>
                          <span className="text-sm">
                            {selectedEmployee.leaveBalances.umrah.remaining} / {selectedEmployee.leaveBalances.umrah.entitled}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(
                            selectedEmployee.leaveBalances.umrah.used,
                            selectedEmployee.leaveBalances.umrah.entitled
                          )} 
                          className="h-2" 
                        />
                      </div>
                    )}

                    {selectedEmployee.leaveBalances.noPay.used > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">No Pay Leave</span>
                          <span className="text-sm">
                            {selectedEmployee.leaveBalances.noPay.used} days used
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leave Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">Annual Leave Eligibility ({selectedEmployee.nationality})</div>
                      <div className="text-blue-600 mt-1">
                        {selectedEmployee.nationality === 'Maldivian' || selectedEmployee.nationality === 'Indian' || selectedEmployee.nationality === 'Sri Lankan' 
                          ? '30 days annual leave after 1 year of service (eligible every year)'
                          : selectedEmployee.nationality === 'Bangladeshi' || selectedEmployee.nationality === 'Nepalese'
                          ? '60 days annual leave after 2 years of service (eligible every 2 years)'
                          : '30 days annual leave after 1 year of service (standard eligibility)'
                        }
                      </div>
                    </div>
                    
                    {selectedEmployee.yearsOfService >= 5 && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-medium text-purple-800">Long Service Benefit</div>
                        <div className="text-purple-600 mt-1">
                          Eligible for up to 120 days annual leave (5+ years continuous service)
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">Other Leave Entitlements</div>
                      <ul className="mt-1 space-y-1 text-muted-foreground">
                        <li>• Medical Leave: 14 days per year</li>
                        <li>• Emergency Leave: 5 days per year</li>
                        <li>• Maternity Leave: 90 days (for mothers)</li>
                        <li>• Paternity Leave: 7 days (for fathers)</li>
                        <li>• Hajj Leave: 30 days (once in service)</li>
                        <li>• Umrah Leave: 15 days (once in service)</li>
                        <li>• No Pay Leave: As approved by management</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}