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
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { 
  Search, 
  RefreshCw,
  Download,
  DollarSign,
  Loader2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Eye,
  CreditCard,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Building2,
  Calendar,
  FileText,
  Banknote,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  BarChart3,
  PieChart,
  Filter,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Send,
  Phone,
  Mail,
  MapPin,
  Globe,
  Shield,
  Award,
  Star,
  Flag,
  Home,
  Settings,
  MoreHorizontal,
  Package,
  CircleDollarSign
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Payment {
  id: string
  candidateId: string
  candidateName: string
  email: string
  phone: string
  nationality: string
  position: string
  depositAmount: number
  walletBalance: number
  reservedAmount: number
  paidAmount: number
  remainingBalance: number
  collectionStatus: 'wallet-balance' | 'reserved-for-collection' | 'paid' | 'balance'
  paymentMethod: 'bank-transfer' | 'cash' | 'card' | 'cheque'
  transactionRef?: string
  dueDate: string
  paidDate?: string
  collectedBy?: string
  avatar?: string
  notes?: string
  paymentHistory: PaymentRecord[]
  createdAt: string
  updatedAt: string
}

interface PaymentRecord {
  id: string
  amount: number
  method: string
  transactionRef?: string
  date: string
  collectedBy: string
  notes?: string
}

interface PaymentForm {
  amount: string
  method: string
  transactionRef: string
  notes: string
}

type SortField = 'candidateName' | 'nationality' | 'depositAmount' | 'paidAmount' | 'dueDate' | 'collectionStatus'
type SortDirection = 'asc' | 'desc'

// Fixed deposit rates by nationality
const DEPOSIT_RATES = {
  'Bangladeshi': 15000,
  'Indian': 18000,
  'Pakistani': 16000,
  'Sri Lankan': 20000,
  'Nepalese': 14000,
  'Filipino': 22000,
  'Indonesian': 17000,
  'Vietnamese': 19000,
  'Thai': 21000,
  'Other': 18000
}

// Collection Status Configuration - 4 statuses
const collectionStatusConfig = {
  'wallet-balance': {
    label: 'Wallet Balance',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Wallet,
    description: 'Funds available in company wallet for collection'
  },
  'reserved-for-collection': {
    label: 'Reserved for Collection',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: Package,
    description: 'Amount reserved and awaiting collection processing'
  },
  'paid': {
    label: 'Paid',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle,
    description: 'Collection payment completed successfully'
  },
  'balance': {
    label: 'Balance',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: CircleDollarSign,
    description: 'Remaining balance after partial payment'
  }
}

// Comprehensive dummy data with new 4-status system
const mockPayments: Payment[] = [
  {
    id: '1',
    candidateId: 'CAND001',
    candidateName: 'Mohammad Rahman',
    email: 'mohammad.rahman@email.com',
    phone: '+880 171 234567',
    nationality: 'Bangladeshi',
    position: 'Construction Worker',
    depositAmount: 15000,
    walletBalance: 0,
    reservedAmount: 0,
    paidAmount: 15000,
    remainingBalance: 0,
    collectionStatus: 'paid',
    paymentMethod: 'bank-transfer',
    transactionRef: 'BT2024001',
    dueDate: '2024-01-15',
    paidDate: '2024-01-10',
    collectedBy: 'Ahmed Hassan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    notes: 'Payment completed via bank transfer. Documentation verified.',
    paymentHistory: [
      {
        id: 'PAY001',
        amount: 15000,
        method: 'bank-transfer',
        transactionRef: 'BT2024001',
        date: '2024-01-10',
        collectedBy: 'Ahmed Hassan',
        notes: 'Full payment received'
      }
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    candidateId: 'CAND002',
    candidateName: 'Raj Kumar Patel',
    email: 'raj.patel@email.com',
    phone: '+91 98765 43210',
    nationality: 'Indian',
    position: 'Site Engineer',
    depositAmount: 18000,
    walletBalance: 8000,
    reservedAmount: 0,
    paidAmount: 10000,
    remainingBalance: 8000,
    collectionStatus: 'balance',
    paymentMethod: 'cash',
    transactionRef: 'CSH2024002',
    dueDate: '2024-02-01',
    paidDate: '2024-01-20',
    collectedBy: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    notes: 'Partial payment received. Balance available in wallet.',
    paymentHistory: [
      {
        id: 'PAY002',
        amount: 10000,
        method: 'cash',
        transactionRef: 'CSH2024002',
        date: '2024-01-20',
        collectedBy: 'Sarah Johnson',
        notes: 'First installment payment'
      }
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    candidateId: 'CAND003',
    candidateName: 'Ali Hassan Khan',
    email: 'ali.khan@email.com',
    phone: '+92 300 1234567',
    nationality: 'Pakistani',
    position: 'Electrician',
    depositAmount: 16000,
    walletBalance: 16000,
    reservedAmount: 0,
    paidAmount: 0,
    remainingBalance: 16000,
    collectionStatus: 'wallet-balance',
    paymentMethod: 'bank-transfer',
    dueDate: '2024-01-30',
    collectedBy: 'Kumar Patel',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    notes: 'Funds available in wallet. Collection pending.',
    paymentHistory: [],
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25'
  },
  {
    id: '4',
    candidateId: 'CAND004',
    candidateName: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+94 77 123 4567',
    nationality: 'Sri Lankan',
    position: 'HR Assistant',
    depositAmount: 20000,
    walletBalance: 5000,
    reservedAmount: 20000,
    paidAmount: 0,
    remainingBalance: 20000,
    collectionStatus: 'reserved-for-collection',
    paymentMethod: 'card',
    transactionRef: 'CD2024003',
    dueDate: '2024-01-20',
    collectedBy: 'Aisha Mohamed',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
    notes: 'Amount reserved for collection processing. Awaiting final payment.',
    paymentHistory: [],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-18'
  },
  {
    id: '5',
    candidateId: 'CAND005',
    candidateName: 'Ram Bahadur Thapa',
    email: 'ram.thapa@email.com',
    phone: '+977 98 1234 5678',
    nationality: 'Nepalese',
    position: 'Security Guard',
    depositAmount: 14000,
    walletBalance: 14000,
    reservedAmount: 0,
    paidAmount: 0,
    remainingBalance: 14000,
    collectionStatus: 'wallet-balance',
    paymentMethod: 'cash',
    transactionRef: 'CSH2024004',
    dueDate: '2024-02-05',
    collectedBy: 'Ali Nasheed',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    notes: 'Wallet balance available. Ready for collection processing.',
    paymentHistory: [],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-28'
  },
  {
    id: '6',
    candidateId: 'CAND006',
    candidateName: 'Jose Maria Santos',
    email: 'jose.santos@email.com',
    phone: '+63 917 123 4567',
    nationality: 'Filipino',
    position: 'Foreman',
    depositAmount: 22000,
    walletBalance: 2000,
    reservedAmount: 0,
    paidAmount: 20000,
    remainingBalance: 2000,
    collectionStatus: 'balance',
    paymentMethod: 'bank-transfer',
    dueDate: '2024-01-10',
    paidDate: '2024-01-15',
    collectedBy: 'Ahmed Hassan',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    notes: 'Majority payment completed. Small balance remaining.',
    paymentHistory: [
      {
        id: 'PAY006',
        amount: 20000,
        method: 'bank-transfer',
        transactionRef: 'BT2024006',
        date: '2024-01-15',
        collectedBy: 'Ahmed Hassan',
        notes: 'Major payment installment'
      }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  }
]

export function Collection() {
  // Core state
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  
  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('dueDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    amount: '',
    method: 'bank-transfer',
    transactionRef: '',
    notes: ''
  })

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCandidates = payments.length
    const totalDepositAmount = payments.reduce((sum, p) => sum + p.depositAmount, 0)
    const totalWalletBalance = payments.reduce((sum, p) => sum + p.walletBalance, 0)
    const totalReserved = payments.reduce((sum, p) => sum + p.reservedAmount, 0)
    const totalCollected = payments.reduce((sum, p) => sum + p.paidAmount, 0)
    const totalBalance = payments.reduce((sum, p) => sum + p.remainingBalance, 0)
    
    const walletBalanceCount = payments.filter(p => p.collectionStatus === 'wallet-balance').length
    const reservedCount = payments.filter(p => p.collectionStatus === 'reserved-for-collection').length
    const paidCount = payments.filter(p => p.collectionStatus === 'paid').length
    const balanceCount = payments.filter(p => p.collectionStatus === 'balance').length
    
    const collectionRate = totalDepositAmount > 0 ? (totalCollected / totalDepositAmount) * 100 : 0
    
    return {
      totalCandidates,
      totalDepositAmount,
      totalWalletBalance,
      totalReserved,
      totalCollected,
      totalBalance,
      walletBalanceCount,
      reservedCount,
      paidCount,
      balanceCount,
      collectionRate
    }
  }, [payments])

  // Get unique values for filters
  const uniqueNationalities = useMemo(() => {
    const nationalities = [...new Set(payments.map(p => p.nationality))]
    return nationalities.sort()
  }, [payments])

  // Filtering and sorting logic
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      const matchesSearch = payment.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.position.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesNationality = nationalityFilter === 'all' || payment.nationality === nationalityFilter
      const matchesStatus = statusFilter === 'all' || payment.collectionStatus === statusFilter
      
      return matchesSearch && matchesNationality && matchesStatus
    })

    // Sort payments
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'dueDate') {
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
  }, [payments, searchQuery, nationalityFilter, statusFilter, sortField, sortDirection])

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

  // Get status badge
  const getStatusBadge = (status: Payment['collectionStatus']) => {
    const config = collectionStatusConfig[status]
    if (!config) return null
    
    const IconComponent = config.icon
    
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-current`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank-transfer': return <Banknote className="h-4 w-4" />
      case 'cash': return <Wallet className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'cheque': return <FileText className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `MVR ${amount.toLocaleString()}`
  }

  const handleAddPayment = useCallback(async () => {
    if (!selectedPayment || !paymentForm.amount) {
      toast.error('Please enter a valid payment amount')
      return
    }

    const amount = parseFloat(paymentForm.amount)
    if (amount <= 0 || amount > selectedPayment.remainingBalance) {
      toast.error('Invalid payment amount')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newPaymentRecord: PaymentRecord = {
        id: `PAY${Date.now()}`,
        amount,
        method: paymentForm.method,
        transactionRef: paymentForm.transactionRef,
        date: new Date().toISOString().split('T')[0],
        collectedBy: 'Current User',
        notes: paymentForm.notes
      }

      const updatedPayment: Payment = {
        ...selectedPayment,
        paidAmount: selectedPayment.paidAmount + amount,
        remainingBalance: selectedPayment.remainingBalance - amount,
        collectionStatus: selectedPayment.remainingBalance - amount === 0 ? 'paid' : 'balance',
        paymentMethod: paymentForm.method as Payment['paymentMethod'],
        transactionRef: paymentForm.transactionRef || selectedPayment.transactionRef,
        paidDate: new Date().toISOString().split('T')[0],
        collectedBy: 'Current User',
        paymentHistory: [...selectedPayment.paymentHistory, newPaymentRecord],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      setPayments(prev => prev.map(p => p.id === selectedPayment.id ? updatedPayment : p))
      setSelectedPayment(updatedPayment)
      setShowPaymentDialog(false)
      setPaymentForm({
        amount: '',
        method: 'bank-transfer',
        transactionRef: '',
        notes: ''
      })
      
      toast.success(`Payment of ${formatCurrency(amount)} recorded successfully`)

    } catch (error) {
      toast.error('Failed to record payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedPayment, paymentForm])

  // Handle status update
  const handleStatusUpdate = (recordId: string, newStatus: string) => {
    setPayments(prev => prev.map(record => {
      if (record.id === recordId) {
        const updatedRecord = { 
          ...record, 
          collectionStatus: newStatus as Payment['collectionStatus'],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        
        // Update financial values based on status
        switch (newStatus) {
          case 'reserved-for-collection':
            updatedRecord.reservedAmount = record.depositAmount
            updatedRecord.walletBalance = Math.max(0, record.walletBalance - record.depositAmount)
            break
          case 'paid':
            updatedRecord.paidAmount = record.depositAmount
            updatedRecord.remainingBalance = 0
            updatedRecord.reservedAmount = 0
            updatedRecord.paidDate = new Date().toISOString().split('T')[0]
            break
          case 'wallet-balance':
            updatedRecord.walletBalance = record.depositAmount
            updatedRecord.reservedAmount = 0
            break
        }
        
        return updatedRecord
      }
      return record
    }))
    
    const config = collectionStatusConfig[newStatus as keyof typeof collectionStatusConfig]
    toast.success(`Collection status updated to ${config.label}`)
  }

  const handleSendReminder = useCallback(async (payment: Payment) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Payment reminder sent to ${payment.candidateName}`)
    } catch (error) {
      toast.error('Failed to send reminder')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Work Permit Deposit Collection
          </h1>
          <p className="text-muted-foreground">
            Track and manage work permit deposit collections • {filteredAndSortedPayments.length} record{filteredAndSortedPayments.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Collection
          </Button>
        </div>
      </div>

      {/* Summary Statistics - 4 Collection Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.walletBalanceCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summaryStats.totalWalletBalance)} available
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved for Collection</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.reservedCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summaryStats.totalReserved)} reserved
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.paidCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summaryStats.totalCollected)} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.balanceCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summaryStats.totalBalance)} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(summaryStats.totalDepositAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Total Deposits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summaryStats.totalWalletBalance)}
              </div>
              <div className="text-sm text-muted-foreground">Wallet Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summaryStats.totalReserved)}
              </div>
              <div className="text-sm text-muted-foreground">Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summaryStats.totalCollected)}
              </div>
              <div className="text-sm text-muted-foreground">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summaryStats.totalBalance)}
              </div>
              <div className="text-sm text-muted-foreground">Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Collection Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{summaryStats.collectionRate.toFixed(1)}%</span>
            </div>
            <Progress value={summaryStats.collectionRate} className="h-3" />
            
            <div className="grid gap-3 md:grid-cols-4 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{summaryStats.walletBalanceCount}</div>
                <div className="text-sm text-blue-600">Wallet Balance</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{summaryStats.reservedCount}</div>
                <div className="text-sm text-orange-600">Reserved</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{summaryStats.paidCount}</div>
                <div className="text-sm text-green-600">Paid</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{summaryStats.balanceCount}</div>
                <div className="text-sm text-purple-600">Balance</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates, transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nationalities</SelectItem>
                {uniqueNationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Collection Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="wallet-balance">Wallet Balance</SelectItem>
                <SelectItem value="reserved-for-collection">Reserved for Collection</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Collection Records Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Collection Status</TableHead>
                <TableHead>Financial Summary</TableHead>
                <TableHead>Deposit Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={payment.avatar} alt={payment.candidateName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {payment.candidateName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{payment.candidateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.nationality} • {payment.position}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.collectionStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Wallet:</span> {formatCurrency(payment.walletBalance)}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Paid:</span> {formatCurrency(payment.paidAmount)}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Balance:</span> {formatCurrency(payment.remainingBalance)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatCurrency(payment.depositAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        {payment.paymentMethod.replace('-', ' ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.collectionStatus !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setShowPaymentDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collection Details - {selectedPayment?.candidateName}</DialogTitle>
            <DialogDescription>
              Complete collection and payment information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Status and Collection Info */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedPayment.collectionStatus)}
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Collection Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Deposit Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.depositAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wallet Balance:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(selectedPayment.walletBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserved Amount:</span>
                      <span className="font-medium text-orange-600">{formatCurrency(selectedPayment.reservedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Amount:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedPayment.paidAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Remaining Balance:</span>
                      <span className="text-purple-600">{formatCurrency(selectedPayment.remainingBalance)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Candidate Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {selectedPayment.email}</div>
                    <div><strong>Phone:</strong> {selectedPayment.phone}</div>
                    <div><strong>Nationality:</strong> {selectedPayment.nationality}</div>
                    <div><strong>Position:</strong> {selectedPayment.position}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              {selectedPayment.paymentHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPayment.paymentHistory.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{formatCurrency(record.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.method} • {record.date}
                            </div>
                            {record.notes && (
                              <div className="text-sm text-muted-foreground">{record.notes}</div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            by {record.collectedBy}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Add a payment for {selectedPayment?.candidateName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (MVR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                max={selectedPayment?.remainingBalance}
              />
              {selectedPayment && (
                <div className="text-sm text-muted-foreground">
                  Remaining balance: {formatCurrency(selectedPayment.remainingBalance)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select 
                value={paymentForm.method} 
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionRef">Transaction Reference</Label>
              <Input
                id="transactionRef"
                placeholder="Enter transaction reference"
                value={paymentForm.transactionRef}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionRef: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment} disabled={isLoading || !paymentForm.amount}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}