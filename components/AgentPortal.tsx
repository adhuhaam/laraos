"use client"

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Separator } from './ui/separator'
import { OCRUpload } from './OCRUpload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { BaseModal } from './BaseModal'
import { Progress } from './ui/progress'
import { 
  Network, Plus, Search, Upload, Download, MoreHorizontal, 
  Users, FileText, CheckCircle, Clock, AlertCircle, 
  Eye, Edit3, Trash2, LogOut, Bell, Settings, User,
  Building2, MapPin, Phone, Mail, Calendar, Target,
  TrendingUp, Activity, RefreshCw, Filter, ArrowUpDown,
  FileUp, FilePlus, PaperclipIcon, X, Banknote, Award,
  BarChart3, TrendingDown, Zap
} from 'lucide-react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { toast } from 'sonner@2.0.3'

interface AgentPortalProps {
  agent: any
  onLogout: () => void
}

interface SlotAssignment {
  designation: string
  salary: number
  totalSlots: number
  usedSlots: number
  remainingSlots: number
}

interface AgentSlots {
  quotaPoolName: string
  assignments: SlotAssignment[]
  totalAssignedSlots: number
  totalUsedSlots: number
  expiryDate?: string
  status: 'active' | 'expired' | 'exhausted'
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  experience: number
  expectedSalary: number
  location: string
  status: 'submitted' | 'under-review' | 'interviewed' | 'offered' | 'accepted' | 'rejected' | 'placed'
  submissionDate: string
  cvFile?: File
  documents?: File[]
  notes?: string
  offerAmount?: number
  offerDate?: string
  loaFile?: File
}

// Mock agent slots data
const mockAgentSlots: AgentSlots[] = [
  {
    quotaPoolName: 'Construction Workers Q1 2024',
    assignments: [
      { designation: 'Civil Engineer', salary: 25000, totalSlots: 10, usedSlots: 6, remainingSlots: 4 },
      { designation: 'Project Manager', salary: 35000, totalSlots: 5, usedSlots: 2, remainingSlots: 3 },
      { designation: 'Site Supervisor', salary: 20000, totalSlots: 8, usedSlots: 3, remainingSlots: 5 }
    ],
    totalAssignedSlots: 23,
    totalUsedSlots: 11,
    expiryDate: '2024-12-31',
    status: 'active'
  },
  {
    quotaPoolName: 'IT Professionals 2024',
    assignments: [
      { designation: 'Software Developer', salary: 30000, totalSlots: 8, usedSlots: 5, remainingSlots: 3 },
      { designation: 'System Administrator', salary: 28000, totalSlots: 4, usedSlots: 1, remainingSlots: 3 }
    ],
    totalAssignedSlots: 12,
    totalUsedSlots: 6,
    expiryDate: '2024-12-31',
    status: 'active'
  }
]

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    position: 'Civil Engineer',
    experience: 5,
    expectedSalary: 25000,
    location: 'New York, USA',
    status: 'offered',
    submissionDate: '2024-01-10',
    offerAmount: 26000,
    offerDate: '2024-01-14',
    notes: 'Excellent candidate with strong background in construction'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1234567891',
    position: 'Project Manager',
    experience: 8,
    expectedSalary: 35000,
    location: 'London, UK',
    status: 'under-review',
    submissionDate: '2024-01-12',
    notes: 'Experienced project manager with PMP certification'
  },
  {
    id: '3',
    name: 'Ahmed Ali',
    email: 'ahmed.ali@email.com',
    phone: '+1234567892',
    position: 'Software Developer',
    experience: 6,
    expectedSalary: 28000,
    location: 'Dubai, UAE',
    status: 'accepted',
    submissionDate: '2024-01-08',
    offerAmount: 29000,
    offerDate: '2024-01-11',
    notes: 'Creative developer with full-stack expertise'
  }
]

