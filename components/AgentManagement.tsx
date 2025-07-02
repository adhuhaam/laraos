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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { BaseModal } from './BaseModal'
import { 
  Network, Plus, Search, Filter, MoreHorizontal, Edit3, Trash2, 
  UserCheck, UserX, Mail, Phone, MapPin, Calendar, Users,
  Activity, TrendingUp, TrendingDown, FileText, Eye, Download,
  CheckCircle, AlertCircle, Clock, Globe, Key, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface Agent {
  id: string
  name: string
  email: string
  phone: string
  company: string
  location: string
  registrationDate: string
  status: 'active' | 'inactive' | 'suspended'
  totalCandidates: number
  activeCandidates: number
  placedCandidates: number
  successRate: number
  lastLogin: string
  profileImage?: string
  address?: string
  licenseNumber?: string
  website?: string
}

const defaultAgents: Agent[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    email: 'ahmed@globaltrek.mv',
    phone: '+960 777-1234',
    company: 'Global Trek Recruitment',
    location: 'Male, Maldives',
    registrationDate: '2023-01-15',
    status: 'active',
    totalCandidates: 45,
    activeCandidates: 12,
    placedCandidates: 28,
    successRate: 82.3,
    lastLogin: '2024-01-15T10:30:00Z',
    licenseNumber: 'MRA-2023-001',
    website: 'www.globaltrek.mv'
  },
  {
    id: '2',
    name: 'Fatima Al-Rashid',
    email: 'fatima@oceanrecruits.com',
    phone: '+960 777-5678',
    company: 'Ocean Recruitment Services',
    location: 'Hulhumale, Maldives',
    registrationDate: '2023-03-22',
    status: 'active',
    totalCandidates: 32,
    activeCandidates: 8,
    placedCandidates: 19,
    successRate: 75.6,
    lastLogin: '2024-01-14T15:45:00Z',
    licenseNumber: 'MRA-2023-008',
    website: 'www.oceanrecruits.com'
  },
  {
    id: '3',
    name: 'Mohamed Nasheed',
    email: 'mohamed@skillbridge.mv',
    phone: '+960 777-9012',
    company: 'SkillBridge Consultancy',
    location: 'Addu City, Maldives',
    registrationDate: '2023-06-10',
    status: 'suspended',
    totalCandidates: 18,
    activeCandidates: 0,
    placedCandidates: 11,
    successRate: 68.4,
    lastLogin: '2023-12-28T09:15:00Z',
    licenseNumber: 'MRA-2023-015'
  },
  {
    id: '4',
    name: 'Aishath Ibrahim',
    email: 'aishath@talentconnect.mv',
    phone: '+960 777-3456',
    company: 'Talent Connect',
    location: 'Fuvahmulah, Maldives',
    registrationDate: '2023-08-05',
    status: 'active',
    totalCandidates: 27,
    activeCandidates: 6,
    placedCandidates: 16,
    successRate: 71.8,
    lastLogin: '2024-01-13T12:20:00Z',
    licenseNumber: 'MRA-2023-021',
    website: 'www.talentconnect.mv'
  }
]

