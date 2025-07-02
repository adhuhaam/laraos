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
  Filter, 
  RefreshCw,
  Download,
  Users,
  Loader2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Eye,
  Edit3,
  UserX,
  UserCheck,
  MoreHorizontal,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  IdCard,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  FileText,
  TrendingUp,
  BarChart3,
  UserPlus,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Star,
  Award,
  Target,
  Upload,
  FileUp,
  File,
  FileImage,
  FilePdf,
  FileX,
  Plus,
  Trash2,
  Download as DownloadIcon,
  Camera,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface EmployeeDocument {
  id: string
  name: string
  type: 'passport' | 'work-permit' | 'contract' | 'photo' | 'certificate' | 'medical' | 'visa' | 'other'
  fileName: string
  fileSize: string
  uploadDate: string
  uploadedBy: string
  notes?: string
  url?: string
}

interface Employee {
  id: string
  empId: string
  name: string
  passportNumber: string
  nationality: string
  birthDate: string
  address: string
  phone?: string
  email?: string
  avatar?: string
  
  // Employment Details
  department: string
  designation: string
  salary: number
  joinDate: string // Changed from startDate to joinDate
  managerId?: string
  managerName?: string
  workLocation: string
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'suspended' | 'probation'
  
  // Work Details
  bankAccount?: string
  accommodationId?: string
  workPermitNumber?: string
  workPermitExpiry?: string
  contractType: 'permanent' | 'contract' | 'temporary'
  contractEndDate?: string
  
  // Performance & Records
  performanceRating?: number
  lastReviewDate?: string
  totalLeaves?: number
  usedLeaves?: number
  disciplinaryRecords?: number
  commendations?: number
  
  // Onboarding Info
  onboardingDate: string
  onboardingCompletedBy: string
  
  // Document Management
  documents: EmployeeDocument[]
  
