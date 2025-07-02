"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { 
  Shield, Key, CheckCircle, Crown, UserCheck, 
  Building2, Users, User, Eye, Lock, Database,
  FileText, BarChart3, Settings, Activity
} from 'lucide-react'

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

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
}

interface RolePermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  permissions: Permission[]
}

export function RolePermissionsDialog({ 
  open, 
  onOpenChange, 
  role, 
  permissions 
}: RolePermissionsDialogProps) {
  if (!role) return null

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

  const rolePermissions = role.permissions.includes('*') 
    ? permissions 
    : permissions.filter(p => role.permissions.includes(p.id))

  const permissionsByCategory = rolePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const RoleIcon = getRoleIcon(role.name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center text-white`}>
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">{role.name} Permissions</DialogTitle>
              <DialogDescription>
                Detailed view of all permissions granted to this role
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Role Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm">{role.description}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Users Assigned</Label>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{role.userCount}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Role Type</Label>
                  <div className="flex items-center space-x-2">
                    {role.isSystem ? (
                      <>
                        <Lock className="h-4 w-4 text-yellow-600" />
                        <Badge variant="secondary">System Role</Badge>
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 text-blue-600" />
                        <Badge variant="outline">Custom Role</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Total Permissions:</span>
                  <Badge className="bg-primary text-primary-foreground">
                    {role.permissions.includes('*') ? `All (${permissions.length})` : role.permissions.length}
                  </Badge>
                </div>
                {role.permissions.includes('*') && (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">Full System Access</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions by Category */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions by Category</h3>
            
            {role.permissions.includes('*') ? (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-8 w-8 text-amber-600" />
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-100">
                        Full System Access
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        This role has unrestricted access to all system features and functions. 
                        All {permissions.length} available permissions are granted.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                  const CategoryIcon = getCategoryIcon(category)
                  
                  return (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-base">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                          <span>{category}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {categoryPermissions.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                          {categoryPermissions.map((permission) => (
                            <div 
                              key={permission.id} 
                              className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">{permission.name}</h5>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {permission.description}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {permission.resource}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {permission.id}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Missing Permissions (if not full access) */}
          {!role.permissions.includes('*') && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Restricted Permissions</h3>
              {(() => {
                const missingPermissions = permissions.filter(p => !role.permissions.includes(p.id))
                const missingByCategory = missingPermissions.reduce((acc, permission) => {
                  if (!acc[permission.category]) {
                    acc[permission.category] = []
                  }
                  acc[permission.category].push(permission)
                  return acc
                }, {} as Record<string, Permission[]>)

                return Object.keys(missingByCategory).length > 0 ? (
                  <Card className="border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-red-900 dark:text-red-100">
                        <Lock className="h-5 w-5" />
                        <span>Permissions Not Granted</span>
                        <Badge variant="destructive" className="ml-auto">
                          {missingPermissions.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(missingByCategory).map(([category, categoryPermissions]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-medium text-sm text-red-800 dark:text-red-200">
                              {category} ({categoryPermissions.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {categoryPermissions.map((permission) => (
                                <Badge 
                                  key={permission.id} 
                                  variant="outline" 
                                  className="text-xs text-red-700 dark:text-red-300 border-red-300"
                                >
                                  {permission.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100">
                            All Available Permissions Granted
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            This role has been granted all available system permissions.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          )}

          {/* Role Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Role Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{new Date(role.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p>{new Date(role.updatedAt).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Role ID</Label>
                  <p className="font-mono text-xs">{role.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Permission Count</Label>
                  <p>{role.permissions.includes('*') ? permissions.length : role.permissions.length} permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}