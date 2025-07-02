import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  Key,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  Plus,
  X
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData, User, Role } from './HRDataContext'

interface CreateUserFormData {
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string
  department: string
  designation: string
  roleId: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  employeeId?: string
}

const departments = [
  'Human Resources',
  'Information Technology',
  'Construction',
  'Engineering',
  'Administration',
  'Finance',
  'Operations',
  'Legal',
  'Marketing',
  'Procurement'
]

export function UserManagement() {
  const { 
    users, 
    roles, 
    addUser, 
    updateUser, 
    deleteUser, 
    activateUser, 
    deactivateUser, 
    resetUserPassword, 
    lockUser, 
    unlockUser 
  } = useHRData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [createFormData, setCreateFormData] = useState<CreateUserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    designation: '',
    roleId: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    employeeId: ''
  })

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.designation.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesRole = roleFilter === 'all' || user.roleId === roleFilter
      
      return matchesSearch && matchesStatus && matchesRole
    }).sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [users, searchQuery, statusFilter, roleFilter])

  // Create new user
  const handleCreateUser = async () => {
    if (!createFormData.username || !createFormData.email || !createFormData.firstName || 
        !createFormData.lastName || !createFormData.roleId) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if username or email already exists
    const existingUser = users.find(u => 
      u.username === createFormData.username || u.email === createFormData.email
    )
    if (existingUser) {
      toast.error('Username or email already exists')
      return
    }

    setIsLoading(true)

    try {
      const selectedRole = roles.find(r => r.id === createFormData.roleId)
      if (!selectedRole) {
        throw new Error('Selected role not found')
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        username: createFormData.username,
        email: createFormData.email,
        firstName: createFormData.firstName,
        lastName: createFormData.lastName,
        fullName: `${createFormData.firstName} ${createFormData.lastName}`,
        phone: createFormData.phone,
        department: createFormData.department,
        designation: createFormData.designation,
        roleId: createFormData.roleId,
        roleName: selectedRole.name,
        permissions: selectedRole.permissions,
        status: 'active',
        loginAttempts: 0,
        isLocked: false,
        emailVerified: false,
        passwordResetRequired: true,
        twoFactorEnabled: false,
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'Asia/Male',
          notifications: {
            email: true,
            push: false,
            sms: false
          }
        },
        address: createFormData.address,
        emergencyContact: createFormData.emergencyContactName ? {
          name: createFormData.emergencyContactName,
          phone: createFormData.emergencyContactPhone,
          relationship: createFormData.emergencyContactRelationship
        } : undefined,
        employeeId: createFormData.employeeId || undefined,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'current-user',
        updatedBy: 'current-user'
      }

      addUser(newUser)
      
      // Reset form
      setCreateFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        department: '',
        designation: '',
        roleId: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        employeeId: ''
      })
      
      setIsCreateDialogOpen(false)
      toast.success('User created successfully')
    } catch (error) {
      toast.error('Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle user actions
  const handleUserAction = async (action: string, user: User) => {
    setIsLoading(true)
    
    try {
      switch (action) {
        case 'activate':
          activateUser(user.id)
          toast.success(`${user.fullName} has been activated`)
          break
        case 'deactivate':
          deactivateUser(user.id)
          toast.success(`${user.fullName} has been deactivated`)
          break
        case 'lock':
          lockUser(user.id)
          toast.success(`${user.fullName} has been locked`)
          break
        case 'unlock':
          unlockUser(user.id)
          toast.success(`${user.fullName} has been unlocked`)
          break
        case 'reset-password':
          resetUserPassword(user.id)
          toast.success(`Password reset requested for ${user.fullName}`)
          break
        case 'delete':
          deleteUser(user.id)
          toast.success(`${user.fullName} has been deleted`)
          setIsDeleteDialogOpen(false)
          break
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`)
    } finally {
      setIsLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (user: User) => {
    if (user.isLocked) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Lock className="h-3 w-3" />
        Locked
      </Badge>
    }
    
    switch (user.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      case 'inactive':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>
      case 'suspended':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Suspended
        </Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Format last login
  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60 * 1000) return 'Just now'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} minutes ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage system users, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new system user with role and permissions
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="role">Role & Department</TabsTrigger>
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        placeholder="john.doe"
                        value={createFormData.username}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          username: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@rcc.mv"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={createFormData.firstName}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={createFormData.lastName}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+960 777 0000"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="role" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={createFormData.roleId}
                      onValueChange={(value) => setCreateFormData(prev => ({
                        ...prev,
                        roleId: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{role.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {role.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={createFormData.department}
                      onValueChange={(value) => setCreateFormData(prev => ({
                        ...prev,
                        department: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      placeholder="HR Manager"
                      value={createFormData.designation}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        designation: e.target.value
                      }))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Full address"
                      value={createFormData.address}
                      onChange={(e) => setCreateFormData(prev => ({
                        ...prev,
                        address: e.target.value
                      }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <Label className="text-base">Emergency Contact</Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Name</Label>
                        <Input
                          id="emergencyName"
                          placeholder="Contact name"
                          value={createFormData.emergencyContactName}
                          onChange={(e) => setCreateFormData(prev => ({
                            ...prev,
                            emergencyContactName: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Phone</Label>
                        <Input
                          id="emergencyPhone"
                          placeholder="+960 777 0000"
                          value={createFormData.emergencyContactPhone}
                          onChange={(e) => setCreateFormData(prev => ({
                            ...prev,
                            emergencyContactPhone: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelationship">Relationship</Label>
                      <Input
                        id="emergencyRelationship"
                        placeholder="Spouse, Parent, Sibling, etc."
                        value={createFormData.emergencyContactRelationship}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          emergencyContactRelationship: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredUsers.length} users
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username} • {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Shield className="h-3 w-3" />
                        {user.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.department}</div>
                        <div className="text-sm text-muted-foreground">{user.designation}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatLastLogin(user.lastLogin)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setIsEditDialogOpen(true)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          
                          {user.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleUserAction('deactivate', user)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUserAction('activate', user)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          
                          {user.isLocked ? (
                            <DropdownMenuItem onClick={() => handleUserAction('unlock', user)}>
                              <Unlock className="h-4 w-4 mr-2" />
                              Unlock
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUserAction('lock', user)}>
                              <Lock className="h-4 w-4 mr-2" />
                              Lock
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleUserAction('reset-password', user)}>
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
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
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                  ? "No users match your current filters."
                  : "Get started by creating your first user."}
              </p>
              {(!searchQuery && statusFilter === 'all' && roleFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && handleUserAction('delete', selectedUser)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}