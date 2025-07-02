"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { ScrollArea } from './ui/scroll-area'
import { BaseModal } from './BaseModal'
import { 
  UserPlus, Users, Target, MoreHorizontal, Plus, Edit3, Trash2, 
  Search, Filter, RefreshCw, Download, CheckCircle, XCircle,
  AlertCircle, Clock, TrendingUp, TrendingDown, BarChart3,
  Network, FileText, Calendar, Building2, MapPin, Banknote
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface QuotaPool {
  id: string
  name: string
  totalSlots: number
  assignedSlots: number
  availableSlots: number
  designations: {
    name: string
    salary: number
    slots: number
  }[]
  status: 'active' | 'inactive'
}

interface Agent {
  id: string
  name: string
  email: string
  company: string
  location: string
  status: 'active' | 'inactive' | 'suspended'
  profileImage?: string
}

interface SlotAssignment {
  id: string
  agentId: string
  agentName: string
  agentCompany: string
  quotaPoolId: string
  quotaPoolName: string
  assignedSlots: {
    designation: string
    salary: number
    totalSlots: number
    usedSlots: number
    remainingSlots: number
  }[]
  totalAssignedSlots: number
  totalUsedSlots: number
  assignedDate: string
  expiryDate?: string
  status: 'active' | 'expired' | 'exhausted'
}

// Mock data
const mockQuotaPools: QuotaPool[] = [
  {
    id: '1',
    name: 'Construction Workers Q1 2024',
    totalSlots: 100,
    assignedSlots: 60,
    availableSlots: 40,
    designations: [
      { name: 'Civil Engineer', salary: 25000, slots: 20 },
      { name: 'Project Manager', salary: 35000, slots: 15 },
      { name: 'Site Supervisor', salary: 20000, slots: 25 }
    ],
    status: 'active'
  },
  {
    id: '2',
    name: 'IT Professionals 2024',
    totalSlots: 50,
    assignedSlots: 30,
    availableSlots: 20,
    designations: [
      { name: 'Software Developer', salary: 30000, slots: 15 },
      { name: 'System Administrator', salary: 28000, slots: 10 },
      { name: 'Database Administrator', salary: 32000, slots: 5 }
    ],
    status: 'active'
  }
]

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    email: 'ahmed@globaltrek.mv',
    company: 'Global Trek Recruitment',
    location: 'Male, Maldives',
    status: 'active'
  },
  {
    id: '2',
    name: 'Fatima Al-Rashid',
    email: 'fatima@oceanrecruits.com',
    company: 'Ocean Recruitment Services',
    location: 'Hulhumale, Maldives',
    status: 'active'
  }
]

const mockAssignments: SlotAssignment[] = [
  {
    id: '1',
    agentId: '1',
    agentName: 'Ahmed Hassan',
    agentCompany: 'Global Trek Recruitment',
    quotaPoolId: '1',
    quotaPoolName: 'Construction Workers Q1 2024',
    assignedSlots: [
      { designation: 'Civil Engineer', salary: 25000, totalSlots: 10, usedSlots: 6, remainingSlots: 4 },
      { designation: 'Project Manager', salary: 35000, totalSlots: 5, usedSlots: 2, remainingSlots: 3 }
    ],
    totalAssignedSlots: 15,
    totalUsedSlots: 8,
    assignedDate: '2024-01-15',
    expiryDate: '2024-12-31',
    status: 'active'
  },
  {
    id: '2',
    agentId: '2',
    agentName: 'Fatima Al-Rashid',
    agentCompany: 'Ocean Recruitment Services',
    quotaPoolId: '2',
    quotaPoolName: 'IT Professionals 2024',
    assignedSlots: [
      { designation: 'Software Developer', salary: 30000, totalSlots: 8, usedSlots: 5, remainingSlots: 3 },
      { designation: 'System Administrator', salary: 28000, totalSlots: 4, usedSlots: 1, remainingSlots: 3 }
    ],
    totalAssignedSlots: 12,
    totalUsedSlots: 6,
    assignedDate: '2024-01-20',
    expiryDate: '2024-12-31',
    status: 'active'
  }
]

