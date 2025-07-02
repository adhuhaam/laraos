"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { CreateQuotaDialog } from './CreateQuotaDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { ScrollArea } from './ui/scroll-area'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  Target, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  Eye,
  MoreHorizontal,
  Building2,
  UserCheck,
  PlayCircle,
  PauseCircle,
  Settings,
  CalendarDays,
  AlertCircleIcon,
  Info,
  RefreshCw,
  CreditCard,
  Wallet,
  BanknoteIcon,
  Receipt,
  Upload,
  Download,
  FileText,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  RotateCcw,
  Save,
  History,
  CreditCardIcon,
  Zap,
  Timer,
  Ban,
  Minimize2,
  Maximize2,
  Square,
  Copy,
  Archive,
  MoreVertical,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  FilterX,
  Columns,
  Download as DownloadIcon,
  Keyboard,
  Lightbulb,
  GripVertical,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  TrendingDown as TrendDown,
  Phone,
  Mail,
  MapPin,
  Calendar as Cal,
  DollarSign as Dollar
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Slot {
  id: string
  number: number
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'suspended'
  startDate: string
  expiryDate: string
  paymentType: 'full' | 'installment'
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  lastPaymentDate?: string
  nextPaymentDate?: string
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
  paymentHistory: PaymentRecord[]
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
}

interface PaymentRecord {
  id: string
  amount: number
  date: string
  type: 'full' | 'installment' | 'renewal'
  status: 'completed' | 'pending' | 'failed'
  receiptUrl?: string
  notes?: string
}

interface QuotaPool {
  id: string
  name: string
  projectName: string
  totalSlots: number
  allocatedSlots: number
  availableSlots: number
  createdAt: string
  updatedAt: string
  status: 'active' | 'inactive'
  slots: Slot[]
}

type WindowState = 'normal' | 'maximized' | 'minimized'
type SortField = 'number' | 'status' | 'assignedTo' | 'totalAmount' | 'paidAmount' | 'startDate' | 'expiryDate'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'table' | 'grid' | 'timeline'

const mockQuotaPools: QuotaPool[] = [
  {
    id: '1',
    name: 'Pool Alpha',
    projectName: 'Project Alpha',
    totalSlots: 50,
    allocatedSlots: 32,
    availableSlots: 18,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
    status: 'active',
    slots: [
      {
        id: 'slot-1',
        number: 1,
        status: 'active',
        startDate: '2024-01-01',
        expiryDate: '2024-12-31',
        paymentType: 'full',
        totalAmount: 2000,
        paidAmount: 2000,
        remainingAmount: 0,
        lastPaymentDate: '2024-01-01',
        assignedTo: 'John Doe',
        notes: 'Premium slot with full payment',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        priority: 'high',
        tags: ['premium', 'completed'],
        paymentHistory: [
          {
            id: 'pay-1',
            amount: 2000,
            date: '2024-01-01',
            type: 'full',
            status: 'completed',
            receiptUrl: '/receipts/receipt-1.pdf'
          }
        ]
      },
      {
        id: 'slot-2',
        number: 2,
        status: 'pending',
        startDate: '2024-02-01',
        expiryDate: '2025-01-31',
        paymentType: 'installment',
        totalAmount: 2000,
        paidAmount: 340,
        remainingAmount: 1660,
        lastPaymentDate: '2024-02-01',
        nextPaymentDate: '2024-03-01',
        assignedTo: 'Jane Smith',
        notes: 'Installment payment plan',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15',
        priority: 'medium',
        tags: ['installment', 'pending'],
        paymentHistory: [
          {
            id: 'pay-2',
            amount: 174,
            date: '2024-02-01',
            type: 'installment',
            status: 'completed'
          },
          {
            id: 'pay-3',
            amount: 166,
            date: '2024-02-15',
            type: 'installment',
            status: 'completed'
          }
        ]
      },
      {
        id: 'slot-3',
        number: 3,
        status: 'expired',
        startDate: '2023-01-01',
        expiryDate: '2023-12-31',
        paymentType: 'full',
        totalAmount: 2000,
        paidAmount: 2000,
        remainingAmount: 0,
        lastPaymentDate: '2023-01-01',
        assignedTo: 'Bob Johnson',
        notes: 'Expired slot - needs renewal',
        createdAt: '2023-01-01',
        updatedAt: '2023-12-31',
        priority: 'low',
        tags: ['expired', 'renewal-needed'],
        paymentHistory: [
          {
            id: 'pay-4',
            amount: 2000,
            date: '2023-01-01',
            type: 'full',
            status: 'completed'
          }
        ]
      }
    ]
  }
]

