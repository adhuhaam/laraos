"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Separator } from './ui/separator'
import { 
  User, Shield, CheckCircle, AlertTriangle, 
  Crown, UserCheck, Building2, Users, Key
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  department: string
  avatar?: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  color: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface UserRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  roles: Role[]
  onRoleUpdate: (userId: string, newRole: string) => void
}

export function UserRoleDialog({ 
  open, 
  onOpenChange, 
  user, 
  roles, 
  onRoleUpdate 
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && open) {
      setSelectedRole(user.role)
    }
  }, [user, open])

  useEffect(() => {
    if (!open) {
      setSelectedRole('')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!user || !selectedRole) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onRoleUpdate(user.id, selectedRole)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update user role')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super admin': return Crown
      case 'hr manager': return UserCheck
      case 'project manager': return Building2
      case 'hr staff': return Users
      case 'employee': return User
      default: return Shield
    }
  }

  const getRoleRisk = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super admin': return { level: 'high', message: 'Full system access - use with caution' }
      case 'hr manager': return { level: 'medium', message: 'Elevated privileges for HR operations' }
      case 'project manager': return { level: 'medium', message: 'Project and quota management access' }
      case 'hr staff': return { level: 'low', message: 'Standard HR operations access' }
      case 'employee': return { level: 'low', message: 'Basic user access' }
      default: return { level: 'low', message: 'Standard access level' }
    }
  }

  if (!user) return null

  const currentRole = roles.find(r => r.name === user.role)
  const newRole = roles.find(r => r.name === selectedRole)
  const roleRisk = newRole ? getRoleRisk(newRole.name) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Edit User Role</span>
          </DialogTitle>
          <DialogDescription>
            Change the role and permissions for {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Department: {user.department}
                    </span>
                    <Badge className={
                      user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      user.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Role */}
          <div>
            <Label className="text-base font-medium mb-3 block">Current Role</Label>
            {currentRole && (
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/30">
                {(() => {
                  const CurrentRoleIcon = getRoleIcon(currentRole.name)
                  return (
                    <>
                      <div className={`w-10 h-10 ${currentRole.color} rounded-lg flex items-center justify-center text-white`}>
                        <CurrentRoleIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{currentRole.name}</h4>
                        <p className="text-sm text-muted-foreground">{currentRole.description}</p>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          <Separator />

          {/* Role Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Select New Role</Label>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              <div className="space-y-3">
                {roles.map((role) => {
                  const RoleIcon = getRoleIcon(role.name)
                  const isCurrentRole = role.name === user.role
                  const riskInfo = getRoleRisk(role.name)
                  
                  return (
                    <div key={role.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={role.name} id={role.id} />
                      <label 
                        htmlFor={role.id} 
                        className={`flex-1 flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRole === role.name 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-muted/50'
                        } ${isCurrentRole ? 'opacity-75' : ''}`}
                      >
                        <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center text-white`}>
                          <RoleIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{role.name}</h4>
                            {role.isSystem && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                            {isCurrentRole && (
                              <Badge variant="outline" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>{role.userCount} users</span>
                            <span>
                              {role.permissions.includes('*') ? 'All' : role.permissions.length} permissions
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {riskInfo.level === 'high' && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">High Risk</span>
                            </div>
                          )}
                          {riskInfo.level === 'medium' && (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">Medium Risk</span>
                            </div>
                          )}
                          {riskInfo.level === 'low' && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-xs">Low Risk</span>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Risk Warning */}
          {roleRisk && roleRisk.level === 'high' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">High Risk Role Assignment</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {roleRisk.message}. This role provides extensive system access and should only be assigned to trusted administrators.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Permission Preview */}
          {newRole && selectedRole !== user.role && (
            <div>
              <Label className="text-base font-medium mb-3 block">Permission Changes</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Permissions:</span>
                      <Badge variant="secondary">
                        {newRole.permissions.includes('*') ? 'All System Permissions' : `${newRole.permissions.length} permissions`}
                      </Badge>
                    </div>
                    {!newRole.permissions.includes('*') && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Key Permissions:</span>
                        <div className="flex flex-wrap gap-1">
                          {newRole.permissions.slice(0, 6).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {newRole.permissions.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{newRole.permissions.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedRole || selectedRole === user.role || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Updating...
                </div>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Update Role
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}