export function AgentPortal({ agent, onLogout }: AgentPortalProps) {
  const [agentSlots] = useState<AgentSlots[]>(mockAgentSlots)
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(mockCandidates)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentView, setCurrentView] = useState<'dashboard' | 'slots' | 'candidates' | 'add-candidate'>('dashboard')
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isCandidateDetailsOpen, setIsCandidateDetailsOpen] = useState(false)
  const [isUploadLoaOpen, setIsUploadLoaOpen] = useState(false)
  const [showOCRDialog, setShowOCRDialog] = useState(false)
  const [selectedCandidateForOCR, setSelectedCandidateForOCR] = useState<Candidate | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loaInputRef = useRef<HTMLInputElement>(null)

  // Form state for adding candidate
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    expectedSalary: '',
    location: '',
    notes: '',
    cvFile: null as File | null,
    documents: [] as File[]
  })

  // Calculate available designations with remaining slots
  const getAvailableDesignations = () => {
    const availableDesignations: { designation: string; remainingSlots: number; salary: number }[] = []
    
    agentSlots.forEach(slotGroup => {
      if (slotGroup.status === 'active') {
        slotGroup.assignments.forEach(assignment => {
          if (assignment.remainingSlots > 0) {
            availableDesignations.push({
              designation: assignment.designation,
              remainingSlots: assignment.remainingSlots,
              salary: assignment.salary
            })
          }
        })
      }
    })
    
    return availableDesignations
  }

  // Check if agent can submit candidate for a position
  const canSubmitForPosition = (position: string): boolean => {
    return getAvailableDesignations().some(d => d.designation === position)
  }

  // Get remaining slots for a specific position
  const getRemainingSlots = (position: string): number => {
    const designation = getAvailableDesignations().find(d => d.designation === position)
    return designation?.remainingSlots || 0
  }

  // Filter candidates
  React.useEffect(() => {
    let filtered = candidates

    if (searchQuery) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter)
    }

    setFilteredCandidates(filtered)
  }, [candidates, searchQuery, statusFilter])

  const handleAddCandidate = () => {
    if (!candidateForm.name || !candidateForm.email || !candidateForm.phone || !candidateForm.position) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if agent has available slots for this position
    if (!canSubmitForPosition(candidateForm.position)) {
      toast.error(`No available slots for ${candidateForm.position}. Please check your slot assignments.`)
      return
    }

    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: candidateForm.name,
      email: candidateForm.email,
      phone: candidateForm.phone,
      position: candidateForm.position,
      experience: parseInt(candidateForm.experience) || 0,
      expectedSalary: parseInt(candidateForm.expectedSalary) || 0,
      location: candidateForm.location,
      status: 'submitted',
      submissionDate: new Date().toISOString().split('T')[0],
      notes: candidateForm.notes,
      cvFile: candidateForm.cvFile || undefined,
      documents: candidateForm.documents
    }

    setCandidates(prev => [...prev, newCandidate])
    setIsAddCandidateModalOpen(false)
    
    // Reset form
    setCandidateForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      expectedSalary: '',
      location: '',
      notes: '',
      cvFile: null,
      documents: []
    })
    
    toast.success(`Candidate submitted successfully! ${getRemainingSlots(candidateForm.position) - 1} slots remaining for ${candidateForm.position}.`)
  }

  const handleFileUpload = (files: FileList | null, type: 'cv' | 'documents') => {
    if (!files) return

    if (type === 'cv') {
      setCandidateForm(prev => ({ ...prev, cvFile: files[0] }))
      toast.success('CV uploaded successfully')
    } else {
      const newDocuments = Array.from(files)
      setCandidateForm(prev => ({ 
        ...prev, 
        documents: [...prev.documents, ...newDocuments] 
      }))
      toast.success(`${newDocuments.length} document(s) uploaded`)
    }
  }

  const handleUploadLoa = (candidateId: string, file: File) => {
    setCandidates(prev => prev.map(candidate =>
      candidate.id === candidateId
        ? { ...candidate, loaFile: file, status: 'placed' as const }
        : candidate
    ))
    setIsUploadLoaOpen(false)
    setSelectedCandidate(null)
    toast.success('Letter of Agreement uploaded successfully!')
  }

  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'interviewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'offered':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'placed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: Candidate['status']) => {
    switch (status) {
      case 'submitted':
      case 'under-review':
        return <Clock className="h-4 w-4" />
      case 'interviewed':
      case 'offered':
        return <AlertCircle className="h-4 w-4" />
      case 'accepted':
      case 'placed':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your recruitment activities and slot assignments
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Slots</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentSlots.reduce((sum, slots) => sum + slots.totalAssignedSlots, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total slots assigned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Slots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentSlots.reduce((sum, slots) => sum + slots.totalUsedSlots, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Candidates submitted
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Slots</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentSlots.reduce((sum, slots) => 
                sum + slots.assignments.reduce((assignSum, assign) => assignSum + assign.remainingSlots, 0), 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for submission
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.length > 0 ? Math.round((candidates.filter(c => c.status === 'placed').length / candidates.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful placements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              onClick={() => setIsAddCandidateModalOpen(true)}
              disabled={getAvailableDesignations().length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Candidate
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentView('slots')}
            >
              <Target className="h-4 w-4 mr-2" />
              View Slot Assignments
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentView('candidates')}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Candidates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidates.slice(0, 3).map((candidate) => (
                <div key={candidate.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(candidate.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground">{candidate.position}</p>
                  </div>
                  <Badge className={getStatusColor(candidate.status)} variant="secondary">
                    {candidate.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSlots = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Slot Assignments</h2>
        <p className="text-muted-foreground">
          View your assigned recruitment slots and track usage
        </p>
      </div>

      {agentSlots.map((slotGroup, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{slotGroup.quotaPoolName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {slotGroup.totalUsedSlots} of {slotGroup.totalAssignedSlots} slots used
                  {slotGroup.expiryDate && ` • Expires: ${formatDate(slotGroup.expiryDate)}`}
                </p>
              </div>
              <Badge variant={slotGroup.status === 'active' ? 'default' : 'secondary'}>
                {slotGroup.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {slotGroup.assignments.map((assignment, assignIndex) => (
                <div key={assignIndex} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{assignment.designation}</h4>
                      <p className="text-sm text-muted-foreground">
                        Salary: MVR {assignment.salary.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {assignment.remainingSlots}/{assignment.totalSlots}
                      </div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((assignment.usedSlots / assignment.totalSlots) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(assignment.usedSlots / assignment.totalSlots) * 100} 
                      className="w-full"
                    />
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-medium">{assignment.totalSlots}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">{assignment.usedSlots}</div>
                        <div className="text-muted-foreground">Used</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-600">{assignment.remainingSlots}</div>
                        <div className="text-muted-foreground">Available</div>
                      </div>
                    </div>
                  </div>
                  
                  {assignment.remainingSlots === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        All slots for this designation have been used.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {agentSlots.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Slot Assignments</h3>
            <p className="text-muted-foreground">
              You don't have any slot assignments yet. Please contact HR to get slots assigned.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCandidatesList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Candidates</h2>
          <p className="text-muted-foreground">
            Manage and track your submitted candidates
          </p>
        </div>
        <Button 
          onClick={() => setIsAddCandidateModalOpen(true)}
          disabled={getAvailableDesignations().length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {getAvailableDesignations().length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-200">
                You have no available slots to submit new candidates. All your assigned slots have been used.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'under-review' || c.status === 'interviewed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'offered' || c.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'placed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast('Refreshing candidates...')}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.position}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedCandidate(candidate)
                      setIsCandidateDetailsOpen(true)
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedCandidateForOCR(candidate)
                      setShowOCRDialog(true)
                    }}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents (OCR)
                    </DropdownMenuItem>
                    {candidate.status === 'accepted' && !candidate.loaFile && (
                      <DropdownMenuItem onClick={() => {
                        setSelectedCandidate(candidate)
                        setIsUploadLoaOpen(true)
                      }}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload LoA
                      </DropdownMenuItem>
                    )}
                    {candidate.offerDate && (
                      <DropdownMenuItem onClick={() => toast('Downloading offer letter...')}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Offer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Badge className={getStatusColor(candidate.status)} variant="secondary">
                {getStatusIcon(candidate.status)}
                <span className="ml-1 capitalize">{candidate.status.replace('-', ' ')}</span>
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{candidate.location}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{candidate.experience}</div>
                  <div className="text-xs text-muted-foreground">Years Exp.</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">MVR {candidate.expectedSalary.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Expected</div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Submitted: {formatDate(candidate.submissionDate)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria' 
              : 'Get started by adding your first candidate'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && getAvailableDesignations().length > 0 && (
            <Button onClick={() => setIsAddCandidateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Candidate
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-semibold">Agent Portal</h1>
                <p className="text-sm text-muted-foreground">{agent.company}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {agent.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{agent.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-border">
        <div className="px-4">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
            <TabsList className="h-12">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="slots">Slot Assignments</TabsTrigger>
              <TabsTrigger value="candidates">My Candidates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'slots' && renderSlots()}
        {currentView === 'candidates' && renderCandidatesList()}
      </main>

      {/* Add Candidate Modal */}
      <BaseModal
        open={isAddCandidateModalOpen}
        onOpenChange={setIsAddCandidateModalOpen}
        title="Add New Candidate"
        description="Submit a new candidate for recruitment consideration"
        icon={<Plus className="h-5 w-5" />}
        defaultSize="maximized"
      >
        <div className="p-6 space-y-6">
          {/* Slot availability warning */}
          {getAvailableDesignations().length === 0 ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 dark:text-red-200">
                  You have no available slots to submit new candidates. Please contact HR for more slot assignments.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium mb-2">Available Slots:</h4>
              <div className="space-y-1">
                {getAvailableDesignations().map((designation, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{designation.designation}</span>
                    <span className="font-medium">{designation.remainingSlots} slots available</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={candidateForm.name}
                onChange={(e) => setCandidateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Candidate's full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={candidateForm.email}
                onChange={(e) => setCandidateForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="candidate@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={candidateForm.phone}
                onChange={(e) => setCandidateForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position">Position *</Label>
              <Select 
                value={candidateForm.position} 
                onValueChange={(value) => setCandidateForm(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDesignations().map((designation, index) => (
                    <SelectItem key={index} value={designation.designation}>
                      {designation.designation} ({designation.remainingSlots} slots available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={candidateForm.experience}
                onChange={(e) => setCandidateForm(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="5"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expectedSalary">Expected Salary (MVR)</Label>
              <Input
                id="expectedSalary"
                type="number"
                min="0"
                value={candidateForm.expectedSalary}
                onChange={(e) => setCandidateForm(prev => ({ ...prev, expectedSalary: e.target.value }))}
                placeholder="25000"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={candidateForm.location}
                onChange={(e) => setCandidateForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={candidateForm.notes}
              onChange={(e) => setCandidateForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about the candidate..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>CV/Resume</Label>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {candidateForm.cvFile ? candidateForm.cvFile.name : 'Upload CV/Resume'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files, 'cv')}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <Label>Additional Documents</Label>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                    input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, 'documents')
                    input.click()
                  }}
                  className="w-full"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Upload Additional Documents
                </Button>
                {candidateForm.documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {candidateForm.documents.map((doc, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        <PaperclipIcon className="h-3 w-3 inline mr-1" />
                        {doc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsAddCandidateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleAddCandidate}
              disabled={getAvailableDesignations().length === 0}
            >
              Submit Candidate
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* Upload LoA Modal */}
      <BaseModal
        open={isUploadLoaOpen}
        onOpenChange={setIsUploadLoaOpen}
        title="Upload Letter of Agreement"
        description="Upload the signed Letter of Agreement for this candidate"
        icon={<FileUp className="h-5 w-5" />}
      >
        <div className="p-6 space-y-6">
          {selectedCandidate && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold">{selectedCandidate.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCandidate.position}</p>
              <p className="text-sm text-muted-foreground">
                Offer Amount: MVR {selectedCandidate.offerAmount?.toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <Label>Letter of Agreement (Signed)</Label>
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => loaInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Signed LoA File
              </Button>
              <input
                ref={loaInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && selectedCandidate) {
                    handleUploadLoa(selectedCandidate.id, file)
                  }
                }}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsUploadLoaOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* OCR Upload Modal */}
      <BaseModal
        open={showOCRDialog}
        onOpenChange={setShowOCRDialog}
        title="Document Upload - OCR Processing"
        description={`Upload passport, ID, or other documents for ${selectedCandidateForOCR?.name} with automatic text extraction using OCR technology.`}
        icon={<Upload className="h-5 w-5" />}
        defaultSize="maximized"
      >
        <OCRUpload
          onDataExtracted={(data) => {
            toast.success('Document data extracted successfully!')
            console.log('Extracted data for candidate:', selectedCandidateForOCR?.name, data)
            setShowOCRDialog(false)
            setSelectedCandidateForOCR(null)
          }}
          title="Document OCR Upload"
          description="Upload document images or PDFs for automatic text extraction and data parsing"
        />
      </BaseModal>
    </div>
  )
}