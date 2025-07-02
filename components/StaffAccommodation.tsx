"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Building2, Home, Bed, Users, UserCheck, UserX, 
  Plus, Search, Filter, Eye, Edit3, Trash2, MapPin,
  Layers, Hash, CheckCircle, AlertCircle, Clock,
  Building, User, Calendar, Phone, Mail, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface AccommodationStats {
  totalBuildings: number
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  vacantBeds: number
  occupancyRate: number
}

interface Building {
  id: string
  name: string
  location: string
  floors: number
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  status: 'active' | 'maintenance' | 'inactive'
}

interface Room {
  id: string
  buildingId: string
  buildingName: string
  floor: number
  roomNumber: string
  roomType: 'single' | 'double' | 'triple' | 'quad' | 'dormitory'
  totalBeds: number
  occupiedBeds: number
  status: 'available' | 'full' | 'maintenance'
}

interface Bed {
  id: string
  buildingId: string
  buildingName: string
  roomId: string
  roomNumber: string
  floor: number
  bedNumber: string
  status: 'occupied' | 'vacant' | 'maintenance' | 'reserved'
  occupant?: {
    employeeId: string
    name: string
    department: string
    phone: string
    email: string
    checkInDate: string
    expectedCheckOut?: string
  }
}

export function StaffAccommodation() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all')
  const [selectedFloor, setSelectedFloor] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)

  // Mock accommodation statistics
  const stats: AccommodationStats = {
    totalBuildings: 8,
    totalRooms: 156,
    totalBeds: 624,
    occupiedBeds: 487,
    vacantBeds: 137,
    occupancyRate: 78.0
  }

  // Mock buildings data
  const [buildings] = useState<Building[]>([
    {
      id: '1',
      name: 'Sunrise Block A',
      location: 'North Campus',
      floors: 4,
      totalRooms: 32,
      totalBeds: 128,
      occupiedBeds: 102,
      status: 'active'
    },
    {
      id: '2',
      name: 'Sunrise Block B',
      location: 'North Campus',
      floors: 4,
      totalRooms: 32,
      totalBeds: 128,
      occupiedBeds: 95,
      status: 'active'
    },
    {
      id: '3',
      name: 'Oceanview Tower',
      location: 'Central Campus',
      floors: 6,
      totalRooms: 48,
      totalBeds: 96,
      occupiedBeds: 78,
      status: 'active'
    },
    {
      id: '4',
      name: 'Palm Villa',
      location: 'South Campus',
      floors: 2,
      totalRooms: 20,
      totalBeds: 80,
      occupiedBeds: 65,
      status: 'active'
    },
    {
      id: '5',
      name: 'Staff Quarters East',
      location: 'East Campus',
      floors: 3,
      totalRooms: 24,
      totalBeds: 96,
      occupiedBeds: 72,
      status: 'maintenance'
    }
  ])

  // Mock rooms data
  const [rooms] = useState<Room[]>([
    {
      id: '1',
      buildingId: '1',
      buildingName: 'Sunrise Block A',
      floor: 1,
      roomNumber: '101',
      roomType: 'quad',
      totalBeds: 4,
      occupiedBeds: 3,
      status: 'available'
    },
    {
      id: '2',
      buildingId: '1',
      buildingName: 'Sunrise Block A',
      floor: 1,
      roomNumber: '102',
      roomType: 'quad',
      totalBeds: 4,
      occupiedBeds: 4,
      status: 'full'
    },
    {
      id: '3',
      buildingId: '1',
      buildingName: 'Sunrise Block A',
      floor: 1,
      roomNumber: '103',
      roomType: 'quad',
      totalBeds: 4,
      occupiedBeds: 2,
      status: 'available'
    },
    {
      id: '4',
      buildingId: '3',
      buildingName: 'Oceanview Tower',
      floor: 2,
      roomNumber: '201',
      roomType: 'double',
      totalBeds: 2,
      occupiedBeds: 1,
      status: 'available'
    }
  ])

  // Mock beds data
  const [beds] = useState<Bed[]>([
    {
      id: '1',
      buildingId: '1',
      buildingName: 'Sunrise Block A',
      roomId: '1',
      roomNumber: '101',
      floor: 1,
      bedNumber: 'A',
      status: 'occupied',
      occupant: {
        employeeId: 'EMP001',
        name: 'Ahmed Hassan',
        department: 'Construction',
        phone: '+960 123-4567',
        email: 'ahmed.hassan@company.com',
        checkInDate: '2024-01-15'
      }
    },
    {
      id: '2',
      buildingId: '1',
      buildingName: 'Sunrise Block A',
      roomId: '1',
      roomNumber: '101',
      floor: 1,
      bedNumber: 'B',
      status: 'occupied',
      occupant: {
        employeeId: 'EMP002',
        name: 'Mohammad Ali',
        department: 'Engineering',
        phone: '+960 123-4568',
        email: 'mohammad.ali@company.com',
        checkInDate: '2024-02-01'
      }
    },
    {
      id: '3',
      buildingId: '1',
      buildingName: 'Sunrise Block A',
      roomId: '1',
      roomNumber: '101',
      floor: 1,
      bedNumber: 'C',
      status: 'occupied',
      occupant: {
        employeeId: 'EMP003',
        name: 'Rajesh Kumar',
        department: 'Electrical',
        phone: '+960 123-4569',
        email: 'rajesh.kumar@company.com',
        checkInDate: '2024-01-20'
      }
    },
    {
      id: '4',
      buildingId: '1',
      buildingName: 'Sunrise Block A',
      roomId: '1',
      roomNumber: '101',
      floor: 1,
      bedNumber: 'D',
      status: 'vacant'
    },
    {
      id: '5',
      buildingId: '3',
      buildingName: 'Oceanview Tower',
      roomId: '4',
      roomNumber: '201',
      floor: 2,
      bedNumber: 'A',
      status: 'occupied',
      occupant: {
        employeeId: 'EMP004',
        name: 'James Wilson',
        department: 'Management',
        phone: '+960 123-4570',
        email: 'james.wilson@company.com',
        checkInDate: '2024-03-01'
      }
    },
    {
      id: '6',
      buildingId: '3',
      buildingName: 'Oceanview Tower',
      roomId: '4',
      roomNumber: '201',
      floor: 2,
      bedNumber: 'B',
      status: 'vacant'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
      case 'active':
      case 'full':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'vacant':
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'reserved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single (1 bed)'
      case 'double': return 'Double (2 beds)'
      case 'triple': return 'Triple (3 beds)'
      case 'quad': return 'Quad (4 beds)'
      case 'dormitory': return 'Dormitory (6+ beds)'
      default: return type
    }
  }

  const handleAssignBed = (bed: Bed) => {
    setSelectedBed(bed)
    setIsAssignDialogOpen(true)
  }

  const handleBedAssignment = () => {
    setIsAssignDialogOpen(false)
    toast.success('Bed assignment updated successfully')
  }

  const filteredRooms = rooms.filter(room => {
    const matchesBuilding = selectedBuilding === 'all' || room.buildingId === selectedBuilding
    const matchesFloor = selectedFloor === 'all' || room.floor.toString() === selectedFloor
    const matchesSearch = searchQuery === '' || 
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.buildingName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesBuilding && matchesFloor && matchesSearch
  })

  const filteredBeds = beds.filter(bed => {
    const matchesBuilding = selectedBuilding === 'all' || bed.buildingId === selectedBuilding
    const matchesFloor = selectedFloor === 'all' || bed.floor.toString() === selectedFloor
    const matchesSearch = searchQuery === '' || 
      bed.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bed.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bed.occupant?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (bed.occupant?.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    return matchesBuilding && matchesFloor && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Accommodation Management</h1>
          <p className="text-muted-foreground">
            Manage buildings, rooms, beds, and staff accommodation assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Building
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuildings}</div>
            <p className="text-xs text-muted-foreground">
              Across all campuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              All room types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBeds}</div>
            <p className="text-xs text-muted-foreground">
              Maximum capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupiedBeds}</div>
            <p className="text-xs text-muted-foreground">
              Currently occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Beds</CardTitle>
            <UserX className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.vacantBeds}</div>
            <p className="text-xs text-muted-foreground">
              Available for assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              Current utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Buildings Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms Management</TabsTrigger>
          <TabsTrigger value="beds">Bed Management</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        {/* Buildings Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buildings Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overview of all accommodation buildings and their capacity
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {buildings.map((building) => (
                  <Card key={building.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{building.name}</h4>
                          <p className="text-sm text-muted-foreground">{building.location}</p>
                        </div>
                        <Badge className={getStatusColor(building.status)}>
                          {building.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Floors:</span>
                          <span>{building.floors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rooms:</span>
                          <span>{building.totalRooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Beds:</span>
                          <span>{building.totalBeds}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Occupied:</span>
                          <span className="text-red-600">{building.occupiedBeds}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="text-green-600">{building.totalBeds - building.occupiedBeds}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Occupancy Rate:</span>
                          <span>{Math.round((building.occupiedBeds / building.totalBeds) * 100)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Management Tab */}
        <TabsContent value="rooms" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rooms, buildings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floors</SelectItem>
                    <SelectItem value="1">Floor 1</SelectItem>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                    <SelectItem value="4">Floor 4</SelectItem>
                    <SelectItem value="5">Floor 5</SelectItem>
                    <SelectItem value="6">Floor 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rooms List */}
          <Card>
            <CardHeader>
              <CardTitle>Rooms ({filteredRooms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Home className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <div className="font-medium">
                          {room.buildingName} - Room {room.roomNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Floor {room.floor} • {getRoomTypeLabel(room.roomType)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {room.occupiedBeds}/{room.totalBeds} beds occupied
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {room.totalBeds - room.occupiedBeds} available
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(room.status)}>
                        {room.status}
                      </Badge>
                      
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Beds
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bed Management Tab */}
        <TabsContent value="beds" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search beds, rooms, occupants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floors</SelectItem>
                    <SelectItem value="1">Floor 1</SelectItem>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                    <SelectItem value="4">Floor 4</SelectItem>
                    <SelectItem value="5">Floor 5</SelectItem>
                    <SelectItem value="6">Floor 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Beds Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Beds ({filteredBeds.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBeds.map((bed) => (
                  <Card key={bed.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {bed.buildingName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Room {bed.roomNumber} • Floor {bed.floor} • Bed {bed.bedNumber}
                          </p>
                        </div>
                        <Badge className={getStatusColor(bed.status)}>
                          {bed.status}
                        </Badge>
                      </div>
                      
                      {bed.occupant ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{bed.occupant.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span>{bed.occupant.employeeId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span>{bed.occupant.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>Since {bed.occupant.checkInDate}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Bed className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Bed available</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAssignBed(bed)}
                        >
                          {bed.status === 'occupied' ? 'Reassign' : 'Assign'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Bed Assignments</CardTitle>
              <p className="text-sm text-muted-foreground">
                All currently occupied beds and their occupants
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBeds.filter(bed => bed.status === 'occupied').map((bed) => (
                  <div key={bed.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Bed className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <div className="font-medium">
                          {bed.buildingName} - Room {bed.roomNumber} - Bed {bed.bedNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Floor {bed.floor}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {bed.occupant && (
                        <div className="text-right">
                          <div className="font-medium">{bed.occupant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {bed.occupant.employeeId} • {bed.occupant.department}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAssignBed(bed)}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bed Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBed?.status === 'occupied' ? 'Reassign' : 'Assign'} Bed
            </DialogTitle>
            <DialogDescription>
              {selectedBed && `${selectedBed.buildingName} - Room ${selectedBed.roomNumber} - Bed ${selectedBed.bedNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedBed?.occupant && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Occupant</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Name</Label>
                    <div>{selectedBed.occupant.name}</div>
                  </div>
                  <div>
                    <Label>Employee ID</Label>
                    <div>{selectedBed.occupant.employeeId}</div>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <div>{selectedBed.occupant.department}</div>
                  </div>
                  <div>
                    <Label>Check-in Date</Label>
                    <div>{selectedBed.occupant.checkInDate}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" placeholder="Enter employee ID" />
              </div>
              <div>
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input id="employeeName" placeholder="Enter employee name" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Enter department" />
              </div>
              <div>
                <Label htmlFor="checkInDate">Check-in Date</Label>
                <Input id="checkInDate" type="date" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="expectedCheckOut">Expected Check-out Date (Optional)</Label>
              <Input id="expectedCheckOut" type="date" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBedAssignment}>
              {selectedBed?.status === 'occupied' ? 'Update Assignment' : 'Assign Bed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}