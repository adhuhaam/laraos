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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  UserX, FileText, Calendar, User, Building2, Download,
  RefreshCw, Send, Eye, Filter, Search, AlertCircle,
  CheckCircle, Clock, Wallet, ArrowUpRight, ArrowDownRight,
  Edit3, Trash2, Plus, FileUp, AlertTriangle, CheckCircle2,
  X, Save, MoreHorizontal, TrendingUp, Calculator,
  FileSpreadsheet, Printer, Users, Target, DollarSign,
  Timer, Hash, FileCheck, XCircle, Activity, Calendar as CalendarIcon,
  UserMinus, Plane, Home, ChevronRight, MapPin, Globe, Briefcase,
  CreditCard, PenTool, UserCheck, Settings, Minus
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface AllowanceItem {
  name: string
  days?: number
  rate?: number
  amount: number
}

interface WageEntry {
  id: string
  description: string
  amount: number
}

interface DepartureRecord {
  id: string
  sheetDate: string
  departureType: 'emergency-leave' | 'annual-leave' | 'retirement' | 'resignation' | 'termination'
  empId: string
  employeeName: string
  passportNo: string
  designation: string
  nationality: string
  joinDate: string
  leaveStartDate?: string
  leaveEndDate?: string
  
  // Multiple Wages
  wages: WageEntry[]
  totalWages: number
  
  // Allowances
  allowances: AllowanceItem[]
  
  // Deductions
  deductions: AllowanceItem[]
  
  // Calculations
  totalEarnings: number
  totalDeductions: number
  netAmount: number
  usdAmount: number
  exchangeRate: number
  
  status: 'draft' | 'pending-hrm' | 'pending-cfo' | 'pending-approval' | 'approved' | 'completed'
  signatures: {
    preparedBy?: string
    preparedDate?: string
    checkedByHRM?: string
    checkedByHRMDate?: string
    checkedByCFO?: string
    checkedByCFODate?: string
    approvedBy?: string
    approvedDate?: string
  }
  employeeAcknowledgment?: string
  notes?: string
}

interface Employee {
  id: string
  name: string
  empId: string
  passportNo: string
  designation: string
  nationality: string
  joinDate: string
  currentSalary: number
  status: 'active' | 'inactive'
}

