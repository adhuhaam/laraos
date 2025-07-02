import React, { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseModal } from './BaseModal'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { 
  Search, 
  RefreshCw,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Eye,
  FileWarning,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Printer,
  Plus,
  Filter,
  BarChart3,
  TrendingUp,
  Building2,
  User,
  Send,
  Bookmark,
  Wand2,
  Download,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  X,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData, Employee, DisciplinaryLetterRecord } from './HRDataContext'
import { DisciplinaryLetterTemplate } from './DisciplinaryLetterTemplate'

type SortField = 'employeeName' | 'letterDate' | 'letterType' | 'severity' | 'status'
type SortDirection = 'asc' | 'desc'

export function DisciplinaryLetter() {
  const {
    employees,
    disciplinaryLetters,
    getEmployee,
    createDisciplinaryLetterForEmployee,
    updateDisciplinaryLetter
  } = useHRData()

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('letterDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedLetter, setSelectedLetter] = useState<DisciplinaryLetterRecord | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Enhanced preview states - matching OfferLetterGenerator
  const letterRef = useRef<HTMLDivElement>(null)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(0.7) // Default zoom for modal view

  // Form state
  const [letterForm, setLetterForm] = useState({
    employeeId: '',
    letterType: 'warning' as DisciplinaryLetterRecord['letterType'],
    severity: 'minor' as DisciplinaryLetterRecord['severity'],
    subject: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    fineAmount: '',
    notes: ''
  })

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalLetters = disciplinaryLetters.length
    const activeLetters = disciplinaryLetters.filter(l => ['issued', 'acknowledged', 'responded'].includes(l.status)).length
    const pendingAcknowledgment = disciplinaryLetters.filter(l => l.status === 'issued').length
    const thisMonthLetters = disciplinaryLetters.filter(l => 
      new Date(l.letterDate).getMonth() === new Date().getMonth()
    ).length
    
    return {
      totalLetters,
      activeLetters,
      pendingAcknowledgment,
      thisMonthLetters
    }
  }, [disciplinaryLetters])

  // Filtering and sorting logic
  const filteredAndSortedLetters = useMemo(() => {
    let filtered = disciplinaryLetters.filter(letter => {
      const matchesSearch = letter.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          letter.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          letter.subject.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDepartment = departmentFilter === 'all' || letter.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || letter.status === statusFilter
      
      return matchesSearch && matchesDepartment && matchesStatus
    })

    // Sort letters
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'letterDate') {
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
  }, [disciplinaryLetters, searchQuery, departmentFilter, statusFilter, sortField, sortDirection])

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

  const getStatusColor = (status: DisciplinaryLetterRecord['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-700 border-gray-200'
      case 'issued': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'acknowledged': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'responded': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const handleCreateLetter = useCallback(async () => {
    if (!letterForm.employeeId || !letterForm.subject || !letterForm.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await createDisciplinaryLetterForEmployee(letterForm.employeeId, {
        letterType: letterForm.letterType,
        severity: letterForm.severity,
        subject: letterForm.subject,
        description: letterForm.description,
        incidentDate: letterForm.incidentDate,
        fineAmount: letterForm.fineAmount ? parseFloat(letterForm.fineAmount) : undefined,
        hrNotes: letterForm.notes,
        issuedBy: 'Current User'
      })

      setShowCreateDialog(false)
      setLetterForm({
        employeeId: '',
        letterType: 'warning',
        severity: 'minor',
        subject: '',
        description: '',
        incidentDate: new Date().toISOString().split('T')[0],
        fineAmount: '',
        notes: ''
      })
      
      const employee = getEmployee(letterForm.employeeId)
      toast.success(`Disciplinary letter created for ${employee?.name}`)

    } catch (error) {
      toast.error('Failed to create disciplinary letter')
    } finally {
      setIsLoading(false)
    }
  }, [letterForm, createDisciplinaryLetterForEmployee, getEmployee])

  // Enhanced print function - matching OfferLetterGenerator style
  const handlePrint = useCallback(() => {
    const printContent = letterRef.current
    if (!printContent || !selectedLetter) return

    const employee = getEmployee(selectedLetter.employeeId)
    if (!employee) return

    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Disciplinary Letter - ${selectedLetter.referenceNumber}</title>
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
                
                .signature-line {
                  border-bottom: 1px solid black !important;
                  padding-bottom: 5px;
                  margin-bottom: 10px;
                }
                
                .signature-details {
                  font-size: 9px;
                }
                
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
                  justify-content: space-between;
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
            ${printContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
    
    toast.success('Disciplinary letter sent to printer')
  }, [selectedLetter, getEmployee])

  // Download functionality - matching OfferLetterGenerator
  const handleDownload = useCallback(() => {
    handlePrint() // For now, use print functionality for download
    toast.success('Disciplinary letter download initiated')
  }, [handlePrint])

  // Full screen functionality - matching OfferLetterGenerator
  const handleFullScreen = () => {
    setIsFullScreen(true)
    setZoomLevel(1) // Full size for full screen
  }

  const handleExitFullScreen = () => {
    setIsFullScreen(false)
    setZoomLevel(0.7) // Back to scaled size for modal
  }

  // Zoom controls - matching OfferLetterGenerator
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.3))
  }

  const handleCopyReference = () => {
    if (selectedLetter) {
      navigator.clipboard.writeText(selectedLetter.referenceNumber)
      toast.success('Reference number copied to clipboard')
    }
  }

  // Render letter content for preview - matching OfferLetterGenerator structure
  const renderDisciplinaryLetterContent = () => {
    if (!selectedLetter) return null

    return (
      <div 
        className="bg-white shadow-lg border border-border/20" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          fontFamily: 'Poppins, Arial, sans-serif',
          minWidth: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          transform: `scale(${zoomLevel})`,
          transformOrigin: isFullScreen ? 'center center' : 'center center',
          color: '#000', // Ensure text is always black on the letter
          backgroundColor: '#ffffff' // Ensure background is always white
        }}
      >
        <DisciplinaryLetterTemplate
          employee={{
            name: selectedLetter.employeeName,
            empId: selectedLetter.empId,
            designation: selectedLetter.designation
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
          previousWarnings={selectedLetter.previousLetters.length > 0}
        />
      </div>
    )
  }

  // Enhanced preview dialog close handler
  const handlePreviewClose = () => {
    setShowDetailsDialog(false)
    setIsFullScreen(false)
    setZoomLevel(0.7)
    setIsHeaderCollapsed(false)
  }

  // Full Screen Mode - matching OfferLetterGenerator
  if (isFullScreen && selectedLetter) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background overflow-hidden">
        {/* Full Screen Controls */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border no-print">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Disciplinary Letter - {selectedLetter.employeeName}</h2>
              <span className="text-sm text-muted-foreground">Full Screen Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.3}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-3 min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 1.5}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyReference}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Ref
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleExitFullScreen}>
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Full Screen
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePreviewClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Full Screen Content */}
        <div className="w-full h-full bg-muted/30 overflow-auto pt-20">
          <div ref={letterRef} className="flex items-center justify-center min-h-full p-8">
            {renderDisciplinaryLetterContent()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileWarning className="h-6 w-6 text-primary" />
            Disciplinary Letters
          </h1>
          <p className="text-muted-foreground">
            Manage disciplinary letters connected to Employee Register • {filteredAndSortedLetters.length} letter{filteredAndSortedLetters.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Letter
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Letters</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalLetters}</div>
            <p className="text-xs text-muted-foreground">All disciplinary letters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Letters</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.activeLetters}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Acknowledgment</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.pendingAcknowledgment}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.thisMonthLetters}</div>
            <p className="text-xs text-muted-foreground">Letters created</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Letters Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('employeeName')} className="h-auto p-0 font-medium">
                  Employee {getSortIcon('employeeName')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('letterType')} className="h-auto p-0 font-medium">
                  Type {getSortIcon('letterType')}
                </Button>
              </TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('letterDate')} className="h-auto p-0 font-medium">
                  Date {getSortIcon('letterDate')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-medium">
                  Status {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLetters.map((letter) => (
              <TableRow key={letter.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{letter.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{letter.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{letter.empId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {letter.letterType.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{letter.subject}</TableCell>
                <TableCell>{new Date(letter.letterDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(letter.status)}>
                    {letter.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLetter(letter)
                        setShowDetailsDialog(true)
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLetter(letter)
                        handlePrint()
                      }}
                    >
                      <Printer className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Letter Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Disciplinary Letter</DialogTitle>
            <DialogDescription>
              Create a new disciplinary letter for an employee
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={letterForm.employeeId} onValueChange={(value) => setLetterForm(prev => ({ ...prev, employeeId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.empId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Letter Type *</Label>
                <Select value={letterForm.letterType} onValueChange={(value) => setLetterForm(prev => ({ ...prev, letterType: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="written-warning">Written Warning</SelectItem>
                    <SelectItem value="final-warning">Final Warning</SelectItem>
                    <SelectItem value="suspension-notice">Suspension Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select value={letterForm.severity} onValueChange={(value) => setLetterForm(prev => ({ ...prev, severity: value as any }))}>
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
              <Label>Subject *</Label>
              <Input
                value={letterForm.subject}
                onChange={(e) => setLetterForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of the violation"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={letterForm.description}
                onChange={(e) => setLetterForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the violation..."
                rows={4}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Incident Date *</Label>
                <Input
                  type="date"
                  value={letterForm.incidentDate}
                  onChange={(e) => setLetterForm(prev => ({ ...prev, incidentDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Fine Amount (MVR)</Label>
                <Input
                  type="number"
                  value={letterForm.fineAmount}
                  onChange={(e) => setLetterForm(prev => ({ ...prev, fineAmount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLetter} disabled={isLoading}>
              {isLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Create Letter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Letter Details Preview Dialog - Using BaseModal like OfferLetterGenerator */}
      {selectedLetter && (
        <BaseModal
          open={showDetailsDialog}
          onOpenChange={(open) => {
            if (!open) {
              handlePreviewClose()
            } else {
              setShowDetailsDialog(open)
            }
          }}
          title={`Disciplinary Letter - ${selectedLetter.employeeName}`}
          description={`${selectedLetter.referenceNumber} - ${selectedLetter.subject}`}
          icon={<FileWarning className="h-5 w-5" />}
          allowMinimize={true}
          allowMaximize={true}
          defaultSize="maximized"
          showControls={true}
        >
          <div className="flex flex-col h-full">
            {/* Collapsible Header Controls - matching OfferLetterGenerator */}
            <Collapsible 
              open={!isHeaderCollapsed} 
              onOpenChange={(open) => setIsHeaderCollapsed(!open)}
              className="flex-shrink-0 border-b border-border no-print"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-1 h-6 w-6"
                    >
                      {isHeaderCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                      {isHeaderCollapsed ? 'Show Controls' : 'Hide Controls'}
                    </span>
                  </div>
                  {isHeaderCollapsed && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleFullScreen(); }}>
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handlePrint(); }}>
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reference: {selectedLetter.referenceNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: <Badge className={getStatusColor(selectedLetter.status)} size="sm">
                          {selectedLetter.status}
                        </Badge>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 mr-4">
                        <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.3}>
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground px-3 min-w-[60px] text-center">
                          {Math.round(zoomLevel * 100)}%
                        </span>
                        <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 1.5}>
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleCopyReference}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Ref
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleFullScreen}>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Full Screen
                      </Button>
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Letter Preview Content */}
            <div className="flex-1 overflow-auto bg-muted/30 p-4">
              <div ref={letterRef} className="flex items-center justify-center min-h-full">
                {renderDisciplinaryLetterContent()}
              </div>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  )
}