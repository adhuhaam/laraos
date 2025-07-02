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
  CreditCard,
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
  Send,
  DollarSign,
  Building2,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData } from './HRDataContext'
import { format, addDays, isAfter, isBefore, differenceInDays, addMonths, isWithinInterval } from 'date-fns'

// Insurance Status Types
type InsuranceStatus = 'pending' | 'expired' | 'expiring' | 'paid-completed'

interface InsuranceRecord {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  passportNumber: string
  nationality: string
  department: string
  designation: string
  status: InsuranceStatus
  policyType: 'health' | 'life' | 'disability' | 'travel' | 'comprehensive'
  insuranceProvider: string
  policyNumber: string
  issueDate: Date
  expiryDate: Date
  premiumAmount: number
  coverageAmount: number
  beneficiaryName?: string
  beneficiaryRelation?: string
  beneficiaryPhone?: string
  agentName?: string
  agentPhone?: string
  agentEmail?: string
  paymentMethod: 'cash' | 'bank-transfer' | 'check' | 'card'
  paymentReference?: string
  paymentDate?: Date
  renewalRequired: boolean
  renewalNotified: boolean
  documents: {
    policyDocument: boolean
    paymentReceipt: boolean
    beneficiaryForm: boolean
    medicalReport: boolean
  }
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface InsuranceFormData {
  employeeId: string
  policyType: 'health' | 'life' | 'disability' | 'travel' | 'comprehensive'
  insuranceProvider: string
  policyNumber: string
  issueDate?: Date
  expiryDate?: Date
  premiumAmount: number
  coverageAmount: number
  beneficiaryName: string
  beneficiaryRelation: string
  beneficiaryPhone: string
  agentName: string
  agentPhone: string
  agentEmail: string
  paymentMethod: 'cash' | 'bank-transfer' | 'check' | 'card'
  paymentReference: string
  notes: string
}

// Status Configuration
const statusConfig: Record<InsuranceStatus, {
  label: string
  color: string
  bgColor: string
  icon: React.ElementType
  description: string
}> = {
  'pending': {
    label: 'Pending',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: Clock,
    description: 'Insurance application pending'
  },
  'expired': {
    label: 'Expired',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
    description: 'Insurance policy has expired'
  },
  'expiring': {
    label: 'Expiring',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: AlertTriangle,
    description: 'Insurance expiring within 30 days'
  },
  'paid-completed': {
    label: 'Paid/Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle,
    description: 'Insurance paid and active'
  }
}

// Insurance providers
const insuranceProviders = [
  'Allied Insurance Company of the Maldives',
  'Maldives Insurance Company',
  'Blue Water Insurance',
  'Hayat Insurance',
  'MTCC Insurance',
  'AIG Insurance',
  'Allianz Insurance',
  'Other'
]

export function XpatInsurance() {
  const { employees } = useHRData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InsuranceStatus | 'all'>('all')
  const [policyTypeFilter, setpolicyTypeFilter] = useState<'all' | 'health' | 'life' | 'disability' | 'travel' | 'comprehensive'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<InsuranceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [createFormData, setCreateFormData] = useState<InsuranceFormData>({
    employeeId: '',
    policyType: 'health',
    insuranceProvider: '',
    policyNumber: '',
    issueDate: undefined,
    expiryDate: undefined,
    premiumAmount: 0,
    coverageAmount: 0,
    beneficiaryName: '',
    beneficiaryRelation: '',
    beneficiaryPhone: '',
    agentName: '',
    agentPhone: '',
    agentEmail: '',
    paymentMethod: 'bank-transfer',
    paymentReference: '',
    notes: ''
  })

  // Sample data - in real app this would come from backend
  const [insuranceRecords, setInsuranceRecords] = useState<InsuranceRecord[]>([
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
      policyType: 'comprehensive',
      insuranceProvider: 'Allied Insurance Company of the Maldives',
      policyNumber: 'AICM-2024-001-COMP',
      issueDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-15'),
      premiumAmount: 15000,
      coverageAmount: 500000,
      beneficiaryName: 'Fatima Hassan',
      beneficiaryRelation: 'Spouse',
      beneficiaryPhone: '+960 777 5678',
      agentName: 'Ibrahim Mohamed',
      agentPhone: '+960 777 1111',
      agentEmail: 'ibrahim@allied.mv',
      paymentMethod: 'bank-transfer',
      paymentReference: 'BT-2024-001',
      paymentDate: new Date('2024-01-10'),
      renewalRequired: false,
      renewalNotified: false,
      documents: {
        policyDocument: true,
        paymentReceipt: true,
        beneficiaryForm: true,
        medicalReport: true
      },
      notes: 'Comprehensive coverage including health, life, and disability.',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-15',
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
      status: 'expiring',
      policyType: 'health',
      insuranceProvider: 'Maldives Insurance Company',
      policyNumber: 'MIC-2024-002-HLTH',
      issueDate: new Date('2024-01-20'),
      expiryDate: new Date('2024-12-25'),
      premiumAmount: 8000,
      coverageAmount: 250000,
      beneficiaryName: 'Priya Sharma',
      beneficiaryRelation: 'Wife',
      beneficiaryPhone: '+91 98765 43210',
      agentName: 'Aminath Shafeeu',
      agentPhone: '+960 777 2222',
      agentEmail: 'aminath@mic.mv',
      paymentMethod: 'bank-transfer',
      paymentReference: 'BT-2024-002',
      paymentDate: new Date('2024-01-18'),
      renewalRequired: true,
      renewalNotified: true,
      documents: {
        policyDocument: true,
        paymentReceipt: true,
        beneficiaryForm: true,
        medicalReport: false
      },
      notes: 'Health insurance coverage. Renewal required soon.',
      createdAt: '2024-01-15',
      updatedAt: '2024-12-01',
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
      policyType: 'life',
      insuranceProvider: 'Blue Water Insurance',
      policyNumber: 'BWI-2024-003-LIFE',
      issueDate: new Date('2024-12-01'),
      expiryDate: new Date('2025-12-01'),
      premiumAmount: 6000,
      coverageAmount: 300000,
      beneficiaryName: 'Fatima Al-Zahra',
      beneficiaryRelation: 'Wife',
      beneficiaryPhone: '+880 171 234567',
      agentName: 'Hassan Ali',
      agentPhone: '+960 777 3333',
      agentEmail: 'hassan@bluewater.mv',
      paymentMethod: 'bank-transfer',
      paymentReference: 'BT-2024-003',
      renewalRequired: false,
      renewalNotified: false,
      documents: {
        policyDocument: true,
        paymentReceipt: false,
        beneficiaryForm: true,
        medicalReport: true
      },
      notes: 'Life insurance application pending payment confirmation.',
      createdAt: '2024-11-25',
      updatedAt: '2024-12-01',
      createdBy: 'HR Manager'
    }
  ])

