import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  FileText,
  Download,
  Calendar as CalendarIcon,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Shield,
  UserCheck,
  UserX,
  UserMinus,
  Skull,
  ArrowRightLeft,
  FileWarning,
  Receipt,
  Stethoscope,
  CreditCard,
  FileCheck,
  MessageCircle,
  FolderOpen,
  Calculator,
  UserPlus,
  Gavel,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Printer,
  Mail,
  Share,
  Eye,
  Target,
  Briefcase,
  MapPin,
  Phone,
  Calendar as CalendarIcon2,
  Star,
  Award,
  Zap,
  TrendingUpIcon
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData } from './HRDataContext'
import { format, addDays, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns'

interface ReportMetric {
  label: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ElementType
  color: string
  bgColor: string
}

interface ChartData {
  name: string
  value: number
  color?: string
}

export function Reports() {
  const { employees, users, roles, disciplinaryLetters, hrStaff } = useHRData()
  
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedReportType, setSelectedReportType] = useState<string>('overview')
  const [isExporting, setIsExporting] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Department list
  const departments = [
    'Human Resources',
    'Construction',
    'Engineering',
    'Administration',
    'Information Technology',
    'Finance',
    'Operations',
    'Legal',
    'Marketing',
    'Procurement'
  ]

  // Filter employees by date range and department
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Date filter
      const employeeDate = new Date(employee.createdAt)
      const inDateRange = isWithinInterval(employeeDate, {
        start: selectedDateRange.from,
        end: selectedDateRange.to
      })
      
      // Department filter
      const inDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment
      
      return inDateRange && inDepartment
    })
  }, [employees, selectedDateRange, selectedDepartment])

  // Calculate overview metrics
  const overviewMetrics = useMemo((): ReportMetric[] => {
    const totalEmployees = employees.length
    const activeEmployees = employees.filter(emp => emp.status === 'active').length
    const totalUsers = users.length
    const totalRoles = roles.length
    const totalDisciplinaryActions = disciplinaryLetters.length
    const hrStaffCount = hrStaff.length

    return [
      {
        label: 'Total Employees',
        value: totalEmployees,
        change: 12,
        changeType: 'increase',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30'
      },
      {
        label: 'Active Employees',
        value: activeEmployees,
        change: 8,
        changeType: 'increase',
        icon: UserCheck,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/30'
      },
      {
        label: 'System Users',
        value: totalUsers,
        change: 2,
        changeType: 'increase',
        icon: Shield,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950/30'
      },
      {
        label: 'User Roles',
        value: totalRoles,
        icon: Award,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30'
      },
      {
        label: 'Disciplinary Actions',
        value: totalDisciplinaryActions,
        change: -5,
        changeType: 'decrease',
        icon: FileWarning,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/30'
      },
      {
        label: 'HR Staff',
        value: hrStaffCount,
        icon: MessageCircle,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 dark:bg-teal-950/30'
      }
    ]
  }, [employees, users, roles, disciplinaryLetters, hrStaff])

  // Employee status distribution
  const employeeStatusData = useMemo((): ChartData[] => {
    const statusCounts = employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors = {
      active: '#10b981',
      'on-leave': '#f59e0b',
      suspended: '#ef4444',
      terminated: '#dc2626',
      resigned: '#6b7280'
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count,
      color: colors[status as keyof typeof colors] || '#6b7280'
    }))
  }, [employees])

  // Department distribution
  const departmentData = useMemo((): ChartData[] => {
    const deptCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(deptCounts).map(([dept, count]) => ({
      name: dept,
      value: count
    }))
  }, [employees])

  // Monthly employee trends
  const monthlyTrendData = useMemo(() => {
    const months = []
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthName = format(date, 'MMM yyyy')
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      
      const monthEmployees = employees.filter(emp => {
        const empDate = new Date(emp.createdAt)
        return isWithinInterval(empDate, { start: monthStart, end: monthEnd })
      }).length

      months.push({
        name: monthName,
        employees: monthEmployees,
        active: Math.floor(monthEmployees * 0.85),
        inactive: Math.floor(monthEmployees * 0.15)
      })
    }
    return months
  }, [employees])

  // Disciplinary actions by type
  const disciplinaryData = useMemo((): ChartData[] => {
    const typeCounts = disciplinaryLetters.reduce((acc, letter) => {
      acc[letter.letterType] = (acc[letter.letterType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: count
    }))
  }, [disciplinaryLetters])

  // Export functionality
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      switch (format) {
        case 'pdf':
          toast.success('PDF report exported successfully')
          break
        case 'excel':
          toast.success('Excel report exported successfully')
          break
        case 'csv':
          toast.success('CSV report exported successfully')
          break
      }
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    toast.success('Report link copied to clipboard')
  }

  // Render metric card
  const renderMetricCard = (metric: ReportMetric) => (
    <Card key={metric.label} className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        <metric.icon className={`h-4 w-4 ${metric.color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
        {metric.change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {metric.changeType === 'increase' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : metric.changeType === 'decrease' ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span className={metric.changeType === 'increase' ? 'text-green-500' : metric.changeType === 'decrease' ? 'text-red-500' : ''}>
              {metric.change > 0 ? '+' : ''}{metric.change}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive summary reports from all HR operations modules
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="outline" onClick={() => handleExport('pdf')} disabled={isExporting}>
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              {/* Date Range Picker */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-64 justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateRange?.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                            {format(selectedDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(selectedDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={selectedDateRange?.from}
                        selected={{
                          from: selectedDateRange?.from,
                          to: selectedDateRange?.to
                        }}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setSelectedDateRange({ from: range.from, to: range.to })
                            setShowDatePicker(false)
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Department Filter */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredEmployees.length} records
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={selectedReportType} onValueChange={setSelectedReportType}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
          <TabsTrigger value="xpat">XPAT</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Overview Report */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overviewMetrics.map(renderMetricCard)}
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Employee Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Employee Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={employeeStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {employeeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Monthly Employee Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="active" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Active Employees"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="inactive" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Inactive Employees"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Management Report */}
        <TabsContent value="employees" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees.filter(emp => emp.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terminated</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees.filter(emp => emp.status === 'terminated').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resigned</CardTitle>
                <UserMinus className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees.filter(emp => emp.status === 'resigned').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees.filter(emp => emp.status === 'on-leave').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.slice(0, 10).map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.empId}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={employee.status === 'active' ? 'default' : 'secondary'}
                            className={
                              employee.status === 'active' ? 'bg-green-500' :
                              employee.status === 'terminated' ? 'bg-red-500' :
                              employee.status === 'resigned' ? 'bg-gray-500' :
                              'bg-orange-500'
                            }
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruitment Report */}
        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <UserPlus className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Ready to start recruiting</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offers Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No pending offers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready to Submit</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No submissions ready</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collections</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No collections pending</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recruitment Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recruitment Data</h3>
                <p className="text-muted-foreground">
                  Start by adding candidates to see recruitment analytics and reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disciplinary Report */}
        <TabsContent value="disciplinary" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <FileWarning className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{disciplinaryLetters.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {disciplinaryLetters.filter(letter => 
                    ['issued', 'acknowledged'].includes(letter.status)
                  ).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {disciplinaryLetters.filter(letter => letter.status === 'closed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
                <Receipt className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${disciplinaryLetters.reduce((total, letter) => 
                    total + (letter.fineAmount || 0), 0
                  ).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disciplinary Actions Chart */}
          {disciplinaryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Disciplinary Actions by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={disciplinaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Disciplinary Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Disciplinary Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {disciplinaryLetters.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fine Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disciplinaryLetters.slice(0, 10).map((letter) => (
                        <TableRow key={letter.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{letter.employeeName}</div>
                              <div className="text-sm text-muted-foreground">{letter.empId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {letter.letterType.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{letter.subject}</TableCell>
                          <TableCell>{new Date(letter.letterDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                letter.status === 'closed' ? 'default' :
                                letter.status === 'issued' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {letter.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {letter.fineAmount ? `$${letter.fineAmount}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileWarning className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Disciplinary Actions</h3>
                  <p className="text-muted-foreground">
                    No disciplinary actions have been recorded yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* XPAT Management Report */}
        <TabsContent value="xpat" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Permits</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No permits processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Tests</CardTitle>
                <Stethoscope className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No tests scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insurance Policies</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No policies active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VISA Stickers</CardTitle>
                <FileCheck className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No visas processed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>XPAT Process Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No XPAT Data</h3>
                <p className="text-muted-foreground">
                  Start processing expatriate documents to see detailed analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & System Report */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => user.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Roles</CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HR Staff</CardTitle>
                <MessageCircle className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrStaff.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* User Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Users Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.roleName}</Badge>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={user.status === 'active' ? 'bg-green-500' : ''}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Report */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No projects created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No active projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No completed projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quota Pools</CardTitle>
                <Calculator className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No quota pools created</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Management Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Project Data</h3>
                <p className="text-muted-foreground">
                  Create your first project to start tracking progress and generating reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}