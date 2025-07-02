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
import { OfferLetterGenerator } from './OfferLetterGenerator'
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
  Handshake,
  DollarSign,
  TrendingUp
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
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
  appliedDate: string
  expectedSalary: number
  skills: string[]
  education: string
  avatar?: string
  resume?: string
  notes?: string
  rating: number
  source: 'website' | 'referral' | 'linkedin' | 'job-board' | 'agency'
  interviewDate?: string
  lastActivity: string
  offerAmount?: number
  offerDate?: string
  offerExpiry?: string
}

type ViewMode = 'grid' | 'table'
type SortField = 'name' | 'appliedDate' | 'experience' | 'rating' | 'offerDate' | 'expectedSalary'
type SortDirection = 'asc' | 'desc'

// Mock data for candidates with offer status
const mockOfferPendingCandidates: Candidate[] = [
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 555 0124',
    location: 'San Francisco, CA',
    position: 'Product Manager',
    experience: 7,
    status: 'offer',
    appliedDate: '2024-12-10',
    expectedSalary: 110000,
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Leadership'],
    education: 'MBA in Business Administration',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    source: 'referral',
    lastActivity: '2024-12-19',
    offerAmount: 115000,
    offerDate: '2024-12-18',
    offerExpiry: '2024-12-25'
  },
  {
    id: '7',
    name: 'Jennifer Park',
    email: 'jennifer.park@email.com',
    phone: '+1 555 0129',
    location: 'Los Angeles, CA',
    position: 'Senior Frontend Developer',
    experience: 5,
    status: 'offer',
    appliedDate: '2024-12-08',
    expectedSalary: 95000,
    skills: ['React', 'Vue.js', 'TypeScript', 'CSS', 'JavaScript'],
    education: 'Bachelor in Computer Science',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    source: 'linkedin',
    lastActivity: '2024-12-20',
    offerAmount: 98000,
    offerDate: '2024-12-19',
    offerExpiry: '2024-12-26'
  },
  {
    id: '8',
    name: 'Robert Martinez',
    email: 'robert.martinez@email.com',
    phone: '+1 555 0130',
    location: 'Miami, FL',
    position: 'Sales Manager',
    experience: 8,
    status: 'offer',
    appliedDate: '2024-12-05',
    expectedSalary: 85000,
    skills: ['Sales Strategy', 'CRM', 'Lead Generation', 'Team Management'],
    education: 'Bachelor in Business Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.4,
    source: 'job-board',
    lastActivity: '2024-12-18',
    offerAmount: 88000,
    offerDate: '2024-12-17',
    offerExpiry: '2024-12-24'
  },
  {
    id: '9',
    name: 'Anna Kowalski',
    email: 'anna.kowalski@email.com',
    phone: '+1 555 0131',
    location: 'Portland, OR',
    position: 'Data Analyst',
    experience: 3,
    status: 'offer',
    appliedDate: '2024-12-12',
    expectedSalary: 70000,
    skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel'],
    education: 'Master in Statistics',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    rating: 4.3,
    source: 'website',
    lastActivity: '2024-12-21',
    offerAmount: 72000,
    offerDate: '2024-12-20',
    offerExpiry: '2024-12-27'
  }
]

