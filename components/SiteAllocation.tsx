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
import { Checkbox } from './ui/checkbox'
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
  MapPin,
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
  Users,
  Building2,
  Calendar,
  Target,
  Activity,
  Zap,
  Construction,
  HardHat,
  Hammer,
  Wrench,
  FileText,
  Eye,
  RefreshCw,
  Plus,
  AlertCircle,
  FileCheck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Download,
  Upload,
  Settings,
  Send,
  Star,
  Award,
  Shield,
  Map,
  Navigation,
  Route,
  Truck,
  Timer,
  Circle
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData } from './HRDataContext'
import { format, addDays, isAfter, isBefore, differenceInDays } from 'date-fns'

// Project Site Types
interface ProjectSite {
  id: string
  siteName: string
  siteCode: string
  projectName: string
  projectId: string
  location: string
  siteType: 'construction' | 'renovation' | 'maintenance' | 'infrastructure'
  startDate: Date
  endDate: Date
  status: 'active' | 'planning' | 'completed' | 'on-hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  requiredWorkers: number
  allocatedWorkers: number
  phases: ProjectPhase[]
  supervisor: {
    id: string
    name: string
    phone: string
    email: string
  }
  safetyOfficer?: {
    id: string
    name: string
    phone: string
  }
  description: string
  requirements: string[]
  equipment: string[]
  createdAt: string
  updatedAt: string
}

interface ProjectPhase {
  id: string
  phaseName: string
  startDate: Date
  endDate: Date
  status: 'pending' | 'active' | 'completed' | 'delayed'
  requiredSkills: string[]
  allocatedEmployees: string[]
  description: string
}

interface EmployeeAllocation {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  department: string
  designation: string
  skills: string[]
  siteId: string
  siteName: string
  phaseId?: string
  phaseName?: string
  allocationDate: Date
  plannedEndDate: Date
  actualEndDate?: Date
  status: 'allocated' | 'in-transit' | 'on-site' | 'completed' | 'transferred'
  role: 'worker' | 'supervisor' | 'foreman' | 'specialist' | 'safety-officer'
  notes?: string
  performanceRating?: number
  allocatedBy: string
  createdAt: string
  updatedAt: string
}

interface AllocationRequest {
  siteId: string
  phaseId?: string
  employeeIds: string[]
  startDate: Date
  endDate: Date
  role: string
  notes?: string
}

// Site Status Configuration
const siteStatusConfig = {
  'active': {
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: Activity,
    description: 'Site is currently active'
  },
  'planning': {
    label: 'Planning',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Target,
    description: 'Site in planning phase'
  },
  'completed': {
    label: 'Completed',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    icon: CheckCircle,
    description: 'Site work completed'
  },
  'on-hold': {
    label: 'On Hold',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: Clock,
    description: 'Site temporarily on hold'
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
    description: 'Site work cancelled'
  }
}

// Priority Configuration
const priorityConfig = {
  'low': {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    icon: Circle
  },
  'medium': {
    label: 'Medium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: AlertCircle
  },
  'high': {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: AlertTriangle
  },
  'critical': {
    label: 'Critical',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: Zap
  }
}