export function DepartureManagement() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isDepartureSheetDialogOpen, setIsDepartureSheetDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DepartureRecord | null>(null)
  const [exchangeRate, setExchangeRate] = useState(15.42) // Default MVR to USD rate

  // Initialize with multiple wages structure
  const [newDepartureSheet, setNewDepartureSheet] = useState<Partial<DepartureRecord>>({
    sheetDate: new Date().toISOString().split('T')[0],
    departureType: 'annual-leave',
    wages: [
      { id: 'wage-1', description: '', amount: 0 }
    ],
    totalWages: 0,
    allowances: [
      { name: 'Service Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'Professional Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'Site Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'Pump Sick Batching Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'Other Fixed Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'Island Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'Long Term Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'Phone Allowance', amount: 0 },
      { name: 'Attendance Allowance', days: 30, rate: 0, amount: 0 },
      { name: 'OT Areas', amount: 0 },
      { name: 'Over Time', amount: 0 }
    ],
    deductions: [
      { name: 'Water Deduction', amount: 0 },
      { name: 'Salary Advance', amount: 0 },
      { name: 'Medical', amount: 0 },
      { name: 'Food & Tea Allowance', amount: 0 },
      { name: 'Petrol Allowance', amount: 0 },
      { name: 'WP Medical Fee', amount: 0 },
      { name: 'PPE Cost', amount: 0 },
      { name: 'Work Permit Fee', amount: 0 },
      { name: 'Phone', amount: 0 }
    ],
    totalEarnings: 0,
    totalDeductions: 0,
    netAmount: 0,
    usdAmount: 0,
    exchangeRate: 15.42,
    signatures: {}
  })

  const printRef = useRef<HTMLDivElement>(null)

  // Mock employees data
  const [employees] = useState<Employee[]>([
    {
      id: 'E001',
      name: 'Sundara Rajan Kesavan',
      empId: '2012',
      passportNo: 'G6214962',
      designation: 'Assistant Manager - Logistic',
      nationality: 'Indian',
      joinDate: '2013-04-01',
      currentSalary: 700.00,
      status: 'active'
    },
    {
      id: 'E002',
      name: 'Mohammad Ali',
      empId: 'EMP002',
      passportNo: 'B987654321',
      designation: 'Project Manager',
      nationality: 'India',
      joinDate: '2022-08-20',
      currentSalary: 1200.00,
      status: 'active'
    }
  ])

  // Mock departure records with multiple wages
  const [departureRecords, setDepartureRecords] = useState<DepartureRecord[]>([
    {
      id: 'DEP001',
      sheetDate: '2025-04-15',
      departureType: 'emergency-leave',
      empId: '2012',
      employeeName: 'Sundara Rajan Kesavan',
      passportNo: 'G6214962',
      designation: 'Assistant Manager - Logistic',
      nationality: 'Indian',
      joinDate: '2013-04-01',
      leaveStartDate: '2025-03-01',
      leaveEndDate: '2025-05-31',
      wages: [
        { id: 'wage-1', description: 'Wages for March 2025', amount: 700.00 },
        { id: 'wage-2', description: 'Wages for April 2025', amount: 700.00 },
        { id: 'wage-3', description: 'Wages for May 2025 (Partial)', amount: 350.00 }
      ],
      totalWages: 1750.00,
      allowances: [
        { name: 'Service Allowance', days: 90, rate: 200.00, amount: 600.00 },
        { name: 'Professional Allowance', days: 90, rate: 500.00, amount: 1500.00 },
        { name: 'Long Term Allowance', days: 90, rate: 64.85, amount: 194.55 },
        { name: 'Attendance Allowance', days: 90, rate: 100.00, amount: 300.00 }
      ],
      deductions: [],
      totalEarnings: 4344.55,
      totalDeductions: 0,
      netAmount: 4344.55,
      usdAmount: 281.87,
      exchangeRate: 15.42,
      status: 'pending-hrm',
      signatures: {
        preparedBy: 'HR Officer',
        preparedDate: '2025-04-15'
      },
      employeeAcknowledgment: 'I received my Entitled Salary & benefits according to the Agreement for the period for which I worked for BRO Pvt. Ltd. I am signing this without any force and I don\'t have anything against the company.'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending-hrm':
      case 'pending-cfo':
      case 'pending-approval':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual-leave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'emergency-leave':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'retirement':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'resignation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'termination':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'annual-leave': return 'Annual Leave'
      case 'emergency-leave': return 'Emergency Leave'
      case 'retirement': return 'Retirement'
      case 'resignation': return 'Resignation'
      case 'termination': return 'Termination'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'pending-hrm': return 'Pending HRM'
      case 'pending-cfo': return 'Pending CFO'
      case 'pending-approval': return 'Pending Approval'
      case 'approved': return 'Approved'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  const calculateTotals = () => {
    const wagesTotal = (newDepartureSheet.wages || []).reduce((sum, wage) => sum + wage.amount, 0)
    const allowancesTotal = (newDepartureSheet.allowances || []).reduce((sum, item) => sum + item.amount, 0)
    const deductionsTotal = (newDepartureSheet.deductions || []).reduce((sum, item) => sum + item.amount, 0)
    
    const totalEarnings = wagesTotal + allowancesTotal
    const netAmount = totalEarnings - deductionsTotal
    const usdAmount = netAmount / (newDepartureSheet.exchangeRate || 15.42)
    
    setNewDepartureSheet(prev => ({
      ...prev,
      totalWages: wagesTotal,
      totalEarnings,
      totalDeductions: deductionsTotal,
      netAmount,
      usdAmount: parseFloat(usdAmount.toFixed(2))
    }))
  }

  const handleEmployeeSelect = (empId: string) => {
    const employee = employees.find(emp => emp.empId === empId)
    if (employee) {
      setNewDepartureSheet(prev => ({
        ...prev,
        empId: employee.empId,
        employeeName: employee.name,
        passportNo: employee.passportNo,
        designation: employee.designation,
        nationality: employee.nationality,
        joinDate: employee.joinDate,
        wages: [
          { id: 'wage-1', description: `Wages for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, amount: employee.currentSalary }
        ]
      }))
    }
  }

  const addWageEntry = () => {
    setNewDepartureSheet(prev => ({
      ...prev,
      wages: [
        ...(prev.wages || []),
        { id: `wage-${Date.now()}`, description: '', amount: 0 }
      ]
    }))
  }

  const removeWageEntry = (wageId: string) => {
    setNewDepartureSheet(prev => ({
      ...prev,
      wages: (prev.wages || []).filter(wage => wage.id !== wageId)
    }))
    setTimeout(calculateTotals, 100)
  }

  const updateWageEntry = (wageId: string, field: 'description' | 'amount', value: string | number) => {
    setNewDepartureSheet(prev => ({
      ...prev,
      wages: (prev.wages || []).map(wage => 
        wage.id === wageId 
          ? { ...wage, [field]: field === 'amount' ? (typeof value === 'number' ? value : parseFloat(value as string) || 0) : value }
          : wage
      )
    }))
    setTimeout(calculateTotals, 100)
  }

  const updateAllowance = (index: number, field: keyof AllowanceItem, value: number) => {
    setNewDepartureSheet(prev => {
      const allowances = [...(prev.allowances || [])]
      allowances[index] = { ...allowances[index], [field]: value }
      
      // Auto-calculate amount if days and rate are provided
      if (field === 'days' || field === 'rate') {
        const days = field === 'days' ? value : allowances[index].days || 0
        const rate = field === 'rate' ? value : allowances[index].rate || 0
        if (days && rate) {
          allowances[index].amount = days * rate
        }
      }
      
      return { ...prev, allowances }
    })
    setTimeout(calculateTotals, 100)
  }

  const updateDeduction = (index: number, value: number) => {
    setNewDepartureSheet(prev => {
      const deductions = [...(prev.deductions || [])]
      deductions[index] = { ...deductions[index], amount: value }
      return { ...prev, deductions }
    })
    setTimeout(calculateTotals, 100)
  }

  const handleCreateDepartureSheet = async () => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newRecord: DepartureRecord = {
        id: `DEP${Date.now()}`,
        ...newDepartureSheet as DepartureRecord,
        status: 'draft',
        signatures: {
          preparedBy: 'Current User',
          preparedDate: new Date().toISOString().split('T')[0]
        }
      }
      
      setDepartureRecords(prev => [newRecord, ...prev])
      setIsDepartureSheetDialogOpen(false)
      resetForm()
      
      toast.success('Departure sheet created successfully')
    } catch (error) {
      toast.error('Failed to create departure sheet')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewDepartureSheet({
      sheetDate: new Date().toISOString().split('T')[0],
      departureType: 'annual-leave',
      wages: [
        { id: 'wage-1', description: '', amount: 0 }
      ],
      totalWages: 0,
      allowances: [
        { name: 'Service Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'Professional Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'Site Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'Pump Sick Batching Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'Other Fixed Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'Island Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'Long Term Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'Phone Allowance', amount: 0 },
        { name: 'Attendance Allowance', days: 30, rate: 0, amount: 0 },
        { name: 'OT Areas', amount: 0 },
        { name: 'Over Time', amount: 0 }
      ],
      deductions: [
        { name: 'Water Deduction', amount: 0 },
        { name: 'Salary Advance', amount: 0 },
        { name: 'Medical', amount: 0 },
        { name: 'Food & Tea Allowance', amount: 0 },
        { name: 'Petrol Allowance', amount: 0 },
        { name: 'WP Medical Fee', amount: 0 },
        { name: 'PPE Cost', amount: 0 },
        { name: 'Work Permit Fee', amount: 0 },
        { name: 'Phone', amount: 0 }
      ],
      totalEarnings: 0,
      totalDeductions: 0,
      netAmount: 0,
      usdAmount: 0,
      exchangeRate: 15.42,
      signatures: {}
    })
  }

  const handlePrintDepartureSheet = () => {
    if (!selectedRecord) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const printContent = generateDepartureSheetHTML(selectedRecord)
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const generateDepartureSheetHTML = (record: DepartureRecord) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Departure Sheet - ${record.empId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Arial:wght@400;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.2;
            color: #000;
            background: white;
            padding: 10mm;
          }
          
          .departure-sheet {
            max-width: 210mm;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 10px;
          }
          
          .header {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin-bottom: 15px;
            text-decoration: underline;
          }
          
          .sheet-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 10pt;
          }
          
          .sheet-info div {
            border: 1px solid #000;
            padding: 3px 8px;
            min-width: 150px;
          }
          
          .employee-section {
            margin-bottom: 15px;
            border: 2px solid #000;
            padding: 8px;
          }
          
          .employee-header {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 8px;
            text-decoration: underline;
          }
          
          .employee-details {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            font-size: 9pt;
          }
          
          .detail-item {
            border: 1px solid #000;
            padding: 3px;
            display: flex;
            justify-content: space-between;
          }
          
          .wages-section {
            margin-bottom: 10px;
          }
          
          .wages-header {
            background: #000;
            color: white;
            text-align: center;
            font-weight: bold;
            padding: 3px;
            font-size: 10pt;
          }
          
          .wages-content {
            border: 1px solid #000;
            padding: 5px;
            min-height: 20px;
          }
          
          .wages-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
          }
          
          .wages-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            text-align: left;
          }
          
          .wages-table .amount-cell {
            text-align: right;
            min-width: 60px;
          }
          
          .financial-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 9pt;
          }
          
          .financial-table th,
          .financial-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            text-align: left;
          }
          
          .financial-table th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }
          
          .amount-cell {
            text-align: right;
            min-width: 60px;
          }
          
          .total-row {
            font-weight: bold;
          }
          
          .usd-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 15px;
          }
          
          .usd-box {
            border: 2px solid #000;
            padding: 5px 10px;
            font-weight: bold;
            font-size: 12pt;
          }
          
          .acknowledgment-section {
            border: 2px solid #000;
            padding: 8px;
            margin-bottom: 15px;
            font-size: 8pt;
            text-align: justify;
          }
          
          .employee-name-signature {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding: 8px;
            border: 1px solid #000;
          }
          
          .signatures-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
            border: 2px solid #000;
          }
          
          .signature-box {
            border-right: 1px solid #000;
            padding: 8px;
            text-align: center;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .signature-box:last-child {
            border-right: none;
          }
          
          .signature-title {
            font-weight: bold;
            font-size: 8pt;
            margin-bottom: 30px;
          }
          
          .signature-name {
            font-size: 8pt;
            border-top: 1px solid #000;
            padding-top: 2px;
            margin-top: auto;
          }
          
          @media print {
            body { padding: 5mm; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="departure-sheet">
          <div class="header">DEPARTURE SHEET</div>
          
          <div class="sheet-info">
            <div><strong>Date:</strong> ${new Date(record.sheetDate).toLocaleDateString()}</div>
            <div><strong>Reason:</strong> ${getTypeLabel(record.departureType)}</div>
          </div>
          
          ${record.leaveStartDate && record.leaveEndDate ? `
            <div style="margin-bottom: 10px; font-size: 9pt;">
              <strong>Joined Date:</strong> ${new Date(record.joinDate).toLocaleDateString()} &nbsp;&nbsp;
              <strong>Leave Start Date:</strong> ${new Date(record.leaveStartDate).toLocaleDateString()} &nbsp;&nbsp;
              <strong>Leave End Date:</strong> ${new Date(record.leaveEndDate).toLocaleDateString()}
            </div>
          ` : ''}
          
          <div class="employee-section">
            <div class="employee-header">${record.employeeName.toUpperCase()}</div>
            <div class="employee-details">
              <div class="detail-item">
                <span><strong>PP#:</strong></span>
                <span>${record.passportNo}</span>
              </div>
              <div class="detail-item">
                <span><strong>Designation:</strong></span>
                <span>${record.designation}</span>
              </div>
              <div class="detail-item">
                <span><strong>Nationality:</strong></span>
                <span>${record.nationality}</span>
              </div>
            </div>
          </div>
          
          <div class="wages-section">
            <div class="wages-header">WAGES BREAKDOWN</div>
            <div class="wages-content">
              <table class="wages-table">
                ${record.wages.map(wage => `
                  <tr>
                    <td style="width: 70%;">${wage.description}</td>
                    <td class="amount-cell">-</td>
                    <td class="amount-cell">${wage.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr style="background: #f0f0f0; font-weight: bold;">
                  <td><strong>TOTAL WAGES</strong></td>
                  <td class="amount-cell"><strong>-</strong></td>
                  <td class="amount-cell"><strong>${record.totalWages.toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>
          </div>
          
          <table class="financial-table">
            <thead>
              <tr>
                <th style="width: 40%;">Allowance</th>
                <th style="width: 15%;">No. of Days</th>
                <th style="width: 15%;">Rate</th>
                <th style="width: 15%;">DR</th>
                <th style="width: 15%;">CR</th>
              </tr>
            </thead>
            <tbody>
              ${record.allowances.filter(item => item.amount > 0).map(allowance => `
                <tr>
                  <td>${allowance.name}</td>
                  <td class="amount-cell">${allowance.days || '-'}</td>
                  <td class="amount-cell">${allowance.rate ? allowance.rate.toFixed(2) : '-'}</td>
                  <td class="amount-cell">-</td>
                  <td class="amount-cell">${allowance.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="5" style="padding: 10px;"></td>
              </tr>
              <tr style="background: #f0f0f0;">
                <th colspan="3">Deductions</th>
                <th>DR</th>
                <th>CR</th>
              </tr>
              ${record.deductions.filter(item => item.amount > 0).map(deduction => `
                <tr>
                  <td>${deduction.name}</td>
                  <td colspan="2"></td>
                  <td class="amount-cell">${deduction.amount.toFixed(2)}</td>
                  <td class="amount-cell">-</td>
                </tr>
              `).join('')}
              ${record.deductions.filter(item => item.amount > 0).length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 20px;">No Deductions</td>
                </tr>
              ` : ''}
              <tr class="total-row" style="background: #f0f0f0;">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td class="amount-cell"><strong>${record.totalDeductions.toFixed(2)}</strong></td>
                <td class="amount-cell"><strong>${record.netAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div class="usd-section">
            <div class="usd-box">
              USD &nbsp;&nbsp;&nbsp;&nbsp; ${record.usdAmount.toFixed(2)}
            </div>
          </div>
          
          <div class="acknowledgment-section">
            ${record.employeeAcknowledgment || 'I received my Entitled Salary & benefits according to the Agreement for the period for which I worked for the company. I am signing this without any force and I don\'t have anything against the company.'}
          </div>
          
          <div class="employee-name-signature">
            <div style="font-weight: bold;">${record.employeeName.toUpperCase()}</div>
            <div style="border: 1px solid #000; width: 200px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">Signature</div>
          </div>
          
          <div class="signatures-section">
            <div class="signature-box">
              <div class="signature-title">PREPARED BY:<br>HR OFFICER</div>
              <div class="signature-name">${record.signatures.preparedBy || '_________________'}</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">CHECKED BY:<br>HR MANAGER</div>
              <div class="signature-name">${record.signatures.checkedByHRM || '_________________'}</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">CHECKED BY:<br>CFO/ACCOUNTANT</div>
              <div class="signature-name">${record.signatures.checkedByCFO || '_________________'}</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">APPROVED BY:<br>CHAIRMAN/MD/DIRECTOR</div>
              <div class="signature-name">${record.signatures.approvedBy || '_________________'}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const filteredRecords = departureRecords.filter(record => {
    const matchesSearch = searchQuery === '' || 
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.passportNo.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesType = typeFilter === 'all' || record.departureType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const totalBalance = departureRecords.reduce((sum, record) => sum + record.netAmount, 0)
  const pendingSheets = departureRecords.filter(r => r.status.includes('pending')).length
  const completedSheets = departureRecords.filter(r => r.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departures Management</h1>
          <p className="text-muted-foreground">
            Manage employee departure sheets and final settlements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDepartureSheetDialogOpen} onOpenChange={setIsDepartureSheetDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Departure Sheet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Departure Sheet</DialogTitle>
                <DialogDescription>
                  Generate a departure sheet for an employee leaving the company
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sheet-date">Sheet Date</Label>
                      <Input
                        id="sheet-date"
                        type="date"
                        value={newDepartureSheet.sheetDate || ''}
                        onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, sheetDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="departure-type">Departure Type</Label>
                      <Select 
                        value={newDepartureSheet.departureType || 'annual-leave'} 
                        onValueChange={(value: any) => setNewDepartureSheet(prev => ({ ...prev, departureType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual-leave">Annual Leave</SelectItem>
                          <SelectItem value="emergency-leave">Emergency Leave</SelectItem>
                          <SelectItem value="retirement">Retirement</SelectItem>
                          <SelectItem value="resignation">Resignation</SelectItem>
                          <SelectItem value="termination">Termination</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="exchange-rate">Exchange Rate (MVR to USD)</Label>
                      <Input
                        id="exchange-rate"
                        type="number"
                        step="0.01"
                        value={newDepartureSheet.exchangeRate || 15.42}
                        onChange={(e) => {
                          setNewDepartureSheet(prev => ({ ...prev, exchangeRate: parseFloat(e.target.value) || 15.42 }))
                          setTimeout(calculateTotals, 100)
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Employee Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium">Employee Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee-select">Select Employee</Label>
                      <Select onValueChange={handleEmployeeSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.empId}>
                              {employee.empId} - {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="emp-name">Employee Name</Label>
                      <Input
                        id="emp-name"
                        value={newDepartureSheet.employeeName || ''}
                        onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, employeeName: e.target.value }))}
                        placeholder="Enter employee name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="passport-no">Passport Number</Label>
                      <Input
                        id="passport-no"
                        value={newDepartureSheet.passportNo || ''}
                        onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, passportNo: e.target.value }))}
                        placeholder="Passport number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={newDepartureSheet.designation || ''}
                        onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, designation: e.target.value }))}
                        placeholder="Job designation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={newDepartureSheet.nationality || ''}
                        onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, nationality: e.target.value }))}
                        placeholder="Nationality"
                      />
                    </div>
                  </div>

                  {newDepartureSheet.departureType && (newDepartureSheet.departureType.includes('leave')) && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="join-date">Join Date</Label>
                        <Input
                          id="join-date"
                          type="date"
                          value={newDepartureSheet.joinDate || ''}
                          onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, joinDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="leave-start">Leave Start Date</Label>
                        <Input
                          id="leave-start"
                          type="date"
                          value={newDepartureSheet.leaveStartDate || ''}
                          onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, leaveStartDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="leave-end">Leave End Date</Label>
                        <Input
                          id="leave-end"
                          type="date"
                          value={newDepartureSheet.leaveEndDate || ''}
                          onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, leaveEndDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Wages Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Wages (Multiple Months)</h4>
                    <Button type="button" onClick={addWageEntry} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Wage Entry
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {newDepartureSheet.wages?.map((wage, index) => (
                      <div key={wage.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label htmlFor={`wage-desc-${index}`}>Description</Label>
                          <Input
                            id={`wage-desc-${index}`}
                            value={wage.description}
                            onChange={(e) => updateWageEntry(wage.id, 'description', e.target.value)}
                            placeholder="e.g., Wages for March 2025"
                          />
                        </div>
                        <div className="w-32">
                          <Label htmlFor={`wage-amount-${index}`}>Amount (MVR)</Label>
                          <Input
                            id={`wage-amount-${index}`}
                            type="number"
                            step="0.01"
                            value={wage.amount}
                            onChange={(e) => updateWageEntry(wage.id, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        {(newDepartureSheet.wages?.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeWageEntry(wage.id)}
                            className="mt-6"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Wages:</span>
                      <span className="font-bold text-lg">MVR {(newDepartureSheet.totalWages || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Allowances Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Allowances</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Allowance</TableHead>
                          <TableHead>No. of Days</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newDepartureSheet.allowances?.map((allowance, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{allowance.name}</TableCell>
                            <TableCell>
                              {allowance.name.includes('Phone') || allowance.name.includes('OT') || allowance.name.includes('Over Time') ? (
                                <span className="text-muted-foreground">N/A</span>
                              ) : (
                                <Input
                                  type="number"
                                  value={allowance.days || ''}
                                  onChange={(e) => updateAllowance(index, 'days', parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {allowance.name.includes('Phone') || allowance.name.includes('OT') || allowance.name.includes('Over Time') ? (
                                <span className="text-muted-foreground">N/A</span>
                              ) : (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={allowance.rate || ''}
                                  onChange={(e) => updateAllowance(index, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-24"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={allowance.amount || ''}
                                onChange={(e) => updateAllowance(index, 'amount', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Deductions Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Deductions</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {newDepartureSheet.deductions?.map((deduction, index) => (
                      <div key={index}>
                        <Label htmlFor={`deduction-${index}`}>{deduction.name}</Label>
                        <Input
                          id={`deduction-${index}`}
                          type="number"
                          step="0.01"
                          value={deduction.amount || ''}
                          onChange={(e) => updateDeduction(index, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculated Totals */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Total Wages:</span>
                    <span className="font-medium">MVR {(newDepartureSheet.totalWages || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Allowances:</span>
                    <span className="font-medium">MVR {((newDepartureSheet.allowances || []).reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earnings:</span>
                    <span className="font-medium">MVR {(newDepartureSheet.totalEarnings || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deductions:</span>
                    <span className="font-medium">MVR {(newDepartureSheet.totalDeductions || 0).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Amount (MVR):</span>
                    <span className="text-green-600">MVR {(newDepartureSheet.netAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Amount in USD:</span>
                    <span className="text-blue-600">USD {(newDepartureSheet.usdAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Employee Acknowledgment */}
                <div>
                  <Label htmlFor="acknowledgment">Employee Acknowledgment</Label>
                  <Textarea
                    id="acknowledgment"
                    value={newDepartureSheet.employeeAcknowledgment || 'I received my Entitled Salary & benefits according to the Agreement for the period for which I worked for the company. I am signing this without any force and I don\'t have anything against the company.'}
                    onChange={(e) => setNewDepartureSheet(prev => ({ ...prev, employeeAcknowledgment: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDepartureSheetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDepartureSheet} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Sheet
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departure Sheets</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departureRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Generated sheets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSheets}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payable</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MVR {totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Balance to pay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSheets}</div>
            <p className="text-xs text-muted-foreground">
              Fully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departure-sheets">Departure Sheets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Departure Sheets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Departure Sheets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departureRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(record.departureType)}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.empId} • {getTypeLabel(record.departureType)} • {record.sheetDate}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {record.wages.length} wage entr{record.wages.length === 1 ? 'y' : 'ies'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">MVR {record.netAmount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">USD {record.usdAmount.toLocaleString()}</div>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusLabel(record.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departure Sheets Tab */}
        <TabsContent value="departure-sheets" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search departure sheets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending-hrm">Pending HRM</SelectItem>
                    <SelectItem value="pending-cfo">Pending CFO</SelectItem>
                    <SelectItem value="pending-approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="annual-leave">Annual Leave</SelectItem>
                    <SelectItem value="emergency-leave">Emergency Leave</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="resignation">Resignation</SelectItem>
                    <SelectItem value="termination">Termination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Departure Sheets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Departure Sheets ({filteredRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sheet ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Wages</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>USD Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{record.empId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(record.departureType)}>
                            {getTypeLabel(record.departureType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(record.sheetDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">MVR {record.totalWages.toLocaleString()}</div>
                            <div className="text-muted-foreground">{record.wages.length} entr{record.wages.length === 1 ? 'y' : 'ies'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">MVR {record.netAmount.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-blue-600">USD {record.usdAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRecord(record)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRecord(record)
                                handlePrintDepartureSheet()
                              }}
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Print
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Departure Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Leave Departures</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {departureRecords.filter(r => r.departureType.includes('leave')).length}
                    </div>
                    <div className="text-sm text-muted-foreground">This month</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Permanent Departures</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {departureRecords.filter(r => !r.departureType.includes('leave')).length}
                    </div>
                    <div className="text-sm text-muted-foreground">This month</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Departure Sheet Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Departure Sheet Details</DialogTitle>
            <DialogDescription>
              View complete departure sheet information and print if needed
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee Name</Label>
                  <div className="font-medium">{selectedRecord.employeeName}</div>
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <div className="font-medium">{selectedRecord.empId}</div>
                </div>
                <div className="space-y-2">
                  <Label>Departure Type</Label>
                  <Badge className={getTypeColor(selectedRecord.departureType)}>
                    {getTypeLabel(selectedRecord.departureType)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedRecord.status)}>
                    {getStatusLabel(selectedRecord.status)}
                  </Badge>
                </div>
              </div>

              {/* Wages Breakdown */}
              <div className="space-y-2">
                <Label>Wages Breakdown</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount (MVR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRecord.wages.map((wage, index) => (
                        <TableRow key={index}>
                          <TableCell>{wage.description}</TableCell>
                          <TableCell className="text-right font-medium">{wage.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted font-bold">
                        <TableCell>Total Wages</TableCell>
                        <TableCell className="text-right">{selectedRecord.totalWages.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Total Wages:</span>
                    <span>MVR {selectedRecord.totalWages.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Allowances:</span>
                    <span>MVR {selectedRecord.allowances.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deductions:</span>
                    <span>MVR {selectedRecord.totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span>{selectedRecord.exchangeRate} MVR/USD</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg col-span-2 pt-2 border-t">
                    <span>Net Amount:</span>
                    <div className="text-right">
                      <div className="text-green-600">MVR {selectedRecord.netAmount.toLocaleString()}</div>
                      <div className="text-blue-600">USD {selectedRecord.usdAmount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintDepartureSheet}>
              <Printer className="h-4 w-4 mr-2" />
              Print Sheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}