interface AssignmentFormData {
  agentId: string
  quotaPoolId: string
  designationSlots: {
    designation: string
    salary: number
    slots: number
  }[]
  expiryDate: string
}

export function SlotAssignment() {
  const [quotaPools, setQuotaPools] = useState<QuotaPool[]>(mockQuotaPools)
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [assignments, setAssignments] = useState<SlotAssignment[]>(mockAssignments)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<SlotAssignment | null>(null)
  const [formData, setFormData] = useState<AssignmentFormData>({
    agentId: '',
    quotaPoolId: '',
    designationSlots: [],
    expiryDate: ''
  })

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.agentCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.quotaPoolName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAssignSlots = () => {
    if (!formData.agentId || !formData.quotaPoolId || formData.designationSlots.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const agent = agents.find(a => a.id === formData.agentId)
    const quotaPool = quotaPools.find(q => q.id === formData.quotaPoolId)
    
    if (!agent || !quotaPool) {
      toast.error('Invalid agent or quota pool selected')
      return
    }

    const totalSlotsToAssign = formData.designationSlots.reduce((sum, slot) => sum + slot.slots, 0)
    
    if (totalSlotsToAssign > quotaPool.availableSlots) {
      toast.error(`Cannot assign ${totalSlotsToAssign} slots. Only ${quotaPool.availableSlots} slots available.`)
      return
    }

    const newAssignment: SlotAssignment = {
      id: Date.now().toString(),
      agentId: formData.agentId,
      agentName: agent.name,
      agentCompany: agent.company,
      quotaPoolId: formData.quotaPoolId,
      quotaPoolName: quotaPool.name,
      assignedSlots: formData.designationSlots.map(slot => ({
        designation: slot.designation,
        salary: slot.salary,
        totalSlots: slot.slots,
        usedSlots: 0,
        remainingSlots: slot.slots
      })),
      totalAssignedSlots: totalSlotsToAssign,
      totalUsedSlots: 0,
      assignedDate: new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate,
      status: 'active'
    }

    setAssignments(prev => [...prev, newAssignment])
    
    // Update quota pool availability
    setQuotaPools(prev => prev.map(pool => 
      pool.id === formData.quotaPoolId 
        ? { 
            ...pool, 
            assignedSlots: pool.assignedSlots + totalSlotsToAssign,
            availableSlots: pool.availableSlots - totalSlotsToAssign
          }
        : pool
    ))

    setIsAssignModalOpen(false)
    resetForm()
    toast.success(`Successfully assigned ${totalSlotsToAssign} slots to ${agent.name}`)
  }

  const handleRevokeAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment) return

    if (assignment.totalUsedSlots > 0) {
      toast.error('Cannot revoke assignment with used slots. Please contact candidates first.')
      return
    }

    setAssignments(prev => prev.filter(a => a.id !== assignmentId))
    
    // Return slots to quota pool
    setQuotaPools(prev => prev.map(pool => 
      pool.id === assignment.quotaPoolId 
        ? { 
            ...pool, 
            assignedSlots: pool.assignedSlots - assignment.totalAssignedSlots,
            availableSlots: pool.availableSlots + assignment.totalAssignedSlots
          }
        : pool
    ))

    toast.success('Slot assignment revoked successfully')
  }

  const resetForm = () => {
    setFormData({
      agentId: '',
      quotaPoolId: '',
      designationSlots: [],
      expiryDate: ''
    })
  }

  const addDesignationSlot = () => {
    const selectedPool = quotaPools.find(p => p.id === formData.quotaPoolId)
    if (!selectedPool) return

    setFormData(prev => ({
      ...prev,
      designationSlots: [...prev.designationSlots, {
        designation: '',
        salary: 0,
        slots: 1
      }]
    }))
  }

  const removeDesignationSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      designationSlots: prev.designationSlots.filter((_, i) => i !== index)
    }))
  }

  const updateDesignationSlot = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      designationSlots: prev.designationSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  const getStatusColor = (status: SlotAssignment['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'exhausted':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Slot Assignment</h1>
          <p className="text-muted-foreground">
            Assign quota slots to recruitment agents from available pools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast('Generating assignment report...')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setIsAssignModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Slots
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active slot assignments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Slots</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.reduce((sum, a) => sum + a.totalAssignedSlots, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total slots assigned to agents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Slots</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.reduce((sum, a) => sum + a.totalUsedSlots, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Slots used by agents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.length > 0 ? Math.round(
                (assignments.reduce((sum, a) => sum + a.totalUsedSlots, 0) /
                 assignments.reduce((sum, a) => sum + a.totalAssignedSlots, 0)) * 100
              ) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average slot utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="exhausted">Exhausted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast('Refreshing assignments...')}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Slot Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Quota Pool</TableHead>
                <TableHead>Assigned Slots</TableHead>
                <TableHead>Used Slots</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {assignment.agentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{assignment.agentName}</div>
                        <div className="text-sm text-muted-foreground">{assignment.agentCompany}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assignment.quotaPoolName}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.assignedSlots.length} designations
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{assignment.totalAssignedSlots}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{assignment.totalUsedSlots}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${getUsagePercentage(assignment.totalUsedSlots, assignment.totalAssignedSlots)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {getUsagePercentage(assignment.totalUsedSlots, assignment.totalAssignedSlots)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(assignment.status)} variant="secondary">
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedAssignment(assignment)
                          // Set form data for editing
                          setIsEditModalOpen(true)
                        }}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Assignment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRevokeAssignment(assignment.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Revoke Assignment
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

      {/* Assign Slots Modal */}
      <BaseModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        title="Assign Slots to Agent"
        description="Allocate quota slots to a recruitment agent"
        icon={<UserPlus className="h-5 w-5" />}
        defaultSize="maximized"
      >
        <div className="flex flex-col h-full">
          {/* Fixed Header Section */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agent">Select Agent *</Label>
                <Select 
                  value={formData.agentId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, agentId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.filter(a => a.status === 'active').map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center space-x-2">
                          <span>{agent.name}</span>
                          <span className="text-muted-foreground">- {agent.company}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quotaPool">Select Quota Pool *</Label>
                <Select 
                  value={formData.quotaPoolId} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      quotaPoolId: value, 
                      designationSlots: [] 
                    }))
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose quota pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {quotaPools.filter(p => p.status === 'active' && p.availableSlots > 0).map(pool => (
                      <SelectItem key={pool.id} value={pool.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{pool.name}</span>
                          <span className="text-muted-foreground">({pool.availableSlots} available)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content Section */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-4">
              {formData.quotaPoolId && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Designation Slots *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDesignationSlot}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Designation
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.designationSlots.map((slot, index) => {
                      const selectedPool = quotaPools.find(p => p.id === formData.quotaPoolId)
                      return (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                              <Label>Designation</Label>
                              <Select 
                                value={slot.designation} 
                                onValueChange={(value) => {
                                  const designation = selectedPool?.designations.find(d => d.name === value)
                                  updateDesignationSlot(index, 'designation', value)
                                  if (designation) {
                                    updateDesignationSlot(index, 'salary', designation.salary)
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedPool?.designations.map(designation => (
                                    <SelectItem key={designation.name} value={designation.name}>
                                      {designation.name} - ${designation.salary.toLocaleString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Salary</Label>
                              <Input
                                type="number"
                                value={slot.salary}
                                onChange={(e) => updateDesignationSlot(index, 'salary', parseInt(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label>Slots</Label>
                              <Input
                                type="number"
                                min="1"
                                value={slot.slots}
                                onChange={(e) => updateDesignationSlot(index, 'slots', parseInt(e.target.value) || 1)}
                                className="mt-1"
                              />
                            </div>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDesignationSlot(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                  
                  {formData.designationSlots.length > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Total Slots to Assign:</span>
                        <span className="font-medium">
                          {formData.designationSlots.reduce((sum, slot) => sum + slot.slots, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Available in Pool:</span>
                        <span className="font-medium">
                          {quotaPools.find(p => p.id === formData.quotaPoolId)?.availableSlots || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Fixed Footer Section */}
          <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsAssignModalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleAssignSlots}
                disabled={!formData.agentId || !formData.quotaPoolId || formData.designationSlots.length === 0}
              >
                Assign Slots
              </Button>
            </div>
          </div>
        </div>
      </BaseModal>
    </div>
  )
}