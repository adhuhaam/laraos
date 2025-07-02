"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent } from './ui/card'
import { Plus, Calendar, MapPin, User, Building2, Clock, FileText, Upload, X, Camera, Image as ImageIcon } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface NewProjectData {
  projectName: string
  siteName: string
  clientName: string
  projectStartDate: string
  duration: string
  completionDate: string
  status: 'active' | 'completed' | 'on-hold' | 'planning'
  description: string
  imageUrl: string
}

interface AddProjectDialogProps {
  onAddProject: (project: NewProjectData) => void
}

export function AddProjectDialog({ onAddProject }: AddProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<NewProjectData>({
    projectName: '',
    siteName: '',
    clientName: '',
    projectStartDate: '',
    duration: '',
    completionDate: '',
    status: 'planning',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=250&fit=crop'
  })

  const predefinedImages = [
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=250&fit=crop'
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setUploadedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadPreview(result)
        setFormData(prev => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveUpload = () => {
    setUploadedFile(null)
    setUploadPreview(null)
    setFormData(prev => ({ ...prev, imageUrl: predefinedImages[0] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call with file upload
    await new Promise(resolve => setTimeout(resolve, 2000))

    onAddProject(formData)
    
    // Reset form
    setFormData({
      projectName: '',
      siteName: '',
      clientName: '',
      projectStartDate: '',
      duration: '',
      completionDate: '',
      status: 'planning',
      description: '',
      imageUrl: predefinedImages[0]
    })
    setUploadedFile(null)
    setUploadPreview(null)
    
    setIsSubmitting(false)
    setOpen(false)
  }

  const handleInputChange = (field: keyof NewProjectData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] overflow-y-auto p-0 sm:w-[92vw] sm:max-w-[92vw] sm:h-[92vh] sm:max-h-[92vh] md:w-[90vw] md:max-w-[90vw] md:h-[90vh] md:max-h-[90vh] lg:w-[88vw] lg:max-w-[88vw] lg:h-[88vh] lg:max-h-[88vh] xl:w-[85vw] xl:max-w-[85vw] xl:h-[85vh] xl:max-h-[85vh] 2xl:w-[80vw] 2xl:max-w-[80vw] 2xl:h-[80vh] 2xl:max-h-[80vh]">
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
          <DialogHeader className="pb-4 sm:pb-6 md:pb-8">
            <DialogTitle className="flex items-center space-x-2 text-xl sm:text-2xl lg:text-3xl">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary" />
              <span>Add New Construction Project</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base lg:text-lg">
              Create a new construction project by filling out the project details, timeline, and uploading a project photo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10">
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
              {/* Left Column - Form Fields */}
              <div className="space-y-6 sm:space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center space-x-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      <span>Basic Information</span>
                    </h3>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <Label htmlFor="projectName" className="text-sm sm:text-base">Project Name *</Label>
                        <Input
                          id="projectName"
                          value={formData.projectName}
                          onChange={(e) => handleInputChange('projectName', e.target.value)}
                          placeholder="Enter project name"
                          required
                          className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="siteName" className="text-sm sm:text-base">Site Name *</Label>
                        <Input
                          id="siteName"
                          value={formData.siteName}
                          onChange={(e) => handleInputChange('siteName', e.target.value)}
                          placeholder="Enter site location"
                          required
                          className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="clientName" className="text-sm sm:text-base">Client Name *</Label>
                        <Input
                          id="clientName"
                          value={formData.clientName}
                          onChange={(e) => handleInputChange('clientName', e.target.value)}
                          placeholder="Enter client name"
                          required
                          className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="status" className="text-sm sm:text-base">Project Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger className="mt-2 h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline Information */}
                <Card>
                  <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center space-x-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      <span>Timeline</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <Label htmlFor="projectStartDate" className="text-sm sm:text-base">Start Date *</Label>
                        <Input
                          id="projectStartDate"
                          type="date"
                          value={formData.projectStartDate}
                          onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
                          required
                          className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="completionDate" className="text-sm sm:text-base">Completion Date *</Label>
                        <Input
                          id="completionDate"
                          type="date"
                          value={formData.completionDate}
                          onChange={(e) => handleInputChange('completionDate', e.target.value)}
                          required
                          className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="duration" className="text-sm sm:text-base">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 12 months, 2 years"
                        className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="description" className="text-sm sm:text-base">Project Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the project details..."
                    rows={6}
                    className="mt-2 text-sm sm:text-base resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Photo Upload */}
              <div className="space-y-6 sm:space-y-8">
                <Card>
                  <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center space-x-2">
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      <span>Project Photo</span>
                    </h3>

                    {/* Photo Upload Area */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Current Photo Preview */}
                      <div className="relative h-60 sm:h-80 lg:h-96 xl:h-[28rem] overflow-hidden rounded-lg border-2 border-dashed border-border">
                        {uploadPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={uploadPreview}
                              alt="Uploaded preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveUpload}
                              className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white rounded-full p-1.5 sm:p-2 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/50 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm">
                              Uploaded: {uploadedFile?.name}
                            </div>
                          </div>
                        ) : (
                          <ImageWithFallback
                            src={formData.imageUrl}
                            alt="Project preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Upload Button */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="photo-upload"
                          />
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-dashed hover:from-blue-500/20 hover:to-purple-500/20"
                              asChild
                            >
                              <label htmlFor="photo-upload" className="cursor-pointer flex items-center justify-center space-x-2 sm:space-x-3">
                                <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                                <span>Upload Project Photo</span>
                              </label>
                            </Button>
                          </motion.div>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground text-center">
                          Supported formats: JPEG, PNG, WebP (Max 5MB)
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs sm:text-sm uppercase">
                          <span className="bg-background px-2 sm:px-3 text-muted-foreground">Or choose from gallery</span>
                        </div>
                      </div>

                      {/* Predefined Images Grid */}
                      <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        {predefinedImages.slice(0, 6).map((url, index) => (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() => {
                              if (!uploadPreview) {
                                handleInputChange('imageUrl', url)
                              }
                            }}
                            className={`relative h-20 sm:h-24 lg:h-28 overflow-hidden rounded-md border-2 transition-all ${
                              formData.imageUrl === url && !uploadPreview
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-border hover:border-primary/50'
                            } ${uploadPreview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            whileHover={!uploadPreview ? { scale: 1.05 } : {}}
                            whileTap={!uploadPreview ? { scale: 0.95 } : {}}
                            disabled={!!uploadPreview}
                          >
                            <ImageWithFallback
                              src={url}
                              alt={`Option ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {uploadPreview && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {!uploadPreview && (
                        <div>
                          <Label htmlFor="customImageUrl" className="text-sm sm:text-base">Or paste custom image URL</Label>
                          <Input
                            id="customImageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                            placeholder="https://..."
                            className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px] sm:min-w-[140px] h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <motion.div
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Creating...</span>
                  </motion.div>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}