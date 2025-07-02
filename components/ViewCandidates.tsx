import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ResearchedOCR } from './ResearchedOCR'
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Download,
  Upload,
  UserPlus,
  Users,
  Briefcase,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  GraduationCap,
  Award,
  Building2,
  Target,
  ChevronRight,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Network,
  FileCheck,
  Scan,
  Info,
  Loader2,
  ContactIcon,
  Heart,
  Brain,
  Layers,
  Shield,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Candidate {
  id: string
  name: string
  passportNumber: string
  birthDate: string
  passportIssueDate: string
  passportExpiry: string
  address: string
  emergencyContactName: string
  emergencyContactRelationship: string
  nationality: string
  email?: string
  phone?: string
  position?: string
  experience?: number
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'placed'
  appliedDate: string
  expectedSalary?: number
  skills?: string[]
  education?: string
  avatar?: string
  resume?: string
  notes?: string
  rating: number
  source: 'website' | 'referral' | 'linkedin' | 'job-board' | 'agency'
  interviewDate?: string
  lastActivity: string
  agentName?: string
  agentCompany?: string
  loaStatus?: 'pending' | 'uploaded' | 'verified'
  loaFile?: string
  offerAmount?: number
  passportData?: any
  ocrResults?: any[]
}

interface ExtractedData {
  passportNumber?: string
  name?: string
  nationality?: string
  dateOfBirth?: string
  expiryDate?: string
  issueDate?: string
  placeOfBirth?: string
  sex?: string
  issuingAuthority?: string
  address?: string
  emergencyContactName?: string
  emergencyContactRelationship?: string
}

type ViewMode = 'grid' | 'table'
type SortField = 'name' | 'appliedDate' | 'nationality' | 'status' | 'rating'
type SortDirection = 'asc' | 'desc'

