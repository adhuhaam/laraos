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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  Building2, FileText, Calendar, User, Download,
  RefreshCw, Send, Eye, Filter, Search, AlertCircle,
  CheckCircle, Clock, Wallet, Plus, Printer,
  Edit3, Trash2, Save, MoreHorizontal, Calculator,
  Users, Target, DollarSign, CreditCard, Banknote,
  Mail, Phone, MapPin, Globe, Building, FileCheck,
  UserCheck, Settings, Hash, Activity
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Employee {
  id: string
  empId: string
  fullName: string
  workPermitNumber: string
  passportNumber: string
  designation: string
  joiningDate: string
  workLocation: string
  residentialAddress: string
  permanentAddress: string
  monthlyBasicSalary: number
  foodAllowance: number
  otherAllowances: number
  annualGrossIncome: number
  nationality: string
  status: 'active' | 'inactive'
}

interface Bank {
  id: string
  name: string
  fullName: string
  address: string
  contactPerson: string
  recipientTitle: string
}

interface BankLetter {
  id: string
  letterDate: string
  employeeId: string
  bankId: string
  letterType: 'account_opening' | 'salary_certificate' | 'employment_verification'
  status: 'draft' | 'generated' | 'sent' | 'completed'
  generatedBy: string
  generatedDate?: string
  sentDate?: string
  notes?: string
}

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
  hrOfficer: string
  hrTitle: string
}

