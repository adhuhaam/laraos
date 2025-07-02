import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { AddProjectDialog } from './AddProjectDialog'
import { ProjectDetailsDialog } from './ProjectDetailsDialog'
import { CreateQuotaDialog } from './CreateQuotaDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  MoreHorizontal,
  Building2,
  Calendar,
  User,
  MapPin,
  Eye,
  Edit3,
  Trash2,
  Target,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Pause,
  RefreshCw,
  Download,
  Upload,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Users,
  TrendingUp,
  FileText,
  Settings,
  ChevronRight,
  Tag,
  Briefcase,
  CalendarDays,
  Activity
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Project {
  id: string
  name: string
  code: string
  type: 'Permanent' | 'Project'
  status: 'Active' | 'Inactive' | 'Pending' | 'Completed' | 'On Hold'
  manager: string
  description?: string
  startDate: string
  endDate?: string
  budget?: number
  location?: string
  priority: 'High' | 'Medium' | 'Low'
  progress: number
  tags: string[]
  createdAt: string
  updatedAt: string
  image?: string
}

interface QuotaPool {
  id: string
  projectId: string
  poolName: string
  projectName: string
  totalSlots: number
  allocatedSlots: number
  availableSlots: number
}

type ViewMode = 'grid' | 'table'
type SortField = 'name' | 'startDate' | 'status' | 'priority' | 'progress' | 'budget'
type SortDirection = 'asc' | 'desc'

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Digital Transformation Initiative',
    code: 'DTI-2024',
    type: 'Project',
    status: 'Active',
    manager: 'Sarah Johnson',
    description: 'Complete digital overhaul of legacy systems',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    budget: 500000,
    location: 'New York',
    priority: 'High',
    progress: 65,
    tags: ['Digital', 'IT', 'Transformation'],
    createdAt: '2024-01-01',
    updatedAt: '2024-12-20',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Marketing Campaign Q1',
    code: 'MKT-Q1-2024',
    type: 'Project',
    status: 'Pending',
    manager: 'Michael Chen',
    description: 'Launch new product marketing campaign',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    budget: 150000,
    location: 'San Francisco',
    priority: 'Medium',
    progress: 25,
    tags: ['Marketing', 'Campaign', 'Product'],
    createdAt: '2024-02-15',
    updatedAt: '2024-12-18',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    name: 'Infrastructure Upgrade',
    code: 'INFRA-2024',
    type: 'Permanent',
    status: 'Active',
    manager: 'David Wilson',
    description: 'Ongoing infrastructure maintenance and upgrades',
    startDate: '2024-01-01',
    budget: 750000,
    location: 'Multiple Sites',
    priority: 'High',
    progress: 80,
    tags: ['Infrastructure', 'Maintenance', 'Upgrade'],
    createdAt: '2023-12-01',
    updatedAt: '2024-12-19',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    name: 'Customer Support Enhancement',
    code: 'CSE-2024',
    type: 'Project',
    status: 'Completed',
    manager: 'Emma Davis',
    description: 'Improve customer support processes and tools',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    budget: 200000,
    location: 'Remote',
    priority: 'Medium',
    progress: 100,
    tags: ['Support', 'Customer', 'Process'],
    createdAt: '2024-01-20',
    updatedAt: '2024-11-30',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    name: 'Mobile App Development',
    code: 'MAD-2024',
    type: 'Project',
    status: 'On Hold',
    manager: 'Alex Rodriguez',
    description: 'Development of new mobile application',
    startDate: '2024-04-01',
    endDate: '2024-10-31',
    budget: 300000,
    location: 'Austin',
    priority: 'Low',
    progress: 45,
    tags: ['Mobile', 'Development', 'App'],
    createdAt: '2024-03-15',
    updatedAt: '2024-08-15',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'
  }
]