export function OfferPending() {
  // Core state
  const [candidates, setCandidates] = useState<Candidate[]>(mockOfferPendingCandidates)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showOfferLetterDialog, setShowOfferLetterDialog] = useState(false)
  const [offerLetterCandidate, setOfferLetterCandidate] = useState<Candidate | null>(null)
  
  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('offerDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(false)

  // Get unique positions and sources for filters
  const uniquePositions = useMemo(() => {
    const positions = [...new Set(candidates.map(c => c.position))]
    return positions.sort()
  }, [candidates])

  const uniqueSources = useMemo(() => {
    const sources = [...new Set(candidates.map(c => c.source))]
    return sources.sort()
  }, [candidates])

  // Filtering and sorting logic
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesPosition = positionFilter === 'all' || candidate.position === positionFilter
      const matchesSource = sourceFilter === 'all' || candidate.source === sourceFilter
      
      return matchesSearch && matchesPosition && matchesSource
    })

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'appliedDate' || sortField === 'offerDate') {
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
  }, [candidates, searchQuery, positionFilter, sourceFilter, sortField, sortDirection])

  // Handle candidate actions
  const handleCandidateAction = async (action: string, candidate: Candidate) => {
    switch (action) {
      case 'view':
        setSelectedCandidate(candidate)
        setShowDetailsDialog(true)
        break
      case 'accept':
        await handleUpdateCandidateStatus(candidate.id, 'hired')
        break
      case 'decline':
        await handleUpdateCandidateStatus(candidate.id, 'rejected')
        break
      case 'extend-offer':
        toast.info('Offer extension functionality coming soon')
        break
      case 'negotiate':
        toast.info('Salary negotiation functionality coming soon')
        break
      case 'download-resume':
        toast.info('Resume download coming soon')
        break
      case 'get-offer-letter':
        setOfferLetterCandidate(candidate)
        setShowOfferLetterDialog(true)
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  const handleUpdateCandidateStatus = async (candidateId: string, newStatus: Candidate['status']) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (newStatus === 'hired') {
        // Remove from offer pending and move to ready to submit
        setCandidates(prev => prev.filter(c => c.id !== candidateId))
        toast.success('Candidate accepted offer and moved to Ready to Submit!')
      } else {
        setCandidates(prev => prev.filter(c => c.id !== candidateId))
        toast.success(`Candidate ${newStatus === 'hired' ? 'accepted offer' : 'declined offer'}`)
      }
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

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryColor = (expiryDate: string) => {
    const daysRemaining = getDaysRemaining(expiryDate)
    if (daysRemaining <= 1) return 'text-red-600 bg-red-50'
    if (daysRemaining <= 3) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  // Candidate Card Component
  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
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
              <DropdownMenuItem onClick={() => handleCandidateAction('get-offer-letter', candidate)}>
                <FileText className="h-4 w-4 mr-2" />
                Get Offer Letter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCandidateAction('accept', candidate)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Offer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCandidateAction('decline', candidate)}>
                <XCircle className="h-4 w-4 mr-2" />
                Decline Offer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCandidateAction('extend-offer', candidate)}>
                <Clock className="h-4 w-4 mr-2" />
                Extend Deadline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCandidateAction('negotiate', candidate)}>
                <Handshake className="h-4 w-4 mr-2" />
                Negotiate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCandidateAction('download-resume', candidate)}>
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">Offer Pending</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-1">{getSourceIcon(candidate.source)}</span>
            <span className="capitalize">{candidate.source}</span>
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
            <span>Rating</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{candidate.rating}/5</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expected</span>
            <span className="font-medium">${candidate.expectedSalary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Offer Amount</span>
            <span className="font-medium text-green-600">${candidate.offerAmount?.toLocaleString()}</span>
          </div>
        </div>

        {candidate.offerExpiry && (
          <div className={`p-2 rounded-md text-xs font-medium ${getExpiryColor(candidate.offerExpiry)}`}>
            <div className="flex items-center justify-between">
              <span>Expires in {getDaysRemaining(candidate.offerExpiry)} days</span>
              <Clock className="h-3 w-3" />
            </div>
          </div>
        )}
        
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 3}
              </Badge>
            )}
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
            variant="outline"
            onClick={() => handleCandidateAction('get-offer-letter', candidate)}
            className="flex-1"
          >
            <FileText className="h-3 w-3 mr-1" />
            Letter
          </Button>
          <Button
            size="sm"
            onClick={() => handleCandidateAction('accept', candidate)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Accept
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
          <h1 className="text-2xl font-bold tracking-tight">Offer Pending</h1>
          <p className="text-muted-foreground">
            Manage candidates with pending job offers
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
              placeholder="Search offer pending candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source} className="capitalize">{source}</SelectItem>
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
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.offerExpiry && getDaysRemaining(c.offerExpiry) <= 3).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 3 days
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
              ${Math.round(candidates.reduce((sum, c) => sum + (c.offerAmount || 0), 0) / candidates.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per candidate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(candidates.reduce((sum, c) => sum + c.rating, 0) / candidates.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {filteredAndSortedCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending offers</h3>
            <p className="text-muted-foreground text-center">
              There are currently no candidates with pending job offers.
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
                  <TableHead>Expected Salary</TableHead>
                  <TableHead>Offer Amount</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('offerDate')}
                  >
                    <div className="flex items-center gap-2">
                      Offer Date {getSortIcon('offerDate')}
                    </div>
                  </TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center gap-2">
                      Rating {getSortIcon('rating')}
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
                    <TableCell>${candidate.expectedSalary.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${candidate.offerAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell>{candidate.offerDate}</TableCell>
                    <TableCell>
                      {candidate.offerExpiry && (
                        <Badge className={getExpiryColor(candidate.offerExpiry)}>
                          {getDaysRemaining(candidate.offerExpiry)} days
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{getSourceIcon(candidate.source)}</span>
                        <span className="capitalize">{candidate.source}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {candidate.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCandidateAction('get-offer-letter', candidate)}
                          className="h-8 w-8 p-0"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCandidateAction('view', candidate)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCandidateAction('accept', candidate)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCandidateAction('decline', candidate)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Candidate Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Offer Details - {selectedCandidate?.name}
            </DialogTitle>
            <DialogDescription>
              Complete information about the candidate and their pending offer
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
                  <Badge className="mt-1 bg-orange-500/10 text-orange-700 border-orange-200">
                    Offer Pending
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Contact Information</div>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCandidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCandidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCandidate.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">Offer Details</div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expected:</span>
                      <span className="text-sm font-medium">${selectedCandidate.expectedSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Offered:</span>
                      <span className="text-sm font-medium text-green-600">${selectedCandidate.offerAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Offer Date:</span>
                      <span className="text-sm">{selectedCandidate.offerDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <span className={`text-sm font-medium ${selectedCandidate.offerExpiry && getDaysRemaining(selectedCandidate.offerExpiry) <= 3 ? 'text-red-600' : ''}`}>
                        {selectedCandidate.offerExpiry}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Skills</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCandidate.skills.map((skill) => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleCandidateAction('get-offer-letter', selectedCandidate)}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Get Offer Letter
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleCandidateAction('accept', selectedCandidate)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Offer
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCandidateAction('decline', selectedCandidate)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Offer
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleCandidateAction('negotiate', selectedCandidate)}
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Negotiate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Offer Letter Generator Dialog */}
      <OfferLetterGenerator
        candidate={offerLetterCandidate}
        open={showOfferLetterDialog}
        onOpenChange={setShowOfferLetterDialog}
      />
    </div>
  )
}