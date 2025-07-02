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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
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
  Edit3,
  Trash2,
  UserPlus,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  Clock,
  Award,
  Shield,
  AlertCircle,
  CheckCircle,
  Settings,
  Filter,
  MoreHorizontal,
  Star,
  Flag,
  Globe,
  IdCard,
  CreditCard,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  FileWarning,
  Plus,
  Send,
  Printer,
  Copy,
  ExternalLink,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData, Employee, DisciplinaryLetterRecord } from './HRDataContext'
import { DisciplinaryLetterTemplate } from './DisciplinaryLetterTemplate'
import companyLogo from 'figma:asset/d83549437e0333f9bcf277429e95d8b2e95a2647.png'

interface EmployeeForm {
  name: string
  email: string
  phone: string
  nationality: string
  department: string
  designation: string
  salary: string
  passportNumber: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  address: string
  manager: string
  workLocation: string
  contractType: string
  bankAccount: string
  skills: string
}

interface DisciplinaryLetterForm {
  letterType: 'warning' | 'written-warning' | 'final-warning' | 'suspension-notice' | 'improvement-notice'
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  subject: string
  description: string
  incidentDate: string
  fineAmount: string
  notes: string
}

type SortField = 'name' | 'empId' | 'department' | 'designation' | 'joinDate' | 'salary' | 'status'
type SortDirection = 'asc' | 'desc'