export function BankAccountAssistance() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [bankFilter, setBankFilter] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<BankLetter | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)

  const printRef = useRef<HTMLDivElement>(null)

  // Company Information
  const companyInfo: CompanyInfo = {
    name: 'Rasheed Carpentry and Construction Pvt Ltd',
    address: 'M. Nectar, Asaree Hingun, Male\' Maldives',
    phone: '+(960) 331-7878',
    email: 'hr@rcc.com.mv',
    website: 'rcc.com.mv',
    hrOfficer: 'Abdulla Miuwan Rafeeq',
    hrTitle: 'HR OFFICER'
  }

  // Mock employees data
  const [employees] = useState<Employee[]>([
    {
      id: 'E001',
      empId: '5230',
      fullName: 'AJIT KUMAR SINGH',
      workPermitNumber: 'WP00655776',
      passportNumber: 'X9478876',
      designation: 'Labourer, construction: building work',
      joiningDate: '2025-03-05',
      workLocation: 'CONSTRUCTION OF 10 STOREY OFFICE BUILDING AT M.JALIYAA(ST00066045)',
      residentialAddress: 'G.Pool Dream, K.Male\', Maldives',
      permanentAddress: 'VILLAGE-GADIYANI TOLA,MADHUBANI PS-DHANAHA, WEST CHAMPARAN PIN:845404,BIHAR,INDIA',
      monthlyBasicSalary: 6168.00,
      foodAllowance: 2000.00,
      otherAllowances: 0.00,
      annualGrossIncome: 98016.00,
      nationality: 'Indian',
      status: 'active'
    },
    {
      id: 'E002',
      empId: '4521',
      fullName: 'MOHAMMAD HASSAN ALI',
      workPermitNumber: 'WP00655892',
      passportNumber: 'A7856234',
      designation: 'Electrician',
      joiningDate: '2024-11-15',
      workLocation: 'CONSTRUCTION OF RESIDENTIAL COMPLEX AT H.DH.KULHUDHUFFUSHI(ST00065892)',
      residentialAddress: 'M.Galaxy Villa, K.Male\', Maldives',
      permanentAddress: 'HOUSE NO.245, SECTOR-7, KARACHI, PAKISTAN',
      monthlyBasicSalary: 8500.00,
      foodAllowance: 2500.00,
      otherAllowances: 500.00,
      annualGrossIncome: 138000.00,
      nationality: 'Pakistani',
      status: 'active'
    }
  ])

  // Mock banks data
  const [banks] = useState<Bank[]>([
    {
      id: 'B001',
      name: 'SBI',
      fullName: 'State Bank of India',
      address: 'Male\', Maldives',
      contactPerson: 'The Country Head & Chief Executive Officer',
      recipientTitle: 'The Country Head & Chief Executive Officer<br>State Bank of India<br>Male\', Maldives'
    },
    {
      id: 'B002',
      name: 'BML',
      fullName: 'Bank of Maldives',
      address: 'Male\', Maldives',
      contactPerson: 'The Chief Executive Officer',
      recipientTitle: 'The Chief Executive Officer<br>Bank of Maldives<br>Male\', Maldives'
    },
    {
      id: 'B003',
      name: 'MIB',
      fullName: 'Maldives Islamic Bank',
      address: 'Male\', Maldives',
      contactPerson: 'The Chief Executive Officer',
      recipientTitle: 'The Chief Executive Officer<br>Maldives Islamic Bank<br>Male\', Maldives'
    }
  ])

  // Mock bank letters
  const [bankLetters, setBankLetters] = useState<BankLetter[]>([
    {
      id: 'BL001',
      letterDate: '2025-07-02',
      employeeId: 'E001',
      bankId: 'B001',
      letterType: 'account_opening',
      status: 'generated',
      generatedBy: 'HR Officer',
      generatedDate: '2025-07-02',
      notes: 'Generated for new employee bank account opening'
    },
    {
      id: 'BL002',
      letterDate: '2025-06-28',
      employeeId: 'E002',
      bankId: 'B002',
      letterType: 'account_opening',
      status: 'sent',
      generatedBy: 'HR Manager',
      generatedDate: '2025-06-28',
      sentDate: '2025-06-29',
      notes: 'Sent to bank for processing'
    }
  ])

  const [newLetter, setNewLetter] = useState<Partial<BankLetter>>({
    letterDate: new Date().toISOString().split('T')[0],
    letterType: 'account_opening',
    status: 'draft'
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'generated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'generated': return 'Generated'
      case 'sent': return 'Sent to Bank'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  const getLetterTypeLabel = (type: string) => {
    switch (type) {
      case 'account_opening': return 'Account Opening'
      case 'salary_certificate': return 'Salary Certificate'
      case 'employment_verification': return 'Employment Verification'
      default: return type
    }
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    setSelectedEmployee(employee || null)
    setNewLetter(prev => ({ ...prev, employeeId }))
  }

  const handleBankSelect = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId)
    setSelectedBank(bank || null)
    setNewLetter(prev => ({ ...prev, bankId }))
  }

  const handleGenerateLetter = async () => {
    if (!selectedEmployee || !selectedBank) {
      toast.error('Please select both employee and bank')
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newBankLetter: BankLetter = {
        id: `BL${Date.now()}`,
        ...newLetter as BankLetter,
        status: 'generated',
        generatedBy: 'Current User',
        generatedDate: new Date().toISOString().split('T')[0]
      }
      
      setBankLetters(prev => [newBankLetter, ...prev])
      setIsLetterDialogOpen(false)
      resetForm()
      
      toast.success('Bank letter generated successfully')
    } catch (error) {
      toast.error('Failed to generate bank letter')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewLetter({
      letterDate: new Date().toISOString().split('T')[0],
      letterType: 'account_opening',
      status: 'draft'
    })
    setSelectedEmployee(null)
    setSelectedBank(null)
  }

  const handlePrintLetter = () => {
    if (!selectedLetter) return

    const employee = employees.find(emp => emp.id === selectedLetter.employeeId)
    const bank = banks.find(b => b.id === selectedLetter.bankId)
    
    if (!employee || !bank) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const printContent = generateLetterHTML(selectedLetter, employee, bank)
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const generateLetterHTML = (letter: BankLetter, employee: Employee, bank: Bank) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Opening Document</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              body {
                  font-family: 'Poppins', Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: white;
                  color: #333;
                  font-size: 11pt;
                  line-height: 1.4;
              }
              
              .print-button {
                  position: fixed;
                  top: 10px;
                  right: 10px;
                  background: #007bff;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                  z-index: 1000;
              }
              
              .a4-container {
                  max-width: 210mm;
                  margin: 0 auto;
                  background: white;
                  padding: 20mm;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  min-height: 297mm;
                  position: relative;
              }
              
              .letterhead {
                  width: 100%;
                  max-width: 600px;
                  height: auto;
                  margin-bottom: 20px;
                  display: block;
                  margin-left: auto;
                  margin-right: auto;
              }
              
              p {
                  margin: 8px 0;
                  font-size: 11pt;
              }
              
              h6 {
                  font-size: 12pt;
                  margin: 15px 0 10px 0;
                  font-weight: 600;
                  text-decoration: underline;
              }
              
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 15px 0;
                  font-size: 10pt;
              }
              
              table, th, td {
                  border: 1px solid #333;
              }
              
              th {
                  background-color: #f8f9fa;
                  padding: 8px;
                  text-align: left;
                  font-weight: 600;
                  width: 35%;
              }
              
              td {
                  padding: 8px;
                  vertical-align: top;
              }
              
              .text-center {
                  text-align: center;
              }
              
              .text-end {
                  text-align: right;
              }
              
              .signature {
                  margin-top: 30px;
                  font-size: 11pt;
                  line-height: 1.6;
              }
              
              .text-primary {
                  color: #007bff;
                  font-weight: 500;
              }
              
              hr {
                  border: none;
                  border-top: 1px solid #333;
                  margin: 20px 0;
              }
              
              strong, b {
                  font-weight: 600;
              }
              
              .col-lg-12 {
                  margin-top: 30px;
                  border-top: 1px solid #333;
                  padding-top: 15px;
              }
              
              @media print {
                  body { 
                      margin: 0; 
                      padding: 0; 
                      font-size: 10pt;
                  }
                  .print-button { 
                      display: none !important; 
                  }
                  .a4-container { 
                      box-shadow: none; 
                      margin: 0; 
                      padding: 15mm;
                  }
                  @page {
                      margin: 10mm;
                  }
              }
          </style>
      </head>
      <body>
          <button class="print-button" onclick="window.print()">Print</button>
          <div class="a4-container">
              <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f8f9fa; border: 2px solid #007bff; border-radius: 10px;">
                  <h2 style="color: #007bff; margin: 0; font-size: 18pt; font-weight: 700;">${companyInfo.name}</h2>
                  <p style="margin: 5px 0; color: #666; font-size: 10pt;">${companyInfo.address}</p>
              </div>

              <p>${bank.recipientTitle}</p>
              <p>${new Date(letter.letterDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              
              <h6 class="fw-normal">REQUEST FOR OPENING OF ACCOUNT</h6>
              <p>This is to confirm that the following employee is employed BY ${companyInfo.name}. We hereby confirm his identity details as follows:</p>
              
              <h6 class="fw-normal">Employee Personal Details</h6>
              <table>
                  <tr>
                      <th>Employee Number/ID</th>
                      <td>${employee.empId}</td>
                  </tr>
                  <tr>
                      <th>Employee Full Name</th>
                      <td>${employee.fullName}</td>
                  </tr>
                  <tr>
                      <th>Work Permit Number</th>
                      <td>${employee.workPermitNumber}</td>
                  </tr>
                  <tr>
                      <th>Passport Number</th>
                      <td>${employee.passportNumber}</td>
                  </tr>
                  <tr>
                      <th>Employee Designation</th>
                      <td>${employee.designation}</td>
                  </tr>
                  <tr>
                      <th>Date of Joining</th>
                      <td>${new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                      <th>Work Location/Site</th>
                      <td>${employee.workLocation}</td>
                  </tr>
                  <tr>
                      <th>Residential Address in Maldives</th>
                      <td>${employee.residentialAddress}</td>
                  </tr>
                  <tr>
                      <th>Permanent Address</th>
                      <td>${employee.permanentAddress}</td>
                  </tr>
              </table>

              <h6 class="fw-normal">Employee Salary / Income Details</h6>
              <table>
                  <tr>
                      <th>Total Monthly Salary</th>
                      <td class="text-center">MVR</td>
                      <td class="text-end">${employee.monthlyBasicSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                      <th>Food Allowance</th>
                      <td class="text-center">MVR</td>
                      <td class="text-end">${employee.foodAllowance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                      <th>Annual Gross Salary/Income</th>
                      <td class="text-center">MVR</td>
                      <td class="text-end">${employee.annualGrossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
              </table>

              <div class="signature">
                  <p>The above-mentioned employee's monthly salary is currently given cash to the employee. Once Account is opened salary will be credited to ${bank.name} From Company Account.</p>
                  <p>We request you to kindly assist him in openning an MVR account at ${bank.fullName}.</p>
                  <p>For any additional information, you may contact the HR Department on the following phone number <b>${companyInfo.phone}</b> or <b>${companyInfo.email}</b>.</p>
                  <br>
                  <p>Thank you,
                  <br>Yours Faithfully,</p>
                  <br><br><br>
                  <p>----------------------------</p>
                  <p><strong>${companyInfo.hrOfficer}</strong>
                  <br>${companyInfo.hrTitle}</p>
                  
                  <div class="col-lg-12 text-center">
                      <p class="text-primary">${companyInfo.address}<br>(T) ${companyInfo.phone.replace('+(960) ', '')} (E) ${companyInfo.email} (W) ${companyInfo.website}</p>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
  }

  const filteredLetters = bankLetters.filter(letter => {
    const employee = employees.find(emp => emp.id === letter.employeeId)
    const bank = banks.find(b => b.id === letter.bankId)
    
    const matchesSearch = searchQuery === '' || 
      (employee?.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (employee?.empId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bank?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || letter.status === statusFilter
    const matchesBank = bankFilter === 'all' || letter.bankId === bankFilter
    
    return matchesSearch && matchesStatus && matchesBank
  })

  const activeEmployees = employees.filter(emp => emp.status === 'active').length
  const totalLetters = bankLetters.length
  const pendingLetters = bankLetters.filter(l => l.status === 'draft' || l.status === 'generated').length
  const completedLetters = bankLetters.filter(l => l.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Account Assistance</h1>
          <p className="text-muted-foreground">
            Help employees open bank accounts by generating professional letters to banks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Bank Letter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Generate Bank Letter</DialogTitle>
                <DialogDescription>
                  Create a professional letter to assist employee with bank account opening
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Letter Details */}
                <div className="space-y-4">
                  <h4 className="font-medium">Letter Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="letter-date">Letter Date</Label>
                      <Input
                        id="letter-date"
                        type="date"
                        value={newLetter.letterDate || ''}
                        onChange={(e) => setNewLetter(prev => ({ ...prev, letterDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="letter-type">Letter Type</Label>
                      <Select 
                        value={newLetter.letterType || 'account_opening'} 
                        onValueChange={(value: any) => setNewLetter(prev => ({ ...prev, letterType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account_opening">Account Opening</SelectItem>
                          <SelectItem value="salary_certificate">Salary Certificate</SelectItem>
                          <SelectItem value="employment_verification">Employment Verification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Employee Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium">Employee Selection</h4>
                  <div>
                    <Label htmlFor="employee-select">Select Employee</Label>
                    <Select onValueChange={handleEmployeeSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.filter(emp => emp.status === 'active').map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.empId} - {employee.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedEmployee && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h5 className="font-medium">Employee Details Preview</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {selectedEmployee.fullName}
                        </div>
                        <div>
                          <span className="font-medium">ID:</span> {selectedEmployee.empId}
                        </div>
                        <div>
                          <span className="font-medium">Designation:</span> {selectedEmployee.designation}
                        </div>
                        <div>
                          <span className="font-medium">Nationality:</span> {selectedEmployee.nationality}
                        </div>
                        <div>
                          <span className="font-medium">Monthly Salary:</span> MVR {selectedEmployee.monthlyBasicSalary.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Annual Income:</span> MVR {selectedEmployee.annualGrossIncome.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium">Bank Selection</h4>
                  <div>
                    <Label htmlFor="bank-select">Select Bank</Label>
                    <Select onValueChange={handleBankSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name} - {bank.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBank && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h5 className="font-medium">Bank Details Preview</h5>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Bank:</span> {selectedBank.fullName}</div>
                        <div><span className="font-medium">Address:</span> {selectedBank.address}</div>
                        <div><span className="font-medium">Recipient:</span> {selectedBank.contactPerson}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newLetter.notes || ''}
                    onChange={(e) => setNewLetter(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional information or special instructions..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLetterDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateLetter} disabled={isSubmitting || !selectedEmployee || !selectedBank}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Generate Letter
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
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Eligible for bank assistance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Letters</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLetters}</div>
            <p className="text-xs text-muted-foreground">
              Generated letters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLetters}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLetters}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="letters">Bank Letters</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Letters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Bank Letters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankLetters.slice(0, 5).map((letter) => {
                  const employee = employees.find(emp => emp.id === letter.employeeId)
                  const bank = banks.find(b => b.id === letter.bankId)
                  
                  return (
                    <div key={letter.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        
                        <div>
                          <div className="font-medium">{employee?.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {employee?.empId} • {bank?.name} • {getLetterTypeLabel(letter.letterType)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {letter.letterDate}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(letter.status)}>
                          {getStatusLabel(letter.status)}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bank Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Partnership Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {banks.map((bank) => {
                  const bankLetterCount = bankLetters.filter(l => l.bankId === bank.id).length
                  
                  return (
                    <div key={bank.id} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{bankLetterCount}</div>
                      <div className="text-sm text-muted-foreground">{bank.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{bank.fullName}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Letters Tab */}
        <TabsContent value="letters" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search letters..."
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
                    <SelectItem value="generated">Generated</SelectItem>
                    <SelectItem value="sent">Sent to Bank</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bankFilter} onValueChange={setBankFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Banks</SelectItem>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Letters Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Letters ({filteredLetters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Letter ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLetters.map((letter) => {
                      const employee = employees.find(emp => emp.id === letter.employeeId)
                      const bank = banks.find(b => b.id === letter.bankId)
                      
                      return (
                        <TableRow key={letter.id}>
                          <TableCell className="font-medium">{letter.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{employee?.fullName}</div>
                              <div className="text-sm text-muted-foreground">{employee?.empId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bank?.name}</div>
                              <div className="text-sm text-muted-foreground">{bank?.fullName}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getLetterTypeLabel(letter.letterType)}</TableCell>
                          <TableCell>{new Date(letter.letterDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(letter.status)}>
                              {getStatusLabel(letter.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLetter(letter)
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
                                  setSelectedLetter(letter)
                                  handlePrintLetter()
                                }}
                              >
                                <Printer className="h-3 w-3 mr-1" />
                                Print
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Employees</CardTitle>
              <p className="text-sm text-muted-foreground">
                Employees eligible for bank account assistance
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Monthly Salary</TableHead>
                      <TableHead>Letters</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.filter(emp => emp.status === 'active').map((employee) => {
                      const letterCount = bankLetters.filter(l => l.employeeId === employee.id).length
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.empId}</TableCell>
                          <TableCell>{employee.fullName}</TableCell>
                          <TableCell>{employee.designation}</TableCell>
                          <TableCell>{employee.nationality}</TableCell>
                          <TableCell>MVR {employee.monthlyBasicSalary.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{letterCount} letter{letterCount !== 1 ? 's' : ''}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEmployee(employee)
                                setNewLetter(prev => ({ ...prev, employeeId: employee.id }))
                                setIsLetterDialogOpen(true)
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Generate Letter
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Letter Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bank Letter Details</DialogTitle>
            <DialogDescription>
              View letter information and print if needed
            </DialogDescription>
          </DialogHeader>
          
          {selectedLetter && (
            <div className="space-y-4">
              {(() => {
                const employee = employees.find(emp => emp.id === selectedLetter.employeeId)
                const bank = banks.find(b => b.id === selectedLetter.bankId)
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Letter ID</Label>
                        <div className="font-medium">{selectedLetter.id}</div>
                      </div>
                      <div>
                        <Label>Date</Label>
                        <div className="font-medium">{selectedLetter.letterDate}</div>
                      </div>
                      <div>
                        <Label>Employee</Label>
                        <div className="font-medium">{employee?.fullName}</div>
                        <div className="text-sm text-muted-foreground">{employee?.empId}</div>
                      </div>
                      <div>
                        <Label>Bank</Label>
                        <div className="font-medium">{bank?.fullName}</div>
                      </div>
                      <div>
                        <Label>Letter Type</Label>
                        <div className="font-medium">{getLetterTypeLabel(selectedLetter.letterType)}</div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge className={getStatusColor(selectedLetter.status)}>
                          {getStatusLabel(selectedLetter.status)}
                        </Badge>
                      </div>
                    </div>

                    {employee && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Employee Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Passport:</span> {employee.passportNumber}</div>
                          <div><span className="font-medium">Work Permit:</span> {employee.workPermitNumber}</div>
                          <div><span className="font-medium">Monthly Salary:</span> MVR {employee.monthlyBasicSalary.toLocaleString()}</div>
                          <div><span className="font-medium">Annual Income:</span> MVR {employee.annualGrossIncome.toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintLetter}>
              <Printer className="h-4 w-4 mr-2" />
              Print Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}