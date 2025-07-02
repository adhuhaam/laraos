"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarIcon, Target, Briefcase, Clock } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Project {
  id: string
  projectName: string
  siteName: string
  clientName: string
}

interface DashboardQuotaDialogProps {
  project: Project
  onCreateQuota: (quotaData: {
    poolNumber: string
    poolName: string
    department: string
    quotaType: 'hiring' | 'budget' | 'project' | 'performance'
    totalQuota: number
    expiryDate: Date
    manager: string
    description: string
    projectId?: string
  }) => void
}

export function DashboardQuotaDialog({ project, onCreateQuota }: DashboardQuotaDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expiryDate, setExpiryDate] = useState<Date>()
  
  const [formData, setFormData] = useState({
    poolNumber: '',
    quotaType: '' as 'Permanent' | 'Project' | '',
    totalQuota: ''
  })

  const quotaTypes = [
    { value: 'Project', label: 'Project', icon: Briefcase },
    { value: 'Permanent', label: 'Permanent', icon: Clock }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.poolNumber || !formData.totalQuota || !expiryDate) {
      toast.error('Please fill in Quota Pool Number, No. of Approved Quota Slots, and Quota Expiry Date')
      return
    }

    if (isNaN(Number(formData.totalQuota)) || Number(formData.totalQuota) <= 0) {
      toast.error('Please enter a valid number for approved quota slots')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Map quota type to the expected format
      const mappedQuotaType = formData.quotaType === 'Project' ? 'project' : 'budget'
      
      onCreateQuota({
        poolNumber: formData.poolNumber,
        poolName: project.projectName, // Use project name automatically
        department: 'Project Management', // Set a default department
        quotaType: mappedQuotaType,
        totalQuota: Number(formData.totalQuota),
        expiryDate: expiryDate,
        manager: 'Project Manager', // Set a default manager
        description: `Quota pool for ${project.projectName} - ${formData.quotaType} quota allocation`,
        projectId: project.id
      })

      toast.success('Quota pool created successfully!')
      
      // Reset form
      setFormData({
        poolNumber: '',
        quotaType: '',
        totalQuota: ''
      })
      setExpiryDate(undefined)
      setOpen(false)
    } catch (error) {
      toast.error('Failed to create quota pool. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="w-full"
        >
          <Target className="h-4 w-4 mr-2" />
          Quota
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden p-0 sm:w-[92vw] sm:max-w-[92vw] sm:h-[92vh] sm:max-h-[92vh] md:w-[90vw] md:max-w-[90vw] md:h-[90vh] md:max-h-[90vh] lg:w-[88vw] lg:max-w-[88vw] lg:h-[88vh] lg:max-h-[88vh] xl:w-[85vw] xl:max-w-[85vw] xl:h-[85vh] xl:max-h-[85vh] 2xl:w-[80vw] 2xl:max-w-[80vw] 2xl:h-[80vh] 2xl:max-h-[80vh]">
        <DialogHeader className="p-4 sm:p-6 md:p-8 pb-4 sm:pb-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            Create Quota Pool for {project.projectName}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Set up a new quota pool with manual pool number and approved quota slots for this project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8">
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6 lg:space-y-8 pt-4 sm:pt-6 pb-4 sm:pb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Project Information Display */}
            <div className="space-y-3 p-4 sm:p-6 bg-muted/30 rounded-lg border-l-4 border-primary">
              <h4 className="font-medium text-sm sm:text-base text-primary">Project Details</h4>
              <div className="space-y-2 text-sm sm:text-base">
                <div>
                  <span className="font-medium">Project Name:</span> {project.projectName}
                </div>
                <div>
                  <span className="font-medium">Site:</span> {project.siteName}
                </div>
                <div>
                  <span className="font-medium">Client:</span> {project.clientName}
                </div>
              </div>
            </div>

            {/* Required Fields Section */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-muted/30 rounded-lg border-l-4 border-destructive">
              <h4 className="font-medium text-sm sm:text-base text-destructive">Required Fields</h4>
              
              {/* Quota Pool Number */}
              <div className="space-y-2">
                <Label htmlFor="poolNumber" className="text-sm sm:text-base font-medium">
                  Quota Pool Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="poolNumber"
                  placeholder="Enter quota pool number (e.g., QP-2024-007)"
                  value={formData.poolNumber}
                  onChange={(e) => handleInputChange('poolNumber', e.target.value)}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter a unique identifier for this quota pool
                </p>
              </div>

              {/* No. of Approved Quota Slots */}
              <div className="space-y-2">
                <Label htmlFor="totalQuota" className="text-sm sm:text-base font-medium">
                  No. of Approved Quota Slots <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalQuota"
                  type="number"
                  placeholder="Enter number or amount"
                  value={formData.totalQuota}
                  onChange={(e) => handleInputChange('totalQuota', e.target.value)}
                  min="1"
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  For budget quotas: enter monetary amount (e.g., 50000)
                </p>
              </div>

              {/* Quota Expiry Date */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">
                  Quota Expiry Date <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10 sm:h-12 text-sm sm:text-base"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? formatDate(expiryDate) : "Select expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="font-medium text-sm sm:text-base text-muted-foreground">Optional Fields</h4>
              
              {/* Quota Type */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">
                  Quota Type
                </Label>
                <Select value={formData.quotaType} onValueChange={(value) => handleInputChange('quotaType', value)}>
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue placeholder="Select quota type" />
                  </SelectTrigger>
                  <SelectContent>
                    {quotaTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Project: Tied to specific project timeline • Permanent: Long-term allocation
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 sm:flex-none h-10 sm:h-12 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none h-10 sm:h-12 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Creating...' : 'Create Quota Pool'}
              </Button>
            </div>
          </motion.form>
        </div>
      </DialogContent>
    </Dialog>
  )
}