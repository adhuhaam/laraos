"use client"

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Checkbox } from './ui/checkbox'
import { 
  CreditCard, DollarSign, TrendingUp, TrendingDown, Plus, 
  Receipt, FileText, Calendar, User, Building2, Download,
  RefreshCw, Send, Eye, Filter, Search, AlertCircle,
  CheckCircle, Clock, Wallet, ArrowUpRight, ArrowDownRight,
  Banknote, Calculator, FileUp, Mail, Users, Hash,
  PieChart, BarChart3, Activity, Target, Plane, Shield,
  Printer, FileSpreadsheet, Calendar as CalendarIcon,
  Settings, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface CardBalance {
  current: number
  available: number
  pending: number
  lastUpdated: string
}

interface Transaction {
  id: string
  date: string
  description: string
  category: 'work-permit' | 'quota-fees'
  amount: number
  type: 'debit' | 'credit'
  employeeId?: string
  employeeName?: string
  referenceNumber: string
  status: 'completed' | 'pending' | 'failed'
}

interface ReimbursementRequest {
  id: string
  requestDate: string
  requestedBy: string
  amount: number
  category: string
  description: string
  attachments: string[]
  status: 'pending' | 'approved' | 'rejected' | 'processing'
  approvedBy?: string
  approvedDate?: string
  transactions: string[]
}

interface ReportConfig {
  title: string
  dateRange: 'this-week' | 'this-month' | 'last-month' | 'custom'
  startDate?: string
  endDate?: string
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'processing'
  includeTransactionDetails: boolean
  includeAttachments: boolean
  reportType: 'summary' | 'detailed' | 'financial'
}

export function PrepaidCardManagement() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isReimbursementDialogOpen, setIsReimbursementDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: 'Reimbursement Report',
    dateRange: 'this-month',
    status: 'all',
    includeTransactionDetails: true,
    includeAttachments: false,
    reportType: 'detailed'
  })

  const printRef = useRef<HTMLDivElement>(null)

  // Mock card balance data
  const cardBalance: CardBalance = {
    current: 18720.50,
    available: 17620.50,
    pending: 1100.00,
    lastUpdated: '2024-12-16 10:30 AM'
  }

  // Mock transactions data - Only Work Permits and Quota Fees
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      date: '2024-12-15',
      description: 'Work Permit Application Fee - Ahmed Hassan',
      category: 'work-permit',
      amount: 1500.00,
      type: 'debit',
      employeeId: 'EMP001',
      employeeName: 'Ahmed Hassan',
      referenceNumber: 'WP2024001',
      status: 'completed'
    },
    {
      id: 'TXN002',
      date: '2024-12-14',
      description: 'Quota Slot Fee - Construction Project Alpha',
      category: 'quota-fees',
      amount: 2500.00,
      type: 'debit',
      employeeId: 'EMP002',
      employeeName: 'Mohammad Ali',
      referenceNumber: 'QS2024015',
      status: 'completed'
    },
    {
      id: 'TXN003',
      date: '2024-12-13',
      description: 'Work Permit Processing Fee - Rajesh Kumar',
      category: 'work-permit',
      amount: 850.00,
      type: 'debit',
      employeeId: 'EMP003',
      employeeName: 'Rajesh Kumar',
      referenceNumber: 'WP2024002',
      status: 'completed'
    },
    {
      id: 'TXN004',
      date: '2024-12-12',
      description: 'Card Top-up for Work Permits & Quota Fees',
      category: 'quota-fees',
      amount: 15000.00,
      type: 'credit',
      referenceNumber: 'TOP2024005',
      status: 'completed'
    },
    {
      id: 'TXN005',
      date: '2024-12-11',
      description: 'Quota Slot Fee - Engineering Department',
      category: 'quota-fees',
      amount: 3200.00,
      type: 'debit',
      employeeId: 'EMP004',
      employeeName: 'John Smith',
      referenceNumber: 'QS2024016',
      status: 'pending'
    },
    {
      id: 'TXN006',
      date: '2024-12-10',
      description: 'Work Permit Renewal Fee - David Wilson',
      category: 'work-permit',
      amount: 1200.00,
      type: 'debit',
      employeeId: 'EMP005',
      employeeName: 'David Wilson',
      referenceNumber: 'WP2024003',
      status: 'completed'
    }
  ])

  // Mock reimbursement requests
  const [reimbursementRequests] = useState<ReimbursementRequest[]>([
    {
      id: 'REQ001',
      requestDate: '2024-12-15',
      requestedBy: 'HR Manager',
      amount: 8750.00,
      category: 'Work Permits & Quota Fees',
      description: 'Reimbursement for work permit applications and quota fees for December batch',
      attachments: ['receipts_december.pdf', 'transaction_summary.xlsx'],
      status: 'approved',
      approvedBy: 'Finance Manager',
      approvedDate: '2024-12-16',
      transactions: ['TXN001', 'TXN002', 'TXN003']
    },
    {
      id: 'REQ002',
      requestDate: '2024-12-10',
      requestedBy: 'HR Assistant',
      amount: 4400.00,
      category: 'Quota Fees',
      description: 'Quota slot fees for new employee assignments',
      attachments: ['quota_receipts.pdf'],
      status: 'pending',
      transactions: ['TXN005']
    },
    {
      id: 'REQ003',
      requestDate: '2024-12-08',
      requestedBy: 'HR Coordinator',
      amount: 2350.00,
      category: 'Work Permits',
      description: 'Work permit processing and renewal fees',
      attachments: ['permit_receipts.pdf', 'renewal_docs.pdf'],
      status: 'processing',
      transactions: ['TXN006']
    }
  ])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work-permit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'quota-fees':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'work-permit': return 'Work Permit'
      case 'quota-fees': return 'Quota Fees'
      default: return category
    }
  }

  const handleReimbursementSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsReimbursementDialogOpen(false)
      toast.success('Reimbursement request submitted successfully')
    } catch (error) {
      toast.error('Failed to submit reimbursement request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsReportDialogOpen(false)
      toast.success('Report generated successfully')
      
      // Trigger print after a short delay
      setTimeout(() => {
        handlePrintReport()
      }, 500)
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && printRef.current) {
      const reportContent = generateReportHTML()
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const generateReportHTML = () => {
    const filteredRequests = reimbursementRequests.filter(request => {
      if (reportConfig.status !== 'all' && request.status !== reportConfig.status) return false
      // Add date filtering logic here based on reportConfig.dateRange
      return true
    })

    const totalAmount = filteredRequests.reduce((sum, req) => sum + req.amount, 0)
    const approvedAmount = filteredRequests
      .filter(req => req.status === 'approved')
      .reduce((sum, req) => sum + req.amount, 0)

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportConfig.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #1f2937;
            background: white;
          }
          
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
          }
          
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          
          .company-logo {
            font-size: 24pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 10px;
          }
          
          .report-title {
            font-size: 18pt;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .report-subtitle {
            font-size: 12pt;
            color: #6b7280;
            margin-bottom: 10px;
          }
          
          .report-meta {
            display: flex;
            justify-content: space-between;
            font-size: 10pt;
            color: #6b7280;
          }
          
          .summary-section {
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #1e40af;
          }
          
          .summary-title {
            font-size: 14pt;
            font-weight: 600;
            margin-bottom: 15px;
            color: #1f2937;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .summary-item {
            text-align: center;
          }
          
          .summary-value {
            font-size: 16pt;
            font-weight: 700;
            color: #1e40af;
          }
          
          .summary-label {
            font-size: 10pt;
            color: #6b7280;
            margin-top: 5px;
          }
          
          .requests-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            font-size: 10pt;
          }
          
          .requests-table th {
            background: #f3f4f6;
            color: #374151;
            font-weight: 600;
            padding: 12px 8px;
            text-align: left;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .requests-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
          }
          
          .requests-table tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9pt;
            font-weight: 500;
            text-transform: uppercase;
          }
          
          .status-approved { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-processing { background: #dbeafe; color: #1e40af; }
          .status-rejected { background: #fee2e2; color: #dc2626; }
          
          .amount {
            font-weight: 600;
            text-align: right;
          }
          
          .transaction-details {
            margin-top: 20px;
            font-size: 9pt;
          }
          
          .transaction-list {
            background: #f8fafc;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
          }
          
          .report-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 9pt;
            color: #6b7280;
            text-align: center;
          }
          
          @media print {
            .report-container { padding: 10mm; max-width: none; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <div class="company-logo">HR Operations System</div>
            <div class="report-title">${reportConfig.title}</div>
            <div class="report-subtitle">Prepaid Card Reimbursement Report</div>
            <div class="report-meta">
              <span>Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>Period: ${reportConfig.dateRange.charAt(0).toUpperCase() + reportConfig.dateRange.slice(1).replace('-', ' ')}</span>
              <span>Status Filter: ${reportConfig.status === 'all' ? 'All Statuses' : reportConfig.status.charAt(0).toUpperCase() + reportConfig.status.slice(1)}</span>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="summary-title">Executive Summary</div>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value">${filteredRequests.length}</div>
                <div class="summary-label">Total Requests</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">MVR ${totalAmount.toLocaleString()}</div>
                <div class="summary-label">Total Amount</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">MVR ${approvedAmount.toLocaleString()}</div>
                <div class="summary-label">Approved Amount</div>
              </div>
            </div>
          </div>
          
          <table class="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Date</th>
                <th>Requested By</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                ${reportConfig.includeTransactionDetails ? '<th>Transactions</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredRequests.map(request => `
                <tr>
                  <td>${request.id}</td>
                  <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                  <td>${request.requestedBy}</td>
                  <td>${request.category}</td>
                  <td class="amount">MVR ${request.amount.toLocaleString()}</td>
                  <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                  ${reportConfig.includeTransactionDetails ? `<td>${request.transactions.length} transactions</td>` : ''}
                </tr>
                ${reportConfig.reportType === 'detailed' ? `
                  <tr>
                    <td colspan="${reportConfig.includeTransactionDetails ? '7' : '6'}" style="padding-left: 20px; font-size: 9pt; color: #6b7280;">
                      <strong>Description:</strong> ${request.description}
                      ${request.approvedBy ? `<br><strong>Approved by:</strong> ${request.approvedBy} on ${new Date(request.approvedDate || '').toLocaleDateString()}` : ''}
                      ${reportConfig.includeAttachments && request.attachments.length > 0 ? `<br><strong>Attachments:</strong> ${request.attachments.join(', ')}` : ''}
                    </td>
                  </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
          
          <div class="report-footer">
            <p>This report was generated by the HR Operations System - Prepaid Card Management Module</p>
            <p>For questions regarding this report, please contact the HR Department</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const totalDebits = transactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalCredits = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const workPermitExpenses = transactions
    .filter(t => t.category === 'work-permit' && t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const quotaFeesExpenses = transactions
    .filter(t => t.category === 'quota-fees' && t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyBudget = 25000.00
  const usedBudget = totalDebits
  const budgetRemaining = monthlyBudget - usedBudget

  return (
    <div className="space-y-6">
      {/* Hidden Print Content */}
      <div ref={printRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prepaid Card Management</h1>
          <p className="text-muted-foreground">
            Manage HR prepaid card for work permits and quota fees only
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isReimbursementDialogOpen} onOpenChange={setIsReimbursementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileUp className="h-4 w-4 mr-2" />
                Request Reimbursement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Reimbursement Request</DialogTitle>
                <DialogDescription>
                  Request reimbursement for work permit and quota fee expenses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (MVR)</Label>
                    <Input id="amount" placeholder="0.00" type="number" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work-permits">Work Permits</SelectItem>
                        <SelectItem value="quota-fees">Quota Fees</SelectItem>
                        <SelectItem value="mixed">Work Permits & Quota Fees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Provide details about the work permit or quota fee expenses requiring reimbursement..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="attachments">Supporting Documents</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input id="attachments" type="file" multiple accept=".pdf,.xlsx,.jpg,.png" />
                    <Button type="button" variant="outline" size="sm">
                      <FileUp className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload work permit receipts, quota fee documentation, or transaction summaries
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReimbursementDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReimbursementSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Balance
          </Button>
        </div>
      </div>

      {/* Card Balance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MVR {cardBalance.current.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {cardBalance.lastUpdated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">MVR {cardBalance.available.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Ready for permits & fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Charges</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">MVR {cardBalance.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Processing transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MVR {budgetRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Remaining: {Math.round((budgetRemaining / monthlyBudget) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Budget Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Monthly Budget Usage - Work Permits & Quota Fees
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Current month spending breakdown by category
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Budget: MVR {monthlyBudget.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">Used: {Math.round((usedBudget / monthlyBudget) * 100)}%</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(usedBudget / monthlyBudget) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span>Work Permits</span>
                    </div>
                    <span className="font-medium">MVR {workPermitExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Quota Fees</span>
                    </div>
                    <span className="font-medium">MVR {quotaFeesExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'debit' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {transaction.type === 'debit' ? (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date} • {transaction.referenceNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'debit' ? '-' : '+'}MVR {transaction.amount.toLocaleString()}
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="work-permit">Work Permit</SelectItem>
                    <SelectItem value="quota-fees">Quota Fees</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'debit' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {transaction.type === 'debit' ? (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date} • {transaction.referenceNumber}
                          {transaction.employeeName && ` • ${transaction.employeeName}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={getCategoryColor(transaction.category)}>
                        {getCategoryLabel(transaction.category)}
                      </Badge>
                      
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'debit' ? '-' : '+'}MVR {transaction.amount.toLocaleString()}
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reimbursements Tab */}
        <TabsContent value="reimbursements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Reimbursement Requests
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track and manage reimbursement requests for work permit and quota fee expenses
                  </p>
                </div>
                
                {/* Report Generation Button */}
                <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Create Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Generate Reimbursement Report</DialogTitle>
                      <DialogDescription>
                        Configure and generate a comprehensive reimbursement report for printing or export
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="report-title">Report Title</Label>
                          <Input 
                            id="report-title"
                            value={reportConfig.title}
                            onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter report title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="report-type">Report Type</Label>
                          <Select 
                            value={reportConfig.reportType} 
                            onValueChange={(value: 'summary' | 'detailed' | 'financial') => 
                              setReportConfig(prev => ({ ...prev, reportType: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="summary">Summary Report</SelectItem>
                              <SelectItem value="detailed">Detailed Report</SelectItem>
                              <SelectItem value="financial">Financial Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date-range">Date Range</Label>
                          <Select 
                            value={reportConfig.dateRange} 
                            onValueChange={(value: 'this-week' | 'this-month' | 'last-month' | 'custom') => 
                              setReportConfig(prev => ({ ...prev, dateRange: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="this-week">This Week</SelectItem>
                              <SelectItem value="this-month">This Month</SelectItem>
                              <SelectItem value="last-month">Last Month</SelectItem>
                              <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status-filter">Status Filter</Label>
                          <Select 
                            value={reportConfig.status} 
                            onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected' | 'processing') => 
                              setReportConfig(prev => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {reportConfig.dateRange === 'custom' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input 
                              id="start-date"
                              type="date"
                              value={reportConfig.startDate || ''}
                              onChange={(e) => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date">End Date</Label>
                            <Input 
                              id="end-date"
                              type="date"
                              value={reportConfig.endDate || ''}
                              onChange={(e) => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <Label>Report Options</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="include-transactions"
                              checked={reportConfig.includeTransactionDetails}
                              onCheckedChange={(checked) => 
                                setReportConfig(prev => ({ ...prev, includeTransactionDetails: checked as boolean }))
                              }
                            />
                            <Label htmlFor="include-transactions" className="text-sm">
                              Include transaction details in report
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="include-attachments"
                              checked={reportConfig.includeAttachments}
                              onCheckedChange={(checked) => 
                                setReportConfig(prev => ({ ...prev, includeAttachments: checked as boolean }))
                              }
                            />
                            <Label htmlFor="include-attachments" className="text-sm">
                              Include attachment information
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Printer className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Print Preview</p>
                            <p className="text-xs text-muted-foreground">
                              The report will be formatted for professional printing with company letterhead, 
                              summary statistics, and detailed request information based on your selections.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
                        {isGeneratingReport ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Printer className="h-4 w-4 mr-2" />
                            Generate & Print
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reimbursementRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <div className="font-medium">Request #{request.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.requestDate} • {request.requestedBy} • {request.category}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {request.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">MVR {request.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.transactions.length} transactions
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Expense Reports & Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Work permit and quota fee expense analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Work Permits</span>
                    </div>
                    <div className="text-2xl font-bold">MVR {workPermitExpenses.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">This month</div>
                    <div className="text-xs text-blue-600 mt-2">
                      {Math.round((workPermitExpenses / totalDebits) * 100)}% of total expenses
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Quota Fees</span>
                    </div>
                    <div className="text-2xl font-bold">MVR {quotaFeesExpenses.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">This month</div>
                    <div className="text-xs text-green-600 mt-2">
                      {Math.round((quotaFeesExpenses / totalDebits) * 100)}% of total expenses
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{transactions.filter(t => t.category === 'work-permit' && t.type === 'debit').length}</div>
                    <div className="text-sm text-muted-foreground">Work Permit Transactions</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{transactions.filter(t => t.category === 'quota-fees' && t.type === 'debit').length}</div>
                    <div className="text-sm text-muted-foreground">Quota Fee Transactions</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">MVR {(totalDebits / transactions.filter(t => t.type === 'debit').length || 1).toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Average Transaction</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Monthly Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}