  // Calculate status based on dates
  const calculateStatus = (record: InsuranceRecord): InsuranceStatus => {
    const today = new Date()
    const thirtyDaysFromNow = addDays(today, 30)
    
    // If payment is not made, it's pending
    if (!record.paymentDate) {
      return 'pending'
    }
    
    // If expired
    if (isAfter(today, record.expiryDate)) {
      return 'expired'
    }
    
    // If expiring soon (within 30 days)
    if (isWithinInterval(record.expiryDate, { start: today, end: thirtyDaysFromNow })) {
      return 'expiring'
    }
    
    // If paid and not expiring soon
    return 'paid-completed'
  }

  // Update statuses based on current dates
  const recordsWithUpdatedStatus = useMemo(() => {
    return insuranceRecords.map(record => ({
      ...record,
      status: calculateStatus(record)
    }))
  }, [insuranceRecords])

  // Filter records
  const filteredRecords = useMemo(() => {
    return recordsWithUpdatedStatus.filter(record => {
      const matchesSearch = searchQuery === '' || 
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.insuranceProvider.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesPolicyType = policyTypeFilter === 'all' || record.policyType === policyTypeFilter
      
      return matchesSearch && matchesStatus && matchesPolicyType
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [recordsWithUpdatedStatus, searchQuery, statusFilter, policyTypeFilter])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<InsuranceStatus, number> = {
      'pending': 0,
      'expired': 0,
      'expiring': 0,
      'paid-completed': 0
    }
    
    recordsWithUpdatedStatus.forEach(record => {
      counts[record.status]++
    })
    
    return counts
  }, [recordsWithUpdatedStatus])

  // Create new insurance record
  const handleCreateRecord = async () => {
    if (!createFormData.employeeId || !createFormData.insuranceProvider || !createFormData.policyNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const employee = employees.find(emp => emp.id === createFormData.employeeId)
      if (!employee) {
        throw new Error('Employee not found')
      }

      const newRecord: InsuranceRecord = {
        id: Date.now().toString(),
        employeeId: createFormData.employeeId,
        employeeName: employee.name,
        empId: employee.empId,
        passportNumber: employee.passportNumber,
        nationality: employee.nationality,
        department: employee.department,
        designation: employee.designation,
        status: 'pending',
        policyType: createFormData.policyType,
        insuranceProvider: createFormData.insuranceProvider,
        policyNumber: createFormData.policyNumber,
        issueDate: createFormData.issueDate || new Date(),
        expiryDate: createFormData.expiryDate || addMonths(new Date(), 12),
        premiumAmount: createFormData.premiumAmount,
        coverageAmount: createFormData.coverageAmount,
        beneficiaryName: createFormData.beneficiaryName,
        beneficiaryRelation: createFormData.beneficiaryRelation,
        beneficiaryPhone: createFormData.beneficiaryPhone,
        agentName: createFormData.agentName,
        agentPhone: createFormData.agentPhone,
        agentEmail: createFormData.agentEmail,
        paymentMethod: createFormData.paymentMethod,
        paymentReference: createFormData.paymentReference,
        renewalRequired: false,
        renewalNotified: false,
        documents: {
          policyDocument: false,
          paymentReceipt: false,
          beneficiaryForm: false,
          medicalReport: false
        },
        notes: createFormData.notes,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Current User'
      }

      setInsuranceRecords(prev => [newRecord, ...prev])
      
      // Reset form
      setCreateFormData({
        employeeId: '',
        policyType: 'health',
        insuranceProvider: '',
        policyNumber: '',
        issueDate: undefined,
        expiryDate: undefined,
        premiumAmount: 0,
        coverageAmount: 0,
        beneficiaryName: '',
        beneficiaryRelation: '',
        beneficiaryPhone: '',
        agentName: '',
        agentPhone: '',
        agentEmail: '',
        paymentMethod: 'bank-transfer',
        paymentReference: '',
        notes: ''
      })
      
      setIsCreateDialogOpen(false)
      toast.success('Insurance record created successfully')
    } catch (error) {
      toast.error('Failed to create insurance record')
    } finally {
      setIsLoading(false)
    }
  }

  // Mark payment as completed
  const handleMarkPaid = (recordId: string) => {
    setInsuranceRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        return {
          ...record,
          paymentDate: new Date(),
          updatedAt: new Date().toISOString().split('T')[0]
        }
      }
      return record
    }))
    
    toast.success('Payment marked as completed')
  }

  // Get status badge
  const getStatusBadge = (status: InsuranceStatus) => {
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

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date()
    const days = differenceInDays(expiryDate, today)
    
    if (days < 0) return 'Expired'
    if (days === 0) return 'Expires today'
    if (days === 1) return 'Expires tomorrow'
    if (days <= 30) return `Expires in ${days} days`
    return `${days} days remaining`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">XPAT Insurance</h1>
          <p className="text-muted-foreground">
            Manage expatriate insurance policies and coverage
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
                Add Insurance Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Insurance Record</DialogTitle>
                <DialogDescription>
                  Add a new expatriate insurance policy record
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="policy">Policy Details</TabsTrigger>
                  <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
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
                      <Label htmlFor="policyType">Policy Type *</Label>
                      <Select
                        value={createFormData.policyType}
                        onValueChange={(value: any) => setCreateFormData(prev => ({
                          ...prev,
                          policyType: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="health">Health Insurance</SelectItem>
                          <SelectItem value="life">Life Insurance</SelectItem>
                          <SelectItem value="disability">Disability Insurance</SelectItem>
                          <SelectItem value="travel">Travel Insurance</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider">Insurance Provider *</Label>
                    <Select
                      value={createFormData.insuranceProvider}
                      onValueChange={(value) => setCreateFormData(prev => ({
                        ...prev,
                        insuranceProvider: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select insurance provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number *</Label>
                    <Input
                      id="policyNumber"
                      placeholder="AICM-2024-001-COMP"
                      value={createFormData.policyNumber}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        policyNumber: e.target.value
                      }))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="policy" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="premiumAmount">Premium Amount (MVR) *</Label>
                      <Input
                        id="premiumAmount"
                        type="number"
                        placeholder="15000"
                        value={createFormData.premiumAmount}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          premiumAmount: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coverageAmount">Coverage Amount (MVR) *</Label>
                      <Input
                        id="coverageAmount"
                        type="number"
                        placeholder="500000"
                        value={createFormData.coverageAmount}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          coverageAmount: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name</Label>
                      <Input
                        id="agentName"
                        placeholder="Ibrahim Mohamed"
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
                        placeholder="+960 777 1111"
                        value={createFormData.agentPhone}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          agentPhone: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agentEmail">Agent Email</Label>
                      <Input
                        id="agentEmail"
                        type="email"
                        placeholder="agent@insurance.mv"
                        value={createFormData.agentEmail}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          agentEmail: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="beneficiary" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                      <Input
                        id="beneficiaryName"
                        placeholder="Fatima Hassan"
                        value={createFormData.beneficiaryName}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          beneficiaryName: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryRelation">Relationship</Label>
                      <Input
                        id="beneficiaryRelation"
                        placeholder="Spouse"
                        value={createFormData.beneficiaryRelation}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          beneficiaryRelation: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="beneficiaryPhone">Beneficiary Phone</Label>
                    <Input
                      id="beneficiaryPhone"
                      placeholder="+960 777 5678"
                      value={createFormData.beneficiaryPhone}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        beneficiaryPhone: e.target.value
                      }))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="payment" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={createFormData.paymentMethod}
                        onValueChange={(value: any) => setCreateFormData(prev => ({
                          ...prev,
                          paymentMethod: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paymentReference">Payment Reference</Label>
                      <Input
                        id="paymentReference"
                        placeholder="BT-2024-001"
                        value={createFormData.paymentReference}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          paymentReference: e.target.value
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
                </TabsContent>
              </Tabs>
              
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusCounts[status as InsuranceStatus]
          const IconComponent = config.icon
          
          return (
            <Card 
              key={status} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                statusFilter === status ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status as InsuranceStatus)}
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
              
              <Select value={policyTypeFilter} onValueChange={(value: any) => setpolicyTypeFilter(value)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Policy Types</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="life">Life</SelectItem>
                  <SelectItem value="disability">Disability</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
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
                  <TableHead>Policy Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Premium</TableHead>
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
                        <div className="font-medium capitalize">{record.policyType} Insurance</div>
                        <div className="text-sm text-muted-foreground">
                          {record.policyNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {record.insuranceProvider}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(record.status)}
                        <div className="text-xs text-muted-foreground">
                          {getDaysUntilExpiry(record.expiryDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        {formatDate(record.issueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        {formatDate(record.expiryDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          MVR {record.premiumAmount.toLocaleString()}
                        </span>
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => {
                            setSelectedRecord(record)
                            setIsEditDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {record.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleMarkPaid(record.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download Policy
                          </DropdownMenuItem>
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
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No insurance records found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || policyTypeFilter !== 'all'
                  ? "No records match your current filters."
                  : "Get started by adding your first insurance record."}
              </p>
              {(!searchQuery && statusFilter === 'all' && policyTypeFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Insurance Record
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
            <DialogTitle>Insurance Record Details</DialogTitle>
            <DialogDescription>
              View and manage insurance policy details
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <Tabs defaultValue="policy" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="policy">Policy Info</TabsTrigger>
                <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="policy" className="space-y-4 mt-4">
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
                      <Label className="text-sm font-medium">Policy Type</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="capitalize">
                          {selectedRecord.policyType} Insurance
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Insurance Provider</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <div className="font-medium">{selectedRecord.insuranceProvider}</div>
                        <div className="text-sm text-muted-foreground">
                          Policy: {selectedRecord.policyNumber}
                        </div>
                        {selectedRecord.agentName && (
                          <div className="text-sm text-muted-foreground">
                            Agent: {selectedRecord.agentName}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Coverage Details</Label>
                      <div className="mt-1 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Premium Amount:</span>
                          <span className="font-semibold">MVR {selectedRecord.premiumAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Coverage Amount:</span>
                          <span className="font-semibold">MVR {selectedRecord.coverageAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Issue Date</Label>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {formatDate(selectedRecord.issueDate)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {formatDate(selectedRecord.expiryDate)}
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
              
              <TabsContent value="beneficiary" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Beneficiary Information</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      <div className="font-medium">{selectedRecord.beneficiaryName || 'Not specified'}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedRecord.beneficiaryRelation || 'Relationship not specified'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedRecord.beneficiaryPhone || 'Phone not provided'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Agent Information</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      <div className="font-medium">{selectedRecord.agentName || 'Not assigned'}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedRecord.agentPhone || 'Phone not provided'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedRecord.agentEmail || 'Email not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <div className="mt-1 p-2 bg-muted rounded capitalize">
                      {selectedRecord.paymentMethod.replace('-', ' ')}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Reference</Label>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {selectedRecord.paymentReference || 'Not provided'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Payment Date</Label>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {selectedRecord.paymentDate ? formatDate(selectedRecord.paymentDate) : 'Payment pending'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Status</Label>
                    <div className="mt-1">
                      {selectedRecord.paymentDate ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Premium Amount:</span>
                    <span className="text-lg font-bold">MVR {selectedRecord.premiumAmount.toLocaleString()}</span>
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
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}