import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
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
import { Textarea } from './ui/textarea'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { 
  Stethoscope,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  Download,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  Building,
  User,
  Eye,
  RefreshCw,
  Plus,
  AlertCircle,
  FileCheck,
  FileX,
  Timer,
  Activity,
  Zap,
  Target,
  Shield,
  Heart,
  Archive,
  Send
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData } from './HRDataContext'
import { format, addDays, isAfter, isBefore, differenceInDays } from 'date-fns'

// Work Permit Medical Status Types
type WorkPermitMedicalStatus = 
  | 'pending'
  | 'expired'
  | 'expiring-soon'
  | 'medical-center-visited'
  | 'medical-report-received'
  | 'medical-uploaded-to-xpat'
  | 'medical-incomplete'
  | 'medical-approved'
  | 'completed'

interface WorkPermitMedicalRecord {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  passportNumber: string
  nationality: string
  department: string
  designation: string
  status: WorkPermitMedicalStatus
  medicalCenter?: string
  medicalCenterAddress?: string
  medicalCenterPhone?: string
  appointmentDate?: Date
  visitDate?: Date
  reportDate?: Date
  uploadDate?: Date
  approvalDate?: Date
  completionDate?: Date
  expiryDate?: Date
  testType: 'initial' | 'renewal' | 'retest'
  medicalCertificateNumber?: string
  doctorName?: string
  testResults: {
    bloodTest: boolean
    chestXray: boolean
    generalHealth: boolean
    eyeTest: boolean
    hearingTest: boolean
  }
  documents: {
    medicalCertificate: boolean
    xrayReport: boolean
    bloodTestReport: boolean
    additionalTests: boolean
  }
  notes?: string
  cost?: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface WorkPermitMedicalFormData {
  employeeId: string
  medicalCenter: string
  medicalCenterAddress: string
  medicalCenterPhone: string
  appointmentDate?: Date
  testType: 'initial' | 'renewal' | 'retest'
  expiryDate?: Date
  notes: string
  cost: number
}

// Status Configuration
const statusConfig: Record<WorkPermitMedicalStatus, {
  label: string
  color: string
  bgColor: string
  icon: React.ElementType
  description: string
  canTransitionTo: WorkPermitMedicalStatus[]
}> = {
  'pending': {
    label: 'Pending',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: Clock,
    description: 'Medical appointment pending',
    canTransitionTo: ['medical-center-visited', 'expired']
  },
  'expired': {
    label: 'Expired',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
    description: 'Medical has expired',
    canTransitionTo: ['pending']
  },
  'expiring-soon': {
    label: 'Expiring Soon',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: AlertTriangle,
    description: 'Medical expiring within 30 days',
    canTransitionTo: ['pending', 'expired']
  },
  'medical-center-visited': {
    label: 'Medical Center Visited',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Stethoscope,
    description: 'Employee has visited medical center',
    canTransitionTo: ['medical-report-received', 'medical-incomplete']
  },
  'medical-report-received': {
    label: 'Medical Report Received',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: FileText,
    description: 'Medical report has been received',
    canTransitionTo: ['medical-uploaded-to-xpat', 'medical-incomplete']
  },
  'medical-uploaded-to-xpat': {
    label: 'Medical Uploaded to XPAT',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: Upload,
    description: 'Medical documents uploaded to XPAT system',
    canTransitionTo: ['medical-approved', 'medical-incomplete']
  },
  'medical-incomplete': {
    label: 'Medical Incomplete',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: AlertCircle,
    description: 'Medical tests or documentation incomplete',
    canTransitionTo: ['medical-center-visited', 'medical-report-received']
  },
  'medical-approved': {
    label: 'Medical Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle,
    description: 'Medical has been approved',
    canTransitionTo: ['completed']
  },
  'completed': {
    label: 'Completed',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: Target,
    description: 'Medical process completed successfully',
    canTransitionTo: ['expiring-soon', 'expired']
  }
}

export function WorkPermitMedical() {
  const { employees } = useHRData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkPermitMedicalStatus | 'all'>('all')
  const [testTypeFilter, setTestTypeFilter] = useState<'all' | 'initial' | 'renewal' | 'retest'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<WorkPermitMedicalRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [createFormData, setCreateFormData] = useState<WorkPermitMedicalFormData>({
    employeeId: '',
    medicalCenter: '',
    medicalCenterAddress: '',
    medicalCenterPhone: '',
    appointmentDate: undefined,
    testType: 'initial',
    expiryDate: undefined,
    notes: '',
    cost: 0
  })

  // Sample data - in real app this would come from backend
  const [medicalRecords, setMedicalRecords] = useState<WorkPermitMedicalRecord[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Ahmed Hassan Al-Mansouri',
      empId: 'EMP001',
      passportNumber: 'MP1234567',
      nationality: 'Maldivian',
      department: 'Construction',
      designation: 'Project Manager',
      status: 'completed',
      medicalCenter: 'ADK Hospital',
      medicalCenterAddress: 'Sosun Magu, Male 20026, Maldives',
      medicalCenterPhone: '+960 331 0441',
      appointmentDate: new Date('2024-01-15'),
      visitDate: new Date('2024-01-15'),
      reportDate: new Date('2024-01-16'),
      uploadDate: new Date('2024-01-17'),
      approvalDate: new Date('2024-01-18'),
      completionDate: new Date('2024-01-20'),
      expiryDate: new Date('2025-01-20'),
      testType: 'initial',
      medicalCertificateNumber: 'ADK-2024-001',
      doctorName: 'Dr. Ibrahim Waheed',
      testResults: {
        bloodTest: true,
        chestXray: true,
        generalHealth: true,
        eyeTest: true,
        hearingTest: true
      },
      documents: {
        medicalCertificate: true,
        xrayReport: true,
        bloodTestReport: true,
        additionalTests: false
      },
      notes: 'All tests completed successfully. Employee cleared for work permit.',
      cost: 750,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20',
      createdBy: 'HR Manager'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Rajesh Kumar Sharma',
      empId: 'EMP002',
      passportNumber: 'IN9876543',
      nationality: 'Indian',
      department: 'Construction',
      designation: 'Site Engineer',
      status: 'medical-uploaded-to-xpat',
      medicalCenter: 'Tree Top Hospital',
      medicalCenterAddress: 'Ameenee Magu, Male 20026, Maldives',
      medicalCenterPhone: '+960 330 0679',
      appointmentDate: new Date('2024-07-10'),
      visitDate: new Date('2024-07-10'),
      reportDate: new Date('2024-07-12'),
      uploadDate: new Date('2024-07-15'),
      expiryDate: new Date('2025-07-15'),
      testType: 'renewal',
      medicalCertificateNumber: 'TTP-2024-045',
      doctorName: 'Dr. Aminath Shazna',
      testResults: {
        bloodTest: true,
        chestXray: true,
        generalHealth: true,
        eyeTest: true,
        hearingTest: true
      },
      documents: {
        medicalCertificate: true,
        xrayReport: true,
        bloodTestReport: true,
        additionalTests: false
      },
      notes: 'Renewal medical completed. Awaiting XPAT approval.',
      cost: 650,
      createdAt: '2024-07-05',
      updatedAt: '2024-07-15',
      createdBy: 'HR Assistant'
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Mohammad Al-Zahra',
      empId: 'EMP003',
      passportNumber: 'BD5432109',
      nationality: 'Bangladeshi',
      department: 'Electrical',
      designation: 'Electrician',
      status: 'pending',
      medicalCenter: 'Hulhumale Hospital',
      medicalCenterAddress: 'Hulhumale, Maldives',
      medicalCenterPhone: '+960 330 4949',
      appointmentDate: new Date('2024-12-20'),
      testType: 'initial',
      testResults: {
        bloodTest: false,
        chestXray: false,
        generalHealth: false,
        eyeTest: false,
        hearingTest: false
      },
      documents: {
        medicalCertificate: false,
        xrayReport: false,
        bloodTestReport: false,
        additionalTests: false
      },
      notes: 'Initial medical appointment scheduled.',
      cost: 750,
      createdAt: '2024-12-15',
      updatedAt: '2024-12-15',
      createdBy: 'HR Manager'
    }
  ])

  // Filter records
  const filteredRecords = useMemo(() => {
    return medicalRecords.filter(record => {
      const matchesSearch = searchQuery === '' || 
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.medicalCenter?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesTestType = testTypeFilter === 'all' || record.testType === testTypeFilter
      
      return matchesSearch && matchesStatus && matchesTestType
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [medicalRecords, searchQuery, statusFilter, testTypeFilter])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<WorkPermitMedicalStatus, number> = {
      'pending': 0,
      'expired': 0,
      'expiring-soon': 0,
      'medical-center-visited': 0,
      'medical-report-received': 0,
      'medical-uploaded-to-xpat': 0,
      'medical-incomplete': 0,
      'medical-approved': 0,
      'completed': 0
    }
    
    medicalRecords.forEach(record => {
      counts[record.status]++
    })
    
    return counts
  }, [medicalRecords])

  // Create new medical record
  const handleCreateRecord = async () => {
    if (!createFormData.employeeId || !createFormData.medicalCenter) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const employee = employees.find(emp => emp.id === createFormData.employeeId)
      if (!employee) {
        throw new Error('Employee not found')
      }

      const newRecord: WorkPermitMedicalRecord = {
        id: Date.now().toString(),
        employeeId: createFormData.employeeId,
        employeeName: employee.name,
        empId: employee.empId,
        passportNumber: employee.passportNumber,
        nationality: employee.nationality,
        department: employee.department,
        designation: employee.designation,
        status: 'pending',
        medicalCenter: createFormData.medicalCenter,
        medicalCenterAddress: createFormData.medicalCenterAddress,
        medicalCenterPhone: createFormData.medicalCenterPhone,
        appointmentDate: createFormData.appointmentDate,
        testType: createFormData.testType,
        expiryDate: createFormData.expiryDate,
        testResults: {
          bloodTest: false,
          chestXray: false,
          generalHealth: false,
          eyeTest: false,
          hearingTest: false
        },
        documents: {
          medicalCertificate: false,
          xrayReport: false,
          bloodTestReport: false,
          additionalTests: false
        },
        notes: createFormData.notes,
        cost: createFormData.cost,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Current User'
      }

      setMedicalRecords(prev => [newRecord, ...prev])
      
      // Reset form
      setCreateFormData({
        employeeId: '',
        medicalCenter: '',
        medicalCenterAddress: '',
        medicalCenterPhone: '',
        appointmentDate: undefined,
        testType: 'initial',
        expiryDate: undefined,
        notes: '',
        cost: 0
      })
      
      setIsCreateDialogOpen(false)
      toast.success('Medical record created successfully')
    } catch (error) {
      toast.error('Failed to create medical record')
    } finally {
      setIsLoading(false)
    }
  }

  // Update record status
  const handleStatusUpdate = (recordId: string, newStatus: WorkPermitMedicalStatus) => {
    setMedicalRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const updatedRecord = { 
          ...record, 
          status: newStatus,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        
        // Set completion dates based on status
        switch (newStatus) {
          case 'medical-center-visited':
            updatedRecord.visitDate = new Date()
            break
          case 'medical-report-received':
            updatedRecord.reportDate = new Date()
            break
          case 'medical-uploaded-to-xpat':
            updatedRecord.uploadDate = new Date()
            break
          case 'medical-approved':
            updatedRecord.approvalDate = new Date()
            break
          case 'completed':
            updatedRecord.completionDate = new Date()
            break
        }
        
        return updatedRecord
      }
      return record
    }))
    
    toast.success(`Status updated to ${statusConfig[newStatus].label}`)
  }

  // Get status badge
  const getStatusBadge = (status: WorkPermitMedicalStatus) => {
    const config = statusConfig[status]
    const IconComponent = config.icon
    
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-current`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Permit Medical</h1>
          <p className="text-muted-foreground">
            Manage medical examinations and certificates for work permits
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Medical Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Medical Record</DialogTitle>
                <DialogDescription>
                  Add a new work permit medical examination record
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee *</Label>
                    <Select
                      value={createFormData.employeeId}
                      onValueChange={(value) => setCreateFormData(prev => ({
                        ...prev,
                        employeeId: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {employee.empId} • {employee.department}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="testType">Test Type *</Label>
                    <Select
                      value={createFormData.testType}
                      onValueChange={(value: any) => setCreateFormData(prev => ({
                        ...prev,
                        testType: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">Initial Medical</SelectItem>
                        <SelectItem value="renewal">Renewal Medical</SelectItem>
                        <SelectItem value="retest">Retest Medical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalCenter">Medical Center *</Label>
                  <Input
                    id="medicalCenter"
                    placeholder="ADK Hospital"
                    value={createFormData.medicalCenter}
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      medicalCenter: e.target.value
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Medical Center Address</Label>
                  <Input
                    id="address"
                    placeholder="Full address"
                    value={createFormData.medicalCenterAddress}
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      medicalCenterAddress: e.target.value
                    }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Medical Center Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+960 331 0441"
                      value={createFormData.medicalCenterPhone}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        medicalCenterPhone: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost (MVR)</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="750"
                      value={createFormData.cost}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        cost: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={createFormData.notes}
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRecord}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Record
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusCounts[status as WorkPermitMedicalStatus]
          const IconComponent = config.icon
          
          return (
            <Card 
              key={status} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                statusFilter === status ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status as WorkPermitMedicalStatus)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                <IconComponent className={`h-4 w-4 ${config.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={testTypeFilter} onValueChange={(value: any) => setTestTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="retest">Retest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredRecords.length} records
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Medical Center</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {record.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.empId} • {record.passportNumber}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.medicalCenter}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.medicalCenterPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {record.testType}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        {formatDate(record.appointmentDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.cost ? `MVR ${record.cost.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => {
                            setSelectedRecord(record)
                            setIsEditDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          
                          {statusConfig[record.status].canTransitionTo.map((newStatus) => {
                            const StatusIcon = statusConfig[newStatus].icon
                            return (
                              <DropdownMenuItem 
                                key={newStatus}
                                onClick={() => handleStatusUpdate(record.id, newStatus)}
                              >
                                <StatusIcon className="h-4 w-4 mr-2" />
                                {statusConfig[newStatus].label}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No medical records found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || testTypeFilter !== 'all'
                  ? "No records match your current filters."
                  : "Get started by adding your first medical record."}
              </p>
              {(!searchQuery && statusFilter === 'all' && testTypeFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Medical Record
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>
              View and manage medical examination details
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tests">Test Results</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Employee Information</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <div className="font-medium">{selectedRecord.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedRecord.empId} • {selectedRecord.department}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedRecord.passportNumber} • {selectedRecord.nationality}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Current Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedRecord.status)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Test Type</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="capitalize">
                          {selectedRecord.testType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Medical Center</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <div className="font-medium">{selectedRecord.medicalCenter}</div>
                        {selectedRecord.medicalCenterAddress && (
                          <div className="text-sm text-muted-foreground">
                            {selectedRecord.medicalCenterAddress}
                          </div>
                        )}
                        {selectedRecord.medicalCenterPhone && (
                          <div className="text-sm text-muted-foreground">
                            {selectedRecord.medicalCenterPhone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Cost</Label>
                      <div className="mt-1">
                        <span className="text-lg font-semibold">
                          MVR {selectedRecord.cost?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedRecord.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {selectedRecord.notes}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tests" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Required Tests</Label>
                    {Object.entries(selectedRecord.testResults).map(([test, completed]) => (
                      <div key={test} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Additional Information</Label>
                    {selectedRecord.doctorName && (
                      <div className="p-3 bg-muted rounded-lg">
                        <Label className="text-sm font-medium">Examining Doctor</Label>
                        <div>{selectedRecord.doctorName}</div>
                      </div>
                    )}
                    {selectedRecord.medicalCertificateNumber && (
                      <div className="p-3 bg-muted rounded-lg">
                        <Label className="text-sm font-medium">Certificate Number</Label>
                        <div className="font-mono">{selectedRecord.medicalCertificateNumber}</div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedRecord.documents).map(([doc, uploaded]) => (
                    <div key={doc} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">
                          {doc.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {uploaded ? 'Document uploaded' : 'Document pending'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploaded ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {[
                    { date: selectedRecord.createdAt, label: 'Record Created', completed: true },
                    { date: selectedRecord.appointmentDate, label: 'Appointment Scheduled', completed: !!selectedRecord.appointmentDate },
                    { date: selectedRecord.visitDate, label: 'Medical Center Visited', completed: !!selectedRecord.visitDate },
                    { date: selectedRecord.reportDate, label: 'Medical Report Received', completed: !!selectedRecord.reportDate },
                    { date: selectedRecord.uploadDate, label: 'Uploaded to XPAT', completed: !!selectedRecord.uploadDate },
                    { date: selectedRecord.approvalDate, label: 'Medical Approved', completed: !!selectedRecord.approvalDate },
                    { date: selectedRecord.completionDate, label: 'Process Completed', completed: !!selectedRecord.completionDate }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className={`w-3 h-3 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.date ? formatDate(item.date) : 'Pending'}
                        </div>
                      </div>
                      {item.completed && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}