export function SiteAllocation() {
  const { employees } = useHRData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [siteFilter, setSiteFilter] = useState<'all' | 'active' | 'planning' | 'completed' | 'on-hold'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')
  const [isCreateSiteDialogOpen, setIsCreateSiteDialogOpen] = useState(false)
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<ProjectSite | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'sites' | 'allocations' | 'analytics'>('sites')
  const [isLoading, setIsLoading] = useState(false)

  // Sample project sites data
  const [projectSites, setProjectSites] = useState<ProjectSite[]>([
    {
      id: '1',
      siteName: 'Hulhumale Phase II - Block A',
      siteCode: 'HM2-BLK-A',
      projectName: 'Hulhumale Residential Development',
      projectId: 'PROJ-001',
      location: 'Hulhumale, Maldives',
      siteType: 'construction',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-08-15'),
      status: 'active',
      priority: 'high',
      requiredWorkers: 25,
      allocatedWorkers: 18,
      phases: [
        {
          id: 'phase-1',
          phaseName: 'Foundation Work',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          status: 'completed',
          requiredSkills: ['Concrete Work', 'Heavy Machinery'],
          allocatedEmployees: ['emp-1', 'emp-2', 'emp-3'],
          description: 'Foundation and basement construction'
        },
        {
          id: 'phase-2',
          phaseName: 'Structural Framework',
          startDate: new Date('2024-03-16'),
          endDate: new Date('2024-06-15'),
          status: 'active',
          requiredSkills: ['Steel Work', 'Welding', 'Crane Operation'],
          allocatedEmployees: ['emp-4', 'emp-5', 'emp-6'],
          description: 'Steel structure and framework'
        }
      ],
      supervisor: {
        id: 'sup-1',
        name: 'Ahmed Hassan',
        phone: '+960 777 1234',
        email: 'ahmed.hassan@rcc.mv'
      },
      safetyOfficer: {
        id: 'safety-1',
        name: 'Ibrahim Waheed',
        phone: '+960 777 5678'
      },
      description: 'Multi-story residential building construction with modern amenities',
      requirements: ['Safety Equipment', 'Concrete Mixer', 'Tower Crane', 'Scaffolding'],
      equipment: ['Tower Crane', 'Concrete Mixer', 'Excavator', 'Bulldozer'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      siteName: 'Male International Airport - Terminal Extension',
      siteCode: 'VIA-TERM-EXT',
      projectName: 'Airport Terminal Expansion',
      projectId: 'PROJ-002',
      location: 'Velana International Airport',
      siteType: 'infrastructure',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-31'),
      status: 'active',
      priority: 'critical',
      requiredWorkers: 40,
      allocatedWorkers: 32,
      phases: [
        {
          id: 'phase-a1',
          phaseName: 'Site Preparation',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-03-31'),
          status: 'completed',
          requiredSkills: ['Demolition', 'Site Clearing'],
          allocatedEmployees: ['emp-7', 'emp-8'],
          description: 'Site clearing and preparation work'
        }
      ],
      supervisor: {
        id: 'sup-2',
        name: 'Mohamed Ali',
        phone: '+960 777 9876',
        email: 'mohamed.ali@rcc.mv'
      },
      description: 'Major terminal expansion project for increased passenger capacity',
      requirements: ['Security Clearance', 'Airport Access Permits', 'Specialized Equipment'],
      equipment: ['Mobile Crane', 'Concrete Pump', 'Scaffolding Systems'],
      createdAt: '2024-01-25',
      updatedAt: '2024-02-01'
    },
    {
      id: '3',
      siteName: 'Villimale Community Center',
      siteCode: 'VIL-COM-CTR',
      projectName: 'Community Infrastructure Development',
      projectId: 'PROJ-003',
      location: 'Villimale, Maldives',
      siteType: 'construction',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      status: 'planning',
      priority: 'medium',
      requiredWorkers: 15,
      allocatedWorkers: 0,
      phases: [
        {
          id: 'phase-b1',
          phaseName: 'Design Review',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-15'),
          status: 'pending',
          requiredSkills: ['Project Planning', 'Engineering Review'],
          allocatedEmployees: [],
          description: 'Architectural and engineering design review'
        }
      ],
      supervisor: {
        id: 'sup-3',
        name: 'Aminath Shafeeu',
        phone: '+960 777 4567',
        email: 'aminath.shafeeu@rcc.mv'
      },
      description: 'New community center with multipurpose facilities',
      requirements: ['Environmental Clearance', 'Local Council Permits'],
      equipment: ['Mini Excavator', 'Concrete Mixer', 'Material Hoist'],
      createdAt: '2024-02-20',
      updatedAt: '2024-02-25'
    }
  ])

  // Sample employee allocations
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>([
    {
      id: 'alloc-1',
      employeeId: '1',
      employeeName: 'Ahmed Hassan Al-Mansouri',
      empId: 'EMP001',
      department: 'Construction',
      designation: 'Site Supervisor',
      skills: ['Project Management', 'Safety Management', 'Team Leadership'],
      siteId: '1',
      siteName: 'Hulhumale Phase II - Block A',
      phaseId: 'phase-2',
      phaseName: 'Structural Framework',
      allocationDate: new Date('2024-03-16'),
      plannedEndDate: new Date('2024-06-15'),
      status: 'on-site',
      role: 'supervisor',
      performanceRating: 4.5,
      allocatedBy: 'Planning Engineer',
      createdAt: '2024-03-10',
      updatedAt: '2024-03-16'
    },
    {
      id: 'alloc-2',
      employeeId: '2',
      employeeName: 'Rajesh Kumar Sharma',
      empId: 'EMP002',
      department: 'Construction',
      designation: 'Steel Worker',
      skills: ['Steel Work', 'Welding', 'Heavy Machinery'],
      siteId: '1',
      siteName: 'Hulhumale Phase II - Block A',
      phaseId: 'phase-2',
      phaseName: 'Structural Framework',
      allocationDate: new Date('2024-03-16'),
      plannedEndDate: new Date('2024-06-15'),
      status: 'on-site',
      role: 'worker',
      performanceRating: 4.2,
      allocatedBy: 'Planning Engineer',
      createdAt: '2024-03-10',
      updatedAt: '2024-03-16'
    }
  ])

  // Filter sites
  const filteredSites = useMemo(() => {
    return projectSites.filter(site => {
      const matchesSearch = searchQuery === '' || 
        site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.siteCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = siteFilter === 'all' || site.status === siteFilter
      const matchesPriority = priorityFilter === 'all' || site.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [projectSites, searchQuery, siteFilter, priorityFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSites = projectSites.length
    const activeSites = projectSites.filter(s => s.status === 'active').length
    const planningSites = projectSites.filter(s => s.status === 'planning').length
    const totalWorkers = employeeAllocations.length
    const availableEmployees = employees.filter(emp => 
      emp.status === 'active' && 
      !employeeAllocations.some(alloc => alloc.employeeId === emp.id && alloc.status === 'on-site')
    ).length
    
    return {
      totalSites,
      activeSites,
      planningSites,
      totalWorkers,
      availableEmployees
    }
  }, [projectSites, employeeAllocations, employees])

  // Handle site creation
  const handleCreateSite = async (siteData: any) => {
    setIsLoading(true)
    try {
      // In real app, this would call API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newSite: ProjectSite = {
        id: Date.now().toString(),
        ...siteData,
        allocatedWorkers: 0,
        phases: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setProjectSites(prev => [newSite, ...prev])
      setIsCreateSiteDialogOpen(false)
      toast.success('Site created successfully')
    } catch (error) {
      toast.error('Failed to create site')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle employee allocation
  const handleAllocateEmployees = async (allocationData: AllocationRequest) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newAllocations: EmployeeAllocation[] = allocationData.employeeIds.map(employeeId => {
        const employee = employees.find(emp => emp.id === employeeId)
        const site = projectSites.find(s => s.id === allocationData.siteId)
        
        return {
          id: `alloc-${Date.now()}-${employeeId}`,
          employeeId,
          employeeName: employee?.name || '',
          empId: employee?.empId || '',
          department: employee?.department || '',
          designation: employee?.designation || '',
          skills: employee?.skills || [],
          siteId: allocationData.siteId,
          siteName: site?.siteName || '',
          phaseId: allocationData.phaseId,
          phaseName: allocationData.phaseId ? site?.phases.find(p => p.id === allocationData.phaseId)?.phaseName : undefined,
          allocationDate: allocationData.startDate,
          plannedEndDate: allocationData.endDate,
          status: 'allocated',
          role: allocationData.role as any,
          notes: allocationData.notes,
          allocatedBy: 'Planning Engineer',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
      })
      
      setEmployeeAllocations(prev => [...prev, ...newAllocations])
      
      // Update site allocated workers count
      setProjectSites(prev => prev.map(site => 
        site.id === allocationData.siteId 
          ? { ...site, allocatedWorkers: site.allocatedWorkers + allocationData.employeeIds.length }
          : site
      ))
      
      setSelectedEmployees([])
      setIsAllocationDialogOpen(false)
      toast.success(`${allocationData.employeeIds.length} employees allocated successfully`)
    } catch (error) {
      toast.error('Failed to allocate employees')
    } finally {
      setIsLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string, config: any) => {
    const statusInfo = config[status]
    if (!statusInfo) return null
    
    const IconComponent = statusInfo.icon
    
    return (
      <Badge variant="outline" className={`${statusInfo.bgColor} ${statusInfo.color} border-current`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {statusInfo.label}
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Site Allocation
          </h1>
          <p className="text-muted-foreground">
            Allocate staff to project sites and manage resource distribution
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateSiteDialogOpen} onOpenChange={setIsCreateSiteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Site
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project Site</DialogTitle>
                <DialogDescription>
                  Add a new construction site for staff allocation
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" placeholder="Enter site name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteCode">Site Code</Label>
                    <Input id="siteCode" placeholder="e.g., HM2-BLK-A" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input id="projectName" placeholder="Enter project name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter site location" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteType">Site Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="renovation">Renovation</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Site description..." />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateSiteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleCreateSite({})}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Site
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalSites}</div>
            <p className="text-xs text-muted-foreground">Project locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.activeSites}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planning Sites</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.planningSites}</div>
            <p className="text-xs text-muted-foreground">In planning phase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated Workers</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.totalWorkers}</div>
            <p className="text-xs text-muted-foreground">Currently on sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Staff</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.availableEmployees}</div>
            <p className="text-xs text-muted-foreground">Ready for allocation</p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sites">Project Sites</TabsTrigger>
          <TabsTrigger value="allocations">Staff Allocations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sites" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sites..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={siteFilter} onValueChange={(value: any) => setSiteFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {filteredSites.length} sites
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sites Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site) => (
              <Card key={site.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{site.siteName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{site.siteCode}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedSite(site)
                          setIsAllocationDialogOpen(true)
                        }}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Allocate Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Site
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">{site.projectName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {site.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(site.status, siteStatusConfig)}
                    {getStatusBadge(site.priority, priorityConfig)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Required</p>
                      <p className="font-medium">{site.requiredWorkers} workers</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Allocated</p>
                      <p className={`font-medium ${
                        site.allocatedWorkers >= site.requiredWorkers 
                          ? 'text-green-600' 
                          : site.allocatedWorkers > 0 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}>
                        {site.allocatedWorkers} workers
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Timeline</span>
                    <span className="font-medium">
                      {formatDate(site.startDate)} - {formatDate(site.endDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedSite(site)
                        setIsAllocationDialogOpen(true)
                      }}
                      disabled={site.status === 'completed' || site.status === 'cancelled'}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Allocate Staff
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {allocation.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{allocation.employeeName}</div>
                            <div className="text-sm text-muted-foreground">
                              {allocation.empId} • {allocation.designation}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{allocation.siteName}</div>
                          {allocation.phaseName && (
                            <div className="text-sm text-muted-foreground">
                              Phase: {allocation.phaseName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {allocation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            allocation.status === 'on-site' ? 'bg-green-50 text-green-700' :
                            allocation.status === 'allocated' ? 'bg-blue-50 text-blue-700' :
                            allocation.status === 'in-transit' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-gray-50 text-gray-700'
                          }
                        >
                          {allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{formatDate(allocation.allocationDate)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(allocation.plannedEndDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {allocation.performanceRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span className="text-sm font-medium">
                              {allocation.performanceRating}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Transfer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Site Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectSites.filter(s => s.status === 'active').map((site) => (
                    <div key={site.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{site.siteName}</span>
                        <span>{site.allocatedWorkers}/{site.requiredWorkers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            site.allocatedWorkers >= site.requiredWorkers 
                              ? 'bg-green-500' 
                              : site.allocatedWorkers > 0 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min((site.allocatedWorkers / site.requiredWorkers) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">4.3</div>
                    <p className="text-sm text-muted-foreground">Average Performance Rating</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Excellent (4.5+)</span>
                      <span className="text-green-600">65%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Good (3.5-4.4)</span>
                      <span className="text-blue-600">25%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average (2.5-3.4)</span>
                      <span className="text-yellow-600">8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Below Average (&lt;2.5)</span>
                      <span className="text-red-600">2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Staff Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Allocate Staff to Site</DialogTitle>
            <DialogDescription>
              {selectedSite ? `Assign employees to ${selectedSite.siteName}` : 'Select employees for allocation'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSite && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">{selectedSite.siteName}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSite.projectName} • {selectedSite.location}
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>Required: {selectedSite.requiredWorkers} workers</span>
                  <span>Allocated: {selectedSite.allocatedWorkers} workers</span>
                  <span>Available: {selectedSite.requiredWorkers - selectedSite.allocatedWorkers} spots</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Available Employees</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEmployees([])}
                      disabled={selectedEmployees.length === 0}
                    >
                      Clear Selection
                    </Button>
                    <Badge variant="outline">
                      {selectedEmployees.length} selected
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedEmployees.length === employees.filter(emp => emp.status === 'active').length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmployees(employees.filter(emp => emp.status === 'active').map(emp => emp.id))
                              } else {
                                setSelectedEmployees([])
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.filter(emp => emp.status === 'active').map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedEmployees.includes(employee.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEmployees(prev => [...prev, employee.id])
                                } else {
                                  setSelectedEmployees(prev => prev.filter(id => id !== employee.id))
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {employee.empId} • {employee.designation}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {employee.skills.slice(0, 2).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {employee.skills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{employee.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAllocationDialogOpen(false)
                setSelectedEmployees([])
                setSelectedSite(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedSite && selectedEmployees.length > 0) {
                  handleAllocateEmployees({
                    siteId: selectedSite.id,
                    employeeIds: selectedEmployees,
                    startDate: new Date(),
                    endDate: selectedSite.endDate,
                    role: 'worker'
                  })
                }
              }}
              disabled={selectedEmployees.length === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Allocating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Allocate {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}