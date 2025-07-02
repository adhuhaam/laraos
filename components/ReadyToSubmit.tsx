import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Separator } from './ui/separator'
import { OCRUpload } from './OCRUpload'
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
  Send,
  DollarSign,
  TrendingUp,
  Plane,
  FileCheck,
  Scan,
  Camera,
  Copy,
  Settings,
  Shield
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  location: string
  position: string
  experience: number
  status: 'ready' | 'documents-pending' | 'submitted' | 'processing' | 'approved' | 'rejected'
  appliedDate: string
  expectedSalary: number
  offerAmount: number
  acceptedDate: string
  skills: string[]
  education: string
  avatar?: string
  resume?: string
  notes?: string
  rating: number
  source: 'website' | 'referral' | 'linkedin' | 'job-board' | 'agency'
  documents: {
    passport?: {
      uploaded: boolean
      extractedData?: any
      fileName?: string
      uploadDate?: string
    }
    visa?: {
      uploaded: boolean
      fileName?: string
      uploadDate?: string
    }
    medicalCert?: {
      uploaded: boolean
      fileName?: string
      uploadDate?: string
    }
    policeClearance?: {
      uploaded: boolean
      fileName?: string
      uploadDate?: string
    }
    otherDocs?: Array<{
      name: string
      uploaded: boolean
      fileName?: string
      uploadDate?: string
    }>
  }
  submissionDate?: string
  lastActivity: string
}

type ViewMode = 'grid' | 'table'
type SortField = 'name' | 'acceptedDate' | 'experience' | 'rating' | 'submissionDate' | 'offerAmount'
type SortDirection = 'asc' | 'desc'

// Mock data for candidates ready to submit
const mockReadyToSubmitCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@email.com',
    phone: '+962 555 0123',
    location: 'Amman, Jordan',
    position: 'Construction Supervisor',
    experience: 8,
    status: 'ready',
    appliedDate: '2024-12-05',
    expectedSalary: 75000,
    offerAmount: 78000,
    acceptedDate: '2024-12-20',
    skills: ['Project Management', 'Safety Compliance', 'Team Leadership', 'Construction Planning'],
    education: 'Bachelor in Civil Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    source: 'referral',
    documents: {
      passport: {
        uploaded: true,
        extractedData: {
          passportNumber: 'M1234567',
          name: 'AHMED HASSAN ALI',
          nationality: 'JORDANIAN',
          dateOfBirth: '15/03/1985',
          expiryDate: '15/03/2029'
        },
        fileName: 'passport_ahmed.jpg',
        uploadDate: '2024-12-20'
      },
      visa: { uploaded: false },
      medicalCert: { uploaded: true, fileName: 'medical_ahmed.pdf', uploadDate: '2024-12-21' },
      policeClearance: { uploaded: false }
    },
    lastActivity: '2024-12-21'
  },
  {
    id: '2',
    name: 'Fatima Al-Rashid',
    email: 'fatima.alrashid@email.com',
    phone: '+973 555 0124',
    location: 'Manama, Bahrain',
    position: 'Site Engineer',
    experience: 5,
    status: 'documents-pending',
    appliedDate: '2024-12-08',
    expectedSalary: 65000,
    offerAmount: 67000,
    acceptedDate: '2024-12-19',
    skills: ['AutoCAD', 'Structural Analysis', 'Quality Control', 'Site Management'],
    education: 'Bachelor in Civil Engineering',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
    rating: 4.5,
    source: 'linkedin',
    documents: {
      passport: { uploaded: false },
      visa: { uploaded: false },
      medicalCert: { uploaded: false },
      policeClearance: { uploaded: false }
    },
    lastActivity: '2024-12-21'
  },
  {
    id: '3',
    name: 'Mohammad Al-Zahra',
    email: 'mohammad.alzahra@email.com',
    phone: '+971 555 0125',
    location: 'Dubai, UAE',
    position: 'Electrician',
    experience: 6,
    status: 'submitted',
    appliedDate: '2024-12-10',
    expectedSalary: 55000,
    offerAmount: 57000,
    acceptedDate: '2024-12-18',
    skills: ['Electrical Installation', 'Maintenance', 'Troubleshooting', 'Safety Protocols'],
    education: 'Electrical Trade Certificate',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    source: 'job-board',
    documents: {
      passport: {
        uploaded: true,
        extractedData: {
          passportNumber: 'E9876543',
          name: 'MOHAMMAD AL-ZAHRA',
          nationality: 'EMIRATI',
          dateOfBirth: '22/07/1987',
          expiryDate: '22/07/2027'
        },
        fileName: 'passport_mohammad.jpg',
        uploadDate: '2024-12-18'
      },
      visa: { uploaded: true, fileName: 'visa_mohammad.pdf', uploadDate: '2024-12-19' },
      medicalCert: { uploaded: true, fileName: 'medical_mohammad.pdf', uploadDate: '2024-12-19' },
      policeClearance: { uploaded: true, fileName: 'police_mohammad.pdf', uploadDate: '2024-12-19' }
    },
    submissionDate: '2024-12-20',
    lastActivity: '2024-12-20'
  }
]

