"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { useTheme } from './ThemeProvider'
import { 
  Moon, Sun, Bell, Search, Settings, LogOut, Menu, X,
  Users, AlertTriangle, UserX, UserCheck, Clock, UserMinus,
  TrendingUp, TrendingDown, Filter, RefreshCw, Download,
  ChevronRight, BarChart3, PieChart, Activity, Calendar,
  Sparkles, Shield, FolderOpen, Plus, Eye, Target, Upload,
  FileText, Building2, MapPin, User, CalendarDays, Timer,
  CheckCircle, AlertCircle, Pause, PlayCircle, FileCheck,
  FileUp, Construction, Hammer, HardHat, Trash2, Edit3,
  Star, BookOpen, TrendingUpIcon, Loader2, LayoutDashboard,
  DollarSign, Tag, ChevronLeft, Grid3x3, List, SortAsc, 
  SortDesc, Calendar as CalendarIcon2, ChevronDown,
  MoreHorizontal, ArrowUpDown, UserPlus, Calculator,
  Key, Database, Crown, Handshake, Palette, Network,
  Wallet, CreditCard, Plane, FileX, UserX2, Skull,
  ArrowRightLeft, Building, Stethoscope,
  CreditCard as InsuranceIcon, Globe, Gavel, 
  FileWarning, Receipt, MessageCircle, UserCog, Map,
  Navigation, Book, Mail, Home, Bed, Briefcase, Banknote
} from 'lucide-react'
import { Logo } from './Logo'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Separator } from './ui/separator'
import { AddProjectDialog } from './AddProjectDialog'
import { ProjectDetailsDialog } from './ProjectDetailsDialog'
import { QuotaPools } from './QuotaPools'
import { SlotDesignation } from './SlotDesignation'
import { CreateQuotaDialog } from './CreateQuotaDialog'
import { DashboardQuotaDialog } from './DashboardQuotaDialog'
import { Projects } from './Projects'
import { ViewCandidates } from './ViewCandidates'
import { OfferPending } from './OfferPending'
import { ReadyToSubmit } from './ReadyToSubmit'
import { Collection } from './Collection'
import { Tickets } from './Tickets'
import { Onboarding } from './Onboarding'
import { EmployeeManagement } from './EmployeeManagement'
import { EmployeeRegister } from './EmployeeRegister'
import { EmployeeTermination } from './EmployeeTermination'
import { EmployeeResignation } from './EmployeeResignation'
import { EmployeeMissing } from './EmployeeMissing'
import { EmployeeRetirement } from './EmployeeRetirement'
import { EmployeeDead } from './EmployeeDead'
import { EmployeeCompanyChange } from './EmployeeCompanyChange'
import { WorkPermitMedical } from './WorkPermitMedical'
import { XpatInsurance } from './XpatInsurance'
import { WorkPermit } from './WorkPermit'
import { VisaSticker } from './VisaSticker'
import { DisciplinaryLetter } from './DisciplinaryLetter'
import { DisciplinaryFines } from './DisciplinaryFines'
import { RoleManagement } from './RoleManagement'
import { AgentManagement } from './AgentManagement'
import { SlotAssignment } from './SlotAssignment'
import { HRChat } from './HRChat'
import { UserManagement } from './UserManagement'
import { Reports } from './Reports'
import { SiteAllocation } from './SiteAllocation'
import { IslandTransfer } from './IslandTransfer'
import { HRHandbook } from './HRHandbook'
import { StaffLeave } from './StaffLeave'
import { LeaveBalance } from './LeaveBalance'
import { EmailManagement } from './EmailManagement'
import { StaffAccommodation } from './StaffAccommodation'
import { StaffContracts } from './StaffContracts'
import { PrepaidCardManagement } from './PrepaidCardManagement'
import { OvertimeManagement } from './OvertimeManagement'
import { DepartureManagement } from './DepartureManagement'
import { BankAccountAssistance } from './BankAccountAssistance'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Checkbox } from './ui/checkbox'
import { toast } from 'sonner@2.0.3'
import { ThemeToggle } from './ThemeToggle'
import { ThemeDemo } from './ThemeDemo'

// Debounce hook for search inputs
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface DashboardProps {
  onLogout?: () => void
}

interface EmployeeStatus {
  id: string
  label: string
  count: number
  icon: React.ElementType
  color: string
  bgColor: string
  trend?: number
  description: string
}

interface ProjectDocument {
  name: string
  uploaded: boolean
  uploadDate?: string
  fileSize?: string
  fileName?: string
}

