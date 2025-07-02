"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { 
  Shield, Plus, AlertTriangle, CheckCircle, 
  Users, Building2, Database, UserCheck, BarChart3, 
  Settings, Eye, Key, Loader2, Palette
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
}

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissions: Permission[]
  onRoleCreate: (role: {
    name: string
    description: string
    permissions: string[]
    color: string
    isSystem: boolean
  }) => void
}

const roleColors = [
  { name: 'Blue', value: 'bg-blue-500', class: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500', class: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500', class: 'bg-purple-500' },
  { name: 'Red', value: 'bg-red-500', class: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500', class: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500', class: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500', class: 'bg-indigo-500' },
  { name: 'Teal', value: 'bg-teal-500', class: 'bg-teal-500' },
  { name: 'Yellow', value: 'bg-yellow-500', class: 'bg-yellow-500' },
  { name: 'Gray', value: 'bg-gray-500', class: 'bg-gray-500' }
]

export function CreateRoleDialog({ 
  open, 
  onOpenChange, 
  permissions, 
  onRoleCreate 
}: CreateRoleDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500'
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [selectAllByCategory, setSelectAllByCategory] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        color: 'bg-blue-500'
      })
      setSelectedPermissions([])
      setSelectAllByCategory({})
      setErrors({})
    }
  }, [open])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Role name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Role description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onRoleCreate({
        name: formData.name,
        description: formData.description,
        permissions: selectedPermissions,
        color: formData.color,
        isSystem: false
      })
      
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to create role')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
    
    // Clear permissions error if user selects at least one permission
    if (errors.permissions && selectedPermissions.length === 0) {
      setErrors(prev => ({ ...prev, permissions: '' }))
    }
  }

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = permissionsByCategory[category]
    const categoryPermissionIds = categoryPermissions.map(p => p.id)
    const allSelected = categoryPermissionIds.every(id => selectedPermissions.includes(id))

    if (allSelected) {
      // Remove all permissions from this category
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissionIds.includes(id)))
      setSelectAllByCategory(prev => ({ ...prev, [category]: false }))
    } else {
      // Add all permissions from this category
      setSelectedPermissions(prev => {
        const newIds = categoryPermissionIds.filter(id => !prev.includes(id))
        return [...prev, ...newIds]
      })
      setSelectAllByCategory(prev => ({ ...prev, [category]: true }))
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'user management': return Users
      case 'project management': return Building2
      case 'quota management': return Database
      case 'candidate management': return UserCheck
      case 'reports & analytics': return BarChart3
      case 'system administration': return Settings
      case 'basic access': return Eye
      default: return Key
    }
  }

  const getSelectedColor = () => {
    return roleColors.find(color => color.value === formData.color) || roleColors[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Create New Role</span>
          </DialogTitle>
          <DialogDescription>
            Create a custom role with specific permissions for your team members
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Role Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Senior HR Manager"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, name: e.target.value }))
                          if (errors.name) {
                            setErrors(prev => ({ ...prev, name: '' }))
                          }
                        }}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Role Color</Label>
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 ${formData.color} rounded-lg flex items-center justify-center`}>
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <select
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                        >
                          {roleColors.map((color) => (
                            <option key={color.value} value={color.value}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the responsibilities and scope of this role..."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }))
                        if (errors.description) {
                          setErrors(prev => ({ ...prev, description: '' }))
                        }
                      }}
                      rows={3}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{errors.description}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Permissions *</CardTitle>
                    <Badge variant="secondary">
                      {selectedPermissions.length} of {permissions.length} selected
                    </Badge>
                  </div>
                  {errors.permissions && (
                    <p className="text-sm text-destructive flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{errors.permissions}</span>
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                    const CategoryIcon = getCategoryIcon(category)
                    const categoryPermissionIds = categoryPermissions.map(p => p.id)
                    const selectedInCategory = selectedPermissions.filter(id => categoryPermissionIds.includes(id)).length
                    const allSelected = selectedInCategory === categoryPermissions.length
                    const someSelected = selectedInCategory > 0 && selectedInCategory < categoryPermissions.length

                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={allSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = someSelected
                              }}
                              onCheckedChange={() => handleCategoryToggle(category)}
                            />
                            <div className="flex items-center space-x-2">
                              <CategoryIcon className="h-4 w-4 text-primary" />
                              <h4 className="font-medium">{category}</h4>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {selectedInCategory}/{categoryPermissions.length}
                          </Badge>
                        </div>
                        
                        <div className="ml-6 grid gap-2 md:grid-cols-2">
                          {categoryPermissions.map((permission) => (
                            <div 
                              key={permission.id}
                              className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">{permission.name}</h5>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {Object.keys(permissionsByCategory).indexOf(category) < Object.keys(permissionsByCategory).length - 1 && (
                          <Separator />
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Role Preview */}
              {formData.name && formData.description && selectedPermissions.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Role Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${formData.color} rounded-lg flex items-center justify-center text-white`}>
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{formData.name}</h3>
                        <p className="text-muted-foreground mt-1">{formData.description}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedPermissions.length} permissions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getSelectedColor().name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </div>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}