export function Projects() {
  // Core state
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [quotaPools, setQuotaPools] = useState<QuotaPool[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCreateQuotaDialog, setShowCreateQuotaDialog] = useState(false)
  
  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isLoading, setIsLoading] = useState(false)

  // Get projects that already have quota pools
  const projectsWithPools = useMemo(() => {
    return new Set(quotaPools.map(pool => pool.projectId))
  }, [quotaPools])

  // Check if a project has a quota pool
  const hasQuotaPool = useCallback((projectId: string) => {
    return projectsWithPools.has(projectId)
  }, [projectsWithPools])

  // Filtering and sorting logic
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesType = typeFilter === 'all' || project.type === typeFilter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority
    })

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'startDate') {
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
  }, [projects, searchQuery, statusFilter, typeFilter, priorityFilter, sortField, sortDirection])

  // Handle project actions
  const handleProjectAction = async (action: string, project: Project) => {
    switch (action) {
      case 'view':
        setSelectedProject(project)
        setShowDetailsDialog(true)
        break
      case 'edit':
        setSelectedProject(project)
        setShowAddDialog(true)
        break
      case 'delete':
        await handleDeleteProject(project.id)
        break
      case 'create-quota':
        if (hasQuotaPool(project.id)) {
          toast.error('This project already has a quota pool assigned')
          return
        }
        setSelectedProject(project)
        setShowCreateQuotaDialog(true)
        break
      case 'duplicate':
        await handleDuplicateProject(project)
        break
      case 'export':
        handleExportProject(project)
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProjects(prev => prev.filter(p => p.id !== projectId))
      
      // Also remove any associated quota pools
      setQuotaPools(prev => prev.filter(pool => pool.projectId !== projectId))
      
      toast.success('Project deleted successfully')
    } catch (error) {
      toast.error('Failed to delete project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicateProject = async (project: Project) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const duplicatedProject: Project = {
        ...project,
        id: Date.now().toString(),
        name: `${project.name} (Copy)`,
        code: `${project.code}-COPY`,
        status: 'Pending',
        progress: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setProjects(prev => [duplicatedProject, ...prev])
      toast.success('Project duplicated successfully')
    } catch (error) {
      toast.error('Failed to duplicate project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportProject = (project: Project) => {
    const dataStr = JSON.stringify(project, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `project-${project.code}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Project exported successfully')
  }

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

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'Inactive': return 'bg-gray-500/10 text-gray-600 border-gray-200'
      case 'Pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'Completed': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'On Hold': return 'bg-red-500/10 text-red-700 border-red-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'Low': return 'bg-green-500/10 text-green-700 border-green-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
    setShowAddDialog(false)
    toast.success('Project created successfully!')
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
    setShowAddDialog(false)
    setSelectedProject(null)
    toast.success('Project updated successfully!')
  }

  const handleQuotaPoolCreated = (quotaPool: QuotaPool) => {
    setQuotaPools(prev => [...prev, quotaPool])
    setShowCreateQuotaDialog(false)
    setSelectedProject(null)
    toast.success('Quota pool created successfully!')
  }

  // Project Card Component
  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight truncate">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{project.code}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleProjectAction('view', project)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleProjectAction('edit', project)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleProjectAction('create-quota', project)}
                disabled={hasQuotaPool(project.id)}
              >
                <Target className="h-4 w-4 mr-2" />
                {hasQuotaPool(project.id) ? 'Pool Already Created' : 'Create Quota Pool'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleProjectAction('duplicate', project)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleProjectAction('export', project)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleProjectAction('delete', project)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {project.image && (
          <div className="w-full h-32 rounded-md overflow-hidden bg-muted">
            <ImageWithFallback
              src={project.image}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
          <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{project.manager}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{project.startDate}</span>
          </div>
          
          {project.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
          )}
        </div>
        
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        
        {project.budget && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">${project.budget.toLocaleString()}</span>
          </div>
        )}
        
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <Separator />
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleProjectAction('view', project)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleProjectAction('create-quota', project)}
            className="flex-1"
            disabled={hasQuotaPool(project.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            {hasQuotaPool(project.id) ? 'Pool Added' : 'Add Pool'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your projects and their quota pools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Permanent">Permanent</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Quota Pools</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotaPools.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length - quotaPools.length} pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filteredAndSortedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Project Name {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority {getSortIcon('priority')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('progress')}
                  >
                    <div className="flex items-center gap-2">
                      Progress {getSortIcon('progress')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('budget')}
                  >
                    <div className="flex items-center gap-2">
                      Budget {getSortIcon('budget')}
                    </div>
                  </TableHead>
                  <TableHead>Quota Pool</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {project.image && (
                          <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                            <ImageWithFallback
                              src={project.image}
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {project.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{project.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.budget ? `$${project.budget.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {hasQuotaPool(project.id) ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Created
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleProjectAction('view', project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProjectAction('edit', project)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleProjectAction('create-quota', project)}
                            disabled={hasQuotaPool(project.id)}
                          >
                            <Target className="h-4 w-4 mr-2" />
                            {hasQuotaPool(project.id) ? 'Pool Already Created' : 'Create Pool'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleProjectAction('delete', project)}
                            className="text-destructive"
                          >
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
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredAndSortedProjects.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first project'}
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddProjectDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onProjectCreated={handleProjectCreated}
        onProjectUpdated={handleProjectUpdated}
        editProject={selectedProject}
      />

      <ProjectDetailsDialog
        project={selectedProject}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        hasQuotaPool={selectedProject ? hasQuotaPool(selectedProject.id) : false}
        onCreateQuotaPool={(project) => {
          setSelectedProject(project)
          setShowDetailsDialog(false)
          setShowCreateQuotaDialog(true)
        }}
      />

      <CreateQuotaDialog
        open={showCreateQuotaDialog}
        onOpenChange={setShowCreateQuotaDialog}
        onQuotaCreated={handleQuotaPoolCreated}
        projects={projects}
        selectedProject={selectedProject}
      />
    </div>
  )
}