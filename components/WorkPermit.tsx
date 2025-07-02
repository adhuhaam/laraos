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
  Shield,
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
  Heart,
  Archive,
  Send,
  DollarSign,
  Building2,
  Receipt,
  Calculator,
  CreditCard
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData } from './HRDataContext'
import { format, addDays, isAfter, isBefore, differenceInDays, addMonths, isWithinInterval } from 'date-fns'

// Work Permit Status Types
type WorkPermitStatus = 'pending' | 'expired' | 'expiring' | 'pending-payment' | 'collection-created' | 'paid-completed'

interface WorkPermitRecord {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  passportNumber: string
  nationality: string
  department: string
  designation: string
  status: WorkPermitStatus
  permitType: 'new' | 'renewal' | 'replacement' | 'amendment'
  permitNumber?: string
  applicationDate: Date
  issueDate?: Date
  expiryDate?: Date
  validityPeriod: number // months
  applicationFee: number
  governmentFee: number
  processingFee: number
  totalAmount: number
  monthlyCollectionAmount: number // MVR 350 per month per person
  collectionMonths: number
  collectionCreatedDate?: Date
  paymentDate?: Date
  paymentMethod?: 'cash' | 'bank-transfer' | 'check' | 'card'
  paymentReference?: string
  ministry: 'MED' | 'Health' | 'Tourism' | 'Defense' | 'Immigration'
  submissionMethod: 'online' | 'physical' | 'agent'
  trackingNumber?: string
  agentName?: string
  agentPhone?: string
  documents: {
    passport: boolean
    photo: boolean
    medicalCertificate: boolean
    employmentContract: boolean
    companyLicense: boolean
    bankGuarantee: boolean
  }
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface WorkPermitFormData {
  employeeId: string
  permitType: 'new' | 'renewal' | 'replacement' | 'amendment'
  applicationDate?: Date
  expiryDate?: Date
  validityPeriod: number
  applicationFee: number
  governmentFee: number
  processingFee: number
  ministry: 'MED' | 'Health' | 'Tourism' | 'Defense' | 'Immigration'
  submissionMethod: 'online' | 'physical' | 'agent'
  agentName: string
  agentPhone: string
  notes: string
}

interface CollectionCreationData {
  recordId: string
  monthlyAmount: number
  totalMonths: number
  totalAmount: number
  startDate: Date
  endDate: Date
  notes: string
}

// Status Configuration
const statusConfig: Record<WorkPermitStatus, {
  label: string
  color: string
  bgColor: string
  icon: React.ElementType
  description: string
  canTransitionTo: WorkPermitStatus[]
}> = {
  'pending': {
    label: 'Pending',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: Clock,
    description: 'Work permit application pending',
    canTransitionTo: ['pending-payment', 'expired']
  },
  'expired': {
    label: 'Expired',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
    description: 'Work permit has expired',
    canTransitionTo: ['pending']
  },
  'expiring': {
    label: 'Expiring',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: AlertTriangle,
    description: 'Work permit expiring within 30 days',
    canTransitionTo: ['pending', 'expired']
  },
  'pending-payment': {
    label: 'Pending Payment',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: CreditCard,
    description: 'Awaiting payment processing',
    canTransitionTo: ['collection-created', 'paid-completed']
  },
  'collection-created': {
    label: 'Collection Created',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: Receipt,
    description: 'Collection created for payment',
    canTransitionTo: ['paid-completed']
  },
  'paid-completed': {
    label: 'Paid/Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle,
    description: 'Work permit paid and completed',
    canTransitionTo: ['expiring', 'expired']
  }
}

// Ministry options
const ministryOptions = [
  { value: 'MED', label: 'Ministry of Economic Development' },
  { value: 'Health', label: 'Ministry of Health' },
  { value: 'Tourism', label: 'Ministry of Tourism' },
  { value: 'Defense', label: 'Ministry of Defense' },
  { value: 'Immigration', label: 'Immigration Department' }
]

export function WorkPermit() {
  const { employees } = useHRData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkPermitStatus | 'all'>('all')
  const [permitTypeFilter, setPermitTypeFilter] = useState<'all' | 'new' | 'renewal' | 'replacement' | 'amendment'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<WorkPermitRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [createFormData, setCreateFormData] = useState<WorkPermitFormData>({
    employeeId: '',
    permitType: 'new',
    applicationDate: undefined,
    expiryDate: undefined,
    validityPeriod: 12,
    applicationFee: 500,
    governmentFee: 1500,
    processingFee: 200,
    ministry: 'MED',
    submissionMethod: 'online',
    agentName: '',
    agentPhone: '',
    notes: ''
  })

  const [collectionData, setCollectionData] = useState<CollectionCreationData>({
    recordId: '',
    monthlyAmount: 350,
    totalMonths: 12,
    totalAmount: 4200,
    startDate: new Date(),
    endDate: addMonths(new Date(), 12),
    notes: ''
  })

  // Sample data - in real app this would come from backend
  const [workPermitRecords, setWorkPermitRecords] = useState<WorkPermitRecord[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Ahmed Hassan Al-Mansouri',
      empId: 'EMP001',
      passportNumber: 'MP1234567',
      nationality: 'Maldivian',
      department: 'Construction',
      designation: 'Project Manager',
      status: 'paid-completed',
      permitType: 'new',
      permitNumber: 'WP-2024-001',
      applicationDate: new Date('2024-01-15'),
      issueDate: new Date('2024-02-01'),
      expiryDate: new Date('2025-02-01'),
      validityPeriod: 12,
      applicationFee: 500,
      governmentFee: 1500,
      processingFee: 200,
      totalAmount: 2200,
      monthlyCollectionAmount: 350,
      collectionMonths: 12,
      collectionCreatedDate: new Date('2024-01-10'),
      paymentDate: new Date('2024-01-20'),
      paymentMethod: 'bank-transfer',
      paymentReference: 'BT-2024-WP-001',
      ministry: 'MED',
      submissionMethod: 'online',
      trackingNumber: 'TRK-2024-001234',
      agentName: 'Ibrahim Waheed',
      agentPhone: '+960 777 1111',
      documents: {
        passport: true,
        photo: true,
        medicalCertificate: true,
        employmentContract: true,
        companyLicense: true,
        bankGuarantee: true
      },
      notes: 'New work permit application completed successfully.',
      createdAt: '2024-01-05',
      updatedAt: '2024-02-01',
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
      status: 'collection-created',
      permitType: 'renewal',
      permitNumber: 'WP-2024-002',
      applicationDate: new Date('2024-07-10'),
      expiryDate: new Date('2025-07-10'),
      validityPeriod: 12,
      applicationFee: 300,
      governmentFee: 1200,
      processingFee: 150,
      totalAmount: 1650,
      monthlyCollectionAmount: 350,
      collectionMonths: 12,
      collectionCreatedDate: new Date('2024-07-15'),
      ministry: 'MED',
      submissionMethod: 'agent',
      trackingNumber: 'TRK-2024-002345',
      agentName: 'Aminath Shafeeu',
      agentPhone: '+960 777 2222',
      documents: {
        passport: true,
        photo: true,
        medicalCertificate: true,
        employmentContract: true,
        companyLicense: false,
        bankGuarantee: true
      },
      notes: 'Renewal work permit. Collection created for payment.',
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
      permitType: 'new',
      applicationDate: new Date('2024-12-01'),
      validityPeriod: 12,
      applicationFee: 500,
      governmentFee: 1500,
      processingFee: 200,
      totalAmount: 2200,
      monthlyCollectionAmount: 350,
      collectionMonths: 12,
      ministry: 'MED',
      submissionMethod: 'online',
      trackingNumber: 'TRK-2024-003456',
      documents: {
        passport: true,
        photo: false,
        medicalCertificate: false,
        employmentContract: true,
        companyLicense: false,
        bankGuarantee: false
      },
      notes: 'New work permit application submitted. Awaiting documentation.',
      createdAt: '2024-11-25',
      updatedAt: '2024-12-01',
      createdBy: 'HR Manager'
    }
  ])

  // Calculate status based on dates and payments
  const calculateStatus = (record: WorkPermitRecord): WorkPermitStatus => {
    const today = new Date()
    const thirtyDaysFromNow = addDays(today, 30)
    
    // If payment is completed, it's paid-completed
    if (record.paymentDate) {
      // Check if expiring soon or expired
      if (record.expiryDate) {
        if (isAfter(today, record.expiryDate)) {
          return 'expired'
        }
        if (isWithinInterval(record.expiryDate, { start: today, end: thirtyDaysFromNow })) {
          return 'expiring'
        }
      }
      return 'paid-completed'
    }
    
    // If collection is created but not paid
    if (record.collectionCreatedDate) {
      return 'collection-created'
    }
    
    // If expired
    if (record.expiryDate && isAfter(today, record.expiryDate)) {
      return 'expired'
    }
    
    // If expiring soon (within 30 days)
    if (record.expiryDate && isWithinInterval(record.expiryDate, { start: today, end: thirtyDaysFromNow })) {
      return 'expiring'
    }
    
    // If pending payment processing
    if (record.status === 'pending-payment') {
      return 'pending-payment'
    }
    
    // Default to pending
    return 'pending'
  }

  // Update statuses based on current dates
  const recordsWithUpdatedStatus = useMemo(() => {
    return workPermitRecords.map(record => ({
      ...record,
      status: calculateStatus(record)
    }))
  }, [workPermitRecords])

  // Filter records
  const filteredRecords = useMemo(() => {
    return recordsWithUpdatedStatus.filter(record => {
      const matchesSearch = searchQuery === '' || 
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.permitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesPermitType = permitTypeFilter === 'all' || record.permitType === permitTypeFilter
      
      return matchesSearch && matchesStatus && matchesPermitType
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [recordsWithUpdatedStatus, searchQuery, statusFilter, permitTypeFilter])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<WorkPermitStatus, number> = {
      'pending': 0,
      'expired': 0,
      'expiring': 0,
      'pending-payment': 0,
      'collection-created': 0,
      'paid-completed': 0
    }
    
    recordsWithUpdatedStatus.forEach(record => {
      counts[record.status]++
    })
    
    return counts
  }, [recordsWithUpdatedStatus])

  // Create new work permit record
  const handleCreateRecord = async () => {
    if (!createFormData.employeeId || !createFormData.applicationDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const employee = employees.find(emp => emp.id === createFormData.employeeId)
      if (!employee) {
        throw new Error('Employee not found')
      }

      const totalAmount = createFormData.applicationFee + createFormData.governmentFee + createFormData.processingFee
      const collectionMonths = createFormData.validityPeriod
      
      const newRecord: WorkPermitRecord = {
        id: Date.now().toString(),
        employeeId: createFormData.employeeId,
        employeeName: employee.name,
        empId: employee.empId,
        passportNumber: employee.passportNumber,
        nationality: employee.nationality,
        department: employee.department,
        designation: employee.designation,
        status: 'pending',
        permitType: createFormData.permitType,
        applicationDate: createFormData.applicationDate,
        expiryDate: createFormData.expiryDate,
        validityPeriod: createFormData.validityPeriod,
        applicationFee: createFormData.applicationFee,
        governmentFee: createFormData.governmentFee,
        processingFee: createFormData.processingFee,
        totalAmount,
        monthlyCollectionAmount: 350,
        collectionMonths,
        ministry: createFormData.ministry,
        submissionMethod: createFormData.submissionMethod,
        trackingNumber: `TRK-${Date.now()}`,
        agentName: createFormData.agentName,
        agentPhone: createFormData.agentPhone,
        documents: {
          passport: false,
          photo: false,
          medicalCertificate: false,
          employmentContract: false,
          companyLicense: false,
          bankGuarantee: false
        },
        notes: createFormData.notes,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Current User'
      }

      setWorkPermitRecords(prev => [newRecord, ...prev])
      
      // Reset form
      setCreateFormData({
        employeeId: '',
        permitType: 'new',
        applicationDate: undefined,
        expiryDate: undefined,
        validityPeriod: 12,
        applicationFee: 500,
        governmentFee: 1500,
        processingFee: 200,
        ministry: 'MED',
        submissionMethod: 'online',
        agentName: '',
        agentPhone: '',
        notes: ''
      })
      
      setIsCreateDialogOpen(false)
      toast.success('Work permit record created successfully')
    } catch (error) {
      toast.error('Failed to create work permit record')
    } finally {
      setIsLoading(false)
    }
  }

  // Create collection for work permit
  const handleCreateCollection = async () => {
    if (!selectedRecord) return

    setIsLoading(true)

    try {
      setWorkPermitRecords(prev => prev.map(record => {
        if (record.id === selectedRecord.id) {
          return {
            ...record,
            collectionCreatedDate: new Date(),
            monthlyCollectionAmount: collectionData.monthlyAmount,
            collectionMonths: collectionData.totalMonths,
            updatedAt: new Date().toISOString().split('T')[0],
            notes: record.notes ? `${record.notes}\n\nCollection created: ${collectionData.notes}` : `Collection created: ${collectionData.notes}`
          }
        }
        return record
      }))
      
      setIsCollectionDialogOpen(false)
      setSelectedRecord(null)
      toast.success('Collection created successfully')
    } catch (error) {
      toast.error('Failed to create collection')
    } finally {
      setIsLoading(false)
    }
  }

  // Update record status
  const handleStatusUpdate = (recordId: string, newStatus: WorkPermitStatus) => {
    setWorkPermitRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const updatedRecord = { 
          ...record, 
          status: newStatus,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        
        // Set completion dates based on status
        switch (newStatus) {
          case 'paid-completed':
            updatedRecord.paymentDate = new Date()
            updatedRecord.paymentMethod = 'bank-transfer'
            updatedRecord.paymentReference = `BT-${Date.now()}`
            break
          case 'collection-created':
            updatedRecord.collectionCreatedDate = new Date()
            break
        }
        
        return updatedRecord
      }
      return record
    }))
    
    toast.success(`Status updated to ${statusConfig[newStatus].label}`)
  }

  // Get status badge
  const getStatusBadge = (status: WorkPermitStatus) => {
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

  // Calculate collection total when parameters change
  const updateCollectionTotal = (months: number, monthlyAmount: number) => {
    const total = months * monthlyAmount
    setCollectionData(prev => ({
      ...prev,
      totalMonths: months,
      monthlyAmount,
      totalAmount: total,
      endDate: addMonths(prev.startDate, months)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Permit Management</h1>
          <p className="text-muted-foreground">
            Manage work permit applications, renewals, and collections
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
                Add Work Permit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Work Permit Record</DialogTitle>
                <DialogDescription>
                  Add a new work permit application record
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="fees">Fees & Ministry</TabsTrigger>
                  <TabsTrigger value="agent">Agent & Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
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
                      <Label htmlFor="permitType">Permit Type *</Label>
                      <Select
                        value={createFormData.permitType}
                        onValueChange={(value: any) => setCreateFormData(prev => ({
                          ...prev,
                          permitType: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Work Permit</SelectItem>
                          <SelectItem value="renewal">Renewal</SelectItem>
                          <SelectItem value="replacement">Replacement</SelectItem>
                          <SelectItem value="amendment">Amendment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validityPeriod">Validity Period (Months)</Label>
                      <Input
                        id="validityPeriod"
                        type="number"
                        placeholder="12"
                        value={createFormData.validityPeriod}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          validityPeriod: parseInt(e.target.value) || 12
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="submissionMethod">Submission Method</Label>
                      <Select
                        value={createFormData.submissionMethod}
                        onValueChange={(value: any) => setCreateFormData(prev => ({
                          ...prev,
                          submissionMethod: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="physical">Physical</SelectItem>
                          <SelectItem value="agent">Through Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="fees" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicationFee">Application Fee (MVR)</Label>
                      <Input
                        id="applicationFee"
                        type="number"
                        value={createFormData.applicationFee}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          applicationFee: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="governmentFee">Government Fee (MVR)</Label>
                      <Input
                        id="governmentFee"
                        type="number"
                        value={createFormData.governmentFee}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          governmentFee: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="processingFee">Processing Fee (MVR)</Label>
                      <Input
                        id="processingFee"
                        type="number"
                        value={createFormData.processingFee}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          processingFee: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ministry">Ministry *</Label>
                    <Select
                      value={createFormData.ministry}
                      onValueChange={(value: any) => setCreateFormData(prev => ({
                        ...prev,
                        ministry: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ministryOptions.map((ministry) => (
                          <SelectItem key={ministry.value} value={ministry.value}>
                            {ministry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Fee Summary</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Application Fee:</span>
                        <span>MVR {createFormData.applicationFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Government Fee:</span>
                        <span>MVR {createFormData.governmentFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee:</span>
                        <span>MVR {createFormData.processingFee}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>MVR {createFormData.applicationFee + createFormData.governmentFee + createFormData.processingFee}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Monthly Collection:</span>
                        <span>MVR 350 × {createFormData.validityPeriod} months</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="agent" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name</Label>
                      <Input
                        id="agentName"
                        placeholder="Enter agent name"
                        value={createFormData.agentName}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          agentName: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agentPhone">Agent Phone</Label>
                      <Input
                        id="agentPhone"
                        placeholder="+960 777 1234"
                        value={createFormData.agentPhone}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          agentPhone: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this work permit application..."
                      value={createFormData.notes}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRecord} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Record
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics - 6 Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.expired}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.expiring}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts['pending-payment']}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Created</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statusCounts['collection-created']}</div>
            <p className="text-xs text-muted-foreground">Ready for payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid/Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts['paid-completed']}</div>
            <p className="text-xs text-muted-foreground">Process complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work permits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="expiring">Expiring</SelectItem>
                  <SelectItem value="pending-payment">Pending Payment</SelectItem>
                  <SelectItem value="collection-created">Collection Created</SelectItem>
                  <SelectItem value="paid-completed">Paid/Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={permitTypeFilter} onValueChange={(value: any) => setPermitTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                  <SelectItem value="amendment">Amendment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Badge variant="outline" className="text-sm">
              {filteredRecords.length} records
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Work Permit Records Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Permit Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fees & Collection</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {record.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.empId} • {record.nationality}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium capitalize">
                        {record.permitType} Work Permit
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.permitNumber || 'Pending'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.trackingNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.status)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        MVR {record.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Collection: MVR {record.monthlyCollectionAmount} × {record.collectionMonths}m
                      </div>
                      {record.collectionCreatedDate && (
                        <div className="text-xs text-green-600">
                          Collection created
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div>Applied: {formatDate(record.applicationDate)}</div>
                      {record.expiryDate && (
                        <div className={`${
                          record.status === 'expiring' 
                            ? 'text-yellow-600 font-medium' 
                            : record.status === 'expired'
                            ? 'text-red-600 font-medium'
                            : ''
                        }`}>
                          Expires: {formatDate(record.expiryDate)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div>{formatDate(record.updatedAt)}</div>
                      <div className="text-muted-foreground">
                        by {record.createdBy}
                      </div>
                    </div>
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
                          setSelectedRecord(record)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {record.status === 'pending-payment' && !record.collectionCreatedDate && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedRecord(record)
                            setIsCollectionDialogOpen(true)
                          }}>
                            <Receipt className="h-4 w-4 mr-2" />
                            Create Collection
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <DropdownMenuItem 
                            key={status}
                            onClick={() => handleStatusUpdate(record.id, status as WorkPermitStatus)}
                            disabled={record.status === status}
                          >
                            <config.icon className="h-4 w-4 mr-2" />
                            {config.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Collection Creation Dialog */}
      <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create collection for {selectedRecord?.employeeName} - {selectedRecord?.permitType} work permit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyAmount">Monthly Amount (MVR)</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  value={collectionData.monthlyAmount}
                  onChange={(e) => {
                    const amount = parseInt(e.target.value) || 350
                    updateCollectionTotal(collectionData.totalMonths, amount)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMonths">Total Months</Label>
                <Input
                  id="totalMonths"
                  type="number"
                  value={collectionData.totalMonths}
                  onChange={(e) => {
                    const months = parseInt(e.target.value) || 12
                    updateCollectionTotal(months, collectionData.monthlyAmount)
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Collection Summary</Label>
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Monthly Collection:</div>
                    <div>MVR {collectionData.monthlyAmount}</div>
                  </div>
                  <div>
                    <div className="font-medium">Duration:</div>
                    <div>{collectionData.totalMonths} months</div>
                  </div>
                  <div>
                    <div className="font-medium">Start Date:</div>
                    <div>{formatDate(collectionData.startDate)}</div>
                  </div>
                  <div>
                    <div className="font-medium">End Date:</div>
                    <div>{formatDate(collectionData.endDate)}</div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="text-lg font-bold">
                  Total Collection: MVR {collectionData.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectionNotes">Notes</Label>
              <Textarea 
                id="collectionNotes" 
                placeholder="Additional notes about this collection..."
                value={collectionData.notes}
                onChange={(e) => setCollectionData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Collection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}