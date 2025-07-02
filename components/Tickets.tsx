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
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Users,
  Clock,
  Loader2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  Plane,
  Upload,
  FileUp,
  UserCheck,
  CalendarDays,
  Timer,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface CandidateWithTicket {
  id: string
  name: string
  passportNumber: string
  nationality: string
  birthDate: string
  address: string
  phone?: string
  email?: string
  position?: string
  agentName?: string
  agentCompany?: string
  candidateStatus: 'entry-pass-uploaded' | 'ticket-uploaded' | 'arrived' | 'onboarding' | 'employee'
  entryPassFile?: string
  entryPassDate?: string
  ticketFile?: string
  ticketDate?: string
  ticketDetails?: {
    airline: string
    flightNumber: string
    departureDate: string
    departureTime: string
    arrivalDate: string
    arrivalTime: string
    departureAirport: string
    arrivalAirport: string
    seatNumber?: string
    bookingReference: string
  }
  arrivalDate?: string
  onboardingDate?: string
  empId?: string
  avatar?: string
  notes?: string
}

type SortField = 'name' | 'nationality' | 'ticketDate' | 'candidateStatus' | 'arrivalDate'
type SortDirection = 'asc' | 'desc'

export function Tickets() {
  // Sample data for candidates with entry pass uploaded (ready for ticket upload)
  const [candidates, setCandidates] = useState<CandidateWithTicket[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      passportNumber: 'A1234567',
      nationality: 'Indian',
      birthDate: '1985-03-15',
      address: 'Mumbai, Maharashtra, India',
      phone: '+91 9876543210',
      email: 'rajesh.kumar@email.com',
      position: 'Construction Worker',
      agentName: 'ABC Recruitment',
      agentCompany: 'ABC International',
      candidateStatus: 'entry-pass-uploaded',
      entryPassFile: 'entry_pass_rajesh.pdf',
      entryPassDate: '2024-12-10',
      notes: 'Entry pass uploaded, awaiting ticket'
    },
    {
      id: '2',
      name: 'Mohammad Rahman',
      passportNumber: 'B9876543',
      nationality: 'Bangladeshi',
      birthDate: '1990-07-22',
      address: 'Dhaka, Bangladesh',
      phone: '+880 1712345678',
      email: 'mohammad.rahman@email.com',
      position: 'Electrician',
      agentName: 'XYZ Agency',
      agentCompany: 'XYZ Manpower',
      candidateStatus: 'ticket-uploaded',
      entryPassFile: 'entry_pass_mohammad.pdf',
      entryPassDate: '2024-12-08',
      ticketFile: 'ticket_mohammad.pdf',
      ticketDate: '2024-12-12',
      ticketDetails: {
        airline: 'Emirates',
        flightNumber: 'EK652',
        departureDate: '2024-12-20',
        departureTime: '14:30',
        arrivalDate: '2024-12-20',
        arrivalTime: '22:15',
        departureAirport: 'DAC (Dhaka)',
        arrivalAirport: 'MLE (Male)',
        seatNumber: '23A',
        bookingReference: 'EK652DAC'
      },
      notes: 'Ticket uploaded, flight confirmed'
    },
    {
      id: '3',
      name: 'Prakash Thapa',
      passportNumber: 'N5555444',
      nationality: 'Nepali',
      birthDate: '1988-11-10',
      address: 'Kathmandu, Nepal',
      phone: '+977 9841234567',
      position: 'Mason',
      agentName: 'DEF Consultancy',
      agentCompany: 'DEF International',
      candidateStatus: 'arrived',
      entryPassFile: 'entry_pass_prakash.pdf',
      entryPassDate: '2024-12-05',
      ticketFile: 'ticket_prakash.pdf',
      ticketDate: '2024-12-07',
      arrivalDate: '2024-12-15',
      ticketDetails: {
        airline: 'Qatar Airways',
        flightNumber: 'QR674',
        departureDate: '2024-12-15',
        departureTime: '10:45',
        arrivalDate: '2024-12-15',
        arrivalTime: '18:30',
        departureAirport: 'KTM (Kathmandu)',
        arrivalAirport: 'MLE (Male)',
        bookingReference: 'QR674KTM'
      },
      notes: 'Arrived in Maldives, ready for onboarding'
    }
  ])

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('ticketDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithTicket | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showArrivedDialog, setShowArrivedDialog] = useState(false)

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCandidates = candidates.length
    const entryPassCount = candidates.filter(c => c.candidateStatus === 'entry-pass-uploaded').length
    const ticketUploadedCount = candidates.filter(c => c.candidateStatus === 'ticket-uploaded').length
    const arrivedCount = candidates.filter(c => c.candidateStatus === 'arrived').length
    const onboardingCount = candidates.filter(c => c.candidateStatus === 'onboarding').length
    
    return {
      totalCandidates,
      entryPassCount,
      ticketUploadedCount,
      arrivedCount,
      onboardingCount
    }
  }, [candidates])

  // Get unique nationalities for filter
  const uniqueNationalities = useMemo(() => {
    const nationalities = [...new Set(candidates.map(c => c.nationality))]
    return nationalities.sort()
  }, [candidates])

  // Filtering and sorting logic
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (candidate.agentName && candidate.agentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (candidate.ticketDetails?.flightNumber && candidate.ticketDetails.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || candidate.candidateStatus === statusFilter
      const matchesNationality = nationalityFilter === 'all' || candidate.nationality === nationalityFilter
      
      return matchesSearch && matchesStatus && matchesNationality
    })

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'ticketDate' || sortField === 'arrivalDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
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
  }, [candidates, searchQuery, statusFilter, nationalityFilter, sortField, sortDirection])

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

  const getStatusColor = (status: CandidateWithTicket['candidateStatus']) => {
    switch (status) {
      case 'entry-pass-uploaded': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'ticket-uploaded': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'arrived': return 'bg-indigo-500/10 text-indigo-700 border-indigo-200'
      case 'onboarding': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'employee': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const handleMarkAsArrived = useCallback(async () => {
    if (!selectedCandidate) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      setCandidates(prev => prev.map(candidate => 
        candidate.id === selectedCandidate.id
          ? {
              ...candidate,
              candidateStatus: 'arrived',
              arrivalDate: new Date().toISOString().split('T')[0]
            }
          : candidate
      ))

      setShowArrivedDialog(false)
      toast.success(`${selectedCandidate.name} marked as arrived! Onboarding option is now available.`)

    } catch (error) {
      toast.error('Failed to update arrival status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCandidate])

  const handleAction = (action: string, candidate: CandidateWithTicket) => {
    switch (action) {
      case 'view':
        setSelectedCandidate(candidate)
        setShowDetailsDialog(true)
        break
      case 'mark-arrived':
        setSelectedCandidate(candidate)
        setShowArrivedDialog(true)
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flight Tickets Management</h1>
          <p className="text-muted-foreground">
            Track air ticket uploads and candidate travel status • {filteredAndSortedCandidates.length} candidate{filteredAndSortedCandidates.length !== 1 ? 's' : ''}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              In ticket workflow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entry Pass Ready</CardTitle>
            <FileUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.entryPassCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting ticket upload
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Uploaded</CardTitle>
            <Plane className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.ticketUploadedCount}</div>
            <p className="text-xs text-muted-foreground">
              Travel confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arrived</CardTitle>
            <UserCheck className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{summaryStats.arrivedCount}</div>
            <p className="text-xs text-muted-foreground">
              In Maldives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.onboardingCount}</div>
            <p className="text-xs text-muted-foreground">
              Processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates, flights..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="entry-pass-uploaded">Entry Pass Ready</SelectItem>
                <SelectItem value="ticket-uploaded">Ticket Uploaded</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nationalities</SelectItem>
                {uniqueNationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredAndSortedCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <Plane className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No tickets found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || nationalityFilter !== 'all'
                    ? 'Try adjusting your search filters to find tickets.'
                    : 'No candidates in the ticket workflow at this time.'}
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
                  <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-medium">
                    Candidate {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('nationality')} className="h-auto p-0 font-medium">
                    Nationality {getSortIcon('nationality')}
                  </Button>
                </TableHead>
                <TableHead>Flight Details</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('candidateStatus')} className="h-auto p-0 font-medium">
                    Status {getSortIcon('candidateStatus')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('ticketDate')} className="h-auto p-0 font-medium">
                    Ticket Date {getSortIcon('ticketDate')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('arrivalDate')} className="h-auto p-0 font-medium">
                    Arrival Date {getSortIcon('arrivalDate')}
                  </Button>
                </TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.passportNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.nationality}</TableCell>
                  <TableCell>
                    {candidate.ticketDetails ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {candidate.ticketDetails.airline} {candidate.ticketDetails.flightNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {candidate.ticketDetails.departureAirport} → {candidate.ticketDetails.arrivalAirport}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(candidate.ticketDetails.departureDate).toLocaleDateString()} • {candidate.ticketDetails.departureTime}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No ticket details</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(candidate.candidateStatus)}>
                      {candidate.candidateStatus === 'entry-pass-uploaded' && <FileUp className="h-3 w-3 mr-1" />}
                      {candidate.candidateStatus === 'ticket-uploaded' && <Plane className="h-3 w-3 mr-1" />}
                      {candidate.candidateStatus === 'arrived' && <UserCheck className="h-3 w-3 mr-1" />}
                      {candidate.candidateStatus === 'onboarding' && <Timer className="h-3 w-3 mr-1" />}
                      {candidate.candidateStatus.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {candidate.ticketDate ? new Date(candidate.ticketDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {candidate.arrivalDate ? (
                      <span className="font-medium">
                        {new Date(candidate.arrivalDate).toLocaleDateString()}
                      </span>
                    ) : candidate.ticketDetails?.arrivalDate ? (
                      <span className="text-muted-foreground">
                        {new Date(candidate.ticketDetails.arrivalDate).toLocaleDateString()} (Expected)
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {candidate.agentName ? (
                      <div className="text-sm">
                        <div className="font-medium">{candidate.agentName}</div>
                        <div className="text-muted-foreground">{candidate.agentCompany}</div>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('view', candidate)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {candidate.candidateStatus === 'ticket-uploaded' && (
                        <Button
                          size="sm"
                          onClick={() => handleAction('mark-arrived', candidate)}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Arrived
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Candidate Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Travel Details</DialogTitle>
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
                  <Badge className={getStatusColor(selectedCandidate.candidateStatus)}>
                    {selectedCandidate.candidateStatus.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Personal Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Birth Date</span>
                      <span className="text-sm">{new Date(selectedCandidate.birthDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="text-sm text-right">{selectedCandidate.address}</span>
                    </div>
                    {selectedCandidate.phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Phone</span>
                        <span className="text-sm">{selectedCandidate.phone}</span>
                      </div>
                    )}
                    {selectedCandidate.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm">{selectedCandidate.email}</span>
                      </div>
                    )}
                    {selectedCandidate.position && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Position</span>
                        <span className="text-sm">{selectedCandidate.position}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Travel Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Travel Information</h4>
                  <div className="space-y-2">
                    {selectedCandidate.entryPassDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Entry Pass Date</span>
                        <span className="text-sm">{new Date(selectedCandidate.entryPassDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedCandidate.ticketDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ticket Upload Date</span>
                        <span className="text-sm">{new Date(selectedCandidate.ticketDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedCandidate.arrivalDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Actual Arrival</span>
                        <span className="text-sm font-medium">{new Date(selectedCandidate.arrivalDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              {selectedCandidate.ticketDetails && (
                <div className="space-y-4">
                  <h4 className="font-medium">Flight Details</h4>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Airline</span>
                          <span className="text-sm font-medium">{selectedCandidate.ticketDetails.airline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Flight Number</span>
                          <span className="text-sm font-medium">{selectedCandidate.ticketDetails.flightNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Booking Reference</span>
                          <span className="text-sm font-medium">{selectedCandidate.ticketDetails.bookingReference}</span>
                        </div>
                        {selectedCandidate.ticketDetails.seatNumber && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Seat Number</span>
                            <span className="text-sm font-medium">{selectedCandidate.ticketDetails.seatNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Departure</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedCandidate.ticketDetails.departureDate).toLocaleDateString()} • {selectedCandidate.ticketDetails.departureTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Arrival</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedCandidate.ticketDetails.arrivalDate).toLocaleDateString()} • {selectedCandidate.ticketDetails.arrivalTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Route</span>
                          <span className="text-sm font-medium">
                            {selectedCandidate.ticketDetails.departureAirport} → {selectedCandidate.ticketDetails.arrivalAirport}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Agent Information */}
              {selectedCandidate.agentName && (
                <div className="space-y-2">
                  <h4 className="font-medium">Agent Information</h4>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium">{selectedCandidate.agentName}</p>
                    <p className="text-sm text-muted-foreground">{selectedCandidate.agentCompany}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedCandidate.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedCandidate.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark as Arrived Dialog */}
      <Dialog open={showArrivedDialog} onOpenChange={setShowArrivedDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Arrived</DialogTitle>
            <DialogDescription>
              Confirm that {selectedCandidate?.name} has arrived in Maldives
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedCandidate?.avatar} alt={selectedCandidate?.name} />
                    <AvatarFallback>{selectedCandidate?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedCandidate?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCandidate?.passportNumber}</p>
                    {selectedCandidate?.ticketDetails && (
                      <p className="text-sm text-muted-foreground">
                        {selectedCandidate.ticketDetails.airline} {selectedCandidate.ticketDetails.flightNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This will update the candidate status to "Arrived" and make onboarding options available.
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowArrivedDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkAsArrived} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Mark as Arrived
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}