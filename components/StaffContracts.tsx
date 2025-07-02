"use client"

import React, { useState } from 'react'
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
import { 
  FileText, User, Search, Plus, Eye, Edit3, Download, 
  Printer, Copy, RefreshCw, Calendar, MapPin, Building2,
  Globe, Users, Clock, CheckCircle, AlertCircle, Hash,
  Languages, FileDown, Send, Mail, Briefcase, Star
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface ContractTemplate {
  id: string
  name: string
  type: 'xpat-senior' | 'xpat-senior-renewal' | 'xpat-junior' | 'xpat-junior-renewal' | 'maldivian'
  version: string
  lastUpdated: string
  isActive: boolean
  hasTranslation: boolean
}

interface EmployeeContract {
  id: string
  employeeId: string
  employeeName: string
  contractType: string
  status: 'draft' | 'pending' | 'signed' | 'active' | 'expired'
  startDate: string
  endDate: string
  salary: string
  position: string
  department: string
  createdDate: string
  signedDate?: string
}

interface Employee {
  id: string
  name: string
  position: string
  department: string
  nationality: string
  joinDate: string
  currentSalary: string
  contractStatus: 'none' | 'active' | 'expired'
}

export function StaffContracts() {
  const [selectedTab, setSelectedTab] = useState('create')
  const [selectedContractType, setSelectedContractType] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewContract, setPreviewContract] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock contract templates
  const contractTemplates: ContractTemplate[] = [
    {
      id: '1',
      name: 'XPAT Senior Employment Contract',
      type: 'xpat-senior',
      version: '2024.1',
      lastUpdated: '2024-01-15',
      isActive: true,
      hasTranslation: false
    },
    {
      id: '2',
      name: 'XPAT Senior Contract Renewal',
      type: 'xpat-senior-renewal',
      version: '2024.1',
      lastUpdated: '2024-01-15',
      isActive: true,
      hasTranslation: false
    },
    {
      id: '3',
      name: 'XPAT Junior Employment Contract',
      type: 'xpat-junior',
      version: '2024.1',
      lastUpdated: '2024-01-15',
      isActive: true,
      hasTranslation: true
    },
    {
      id: '4',
      name: 'XPAT Junior Contract Renewal',
      type: 'xpat-junior-renewal',
      version: '2024.1',
      lastUpdated: '2024-01-15',
      isActive: true,
      hasTranslation: true
    },
    {
      id: '5',
      name: 'Maldivian Employment Contract',
      type: 'maldivian',
      version: '2024.1',
      lastUpdated: '2024-01-15',
      isActive: true,
      hasTranslation: false
    }
  ]

  // Mock employee contracts
  const [employeeContracts] = useState<EmployeeContract[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'Ahmed Hassan',
      contractType: 'XPAT Senior Contract',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2026-01-14',
      salary: '$3,500',
      position: 'Site Engineer',
      department: 'Engineering',
      createdDate: '2024-01-10',
      signedDate: '2024-01-15'
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Rajesh Kumar',
      contractType: 'XPAT Junior Contract',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2026-01-31',
      salary: '$1,800',
      position: 'Electrician',
      department: 'Electrical',
      createdDate: '2024-01-25',
      signedDate: '2024-02-01'
    }
  ])

  // Mock employee data
  const mockEmployees: Employee[] = [
    {
      id: 'EMP001',
      name: 'Ahmed Hassan',
      position: 'Site Engineer',
      department: 'Engineering',
      nationality: 'Bangladesh',
      joinDate: '2024-01-15',
      currentSalary: '$3,500',
      contractStatus: 'active'
    },
    {
      id: 'EMP003',
      name: 'Mohammad Ali',
      position: 'Construction Worker',
      department: 'Construction',
      nationality: 'Nepal',
      joinDate: '2024-03-01',
      currentSalary: '$1,200',
      contractStatus: 'none'
    }
  ]

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'xpat-senior':
      case 'xpat-senior-renewal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'xpat-junior':
      case 'xpat-junior-renewal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'maldivian':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'xpat-senior':
        return 'XPAT Senior Contract'
      case 'xpat-senior-renewal':
        return 'XPAT Senior Renewal'
      case 'xpat-junior':
        return 'XPAT Junior Contract'
      case 'xpat-junior-renewal':
        return 'XPAT Junior Renewal'
      case 'maldivian':
        return 'Maldivian Contract'
      default:
        return type
    }
  }

  const handleEmployeeSearch = () => {
    const employee = mockEmployees.find(emp => emp.id === employeeId.toUpperCase())
    if (employee) {
      setSelectedEmployee(employee)
      toast.success(`Employee found: ${employee.name}`)
    } else {
      toast.error('Employee not found')
      setSelectedEmployee(null)
    }
  }

  const generateContractPreview = (type: string, employee: Employee) => {
    const isJunior = type.includes('junior')
    const isRenewal = type.includes('renewal')
    
    let template = `
EMPLOYMENT CONTRACT
${getContractTypeLabel(type).toUpperCase()}

This Employment Contract ("Contract") is entered into between:

EMPLOYER: Construction Company Maldives Ltd.
Address: Male', Republic of Maldives

EMPLOYEE: ${employee.name}
Employee ID: ${employee.id}
Position: ${employee.position}
Department: ${employee.department}
Nationality: ${employee.nationality}

TERMS AND CONDITIONS:

1. EMPLOYMENT PERIOD
${isRenewal ? 'This contract renews the previous employment agreement.' : 'This is a new employment contract.'}
The employment shall commence on [START_DATE] and shall continue for a period of two (2) years, ending on [END_DATE].

2. POSITION AND DUTIES
The Employee is employed as ${employee.position} in the ${employee.department} department.
The Employee shall perform duties as assigned by the Company.

3. COMPENSATION
Monthly Salary: ${employee.currentSalary}
Payment shall be made monthly in Maldivian Rufiyaa or USD as per company policy.

4. WORKING HOURS
Normal working hours are 8 hours per day, 6 days per week.
Overtime work may be required as per project needs.

5. ACCOMMODATION
${type.includes('xpat') ? 'Company will provide suitable accommodation.' : 'Employee responsible for own accommodation.'}

6. LEAVE ENTITLEMENT
Annual leave: ${employee.nationality === 'Maldivian' ? '30 days' : employee.nationality === 'Indian' || employee.nationality === 'Sri Lankan' ? '30 days annually' : '60 days every 2 years'}

7. TERMINATION
Either party may terminate this contract with 30 days written notice.

This contract is governed by the laws of the Republic of Maldives.

Signatures:
Employee: _________________________ Date: _________
Employer: _________________________ Date: _________
`

    if (isJunior) {
      // Add translations for junior contracts
      template += `

------- TRANSLATION / ترجمه -------

চুক্তি কর্মসংস্থান
${getContractTypeLabel(type).toUpperCase()} (বাংলা অনুবাদ)

এই কর্মসংস্থান চুক্তি ("চুক্তি") এর মধ্যে সম্পাদিত হয়:

নিয়োগকর্তা: কনস্ট্রাকশন কোম্পানি মালদ্বীপ লিমিটেড
ঠিকানা: মালে', মালদ্বীপ প্রজাতন্ত্র

কর্মচারী: ${employee.name}
কর্মচারী আইডি: ${employee.id}
পদ: ${employee.position}
বিভাগ: ${employee.department}
জাতীয়তা: ${employee.nationality}

শর্তাবলী:

১. কর্মসংস্থানের সময়কাল
${isRenewal ? 'এই চুক্তি পূর্ববর্তী কর্মসংস্থান চুক্তি নবায়ন করে।' : 'এটি একটি নতুন কর্মসংস্থান চুক্তি।'}
কর্মসংস্থান [শুরুর তারিখ] থেকে শুরু হবে এবং দুই (২) বছরের জন্য অব্যাহত থাকবে।

२. पद और कर्तव्य (हिंदी)
कर्मचारी ${employee.department} विभाग में ${employee.position} के रूप में नियोজित है।
कर्मचारी कंपनी द्वारा सौंपे गए कर्तव्यों का पालन करेगा।

३. मुआवजा
मासिक वेतन: ${employee.currentSalary}
भुगतान कंपनी की नीति के अनुसार मासिक आधार पर मालदीवियन रुफिया या USD में किया जाएगा।

[Additional translations for all major sections would be included for Junior contracts]
`
    }

    return template
  }

  const handleCreateContract = async () => {
    if (!selectedEmployee || !selectedContractType) {
      toast.error('Please select employee and contract type')
      return
    }

    setIsCreating(true)
    try {
      // Simulate contract creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const contractPreview = generateContractPreview(selectedContractType, selectedEmployee)
      setPreviewContract(contractPreview)
      setIsPreviewOpen(true)
      
      toast.success('Contract generated successfully')
    } catch (error) {
      toast.error('Failed to create contract')
    } finally {
      setIsCreating(false)
    }
  }

  const filteredContracts = employeeContracts.filter(contract => 
    searchQuery === '' || 
    contract.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.contractType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Employment Contracts</h1>
          <p className="text-muted-foreground">
            Create and manage employment contracts for all staff types
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Contracts
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Contract</TabsTrigger>
          <TabsTrigger value="templates">Contract Templates</TabsTrigger>
          <TabsTrigger value="active">Active Contracts</TabsTrigger>
          <TabsTrigger value="history">Contract History</TabsTrigger>
        </TabsList>

        {/* Create Contract Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Employment Contract
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate employment contracts by entering Employee ID and selecting contract type
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employee Search */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="employeeId"
                        placeholder="Enter Employee ID (e.g., EMP001)"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleEmployeeSearch} disabled={!employeeId}>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedEmployee && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-muted rounded-lg"
                  >
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Employee Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label>Name</Label>
                        <div className="font-medium">{selectedEmployee.name}</div>
                      </div>
                      <div>
                        <Label>Position</Label>
                        <div>{selectedEmployee.position}</div>
                      </div>
                      <div>
                        <Label>Department</Label>
                        <div>{selectedEmployee.department}</div>
                      </div>
                      <div>
                        <Label>Nationality</Label>
                        <div>{selectedEmployee.nationality}</div>
                      </div>
                      <div>
                        <Label>Current Salary</Label>
                        <div>{selectedEmployee.currentSalary}</div>
                      </div>
                      <div>
                        <Label>Contract Status</Label>
                        <Badge className={getStatusColor(selectedEmployee.contractStatus)}>
                          {selectedEmployee.contractStatus}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator />

              {/* Contract Type Selection */}
              <div className="space-y-4">
                <Label>Contract Type</Label>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {contractTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all ${
                        selectedContractType === template.type 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedContractType(template.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <Badge className={getContractTypeColor(template.type)}>
                              {getContractTypeLabel(template.type)}
                            </Badge>
                          </div>
                          {template.hasTranslation && (
                            <Languages className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Version {template.version} • {template.lastUpdated}
                        </p>
                        {template.hasTranslation && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            Includes translations for international staff
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Contract Details Form */}
              {selectedEmployee && selectedContractType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Separator />
                  <h4 className="font-medium">Contract Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salary">Monthly Salary</Label>
                      <Input id="salary" placeholder="e.g., $2,500" defaultValue={selectedEmployee.currentSalary} />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select defaultValue="usd">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="mvr">MVR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialTerms">Special Terms (Optional)</Label>
                    <Textarea 
                      id="specialTerms" 
                      placeholder="Enter any special terms or conditions for this contract..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateContract} 
                      disabled={isCreating}
                      className="flex-1"
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating Contract...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Contract
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage and update employment contract templates
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {template.name}
                          {template.hasTranslation && (
                            <Languages className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Version {template.version} • Updated {template.lastUpdated}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getContractTypeColor(template.type)}>
                        {getContractTypeLabel(template.type)}
                      </Badge>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Contracts Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Employment Contracts</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <div className="font-medium">{contract.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {contract.employeeId} • {contract.position} • {contract.department}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contract.startDate} - {contract.endDate} • {contract.salary}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getContractTypeColor(contract.contractType.toLowerCase().replace(' ', '-'))}>
                        {contract.contractType}
                      </Badge>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract History</CardTitle>
              <p className="text-sm text-muted-foreground">
                View all contracts including expired and terminated contracts
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Contract History</h3>
                <p className="text-sm text-muted-foreground">
                  Historical contracts and renewals will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contract Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Preview</DialogTitle>
            <DialogDescription>
              Review the generated employment contract before finalizing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{previewContract}</pre>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Contract
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send for Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}