export function QuotaPools({ 
  onNavigate,
  projects = [],
  searchQuery = '' 
}: { 
  onNavigate?: (page: string) => void
  projects?: any[]
  searchQuery?: string
}) {
  // Basic state
  const [quotaPools, setQuotaPools] = useState<QuotaPool[]>(mockQuotaPools)
  const [selectedPool, setSelectedPool] = useState<QuotaPool | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSlotDetails, setShowSlotDetails] = useState(false)
  const [showEditSlot, setShowEditSlot] = useState(false)
  const [showSlotManagement, setShowSlotManagement] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  // Enhanced interactive state
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('number')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [slotSearchTerm, setSlotSearchTerm] = useState('')
  const [inlineEditingSlot, setInlineEditingSlot] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterPaymentType, setFilterPaymentType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })

  // Window state management - defaults to maximized for optimal space usage
  const [slotDetailsState, setSlotDetailsState] = useState<WindowState>('maximized')
  const [editSlotState, setEditSlotState] = useState<WindowState>('maximized')
  const [slotManagementState, setSlotManagementState] = useState<WindowState>('maximized')

  // Real-time updates simulation
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      // Simulate real-time updates
      setQuotaPools(prev => prev.map(pool => ({
        ...pool,
        updatedAt: new Date().toISOString().split('T')[0]
      })))
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault()
            if (selectedPool?.slots) {
              setSelectedSlots(new Set(selectedPool.slots.map(slot => slot.id)))
              toast.success('All slots selected')
            }
            break
          case 'e':
            e.preventDefault()
            if (selectedSlots.size === 1) {
              const slotId = Array.from(selectedSlots)[0]
              const slot = selectedPool?.slots.find(s => s.id === slotId)
              if (slot) {
                setEditingSlot(slot)
                setShowEditSlot(true)
              }
            }
            break
          case 'f':
            e.preventDefault()
            setShowAdvancedFilters(!showAdvancedFilters)
            break
          case 'r':
            e.preventDefault()
            handleRefreshData()
            break
          case '?':
            e.preventDefault()
            setShowKeyboardShortcuts(true)
            break
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedSlots(new Set())
        setSlotSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSlots, selectedPool, showAdvancedFilters])

  // Filter pools based on search term
  const filteredPools = quotaPools.filter(pool =>
    pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Advanced slot filtering and sorting
  const filteredAndSortedSlots = useMemo(() => {
    if (!selectedPool) return []

    let filtered = selectedPool.slots.filter(slot => {
      const matchesSearch = !slotSearchTerm || 
        slot.assignedTo?.toLowerCase().includes(slotSearchTerm.toLowerCase()) ||
        slot.notes?.toLowerCase().includes(slotSearchTerm.toLowerCase()) ||
        slot.number.toString().includes(slotSearchTerm) ||
        slot.id.toLowerCase().includes(slotSearchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || slot.status === filterStatus
      const matchesPriority = filterPriority === 'all' || slot.priority === filterPriority
      const matchesPaymentType = filterPaymentType === 'all' || slot.paymentType === filterPaymentType
      
      const matchesDateRange = !dateRange.start || !dateRange.end || 
        (new Date(slot.startDate) >= new Date(dateRange.start) && 
         new Date(slot.startDate) <= new Date(dateRange.end))

      return matchesSearch && matchesStatus && matchesPriority && matchesPaymentType && matchesDateRange
    })

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'assignedTo') {
        aValue = aValue || 'Unassigned'
        bValue = bValue || 'Unassigned'
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [selectedPool, slotSearchTerm, filterStatus, filterPriority, filterPaymentType, dateRange, sortField, sortDirection])

  const getStatusColor = (status: Slot['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'inactive': return 'bg-gray-500/10 text-gray-600 border-gray-200'
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'expired': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'suspended': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = (status: Slot['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'inactive': return <PauseCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'expired': return <XCircle className="h-3 w-3" />
      case 'suspended': return <Ban className="h-3 w-3" />
      default: return <AlertTriangle className="h-3 w-3" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  // Centered dialog classes for optimal viewing
  const getDialogClasses = (windowState: WindowState) => {
    switch (windowState) {
      case 'maximized':
        return 'w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden rounded-lg'
      case 'normal':
        return 'w-[85vw] min-w-[800px] max-w-[85vw] h-[80vh] max-h-[80vh] overflow-hidden rounded-lg'
      case 'minimized':
        return 'w-80 h-16 max-w-none max-h-none fixed bottom-4 right-4 rounded-lg overflow-hidden'
      default:
        return 'w-[85vw] min-w-[800px] max-w-[85vw] h-[80vh] max-h-[80vh] overflow-hidden rounded-lg'
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSlots(new Set(filteredAndSortedSlots.map(slot => slot.id)))
    } else {
      setSelectedSlots(new Set())
    }
  }

  const handleSelectSlot = (slotId: string, checked: boolean) => {
    const newSelected = new Set(selectedSlots)
    if (checked) {
      newSelected.add(slotId)
    } else {
      newSelected.delete(slotId)
    }
    setSelectedSlots(newSelected)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedSlots.size === 0) {
      toast.error('Please select at least one slot')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setQuotaPools(prev => prev.map(pool => {
        if (pool.id === selectedPool?.id) {
          const updatedSlots = pool.slots.map(slot => {
            if (selectedSlots.has(slot.id)) {
              let newStatus = slot.status
              
              switch (action) {
                case 'activate':
                  newStatus = 'active'
                  break
                case 'deactivate':
                  newStatus = 'inactive'
                  break
                case 'suspend':
                  newStatus = 'suspended'
                  break
                case 'delete':
                  return null
              }
              
              return { ...slot, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            }
            return slot
          }).filter(Boolean) as Slot[]
          
          return { ...pool, slots: updatedSlots }
        }
        return pool
      }))
      
      setSelectedSlots(new Set())
      toast.success(`Bulk ${action} completed successfully`)
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      // Simulate data refresh
      setQuotaPools(prev => prev.map(pool => ({
        ...pool,
        updatedAt: new Date().toISOString().split('T')[0]
      })))
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    if (!selectedPool) return

    const csvContent = [
      ['Slot #', 'Status', 'Assigned To', 'Payment Type', 'Total Amount', 'Paid Amount', 'Remaining', 'Start Date', 'Expiry Date'],
      ...filteredAndSortedSlots.map(slot => [
        slot.number.toString(),
        slot.status,
        slot.assignedTo || 'Unassigned',
        slot.paymentType,
        slot.totalAmount.toString(),
        slot.paidAmount.toString(),
        slot.remainingAmount.toString(),
        slot.startDate,
        slot.expiryDate
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedPool.name}-slots-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Data exported successfully')
  }

  const handleSlotAction = async (poolId: string, slotId: string, action: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setQuotaPools(prev => prev.map(pool => {
        if (pool.id === poolId) {
          const updatedSlots = pool.slots.map(slot => {
            if (slot.id === slotId) {
              let newStatus: Slot['status'] = slot.status
              
              switch (action) {
                case 'activate':
                  newStatus = 'active'
                  break
                case 'deactivate':
                  newStatus = 'inactive'
                  break
                case 'suspend':
                  newStatus = 'suspended'
                  break
                case 'renew':
                  newStatus = 'active'
                  break
              }
              
              return {
                ...slot,
                status: newStatus,
                updatedAt: new Date().toISOString().split('T')[0]
              }
            }
            return slot
          })
          
          return { ...pool, slots: updatedSlots }
        }
        return pool
      }))
      
      toast.success(`Slot ${action}d successfully`)
    } catch (error) {
      toast.error(`Failed to ${action} slot`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlotUpdate = async (updatedSlot: Slot) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setQuotaPools(prev => prev.map(pool => {
        if (pool.id === selectedPool?.id) {
          const updatedSlots = pool.slots.map(slot => 
            slot.id === updatedSlot.id ? updatedSlot : slot
          )
          return { ...pool, slots: updatedSlots }
        }
        return pool
      }))
      
      setShowEditSlot(false)
      setEditingSlot(null)
      setEditSlotState('maximized')
      setInlineEditingSlot(null)
      toast.success('Slot updated successfully')
    } catch (error) {
      toast.error('Failed to update slot')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSlot = async (poolId: string, slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setQuotaPools(prev => prev.map(pool => {
        if (pool.id === poolId) {
          const updatedSlots = pool.slots.filter(slot => slot.id !== slotId)
          return { 
            ...pool, 
            slots: updatedSlots,
            allocatedSlots: pool.allocatedSlots - 1,
            availableSlots: pool.availableSlots + 1
          }
        }
        return pool
      }))
      
      toast.success('Slot deleted successfully')
    } catch (error) {
      toast.error('Failed to delete slot')
    } finally {
      setIsLoading(false)
    }
  }

  const WindowControls = ({ 
    windowState, 
    onMinimize, 
    onMaximize, 
    onClose, 
    title 
  }: {
    windowState: WindowState
    onMinimize: () => void
    onMaximize: () => void
    onClose: () => void
    title: string
  }) => (
    <div className="flex items-center gap-1">
      {windowState === 'minimized' && (
        <span className="text-sm font-medium text-muted-foreground mr-2 truncate flex-1">
          {title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMinimize}
        className="h-6 w-6 hover:bg-yellow-100 hover:text-yellow-700"
        title="Minimize"
      >
        <Minimize2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMaximize}
        className="h-6 w-6 hover:bg-green-100 hover:text-green-700"
        title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
      >
        {windowState === 'maximized' ? <Square className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-6 w-6 hover:bg-red-100 hover:text-red-700"
        title="Close"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium text-xs hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
        )}
        {sortField !== field && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </div>
    </Button>
  )

  const QuickActionMenu = ({ slot }: { slot: Slot }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => { setSelectedSlot(slot); setShowSlotDetails(true) }}>
          <Eye className="h-3 w-3 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setEditingSlot(slot); setShowEditSlot(true) }}>
          <Edit3 className="h-3 w-3 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setInlineEditingSlot(slot.id)}>
          <Edit3 className="h-3 w-3 mr-2" />
          Quick Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {slot.status === 'inactive' && (
          <DropdownMenuItem onClick={() => handleSlotAction(selectedPool!.id, slot.id, 'activate')}>
            <PlayCircle className="h-3 w-3 mr-2" />
            Activate
          </DropdownMenuItem>
        )}
        {slot.status === 'active' && (
          <DropdownMenuItem onClick={() => handleSlotAction(selectedPool!.id, slot.id, 'deactivate')}>
            <PauseCircle className="h-3 w-3 mr-2" />
            Deactivate
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleSlotAction(selectedPool!.id, slot.id, 'suspend')}>
          <Ban className="h-3 w-3 mr-2" />
          Suspend
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(slot.id)}>
          <Copy className="h-3 w-3 mr-2" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDeleteSlot(selectedPool!.id, slot.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-3 w-3 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const AdvancedFilters = () => (
    <AnimatePresence>
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border rounded-lg p-2 bg-muted/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Payment Type</Label>
              <Select value={filterPaymentType} onValueChange={setFilterPaymentType}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="installment">Installment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Start Date From</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="h-7 text-xs"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Start Date To</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="h-7 text-xs"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterPriority('all')
                setFilterPaymentType('all')
                setDateRange({ start: '', end: '' })
              }}
              className="h-7 px-3 text-xs"
            >
              <FilterX className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quota Pools</h1>
          <p className="text-muted-foreground">
            Manage quota pools and their allocated slots
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pool
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search pools by name or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters />

      {/* Quota Pools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPools.map((pool) => (
          <Card key={pool.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pool.name}</CardTitle>
                <Badge variant={pool.status === 'active' ? 'default' : 'secondary'}>
                  {pool.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{pool.projectName}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Total Slots</span>
                  <span className="font-medium">{pool.totalSlots}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Allocated</span>
                  <span className="font-medium">{pool.allocatedSlots}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available</span>
                  <span className="font-medium text-green-600">{pool.availableSlots}</span>
                </div>
                
                <Progress 
                  value={(pool.allocatedSlots / pool.totalSlots) * 100} 
                  className="h-2"
                />
                
                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-muted-foreground">
                    Updated {pool.updatedAt}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedPool(pool)
                      setShowSlotManagement(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPools.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No quota pools found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No pools match your search criteria.' : 'Get started by creating your first quota pool.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          )}
        </div>
      )}

      {/* Create Quota Dialog */}
      <CreateQuotaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projects={projects}
        onCreateQuota={(quotaData) => {
          const newPool: QuotaPool = {
            id: Date.now().toString(),
            name: quotaData.poolName,
            projectName: quotaData.poolName,
            totalSlots: quotaData.totalQuota,
            allocatedSlots: 0,
            availableSlots: quotaData.totalQuota,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            status: 'active',
            slots: []
          }
          setQuotaPools(prev => [...prev, newPool])
          setShowCreateDialog(false)
          toast.success('Quota pool created successfully!')
        }}
      />

      {/* Pool Management Dialog - Full Page Size */}
      <Dialog open={showSlotManagement} onOpenChange={(open) => {
        setShowSlotManagement(open)
        if (!open) {
          setSelectedPool(null)
          setSlotManagementState('maximized')
        }
      }}>
        <DialogContent className={getDialogClasses(slotManagementState)}>
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <DialogTitle className="text-xl">
                Pool Management: {selectedPool?.name}
              </DialogTitle>
              <DialogDescription>
                Manage slots and monitor pool utilization
              </DialogDescription>
            </div>
            <WindowControls
              windowState={slotManagementState}
              onMinimize={() => setSlotManagementState('minimized')}
              onMaximize={() => setSlotManagementState(slotManagementState === 'maximized' ? 'normal' : 'maximized')}
              onClose={() => setShowSlotManagement(false)}
              title={`Pool: ${selectedPool?.name}`}
            />
          </DialogHeader>

          {slotManagementState !== 'minimized' && selectedPool && (
            <div className="flex-1 overflow-hidden">
              {/* Pool Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedPool.totalSlots}</div>
                  <div className="text-sm text-muted-foreground">Total Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedPool.allocatedSlots}</div>
                  <div className="text-sm text-muted-foreground">Allocated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedPool.availableSlots}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((selectedPool.allocatedSlots / selectedPool.totalSlots) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Utilization</div>
                </div>
              </div>

              {/* Slot Management Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search slots by number, assignee, or notes..."
                      value={slotSearchTerm}
                      onChange={(e) => setSlotSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedSlots.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
                  <span className="text-sm font-medium">
                    {selectedSlots.size} slot(s) selected
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                    <PauseCircle className="h-3 w-3 mr-1" />
                    Deactivate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>
                    <Ban className="h-3 w-3 mr-1" />
                    Suspend
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedSlots(new Set())}>
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}

              {/* Slots Table/Grid */}
              <div className="flex-1 overflow-auto">
                {viewMode === 'table' ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedSlots.size === filteredAndSortedSlots.length && filteredAndSortedSlots.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>
                            <SortableHeader field="number">Slot #</SortableHeader>
                          </TableHead>
                          <TableHead>
                            <SortableHeader field="status">Status</SortableHeader>
                          </TableHead>
                          <TableHead>
                            <SortableHeader field="assignedTo">Assigned To</SortableHeader>
                          </TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>
                            <SortableHeader field="totalAmount">Amount</SortableHeader>
                          </TableHead>
                          <TableHead>
                            <SortableHeader field="startDate">Start Date</SortableHeader>
                          </TableHead>
                          <TableHead>
                            <SortableHeader field="expiryDate">Expiry</SortableHeader>
                          </TableHead>
                          <TableHead className="w-12">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedSlots.map((slot) => (
                          <TableRow key={slot.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedSlots.has(slot.id)}
                                onCheckedChange={(checked) => handleSelectSlot(slot.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">#{slot.number}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(slot.status)} flex items-center gap-1 w-fit`}>
                                {getStatusIcon(slot.status)}
                                {slot.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {inlineEditingSlot === slot.id ? (
                                <Input
                                  defaultValue={slot.assignedTo || ''}
                                  className="h-6 text-xs"
                                  onBlur={(e) => {
                                    handleSlotUpdate({ ...slot, assignedTo: e.target.value })
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSlotUpdate({ ...slot, assignedTo: e.currentTarget.value })
                                    }
                                    if (e.key === 'Escape') {
                                      setInlineEditingSlot(null)
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <div
                                  className="cursor-pointer hover:bg-muted rounded px-2 py-1"
                                  onClick={() => setInlineEditingSlot(slot.id)}
                                >
                                  {slot.assignedTo || 'Unassigned'}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {slot.paymentType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">${slot.totalAmount}</div>
                                {slot.paymentType === 'installment' && (
                                  <Progress 
                                    value={(slot.paidAmount / slot.totalAmount) * 100} 
                                    className="h-1"
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{slot.startDate}</TableCell>
                            <TableCell className="text-sm">{slot.expiryDate}</TableCell>
                            <TableCell>
                              <QuickActionMenu slot={slot} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedSlots.map((slot) => (
                      <Card key={slot.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedSlots.has(slot.id)}
                                onCheckedChange={(checked) => handleSelectSlot(slot.id, checked as boolean)}
                              />
                              <span className="font-medium">Slot #{slot.number}</span>
                            </div>
                            <QuickActionMenu slot={slot} />
                          </div>
                          <Badge className={`${getStatusColor(slot.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(slot.status)}
                            {slot.status}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Assigned to:</span> {slot.assignedTo || 'Unassigned'}
                            </div>
                            <div>
                              <span className="font-medium">Payment:</span> {slot.paymentType}
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span> ${slot.totalAmount}
                            </div>
                            {slot.paymentType === 'installment' && (
                              <div>
                                <Progress 
                                  value={(slot.paidAmount / slot.totalAmount) * 100} 
                                  className="h-2"
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                  ${slot.paidAmount} / ${slot.totalAmount} paid
                                </div>
                              </div>
                            )}
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{slot.startDate}</span>
                              <span>{slot.expiryDate}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredAndSortedSlots.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No slots found</h3>
                    <p className="text-muted-foreground">
                      {slotSearchTerm || filterStatus !== 'all' 
                        ? 'No slots match your current filters.' 
                        : 'This pool has no slots yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Slot Details Dialog - Full Page Size */}
      <Dialog open={showSlotDetails} onOpenChange={(open) => {
        setShowSlotDetails(open)
        if (!open) {
          setSelectedSlot(null)
          setSlotDetailsState('maximized')
        }
      }}>
        <DialogContent className={getDialogClasses(slotDetailsState)}>
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <DialogTitle className="text-xl">
                Slot #{selectedSlot?.number} Details
              </DialogTitle>
              <DialogDescription>
                Comprehensive slot information and payment history
              </DialogDescription>
            </div>
            <WindowControls
              windowState={slotDetailsState}
              onMinimize={() => setSlotDetailsState('minimized')}
              onMaximize={() => setSlotDetailsState(slotDetailsState === 'maximized' ? 'normal' : 'maximized')}
              onClose={() => setShowSlotDetails(false)}
              title={`Slot #${selectedSlot?.number}`}
            />
          </DialogHeader>

          {slotDetailsState !== 'minimized' && selectedSlot && (
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slot Number</Label>
                      <div className="text-sm font-medium">#{selectedSlot.number}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Badge className={`${getStatusColor(selectedSlot.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(selectedSlot.status)}
                        {selectedSlot.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label>Assigned To</Label>
                      <div className="text-sm">{selectedSlot.assignedTo || 'Unassigned'}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      {selectedSlot.priority && (
                        <Badge className={`${getPriorityColor(selectedSlot.priority)} w-fit`}>
                          {selectedSlot.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <Badge variant="outline">{selectedSlot.paymentType}</Badge>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Amount</Label>
                      <div className="text-lg font-semibold">${selectedSlot.totalAmount}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Paid Amount</Label>
                      <div className="text-lg font-semibold text-green-600">${selectedSlot.paidAmount}</div>
                    </div>
                  </div>
                  
                  {selectedSlot.paymentType === 'installment' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Payment Progress</span>
                        <span>{Math.round((selectedSlot.paidAmount / selectedSlot.totalAmount) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(selectedSlot.paidAmount / selectedSlot.totalAmount) * 100} 
                        className="h-3"
                      />
                      <div className="text-sm text-muted-foreground mt-2">
                        Remaining: ${selectedSlot.remainingAmount}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Date Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Date Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <div className="text-sm">{selectedSlot.startDate}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <div className="text-sm">{selectedSlot.expiryDate}</div>
                    </div>
                    {selectedSlot.lastPaymentDate && (
                      <div className="space-y-2">
                        <Label>Last Payment</Label>
                        <div className="text-sm">{selectedSlot.lastPaymentDate}</div>
                      </div>
                    )}
                    {selectedSlot.nextPaymentDate && (
                      <div className="space-y-2">
                        <Label>Next Payment Due</Label>
                        <div className="text-sm">{selectedSlot.nextPaymentDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Payment History */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment History</h3>
                  {selectedSlot.paymentHistory.length > 0 ? (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Receipt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedSlot.paymentHistory.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.date}</TableCell>
                              <TableCell className="font-medium">${payment.amount}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{payment.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    payment.status === 'completed' 
                                      ? 'bg-green-500/10 text-green-700 border-green-200'
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                                      : 'bg-red-500/10 text-red-700 border-red-200'
                                  }
                                >
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {payment.receiptUrl ? (
                                  <Button size="sm" variant="outline">
                                    <Receipt className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg bg-muted/30">
                      <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No payment history available</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedSlot.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notes</h3>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm">{selectedSlot.notes}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Tags */}
                {selectedSlot.tags && selectedSlot.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSlot.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog - Full Page Size */}
      <Dialog open={showEditSlot} onOpenChange={(open) => {
        setShowEditSlot(open)
        if (!open) {
          setEditingSlot(null)
          setEditSlotState('maximized')
        }
      }}>
        <DialogContent className={getDialogClasses(editSlotState)}>
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <DialogTitle className="text-xl">
                Edit Slot #{editingSlot?.number}
              </DialogTitle>
              <DialogDescription>
                Update slot information and settings
              </DialogDescription>
            </div>
            <WindowControls
              windowState={editSlotState}
              onMinimize={() => setEditSlotState('minimized')}
              onMaximize={() => setEditSlotState(editSlotState === 'maximized' ? 'normal' : 'maximized')}
              onClose={() => setShowEditSlot(false)}
              title={`Edit Slot #${editingSlot?.number}`}
            />
          </DialogHeader>

          {editSlotState !== 'minimized' && editingSlot && (
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      defaultValue={editingSlot.assignedTo || ''}
                      placeholder="Enter assignee name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue={editingSlot.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select defaultValue={editingSlot.priority || 'medium'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select defaultValue={editingSlot.paymentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Payment</SelectItem>
                        <SelectItem value="installment">Installment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Amount</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      defaultValue={editingSlot.totalAmount}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Paid Amount</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      defaultValue={editingSlot.paidAmount}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      defaultValue={editingSlot.startDate}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      defaultValue={editingSlot.expiryDate}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    defaultValue={editingSlot.notes || ''}
                    placeholder="Enter any additional notes..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEditSlot(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSlotUpdate(editingSlot)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Select All Slots</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+A</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Edit Selected Slot</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+E</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Toggle Filters</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+F</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Refresh Data</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+R</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Clear Selection</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+?</kbd>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}