export function ViewCandidates() {
  // Core state - Starting with empty candidates array for real testing
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showOCRDialog, setShowOCRDialog] = useState(false)
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false)
  
  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('appliedDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(false)

  // New candidate form state with updated fields
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    passportNumber: '',
    birthDate: '',
    passportIssueDate: '',
    passportExpiry: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    nationality: '',
    email: '',
    phone: '',
    position: '',
    experience: 0,
    expectedSalary: 0,
    skills: '',
    education: '',
    source: 'website' as const,
    passportData: null as ExtractedData | null,
    ocrResults: [] as any[]
  })

  // Add candidate form tab state
  const [addCandidateTab, setAddCandidateTab] = useState('manual')

  // Get unique nationalities and sources for filters
  const uniqueNationalities = useMemo(() => {
    const nationalities = [...new Set(candidates.map(c => c.nationality))]
    return nationalities.sort()
  }, [candidates])

  const uniqueSources = useMemo(() => {
    const sources = [...new Set(candidates.map(c => c.source))]
    return sources.sort()
  }, [candidates])

  // Filtering and sorting logic
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (candidate.email && candidate.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (candidate.position && candidate.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      const matchesNationality = nationalityFilter === 'all' || candidate.nationality === nationalityFilter
      const matchesSource = sourceFilter === 'all' || candidate.source === sourceFilter
      
      return matchesSearch && matchesStatus && matchesNationality && matchesSource
    })

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'appliedDate') {
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
  }, [candidates, searchQuery, statusFilter, nationalityFilter, sourceFilter, sortField, sortDirection])

  // Handle OCR data extraction with improved integration
  const handlePassportDataExtracted = useCallback((data: ExtractedData) => {
    console.log('Research-Based OCR Data Extracted:', data)
    
    setNewCandidate(prev => ({
      ...prev,
      name: data.name || prev.name,
      passportNumber: data.passportNumber || prev.passportNumber,
      birthDate: data.dateOfBirth || prev.birthDate,
      passportIssueDate: data.issueDate || prev.passportIssueDate,
      passportExpiry: data.expiryDate || prev.passportExpiry,
      nationality: data.nationality || prev.nationality,
      address: data.address || data.placeOfBirth || prev.address,
      emergencyContactName: data.emergencyContactName || prev.emergencyContactName,
      emergencyContactRelationship: data.emergencyContactRelationship || prev.emergencyContactRelationship,
      passportData: data
    }))
    
    // Switch to manual tab to show the populated form
    setAddCandidateTab('manual')
    
    // Show detailed feedback about what was extracted
    const extractedFields = Object.keys(data).filter(key => data[key as keyof ExtractedData])
    toast.success(`Multi-engine OCR successful! Extracted: ${extractedFields.join(', ')}. Please review and complete the form.`)
  }, [])

  // Handle add candidate with improved validation
  const handleAddCandidate = async () => {
    // Enhanced validation for required fields
    const requiredFields = {
      name: 'Full Name',
      passportNumber: 'Passport Number',
      birthDate: 'Birth Date',
      passportIssueDate: 'Passport Issue Date',
      passportExpiry: 'Passport Expiry Date',
      address: 'Address',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactRelationship: 'Emergency Contact Relationship',
      nationality: 'Nationality'
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !newCandidate[key as keyof typeof newCandidate])
      .map(([_, label]) => label)

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`)
      return
    }

    // Date validation
    const birthDate = new Date(newCandidate.birthDate)
    const issueDate = new Date(newCandidate.passportIssueDate)
    const expiryDate = new Date(newCandidate.passportExpiry)
    const today = new Date()

    if (birthDate >= today) {
      toast.error('Birth date must be in the past')
      return
    }

    if (issueDate >= expiryDate) {
      toast.error('Passport expiry date must be after issue date')
      return
    }

    if (expiryDate <= today) {
      toast.error('Passport expiry date must be in the future')
      return
    }

    // Email validation (optional)
    if (newCandidate.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newCandidate.email)) {
        toast.error('Please enter a valid email address')
        return
      }
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const candidate: Candidate = {
        id: Date.now().toString(),
        name: newCandidate.name.trim(),
        passportNumber: newCandidate.passportNumber.trim().toUpperCase(),
        birthDate: newCandidate.birthDate,
        passportIssueDate: newCandidate.passportIssueDate,
        passportExpiry: newCandidate.passportExpiry,
        address: newCandidate.address.trim(),
        emergencyContactName: newCandidate.emergencyContactName.trim(),
        emergencyContactRelationship: newCandidate.emergencyContactRelationship.trim(),
        nationality: newCandidate.nationality.trim(),
        email: newCandidate.email.toLowerCase().trim() || undefined,
        phone: newCandidate.phone.trim() || undefined,
        position: newCandidate.position.trim() || undefined,
        experience: Math.max(0, newCandidate.experience) || undefined,
        status: 'new',
        appliedDate: new Date().toISOString().split('T')[0],
        expectedSalary: Math.max(0, newCandidate.expectedSalary) || undefined,
        skills: newCandidate.skills ? newCandidate.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : undefined,
        education: newCandidate.education.trim() || undefined,
        rating: 0,
        source: newCandidate.source,
        lastActivity: new Date().toISOString().split('T')[0],
        passportData: newCandidate.passportData,
        ocrResults: newCandidate.ocrResults
      }

      setCandidates(prev => [candidate, ...prev])
      setShowAddCandidateDialog(false)
      
      // Reset form
      setNewCandidate({
        name: '',
        passportNumber: '',
        birthDate: '',
        passportIssueDate: '',
        passportExpiry: '',
        address: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        nationality: '',
        email: '',
        phone: '',
        position: '',
        experience: 0,
        expectedSalary: 0,
        skills: '',
        education: '',
        source: 'website',
        passportData: null,
        ocrResults: []
      })
      setAddCandidateTab('manual')
      
      toast.success(`Candidate "${candidate.name}" added successfully with advanced OCR data!`)
    } catch (error) {
      toast.error('Failed to add candidate. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle candidate actions
  const handleCandidateAction = async (action: string, candidate: Candidate) => {
    switch (action) {
      case 'view':
        setSelectedCandidate(candidate)
        setShowDetailsDialog(true)
        break
      case 'edit':
        // TODO: Implement edit functionality
        toast.info('Edit functionality coming soon')
        break
      case 'delete':
        await handleDeleteCandidate(candidate.id)
        break
      case 'hire':
        await handleUpdateCandidateStatus(candidate.id, 'hired')
        break
      case 'reject':
        await handleUpdateCandidateStatus(candidate.id, 'rejected')
        break
      case 'schedule-interview':
        toast.info('Interview scheduling coming soon')
        break
      case 'download-resume':
        toast.info('Resume download coming soon')
        break
      case 'upload-documents':
        setSelectedCandidate(candidate)
        setShowOCRDialog(true)
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return
    
    if (!confirm(`Are you sure you want to delete "${candidate.name}"? This action cannot be undone.`)) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCandidates(prev => prev.filter(c => c.id !== candidateId))
      toast.success(`Candidate "${candidate.name}" deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete candidate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCandidateStatus = async (candidateId: string, newStatus: Candidate['status']) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCandidates(prev => prev.map(c => 
        c.id === candidateId 
          ? { ...c, status: newStatus, lastActivity: new Date().toISOString().split('T')[0] }
          : c
      ))
      toast.success(`"${candidate.name}" status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update candidate status')
    } finally {
      setIsLoading(false)
    }
  }

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

  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'screening': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'interview': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'offer': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'hired': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'placed': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getLoaStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'uploaded': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'verified': return 'bg-green-500/10 text-green-700 border-green-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getSourceIcon = (source: Candidate['source']) => {
    switch (source) {
      case 'website': return '🌐'
      case 'referral': return '👥'
      case 'linkedin': return '💼'
      case 'job-board': return '📋'
      case 'agency': return '🏢'
      default: return '📄'
    }
  }

  // Candidate Card Component with unique keys
  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <Card key={`grid-card-${candidate.id}`} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight truncate">{candidate.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{candidate.nationality} • {candidate.passportNumber}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCandidateAction('view', candidate)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCandidateAction('edit', candidate)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCandidateAction('upload-documents', candidate)}>
                <Layers className="h-4 w-4 mr-2" />
                Multi-Engine OCR
              </DropdownMenuItem>
              {candidate.status !== 'hired' && candidate.status !== 'rejected' && (
                <>
                  <DropdownMenuItem onClick={() => handleCandidateAction('hire', candidate)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Hired
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCandidateAction('reject', candidate)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Candidate
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem 
                onClick={() => handleCandidateAction('delete', candidate)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-1">{getSourceIcon(candidate.source)}</span>
            <span className="capitalize">{candidate.source}</span>
          </div>
        </div>

        {/* OCR Enhancement Indicator */}
        {candidate.passportData && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              Enhanced with Multi-Engine OCR
            </span>
          </div>
        )}

        {/* Agent Information and LoA Status */}
        {candidate.agentName && (
          <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center text-sm">
              <Network className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{candidate.agentName}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {candidate.agentCompany}
            </div>
            {candidate.loaStatus && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">LoA Status:</span>
                <Badge className={getLoaStatusColor(candidate.loaStatus)} variant="outline">
                  {candidate.loaStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                  {candidate.loaStatus === 'uploaded' && <FileCheck className="h-3 w-3 mr-1" />}
                  {candidate.loaStatus === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {candidate.loaStatus}
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Born: {new Date(candidate.birthDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{candidate.address}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Heart className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{candidate.emergencyContactName} ({candidate.emergencyContactRelationship})</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Passport Expiry</span>
            <span className={new Date(candidate.passportExpiry) <= new Date(Date.now() + 6*30*24*60*60*1000) ? 'text-orange-600 font-medium' : ''}>
              {new Date(candidate.passportExpiry).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {candidate.position && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Position</span>
            <span className="font-medium">{candidate.position}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCandidateAction('view', candidate)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleCandidateAction('upload-documents', candidate)}
            className="flex-1"
          >
            <Layers className="h-3 w-3 mr-1" />
            OCR Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Candidate Management</h1>
          <p className="text-muted-foreground">
            Research-based multi-engine OCR with intelligent document processing • {filteredAndSortedCandidates.length} candidate{filteredAndSortedCandidates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddCandidateDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nationalities</SelectItem>
                {uniqueNationalities.map((nationality, index) => (
                  <SelectItem key={`nationality-filter-${index}-${nationality}`} value={nationality}>{nationality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map((source, index) => (
                  <SelectItem key={`source-filter-${index}-${source}`} value={source} className="capitalize">{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {filteredAndSortedCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No candidates found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || nationalityFilter !== 'all' || sourceFilter !== 'all'
                    ? 'Try adjusting your search filters to find candidates.'
                    : 'Start adding candidates using our advanced multi-engine OCR system or manual entry.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setShowAddCandidateDialog(true)} size="lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Candidate
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddCandidateDialog(true)
                    setAddCandidateTab('ocr')
                  }}
                  size="lg"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Research-Based OCR
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                ✨ New: Multi-engine OCR with fallback strategies for maximum accuracy
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedCandidates.map((candidate) => (
                <CandidateCard key={`grid-view-${candidate.id}`} candidate={candidate} />
              ))}
            </div>
          ) : (
            <Card key="table-view">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-medium">
                        Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>Passport Info</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('nationality')} className="h-auto p-0 font-medium">
                        Nationality {getSortIcon('nationality')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-medium">
                        Status {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('appliedDate')} className="h-auto p-0 font-medium">
                        Applied Date {getSortIcon('appliedDate')}
                      </Button>
                    </TableHead>
                    <TableHead>OCR Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCandidates.map((candidate) => (
                    <TableRow key={`table-row-${candidate.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-sm text-muted-foreground">{candidate.email || 'No email'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{candidate.passportNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            Expires: {new Date(candidate.passportExpiry).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{candidate.nationality}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(candidate.appliedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {candidate.passportData ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Sparkles className="h-3 w-3 mr-1" />
                            OCR Enhanced
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Manual Entry
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCandidateAction('view', candidate)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCandidateAction('edit', candidate)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCandidateAction('upload-documents', candidate)}>
                              <Layers className="h-4 w-4 mr-2" />
                              Multi-Engine OCR
                            </DropdownMenuItem>
                            {candidate.status !== 'hired' && candidate.status !== 'rejected' && (
                              <>
                                <DropdownMenuItem onClick={() => handleCandidateAction('hire', candidate)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Hired
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCandidateAction('reject', candidate)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Candidate
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleCandidateAction('delete', candidate)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* Add Candidate Dialog */}
      <Dialog open={showAddCandidateDialog} onOpenChange={setShowAddCandidateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Add candidates using advanced multi-engine OCR or manual entry
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={addCandidateTab} onValueChange={setAddCandidateTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="ocr">
                <Layers className="h-4 w-4 mr-2" />
                Research-Based OCR
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input
                        id="nationality"
                        value={newCandidate.nationality}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, nationality: e.target.value }))}
                        placeholder="Enter nationality"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="birthDate">Birth Date *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={newCandidate.birthDate}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={newCandidate.address}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Passport Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Passport Information</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="passportNumber">Passport Number *</Label>
                      <Input
                        id="passportNumber"
                        value={newCandidate.passportNumber}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, passportNumber: e.target.value.toUpperCase() }))}
                        placeholder="Enter passport number"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="passportIssueDate">Passport Issue Date *</Label>
                      <Input
                        id="passportIssueDate"
                        type="date"
                        value={newCandidate.passportIssueDate}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, passportIssueDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="passportExpiry">Passport Expiry Date *</Label>
                      <Input
                        id="passportExpiry"
                        type="date"
                        value={newCandidate.passportExpiry}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, passportExpiry: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Emergency Contact</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                      <Input
                        id="emergencyContactName"
                        value={newCandidate.emergencyContactName}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                        placeholder="Enter emergency contact name"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="emergencyContactRelationship">Emergency Contact Relationship *</Label>
                      <Select value={newCandidate.emergencyContactRelationship} onValueChange={(value: any) => setNewCandidate(prev => ({ ...prev, emergencyContactRelationship: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="relative">Other Relative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Optional Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Information (Optional)</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCandidate.email}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newCandidate.phone}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="position">Position/Job Title</Label>
                      <Input
                        id="position"
                        value={newCandidate.position}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Enter position or job title"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={newCandidate.experience}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="salary">Expected Salary (AED)</Label>
                      <Input
                        id="salary"
                        type="number"
                        min="0"
                        value={newCandidate.expectedSalary}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, expectedSalary: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="source">Source</Label>
                      <Select value={newCandidate.source} onValueChange={(value: any) => setNewCandidate(prev => ({ ...prev, source: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="job-board">Job Board</SelectItem>
                          <SelectItem value="agency">Agency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        value={newCandidate.skills}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder="e.g., AutoCAD, Project Management, Leadership"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="education">Education</Label>
                      <Input
                        id="education"
                        value={newCandidate.education}
                        onChange={(e) => setNewCandidate(prev => ({ ...prev, education: e.target.value }))}
                        placeholder="Enter education background"
                      />
                    </div>
                  </div>
                </div>

                {/* Show extracted passport data if available */}
                {newCandidate.passportData && (
                  <div className="space-y-2">
                    <Label>Multi-Engine OCR Extracted Data</Label>
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-2 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          Research-Based OCR Enhancement Applied
                        </span>
                      </div>
                      {Object.entries(newCandidate.passportData).map(([key, value], index) => (
                        value && (
                          <div key={`passport-data-${index}-${key}`} className="flex justify-between text-sm">
                            <span className="capitalize text-muted-foreground">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddCandidateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCandidate} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Candidate
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="ocr" className="space-y-6">
              <ResearchedOCR 
                onDataExtracted={handlePassportDataExtracted}
                title="Research-Based Multi-Engine OCR"
                description="Advanced passport scanning with multiple AI engines, fallback strategies, and enhanced pattern recognition"
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Candidate Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCandidate.avatar} alt={selectedCandidate.name} />
                  <AvatarFallback>{selectedCandidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">{selectedCandidate.name}</h3>
                  <p className="text-muted-foreground">{selectedCandidate.nationality} • {selectedCandidate.passportNumber}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedCandidate.status)}>{selectedCandidate.status}</Badge>
                    {selectedCandidate.passportData && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Multi-Engine OCR Enhanced
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Birth Date</Label>
                      <p>{new Date(selectedCandidate.birthDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                      <p>{selectedCandidate.nationality}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p>{selectedCandidate.address}</p>
                    </div>
                  </div>
                </div>

                {/* Passport Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Passport Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Passport Number</Label>
                      <p className="font-mono">{selectedCandidate.passportNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Issue Date</Label>
                      <p>{new Date(selectedCandidate.passportIssueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                      <p className={new Date(selectedCandidate.passportExpiry) <= new Date(Date.now() + 6*30*24*60*60*1000) ? 'text-orange-600 font-medium' : ''}>
                        {new Date(selectedCandidate.passportExpiry).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p>{selectedCandidate.emergencyContactName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Relationship</Label>
                      <p className="capitalize">{selectedCandidate.emergencyContactRelationship}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(selectedCandidate.email || selectedCandidate.phone) && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedCandidate.email && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p>{selectedCandidate.email}</p>
                        </div>
                      )}
                      {selectedCandidate.phone && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                          <p>{selectedCandidate.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Information */}
                {(selectedCandidate.position || selectedCandidate.experience || selectedCandidate.education || selectedCandidate.skills) && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Professional Information</h4>
                    <div className="grid gap-4">
                      {selectedCandidate.position && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Position</Label>
                          <p>{selectedCandidate.position}</p>
                        </div>
                      )}
                      {selectedCandidate.experience && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                          <p>{selectedCandidate.experience} years</p>
                        </div>
                      )}
                      {selectedCandidate.education && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Education</Label>
                          <p>{selectedCandidate.education}</p>
                        </div>
                      )}
                      {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedCandidate.skills.map((skill, index) => (
                              <Badge key={`details-skill-${selectedCandidate.id}-${index}-${skill}`} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* OCR Enhancement Information */}
                {selectedCandidate.passportData && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="h-5 w-5 text-green-600" />
                      <Label className="text-sm font-medium text-green-700 dark:text-green-300">
                        Multi-Engine OCR Enhancement Data
                      </Label>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                        This candidate's data was enhanced using our research-based multi-engine OCR system
                      </p>
                      {Object.entries(selectedCandidate.passportData).map(([key, value], index) => (
                        value && (
                          <div key={`ocr-data-${selectedCandidate.id}-${index}-${key}`} className="flex justify-between text-sm">
                            <span className="capitalize text-green-700 dark:text-green-300">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium text-green-800 dark:text-green-200">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent Information */}
                {selectedCandidate.agentName && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Agent Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">{selectedCandidate.agentName}</p>
                      <p className="text-sm text-muted-foreground">{selectedCandidate.agentCompany}</p>
                      {selectedCandidate.loaStatus && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm">LoA Status:</span>
                          <Badge className={getLoaStatusColor(selectedCandidate.loaStatus)} variant="outline">
                            {selectedCandidate.loaStatus}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Multi-Engine OCR Dialog for existing candidates */}
      <Dialog open={showOCRDialog} onOpenChange={setShowOCRDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Research-Based OCR Scanner - {selectedCandidate?.name}</DialogTitle>
            <DialogDescription>
              Upload passport or ID documents to extract and update candidate information using advanced multi-engine OCR
            </DialogDescription>
          </DialogHeader>
          
          <ResearchedOCR 
            onDataExtracted={(data) => {
              if (selectedCandidate) {
                // Update candidate with extracted data
                setCandidates(prev => prev.map(c => 
                  c.id === selectedCandidate.id 
                    ? { 
                        ...c, 
                        passportData: { ...c.passportData, ...data },
                        // Update core fields if they're empty or different
                        passportNumber: data.passportNumber || c.passportNumber,
                        nationality: data.nationality || c.nationality,
                        birthDate: data.dateOfBirth || c.birthDate,
                        passportIssueDate: data.issueDate || c.passportIssueDate,
                        passportExpiry: data.expiryDate || c.passportExpiry,
                        address: data.address || data.placeOfBirth || c.address,
                        emergencyContactName: data.emergencyContactName || c.emergencyContactName,
                        emergencyContactRelationship: data.emergencyContactRelationship || c.emergencyContactRelationship
                      }
                    : c
                ))
                toast.success('Multi-engine OCR data extracted and saved to candidate profile!')
              }
            }}
            title="Advanced Multi-Engine OCR Scanner"
            description="Research-based OCR with multiple AI engines, fallback strategies, and intelligent document processing"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}