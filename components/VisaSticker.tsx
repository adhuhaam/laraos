import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
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
import { 
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileX,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  RefreshCw,
  Plus,
  Download,
  Calendar,
  User,
  Upload,
  Send,
  Package,
  AlertCircle,
  FileText,
  Hourglass,
  Archive
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { format, addDays, isBefore, isAfter } from 'date-fns'
import { useHRData } from './HRDataContext'

// VISA Sticker Types
interface VisaStickerRecord {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  nationality: string
  passportNumber: string
  visaType: 'work-visa' | 'tourist-visa' | 'business-visa' | 'residence-visa'
  status: 'pending' | 'expired' | 'expiring-soon' | 'incomplete' | 'pending-approval' | 'pending-submission' | 'pending-collection' | 'completed'
  applicationDate: Date
  submissionDate?: Date
  approvalDate?: Date
  collectionDate?: Date
  completionDate?: Date
  expiryDate?: Date
  visaNumber?: string
  stickerNumber?: string
  fees: {
    applicationFee: number
    processingFee: number
    stickerFee: number
    totalPaid: number
  }
  documents: {
    application: boolean
    passport: boolean
    photo: boolean
    workPermit: boolean
    medicalCertificate: boolean
    insurance: boolean
  }
  notes?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedOfficer: string
  createdAt: Date
  updatedAt: Date
}

interface CreateVisaRequest {
  employeeId: string
  visaType: string
  priority: string
  notes?: string
}

// VISA Status Configuration with 8 statuses
const visaStatusConfig = {
  'pending': {
    label: 'Pending',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    icon: Clock,
    description: 'VISA application initiated, waiting for documents'
  },
  'expired': {
    label: 'Expired',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
    description: 'VISA has expired and needs renewal'
  },
  'expiring-soon': {
    label: 'Expiring Soon',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: AlertTriangle,
    description: 'VISA expires within 30 days'
  },
  'incomplete': {
    label: 'Incomplete',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: FileX,
    description: 'Missing required documents or information'
  },
  'pending-approval': {
    label: 'Pending Approval',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Hourglass,
    description: 'Submitted to authorities, awaiting approval'
  },
  'pending-submission': {
    label: 'Pending Submission',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: Send,
    description: 'Ready for submission to immigration office'
  },
  'pending-collection': {
    label: 'Pending Collection',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    icon: Package,
    description: 'VISA approved, ready for collection'
  },
  'completed': {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle,
    description: 'VISA sticker collected and process completed'
  }
}

// Priority Configuration
const priorityConfig = {
  'low': {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30'
  },
  'medium': {
    label: 'Medium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30'
  },
  'high': {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30'
  },
  'urgent': {
    label: 'Urgent',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30'
  }
}

export function VisaSticker() {
  const { employees } = useHRData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'expired' | 'expiring-soon' | 'incomplete' | 'pending-approval' | 'pending-submission' | 'pending-collection' | 'completed'>('all')
  const [visaTypeFilter, setVisaTypeFilter] = useState<'all' | 'work-visa' | 'tourist-visa' | 'business-visa' | 'residence-visa'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVisa, setSelectedVisa] = useState<VisaStickerRecord | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Sample VISA sticker records with new 8-status system
  const [visaRecords, setVisaRecords] = useState<VisaStickerRecord[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Ahmed Hassan Al-Mansouri',
      empId: 'EMP001',
      nationality: 'Bangladeshi',
      passportNumber: 'BD1234567',
      visaType: 'work-visa',
      status: 'completed',
      applicationDate: new Date('2024-11-01'),
      submissionDate: new Date('2024-11-05'),
      approvalDate: new Date('2024-12-01'),
      collectionDate: new Date('2024-12-15'),
      completionDate: new Date('2024-12-15'),
      expiryDate: new Date('2025-12-15'),
      visaNumber: 'MV-2024-001234',
      stickerNumber: 'STK-001234',
      fees: {
        applicationFee: 500,
        processingFee: 200,
        stickerFee: 100,
        totalPaid: 800
      },
      documents: {
        application: true,
        passport: true,
        photo: true,
        workPermit: true,
        medicalCertificate: true,
        insurance: true
      },
      notes: 'Standard work visa processing completed successfully',
      priority: 'medium',
      assignedOfficer: 'VISA Officer 1',
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-12-15')
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Rajesh Kumar Sharma',
      empId: 'EMP002',
      nationality: 'Indian',
      passportNumber: 'IN9876543',
      visaType: 'work-visa',
      status: 'pending-collection',
      applicationDate: new Date('2024-12-01'),
      submissionDate: new Date('2024-12-05'),
      approvalDate: new Date('2024-12-20'),
      visaNumber: 'MV-2024-001235',
      fees: {
        applicationFee: 500,
        processingFee: 200,
        stickerFee: 100,
        totalPaid: 800
      },
      documents: {
        application: true,
        passport: true,
        photo: true,
        workPermit: true,
        medicalCertificate: true,
        insurance: true
      },
      notes: 'VISA approved, ready for collection at immigration office',
      priority: 'high',
      assignedOfficer: 'VISA Officer 2',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-20')
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Ali Mohamed Ibrahim',
      empId: 'EMP003',
      nationality: 'Pakistani',
      passportNumber: 'PK5678901',
      visaType: 'work-visa',
      status: 'pending-approval',
      applicationDate: new Date('2024-12-10'),
      submissionDate: new Date('2024-12-15'),
      fees: {
        applicationFee: 500,
        processingFee: 200,
        stickerFee: 100,
        totalPaid: 800
      },
      documents: {
        application: true,
        passport: true,
        photo: true,
        workPermit: true,
        medicalCertificate: true,
        insurance: true
      },
      notes: 'Application submitted to immigration authorities, awaiting approval',
      priority: 'urgent',
      assignedOfficer: 'VISA Officer 1',
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-15')
    },
    {
      id: '4',
      employeeId: '4',
      employeeName: 'Mohamed Rashid Hassan',
      empId: 'EMP004',
      nationality: 'Sri Lankan',
      passportNumber: 'LK2345678',
      visaType: 'work-visa',
      status: 'incomplete',
      applicationDate: new Date('2024-12-05'),
      fees: {
        applicationFee: 500,
        processingFee: 0,
        stickerFee: 0,
        totalPaid: 500
      },
      documents: {
        application: true,
        passport: true,
        photo: false,
        workPermit: true,
        medicalCertificate: false,
        insurance: true
      },
      notes: 'Missing passport photo and medical certificate',
      priority: 'medium',
      assignedOfficer: 'VISA Officer 3',
      createdAt: new Date('2024-12-05'),
      updatedAt: new Date('2024-12-18')
    },
    {
      id: '5',
      employeeId: '5',
      employeeName: 'Kumar Patel Singh',
      empId: 'EMP005',
      nationality: 'Nepalese',
      passportNumber: 'NP8765432',
      visaType: 'work-visa',
      status: 'expiring-soon',
      applicationDate: new Date('2023-12-01'),
      submissionDate: new Date('2023-12-05'),
      approvalDate: new Date('2023-12-20'),
      collectionDate: new Date('2024-01-05'),
      completionDate: new Date('2024-01-05'),
      expiryDate: new Date('2025-01-30'),
      visaNumber: 'MV-2023-009876',
      stickerNumber: 'STK-009876',
      fees: {
        applicationFee: 500,
        processingFee: 200,
        stickerFee: 100,
        totalPaid: 800
      },
      documents: {
        application: true,
        passport: true,
        photo: true,
        workPermit: true,
        medicalCertificate: true,
        insurance: true
      },
      notes: 'VISA expires on January 30, 2025 - renewal required',
      priority: 'high',
      assignedOfficer: 'VISA Officer 2',
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-12-18')
    },
    {
      id: '6',
      employeeId: '6',
      employeeName: 'David Chen Wong',
      empId: 'EMP006',
      nationality: 'Filipino',
      passportNumber: 'PH3456789',
      visaType: 'work-visa',
      status: 'pending-submission',
      applicationDate: new Date('2024-12-12'),
      fees: {
        applicationFee: 500,
        processingFee: 200,
        stickerFee: 100,
        totalPaid: 800
      },
      documents: {
        application: true,
        passport: true,
        photo: true,
        workPermit: true,
        medicalCertificate: true,
        insurance: true
      },
      notes: 'All documents complete, ready for submission to immigration office',
      priority: 'medium',
      assignedOfficer: 'VISA Officer 1',
      createdAt: new Date('2024-12-12'),
      updatedAt: new Date('2024-12-18')
    }
  ])

  // Filter records
  const filteredRecords = useMemo(() => {
    return visaRecords.filter(record => {
      const matchesSearch = searchQuery === '' || 
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.visaNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesVisaType = visaTypeFilter === 'all' || record.visaType === visaTypeFilter
      const matchesPriority = priorityFilter === 'all' || record.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesVisaType && matchesPriority
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [visaRecords, searchQuery, statusFilter, visaTypeFilter, priorityFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalRecords = visaRecords.length
    const pendingRecords = visaRecords.filter(r => r.status === 'pending').length
    const expiredRecords = visaRecords.filter(r => r.status === 'expired').length
    const expiringSoonRecords = visaRecords.filter(r => r.status === 'expiring-soon').length
    const incompleteRecords = visaRecords.filter(r => r.status === 'incomplete').length
    const pendingApprovalRecords = visaRecords.filter(r => r.status === 'pending-approval').length
    const pendingSubmissionRecords = visaRecords.filter(r => r.status === 'pending-submission').length
    const pendingCollectionRecords = visaRecords.filter(r => r.status === 'pending-collection').length
    const completedRecords = visaRecords.filter(r => r.status === 'completed').length
    
    return {
      totalRecords,
      pendingRecords,
      expiredRecords,
      expiringSoonRecords,
      incompleteRecords,
      pendingApprovalRecords,
      pendingSubmissionRecords,
      pendingCollectionRecords,
      completedRecords
    }
  }, [visaRecords])

  // Handle create new VISA application
  const handleCreateVisa = async (data: CreateVisaRequest) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const employee = employees.find(emp => emp.id === data.employeeId)
      if (!employee) {
        toast.error('Employee not found')
        return
      }

      const newRecord: VisaStickerRecord = {
        id: `visa-${Date.now()}`,
        employeeId: data.employeeId,
        employeeName: employee.name,
        empId: employee.empId,
        nationality: employee.nationality || 'Unknown',
        passportNumber: employee.passportNumber || 'TBD',
        visaType: data.visaType as any,
        status: 'pending',
        applicationDate: new Date(),
        fees: {
          applicationFee: 500,
          processingFee: 200,
          stickerFee: 100,
          totalPaid: 0
        },
        documents: {
          application: false,
          passport: false,
          photo: false,
          workPermit: false,
          medicalCertificate: false,
          insurance: false
        },
        notes: data.notes,
        priority: data.priority as any,
        assignedOfficer: 'VISA Officer 1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setVisaRecords(prev => [...prev, newRecord])
      setIsCreateDialogOpen(false)
      toast.success(`VISA application created for ${employee.name}`)
    } catch (error) {
      toast.error('Failed to create VISA application')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = (recordId: string, newStatus: string) => {
    setVisaRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { 
              ...record, 
              status: newStatus as any,
              updatedAt: new Date(),
              ...(newStatus === 'pending-submission' && { submissionDate: new Date() }),
              ...(newStatus === 'pending-approval' && { approvalDate: new Date() }),
              ...(newStatus === 'pending-collection' && { collectionDate: new Date() }),
              ...(newStatus === 'completed' && { completionDate: new Date() })
            }
          : record
      )
    )
    toast.success('Status updated successfully')
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config = visaStatusConfig[status as keyof typeof visaStatusConfig]
    if (!config) return null
    
    const IconComponent = config.icon
    
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-current`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig]
    if (!config) return null
    
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-current`}>
        {config.label}
      </Badge>
    )
  }

  // Format date
  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'MMM dd, yyyy') : '-'
  }

  // Calculate document completion percentage
  const getDocumentCompletion = (documents: VisaStickerRecord['documents']) => {
    const total = Object.keys(documents).length
    const completed = Object.values(documents).filter(Boolean).length
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            VISA Stickers
          </h1>
          <p className="text-muted-foreground">
            Manage VISA sticker applications and tracking with 8-status system
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
                <Plus className="h-4 w-4 mr-2" />
                New VISA Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create VISA Application</DialogTitle>
                <DialogDescription>
                  Initiate a new VISA sticker application for an employee
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(emp => emp.status === 'active').slice(0, 10).map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.empId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visaType">VISA Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select VISA type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work-visa">Work VISA</SelectItem>
                        <SelectItem value="business-visa">Business VISA</SelectItem>
                        <SelectItem value="tourist-visa">Tourist VISA</SelectItem>
                        <SelectItem value="residence-visa">Residence VISA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Set priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Additional notes or special requirements..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleCreateVisa({
                    employeeId: employees[0]?.id || '',
                    visaType: 'work-visa',
                    priority: 'medium',
                    notes: 'New VISA application'
                  })
                }} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Application
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics - 8 Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{summaryStats.pendingRecords}</div>
            <p className="text-xs text-muted-foreground">Initial stage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryStats.expiredRecords}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.expiringSoonRecords}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete</CardTitle>
            <FileX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.incompleteRecords}</div>
            <p className="text-xs text-muted-foreground">Missing docs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Hourglass className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.pendingApprovalRecords}</div>
            <p className="text-xs text-muted-foreground">At authorities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submission</CardTitle>
            <Send className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.pendingSubmissionRecords}</div>
            <p className="text-xs text-muted-foreground">Ready to submit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Collection</CardTitle>
            <Package className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{summaryStats.pendingCollectionRecords}</div>
            <p className="text-xs text-muted-foreground">Ready for pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.completedRecords}</div>
            <p className="text-xs text-muted-foreground">Process done</p>
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
                  placeholder="Search VISA records..."
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
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="pending-approval">Pending Approval</SelectItem>
                  <SelectItem value="pending-submission">Pending Submission</SelectItem>
                  <SelectItem value="pending-collection">Pending Collection</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
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

      {/* VISA Records Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>VISA Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Expiry Date</TableHead>
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
                        {record.visaType.replace('-', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.passportNumber}
                      </div>
                      {record.visaNumber && (
                        <div className="text-xs text-muted-foreground">
                          {record.visaNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(record.priority)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        {getDocumentCompletion(record.documents)}%
                      </div>
                      <div className="w-16 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${getDocumentCompletion(record.documents)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {record.expiryDate ? (
                      <div className={`${
                        record.status === 'expiring-soon' 
                          ? 'text-orange-600 font-medium' 
                          : record.status === 'expired'
                          ? 'text-red-600 font-medium'
                          : ''
                      }`}>
                        {formatDate(record.expiryDate)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div>{formatDate(record.updatedAt)}</div>
                      <div className="text-muted-foreground">
                        {record.assignedOfficer}
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
                          setSelectedVisa(record)
                          setIsDetailsDialogOpen(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        {Object.entries(visaStatusConfig).map(([status, config]) => (
                          <DropdownMenuItem 
                            key={status}
                            onClick={() => handleStatusUpdate(record.id, status)}
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

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>VISA Details - {selectedVisa?.employeeName}</DialogTitle>
            <DialogDescription>
              Complete VISA application and processing information
            </DialogDescription>
          </DialogHeader>
          
          {selectedVisa && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedVisa.status)}
                {getPriorityBadge(selectedVisa.priority)}
              </div>

              {/* Employee and VISA Information */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Employee Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedVisa.employeeName}</div>
                    <div><strong>Employee ID:</strong> {selectedVisa.empId}</div>
                    <div><strong>Nationality:</strong> {selectedVisa.nationality}</div>
                    <div><strong>Passport:</strong> {selectedVisa.passportNumber}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">VISA Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {selectedVisa.visaType.replace('-', ' ')}</div>
                    <div><strong>VISA Number:</strong> {selectedVisa.visaNumber || 'Pending'}</div>
                    <div><strong>Sticker Number:</strong> {selectedVisa.stickerNumber || 'Pending'}</div>
                    <div><strong>Assigned Officer:</strong> {selectedVisa.assignedOfficer}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Processing Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="text-sm">
                        <strong>Application Date:</strong> {formatDate(selectedVisa.applicationDate)}
                      </div>
                    </div>
                    {selectedVisa.submissionDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="text-sm">
                          <strong>Submitted:</strong> {formatDate(selectedVisa.submissionDate)}
                        </div>
                      </div>
                    )}
                    {selectedVisa.approvalDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="text-sm">
                          <strong>Approved:</strong> {formatDate(selectedVisa.approvalDate)}
                        </div>
                      </div>
                    )}
                    {selectedVisa.collectionDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="text-sm">
                          <strong>Collection Date:</strong> {formatDate(selectedVisa.collectionDate)}
                        </div>
                      </div>
                    )}
                    {selectedVisa.completionDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        <div className="text-sm">
                          <strong>Completed:</strong> {formatDate(selectedVisa.completionDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documents and Fees */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedVisa.documents).map(([doc, completed]) => (
                        <div key={doc} className="flex items-center justify-between">
                          <span className="capitalize">{doc.replace(/([A-Z])/g, ' $1')}</span>
                          {completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Fee Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Application Fee:</span>
                        <span>MVR {selectedVisa.fees.applicationFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee:</span>
                        <span>MVR {selectedVisa.fees.processingFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sticker Fee:</span>
                        <span>MVR {selectedVisa.fees.stickerFee}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Paid:</span>
                        <span>MVR {selectedVisa.fees.totalPaid}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {selectedVisa.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedVisa.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}