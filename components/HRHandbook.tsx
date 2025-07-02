import React, { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'
import { Textarea } from './ui/textarea'
import { 
  Book,
  Upload,
  Download,
  Search,
  FileText,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  Calendar,
  MoreVertical,
  Plus,
  RefreshCw,
  Filter,
  BookOpen,
  File,
  History,
  Star,
  Share2,
  Bookmark,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Archive,
  Tag,
  FileCheck
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { format } from 'date-fns'

// HR Handbook Types
interface HandbookDocument {
  id: string
  title: string
  fileName: string
  fileSize: string
  fileType: 'pdf' | 'doc' | 'docx'
  version: string
  uploadDate: Date
  uploadedBy: string
  status: 'active' | 'draft' | 'archived' | 'review'
  category: string
  tags: string[]
  description?: string
  lastModified: Date
  modifiedBy: string
  downloadCount: number
  viewCount: number
  isBookmarked: boolean
  content?: string
  searchableText?: string
}

interface HandbookVersion {
  id: string
  documentId: string
  version: string
  uploadDate: Date
  uploadedBy: string
  changes: string
  fileUrl: string
}

interface BookmarkItem {
  id: string
  documentId: string
  userId: string
  page?: number
  note?: string
  createdAt: Date
}

const handbookCategories = [
  'Company Policies',
  'Employee Benefits',
  'Code of Conduct',
  'Safety Procedures',
  'Leave Policies',
  'Disciplinary Procedures',
  'Training & Development',
  'Health & Safety',
  'Emergency Procedures',
  'IT Policies',
  'Communication Guidelines',
  'Performance Management'
]

const statusConfig = {
  active: {
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: CheckCircle
  },
  draft: {
    label: 'Draft',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    icon: Edit
  },
  archived: {
    label: 'Archived',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    icon: Archive
  },
  review: {
    label: 'Under Review',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: AlertCircle
  }
}

export function HRHandbook() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'documents' | 'viewer' | 'bookmarks' | 'history'>('documents')
  const [selectedDocument, setSelectedDocument] = useState<HandbookDocument | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pdfZoom, setPdfZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample handbook documents
  const [handbookDocuments, setHandbookDocuments] = useState<HandbookDocument[]>([
    {
      id: '1',
      title: 'Employee Handbook 2025',
      fileName: 'Employee_Handbook_2025.pdf',
      fileSize: '2.4 MB',
      fileType: 'pdf',
      version: '1.0',
      uploadDate: new Date('2025-01-01'),
      uploadedBy: 'HR Manager',
      status: 'active',
      category: 'Company Policies',
      tags: ['policies', 'handbook', '2025'],
      description: 'Comprehensive employee handbook covering all company policies and procedures',
      lastModified: new Date('2025-01-01'),
      modifiedBy: 'HR Manager',
      downloadCount: 245,
      viewCount: 1250,
      isBookmarked: true,
      searchableText: 'employee handbook policies procedures benefits leave attendance code of conduct'
    },
    {
      id: '2',
      title: 'Code of Conduct Guidelines',
      fileName: 'Code_of_Conduct_2025.pdf',
      fileSize: '1.8 MB',
      fileType: 'pdf',
      version: '2.1',
      uploadDate: new Date('2024-12-15'),
      uploadedBy: 'Compliance Officer',
      status: 'active',
      category: 'Code of Conduct',
      tags: ['conduct', 'ethics', 'guidelines'],
      description: 'Professional code of conduct and ethical guidelines for all employees',
      lastModified: new Date('2024-12-20'),
      modifiedBy: 'Legal Team',
      downloadCount: 180,
      viewCount: 890,
      isBookmarked: false,
      searchableText: 'code conduct ethics professional behavior guidelines workplace harassment'
    },
    {
      id: '3',
      title: 'Safety Procedures Manual',
      fileName: 'Safety_Procedures_Manual.pdf',
      fileSize: '3.2 MB',
      fileType: 'pdf',
      version: '1.5',
      uploadDate: new Date('2024-11-30'),
      uploadedBy: 'Safety Officer',
      status: 'active',
      category: 'Safety Procedures',
      tags: ['safety', 'procedures', 'emergency'],
      description: 'Comprehensive safety procedures and emergency response protocols',
      lastModified: new Date('2024-12-10'),
      modifiedBy: 'Safety Committee',
      downloadCount: 156,
      viewCount: 720,
      isBookmarked: true,
      searchableText: 'safety procedures emergency response protocols workplace safety equipment'
    },
    {
      id: '4',
      title: 'Leave Policy Update',
      fileName: 'Leave_Policy_Draft.pdf',
      fileSize: '890 KB',
      fileType: 'pdf',
      version: '3.0-draft',
      uploadDate: new Date('2025-01-15'),
      uploadedBy: 'HR Specialist',
      status: 'draft',
      category: 'Leave Policies',
      tags: ['leave', 'vacation', 'policy'],
      description: 'Updated leave policy including new parental leave provisions',
      lastModified: new Date('2025-01-18'),
      modifiedBy: 'HR Team',
      downloadCount: 45,
      viewCount: 156,
      isBookmarked: false,
      searchableText: 'leave policy vacation sick leave parental leave annual leave'
    }
  ])

  // Sample versions history
  const [documentVersions, setDocumentVersions] = useState<HandbookVersion[]>([
    {
      id: 'v1',
      documentId: '1',
      version: '1.0',
      uploadDate: new Date('2025-01-01'),
      uploadedBy: 'HR Manager',
      changes: 'Initial version of 2025 employee handbook',
      fileUrl: '/documents/employee-handbook-v1.pdf'
    },
    {
      id: 'v2',
      documentId: '2',
      version: '2.1',
      uploadDate: new Date('2024-12-15'),
      uploadedBy: 'Compliance Officer',
      changes: 'Updated harassment policy and added remote work guidelines',
      fileUrl: '/documents/code-of-conduct-v2.1.pdf'
    }
  ])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return handbookDocuments.filter(doc => {
      const matchesSearch = searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.searchableText?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
      
      return matchesSearch && matchesCategory && matchesStatus
    }).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
  }, [handbookDocuments, searchQuery, categoryFilter, statusFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalDocuments = handbookDocuments.length
    const activeDocuments = handbookDocuments.filter(doc => doc.status === 'active').length
    const draftDocuments = handbookDocuments.filter(doc => doc.status === 'draft').length
    const totalViews = handbookDocuments.reduce((sum, doc) => sum + doc.viewCount, 0)
    const totalDownloads = handbookDocuments.reduce((sum, doc) => sum + doc.downloadCount, 0)
    
    return {
      totalDocuments,
      activeDocuments,
      draftDocuments,
      totalViews,
      totalDownloads
    }
  }, [handbookDocuments])

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsLoading(true)
    try {
      const file = files[0]
      
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('document')) {
        toast.error('Please upload PDF or Word documents only')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate upload

      const newDocument: HandbookDocument = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        fileType: file.type.includes('pdf') ? 'pdf' : 'doc',
        version: '1.0',
        uploadDate: new Date(),
        uploadedBy: 'Current User',
        status: 'draft',
        category: 'Company Policies',
        tags: ['new', 'upload'],
        description: `Uploaded document: ${file.name}`,
        lastModified: new Date(),
        modifiedBy: 'Current User',
        downloadCount: 0,
        viewCount: 0,
        isBookmarked: false,
        searchableText: file.name.toLowerCase()
      }

      setHandbookDocuments(prev => [...prev, newDocument])
      setIsUploadDialogOpen(false)
      toast.success(`Document "${file.name}" uploaded successfully`)
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle document view
  const handleViewDocument = (document: HandbookDocument) => {
    setSelectedDocument(document)
    setViewMode('viewer')
    setCurrentPage(1)
    setPdfZoom(100)
    
    // Increment view count
    setHandbookDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, viewCount: doc.viewCount + 1 }
          : doc
      )
    )
    
    toast.success(`Opening "${document.title}"`)
  }

  // Handle document download
  const handleDownloadDocument = (document: HandbookDocument) => {
    // Increment download count
    setHandbookDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, downloadCount: doc.downloadCount + 1 }
          : doc
      )
    )
    
    toast.success(`Downloading "${document.title}"`)
  }

  // Toggle bookmark
  const toggleBookmark = (documentId: string) => {
    setHandbookDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, isBookmarked: !doc.isBookmarked }
          : doc
      )
    )
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    
    const IconComponent = config.icon
    
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-current`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Format file size
  const formatFileSize = (size: string) => {
    return size
  }

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            HR Handbook
          </h1>
          <p className="text-muted-foreground">
            Manage company handbooks, policies, and documentation
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode('history')}>
            <History className="h-4 w-4 mr-2" />
            Version History
          </Button>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload HR Document</DialogTitle>
                <DialogDescription>
                  Upload PDF or Word documents to the HR handbook library
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Drop files here or click to upload</h3>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOC, DOCX files up to 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Select Files
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {handbookCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input id="version" placeholder="e.g., 1.0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of the document..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" placeholder="policy, handbook, guidelines" />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleFileUpload(fileInputRef.current?.files)} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Handbook documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.activeDocuments}</div>
            <p className="text-xs text-muted-foreground">Published documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.draftDocuments}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Document views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="viewer">Viewer</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {handbookCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {filteredDocuments.length} documents
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{document.title}</div>
                              {document.isBookmarked && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {document.fileName} • {document.fileSize}
                            </div>
                            {document.description && (
                              <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                                {document.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{document.category}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{document.version}</TableCell>
                      <TableCell>
                        {getStatusBadge(document.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div>{formatDate(document.lastModified)}</div>
                          <div className="text-muted-foreground">by {document.modifiedBy}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {document.viewCount}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Download className="h-3 w-3" />
                            {document.downloadCount}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDocument(document)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadDocument(document)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleBookmark(document.id)}>
                              <Star className={`h-4 w-4 mr-2 ${document.isBookmarked ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                              {document.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="viewer" className="space-y-4">
          {selectedDocument ? (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedDocument.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDocument.fileName} • Version {selectedDocument.version}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPdfZoom(Math.max(50, pdfZoom - 25))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-mono w-16 text-center">{pdfZoom}%</span>
                    <Button variant="outline" size="sm" onClick={() => setPdfZoom(Math.min(200, pdfZoom + 25))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setViewMode('documents')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">PDF Viewer</h3>
                      <p className="text-sm text-muted-foreground">
                        PDF viewer would be integrated here using a library like react-pdf or pdf.js
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Currently viewing: {selectedDocument.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Previous
                      </Button>
                      <span className="text-sm px-2">Page {currentPage} of 10</span>
                      <Button variant="outline" size="sm">
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">No Document Selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a document from the Documents tab to view it here
                    </p>
                  </div>
                  <Button onClick={() => setViewMode('documents')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="bookmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bookmarked Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {handbookDocuments.filter(doc => doc.isBookmarked).map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{document.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {document.category} • {formatDate(document.lastModified)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDocument(document)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleBookmark(document.id)}>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {handbookDocuments.filter(doc => doc.isBookmarked).length === 0 && (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Bookmark className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">No Bookmarks</h3>
                    <p className="text-sm text-muted-foreground">
                      Bookmark documents to access them quickly
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentVersions.map((version, index) => {
                  const document = handbookDocuments.find(doc => doc.id === version.documentId)
                  return (
                    <div key={version.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                        {index < documentVersions.length - 1 && (
                          <div className="h-8 w-px bg-border ml-1 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{document?.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Version {version.version} • {formatDate(version.uploadDate)}
                            </div>
                          </div>
                          <Badge variant="outline">{version.version}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {version.changes}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          Updated by {version.uploadedBy}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}