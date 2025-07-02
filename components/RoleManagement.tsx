"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Users, Shield, Settings, Plus, Search, Filter, 
  Edit3, Trash2, Eye, MoreHorizontal, UserCheck,
  Lock, Unlock, AlertTriangle, CheckCircle, 
  UserPlus, Crown, Key, Activity, Database,
  FileText, Building2, Calculator, Tag, UserMinus, User
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table'
import { UserRoleDialog } from './UserRoleDialog'
import { RolePermissionsDialog } from './RolePermissionsDialog'
import { CreateRoleDialog } from './CreateRoleDialog'
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

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
}

const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: ['*'],
    userCount: 2,
    color: 'bg-red-500',
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'HR Manager',
    description: 'Manage HR operations, projects, and quota pools',
    permissions: ['users.view', 'users.create', 'users.edit', 'projects.manage', 'quotas.manage', 'reports.view'],
    userCount: 5,
    color: 'bg-blue-500',
    isSystem: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Project Manager',
    description: 'Manage assigned projects and quota allocations',
    permissions: ['projects.view', 'projects.edit', 'quotas.view', 'quotas.edit', 'candidates.view'],
    userCount: 12,
    color: 'bg-green-500',
    isSystem: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'HR Staff',
    description: 'Basic HR operations and candidate management',
    permissions: ['candidates.view', 'candidates.create', 'candidates.edit', 'quotas.view'],
    userCount: 8,
    color: 'bg-purple-500',
    isSystem: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10'
  },
  {
    id: '5',
    name: 'Employee',
    description: 'Basic access to personal information and company resources',
    permissions: ['profile.view', 'profile.edit', 'dashboard.view'],
    userCount: 156,
    color: 'bg-gray-500',
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Super Admin',
    status: 'active',
    lastLogin: '2024-01-25 09:30',
    department: 'IT'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'HR Manager',
    status: 'active',
    lastLogin: '2024-01-25 08:15',
    department: 'HR'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    role: 'Project Manager',
    status: 'active',
    lastLogin: '2024-01-24 16:45',
    department: 'Operations'
  },
  {
    id: '4',
    name: 'Lisa Chen',
    email: 'lisa.chen@company.com',
    role: 'HR Staff',
    status: 'inactive',
    lastLogin: '2024-01-20 14:20',
    department: 'HR'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.wilson@company.com',
    role: 'Employee',
    status: 'suspended',
    lastLogin: '2024-01-15 11:30',
    department: 'Finance'
  }
]