interface AgentFormData {
  name: string
  email: string
  phone: string
  company: string
  location: string
  address: string
  licenseNumber: string
  website: string
}

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents)
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(defaultAgents)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    address: '',
    licenseNumber: '',
    website: ''
  })

  // Filter agents based on search and status
  useEffect(() => {
    let filtered = agents

    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter)
    }

    setFilteredAgents(filtered)
  }, [agents, searchQuery, statusFilter])

  const handleCreateAgent = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.company) {
      toast.error('Please fill in all required fields')
      return
    }

    const newAgent: Agent = {
      id: Date.now().toString(),
      ...formData,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'active',
      totalCandidates: 0,
      activeCandidates: 0,
      placedCandidates: 0,
      successRate: 0,
      lastLogin: ''
    }

    setAgents(prev => [...prev, newAgent])
    setIsCreateModalOpen(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      address: '',
      licenseNumber: '',
      website: ''
    })
    toast.success('Agent created successfully')
  }

  const handleEditAgent = () => {
    if (!selectedAgent || !formData.name || !formData.email || !formData.phone || !formData.company) {
      toast.error('Please fill in all required fields')
      return
    }

    setAgents(prev => prev.map(agent => 
      agent.id === selectedAgent.id 
        ? { ...agent, ...formData }
        : agent
    ))
    setIsEditModalOpen(false)
    setSelectedAgent(null)
    toast.success('Agent updated successfully')
  }

  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId))
    toast.success('Agent deleted successfully')
  }

  const handleStatusChange = (agentId: string, newStatus: Agent['status']) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: newStatus }
        : agent
    ))
    toast.success(`Agent status updated to ${newStatus}`)
  }

  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent)
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      company: agent.company,
      location: agent.location,
      address: agent.address || '',
      licenseNumber: agent.licenseNumber || '',
      website: agent.website || ''
    })
    setIsEditModalOpen(true)
  }

  const openDetailsModal = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsDetailsModalOpen(true)
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'inactive':
        return <Clock className="h-4 w-4" />
      case 'suspended':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Management</h1>
          <p className="text-muted-foreground">
            Manage recruitment agents and their access to the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast('Generating agent report...')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered recruitment partners
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active and recruiting
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.reduce((sum, agent) => sum + agent.totalCandidates, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Submitted by all agents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.length > 0 ? Math.round(agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average placement success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
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
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast('Refreshing agent data...')}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={agent.profileImage} alt={agent.name} />
                    <AvatarFallback>
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.company}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openDetailsModal(agent)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditModal(agent)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Agent
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {agent.status === 'active' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'suspended')}>
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend Agent
                      </DropdownMenuItem>
                    )}
                    {agent.status === 'suspended' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'active')}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate Agent
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Agent
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {agent.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAgent(agent.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Badge className={getStatusColor(agent.status)} variant="secondary">
                  {getStatusIcon(agent.status)}
                  <span className="ml-1 capitalize">{agent.status}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Success Rate: {agent.successRate}%
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{agent.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{agent.location}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{agent.totalCandidates}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">{agent.activeCandidates}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{agent.placedCandidates}</div>
                  <div className="text-xs text-muted-foreground">Placed</div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Last Login: {formatDateTime(agent.lastLogin)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No agents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria' 
              : 'Get started by adding your first recruitment agent'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Agent
            </Button>
          )}
        </div>
      )}

      {/* Create Agent Modal */}
      <BaseModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Add New Agent"
        description="Register a new recruitment agent to the system"
        icon={<Plus className="h-5 w-5" />}
      >
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Agent's full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="agent@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+960 777-1234"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Recruitment company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="MRA-2024-XXX"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="www.company.com"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Complete business address"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleCreateAgent}
            >
              Create Agent
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* Edit Agent Modal */}
      <BaseModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit Agent"
        description="Update agent information and settings"
        icon={<Edit3 className="h-5 w-5" />}
      >
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Agent's full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="agent@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+960 777-1234"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-company">Company Name *</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Recruitment company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-licenseNumber">License Number</Label>
              <Input
                id="edit-licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="MRA-2024-XXX"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="www.company.com"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Complete business address"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleEditAgent}
            >
              Update Agent
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <BaseModal
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          title={selectedAgent.name}
          description={selectedAgent.company}
          icon={<Network className="h-5 w-5" />}
          defaultSize="maximized"
        >
          <div className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={selectedAgent.profileImage} alt={selectedAgent.name} />
                          <AvatarFallback>
                            {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{selectedAgent.name}</h3>
                          <p className="text-muted-foreground">{selectedAgent.company}</p>
                          <Badge className={getStatusColor(selectedAgent.status)} variant="secondary">
                            {getStatusIcon(selectedAgent.status)}
                            <span className="ml-1 capitalize">{selectedAgent.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span>{selectedAgent.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span>{selectedAgent.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span>{selectedAgent.location}</span>
                        </div>
                        {selectedAgent.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                            <span>{selectedAgent.website}</span>
                          </div>
                        )}
                        {selectedAgent.licenseNumber && (
                          <div className="flex items-center">
                            <Key className="h-4 w-4 mr-3 text-muted-foreground" />
                            <span>{selectedAgent.licenseNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span>Registered: {formatDate(selectedAgent.registrationDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedAgent.totalCandidates}</div>
                          <div className="text-sm text-muted-foreground">Total Candidates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{selectedAgent.placedCandidates}</div>
                          <div className="text-sm text-muted-foreground">Successfully Placed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedAgent.activeCandidates}</div>
                          <div className="text-sm text-muted-foreground">Active Candidates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{selectedAgent.successRate}%</div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Last Login</div>
                        <div>{formatDateTime(selectedAgent.lastLogin)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="candidates">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Candidate Management</h3>
                  <p className="text-muted-foreground">
                    Detailed candidate information and management will be available here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
                  <p className="text-muted-foreground">
                    Agent activity and interaction history will be displayed here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </BaseModal>
      )}
    </div>
  )
}