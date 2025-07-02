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
  Plane,
  Ship,
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
  Calendar,
  Navigation,
  Route,
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
  Timer,
  Circle,
  Anchor
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData } from './HRDataContext'
import { format, addHours, isAfter, isBefore, differenceInHours } from 'date-fns'

// Island Transfer Types
interface IslandTransfer {
  id: string
  transferCode: string
  employeeId: string
  employeeName: string
  empId: string
  department: string
  designation: string
  fromIsland: string
  toIsland: string
  fromSite?: string
  toSite?: string
  projectName: string
  departureDate: Date
  departureTime: string
  arrivalDate: Date
  arrivalTime: string
  transportMode: 'seaplane' | 'speedboat' | 'ferry' | 'domestic-flight'
  status: 'scheduled' | 'departed' | 'in-transit' | 'arrived' | 'completed' | 'cancelled' | 'delayed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  purpose: string
  accommodation?: string
  emergencyContact: string
  estimatedDuration: string
  actualDeparture?: Date
  actualArrival?: Date
  transportDetails: {
    provider?: string
    vehicleId?: string
    ticketNumber?: string
    cost?: number
  }
  notes?: string
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

interface TransferRequest {
  employeeIds: string[]
  fromIsland: string
  toIsland: string
  fromSite?: string
  toSite?: string
  projectName: string
  departureDate: Date
  departureTime: string
  arrivalDate: Date
  arrivalTime: string
  transportMode: string
  priority: string
  purpose: string
  notes?: string
}

// Island locations in Maldives
const maldivianIslands = [
  'Male',
  'Hulhumale',
  'Villimale',
  'Addu City (Gan)',
  'Fuvahmulah',
  'Laamu (Laamu Atoll)',
  'Thaa (Kolhumadulu)',
  'Meemu (Mulaku)',
  'Faafu (Nilandhe Atholhu Uthuruburi)',
  'Dhaalu (Nilandhe Atholhu Dhekunu)',
  'Baa (Maalhosmadulu Uthuruburi)',
  'Lhaviyani (Faadhippolhu)',
  'Kaafu (Male Atoll)',
  'Alifu Alifu (Ari Atoll Uthuruburi)',
  'Alifu Dhaalu (Ari Atoll Dhekunu)',
  'Vaavu (Felidhe)',
  'Gaafu Alifu (Huvadhu Atoll Uthuruburi)',
  'Gaafu Dhaalu (Huvadhu Atoll Dhekunu)',
  'Gnaviyani (Fuvahmulah)',
  'Seenu (Addu)'
]

// Transport Mode Configuration
const transportModeConfig = {
  'seaplane': {
    label: 'Seaplane',
    icon: Plane,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    description: 'Fast air transport'
  },
  'speedboat': {
    label: 'Speedboat',
    icon: Ship,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    description: 'Quick water transport'
  },
  'ferry': {
    label: 'Ferry',
    icon: Anchor,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    description: 'Regular passenger ferry'
  },
  'domestic-flight': {
    label: 'Domestic Flight',
    icon: Plane,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    description: 'Domestic airline service'
  }
}

// Transfer Status Configuration
const transferStatusConfig = {
  'scheduled': {
    label: 'Scheduled',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Calendar,
    description: 'Transfer scheduled'
  },
  'departed': {
    label: 'Departed',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: ArrowRight,
    description: 'Staff has departed'
  },
  'in-transit': {
    label: 'In Transit',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: Navigation,
    description: 'Currently traveling'
  },
  'arrived': {
    label: 'Arrived',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle,
    description: 'Staff has arrived'
  },
  'completed': {
    label: 'Completed',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    icon: FileCheck,
    description: 'Transfer completed'
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
    description: 'Transfer cancelled'
  },
  'delayed': {
    label: 'Delayed',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: AlertTriangle,
    description: 'Transfer delayed'
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
  'urgent': {
    label: 'Urgent',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: AlertTriangle
  }
}

export function IslandTransfer() {
  const { employees } = useHRData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'departed' | 'in-transit' | 'arrived' | 'completed' | 'cancelled' | 'delayed'>('all')
  const [islandFilter, setIslandFilter] = useState<string>('all')
  const [isCreateTransferDialogOpen, setIsCreateTransferDialogOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'transfers' | 'schedule' | 'analytics'>('transfers')
  const [isLoading, setIsLoading] = useState(false)

  // Sample island transfers data
  const [islandTransfers, setIslandTransfers] = useState<IslandTransfer[]>([
    {
      id: '1',
      transferCode: 'TRF-2025-001',
      employeeId: '1',
      employeeName: 'Ahmed Hassan Al-Mansouri',
      empId: 'EMP001',
      department: 'Construction',
      designation: 'Site Supervisor',
      fromIsland: 'Male',
      toIsland: 'Hulhumale',
      fromSite: 'Male Office',
      toSite: 'Hulhumale Phase II - Block A',
      projectName: 'Hulhumale Residential Development',
      departureDate: new Date('2025-01-15'),
      departureTime: '08:00',
      arrivalDate: new Date('2025-01-15'),
      arrivalTime: '08:30',
      transportMode: 'speedboat',
      status: 'completed',
      priority: 'medium',
      purpose: 'Site supervision and project coordination',
      accommodation: 'Site accommodation block',
      emergencyContact: '+960 777 1234',
      estimatedDuration: '30 minutes',
      actualDeparture: new Date('2025-01-15T08:05:00'),
      actualArrival: new Date('2025-01-15T08:28:00'),
      transportDetails: {
        provider: 'MTCC',
        vehicleId: 'SB-001',
        ticketNumber: 'TKT-20250115-001',
        cost: 25
      },
      notes: 'Regular transfer for site supervision',
      createdBy: 'Planning Engineer',
      approvedBy: 'Project Manager',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-15'
    },
    {
      id: '2',
      transferCode: 'TRF-2025-002',
      employeeId: '2',
      employeeName: 'Rajesh Kumar Sharma',
      empId: 'EMP002',
      department: 'Construction',
      designation: 'Steel Worker',
      fromIsland: 'Hulhumale',
      toIsland: 'Addu City (Gan)',
      fromSite: 'Hulhumale Phase II - Block A',
      toSite: 'Addu Airport Terminal Extension',
      projectName: 'Airport Terminal Expansion',
      departureDate: new Date('2025-01-20'),
      departureTime: '14:00',
      arrivalDate: new Date('2025-01-20'),
      arrivalTime: '15:30',
      transportMode: 'domestic-flight',
      status: 'scheduled',
      priority: 'high',
      purpose: 'Specialized steel work assignment',
      accommodation: 'Hotel accommodation',
      emergencyContact: '+960 777 5678',
      estimatedDuration: '1 hour 30 minutes',
      transportDetails: {
        provider: 'Maldivian Airlines',
        ticketNumber: 'MA-20250120-045',
        cost: 350
      },
      notes: 'Urgent transfer for specialized steel work project',
      createdBy: 'Planning Engineer',
      createdAt: '2025-01-18',
      updatedAt: '2025-01-18'
    },
    {
      id: '3',
      transferCode: 'TRF-2025-003',
      employeeId: '3',
      employeeName: 'Ali Mohamed Ibrahim',
      empId: 'EMP003',
      department: 'Engineering',
      designation: 'Site Engineer',
      fromIsland: 'Male',
      toIsland: 'Baa (Maalhosmadulu Uthuruburi)',
      fromSite: 'Head Office',
      toSite: 'Resort Construction Site',
      projectName: 'Luxury Resort Development',
      departureDate: new Date('2025-01-22'),
      departureTime: '09:00',
      arrivalDate: new Date('2025-01-22'),
      arrivalTime: '10:15',
      transportMode: 'seaplane',
      status: 'in-transit',
      priority: 'urgent',
      purpose: 'Emergency site inspection and quality assessment',
      accommodation: 'Resort guest quarters',
      emergencyContact: '+960 777 9876',
      estimatedDuration: '1 hour 15 minutes',
      actualDeparture: new Date('2025-01-22T09:05:00'),
      transportDetails: {
        provider: 'Trans Maldivian Airways',
        vehicleId: 'TMA-DHC6-05',
        ticketNumber: 'TMA-20250122-098',
        cost: 450
      },
      notes: 'Emergency transfer for urgent quality issues',
      createdBy: 'Project Manager',
      approvedBy: 'Operations Director',
      createdAt: '2025-01-21',
      updatedAt: '2025-01-22'
    }
  ])

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return islandTransfers.filter(transfer => {
      const matchesSearch = searchQuery === '' || 
        transfer.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.transferCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.fromIsland.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.toIsland.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
      const matchesIsland = islandFilter === 'all' || 
        transfer.fromIsland === islandFilter || 
        transfer.toIsland === islandFilter
      
      return matchesSearch && matchesStatus && matchesIsland
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [islandTransfers, searchQuery, statusFilter, islandFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTransfers = islandTransfers.length
    const scheduledTransfers = islandTransfers.filter(t => t.status === 'scheduled').length
    const inTransitTransfers = islandTransfers.filter(t => t.status === 'in-transit').length
    const completedTransfers = islandTransfers.filter(t => t.status === 'completed').length
    const urgentTransfers = islandTransfers.filter(t => t.priority === 'urgent').length
    
    return {
      totalTransfers,
      scheduledTransfers,
      inTransitTransfers,
      completedTransfers,
      urgentTransfers
    }
  }, [islandTransfers])

  // Handle transfer creation
  const handleCreateTransfer = async (transferData: TransferRequest) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newTransfers: IslandTransfer[] = transferData.employeeIds.map(employeeId => {
        const employee = employees.find(emp => emp.id === employeeId)
        
        return {
          id: `transfer-${Date.now()}-${employeeId}`,
          transferCode: `TRF-2025-${String(islandTransfers.length + 1).padStart(3, '0')}`,
          employeeId,
          employeeName: employee?.name || '',
          empId: employee?.empId || '',
          department: employee?.department || '',
          designation: employee?.designation || '',
          fromIsland: transferData.fromIsland,
          toIsland: transferData.toIsland,
          fromSite: transferData.fromSite,
          toSite: transferData.toSite,
          projectName: transferData.projectName,
          departureDate: transferData.departureDate,
          departureTime: transferData.departureTime,
          arrivalDate: transferData.arrivalDate,
          arrivalTime: transferData.arrivalTime,
          transportMode: transferData.transportMode as any,
          status: 'scheduled',
          priority: transferData.priority as any,
          purpose: transferData.purpose,
          emergencyContact: employee?.phone || '',
          estimatedDuration: calculateDuration(transferData.departureDate, transferData.departureTime, transferData.arrivalDate, transferData.arrivalTime),
          transportDetails: {},
          notes: transferData.notes,
          createdBy: 'Planning Engineer',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
      })
      
      setIslandTransfers(prev => [...prev, ...newTransfers])
      setSelectedEmployees([])
      setIsCreateTransferDialogOpen(false)
      toast.success(`${transferData.employeeIds.length} transfer(s) scheduled successfully`)
    } catch (error) {
      toast.error('Failed to schedule transfers')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate transfer duration
  const calculateDuration = (depDate: Date, depTime: string, arrDate: Date, arrTime: string) => {
    const departure = new Date(`${depDate.toISOString().split('T')[0]}T${depTime}:00`)
    const arrival = new Date(`${arrDate.toISOString().split('T')[0]}T${arrTime}:00`)
    const hours = differenceInHours(arrival, departure)
    const minutes = (arrival.getTime() - departure.getTime()) % (1000 * 60 * 60) / (1000 * 60)
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${Math.round(minutes)} min` : ''}`
    } else {
      return `${Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60))} minutes`
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

  // Format date and time
  const formatDateTime = (date: Date | string | undefined, time?: string) => {
    if (!date) return '-'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const dateStr = format(dateObj, 'MMM dd, yyyy')
    return time ? `${dateStr} ${time}` : dateStr
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Island Transfer
          </h1>
          <p className="text-muted-foreground">
            Manage staff transfers between islands for project assignments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateTransferDialogOpen} onOpenChange={setIsCreateTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Island Transfer</DialogTitle>
                <DialogDescription>
                  Schedule staff transfer between islands for project assignments
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Transfer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromIsland">From Island</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select departure island" />
                      </SelectTrigger>
                      <SelectContent>
                        {maldivianIslands.map((island) => (
                          <SelectItem key={island} value={island}>{island}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toIsland">To Island</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination island" />
                      </SelectTrigger>
                      <SelectContent>
                        {maldivianIslands.map((island) => (
                          <SelectItem key={island} value={island}>{island}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromSite">From Site (Optional)</Label>
                    <Input id="fromSite" placeholder="Departure site/location" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toSite">To Site (Optional)</Label>
                    <Input id="toSite" placeholder="Destination site/location" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input id="projectName" placeholder="Enter project name" />
                </div>

                {/* Departure Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureDate">Departure Date</Label>
                    <Input id="departureDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input id="departureTime" type="time" />
                  </div>
                </div>

                {/* Arrival Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrivalDate">Arrival Date</Label>
                    <Input id="arrivalDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrivalTime">Arrival Time</Label>
                    <Input id="arrivalTime" type="time" />
                  </div>
                </div>

                {/* Transport and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transportMode">Transport Mode</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seaplane">Seaplane</SelectItem>
                        <SelectItem value="speedboat">Speedboat</SelectItem>
                        <SelectItem value="ferry">Ferry</SelectItem>
                        <SelectItem value="domestic-flight">Domestic Flight</SelectItem>
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
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Transfer</Label>
                  <Textarea id="purpose" placeholder="Describe the purpose of this transfer..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" placeholder="Any additional notes or special requirements..." />
                </div>

                {/* Employee Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Select Employees</h4>
                    <Badge variant="outline">
                      {selectedEmployees.length} selected
                    </Badge>
                  </div>
                  
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.filter(emp => emp.status === 'active').slice(0, 10).map((employee) => (
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateTransferDialogOpen(false)
                    setSelectedEmployees([])
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedEmployees.length > 0) {
                      handleCreateTransfer({
                        employeeIds: selectedEmployees,
                        fromIsland: 'Male',
                        toIsland: 'Hulhumale',
                        projectName: 'Sample Project',
                        departureDate: new Date(),
                        departureTime: '09:00',
                        arrivalDate: new Date(),
                        arrivalTime: '10:00',
                        transportMode: 'speedboat',
                        priority: 'medium',
                        purpose: 'Project assignment'
                      })
                    }
                  }}
                  disabled={selectedEmployees.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Transfer
                    </>
                  )}
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
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalTransfers}</div>
            <p className="text-xs text-muted-foreground">All time transfers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.scheduledTransfers}</div>
            <p className="text-xs text-muted-foreground">Upcoming transfers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Route className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.inTransitTransfers}</div>
            <p className="text-xs text-muted-foreground">Currently traveling</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.completedTransfers}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryStats.urgentTransfers}</div>
            <p className="text-xs text-muted-foreground">Urgent priority</p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transfers">All Transfers</TabsTrigger>
          <TabsTrigger value="schedule">Transfer Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transfers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transfers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="departed">Departed</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={islandFilter} onValueChange={setIslandFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Islands</SelectItem>
                      {maldivianIslands.slice(0, 10).map((island) => (
                        <SelectItem key={island} value={island}>{island}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {filteredTransfers.length} transfers
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfers Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transfer.transferCode}</div>
                          <div className="text-sm text-muted-foreground">
                            {transfer.projectName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {transfer.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{transfer.employeeName}</div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.empId} • {transfer.designation}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            <div className="font-medium">{transfer.fromIsland}</div>
                            <div className="text-muted-foreground">to {transfer.toIsland}</div>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div className="font-medium">
                            Dep: {formatDateTime(transfer.departureDate, transfer.departureTime)}
                          </div>
                          <div className="text-muted-foreground">
                            Arr: {formatDateTime(transfer.arrivalDate, transfer.arrivalTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transfer.transportMode, transportModeConfig)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transfer.status, transferStatusConfig)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transfer.priority, priorityConfig)}
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
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Transfer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Transfer
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
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransfers
                  .filter(t => t.status === 'scheduled' || t.status === 'in-transit')
                  .map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium">{transfer.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {transfer.fromIsland} → {transfer.toIsland}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatDateTime(transfer.departureDate, transfer.departureTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transfer.transportMode}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Male → Hulhumale</span>
                    <Badge variant="outline">5 transfers</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hulhumale → Addu City</span>
                    <Badge variant="outline">3 transfers</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Male → Baa Atoll</span>
                    <Badge variant="outline">2 transfers</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transport Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Speedboat</span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seaplane</span>
                    <span className="text-sm text-muted-foreground">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Domestic Flight</span>
                    <span className="text-sm text-muted-foreground">20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ferry</span>
                    <span className="text-sm text-muted-foreground">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}