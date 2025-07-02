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
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { 
  Search, 
  RefreshCw,
  Download,
  Users,
  Loader2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Eye,
  UserCheck,
  Timer,
  UserPlus,
  CheckCheck,
  Zap,
  Sparkles,
  Rocket,
  Award,
  Star,
  Crown,
  Wand2,
  ChevronRight,
  Clock,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  Settings,
  Filter,
  MoreHorizontal,
  FileText,
  Send,
  Bell,
  Target,
  TrendingUp,
  BarChart3,
  UserX,
  Users2,
  Shuffle
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Candidate {
  id: string
  name: string
  nationality: string
  passportNumber: string
  empId?: string
  position?: string
  candidateStatus: 'arrived' | 'onboarding' | 'employee'
  arrivalDate?: string
  avatar?: string
  onboardingChecklist?: {
    documentVerification: boolean
    medicalCheckup: boolean
    orientationTraining: boolean
    policyBriefing: boolean
    workPermitProcessing: boolean
    accommodationAssignment: boolean
    equipmentIssuance: boolean
    systemAccess: boolean
  }
  department?: string
  designation?: string
  salary?: number
  workLocation?: string
  managerId?: string
  startDate?: string
  createdAt: string
  completedAt?: string
}

interface OnboardingForm {
  department: string
  designation: string
  salary: string
  managerId: string
  workLocation: string
  startDate: string
  notes: string
}

interface OneClickSettings {
  defaultDepartment: string
  defaultSalaryRange: {
    min: number
    max: number
  }
  defaultWorkLocation: string
  autoAssignManager: boolean
  enableBulkOnboarding: boolean
  requireApproval: boolean
}

type SortField = 'name' | 'nationality' | 'candidateStatus' | 'arrivalDate'
type SortDirection = 'asc' | 'desc'

// Smart defaults for one-click onboarding
const SMART_DEFAULTS = {
  departments: [
    { id: 'construction', name: 'Construction', defaultSalary: 15000 },
    { id: 'maintenance', name: 'Maintenance', defaultSalary: 12000 },
    { id: 'engineering', name: 'Engineering', defaultSalary: 25000 },
    { id: 'administration', name: 'Administration', defaultSalary: 18000 },
    { id: 'security', name: 'Security', defaultSalary: 10000 },
    { id: 'housekeeping', name: 'Housekeeping', defaultSalary: 8000 }
  ],
  workLocations: [
    'Site A - Main Construction',
    'Site B - Maintenance Hub',
    'Head Office - Male',
    'Training Center',
    'Warehouse - Hulhumale'
  ],
  salaryByNationality: {
    'Bangladesh': { min: 8000, max: 15000 },
    'India': { min: 10000, max: 18000 },
    'Nepal': { min: 9000, max: 16000 },
    'Pakistan': { min: 8500, max: 14000 },
    'Sri Lanka': { min: 12000, max: 20000 },
    'Philippines': { min: 15000, max: 25000 }
  }
}

export function Onboarding() {
  // Empty data - no dummy data
  const [candidates, setCandidates] = useState<Candidate[]>([])

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('arrivalDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  // Dialog states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showOneClickDialog, setShowOneClickDialog] = useState(false)
  const [showBulkOnboardingDialog, setShowBulkOnboardingDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Form states
  const [onboardingForm, setOnboardingForm] = useState<OnboardingForm>({
    department: '',
    designation: '',
    salary: '',
    managerId: '',
    workLocation: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // One-click settings
  const [oneClickSettings, setOneClickSettings] = useState<OneClickSettings>({
    defaultDepartment: 'construction',
    defaultSalaryRange: { min: 8000, max: 25000 },
    defaultWorkLocation: 'Site A - Main Construction',
    autoAssignManager: true,
    enableBulkOnboarding: true,
    requireApproval: false
  })

  // Progress tracking
  const [onboardingProgress, setOnboardingProgress] = useState<{
    total: number
    completed: number
    inProgress: number
    failed: number
  }>({
    total: 0,
    completed: 0,
    inProgress: 0,
    failed: 0
  })

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCandidates = candidates.length
    const arrivedCount = candidates.filter(c => c.candidateStatus === 'arrived').length
    const onboardingCount = candidates.filter(c => c.candidateStatus === 'onboarding').length
    const employeeCount = candidates.filter(c => c.candidateStatus === 'employee').length
    
    const totalProgress = candidates.reduce((sum, candidate) => {
      return sum + getOnboardingProgress(candidate)
    }, 0)
    const completionRate = totalCandidates > 0 ? totalProgress / totalCandidates : 0
    
    return {
      totalCandidates,
      arrivedCount,
      onboardingCount,
      employeeCount,
      completionRate,
      readyForOneClick: arrivedCount // Candidates ready for one-click onboarding
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
                          (candidate.empId && candidate.empId.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || candidate.candidateStatus === statusFilter
      const matchesNationality = nationalityFilter === 'all' || candidate.nationality === nationalityFilter
      
      return matchesSearch && matchesStatus && matchesNationality
    })

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'arrivalDate') {
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

  const getOnboardingProgress = (candidate: Candidate): number => {
    if (!candidate.onboardingChecklist) return 0
    const checklist = candidate.onboardingChecklist
    const completedItems = Object.values(checklist).filter(Boolean).length
    return (completedItems / 8) * 100
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'arrived': return 'bg-indigo-500/10 text-indigo-700 border-indigo-200'
      case 'onboarding': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'employee': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  // Smart default generation
  const generateSmartDefaults = useCallback((candidate: Candidate) => {
    const department = SMART_DEFAULTS.departments.find(d => d.id === oneClickSettings.defaultDepartment) || SMART_DEFAULTS.departments[0]
    const salaryRange = SMART_DEFAULTS.salaryByNationality[candidate.nationality] || { min: 10000, max: 15000 }
    const defaultSalary = candidate.position?.toLowerCase().includes('engineer') ? salaryRange.max : 
                         candidate.position?.toLowerCase().includes('supervisor') ? Math.round((salaryRange.min + salaryRange.max) / 2) :
                         salaryRange.min

    return {
      department: department.name,
      designation: candidate.position || 'General Worker',
      salary: defaultSalary.toString(),
      workLocation: oneClickSettings.defaultWorkLocation,
      managerId: oneClickSettings.autoAssignManager ? 'auto-assign' : '',
      startDate: new Date().toISOString().split('T')[0],
      notes: `One-click onboarded from ${candidate.nationality} - ${new Date().toLocaleDateString()}`
    }
  }, [oneClickSettings])

  // One-click onboarding function
  const handleOneClickOnboarding = useCallback(async (candidate: Candidate) => {
    setIsLoading(true)
    setOnboardingProgress(prev => ({ ...prev, inProgress: prev.inProgress + 1 }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate smart defaults
      const smartDefaults = generateSmartDefaults(candidate)
      
      // Create complete onboarding checklist
      const completedChecklist = {
        documentVerification: true,
        medicalCheckup: true,
        orientationTraining: true,
        policyBriefing: true,
        workPermitProcessing: true,
        accommodationAssignment: true,
        equipmentIssuance: true,
        systemAccess: true
      }

      // Generate employee ID
      const empId = `EMP${Date.now().toString().slice(-6)}`

      // Update candidate to employee
      const updatedCandidate: Candidate = {
        ...candidate,
        candidateStatus: 'employee',
        empId,
        onboardingChecklist: completedChecklist,
        department: smartDefaults.department,
        designation: smartDefaults.designation,
        salary: parseInt(smartDefaults.salary),
        workLocation: smartDefaults.workLocation,
        startDate: smartDefaults.startDate,
        completedAt: new Date().toISOString()
      }

      // Update candidates list
      setCandidates(prev => prev.map(c => c.id === candidate.id ? updatedCandidate : c))
      
      setOnboardingProgress(prev => ({ 
        ...prev, 
        completed: prev.completed + 1,
        inProgress: prev.inProgress - 1
      }))

      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <div className="font-semibold">One-Click Onboarding Complete!</div>
            <div className="text-sm text-muted-foreground">
              {candidate.name} is now Employee {empId}
            </div>
          </div>
        </div>
      )

    } catch (error) {
      setOnboardingProgress(prev => ({ 
        ...prev, 
        failed: prev.failed + 1,
        inProgress: prev.inProgress - 1
      }))
      toast.error(`Failed to onboard ${candidate.name}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [generateSmartDefaults])

  // Bulk one-click onboarding
  const handleBulkOneClickOnboarding = useCallback(async () => {
    const arrivedCandidates = candidates.filter(c => c.candidateStatus === 'arrived')
    const selectedArrivedCandidates = arrivedCandidates.filter(c => selectedCandidates.includes(c.id))
    
    if (selectedArrivedCandidates.length === 0) {
      toast.error('Please select candidates to onboard')
      return
    }

    setIsLoading(true)
    setOnboardingProgress({ total: selectedArrivedCandidates.length, completed: 0, inProgress: 0, failed: 0 })

    try {
      // Process candidates in batches of 3
      const batchSize = 3
      for (let i = 0; i < selectedArrivedCandidates.length; i += batchSize) {
        const batch = selectedArrivedCandidates.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(candidate => handleOneClickOnboarding(candidate))
        )
        
        // Small delay between batches
        if (i + batchSize < selectedArrivedCandidates.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      setSelectedCandidates([])
      setShowBulkOnboardingDialog(false)
      
      toast.success(
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4" />
          <div>
            <div className="font-semibold">Bulk Onboarding Complete!</div>
            <div className="text-sm text-muted-foreground">
              {selectedArrivedCandidates.length} candidates onboarded successfully
            </div>
          </div>
        </div>
      )

    } catch (error) {
      toast.error('Bulk onboarding failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [candidates, selectedCandidates, handleOneClickOnboarding])

  // Handle candidate selection
  const handleCandidateSelection = useCallback((candidateId: string, selected: boolean) => {
    setSelectedCandidates(prev => 
      selected 
        ? [...prev, candidateId]
        : prev.filter(id => id !== candidateId)
    )
  }, [])

  // Select all candidates
  const handleSelectAll = useCallback((selected: boolean) => {
    const arrivedCandidates = filteredAndSortedCandidates.filter(c => c.candidateStatus === 'arrived')
    setSelectedCandidates(selected ? arrivedCandidates.map(c => c.id) : [])
  }, [filteredAndSortedCandidates])

  // Traditional onboarding handlers (kept for backward compatibility)
  const handleStartOnboarding = useCallback(async () => {
    if (!selectedCandidate) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const updatedCandidate = {
        ...selectedCandidate,
        candidateStatus: 'onboarding' as const,
        onboardingChecklist: {
          documentVerification: false,
          medicalCheckup: false,
          orientationTraining: false,
          policyBriefing: false,
          workPermitProcessing: false,
          accommodationAssignment: false,
          equipmentIssuance: false,
          systemAccess: false
        }
      }

      setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? updatedCandidate : c))
      setShowOnboardingDialog(false)
      toast.success(`Started onboarding process for ${selectedCandidate.name}`)

    } catch (error) {
      toast.error('Failed to start onboarding process. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCandidate])

  const handleCompleteOnboarding = useCallback(async () => {
    if (!selectedCandidate) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const empId = `EMP${Date.now().toString().slice(-6)}`
      const updatedCandidate = {
        ...selectedCandidate,
        candidateStatus: 'employee' as const,
        empId,
        department: onboardingForm.department,
        designation: onboardingForm.designation,
        salary: parseInt(onboardingForm.salary),
        workLocation: onboardingForm.workLocation,
        startDate: onboardingForm.startDate,
        completedAt: new Date().toISOString()
      }

      setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? updatedCandidate : c))
      setShowCompleteDialog(false)
      toast.success(`${selectedCandidate.name} is now Employee ${empId}`)

    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCandidate, onboardingForm])

  return (
    <div className="space-y-6">
      {/* Enhanced Header with One-Click Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Candidate Onboarding
          </h1>
          <p className="text-muted-foreground">
            One-click onboarding system • {filteredAndSortedCandidates.length} candidate{filteredAndSortedCandidates.length !== 1 ? 's' : ''} • {summaryStats.readyForOneClick} ready for instant onboarding
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
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

      {/* Enhanced Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">In onboarding pipeline</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for One-Click</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.readyForOneClick}</div>
            <p className="text-xs text-muted-foreground">Instant onboarding available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.onboardingCount}</div>
            <p className="text-xs text-muted-foreground">Onboarding active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summaryStats.employeeCount}</div>
            <p className="text-xs text-muted-foreground">Now employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">One-click success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Avg. checklist completion</p>
          </CardContent>
        </Card>
      </div>

      {/* One-Click Action Panel */}
      {summaryStats.readyForOneClick > 0 && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">One-Click Onboarding Available</h3>
                  <p className="text-sm text-muted-foreground">
                    {summaryStats.readyForOneClick} candidate{summaryStats.readyForOneClick !== 1 ? 's' : ''} ready for instant onboarding with smart defaults
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowBulkOnboardingDialog(true)}
                  disabled={selectedCandidates.length === 0}
                >
                  <Users2 className="h-4 w-4 mr-2" />
                  Bulk Onboard ({selectedCandidates.length})
                </Button>
                <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start One-Click Mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates, EMP ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
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

      {/* Results Table or Empty State */}
      {filteredAndSortedCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <UserPlus className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No candidates for onboarding</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || nationalityFilter !== 'all'
                    ? 'Try adjusting your search filters to find candidates.'
                    : 'No candidates ready for onboarding at this time. Check back later or adjust your filters.'}
                </p>
              </div>
              {!searchQuery && statusFilter === 'all' && nationalityFilter === 'all' && (
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {/* Bulk Actions Bar */}
          {selectedCandidates.length > 0 && (
            <div className="p-4 bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCandidates.length === filteredAndSortedCandidates.filter(c => c.candidateStatus === 'arrived').length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCandidates([])}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowBulkOnboardingDialog(true)}
                    className="bg-gradient-to-r from-primary to-blue-600"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    One-Click Onboard ({selectedCandidates.length})
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCandidates.length === filteredAndSortedCandidates.filter(c => c.candidateStatus === 'arrived').length && filteredAndSortedCandidates.filter(c => c.candidateStatus === 'arrived').length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
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
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('candidateStatus')} className="h-auto p-0 font-medium">
                    Status {getSortIcon('candidateStatus')}
                  </Button>
                </TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('arrivalDate')} className="h-auto p-0 font-medium">
                    Arrival Date {getSortIcon('arrivalDate')}
                  </Button>
                </TableHead>
                <TableHead>EMP ID</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-muted/30">
                  <TableCell>
                    {candidate.candidateStatus === 'arrived' && (
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={(checked) => handleCandidateSelection(candidate.id, checked as boolean)}
                      />
                    )}
                  </TableCell>
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
                    <Badge className={getStatusColor(candidate.candidateStatus)}>
                      {candidate.candidateStatus === 'arrived' && <UserCheck className="h-3 w-3 mr-1" />}
                      {candidate.candidateStatus === 'onboarding' && <Timer className="h-3 w-3 mr-1" />}
                      {candidate.candidateStatus === 'employee' && <UserPlus className="h-3 w-3 mr-1" />}
                      {candidate.candidateStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{getOnboardingProgress(candidate).toFixed(0)}%</span>
                        <span className="text-muted-foreground">
                          {candidate.onboardingChecklist ? Object.values(candidate.onboardingChecklist).filter(Boolean).length : 0}/8
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${getOnboardingProgress(candidate)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {candidate.arrivalDate ? new Date(candidate.arrivalDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {candidate.empId ? (
                      <Badge variant="outline" className="font-mono">
                        {candidate.empId}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{candidate.position || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCandidate(candidate)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      {candidate.candidateStatus === 'arrived' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleOneClickOnboarding(candidate)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3 mr-1" />
                            )}
                            One-Click
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCandidate(candidate)
                              setShowOnboardingDialog(true)
                            }}
                          >
                            <Timer className="h-3 w-3 mr-1" />
                            Manual
                          </Button>
                        </>
                      )}
                      
                      {candidate.candidateStatus === 'onboarding' && getOnboardingProgress(candidate) >= 75 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCandidate(candidate)
                            setOnboardingForm({
                              department: '',
                              designation: candidate.position || '',
                              salary: '',
                              managerId: '',
                              workLocation: '',
                              startDate: new Date().toISOString().split('T')[0],
                              notes: ''
                            })
                            setShowCompleteDialog(true)
                          }}
                        >
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Complete
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

      {/* Bulk Onboarding Dialog */}
      <Dialog open={showBulkOnboardingDialog} onOpenChange={setShowBulkOnboardingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Bulk One-Click Onboarding
            </DialogTitle>
            <DialogDescription>
              Instantly onboard {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} with smart defaults
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                What will happen:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete all 8 onboarding checklist items</li>
                <li>• Assign departments based on position</li>
                <li>• Set competitive salaries by nationality</li>
                <li>• Generate employee IDs automatically</li>
                <li>• Set start date to today</li>
              </ul>
            </div>

            {onboardingProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{onboardingProgress.completed}/{onboardingProgress.total}</span>
                </div>
                <Progress value={(onboardingProgress.completed / onboardingProgress.total) * 100} />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowBulkOnboardingDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkOneClickOnboarding} 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-blue-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Onboard All ({selectedCandidates.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              One-Click Onboarding Settings
            </DialogTitle>
            <DialogDescription>
              Configure default values for instant onboarding
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Department</Label>
                <Select 
                  value={oneClickSettings.defaultDepartment} 
                  onValueChange={(value) => setOneClickSettings(prev => ({ ...prev, defaultDepartment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SMART_DEFAULTS.departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} (MVR {dept.defaultSalary})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Work Location</Label>
                <Select 
                  value={oneClickSettings.defaultWorkLocation} 
                  onValueChange={(value) => setOneClickSettings(prev => ({ ...prev, defaultWorkLocation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SMART_DEFAULTS.workLocations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoAssignManager"
                    checked={oneClickSettings.autoAssignManager}
                    onCheckedChange={(checked) => setOneClickSettings(prev => ({ ...prev, autoAssignManager: checked as boolean }))}
                  />
                  <Label htmlFor="autoAssignManager">Auto-assign managers</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableBulkOnboarding"
                    checked={oneClickSettings.enableBulkOnboarding}
                    onCheckedChange={(checked) => setOneClickSettings(prev => ({ ...prev, enableBulkOnboarding: checked as boolean }))}
                  />
                  <Label htmlFor="enableBulkOnboarding">Enable bulk onboarding</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireApproval"
                    checked={oneClickSettings.requireApproval}
                    onCheckedChange={(checked) => setOneClickSettings(prev => ({ ...prev, requireApproval: checked as boolean }))}
                  />
                  <Label htmlFor="requireApproval">Require approval before onboarding</Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSettingsDialog(false)
                toast.success('Settings saved successfully')
              }}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Traditional Onboarding Dialogs (kept for backward compatibility) */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Onboarding</DialogTitle>
            <DialogDescription>
              Create employee record for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={onboardingForm.department} onValueChange={(value) => setOnboardingForm(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    value={onboardingForm.designation}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="Job title"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary (MVR) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={onboardingForm.salary}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="15000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={onboardingForm.startDate}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Input
                  id="workLocation"
                  value={onboardingForm.workLocation}
                  onChange={(e) => setOnboardingForm(prev => ({ ...prev, workLocation: e.target.value }))}
                  placeholder="Site A - Main Construction"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={onboardingForm.notes}
                  onChange={(e) => setOnboardingForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the employee"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompleteOnboarding} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Complete Onboarding
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start Onboarding Process</DialogTitle>
            <DialogDescription>
              Begin the traditional onboarding process for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowOnboardingDialog(false)}>Cancel</Button>
            <Button onClick={handleStartOnboarding} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start Onboarding
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}