  // Additional Info
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  skills?: string[]
  certifications?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

type ViewMode = 'grid' | 'table'
type SortField = 'name' | 'empId' | 'department' | 'designation' | 'joinDate' | 'salary' | 'employmentStatus'
type SortDirection = 'asc' | 'desc'

export function EmployeeManagement() {
  // Sample data for employees (from onboarding system)
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      empId: 'EMP001',
      name: 'Rajesh Kumar',
      passportNumber: 'A1234567',
      nationality: 'Indian',
      birthDate: '1985-03-15',
      address: 'Mumbai, Maharashtra, India',
      phone: '+91 9876543210',
      email: 'rajesh.kumar@company.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      department: 'Construction',
      designation: 'Construction Worker',
      salary: 15000,
      joinDate: '2024-12-09',
      workLocation: 'Site A - Main Construction',
      employmentStatus: 'active',
      bankAccount: 'BML-123456789',
      accommodationId: 'ACC-001',
      workPermitNumber: 'WP2024001',
      workPermitExpiry: '2025-12-08',
      contractType: 'permanent',
      performanceRating: 4.2,
      lastReviewDate: '2024-11-15',
      totalLeaves: 21,
      usedLeaves: 3,
      disciplinaryRecords: 0,
      commendations: 2,
      onboardingDate: '2024-12-08',
      onboardingCompletedBy: 'HR Manager',
      documents: [
        {
          id: 'doc1',
          name: 'Passport Copy',
          type: 'passport',
          fileName: 'rajesh_passport.pdf',
          fileSize: '2.4 MB',
          uploadDate: '2024-12-08',
          uploadedBy: 'HR Manager',
          notes: 'Valid passport copy'
        },
        {
          id: 'doc2',
          name: 'Work Permit',
          type: 'work-permit',
          fileName: 'rajesh_work_permit.pdf',
          fileSize: '1.8 MB',
          uploadDate: '2024-12-08',
          uploadedBy: 'HR Manager'
        },
        {
          id: 'doc3',
          name: 'Profile Photo',
          type: 'photo',
          fileName: 'rajesh_photo.jpg',
          fileSize: '850 KB',
          uploadDate: '2024-12-08',
          uploadedBy: 'HR Manager',
          notes: 'Recruitment photo'
        }
      ],
      emergencyContact: {
        name: 'Priya Kumar',
        relationship: 'Wife',
        phone: '+91 9876543211'
      },
      skills: ['Concrete Work', 'Steel Fixing', 'Safety Protocols'],
      certifications: ['Safety Training Certificate', 'Basic Construction Skills'],
      createdAt: '2024-12-08',
      updatedAt: '2024-12-30'
    },
    {
      id: '2',
      empId: 'EMP002',
      name: 'Mohammad Rahman',
      passportNumber: 'B9876543',
      nationality: 'Bangladeshi',
      birthDate: '1990-07-22',
      address: 'Dhaka, Bangladesh',
      phone: '+880 1712345678',
      email: 'mohammad.rahman@company.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      department: 'Electrical',
      designation: 'Senior Electrician',
      salary: 18000,
      joinDate: '2024-11-15',
      workLocation: 'Site B - Electrical Systems',
      employmentStatus: 'active',
      bankAccount: 'BML-987654321',
      accommodationId: 'ACC-002',
      workPermitNumber: 'WP2024002',
      workPermitExpiry: '2025-11-14',
      contractType: 'permanent',
      performanceRating: 4.7,
      lastReviewDate: '2024-12-01',
      totalLeaves: 21,
      usedLeaves: 5,
      disciplinaryRecords: 0,
      commendations: 3,
      onboardingDate: '2024-11-10',
      onboardingCompletedBy: 'Department Head',
      documents: [
        {
          id: 'doc4',
          name: 'Passport Copy',
          type: 'passport',
          fileName: 'mohammad_passport.pdf',
          fileSize: '2.1 MB',
          uploadDate: '2024-11-10',
          uploadedBy: 'Department Head'
        },
        {
          id: 'doc5',
          name: 'Work Permit',
          type: 'work-permit',
          fileName: 'mohammad_work_permit.pdf',
          fileSize: '1.9 MB',
          uploadDate: '2024-11-10',
          uploadedBy: 'Department Head'
        },
        {
          id: 'doc6',
          name: 'Electrical Certification',
          type: 'certificate',
          fileName: 'mohammad_electrical_cert.pdf',
          fileSize: '1.2 MB',
          uploadDate: '2024-11-10',
          uploadedBy: 'Department Head',
          notes: 'Advanced electrical systems certification'
        }
      ],
      emergencyContact: {
        name: 'Fatima Rahman',
        relationship: 'Wife',
        phone: '+880 1712345679'
      },
      skills: ['Electrical Installation', 'Motor Repair', 'Panel Wiring', 'PLC Programming'],
      certifications: ['Electrical Safety Certificate', 'Advanced Electrical Systems'],
      createdAt: '2024-11-10',
      updatedAt: '2024-12-29'
    },
    {
      id: '3',
      empId: 'EMP003',
      name: 'Prakash Thapa',
      passportNumber: 'N5555444',
      nationality: 'Nepali',
      birthDate: '1988-11-10',
      address: 'Kathmandu, Nepal',
      phone: '+977 9841234567',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      department: 'Construction',
      designation: 'Mason',
      salary: 16000,
      joinDate: '2024-12-20',
      workLocation: 'Site A - Masonry Work',
      employmentStatus: 'probation',
      bankAccount: 'BML-456789123',
      accommodationId: 'ACC-003',
      workPermitNumber: 'WP2024003',
      workPermitExpiry: '2025-12-19',
      contractType: 'permanent',
      performanceRating: 3.8,
      totalLeaves: 21,
      usedLeaves: 1,
      disciplinaryRecords: 0,
      commendations: 1,
      onboardingDate: '2024-12-18',
      onboardingCompletedBy: 'Site Manager',
      documents: [
        {
          id: 'doc7',
          name: 'Passport Copy',
          type: 'passport',
          fileName: 'prakash_passport.pdf',
          fileSize: '2.3 MB',
          uploadDate: '2024-12-18',
          uploadedBy: 'Site Manager'
        },
        {
          id: 'doc8',
          name: 'Work Permit',
          type: 'work-permit',
          fileName: 'prakash_work_permit.pdf',
          fileSize: '1.7 MB',
          uploadDate: '2024-12-18',
          uploadedBy: 'Site Manager'
        }
      ],
      emergencyContact: {
        name: 'Sita Thapa',
        relationship: 'Mother',
        phone: '+977 9841234568'
      },
      skills: ['Brick Laying', 'Stone Work', 'Plastering'],
      certifications: ['Masonry Skills Certificate'],
      createdAt: '2024-12-18',
      updatedAt: '2024-12-30'
    },
    {
      id: '4',
      empId: 'EMP004',
      name: 'Chaminda Silva',
      passportNumber: 'S7777888',
      nationality: 'Sri Lankan',
      birthDate: '1992-05-08',
      address: 'Colombo, Sri Lanka',
      phone: '+94 771234567',
      email: 'chaminda.silva@company.com',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
      department: 'Carpentry',
      designation: 'Senior Carpenter',
      salary: 17500,
      joinDate: '2024-10-01',
      workLocation: 'Site C - Interior Work',
      employmentStatus: 'active',
      bankAccount: 'BML-789123456',
      accommodationId: 'ACC-004',
      workPermitNumber: 'WP2024004',
      workPermitExpiry: '2025-09-30',
      contractType: 'contract',
      contractEndDate: '2025-09-30',
      performanceRating: 4.5,
      lastReviewDate: '2024-12-15',
      totalLeaves: 21,
      usedLeaves: 8,
      disciplinaryRecords: 0,
      commendations: 4,
      onboardingDate: '2024-09-28',
      onboardingCompletedBy: 'HR Manager',
      documents: [
        {
          id: 'doc9',
          name: 'Passport Copy',
          type: 'passport',
          fileName: 'chaminda_passport.pdf',
          fileSize: '2.2 MB',
          uploadDate: '2024-09-28',
          uploadedBy: 'HR Manager'
        },
        {
          id: 'doc10',
          name: 'Work Permit',
          type: 'work-permit',
          fileName: 'chaminda_work_permit.pdf',
          fileSize: '1.8 MB',
          uploadDate: '2024-09-28',
          uploadedBy: 'HR Manager'
        },
        {
          id: 'doc11',
          name: 'Carpentry Certificate',
          type: 'certificate',
          fileName: 'chaminda_carpentry_cert.pdf',
          fileSize: '1.5 MB',
          uploadDate: '2024-09-28',
          uploadedBy: 'HR Manager',
          notes: 'Advanced carpentry and interior design certification'
        },
        {
          id: 'doc12',
          name: 'Medical Certificate',
          type: 'medical',
          fileName: 'chaminda_medical.pdf',
          fileSize: '900 KB',
          uploadDate: '2024-09-28',
          uploadedBy: 'HR Manager',
          notes: 'Pre-employment medical checkup'
        }
      ],
      emergencyContact: {
        name: 'Kumari Silva',
        relationship: 'Wife',
        phone: '+94 771234568'
      },
      skills: ['Furniture Making', 'Cabinet Installation', 'Wood Finishing', 'Design'],
      certifications: ['Advanced Carpentry', 'Interior Design Basics', 'Safety Training'],
      createdAt: '2024-09-28',
      updatedAt: '2024-12-28'
    }
  ])

  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [contractFilter, setContractFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('empId')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  // Document management states
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'other' as EmployeeDocument['type'],
    file: null as File | null,
    notes: ''
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    department: '',
    designation: '',
    salary: '',
    workLocation: '',
    managerId: '',
    employmentStatus: 'active' as Employee['employmentStatus'],
    contractType: 'permanent' as Employee['contractType'],
    contractEndDate: '',
    notes: ''
  })

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEmployees = employees.length
    const activeEmployees = employees.filter(e => e.employmentStatus === 'active').length
    const probationEmployees = employees.filter(e => e.employmentStatus === 'probation').length
    const inactiveEmployees = employees.filter(e => e.employmentStatus === 'inactive').length
    const terminatedEmployees = employees.filter(e => e.employmentStatus === 'terminated').length
    
    const totalSalary = employees
      .filter(e => e.employmentStatus === 'active')
      .reduce((sum, e) => sum + e.salary, 0)
    
    const avgSalary = activeEmployees > 0 ? totalSalary / activeEmployees : 0
    
    const avgPerformance = employees
      .filter(e => e.performanceRating)
      .reduce((sum, e) => sum + (e.performanceRating || 0), 0) / 
      employees.filter(e => e.performanceRating).length || 0
    
    // Department breakdown
    const departmentBreakdown = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalEmployees,
      activeEmployees,
      probationEmployees,
      inactiveEmployees,
      terminatedEmployees,
      totalSalary,
      avgSalary,
      avgPerformance,
      departmentBreakdown
    }
  }, [employees])

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(employees.map(e => e.department))]
    return departments.sort()
  }, [employees])

  // Filtering and sorting logic
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (employee.workPermitNumber && employee.workPermitNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || employee.employmentStatus === statusFilter
      const matchesContract = contractFilter === 'all' || employee.contractType === contractFilter
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesContract
    })

    // Sort employees
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'joinDate') {
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
  }, [employees, searchQuery, departmentFilter, statusFilter, contractFilter, sortField, sortDirection])

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

  const getStatusColor = (status: Employee['employmentStatus']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'inactive': return 'bg-gray-500/10 text-gray-700 border-gray-200'
      case 'terminated': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'suspended': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'probation': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = (status: Employee['employmentStatus']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'inactive': return <Clock className="h-3 w-3" />
      case 'terminated': return <XCircle className="h-3 w-3" />
      case 'suspended': return <AlertTriangle className="h-3 w-3" />
      case 'probation': return <UserCheck className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getDocumentIcon = (type: EmployeeDocument['type']) => {
    switch (type) {
      case 'passport': return <IdCard className="h-4 w-4" />
      case 'work-permit': return <FileText className="h-4 w-4" />
      case 'contract': return <FileText className="h-4 w-4" />
      case 'photo': return <ImageIcon className="h-4 w-4" />
      case 'certificate': return <Award className="h-4 w-4" />
      case 'medical': return <FileText className="h-4 w-4" />
      case 'visa': return <FileText className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return `MVR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleEditEmployee = useCallback(async () => {
    if (!selectedEmployee) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              department: editForm.department || emp.department,
              designation: editForm.designation || emp.designation,
              salary: editForm.salary ? parseFloat(editForm.salary) : emp.salary,
              workLocation: editForm.workLocation || emp.workLocation,
              managerId: editForm.managerId || emp.managerId,
              employmentStatus: editForm.employmentStatus,
              contractType: editForm.contractType,
              contractEndDate: editForm.contractEndDate || emp.contractEndDate,
              notes: editForm.notes || emp.notes,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : emp
      ))

      setShowEditDialog(false)
      setEditForm({
        department: '',
        designation: '',
        salary: '',
        workLocation: '',
        managerId: '',
        employmentStatus: 'active',
        contractType: 'permanent',
        contractEndDate: '',
        notes: ''
      })
      
      toast.success(`${selectedEmployee.name}'s details updated successfully!`)

    } catch (error) {
      toast.error('Failed to update employee details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmployee, editForm])

  const handleDocumentUpload = useCallback(async () => {
    if (!selectedEmployee || !uploadForm.file || !uploadForm.name) {
      toast.error('Please fill in all required fields and select a file')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newDocument: EmployeeDocument = {
        id: Date.now().toString(),
        name: uploadForm.name,
        type: uploadForm.type,
        fileName: uploadForm.file.name,
        fileSize: `${(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Current User',
        notes: uploadForm.notes || undefined
      }

      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              documents: [...emp.documents, newDocument],
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : emp
      ))

      setShowUploadDialog(false)
      setUploadForm({ name: '', type: 'other', file: null, notes: '' })
      toast.success('Document uploaded successfully!')

    } catch (error) {
      toast.error('Failed to upload document. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmployee, uploadForm])

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    if (!selectedEmployee) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              documents: emp.documents.filter(doc => doc.id !== documentId),
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : emp
      ))

      toast.success('Document deleted successfully!')

    } catch (error) {
      toast.error('Failed to delete document. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmployee])

  const getPerformanceColor = (rating?: number) => {
    if (!rating) return 'text-gray-500'
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceStars = (rating?: number) => {
    if (!rating) return []
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-3 w-3 fill-current" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-3 w-3 fill-current opacity-50" />)
      } else {
        stars.push(<Star key={i} className="h-3 w-3" />)
      }
    }
    return stars
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage all onboarded employees and their records • {filteredAndSortedEmployees.length} employee{filteredAndSortedEmployees.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.activeEmployees} active • {summaryStats.probationEmployees} probation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {((summaryStats.activeEmployees / summaryStats.totalEmployees) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summaryStats.totalSalary)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly active payroll
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.avgPerformance.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 rating scale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(summaryStats.departmentBreakdown).map(([dept, count]) => (
              <div key={dept} className="flex justify-between p-2 bg-muted/30 rounded">
                <span className="font-medium">{dept}</span>
                <span className="text-primary font-semibold">{count} employee{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredAndSortedEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No employees found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search filters to find employees.'
                    : 'No employees have been onboarded yet.'}
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
                  <Button variant="ghost" onClick={() => handleSort('empId')} className="h-auto p-0 font-medium">
                    EMP ID {getSortIcon('empId')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-medium">
                    Name {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('designation')} className="h-auto p-0 font-medium">
                    Designation {getSortIcon('designation')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('department')} className="h-auto p-0 font-medium">
                    Department {getSortIcon('department')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('joinDate')} className="h-auto p-0 font-medium">
                    Join Date {getSortIcon('joinDate')}
                  </Button>
                </TableHead>
                <TableHead>Passport Number</TableHead>
                <TableHead>Work Permit Number</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('employmentStatus')} className="h-auto p-0 font-medium">
                    Status {getSortIcon('employmentStatus')}
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {employee.empId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.nationality}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{employee.passportNumber}</code>
                  </TableCell>
                  <TableCell>
                    {employee.workPermitNumber ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">{employee.workPermitNumber}</code>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.employmentStatus)}>
                      {getStatusIcon(employee.employmentStatus)}
                      {employee.employmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setEditForm({
                            department: employee.department,
                            designation: employee.designation,
                            salary: employee.salary.toString(),
                            workLocation: employee.workLocation,
                            managerId: employee.managerId || '',
                            employmentStatus: employee.employmentStatus,
                            contractType: employee.contractType,
                            contractEndDate: employee.contractEndDate || '',
                            notes: employee.notes || ''
                          })
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Employee Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              View comprehensive information about {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="records">Records</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                    <AvatarFallback className="text-lg">{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-medium">{selectedEmployee.name}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="font-mono">{selectedEmployee.empId}</Badge>
                      <Badge className={getStatusColor(selectedEmployee.employmentStatus)}>
                        {selectedEmployee.employmentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Personal Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Passport Number</span>
                        <span className="text-sm font-medium">{selectedEmployee.passportNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nationality</span>
                        <span className="text-sm">{selectedEmployee.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Birth Date</span>
                        <span className="text-sm">{new Date(selectedEmployee.birthDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Address</span>
                        <span className="text-sm text-right max-w-xs">{selectedEmployee.address}</span>
                      </div>
                      {selectedEmployee.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Phone</span>
                          <span className="text-sm">{selectedEmployee.phone}</span>
                        </div>
                      )}
                      {selectedEmployee.email && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="text-sm">{selectedEmployee.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Emergency Contact</h4>
                    {selectedEmployee.emergencyContact ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Name</span>
                          <span className="text-sm font-medium">{selectedEmployee.emergencyContact.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Relationship</span>
                          <span className="text-sm">{selectedEmployee.emergencyContact.relationship}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Phone</span>
                          <span className="text-sm">{selectedEmployee.emergencyContact.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No emergency contact information</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="employment" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Job Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <span className="text-sm font-medium">{selectedEmployee.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Designation</span>
                        <span className="text-sm">{selectedEmployee.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Salary</span>
                        <span className="text-sm font-medium">{formatCurrency(selectedEmployee.salary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Join Date</span>
                        <span className="text-sm">{new Date(selectedEmployee.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Work Location</span>
                        <span className="text-sm text-right max-w-xs">{selectedEmployee.workLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Contract & Work Permit</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Contract Type</span>
                        <span className="text-sm">{selectedEmployee.contractType}</span>
                      </div>
                      {selectedEmployee.contractEndDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Contract End</span>
                          <span className="text-sm">{new Date(selectedEmployee.contractEndDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedEmployee.workPermitNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Work Permit</span>
                          <span className="text-sm font-mono">{selectedEmployee.workPermitNumber}</span>
                        </div>
                      )}
                      {selectedEmployee.workPermitExpiry && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Permit Expiry</span>
                          <span className="text-sm">{new Date(selectedEmployee.workPermitExpiry).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedEmployee.bankAccount && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Bank Account</span>
                          <span className="text-sm font-mono">{selectedEmployee.bankAccount}</span>
                        </div>
                      )}
                      {selectedEmployee.accommodationId && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Accommodation</span>
                          <span className="text-sm">{selectedEmployee.accommodationId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Employee Documents</h4>
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
                
                {selectedEmployee.documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedEmployee.documents.map((document) => (
                      <Card key={document.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{document.name}</h5>
                              <p className="text-sm text-muted-foreground">{document.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {document.fileSize} • Uploaded {new Date(document.uploadDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">By: {document.uploadedBy}</p>
                              {document.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{document.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost">
                              <DownloadIcon className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteDocument(document.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-2">
                      {selectedEmployee.performanceRating && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Rating</span>
                          <div className="flex items-center gap-2">
                            <div className={`flex ${getPerformanceColor(selectedEmployee.performanceRating)}`}>
                              {getPerformanceStars(selectedEmployee.performanceRating)}
                            </div>
                            <span className="text-sm font-medium">
                              {selectedEmployee.performanceRating.toFixed(1)}/5.0
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedEmployee.lastReviewDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Last Review</span>
                          <span className="text-sm">{new Date(selectedEmployee.lastReviewDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Commendations</span>
                        <span className="text-sm font-medium text-green-600">{selectedEmployee.commendations || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Disciplinary Records</span>
                        <span className="text-sm font-medium text-red-600">{selectedEmployee.disciplinaryRecords || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Leave Management</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Leave Days</span>
                        <span className="text-sm font-medium">{selectedEmployee.totalLeaves || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Used Leave Days</span>
                        <span className="text-sm">{selectedEmployee.usedLeaves || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Remaining Leave</span>
                        <span className="text-sm font-medium text-blue-600">
                          {(selectedEmployee.totalLeaves || 0) - (selectedEmployee.usedLeaves || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills and Certifications */}
                {(selectedEmployee.skills || selectedEmployee.certifications) && (
                  <div className="space-y-4">
                    {selectedEmployee.skills && (
                      <div>
                        <h4 className="font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedEmployee.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEmployee.certifications && (
                      <div>
                        <h4 className="font-medium mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedEmployee.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="records" className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Onboarding Information</h4>
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Onboarding Date</span>
                      <span className="text-sm">{new Date(selectedEmployee.onboardingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed By</span>
                      <span className="text-sm">{selectedEmployee.onboardingCompletedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Record Created</span>
                      <span className="text-sm">{new Date(selectedEmployee.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm">{new Date(selectedEmployee.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {selectedEmployee.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Notes</h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedEmployee.notes}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
            <DialogDescription>
              Update employment information for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={editForm.department} onValueChange={(value) => setEditForm(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={editForm.designation}
                    onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="Job title"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary (MVR)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={editForm.salary}
                    onChange={(e) => setEditForm(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="15000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select value={editForm.employmentStatus} onValueChange={(value: Employee['employmentStatus']) => setEditForm(prev => ({ ...prev, employmentStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="probation">Probation</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Input
                  id="workLocation"
                  value={editForm.workLocation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, workLocation: e.target.value }))}
                  placeholder="Site A - Main Construction"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select value={editForm.contractType} onValueChange={(value: Employee['contractType']) => setEditForm(prev => ({ ...prev, contractType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {editForm.contractType === 'contract' && (
                  <div className="space-y-2">
                    <Label htmlFor="contractEndDate">Contract End Date</Label>
                    <Input
                      id="contractEndDate"
                      type="date"
                      value={editForm.contractEndDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, contractEndDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the employee"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditEmployee} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name *</Label>
                <Input
                  id="documentName"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Updated Passport Copy"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select value={uploadForm.type} onValueChange={(value: EmployeeDocument['type']) => setUploadForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="work-permit">Work Permit</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentFile">File *</Label>
                <Input
                  id="documentFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentNotes">Notes</Label>
                <Textarea
                  id="documentNotes"
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this document"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDocumentUpload} 
                disabled={isLoading || !uploadForm.name || !uploadForm.file}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}