interface ConstructionProject {
  id: string
  projectName: string
  siteName: string
  clientName: string
  projectStartDate: string
  duration: string
  completionDate: string
  status: 'active' | 'completed' | 'on-hold' | 'planning'
  imageUrl: string
  description: string
  documents: {
    projectLicense: ProjectDocument
    paf: ProjectDocument
    siteRegistration: ProjectDocument
    clientDocuments: ProjectDocument
  }
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'reports' | 'settings' | 'quota-pools' | 'slot-designation' | 'view-candidates' | 'offer-pending' | 'ready-to-submit' | 'collection' | 'tickets' | 'onboarding' | 'employee-register' | 'employee-termination' | 'employee-resignation' | 'employee-missing' | 'employee-retirement' | 'employee-dead' | 'employee-company-change' | 'work-permit-medical' | 'xpat-insurance' | 'work-permit' | 'visa-sticker' | 'disciplinary-letter' | 'disciplinary-fines' | 'role-management' | 'theme-demo' | 'agent-management' | 'slot-assignment' | 'hr-chat' | 'user-management' | 'site-allocation' | 'island-transfer' | 'hr-handbook' | 'staff-leave' | 'leave-balance' | 'email-management' | 'staff-accommodation' | 'staff-contracts' | 'prepaid-card' | 'overtime-management' | 'departures' | 'bank-account-assistance'>('dashboard')
  const [ncrFile, setNcrFile] = useState<File | null>(null)
  const [selectedProject, setSelectedProject] = useState<ConstructionProject | null>(null)
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false)
  const [projects, setProjects] = useState<ConstructionProject[]>([])
  const [quotaPools, setQuotaPools] = useState<any[]>([])
  const [quotaPoolsUpdated, setQuotaPoolsUpdated] = useState(0) // Force re-render of quota pools
  
  // Projects-specific state
  const [projectsViewMode, setProjectsViewMode] = useState<'grid' | 'list'>('grid')
  const [projectsStatusFilter, setProjectsStatusFilter] = useState<string>('all')
  const [projectsSortBy, setProjectsSortBy] = useState<string>('name')
  const [projectsSortOrder, setProjectsSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [projectsSearchQuery, setProjectsSearchQuery] = useState('')
  const [expandedMenuItems, setExpandedMenuItems] = useState<string[]>([])
  
  const { theme, toggleTheme } = useTheme()

  // Debounced search values to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedProjectsSearchQuery = useDebounce(projectsSearchQuery, 300)

  // Refs for hover detection and timeout management
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Configuration for auto-close behavior
  const AUTO_CLOSE_DELAY = 2000 // 2 seconds delay before auto-close
  const HOVER_EXPAND_DELAY = 200 // Delay before expanding on hover

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Auto-close sidebar on mobile by default
      if (mobile) {
        setSidebarOpen(false)
        setSidebarCollapsed(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sidebar toggle handler
  const handleSidebarToggle = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(prev => !prev)
    } else {
      setSidebarCollapsed(prev => !prev)
    }
  }, [isMobile])

  // Mouse enter handler for sidebar expansion
  const handleMouseEnter = useCallback(() => {
    if (sidebarCollapsed && !isMobile) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      
      // Set hover state after delay
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(true)
      }, HOVER_EXPAND_DELAY)
    }
  }, [sidebarCollapsed, isMobile])

  // Mouse leave handler for sidebar collapse
  const handleMouseLeave = useCallback(() => {
    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (isHovering && sidebarCollapsed && !isMobile) {
      // Auto-close after delay
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(false)
      }, AUTO_CLOSE_DELAY)
    }
  }, [isHovering, sidebarCollapsed, isMobile])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  // Empty employee statuses - no dummy data
  const employeeStatuses: EmployeeStatus[] = useMemo(() => [
    {
      id: 'active',
      label: 'Active',
      count: 0,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'Currently employed and active'
    },
    {
      id: 'dead',
      label: 'DEAD',
      count: 0,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      description: 'Deceased employees'
    },
    {
      id: 'missing',
      label: 'MISSING',
      count: 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      description: 'Employees with unknown status'
    },
    {
      id: 'resigned',
      label: 'RESIGNED',
      count: 0,
      icon: UserMinus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950/30',
      description: 'Voluntarily left the organization'
    },
    {
      id: 'retired',
      label: 'RETIRED',
      count: 0,
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      description: 'Retired employees'
    },
    {
      id: 'terminated',
      label: 'TERMINATED',
      count: 0,
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      description: 'Involuntarily separated employees'
    }
  ], [])

  // Updated menu items with Bank Account Assistance
  const menuItems = useMemo(() => [
    { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' as const },
    { icon: MessageCircle, label: 'HR Team Chat', key: 'hr-chat' as const },
    { icon: FolderOpen, label: 'Projects', key: 'projects' as const },
    { 
      icon: Map, 
      label: 'Site Management', 
      key: 'site-management' as const,
      subItems: [
        { icon: Building2, label: 'Site Allocation', key: 'site-allocation' as const },
        { icon: Navigation, label: 'Island Transfer', key: 'island-transfer' as const }
      ]
    },
    { icon: Book, label: 'HR Handbook', key: 'hr-handbook' as const },
    { icon: Mail, label: 'Emails', key: 'email-management' as const },
    { icon: CreditCard, label: 'Prepaid Card Management', key: 'prepaid-card' as const },
    { icon: Timer, label: 'Overtime Management', key: 'overtime-management' as const },
    { icon: UserX, label: 'Departures', key: 'departures' as const },
    { icon: Banknote, label: 'Bank Account Assistance', key: 'bank-account-assistance' as const },
    { icon: Briefcase, label: 'Staff Employment Contracts', key: 'staff-contracts' as const },
    { icon: Home, label: 'Staff Accommodation Management', key: 'staff-accommodation' as const },
    { 
      icon: CalendarDays, 
      label: 'Staff Leave Management', 
      key: 'staff-leave-management' as const,
      subItems: [
        { icon: FileText, label: 'Staff Leave', key: 'staff-leave' as const },
        { icon: BarChart3, label: 'Leave Balance', key: 'leave-balance' as const }
      ]
    },
    { 
      icon: Calculator, 
      label: 'Quota Management', 
      key: 'quota-management' as const,
      subItems: [
        { icon: DollarSign, label: 'Quota Pools', key: 'quota-pools' as const },
        { icon: Tag, label: 'Slot Designation', key: 'slot-designation' as const }
      ]
    },
    { 
      icon: UserPlus, 
      label: 'Recruitment', 
      key: 'recruitment' as const,
      subItems: [
        { icon: Users, label: 'View Candidates', key: 'view-candidates' as const },
        { icon: Handshake, label: 'Offer Pending', key: 'offer-pending' as const },
        { icon: CheckCircle, label: 'Ready to Submit', key: 'ready-to-submit' as const },
        { icon: Wallet, label: 'Collection', key: 'collection' as const },
        { icon: Plane, label: 'Tickets', key: 'tickets' as const },
        { icon: UserCheck, label: 'Onboarding', key: 'onboarding' as const },
        { icon: Network, label: 'Agents', key: 'agent-management' as const },
        { icon: Target, label: 'Slot Assignment', key: 'slot-assignment' as const }
      ]
    },
    { 
      icon: Users, 
      label: 'Employee Management', 
      key: 'employee-management' as const,
      subItems: [
        { icon: FileText, label: 'Employee Register', key: 'employee-register' as const },
        { icon: UserX, label: 'Termination', key: 'employee-termination' as const },
        { icon: UserMinus, label: 'Resignation', key: 'employee-resignation' as const },
        { icon: AlertTriangle, label: 'Missing', key: 'employee-missing' as const },
        { icon: Clock, label: 'Retirement', key: 'employee-retirement' as const },
        { icon: Skull, label: 'Dead', key: 'employee-dead' as const },
        { icon: Building, label: 'Company Change', key: 'employee-company-change' as const }
      ]
    },
    { 
      icon: Gavel, 
      label: 'Disciplinary Actions', 
      key: 'disciplinary-actions' as const,
      subItems: [
        { icon: FileWarning, label: 'Disciplinary Letter', key: 'disciplinary-letter' as const },
        { icon: Receipt, label: 'Disciplinary Fines', key: 'disciplinary-fines' as const }
      ]
    },
    { 
      icon: Globe, 
      label: 'XPAT Management', 
      key: 'xpat-management' as const,
      subItems: [
        { icon: Stethoscope, label: 'Work Permit Medical', key: 'work-permit-medical' as const },
        { icon: InsuranceIcon, label: 'Insurance', key: 'xpat-insurance' as const },
        { icon: Shield, label: 'Work Permit', key: 'work-permit' as const },
        { icon: FileCheck, label: 'VISA Sticker', key: 'visa-sticker' as const }
      ]
    },
    { icon: PieChart, label: 'Reports', key: 'reports' as const },
    { 
      icon: Settings, 
      label: 'Settings', 
      key: 'settings' as const,
      subItems: [
        { icon: UserCog, label: 'User Management', key: 'user-management' as const },
        { icon: Shield, label: 'Role Management', key: 'role-management' as const },
        { icon: Palette, label: 'Theme Demo', key: 'theme-demo' as const }
      ]
    },
  ], [])

  const handleMenuItemClick = useCallback((key: typeof currentView) => {
    setCurrentView(key)
    
    // Auto-expand parent menu when navigating to a submenu item
    if (key === 'quota-pools' || key === 'slot-designation') {
      setExpandedMenuItems(prev => 
        prev.includes('quota-management') ? prev : [...prev, 'quota-management']
      )
    } else if (key === 'view-candidates' || key === 'offer-pending' || key === 'ready-to-submit' || key === 'collection' || key === 'tickets' || key === 'onboarding' || key === 'agent-management' || key === 'slot-assignment') {
      setExpandedMenuItems(prev => 
        prev.includes('recruitment') ? prev : [...prev, 'recruitment']
      )
    } else if (key === 'employee-register' || key === 'employee-termination' || key === 'employee-resignation' || key === 'employee-missing' || key === 'employee-retirement' || key === 'employee-dead' || key === 'employee-company-change') {
      setExpandedMenuItems(prev => 
        prev.includes('employee-management') ? prev : [...prev, 'employee-management']
      )
    } else if (key === 'disciplinary-letter' || key === 'disciplinary-fines') {
      setExpandedMenuItems(prev => 
        prev.includes('disciplinary-actions') ? prev : [...prev, 'disciplinary-actions']
      )
    } else if (key === 'work-permit-medical' || key === 'xpat-insurance' || key === 'work-permit' || key === 'visa-sticker') {
      setExpandedMenuItems(prev => 
        prev.includes('xpat-management') ? prev : [...prev, 'xpat-management']
      )
    } else if (key === 'user-management' || key === 'role-management' || key === 'theme-demo') {
      setExpandedMenuItems(prev => 
        prev.includes('settings') ? prev : [...prev, 'settings']
      )
    } else if (key === 'staff-leave' || key === 'leave-balance') {
      setExpandedMenuItems(prev => 
        prev.includes('staff-leave-management') ? prev : [...prev, 'staff-leave-management']
      )
    } else if (key === 'site-allocation' || key === 'island-transfer') {
      setExpandedMenuItems(prev => 
        prev.includes('site-management') ? prev : [...prev, 'site-management']
      )
    }
  }, [])

  const toggleMenuExpansion = useCallback((key: string) => {
    setExpandedMenuItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }, [])

  // Navigation handler for QuotaPools component
  const handleQuotaPoolsNavigation = useCallback((page: string) => {
    if (page === 'slot-designation') {
      setCurrentView('slot-designation')
      // Ensure Quota Management menu is expanded
      setExpandedMenuItems(prev => 
        prev.includes('quota-management') ? prev : [...prev, 'quota-management']
      )
    } else {
      setCurrentView(page as typeof currentView)
    }
  }, [])

  const renderMainContent = () => {
    switch (currentView) {
      case 'hr-chat':
        return <HRChat />
      case 'projects':
        return <Projects />
      case 'quota-pools':
        return (
          <QuotaPools 
            onNavigate={handleQuotaPoolsNavigation}
            projects={projects}
            searchQuery={searchQuery}
          />
        )
      case 'slot-designation':
        return <SlotDesignation searchQuery={searchQuery} />
      case 'view-candidates':
        return <ViewCandidates />
      case 'offer-pending':
        return <OfferPending />
      case 'ready-to-submit':
        return <ReadyToSubmit />
      case 'collection':
        return <Collection />
      case 'tickets':
        return <Tickets />
      case 'onboarding':
        return <Onboarding />
      case 'employee-register':
        return <EmployeeRegister />
      case 'employee-termination':
        return <EmployeeTermination />
      case 'employee-resignation':
        return <EmployeeResignation />
      case 'employee-missing':
        return <EmployeeMissing />
      case 'employee-retirement':
        return <EmployeeRetirement />
      case 'employee-dead':
        return <EmployeeDead />
      case 'employee-company-change':
        return <EmployeeCompanyChange />
      case 'disciplinary-letter':
        return <DisciplinaryLetter />
      case 'disciplinary-fines':
        return <DisciplinaryFines />
      case 'work-permit-medical':
        return <WorkPermitMedical />
      case 'xpat-insurance':
        return <XpatInsurance />
      case 'work-permit':
        return <WorkPermit />
      case 'visa-sticker':
        return <VisaSticker />
      case 'agent-management':
        return <AgentManagement />
      case 'slot-assignment':
        return <SlotAssignment />
      case 'user-management':
        return <UserManagement />
      case 'role-management':
        return <RoleManagement />
      case 'theme-demo':
        return <ThemeDemo />
      case 'reports':
        return <Reports />
      case 'site-allocation':
        return <SiteAllocation />
      case 'island-transfer':
        return <IslandTransfer />
      case 'hr-handbook':
        return <HRHandbook />
      case 'staff-leave':
        return <StaffLeave />
      case 'leave-balance':
        return <LeaveBalance />
      case 'email-management':
        return <EmailManagement />
      case 'staff-accommodation':
        return <StaffAccommodation />
      case 'staff-contracts':
        return <StaffContracts />
      case 'prepaid-card':
        return <PrepaidCardManagement />
      case 'overtime-management':
        return <OvertimeManagement />
      case 'departures':
        return <DepartureManagement />
      case 'bank-account-assistance':
        return <BankAccountAssistance />
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">General system settings and configurations.</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleMenuItemClick('user-management')}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">User Management</CardTitle>
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Create and manage system users and accounts
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleMenuItemClick('role-management')}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Role Management</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Manage user roles, permissions, and access control
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleMenuItemClick('theme-demo')}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Theme Demo</CardTitle>
                    <Palette className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Test light and dark mode compatibility
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )
      default:
        // Dashboard content
        return (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Overview of your HR operations and system status
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => toast('Refreshing dashboard...')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Employee Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {employeeStatuses.map((status) => (
                <Card key={status.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{status.label}</CardTitle>
                    <status.icon className={`h-4 w-4 ${status.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{status.count.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Ready to begin tracking</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{status.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Welcome Message for Empty State */}
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-6">
                  <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Welcome to HR Operations System</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your comprehensive HR management platform is ready. Start by creating projects, adding candidates, or managing employee records.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => handleMenuItemClick('projects')}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                    <Button variant="outline" onClick={() => handleMenuItemClick('view-candidates')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Candidates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className={`
          bg-sidebar border-r border-sidebar-border flex flex-col
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${!isMobile && sidebarCollapsed ? 'w-16' : 'w-64'}
          transition-all duration-300 ease-in-out
        `}
        initial={false}
        animate={{
          width: isMobile ? (sidebarOpen ? 256 : 0) : (sidebarCollapsed && !isHovering ? 64 : 256),
          translateX: isMobile && !sidebarOpen ? '-100%' : '0%'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <AnimatePresence mode="wait">
            {((!sidebarCollapsed && !isMobile) || (sidebarCollapsed && isHovering && !isMobile) || (isMobile && sidebarOpen)) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Logo className="h-8 w-8" />
                <span className="font-semibold text-sidebar-foreground">HR Operations</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSidebarToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isMobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.key}>
              {/* Main menu item */}
              <Button
                variant={currentView === item.key ? 'default' : 'ghost'}
                className={`
                  w-full justify-start gap-2 text-sidebar-foreground
                  ${(!sidebarCollapsed && !isMobile) || (sidebarCollapsed && isHovering && !isMobile) || (isMobile && sidebarOpen) ? 'px-3' : 'px-2 justify-center'}
                  ${item.subItems ? 'mb-1' : ''}
                `}
                onClick={() => {
                  if (item.subItems) {
                    toggleMenuExpansion(item.key)
                  } else {
                    handleMenuItemClick(item.key)
                  }
                }}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {((!sidebarCollapsed && !isMobile) || (sidebarCollapsed && isHovering && !isMobile) || (isMobile && sidebarOpen)) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.subItems && ((!sidebarCollapsed && !isMobile) || (sidebarCollapsed && isHovering && !isMobile) || (isMobile && sidebarOpen)) && (
                  <ChevronDown 
                    className={`h-4 w-4 ml-auto transition-transform ${ 
                      expandedMenuItems.includes(item.key) ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </Button>

              {/* Submenu items */}
              {item.subItems && expandedMenuItems.includes(item.key) && ((!sidebarCollapsed && !isMobile) || (sidebarCollapsed && isHovering && !isMobile) || (isMobile && sidebarOpen)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-6 space-y-1 overflow-hidden"
                >
                  {item.subItems.map((subItem) => (
                    <Button
                      key={subItem.key}
                      variant={currentView === subItem.key ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2 text-sidebar-foreground text-sm"
                      onClick={() => handleMenuItemClick(subItem.key)}
                    >
                      <subItem.icon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{subItem.label}</span>
                    </Button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <AnimatePresence mode="wait">
              {((!sidebarCollapsed && !isMobile) || (sidebarCollapsed && isHovering && !isMobile) || (isMobile && sidebarOpen)) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleMenuItemClick('settings')}>
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {renderMainContent()}
        </main>
      </div>
    </div>
  )
}