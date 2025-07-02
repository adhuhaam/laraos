import React, { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarIcon, Plus, Users, DollarSign, Briefcase, Target, Building2, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { toast } from 'sonner@2.0.3'

interface Project {
  id: string
  projectName: string
  siteName: string
  clientName: string
  status: 'active' | 'completed' | 'on-hold' | 'planning'
}

interface QuotaPool {
  id: string
  poolNumber: string
  poolName: string
  projectId?: string
}

interface CreateQuotaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuotaCreated: (quota: any) => void
  preselectedProject?: any
  projects?: Project[]
  existingPools?: QuotaPool[]
}

// Default projects data for when none are provided
const defaultProjects: Project[] = [
  {
    id: '1',
    projectName: 'Skyline Tower Complex',
    siteName: 'Downtown Business District',
    clientName: 'Metropolitan Development Corp',
    status: 'active'
  },
  {
    id: '2',
    projectName: 'Green Valley Residential',
    siteName: 'Green Valley Suburbs',
    clientName: 'Harmony Homes Ltd',
    status: 'active'
  },
  {
    id: '3',
    projectName: 'Industrial Park Phase 2',
    siteName: 'East Industrial Zone',
    clientName: 'Industrial Solutions Inc',
    status: 'planning'
  },
  {
    id: '4',
    projectName: 'City Mall Renovation',
    siteName: 'Central Shopping District',
    clientName: 'Retail Ventures Group',
    status: 'active'
  },
  {
    id: '5',
    projectName: 'Highway Bridge Construction',
    siteName: 'Highway 101 Crossing',
    clientName: 'State Transportation Dept',
    status: 'completed'
  },
  {
    id: '6',
    projectName: 'Medical Center Expansion',
    siteName: 'City General Hospital',
    clientName: 'Healthcare Foundation',
    status: 'on-hold'
  }
]

export function CreateQuotaDialog({ 
  open, 
  onOpenChange, 
  onQuotaCreated, 
  preselectedProject,
  projects = defaultProjects,
  existingPools = []
}: CreateQuotaDialogProps) {

  const [formData, setFormData] = useState({
    poolNumber: '',
    quotaType: 'project' as 'permanent' | 'project',
    totalQuota: '',
    description: '',
    startDate: undefined as Date | undefined,
    expiryDate: undefined as Date | undefined
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        poolNumber: '',
        quotaType: 'project',
        totalQuota: '',
        description: '',
        startDate: undefined,
        expiryDate: undefined
      })
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.poolNumber || !formData.totalQuota || !formData.startDate || !formData.expiryDate) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate date range
    if (formData.startDate && formData.expiryDate && formData.startDate >= formData.expiryDate) {
      toast.error('Start date must be before expiry date')
      return
    }

    // Check if pool number already exists
    const poolNumberExists = existingPools.some(pool => 
      pool.poolNumber.toLowerCase() === formData.poolNumber.toLowerCase()
    )
    
    if (poolNumberExists) {
      toast.error('Pool number already exists. Please use a unique pool number.')
      return
    }

    const quotaData = {
      poolNumber: formData.poolNumber,
      poolName: formData.poolNumber, // Use pool number as pool name
      quotaType: formData.quotaType,
      totalQuota: parseInt(formData.totalQuota),
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      description: formData.description
    }

    onQuotaCreated(quotaData)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Select date"
    return date.toLocaleDateString()
  }

  const getQuotaTypeIcon = (type: string) => {
    switch (type) {
      case 'permanent': return <Building2 className="h-4 w-4" />
      case 'project': return <Briefcase className="h-4 w-4" />
      default: return <Briefcase className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'planning': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Get minimum date for start date (today)
  const getMinStartDate = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  // Get minimum date for expiry date (start date + 1 day or today + 1 day)
  const getMinExpiryDate = () => {
    if (formData.startDate) {
      const minDate = new Date(formData.startDate)
      minDate.setDate(minDate.getDate() + 1)
      return minDate
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Project Quota Pool"
      description="Create a new quota pool for managing slot allocations and assignments."
      icon={<Briefcase className="h-5 w-5" />}
      allowMinimize={true}
      allowMaximize={true}
      defaultSize="normal"
    >
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pool Number */}
            <div>
              <Label htmlFor="poolNumber" className="text-base font-medium">
                Pool Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="poolNumber"
                value={formData.poolNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, poolNumber: e.target.value }))}
                placeholder="e.g., QP-2024-001"
                className="mt-2"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Unique identifier for this quota pool
              </p>
            </div>

            {/* Project Type */}
            <div>
              <Label htmlFor="quotaType" className="text-base font-medium">
                Project Type
              </Label>
              <Select 
                value={formData.quotaType} 
                onValueChange={(value: 'permanent' | 'project') => 
                  setFormData(prev => ({ ...prev, quotaType: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Permanent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="project">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Project</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total Quota */}
            <div>
              <Label htmlFor="totalQuota" className="text-base font-medium">
                Approved Quota Slots <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalQuota"
                type="number"
                min="1"
                value={formData.totalQuota}
                onChange={(e) => setFormData(prev => ({ ...prev, totalQuota: e.target.value }))}
                placeholder="e.g., 25"
                className="mt-2"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum number of slots for this pool
              </p>
            </div>

            {/* Start Date */}
            <div>
              <Label className="text-base font-medium">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-2"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, startDate: date }))
                      // Reset expiry date if it's before the new start date
                      if (date && formData.expiryDate && date >= formData.expiryDate) {
                        setFormData(prev => ({ ...prev, expiryDate: undefined }))
                      }
                    }}
                    disabled={(date) => date < getMinStartDate()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground mt-1">
                When the quota pool becomes active
              </p>
            </div>

            {/* Expiry Date */}
            <div>
              <Label className="text-base font-medium">
                Expiry Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-2"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.expiryDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
                    disabled={(date) => date < getMinExpiryDate()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground mt-1">
                When the quota pool expires
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and scope of this quota pool..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
            >
              {getQuotaTypeIcon(formData.quotaType)}
              <span className="ml-2">Create Pool</span>
            </Button>
          </div>
        </form>
      </div>
    </BaseModal>
  )
}