const permissions: Permission[] = [
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user profiles and information', category: 'User Management', resource: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'User Management', resource: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Modify user profiles and settings', category: 'User Management', resource: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Remove user accounts', category: 'User Management', resource: 'users' },
  
  // Project Management
  { id: 'projects.view', name: 'View Projects', description: 'View project details and status', category: 'Project Management', resource: 'projects' },
  { id: 'projects.create', name: 'Create Projects', description: 'Create new projects', category: 'Project Management', resource: 'projects' },
  { id: 'projects.edit', name: 'Edit Projects', description: 'Modify project details', category: 'Project Management', resource: 'projects' },
  { id: 'projects.manage', name: 'Manage Projects', description: 'Full project management access', category: 'Project Management', resource: 'projects' },
  
  // Quota Management
  { id: 'quotas.view', name: 'View Quotas', description: 'View quota pools and allocations', category: 'Quota Management', resource: 'quotas' },
  { id: 'quotas.create', name: 'Create Quotas', description: 'Create new quota pools', category: 'Quota Management', resource: 'quotas' },
  { id: 'quotas.edit', name: 'Edit Quotas', description: 'Modify quota allocations', category: 'Quota Management', resource: 'quotas' },
  { id: 'quotas.manage', name: 'Manage Quotas', description: 'Full quota management access', category: 'Quota Management', resource: 'quotas' },
  
  // Candidate Management
  { id: 'candidates.view', name: 'View Candidates', description: 'View candidate profiles', category: 'Candidate Management', resource: 'candidates' },
  { id: 'candidates.create', name: 'Create Candidates', description: 'Add new candidates', category: 'Candidate Management', resource: 'candidates' },
  { id: 'candidates.edit', name: 'Edit Candidates', description: 'Modify candidate information', category: 'Candidate Management', resource: 'candidates' },
  
  // Reports & Analytics
  { id: 'reports.view', name: 'View Reports', description: 'Access reports and analytics', category: 'Reports & Analytics', resource: 'reports' },
  { id: 'reports.create', name: 'Create Reports', description: 'Generate custom reports', category: 'Reports & Analytics', resource: 'reports' },
  
  // System Administration
  { id: 'system.settings', name: 'System Settings', description: 'Modify system configuration', category: 'System Administration', resource: 'system' },
  { id: 'system.logs', name: 'System Logs', description: 'Access system audit logs', category: 'System Administration', resource: 'system' },
  
  // Basic Access
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access main dashboard', category: 'Basic Access', resource: 'dashboard' },
  { id: 'profile.view', name: 'View Profile', description: 'View own profile', category: 'Basic Access', resource: 'profile' },
  { id: 'profile.edit', name: 'Edit Profile', description: 'Edit own profile', category: 'Basic Access', resource: 'profile' }
]

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles)
  const [users, setUsers] = useState<User[]>(defaultUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [rolePermissionsDialogOpen, setRolePermissionsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleUserStatusToggle = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' | 'suspended' }
        : user
    ))
    toast.success('User status updated successfully')
  }

  const handleBulkStatusUpdate = (status: 'active' | 'inactive' | 'suspended') => {
    setUsers(prev => prev.map(user => 
      selectedUsers.includes(user.id) ? { ...user, status } : user
    ))
    setSelectedUsers([])
    toast.success(`${selectedUsers.length} users updated to ${status}`)
  }

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) {
      toast.error('Cannot delete system roles')
      return
    }
    
    setRoles(prev => prev.filter(r => r.id !== roleId))
    toast.success('Role deleted successfully')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and access control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Audit Log
          </Button>
          <Button onClick={() => setCreateRoleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {roles.filter(r => !r.isSystem).length} custom roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Set(permissions.map(p => p.category)).size} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'suspended').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Role: {roleFilter === 'all' ? 'All' : roleFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                    All Roles
                  </DropdownMenuItem>
                  {roles.map(role => (
                    <DropdownMenuItem key={role.id} onClick={() => setRoleFilter(role.name)}>
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Status: {statusFilter === 'all' ? 'All' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>Suspended</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('inactive')}>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Deactivate Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('suspended')}>
                      <Lock className="h-4 w-4 mr-2" />
                      Suspend Users
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(prev => [...prev, user.id])
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id))
                            }
                          }}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const RoleIcon = getRoleIcon(user.role)
                            const role = roles.find(r => r.name === user.role)
                            return (
                              <>
                                <div className={`w-2 h-2 rounded-full ${role?.color || 'bg-gray-500'}`} />
                                <span>{user.role}</span>
                              </>
                            )
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user)
                                setUserRoleDialogOpen(true)
                              }}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserStatusToggle(user.id)}>
                              {user.status === 'active' ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
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

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const RoleIcon = getRoleIcon(role.name)
              return (
                <Card key={role.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center text-white`}>
                          <RoleIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              System Role
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedRole(role)
                              setRolePermissionsDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Permissions
                          </DropdownMenuItem>
                          {!role.isSystem && (
                            <>
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Role
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {role.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Users:</span>
                        <span className="font-medium">{role.userCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Permissions:</span>
                        <span className="font-medium">
                          {role.permissions.includes('*') ? 'All' : role.permissions.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          {Object.entries(
            permissions.reduce((acc, permission) => {
              if (!acc[permission.category]) {
                acc[permission.category] = []
              }
              acc[permission.category].push(permission)
              return acc
            }, {} as Record<string, Permission[]>)
          ).map(([category, categoryPermissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <Key className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{permission.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UserRoleDialog
        open={userRoleDialogOpen}
        onOpenChange={setUserRoleDialogOpen}
        user={selectedUser}
        roles={roles}
        onRoleUpdate={(userId, newRole) => {
          setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          ))
          toast.success('User role updated successfully')
        }}
      />

      <RolePermissionsDialog
        open={rolePermissionsDialogOpen}
        onOpenChange={setRolePermissionsDialogOpen}
        role={selectedRole}
        permissions={permissions}
      />

      <CreateRoleDialog
        open={createRoleDialogOpen}
        onOpenChange={setCreateRoleDialogOpen}
        permissions={permissions}
        onRoleCreate={(newRole) => {
          setRoles(prev => [...prev, { ...newRole, id: Date.now().toString(), userCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }])
          toast.success('Role created successfully')
        }}
      />
    </div>
  )
}