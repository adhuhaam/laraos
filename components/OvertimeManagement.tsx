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
  Upload, FileText, Calendar, User, Building2, Download,
  RefreshCw, Send, Eye, Filter, Search, AlertCircle,
  CheckCircle, Clock, Wallet, ArrowUpRight, ArrowDownRight,
  Edit3, Trash2, Plus, FileUp, AlertTriangle, CheckCircle2,
  X, Save, MoreHorizontal, TrendingUp, Calculator,
  FileSpreadsheet, Printer, Users, Target, DollarSign,
  Timer, Hash, FileCheck, XCircle, Activity, Calendar as CalendarIcon
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface OvertimeRecord {
  id: string
  empNo: string
  date: string
  otType: 'regular' | 'weekend' | 'holiday' | 'emergency'
  requestedBy: string
  otHours: number
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'paid'
  remark: string
  uploadBatch?: string
  processedDate?: string
  processedBy?: string
}

interface UploadBatch {
  id: string
  fileName: string
  uploadDate: string
  uploadedBy: string
  totalRecords: number
  processedRecords: number
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  errors: string[]
}

interface CSVParseResult {
  success: boolean
  data: OvertimeRecord[]
  errors: string[]
  warnings: string[]
}

export function OvertimeManagement() {
  const [selectedTab, setSelectedTab] = useState('upload')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | null>(null)
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data for overtime records
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([
    {
      id: 'OT001',
      empNo: 'EMP001',
      date: '2024-12-15',
      otType: 'regular',
      requestedBy: 'John Manager',
      otHours: 4,
      amount: 800.00,
      status: 'approved',
      remark: 'Project deadline work',
      uploadBatch: 'BATCH001',
      processedDate: '2024-12-16',
      processedBy: 'HR Admin'
    },
    {
      id: 'OT002',
      empNo: 'EMP002',
      date: '2024-12-14',
      otType: 'weekend',
      requestedBy: 'Sarah Team Lead',
      otHours: 8,
      amount: 1920.00,
      status: 'pending',
      remark: 'Emergency maintenance work',
      uploadBatch: 'BATCH001'
    },
    {
      id: 'OT003',
      empNo: 'EMP003',
      date: '2024-12-13',
      otType: 'holiday',
      requestedBy: 'Mike Supervisor',
      otHours: 6,
      amount: 1800.00,
      status: 'processed',
      remark: 'Holiday coverage required',
      uploadBatch: 'BATCH002',
      processedDate: '2024-12-14',
      processedBy: 'HR Manager'
    }
  ])

  // Mock upload batches
  const [uploadBatches] = useState<UploadBatch[]>([
    {
      id: 'BATCH001',
      fileName: 'overtime_december_week1.csv',
      uploadDate: '2024-12-15',
      uploadedBy: 'HR Admin',
      totalRecords: 25,
      processedRecords: 20,
      status: 'processing',
      errors: []
    },
    {
      id: 'BATCH002',
      fileName: 'overtime_december_week2.csv',
      uploadDate: '2024-12-10',
      uploadedBy: 'HR Manager',
      totalRecords: 18,
      processedRecords: 18,
      status: 'completed',
      errors: []
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'processed':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'uploaded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getOTTypeColor = (otType: string) => {
    switch (otType) {
      case 'regular':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'weekend':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'holiday':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getOTTypeLabel = (otType: string) => {
    switch (otType) {
      case 'regular': return 'Regular OT'
      case 'weekend': return 'Weekend OT'
      case 'holiday': return 'Holiday OT'
      case 'emergency': return 'Emergency OT'
      default: return otType
    }
  }

  const parseCSV = (file: File): Promise<CSVParseResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            resolve({
              success: false,
              data: [],
              errors: ['CSV file must contain at least a header row and one data row'],
              warnings: []
            })
            return
          }

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
          const expectedHeaders = ['emp no', 'date', 'ot type', 'requested by', 'ot hrs', 'amount', 'status', 'remark']
          
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
          if (missingHeaders.length > 0) {
            resolve({
              success: false,
              data: [],
              errors: [`Missing required columns: ${missingHeaders.join(', ')}`],
              warnings: []
            })
            return
          }

          const data: OvertimeRecord[] = []
          const errors: string[] = []
          const warnings: string[] = []

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim())
            
            if (values.length !== headers.length) {
              errors.push(`Row ${i + 1}: Column count mismatch`)
              continue
            }

            try {
              const record: OvertimeRecord = {
                id: `OT${Date.now()}_${i}`,
                empNo: values[headers.indexOf('emp no')] || '',
                date: values[headers.indexOf('date')] || '',
                otType: (values[headers.indexOf('ot type')]?.toLowerCase() || 'regular') as any,
                requestedBy: values[headers.indexOf('requested by')] || '',
                otHours: parseFloat(values[headers.indexOf('ot hrs')]) || 0,
                amount: parseFloat(values[headers.indexOf('amount')]) || 0,
                status: (values[headers.indexOf('status')]?.toLowerCase() || 'pending') as any,
                remark: values[headers.indexOf('remark')] || '',
                uploadBatch: `BATCH${Date.now()}`
              }

              // Validation
              if (!record.empNo) {
                errors.push(`Row ${i + 1}: Employee number is required`)
                continue
              }

              if (!record.date) {
                errors.push(`Row ${i + 1}: Date is required`)
                continue
              }

              if (record.otHours <= 0) {
                errors.push(`Row ${i + 1}: OT hours must be greater than 0`)
                continue
              }

              if (record.amount <= 0) {
                warnings.push(`Row ${i + 1}: Amount is 0 or negative`)
              }

              data.push(record)
            } catch (error) {
              errors.push(`Row ${i + 1}: Invalid data format`)
            }
          }

          resolve({
            success: errors.length === 0,
            data,
            errors,
            warnings
          })
        } catch (error) {
          resolve({
            success: false,
            data: [],
            errors: ['Failed to parse CSV file'],
            warnings: []
          })
        }
      }
      reader.readAsText(file)
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const result = await parseCSV(selectedFile)
      setParseResult(result)
      
      if (result.success) {
        toast.success(`Successfully parsed ${result.data.length} overtime records`)
      } else {
        toast.error(`Failed to parse CSV: ${result.errors[0]}`)
      }
    } catch (error) {
      toast.error('Failed to process CSV file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleProcessRecords = async () => {
    if (!parseResult?.data) return

    setIsProcessing(true)
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add records to the main list
      setOvertimeRecords(prev => [...prev, ...parseResult.data])
      
      setIsUploadDialogOpen(false)
      setSelectedFile(null)
      setParseResult(null)
      
      toast.success(`Successfully processed ${parseResult.data.length} overtime records`)
    } catch (error) {
      toast.error('Failed to process overtime records')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditRecord = (record: OvertimeRecord) => {
    setEditingRecord({ ...record })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingRecord) return

    setOvertimeRecords(prev => 
      prev.map(record => 
        record.id === editingRecord.id ? editingRecord : record
      )
    )
    setIsEditDialogOpen(false)
    setEditingRecord(null)
    toast.success('Overtime record updated successfully')
  }

  const handleDeleteRecord = (recordId: string) => {
    setOvertimeRecords(prev => prev.filter(record => record.id !== recordId))
    toast.success('Overtime record deleted successfully')
  }

  const handleBulkStatusUpdate = (status: OvertimeRecord['status']) => {
    if (selectedRecords.length === 0) {
      toast.error('Please select records to update')
      return
    }

    setOvertimeRecords(prev =>
      prev.map(record =>
        selectedRecords.includes(record.id)
          ? { ...record, status, processedDate: new Date().toISOString().split('T')[0], processedBy: 'HR Admin' }
          : record
      )
    )
    setSelectedRecords([])
    toast.success(`Updated ${selectedRecords.length} records to ${status}`)
  }

  const filteredRecords = overtimeRecords.filter(record => {
    const matchesSearch = searchQuery === '' || 
      record.empNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.remark.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalOTAmount = overtimeRecords.reduce((sum, record) => sum + record.amount, 0)
  const totalOTHours = overtimeRecords.reduce((sum, record) => sum + record.otHours, 0)
  const pendingRecords = overtimeRecords.filter(r => r.status === 'pending').length
  const approvedRecords = overtimeRecords.filter(r => r.status === 'approved').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overtime Management</h1>
          <p className="text-muted-foreground">
            Upload and process employee overtime records from CSV files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload OT CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Upload Overtime CSV File</DialogTitle>
                <DialogDescription>
                  Upload a CSV file containing overtime records with the required columns
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Required Columns Info */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Required CSV Columns:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>• EMP No</div>
                    <div>• Date</div>
                    <div>• OT Type</div>
                    <div>• Requested By</div>
                    <div>• OT Hrs</div>
                    <div>• Amount</div>
                    <div>• Status</div>
                    <div>• Remark</div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input 
                      id="csv-file"
                      type="file" 
                      accept=".csv"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileUp className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {/* Parse Results */}
                {parseResult && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Parse Results</h4>
                      
                      {parseResult.success ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Successfully parsed {parseResult.data.length} records</span>
                          </div>
                          
                          {parseResult.warnings.length > 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Warnings:</span>
                              </div>
                              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                {parseResult.warnings.map((warning, index) => (
                                  <li key={index}>• {warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Preview Table */}
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>EMP No</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>OT Type</TableHead>
                                  <TableHead>OT Hrs</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {parseResult.data.slice(0, 5).map((record, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{record.empNo}</TableCell>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>
                                      <Badge className={getOTTypeColor(record.otType)}>
                                        {getOTTypeLabel(record.otType)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{record.otHours}</TableCell>
                                    <TableCell>MVR {record.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge className={getStatusColor(record.status)}>
                                        {record.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {parseResult.data.length > 5 && (
                              <div className="p-2 text-center text-sm text-muted-foreground border-t">
                                ... and {parseResult.data.length - 5} more records
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800 dark:text-red-400 mb-2">
                            <XCircle className="h-4 w-4" />
                            <span className="font-medium">Parse Errors:</span>
                          </div>
                          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                            {parseResult.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                {!parseResult ? (
                  <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Parse CSV
                      </>
                    )}
                  </Button>
                ) : parseResult.success ? (
                  <Button onClick={handleProcessRecords} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Process Records
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-parse
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OT Records</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overtimeRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Records processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
            <Timer className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOTHours}</div>
            <p className="text-xs text-muted-foreground">
              Hours logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MVR {totalOTAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              To be paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRecords}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Process</TabsTrigger>
          <TabsTrigger value="records">OT Records</TabsTrigger>
          <TabsTrigger value="batches">Upload Batches</TabsTrigger>
        </TabsList>

        {/* Upload & Process Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                CSV Upload Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Required Columns:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>EMP No - Employee number</li>
                          <li>Date - YYYY-MM-DD format</li>
                          <li>OT Type - regular, weekend, holiday, emergency</li>
                          <li>Requested By - Manager/supervisor name</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Additional Columns:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>OT Hrs - Number of overtime hours</li>
                          <li>Amount - Overtime payment amount</li>
                          <li>Status - pending, approved, rejected</li>
                          <li>Remark - Additional notes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Sample CSV Template</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download a sample CSV template with the correct format
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download Template
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Processing Workflow</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload → Parse → Validate → Review → Process
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Each step includes validation and error checking
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Upload Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Upload Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadBatches.slice(0, 3).map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{batch.fileName}</div>
                        <div className="text-sm text-muted-foreground">
                          {batch.uploadDate} • {batch.uploadedBy} • {batch.totalRecords} records
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm">
                          {batch.processedRecords}/{batch.totalRecords} processed
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((batch.processedRecords / batch.totalRecords) * 100)}% complete
                        </div>
                      </div>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OT Records Tab */}
        <TabsContent value="records" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search records..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
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

              {/* Bulk Actions */}
              {selectedRecords.length > 0 && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedRecords.length} record(s) selected
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate('approved')}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate('rejected')}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate('processed')}
                  >
                    <FileCheck className="h-3 w-3 mr-1" />
                    Process
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Overtime Records ({filteredRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRecords(filteredRecords.map(r => r.id))
                            } else {
                              setSelectedRecords([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>EMP No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>OT Type</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>OT Hrs</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRecords.includes(record.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRecords(prev => [...prev, record.id])
                              } else {
                                setSelectedRecords(prev => prev.filter(id => id !== record.id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{record.empNo}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Badge className={getOTTypeColor(record.otType)}>
                            {getOTTypeLabel(record.otType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.requestedBy}</TableCell>
                        <TableCell>{record.otHours}</TableCell>
                        <TableCell>MVR {record.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-32 truncate">{record.remark}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRecord(record)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="h-3 w-3" />
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

        {/* Upload Batches Tab */}
        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Batches</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track and manage CSV upload batches and their processing status
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{batch.fileName}</div>
                        <div className="text-sm text-muted-foreground">
                          Uploaded on {batch.uploadDate} by {batch.uploadedBy}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {batch.processedRecords}/{batch.totalRecords} records processed
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round((batch.processedRecords / batch.totalRecords) * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Complete</div>
                      </div>
                      
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Overtime Record</DialogTitle>
            <DialogDescription>
              Update the overtime record details
            </DialogDescription>
          </DialogHeader>
          
          {editingRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-empno">Employee Number</Label>
                  <Input
                    id="edit-empno"
                    value={editingRecord.empNo}
                    onChange={(e) => setEditingRecord(prev => prev ? { ...prev, empNo: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingRecord.date}
                    onChange={(e) => setEditingRecord(prev => prev ? { ...prev, date: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-ottype">OT Type</Label>
                  <Select 
                    value={editingRecord.otType} 
                    onValueChange={(value: any) => setEditingRecord(prev => prev ? { ...prev, otType: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular OT</SelectItem>
                      <SelectItem value="weekend">Weekend OT</SelectItem>
                      <SelectItem value="holiday">Holiday OT</SelectItem>
                      <SelectItem value="emergency">Emergency OT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingRecord.status} 
                    onValueChange={(value: any) => setEditingRecord(prev => prev ? { ...prev, status: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-hours">OT Hours</Label>
                  <Input
                    id="edit-hours"
                    type="number"
                    step="0.5"
                    value={editingRecord.otHours}
                    onChange={(e) => setEditingRecord(prev => prev ? { ...prev, otHours: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount (MVR)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editingRecord.amount}
                    onChange={(e) => setEditingRecord(prev => prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-requestedby">Requested By</Label>
                <Input
                  id="edit-requestedby"
                  value={editingRecord.requestedBy}
                  onChange={(e) => setEditingRecord(prev => prev ? { ...prev, requestedBy: e.target.value } : null)}
                />
              </div>

              <div>
                <Label htmlFor="edit-remark">Remark</Label>
                <Textarea
                  id="edit-remark"
                  value={editingRecord.remark}
                  onChange={(e) => setEditingRecord(prev => prev ? { ...prev, remark: e.target.value } : null)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}