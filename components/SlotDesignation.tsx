"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Tag,
  Briefcase,
  UserCheck,
  Zap,
  Target,
  Award,
  Building2,
  User,
  Calendar,
  Search,
  Filter,
  X,
  Maximize2,
  Minimize2,
  Square,
  Save,
  RotateCcw,
  Lightbulb,
  Palette,
  Eye,
  Copy,
  Archive
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface SlotDesignation {
  id: string
  name: string
  description: string
  category: 'technical' | 'management' | 'support' | 'specialized'
  icon: string
  color: string
  createdDate: string
  isActive: boolean
}

interface SlotDesignationProps {
  searchQuery?: string
}

type WindowState = 'normal' | 'maximized' | 'minimized'

export function SlotDesignation({ searchQuery = '' }: SlotDesignationProps) {
  // Empty state - no dummy data
  const [designations, setDesignations] = useState<SlotDesignation[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingDesignation, setEditingDesignation] = useState<SlotDesignation | null>(null)
  const [filterCategory, setFilterCategory] = useState<'all' | 'technical' | 'management' | 'support' | 'specialized'>('all')
  const [dialogState, setDialogState] = useState<WindowState>('maximized')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as 'technical' | 'management' | 'support' | 'specialized' | '',
    icon: 'User',
    color: 'blue'
  })

  // Load designations from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('slotDesignations')
    if (saved) {
      try {
        setDesignations(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse saved designations:', error)
        setDesignations([])
      }
    }
  }, [])

  const categories = [
    { value: 'technical', label: 'Technical', icon: Zap, description: 'Development, engineering, and technical roles' },
    { value: 'management', label: 'Management', icon: Target, description: 'Leadership, project management, and oversight' },
    { value: 'support', label: 'Support', icon: UserCheck, description: 'Business analysis, documentation, and support' },
    { value: 'specialized', label: 'Specialized', icon: Award, description: 'DevOps, security, and specialized technical roles' }
  ]

  const iconOptions = [
    'User', 'Zap', 'Target', 'Award', 'Briefcase', 'Building2', 'UserCheck', 'Tag'
  ]

  const colorOptions = [
    { name: 'blue', value: 'blue' },
    { name: 'green', value: 'green' },
    { name: 'purple', value: 'purple' },
    { name: 'orange', value: 'orange' },
    { name: 'red', value: 'red' },
    { name: 'pink', value: 'pink' },
    { name: 'yellow', value: 'yellow' },
    { name: 'teal', value: 'teal' },
    { name: 'gray', value: 'gray' }
  ]

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      User, Zap, Target, Award, Briefcase, Building2, UserCheck, Tag
    }
    return icons[iconName] || User
  }

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
    return colors[color] || colors.blue
  }

  const getBackgroundColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      yellow: 'bg-yellow-500',
      teal: 'bg-teal-500',
      gray: 'bg-gray-500'
    }
    return colors[color] || colors.blue
  }

  const effectiveSearchQuery = searchQuery || localSearchQuery

  const filteredDesignations = designations.filter(designation => {
    const matchesSearch = designation.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
                         designation.description.toLowerCase().includes(effectiveSearchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || designation.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      icon: 'User',
      color: 'blue'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const newDesignation: SlotDesignation = {
        id: editingDesignation ? editingDesignation.id : Date.now().toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        icon: formData.icon,
        color: formData.color,
        createdDate: editingDesignation ? editingDesignation.createdDate : new Date().toISOString().split('T')[0],
        isActive: true
      }

      let updatedDesignations
      if (editingDesignation) {
        updatedDesignations = designations.map(d => d.id === editingDesignation.id ? newDesignation : d)
        toast.success('Designation updated successfully!')
      } else {
        updatedDesignations = [newDesignation, ...designations]
        toast.success('Designation created successfully!')
      }

      setDesignations(updatedDesignations)
      localStorage.setItem('slotDesignations', JSON.stringify(updatedDesignations))

      // Reset form and close dialog
      resetForm()
      setCreateDialogOpen(false)
      setEditingDesignation(null)
      setDialogState('maximized')
    } catch (error) {
      toast.error('Failed to save designation. Please try again.')
    }
  }

  const handleEdit = (designation: SlotDesignation) => {
    setEditingDesignation(designation)
    setFormData({
      name: designation.name,
      description: designation.description,
      category: designation.category,
      icon: designation.icon,
      color: designation.color
    })
    setCreateDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this designation?')) return
    
    const updatedDesignations = designations.filter(d => d.id !== id)
    setDesignations(updatedDesignations)
    localStorage.setItem('slotDesignations', JSON.stringify(updatedDesignations))
    toast.success('Designation deleted successfully!')
  }

  const handleDuplicate = (designation: SlotDesignation) => {
    const duplicatedDesignation: SlotDesignation = {
      ...designation,
      id: Date.now().toString(),
      name: `${designation.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0]
    }
    
    const updatedDesignations = [duplicatedDesignation, ...designations]
    setDesignations(updatedDesignations)
    localStorage.setItem('slotDesignations', JSON.stringify(updatedDesignations))
    toast.success('Designation duplicated successfully!')
  }

  const getStats = () => {
    const total = designations.length
    const active = designations.filter(d => d.isActive).length
    const byCategory = categories.map(cat => ({
      category: cat.label,
      count: designations.filter(d => d.category === cat.value).length,
      icon: cat.icon
    }))
    
    return { total, active, byCategory }
  }

  // Optimized dialog classes for maximum space utilization
  const getDialogClasses = (windowState: WindowState) => {
    switch (windowState) {
      case 'maximized':
        return 'max-w-screen max-h-screen w-full h-full m-0 rounded-none overflow-hidden'
      case 'normal':
        return 'w-auto min-w-[900px] max-w-[95vw] h-auto max-h-[90vh] overflow-y-auto m-2 rounded-lg'
      case 'minimized':
        return 'w-80 h-16 max-w-none max-h-none fixed bottom-4 right-4 rounded-lg overflow-hidden'
      default:
        return 'max-w-screen max-h-screen w-full h-full m-0 rounded-none overflow-hidden'
    }
  }

  const WindowControls = ({ 
    windowState, 
    onMinimize, 
    onMaximize, 
    onClose, 
    title 
  }: {
    windowState: WindowState
    onMinimize: () => void
    onMaximize: () => void
    onClose: () => void
    title: string
  }) => (
    <div className="flex items-center gap-1">
      {windowState === 'minimized' && (
        <span className="text-sm font-medium text-muted-foreground mr-2 truncate flex-1">
          {title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMinimize}
        className="h-6 w-6 hover:bg-yellow-100 hover:text-yellow-700"
        title="Minimize"
      >
        <Minimize2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMaximize}
        className="h-6 w-6 hover:bg-green-100 hover:text-green-700"
        title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
      >
        {windowState === 'maximized' ? <Square className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-6 w-6 hover:bg-red-100 hover:text-red-700"
        title="Close"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )

  const stats = getStats()

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Slot Designations</h2>
          <p className="text-muted-foreground">Manage role designations for quota slots</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDesignation(null)
              resetForm()
              setDialogState('maximized')
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Designation
            </Button>
          </DialogTrigger>
          
          {/* Optimized Modal with maximum space utilization */}
          <DialogContent className={getDialogClasses(dialogState)}>
            <div className="flex flex-col h-full">
              <DialogHeader className="flex-shrink-0 p-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg">
                      {editingDesignation ? 'Edit Designation' : 'Create New Designation'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {editingDesignation 
                        ? 'Update the designation details and settings.' 
                        : 'Create a new role designation that can be assigned to quota slots.'
                      }
                    </DialogDescription>
                  </div>
                  <WindowControls
                    windowState={dialogState}
                    onMinimize={() => setDialogState('minimized')}
                    onMaximize={() => setDialogState(dialogState === 'maximized' ? 'normal' : 'maximized')}
                    onClose={() => setCreateDialogOpen(false)}
                    title={editingDesignation ? 'Edit Designation' : 'Create Designation'}
                  />
                </div>
              </DialogHeader>
              
              {dialogState !== 'minimized' && (
                <ScrollArea className="flex-1">
                  <form onSubmit={handleSubmit} className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Form Fields */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Designation Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., Senior Developer"
                            className="h-9"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full h-9 px-3 py-2 border border-border rounded-md bg-background text-sm"
                          >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="icon" className="text-sm font-medium">
                              Icon
                            </Label>
                            <select
                              id="icon"
                              value={formData.icon}
                              onChange={(e) => handleInputChange('icon', e.target.value)}
                              className="w-full h-9 px-3 py-2 border border-border rounded-md bg-background text-sm"
                            >
                              {iconOptions.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Color Theme</Label>
                            <div className="flex gap-1 flex-wrap pt-1">
                              {colorOptions.map(color => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => handleInputChange('color', color.value)}
                                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                    formData.color === color.value 
                                      ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                                      : 'border-border hover:border-primary/50'
                                  } ${getBackgroundColor(color.value)}`}
                                  title={color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Brief description of the role and responsibilities..."
                            rows={4}
                            className="resize-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Right Column - Preview and Additional Info */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Live Preview</Label>
                          <div className="p-4 border-2 border-dashed border-border rounded-lg bg-muted/30">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${getColorClasses(formData.color)} transition-all`}>
                                {(() => {
                                  const IconComponent = getIcon(formData.icon)
                                  return <IconComponent className="h-5 w-5" />
                                })()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium mb-2 break-words">
                                  {formData.name || 'Designation Name'}
                                </h4>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  <Badge className={`${getColorClasses(formData.color)} text-xs`} variant="secondary">
                                    {formData.category || 'category'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Active
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                                {formData.description || 'Description will appear here...'}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                                <span>Created: {new Date().toLocaleDateString()}</span>
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Active
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Category Information */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Category Information</Label>
                          <div className="space-y-2">
                            {categories.map(cat => (
                              <div 
                                key={cat.value}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                  formData.category === cat.value 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border bg-background hover:bg-muted/30'
                                }`}
                                onClick={() => handleInputChange('category', cat.value)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-md ${
                                    formData.category === cat.value 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    <cat.icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{cat.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {cat.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCreateDialogOpen(false)
                          resetForm()
                          setEditingDesignation(null)
                        }}
                        className="flex-1 h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="h-9"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 h-9"
                        disabled={!formData.name || !formData.description || !formData.category}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingDesignation ? 'Update' : 'Create'} Designation
                      </Button>
                    </div>
                  </form>
                </ScrollArea>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{stats.active}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>

        {stats.byCategory.map((cat) => (
          <Card key={cat.category}>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{cat.count}</div>
                <div className="text-xs text-muted-foreground">{cat.category}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State or Designations List */}
      {filteredDesignations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                <Tag className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No slot designations found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {effectiveSearchQuery || filterCategory !== 'all'
                    ? 'Try adjusting your search filters to find designations.'
                    : 'Start by creating your first slot designation to organize quota slots by role types.'}
                </p>
              </div>
              {!effectiveSearchQuery && filterCategory === 'all' && (
                <Button onClick={() => {
                  setEditingDesignation(null)
                  resetForm()
                  setDialogState('maximized')
                  setCreateDialogOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Designation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Designations Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDesignations.map((designation) => (
            <Card key={designation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(designation.color)}`}>
                    {(() => {
                      const IconComponent = getIcon(designation.icon)
                      return <IconComponent className="h-5 w-5" />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-2 break-words">{designation.name}</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge className={`${getColorClasses(designation.color)} text-xs`} variant="secondary">
                        {designation.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {designation.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">
                    {designation.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>Created: {new Date(designation.createdDate).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(designation)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(designation)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(designation.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      {designations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search designations..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </motion.div>
  )
}