export function EmployeeRegister() {
  // Use shared HR data context
  const {
    employees,
    setEmployees,
    getEmployee,
    updateEmployee,
    addEmployee,
    getDisciplinaryLettersForEmployee,
    createDisciplinaryLetterForEmployee
  } = useHRData()

  // Core state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  
  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDisciplinaryDialog, setShowDisciplinaryDialog] = useState(false)
  const [showLetterPreviewDialog, setShowLetterPreviewDialog] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<DisciplinaryLetterRecord | null>(null)
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('empId')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    department: '',
    designation: '',
    salary: '',
    passportNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    address: '',
    manager: '',
    workLocation: '',
    contractType: '',
    bankAccount: '',
    skills: ''
  })

  const [disciplinaryForm, setDisciplinaryForm] = useState<DisciplinaryLetterForm>({
    letterType: 'warning',
    severity: 'minor',
    subject: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    fineAmount: '',
    notes: ''
  })

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEmployees = employees.length
    const activeEmployees = employees.filter(e => e.status === 'active').length
    const onLeave = employees.filter(e => e.status === 'on-leave').length
    const withDisciplinaryRecords = employees.filter(e => e.disciplinaryRecords > 0).length
    const avgSalary = Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / totalEmployees)
    
    // Department breakdown
    const departmentBreakdown = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalEmployees,
      activeEmployees,
      onLeave,
      withDisciplinaryRecords,
      avgSalary,
      departmentBreakdown
    }
  }, [employees])

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(employees.map(e => e.department))]
    return departments.sort()
  }, [employees])

  // Filtering and sorting logic
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.designation.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
      
      return matchesSearch && matchesDepartment && matchesStatus
    })

    // Sort employees
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'joinDate') {
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
  }, [employees, searchQuery, departmentFilter, statusFilter, sortField, sortDirection])

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

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'on-leave': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'suspended': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'terminated': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'resigned': return 'bg-gray-500/10 text-gray-700 border-gray-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const handleCreateEmployee = useCallback(async () => {
    if (!employeeForm.name || !employeeForm.email || !employeeForm.department) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate new employee ID
      const nextId = Math.max(...employees.map(e => parseInt(e.empId.substring(3)))) + 1
      const empId = `EMP${nextId.toString().padStart(3, '0')}`

      const newEmployee: Employee = {
        id: Date.now().toString(),
        empId,
        name: employeeForm.name,
        email: employeeForm.email,
        phone: employeeForm.phone,
        nationality: employeeForm.nationality,
        department: employeeForm.department,
        designation: employeeForm.designation,
        joinDate: new Date().toISOString().split('T')[0],
        salary: parseInt(employeeForm.salary),
        status: 'active',
        passportNumber: employeeForm.passportNumber,
        visaStatus: 'pending',
        emergencyContact: {
          name: employeeForm.emergencyContactName,
          phone: employeeForm.emergencyContactPhone,
          relationship: employeeForm.emergencyContactRelationship
        },
        address: employeeForm.address,
        manager: employeeForm.manager,
        workLocation: employeeForm.workLocation,
        contractType: employeeForm.contractType as 'permanent' | 'temporary' | 'contractor',
        bankAccount: employeeForm.bankAccount,
        skills: employeeForm.skills.split(',').map(s => s.trim()),
        performance: {
          rating: 0,
          lastReview: '',
          nextReview: ''
        },
        disciplinaryRecords: 0,
        leaveBalance: {
          annual: 22,
          sick: 15,
          emergency: 5
        },
        documents: {
          passport: false,
          visa: false,
          workPermit: false,
          medical: false,
          contract: false
        },
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      addEmployee(newEmployee)
      setShowCreateDialog(false)
      setEmployeeForm({
        name: '',
        email: '',
        phone: '',
        nationality: '',
        department: '',
        designation: '',
        salary: '',
        passportNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        address: '',
        manager: '',
        workLocation: '',
        contractType: '',
        bankAccount: '',
        skills: ''
      })
      
      toast.success(`Employee ${empId} created successfully`)

    } catch (error) {
      toast.error('Failed to create employee. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [employeeForm, employees, addEmployee])

  const handleCreateDisciplinaryLetter = useCallback(async () => {
    if (!selectedEmployee || !disciplinaryForm.subject || !disciplinaryForm.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const letterId = await createDisciplinaryLetterForEmployee(selectedEmployee.id, {
        letterType: disciplinaryForm.letterType,
        severity: disciplinaryForm.severity,
        subject: disciplinaryForm.subject,
        description: disciplinaryForm.description,
        incidentDate: disciplinaryForm.incidentDate,
        fineAmount: disciplinaryForm.fineAmount ? parseFloat(disciplinaryForm.fineAmount) : undefined,
        hrNotes: disciplinaryForm.notes,
        issuedBy: 'Current User'
      })

      setShowDisciplinaryDialog(false)
      setDisciplinaryForm({
        letterType: 'warning',
        severity: 'minor',
        subject: '',
        description: '',
        incidentDate: new Date().toISOString().split('T')[0],
        fineAmount: '',
        notes: ''
      })
      
      toast.success(`Disciplinary letter created for ${selectedEmployee.name}`)

    } catch (error) {
      toast.error('Failed to create disciplinary letter. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmployee, disciplinaryForm, createDisciplinaryLetterForEmployee])

  const handlePrintLetter = useCallback((letter: DisciplinaryLetterRecord) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const employee = getEmployee(letter.employeeId)
    if (!employee) return

    const letterContent = `
      <html>
        <head>
          <title>Disciplinary Letter - ${letter.referenceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Poppins', Arial, sans-serif;
                width: 210mm;
                height: 297mm;
                overflow: hidden;
                background: white !important;
                color: black !important;
              }
              
              .no-print { display: none !important; }
              
              .a4-page {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 20mm;
                box-sizing: border-box;
                position: relative;
                background: white !important;
                color: black !important;
                display: flex;
                flex-direction: column;
                transform: none !important;
              }
              
              .letterhead {
                margin-bottom: 4mm;
                position: relative;
                padding-bottom: 10mm;
              }
              
              .logo-container {
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                margin-bottom: 6mm;
                width: 100%;
              }
              
              .company-logo {
                max-height: 30mm;
                width: auto;
                margin: 0 auto;
                display: block;
              }
              
              .company-info {
                text-align: center;
                font-size: 11px;
                line-height: 1.4;
                color: #333 !important;
                font-family: 'Poppins', Arial, sans-serif;
              }
              
              .company-name {
                font-weight: 600;
                font-size: 12px;
                margin-bottom: 3px;
                color: #333 !important;
              }
              
              .separator-line {
                width: 100%;
                height: 1px;
                background: #ddd !important;
                margin: 2mm 0 3mm 0;
              }
              
              .content-wrapper {
                flex: 1;
                display: flex;
                flex-direction: column;
                position: relative;
              }
              
              .ref-date {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8mm;
              }
              
              .letter-title { 
                font-size: 18px; 
                font-weight: 600; 
                text-decoration: underline; 
                margin: 0 0 8mm; 
                text-align: center; 
                font-family: 'Poppins', Arial, sans-serif;
                color: #dc2626 !important; 
              }
              
              .content { 
                font-size: 10px; 
                line-height: 1.6; 
                font-family: 'Poppins', Arial, sans-serif; 
                text-align: justify; 
                flex: 1;
                color: black !important;
              }
              
              .note-section { 
                background: #f3f4f6 !important; 
                padding: 10px; 
                border-radius: 5px; 
                margin: 12px 0; 
              }
              
              .signatures { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 30px; 
                margin-top: 30px; 
              }
              
              .signature-section { }
              .signature-line { border-bottom: 1px solid black !important; padding-bottom: 5px; margin-bottom: 10px; }
              .signature-details { font-size: 9px; }
              
              .fine-structure { 
                margin-top: 40mm; 
                padding-top: 20mm; 
                border-top: 2px solid #ccc !important; 
              }
              
              .fine-title { 
                text-align: center; 
                font-weight: 600; 
                font-size: 14px; 
                margin-bottom: 15px; 
              }
              
              .fine-list { 
                background: #f9f9f9 !important; 
                padding: 15px; 
                border-radius: 5px; 
              }
              
              .fine-item { 
                display: flex; 
                justifyContent: space-between; 
                padding: 3px 0; 
                border-bottom: 1px solid #e5e5e5 !important; 
                font-size: 9px; 
              }
              
              /* Ensure all text elements are black for print */
              * {
                color: black !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="a4-page">
            <!-- Professional Letterhead - Same as Offer Letter -->
            <div class="letterhead">
              <!-- Logo Section -->
              <div class="logo-container">
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMWU0MGFmIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UkNDPC90ZXh0Pgo8L3N2Zz4K" 
                  alt="Rasheed Carpentry & Construction" 
                  class="company-logo"
                />
              </div>
              
              <!-- Company Information -->
              <div class="company-info">
                <div class="company-name">Human Resource Department</div>
              </div>
              
              <!-- Separator Line -->
              <div class="separator-line"></div>
            </div>

            <!-- Content Wrapper -->
            <div class="content-wrapper">
              <!-- Reference and Date -->
              <div class="ref-date">
                <div><strong>${letter.referenceNumber}</strong></div>
                <div><strong>${new Date(letter.letterDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\d+)/, '$1' + (['st', 'nd', 'rd'][new Date(letter.letterDate).getDate() - 1] || 'th'))}</strong></div>
              </div>

              <!-- Letter Type Title -->
              <div class="letter-title">
                ${letter.letterType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>

              <!-- Letter Content -->
              <div class="content">
                <div style="margin-bottom: 12px;">
                  This notice is given to <strong>Mr. ${letter.employeeName}</strong> (ID number: <strong>${letter.empId}</strong>) who works as a <strong>${letter.designation}</strong>, it has come to our attention that ${letter.description}
                </div>

                <div style="margin-bottom: 12px;">
                  We would like to remind you that this behavior is strictly prohibited and goes against the company's policies and code of conduct. Our company does not appreciate such unprofessional conduct from its employees. All the staff are informed and advised to follow company rules.
                </div>

                ${letter.letterType === 'final-warning' ? `
                  <div style="margin-bottom: 12px;">
                    Since you have failed to obey company rules and regulations, consider this as your <strong>Final written warning</strong>.${letter.fineAmount ? ` and <strong>MVR ${letter.fineAmount.toFixed(2)}</strong> will be deducted as a fine.` : ''}
                  </div>
                ` : letter.fineAmount ? `
                  <div style="margin-bottom: 12px;">
                    As per company policy, <strong>MVR ${letter.fineAmount.toFixed(2)}</strong> will be deducted as a fine for this violation.
                  </div>
                ` : ''}

                <div style="margin-bottom: 12px;">
                  Please be advised that if you fail to follow company rules and regulations, you will be subject to further disciplinary actions.
                </div>

                <!-- Bilingual Note -->
                <div class="note-section">
                  <div style="font-weight: 600; margin-bottom: 6px;">
                    <strong>Note:</strong> Please read and understand the statements mentioned above before signing.
                  </div>
                  <div style="font-size: 9px; color: #666;">
                    <strong>कृपया हस्ताक्षर करने से पहले ऊपर उल्लिखित कथनों को पढ़ें और समझें</strong>
                  </div>
                </div>

                <!-- Acknowledgment Section -->
                <div style="margin: 20px 0;">
                  <div style="font-weight: 600; margin-bottom: 8px;">
                    Written Warning Received:
                  </div>
                  <div style="border-bottom: 2px solid black; width: 100%; margin: 12px 0;"></div>
                </div>

                <!-- Signatures Section -->
                <div class="signatures">
                  <!-- HR Manager Signature -->
                  <div class="signature-section">
                    <div class="signature-line">N.B Rajanayaka</div>
                    <div class="signature-details">
                      <div style="font-weight: 600;">Human Resource Manager</div>
                      <div>+960 3317878</div>
                    </div>
                  </div>

                  <!-- Employee Signature -->
                  <div class="signature-section">
                    <div style="margin-bottom: 15px;">
                      <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <span style="width: 50px; font-weight: 600; font-size: 9px;">Sign:</span>
                        <div style="flex: 1; border-bottom: 1px solid black; margin-left: 10px;"></div>
                      </div>
                      <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <span style="width: 50px; font-weight: 600; font-size: 9px;">Name:</span>
                        <span style="margin-left: 10px; font-weight: 600; font-size: 9px;">${letter.employeeName}</span>
                      </div>
                      <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <span style="width: 50px; font-weight: 600; font-size: 9px;">Staff ID:</span>
                        <span style="margin-left: 10px; font-weight: 600; font-size: 9px;">${letter.empId}</span>
                      </div>
                      <div style="display: flex; align-items: center;">
                        <span style="width: 50px; font-weight: 600; font-size: 9px;">Date:</span>
                        <span style="margin-left: 10px; font-weight: 600; font-size: 9px;">${new Date(letter.letterDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\d+)/, '$1' + (['st', 'nd', 'rd'][new Date(letter.letterDate).getDate() - 1] || 'th'))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fine Structure Reference -->
            <div class="fine-structure">
              <div class="fine-title">RCC CONSTRUCTION - DISCIPLINARY FINE STRUCTURE</div>
              <div class="fine-list">
                <div style="font-weight: 600; margin-bottom: 12px; color: #1e40af; font-size: 11px;">Below are fines:</div>
                <div style="font-size: 9px;">
                  <div class="fine-item"><span>• Absent without valid reason after warnings</span><span style="font-weight: 600;">200.00 MVR</span></div>
                  <div class="fine-item"><span>• Going early from the site / work place after warnings</span><span style="font-weight: 600;">300.00 MVR</span></div>
                  <div class="fine-item"><span>• Drinking alcohol in Accommodation</span><span style="font-weight: 600;">750.00 MVR</span></div>
                  <div class="fine-item"><span>• Sign in the sheet and leaving the site after warnings</span><span style="font-weight: 600;">200.00 MVR</span></div>
                  <div class="fine-item"><span>• Staying in room and not going consultation after warnings</span><span style="font-weight: 600;">200.00 MVR</span></div>
                  <div class="fine-item"><span>• Not following the rules while driving</span><span style="font-weight: 600;">300.00 MVR</span></div>
                  <div class="fine-item"><span>• Using mobile phone in site</span><span style="font-weight: 600;">250.00 MVR</span></div>
                  <div class="fine-item"><span>• Not following the supervisor instruction</span><span style="font-weight: 600;">250.00 MVR</span></div>
                  <div class="fine-item"><span>• Smoking in the site</span><span style="font-weight: 600;">300.00 MVR</span></div>
                  <div class="fine-item"><span>• Not using the safety kit properly</span><span style="font-weight: 600;">300.00 MVR</span></div>
                  <div class="fine-item"><span>• Not maintaining proper hygiene</span><span style="font-weight: 600;">200.00 MVR</span></div>
                  <div class="fine-item"><span>• Throwing waste in the site</span><span style="font-weight: 600;">200.00 MVR</span></div>
                  <div class="fine-item"><span>• Missing machinery tools in site due to careless</span><span style="font-weight: 600;">Machinery tool cost</span></div>
                  <div class="fine-item"><span>• Sleeping in work site after warnings</span><span style="font-weight: 600;">200.00 MVR</span></div>
                  <div class="fine-item"><span>• Site accidents due to careless</span><span style="font-weight: 600;">500.00 MVR</span></div>
                  <div class="fine-item"><span>• Conflict with coworkers inside the accommodation</span><span style="font-weight: 600;">1000.00 MVR</span></div>
                  <div class="fine-item"><span>• Conflict with coworkers outside the accommodation</span><span style="font-weight: 600;">1500.00 MVR</span></div>
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(letterContent)
    printWindow.document.close()
    
    toast.success('Disciplinary letter sent to printer')
  }, [getEmployee])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Employee Register
          </h1>
          <p className="text-muted-foreground">
            Comprehensive employee management with disciplinary tracking • {filteredAndSortedEmployees.length} employee{filteredAndSortedEmployees.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.onLeave}</div>
            <p className="text-xs text-muted-foreground">
              Temporary absence
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinary Records</CardTitle>
            <FileWarning className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.withDisciplinaryRecords}</div>
            <p className="text-xs text-muted-foreground">
              Employees with records
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">MVR {summaryStats.avgSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Monthly average
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
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredAndSortedEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No employees found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search filters to find employees.'
                    : 'No employees have been registered yet. Add your first employee to get started.'}
                </p>
              </div>
              {!searchQuery && departmentFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Employee
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('empId')} className="h-auto p-0 font-medium">
                    Employee ID {getSortIcon('empId')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-medium">
                    Name {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('department')} className="h-auto p-0 font-medium">
                    Department {getSortIcon('department')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('designation')} className="h-auto p-0 font-medium">
                    Designation {getSortIcon('designation')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('joinDate')} className="h-auto p-0 font-medium">
                    Join Date {getSortIcon('joinDate')}
                  </Button>
                </TableHead>
                <TableHead>Disciplinary</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-medium">
                    Status {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {employee.empId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {employee.disciplinaryRecords > 0 ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          <FileWarning className="h-3 w-3 mr-1" />
                          {employee.disciplinaryRecords} record{employee.disciplinaryRecords !== 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Clean
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {employee.status === 'on-leave' && <Clock className="h-3 w-3 mr-1" />}
                      {employee.status === 'suspended' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowDisciplinaryDialog(true)
                        }}
                      >
                        <FileWarning className="h-3 w-3 mr-1" />
                        Letter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Disciplinary Letter Dialog */}
      <Dialog open={showDisciplinaryDialog} onOpenChange={setShowDisciplinaryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Disciplinary Letter</DialogTitle>
            <DialogDescription>
              Create a disciplinary letter for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedEmployee && (
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                    <AvatarFallback>{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedEmployee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedEmployee.empId} • {selectedEmployee.designation}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Current Disciplinary Records:</span>
                    <span className={selectedEmployee.disciplinaryRecords > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                      {selectedEmployee.disciplinaryRecords} record{selectedEmployee.disciplinaryRecords !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="letterType">Letter Type *</Label>
                  <Select value={disciplinaryForm.letterType} onValueChange={(value) => setDisciplinaryForm(prev => ({ ...prev, letterType: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="written-warning">Written Warning</SelectItem>
                      <SelectItem value="final-warning">Final Warning</SelectItem>
                      <SelectItem value="suspension-notice">Suspension Notice</SelectItem>
                      <SelectItem value="improvement-notice">Improvement Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select value={disciplinaryForm.severity} onValueChange={(value) => setDisciplinaryForm(prev => ({ ...prev, severity: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={disciplinaryForm.subject}
                  onChange={(e) => setDisciplinaryForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of the violation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={disciplinaryForm.description}
                  onChange={(e) => setDisciplinaryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the violation and circumstances..."
                  rows={4}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Incident Date *</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={disciplinaryForm.incidentDate}
                    onChange={(e) => setDisciplinaryForm(prev => ({ ...prev, incidentDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fineAmount">Fine Amount (MVR)</Label>
                  <Input
                    id="fineAmount"
                    type="number"
                    step="0.01"
                    value={disciplinaryForm.fineAmount}
                    onChange={(e) => setDisciplinaryForm(prev => ({ ...prev, fineAmount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">HR Notes</Label>
                <Textarea
                  id="notes"
                  value={disciplinaryForm.notes}
                  onChange={(e) => setDisciplinaryForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for HR records..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDisciplinaryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDisciplinaryLetter} disabled={isLoading || !disciplinaryForm.subject || !disciplinaryForm.description}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Letter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Employee Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details - {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>
              Complete information for {selectedEmployee?.empId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                  <AvatarFallback>{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.designation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-mono">
                      {selectedEmployee.empId}
                    </Badge>
                    <Badge className={getStatusColor(selectedEmployee.status)}>
                      {selectedEmployee.status}
                    </Badge>
                    {selectedEmployee.disciplinaryRecords > 0 && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        <FileWarning className="h-3 w-3 mr-1" />
                        {selectedEmployee.disciplinaryRecords} disciplinary record{selectedEmployee.disciplinaryRecords !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="employment">Employment</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="disciplinary">
                    <div className="flex items-center gap-1">
                      Disciplinary
                      {selectedEmployee.disciplinaryRecords > 0 && (
                        <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                          {selectedEmployee.disciplinaryRecords}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.email}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.phone}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Nationality</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.nationality}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Passport Number</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <IdCard className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.passportNumber}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Emergency Contact</Label>
                    <div className="mt-2 p-3 bg-muted/20 rounded-lg">
                      <div className="grid gap-2 md:grid-cols-3">
                        <div>
                          <span className="text-sm font-medium">Name:</span>
                          <div>{selectedEmployee.emergencyContact.name}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Phone:</span>
                          <div>{selectedEmployee.emergencyContact.phone}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Relationship:</span>
                          <div>{selectedEmployee.emergencyContact.relationship}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="employment" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Department</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.department}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Designation</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.designation}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Join Date</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(selectedEmployee.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Monthly Salary</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>MVR {selectedEmployee.salary.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Manager</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.manager}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Work Location</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.workLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedEmployee.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Leave Balance</Label>
                    <div className="grid gap-3 md:grid-cols-3 mt-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-700">Annual</div>
                        <div className="text-2xl font-bold text-blue-800">{selectedEmployee.leaveBalance.annual}</div>
                        <div className="text-xs text-blue-600">days remaining</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-700">Sick</div>
                        <div className="text-2xl font-bold text-green-800">{selectedEmployee.leaveBalance.sick}</div>
                        <div className="text-xs text-green-600">days remaining</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm font-medium text-orange-700">Emergency</div>
                        <div className="text-2xl font-bold text-orange-800">{selectedEmployee.leaveBalance.emergency}</div>
                        <div className="text-xs text-orange-600">days remaining</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="performance" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Performance Rating</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{selectedEmployee.performance.rating}/5.0</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= selectedEmployee.performance.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Contract Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{selectedEmployee.contractType}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Last Review</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedEmployee.performance.lastReview 
                            ? new Date(selectedEmployee.performance.lastReview).toLocaleDateString()
                            : 'Not conducted yet'
                          }
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Next Review</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedEmployee.performance.nextReview 
                            ? new Date(selectedEmployee.performance.nextReview).toLocaleDateString()
                            : 'Not scheduled'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <div className="grid gap-3">
                    {[
                      { key: 'passport', label: 'Passport', icon: IdCard },
                      { key: 'visa', label: 'Visa', icon: Plane },
                      { key: 'workPermit', label: 'Work Permit', icon: Shield },
                      { key: 'medical', label: 'Medical Certificate', icon: Heart },
                      { key: 'contract', label: 'Employment Contract', icon: FileText }
                    ].map(doc => {
                      const isUploaded = selectedEmployee.documents[doc.key as keyof typeof selectedEmployee.documents]
                      return (
                        <div key={doc.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <doc.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{doc.label}</span>
                          </div>
                          <Badge className={isUploaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {isUploaded ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Uploaded
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Missing
                              </>
                            )}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Visa Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <Badge className={selectedEmployee.visaStatus === 'valid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedEmployee.visaStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Work Permit</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.workPermitNumber || 'Not assigned'}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="disciplinary" className="space-y-4">
                  {(() => {
                    const disciplinaryLetters = getDisciplinaryLettersForEmployee(selectedEmployee.id)
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">Disciplinary History</h4>
                            <p className="text-sm text-muted-foreground">
                              {disciplinaryLetters.length} letter{disciplinaryLetters.length !== 1 ? 's' : ''} on record
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setShowDisciplinaryDialog(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            New Letter
                          </Button>
                        </div>

                        {disciplinaryLetters.length === 0 ? (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h4 className="font-medium text-green-700">Clean Record</h4>
                            <p className="text-sm text-green-600">No disciplinary actions on file</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {disciplinaryLetters.map((letter) => (
                              <Card key={letter.id} className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className="bg-red-100 text-red-800">
                                        {letter.letterType.replace('-', ' ')}
                                      </Badge>
                                      <Badge variant="outline">
                                        {letter.severity}
                                      </Badge>
                                      <Badge variant="outline" className="font-mono text-xs">
                                        {letter.referenceNumber}
                                      </Badge>
                                    </div>
                                    <h5 className="font-medium mb-1">{letter.subject}</h5>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {letter.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Issued: {new Date(letter.letterDate).toLocaleDateString()}</span>
                                      <span>Status: {letter.status}</span>
                                      {letter.fineAmount && <span>Fine: MVR {letter.fineAmount}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedLetter(letter)
                                        setShowLetterPreviewDialog(true)
                                      }}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePrintLetter(letter)}
                                    >
                                      <Printer className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4">
                  <div className="grid gap-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Quick Actions</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        <Button variant="outline" className="justify-start">
                          <FileWarning className="h-4 w-4 mr-2" />
                          Create Disciplinary Letter
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Employee Details
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Send className="h-4 w-4 mr-2" />
                          Send Notification
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Administrative Actions</h4>
                      <div className="grid gap-2">
                        <Button variant="outline" className="justify-start text-orange-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as On Leave
                        </Button>
                        <Button variant="outline" className="justify-start text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Suspend Employee
                        </Button>
                        <Button variant="outline" className="justify-start text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Terminate Employment
                        </Button>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Letter Preview Dialog */}
      <Dialog open={showLetterPreviewDialog} onOpenChange={setShowLetterPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disciplinary Letter Preview</DialogTitle>
            <DialogDescription>
              {selectedLetter?.referenceNumber} - {selectedLetter?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLetter && selectedEmployee && (
            <div className="border rounded-lg overflow-hidden">
              <DisciplinaryLetterTemplate
                employee={{
                  name: selectedEmployee.name,
                  empId: selectedEmployee.empId,
                  designation: selectedEmployee.designation
                }}
                letterType={selectedLetter.letterType}
                violation={selectedLetter.subject}
                description={selectedLetter.description}
                fineAmount={selectedLetter.fineAmount}
                incidentDate={selectedLetter.incidentDate}
                letterDate={selectedLetter.letterDate}
                referenceNumber={selectedLetter.referenceNumber}
                hrManager={{
                  name: 'N.B Rajanayaka',
                  phone: '+960 3317878'
                }}
                previousWarnings={getDisciplinaryLettersForEmployee(selectedEmployee.id).length > 1}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Employee Dialog - Keep existing implementation */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee record with complete information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="emergency">Emergency & Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={employeeForm.phone}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+960 777 1234"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Select value={employeeForm.nationality} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, nationality: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maldivian">Maldivian</SelectItem>
                        <SelectItem value="Indian">Indian</SelectItem>
                        <SelectItem value="Bangladeshi">Bangladeshi</SelectItem>
                        <SelectItem value="Pakistani">Pakistani</SelectItem>
                        <SelectItem value="Sri Lankan">Sri Lankan</SelectItem>
                        <SelectItem value="Filipino">Filipino</SelectItem>
                        <SelectItem value="British">British</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      value={employeeForm.passportNumber}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, passportNumber: e.target.value }))}
                      placeholder="Enter passport number"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={employeeForm.address}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter full address"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="employment" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={employeeForm.department} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={employeeForm.designation}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, designation: e.target.value }))}
                      placeholder="Enter job title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary (MVR)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={employeeForm.salary}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, salary: e.target.value }))}
                      placeholder="15000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type</Label>
                    <Select value={employeeForm.contractType} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, contractType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      value={employeeForm.manager}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, manager: e.target.value }))}
                      placeholder="Enter manager name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workLocation">Work Location</Label>
                    <Select value={employeeForm.workLocation} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, workLocation: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Head Office - Male">Head Office - Male</SelectItem>
                        <SelectItem value="Site A - Hulhumale">Site A - Hulhumale</SelectItem>
                        <SelectItem value="Site B - Vilimale">Site B - Vilimale</SelectItem>
                        <SelectItem value="Site C - Vilimale">Site C - Vilimale</SelectItem>
                        <SelectItem value="All Sites">All Sites</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Textarea
                      id="skills"
                      value={employeeForm.skills}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="Project Management, AutoCAD, Team Leadership"
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="emergency" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={employeeForm.emergencyContactName}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      placeholder="Enter contact name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={employeeForm.emergencyContactPhone}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      placeholder="+960 777 5678"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Select value={employeeForm.emergencyContactRelationship} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, emergencyContactRelationship: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Friend">Friend</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bank Account</Label>
                    <Input
                      id="bankAccount"
                      value={employeeForm.bankAccount}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                      placeholder="BML-1234567890"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEmployee} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}