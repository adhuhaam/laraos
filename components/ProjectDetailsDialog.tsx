import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseModal } from './BaseModal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { 
  Edit3, Save, X, Calendar, MapPin, User, Building2, Clock, 
  FileText, Upload, Download, CheckCircle, AlertCircle, 
  Pause, PlayCircle, Activity, Target, Eye, Trash2, 
  BarChart3, MessageSquare, Plus, Send, FileImage,
  File, FileX, ChevronRight,
  Timer, Flag, AlertTriangle, Loader2, CheckCircle2,
  RefreshCw, Archive, Copy, Share2, Calendar as CalendarIcon,
  Zap, TrendingUp, Star, BookOpen, Settings, Bell
} from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { toast } from 'sonner@2.0.3'

interface ProjectDocument {
  name: string
  uploaded: boolean
  uploadDate?: string
  fileSize?: string
  fileName?: string
  fileType?: string
  previewUrl?: string
}

interface ProjectMilestone {
  id: string
  title: string
  description: string
  date: string
  status: 'completed' | 'current' | 'upcoming' | 'overdue'
  progress: number
}

interface ProjectComment {
  id: string
  author: string
  content: string
  timestamp: string
  type: 'comment' | 'status_change' | 'milestone'
}

interface ConstructionProject {
  id: string
  projectName: string
  siteName: string
  clientName: string
  projectStartDate: string
  duration: string
  completionDate: string
  status: 'active' | 'completed' | 'on-hold' | 'planning'
  imageUrl: string
  description: string
  progress?: number
  priority?: 'low' | 'medium' | 'high' | 'critical'
  budget?: number
  spent?: number
  documents: {
    projectLicense: ProjectDocument
    paf: ProjectDocument
    siteRegistration: ProjectDocument
    clientDocuments: ProjectDocument
  }
  milestones?: ProjectMilestone[]
  comments?: ProjectComment[]
}