export function ReadyToSubmit() {
  // Core state
  const [candidates, setCandidates] = useState<Candidate[]>(mockReadyToSubmitCandidates)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false)
  const [showOCRDialog, setShowOCRDialog] = useState(false)
  const [currentDocumentType, setCurrentDocumentType] = useState<string>('')
  
  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('acceptedDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(false)

  // Get unique positions and statuses for filters
  const uniquePositions = useMemo(() => {
    const positions = [...new Set(candidates.map(c => c.position))]
    return positions.sort()
  }, [candidates])

  const statusOptions = [
    { value: 'ready', label: 'Ready to Submit', color: 'bg-green-100 text-green-800' },
    { value: 'documents-pending', label: 'Documents Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ]

  // Filtering and sorting logic
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      const matchesPosition = positionFilter === 'all' || candidate.position === positionFilter
      
      return matchesSearch && matchesStatus && matchesPosition
    })

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'acceptedDate' || sortField === 'submissionDate') {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
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
  }, [candidates, searchQuery, statusFilter, positionFilter, sortField, sortDirection])

  // Handle candidate actions
  const handleCandidateAction = async (action: string, candidate: Candidate) => {
    switch (action) {
      case 'view':
        setSelectedCandidate(candidate)
        setShowDetailsDialog(true)
        break
      case 'documents':
        setSelectedCandidate(candidate)
        setShowDocumentsDialog(true)
        break
      case 'upload-passport':
        setSelectedCandidate(candidate)
        setCurrentDocumentType('passport')
        setShowOCRDialog(true)
        break
      case 'submit':
        await handleSubmitCandidate(candidate.id)
        break
      case 'mark-ready':
        await handleUpdateCandidateStatus(candidate.id, 'ready')
        break
      case 'download-docs':
        toast.info('Document download functionality coming soon')
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  const handleUpdateCandidateStatus = async (candidateId: string, newStatus: Candidate['status']) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, status: newStatus, lastActivity: new Date().toISOString().split('T')[0] } : c
      ))
      toast.success(`Candidate status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update candidate status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitCandidate = async (candidateId: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { 
          ...c, 
          status: 'submitted', 
          submissionDate: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0] 
        } : c
      ))
      toast.success('Candidate submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit candidate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOCRDataExtracted = (data: any) => {
    if (selectedCandidate && currentDocumentType) {
      setCandidates(prev => prev.map(c => 
        c.id === selectedCandidate.id ? {
          ...c,
          documents: {
            ...c.documents,
            [currentDocumentType]: {
              uploaded: true,
              extractedData: data,
              fileName: `${currentDocumentType}_${c.name.toLowerCase().replace(/\s+/g, '_')}.jpg`,
              uploadDate: new Date().toISOString().split('T')[0]
            }
          },
          lastActivity: new Date().toISOString().split('T')[0]
        } : c
      ))
      toast.success(`${currentDocumentType} data extracted and saved!`)
      setShowOCRDialog(false)
      setCurrentDocumentType('')
      setSelectedCandidate(null)
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
    const statusConfig = statusOptions.find(s => s.value === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: Candidate['status']) => {
    const statusConfig = statusOptions.find(s => s.value === status)
    return statusConfig?.label || status
  }

  const getDocumentCompletionPercentage = (candidate: Candidate) => {
    const docs = candidate.documents
    const totalDocs = 4 // passport, visa, medical, police clearance
    let completedDocs = 0
    
    if (docs.passport?.uploaded) completedDocs++
    if (docs.visa?.uploaded) completedDocs++
    if (docs.medicalCert?.uploaded) completedDocs++
    if (docs.policeClearance?.uploaded) completedDocs++
    
    return Math.round((completedDocs / totalDocs) * 100)
  }

  // Candidate Card Component
  const CandidateCard = ({ candidate }: { candidate: Candidate }) => {
    const documentCompletion = getDocumentCompletionPercentage(candidate)
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight truncate">{candidate.name}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{candidate.position}</p>
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
                <DropdownMenuItem onClick={() => handleCandidateAction('documents', candidate)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Documents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCandidateAction('upload-passport', candidate)}>
                  <Scan className="h-4 w-4 mr-2" />
                  Upload Passport (OCR)
                </DropdownMenuItem>
                {candidate.status === 'ready' && (
                  <DropdownMenuItem onClick={() => handleCandidateAction('submit', candidate)}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleCandidateAction('download-docs', candidate)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Documents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(candidate.status)}>
              {getStatusLabel(candidate.status)}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Accepted: {candidate.acceptedDate}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{candidate.location}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{candidate.experience} years experience</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Offer Amount</span>
              <span className="font-medium text-green-600">${candidate.offerAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Rating</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>{candidate.rating}/5</span>
              </div>
            </div>
          </div>

          {/* Document Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Documents</span>
              <span className="font-medium">{documentCompletion}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  documentCompletion === 100 ? 'bg-green-500' :
                  documentCompletion >= 75 ? 'bg-blue-500' :
                  documentCompletion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${documentCompletion}%` }}
              />
            </div>
          </div>
          
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 2).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          <Separator />
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCandidateAction('documents', candidate)}
              className="flex-1"
            >
              <FileText className="h-3 w-3 mr-1" />
              Documents
            </Button>
            {candidate.status === 'ready' ? (
              <Button
                size="sm"
                onClick={() => handleCandidateAction('submit', candidate)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-3 w-3 mr-1" />
                Submit
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCandidateAction('upload-passport', candidate)}
                className="flex-1"
              >
                <Scan className="h-3 w-3 mr-1" />
                OCR Upload
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ready to Submit</h1>
          <p className="text-muted-foreground">
            Manage candidates with accepted offers ready for submission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-xs text-muted-foreground">
              With accepted offers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Submit</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents complete
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'documents-pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need documentation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Offer Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(candidates.reduce((sum, c) => sum + c.offerAmount, 0) / candidates.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per candidate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {filteredAndSortedCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No candidates ready to submit</h3>
            <p className="text-muted-foreground text-center">
              Candidates with accepted offers will appear here once their documents are ready.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filteredAndSortedCandidates.map((candidate) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CandidateCard candidate={candidate} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Offer Amount</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('acceptedDate')}
                  >
                    <div className="flex items-center gap-2">
                      Accepted Date {getSortIcon('acceptedDate')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-muted-foreground">{candidate.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(candidate.status)}>
                        {getStatusLabel(candidate.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              getDocumentCompletionPercentage(candidate) === 100 ? 'bg-green-500' :
                              getDocumentCompletionPercentage(candidate) >= 75 ? 'bg-blue-500' :
                              getDocumentCompletionPercentage(candidate) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${getDocumentCompletionPercentage(candidate)}%` }}
                          />
                        </div>
                        <span className="text-sm">{getDocumentCompletionPercentage(candidate)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${candidate.offerAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{candidate.acceptedDate}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleCandidateAction('documents', candidate)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Manage Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCandidateAction('upload-passport', candidate)}>
                            <Scan className="h-4 w-4 mr-2" />
                            Upload Passport (OCR)
                          </DropdownMenuItem>
                          {candidate.status === 'ready' && (
                            <DropdownMenuItem onClick={() => handleCandidateAction('submit', candidate)}>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Application
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* OCR Upload Dialog */}
      <Dialog open={showOCRDialog} onOpenChange={setShowOCRDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload {currentDocumentType} - OCR Processing</DialogTitle>
            <DialogDescription>
              Upload {currentDocumentType} image or PDF for automatic data extraction using OCR technology.
            </DialogDescription>
          </DialogHeader>
          
          <OCRUpload
            onDataExtracted={handleOCRDataExtracted}
            title={`${currentDocumentType} OCR Upload`}
            description={`Upload ${currentDocumentType} document for automatic text extraction and data parsing`}
          />
        </DialogContent>
      </Dialog>

      {/* Documents Management Dialog */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Management - {selectedCandidate?.name}</DialogTitle>
            <DialogDescription>
              Manage and track required documents for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-4">
              {/* Document checklist */}
              <div className="grid gap-4">
                {[
                  { key: 'passport', label: 'Passport', icon: FileText },
                  { key: 'visa', label: 'Visa', icon: Plane },
                  { key: 'medicalCert', label: 'Medical Certificate', icon: FileCheck },
                  { key: 'policeClearance', label: 'Police Clearance', icon: Shield }
                ].map(doc => {
                  const docData = selectedCandidate.documents[doc.key as keyof typeof selectedCandidate.documents]
                  return (
                    <div key={doc.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <doc.icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.label}</p>
                          {docData?.uploaded && docData.fileName && (
                            <p className="text-sm text-muted-foreground">{docData.fileName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {docData?.uploaded ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Uploaded
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCurrentDocumentType(doc.key)
                            setShowOCRDialog(true)
                            setShowDocumentsDialog(false)
                          }}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* OCR extracted data preview */}
              {selectedCandidate.documents.passport?.extractedData && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Extracted Passport Data</h4>
                  <div className="grid gap-2 p-3 bg-muted/20 rounded-lg">
                    {Object.entries(selectedCandidate.documents.passport.extractedData).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span>{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidate Details - {selectedCandidate?.name}</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCandidate.avatar} alt={selectedCandidate.name} />
                  <AvatarFallback>{selectedCandidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCandidate.name}</h3>
                  <p className="text-muted-foreground">{selectedCandidate.position}</p>
                  <Badge className={getStatusColor(selectedCandidate.status)}>
                    {getStatusLabel(selectedCandidate.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <Input value={selectedCandidate.email} readOnly />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={selectedCandidate.phone} readOnly />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={selectedCandidate.location} readOnly />
                </div>
                <div>
                  <Label>Experience</Label>
                  <Input value={`${selectedCandidate.experience} years`} readOnly />
                </div>
                <div>
                  <Label>Expected Salary</Label>
                  <Input value={`$${selectedCandidate.expectedSalary.toLocaleString()}`} readOnly />
                </div>
                <div>
                  <Label>Offer Amount</Label>
                  <Input value={`$${selectedCandidate.offerAmount.toLocaleString()}`} readOnly className="text-green-600 font-medium" />
                </div>
                <div>
                  <Label>Accepted Date</Label>
                  <Input value={selectedCandidate.acceptedDate} readOnly />
                </div>
                <div>
                  <Label>Rating</Label>
                  <Input value={`${selectedCandidate.rating}/5`} readOnly />
                </div>
              </div>

              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCandidate.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Education</Label>
                <Input value={selectedCandidate.education} readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}