interface ProjectDetailsDialogProps {
  project: ConstructionProject | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (project: ConstructionProject) => void
  onDelete: (projectId: string) => void
}

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
  onUpdate,
  onDelete
}: ProjectDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<ConstructionProject | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [isSaving, setIsSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize edited project when project changes
  useEffect(() => {
    if (project) {
      // Ensure documents object exists with default structure
      const defaultDocuments = {
        projectLicense: { name: 'Project License', uploaded: false },
        paf: { name: 'PAF Document', uploaded: false },
        siteRegistration: { name: 'Site Registration', uploaded: false },
        clientDocuments: { name: 'Client Documents', uploaded: false }
      }

      const projectWithDefaults = {
        ...project,
        progress: project.progress || calculateProgress(project),
        priority: project.priority || 'medium',
        budget: project.budget || 500000,
        spent: project.spent || 250000,
        documents: project.documents || defaultDocuments,
        milestones: project.milestones || generateDefaultMilestones(project),
        comments: project.comments || []
      }
      setEditedProject(projectWithDefaults)
    }
  }, [project])

  // Auto-save functionality
  useEffect(() => {
    if (isEditing && editedProject && autoSaveStatus === 'unsaved') {
      setAutoSaveStatus('saving')
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, 2000) // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [editedProject, isEditing, autoSaveStatus])

  const calculateProgress = (proj: ConstructionProject): number => {
    // Validate dates before calculation
    const startDate = new Date(proj.projectStartDate)
    const endDate = new Date(proj.completionDate)
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 50 // Default progress if dates are invalid
    }
    
    const start = startDate.getTime()
    const end = endDate.getTime()
    const now = Date.now()
    
    // Handle edge cases
    if (end <= start) return 50 // Invalid date range
    if (now < start) return 0
    if (now > end) return 100
    
    return Math.round(((now - start) / (end - start)) * 100)
  }

  const generateDefaultMilestones = (proj: ConstructionProject): ProjectMilestone[] => {
    // Validate and create Date objects with fallbacks
    const start = new Date(proj.projectStartDate)
    const end = new Date(proj.completionDate)
    
    // Check if dates are valid
    const isValidStartDate = !isNaN(start.getTime())
    const isValidEndDate = !isNaN(end.getTime())
    
    // If dates are invalid, use fallback dates
    const validStart = isValidStartDate ? start : new Date()
    const validEnd = isValidEndDate ? end : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    
    const duration = validEnd.getTime() - validStart.getTime()
    
    // Helper function to safely format date
    const formatDate = (date: Date): string => {
      try {
        return date.toISOString().split('T')[0]
      } catch (error) {
        // Fallback to current date if there's still an issue
        return new Date().toISOString().split('T')[0]
      }
    }
    
    return [
      {
        id: '1',
        title: 'Project Initiation',
        description: 'Project kickoff and team setup',
        date: formatDate(validStart),
        status: 'completed',
        progress: 100
      },
      {
        id: '2',
        title: 'Planning Phase',
        description: 'Detailed planning and resource allocation',
        date: formatDate(new Date(validStart.getTime() + duration * 0.1)),
        status: 'completed',
        progress: 100
      },
      {
        id: '3',
        title: 'Foundation Work',
        description: 'Site preparation and foundation laying',
        date: formatDate(new Date(validStart.getTime() + duration * 0.3)),
        status: 'current',
        progress: 75
      },
      {
        id: '4',
        title: 'Structure Phase',
        description: 'Main structural construction',
        date: formatDate(new Date(validStart.getTime() + duration * 0.6)),
        status: 'upcoming',
        progress: 0
      },
      {
        id: '5',
        title: 'Finishing Work',
        description: 'Interior and exterior finishing',
        date: formatDate(new Date(validStart.getTime() + duration * 0.9)),
        status: 'upcoming',
        progress: 0
      },
      {
        id: '6',
        title: 'Project Completion',
        description: 'Final inspections and handover',
        date: formatDate(validEnd),
        status: 'upcoming',
        progress: 0
      }
    ]
  }

  const handleInputChange = (field: keyof ConstructionProject, value: any) => {
    if (editedProject) {
      setEditedProject(prev => prev ? { ...prev, [field]: value } : null)
      setAutoSaveStatus('unsaved')
    }
  }

  const handleAutoSave = async () => {
    if (editedProject) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate save
        setAutoSaveStatus('saved')
        toast.success('Changes saved automatically', { duration: 2000 })
      } catch (error) {
        setAutoSaveStatus('unsaved')
        toast.error('Failed to auto-save changes')
      }
    }
  }

  const handleSave = async () => {
    if (editedProject) {
      setIsSaving(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate save
        onUpdate(editedProject)
        setIsEditing(false)
        setAutoSaveStatus('saved')
        toast.success('Project updated successfully!')
      } catch (error) {
        toast.error('Failed to save project')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleStatusChange = async (newStatus: ConstructionProject['status']) => {
    if (editedProject) {
      const updatedProject = { ...editedProject, status: newStatus }
      setEditedProject(updatedProject)
      
      // Add comment for status change
      const statusComment: ProjectComment = {
        id: Date.now().toString(),
        author: 'Current User',
        content: `Project status changed to "${newStatus}"`,
        timestamp: new Date().toISOString(),
        type: 'status_change'
      }
      
      updatedProject.comments = [...(updatedProject.comments || []), statusComment]
      setEditedProject(updatedProject)
      
      onUpdate(updatedProject)
      toast.success(`Project status updated to ${newStatus}`)
    }
  }

  const handleDocumentUpload = (docType: keyof ConstructionProject['documents']) => {
    fileInputRef.current?.click()
    // Simulate file upload
    setTimeout(() => {
      if (editedProject && editedProject.documents) {
        const updatedProject = { ...editedProject }
        updatedProject.documents[docType] = {
          ...updatedProject.documents[docType],
          uploaded: true,
          uploadDate: new Date().toLocaleDateString(),
          fileSize: '2.4 MB',
          fileName: `${docType}_document.pdf`,
          fileType: 'pdf'
        }
        setEditedProject(updatedProject)
        toast.success('Document uploaded successfully!')
      }
    }, 1500)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent, docType?: keyof ConstructionProject['documents']) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    
    if (files.length > 0) {
      toast.success(`${files.length} file(s) uploaded successfully!`)
      // Handle file upload logic here
    }
  }

  const addComment = () => {
    if (newComment.trim() && editedProject) {
      const comment: ProjectComment = {
        id: Date.now().toString(),
        author: 'Current User',
        content: newComment,
        timestamp: new Date().toISOString(),
        type: 'comment'
      }
      
      const updatedProject = {
        ...editedProject,
        comments: [...(editedProject.comments || []), comment]
      }
      setEditedProject(updatedProject)
      setNewComment('')
      toast.success('Comment added!')
    }
  }

  const getStatusColor = (status: ConstructionProject['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'planning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: ConstructionProject['status']) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'on-hold':
        return <Pause className="h-4 w-4" />
      case 'planning':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'upcoming': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf': return <File className="h-5 w-5 text-red-500" />
      case 'image': return <FileImage className="h-5 w-5 text-blue-500" />
      case 'spreadsheet': return <FileText className="h-5 w-5 text-green-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  if (!editedProject) return null

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={editedProject.projectName}
      description={`${editedProject.siteName} • ${editedProject.clientName}`}
      icon={<Building2 className="h-5 w-5" />}
      allowMinimize={true}
      allowMaximize={true}
      defaultSize="maximized"
    >
      <div className="flex flex-col h-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e)}>
        {/* Header with quick actions and progress */}
        <div className="p-6 border-b space-y-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Auto-save indicator */}
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-blue-500 hidden sm:inline">Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 hidden sm:inline">Saved</span>
                  </>
                )}
                {autoSaveStatus === 'unsaved' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500 hidden sm:inline">Unsaved</span>
                  </>
                )}
              </div>

              {/* Quick Status Actions */}
              <div className="flex flex-wrap gap-2">
                {editedProject.status !== 'active' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 text-xs sm:text-sm">
                        <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Start</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Start Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to start this project? This will change the status to "Active".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange('active')}>
                          Start Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {editedProject.status === 'active' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-yellow-600 hover:text-yellow-700 text-xs sm:text-sm">
                        <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Pause</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Pause Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to pause this project? This will change the status to "On Hold".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange('on-hold')}>
                          Pause Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {editedProject.status !== 'completed' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Complete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Complete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to mark this project as completed? This action will finalize the project.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange('completed')}>
                          Complete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              <Separator orientation="vertical" className="h-6 sm:h-8 hidden sm:block" />
              
              {/* Edit/Save Actions */}
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="text-xs sm:text-sm">
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-xs sm:text-sm"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="text-xs sm:text-sm">
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Project Progress</span>
              <span className="text-xs sm:text-sm text-muted-foreground">{editedProject.progress}%</span>
            </div>
            <Progress value={editedProject.progress} className="h-1.5 sm:h-2" />
          </div>
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-50/90 dark:bg-blue-950/90 z-50 flex items-center justify-center border-2 border-dashed border-blue-300"
            >
              <div className="text-center">
                <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto mb-4" />
                <p className="text-lg sm:text-xl font-semibold text-blue-600">Drop files here to upload</p>
                <p className="text-sm sm:text-base text-blue-500">Supports PDF, images, and documents</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6 h-10 sm:h-12 mx-6 mt-4 sm:mt-6">
              <TabsTrigger value="details" className="text-xs sm:text-sm lg:text-base">Details</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm lg:text-base">Documents</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs sm:text-sm lg:text-base hidden lg:block">Timeline</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs sm:text-sm lg:text-base hidden lg:block">Activity</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6">
              <TabsContent value="details" className="space-y-4 sm:space-y-6 lg:space-y-8 p-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {/* Project Image */}
                  <Card>
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="space-y-4 sm:space-y-6">
                        <h3 className="text-lg sm:text-xl font-semibold">Project Image</h3>
                        <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden rounded-lg group">
                          <ImageWithFallback
                            src={editedProject.imageUrl}
                            alt={editedProject.projectName}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          {isEditing && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button variant="secondary" size="sm" className="text-xs sm:text-sm">
                                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Change Image
                              </Button>
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <div>
                            <Label htmlFor="imageUrl" className="text-sm sm:text-base">Image URL</Label>
                            <Input
                              id="imageUrl"
                              value={editedProject.imageUrl}
                              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                              placeholder="https://..."
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Project Information */}
                  <Card className="lg:col-span-2">
                    <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                      <h3 className="text-lg sm:text-xl font-semibold">Project Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <Label className="text-sm sm:text-base">Project Name</Label>
                          {isEditing ? (
                            <Input
                              value={editedProject.projectName}
                              onChange={(e) => handleInputChange('projectName', e.target.value)}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md mt-2">
                              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              <span className="text-sm sm:text-base">{editedProject.projectName}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm sm:text-base">Site Name</Label>
                          {isEditing ? (
                            <Input
                              value={editedProject.siteName}
                              onChange={(e) => handleInputChange('siteName', e.target.value)}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md mt-2">
                              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              <span className="text-sm sm:text-base">{editedProject.siteName}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm sm:text-base">Client Name</Label>
                          {isEditing ? (
                            <Input
                              value={editedProject.clientName}
                              onChange={(e) => handleInputChange('clientName', e.target.value)}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md mt-2">
                              <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              <span className="text-sm sm:text-base">{editedProject.clientName}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm sm:text-base">Status</Label>
                          {isEditing ? (
                            <Select
                              value={editedProject.status}
                              onValueChange={(value: ConstructionProject['status']) => handleInputChange('status', value)}
                            >
                              <SelectTrigger className="mt-2 h-10 sm:h-12">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md mt-2">
                              {getStatusIcon(editedProject.status)}
                              <Badge className={getStatusColor(editedProject.status)} variant="secondary">
                                {editedProject.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm sm:text-base">Start Date</Label>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editedProject.projectStartDate}
                              onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md mt-2">
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              <span className="text-sm sm:text-base">{new Date(editedProject.projectStartDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm sm:text-base">Completion Date</Label>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editedProject.completionDate}
                              onChange={(e) => handleInputChange('completionDate', e.target.value)}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md mt-2">
                              <Flag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              <span className="text-sm sm:text-base">{new Date(editedProject.completionDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm sm:text-base">Description</Label>
                        {isEditing ? (
                          <Textarea
                            value={editedProject.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="mt-2 text-sm sm:text-base"
                          />
                        ) : (
                          <div className="p-3 bg-muted/30 rounded-md mt-2">
                            <p className="text-sm sm:text-base">{editedProject.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(editedProject.documents).map(([key, doc]) => (
                    <Card key={key} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(doc.fileType)}
                            <div>
                              <h4 className="font-medium text-sm">{doc.name}</h4>
                              {doc.uploaded && doc.uploadDate && (
                                <p className="text-xs text-muted-foreground">
                                  Uploaded {doc.uploadDate} • {doc.fileSize}
                                </p>
                              )}
                            </div>
                          </div>
                          {doc.uploaded ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                              <FileX className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {doc.uploaded ? (
                            <>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => handleDocumentUpload(key as keyof ConstructionProject['documents'])}
                              size="sm"
                              className="flex-1"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 p-1">
                <div className="space-y-4">
                  {editedProject.milestones?.map((milestone, index) => (
                    <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getMilestoneStatusColor(milestone.status)}`}>
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{milestone.title}</h4>
                              <span className="text-xs text-muted-foreground">{new Date(milestone.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{milestone.description}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">Progress</span>
                                <span className="text-xs text-muted-foreground">{milestone.progress}%</span>
                              </div>
                              <Progress value={milestone.progress} className="h-1.5" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 p-1">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                      className="flex-1"
                    />
                    <Button onClick={addComment} size="sm" disabled={!newComment.trim()}>
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>

                  {editedProject.comments?.map((comment) => (
                    <Card key={comment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                              {comment.type === 'status_change' && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  <Activity className="h-3 w-3 mr-1" />
                                  Status Change
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Hidden file input for document upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
        />
      </div>
    </BaseModal>
  )
}