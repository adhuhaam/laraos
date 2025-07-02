"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  Mail, Send, Users, UserPlus, UserX, UserMinus, Clock, 
  AlertTriangle, Skull, Plane, Calendar, Settings, 
  FileText, Eye, Edit3, Trash2, Copy, RefreshCw,
  CheckCircle, AlertCircle, Building, Navigation
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  eventType: 'onboarding' | 'termination' | 'resignation' | 'missing' | 'dead' | 'retired' | 'leave_status' | 'company_change'
  isActive: boolean
  lastUsed?: string
  useCount: number
}

interface EmailLog {
  id: string
  recipientCount: number
  subject: string
  eventType: string
  status: 'sent' | 'failed' | 'pending'
  sentAt: string
  employeeName?: string
  employeeId?: string
}

export function EmailManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Mock email templates
  const [emailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'New Employee Onboarding',
      subject: 'Welcome Our New Team Member - {employeeName}',
      body: `Dear Team,

We are pleased to announce that {employeeName} (Employee ID: {employeeId}) has joined our organization as {position} in the {department} department.

{employeeName} will be starting on {startDate} and will be based at our {location} office.

Please join us in welcoming {employeeName} to the team and extend your support to help them settle in quickly.

Best regards,
HR Department`,
      eventType: 'onboarding',
      isActive: true,
      lastUsed: '2024-12-15',
      useCount: 12
    },
    {
      id: '2',
      name: 'Employee Termination Notification',
      subject: 'Staff Update - {employeeName}',
      body: `Dear Team,

This is to inform you that {employeeName} (Employee ID: {employeeId}) from the {department} department will no longer be with the organization effective {effectiveDate}.

Please ensure all company property is returned and access credentials are revoked accordingly.

HR Department will handle all transition matters.

Best regards,
HR Department`,
      eventType: 'termination',
      isActive: true,
      lastUsed: '2024-12-10',
      useCount: 5
    },
    {
      id: '3',
      name: 'Employee Resignation Notification',
      subject: 'Farewell - {employeeName}',
      body: `Dear Team,

We regret to inform you that {employeeName} (Employee ID: {employeeId}) from the {department} department has submitted their resignation and will be leaving the organization on {lastWorkingDate}.

Please join us in wishing {employeeName} all the best for their future endeavors.

{employeeName} will be available for handover during the notice period.

Best regards,
HR Department`,
      eventType: 'resignation',
      isActive: true,
      lastUsed: '2024-12-08',
      useCount: 8
    },
    {
      id: '4',
      name: 'Missing Employee Alert',
      subject: 'Important: Staff Status Update - {employeeName}',
      body: `Dear Team,

This is to inform you that {employeeName} (Employee ID: {employeeId}) has been reported as missing since {reportedDate}.

If you have any information about {employeeName}\'s whereabouts, please contact HR immediately.

All work assignments and responsibilities for {employeeName} are temporarily suspended.

Best regards,
HR Department`,
      eventType: 'missing',
      isActive: true,
      lastUsed: '2024-11-20',
      useCount: 1
    },
    {
      id: '5',
      name: 'Employee Retirement Notification',
      subject: 'Retirement Celebration - {employeeName}',
      body: `Dear Team,

It is with mixed emotions that we announce the retirement of {employeeName} (Employee ID: {employeeId}) from the {department} department, effective {retirementDate}.

{employeeName} has been a valued member of our organization for {yearsOfService} years and has made significant contributions to our success.

Please join us in celebrating {employeeName}\'s career and wishing them a happy and healthy retirement.

Best regards,
HR Department`,
      eventType: 'retired',
      isActive: true,
      lastUsed: '2024-12-01',
      useCount: 3
    },
    {
      id: '6',
      name: 'Leave Status Update',
      subject: 'Leave Status Update - {employeeName}',
      body: `Dear Team,

This is to inform you that {employeeName} (Employee ID: {employeeId}) leave status has been updated to {leaveStatus} as of {statusDate}.

{additionalInfo}

Please update your records accordingly.

Best regards,
HR Department`,
      eventType: 'leave_status',
      isActive: true,
      lastUsed: '2024-12-12',
      useCount: 15
    }
  ])

  // Mock email logs
  const [emailLogs] = useState<EmailLog[]>([
    {
      id: '1',
      recipientCount: 45,
      subject: 'Welcome Our New Team Member - John Smith',
      eventType: 'Onboarding',
      status: 'sent',
      sentAt: '2024-12-15 09:30 AM',
      employeeName: 'John Smith',
      employeeId: 'EMP001'
    },
    {
      id: '2',
      recipientCount: 45,
      subject: 'Leave Status Update - Alice Johnson',
      eventType: 'Leave Status',
      status: 'sent',
      sentAt: '2024-12-12 02:15 PM',
      employeeName: 'Alice Johnson',
      employeeId: 'EMP002'
    },
    {
      id: '3',
      recipientCount: 45,
      subject: 'Farewell - Mike Davis',
      eventType: 'Resignation',
      status: 'sent',
      sentAt: '2024-12-08 11:45 AM',
      employeeName: 'Mike Davis',
      employeeId: 'EMP003'
    }
  ])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'onboarding': return UserPlus
      case 'termination': return UserX
      case 'resignation': return UserMinus
      case 'missing': return AlertTriangle
      case 'dead': return Skull
      case 'retired': return Clock
      case 'leave_status': return Plane
      case 'company_change': return Building
      default: return Mail
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'onboarding': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'termination': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'resignation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'missing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'dead': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'retired': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'leave_status': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'company_change': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const handleSendTestEmail = async (template: EmailTemplate) => {
    setIsSending(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Test email sent using template: ${template.name}`)
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setIsSending(false)
    }
  }

  const handleSendBulkEmail = async (template: EmailTemplate) => {
    setIsSending(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.success(`Bulk email sent to all staff using template: ${template.name}`)
    } catch (error) {
      toast.error('Failed to send bulk email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Manage automated email notifications for staff lifecycle events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Email</DialogTitle>
                <DialogDescription>
                  Send a custom email to all staff members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Enter email subject" />
                </div>
                <div>
                  <Label htmlFor="body">Message</Label>
                  <Textarea 
                    id="body" 
                    placeholder="Enter your message here..." 
                    rows={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsComposeDialogOpen(false)
                  toast.success('Email sent to all staff')
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to All Staff
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Email Templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pre-configured templates for different staff lifecycle events
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {emailTemplates.map((template) => {
              const Icon = getEventIcon(template.eventType)
              return (
                <Card key={template.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <Badge className={getEventColor(template.eventType)}>
                          {template.eventType.replace('_', ' ')}
                        </Badge>
                      </div>
                      {template.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.subject}
                    </p>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      Used {template.useCount} times
                      {template.lastUsed && ` • Last used: ${template.lastUsed}`}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            <DialogDescription>
                              Template preview for {template.eventType} events
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Subject</Label>
                              <div className="p-3 bg-muted rounded-md mt-1">
                                {template.subject}
                              </div>
                            </div>
                            <div>
                              <Label>Body</Label>
                              <div className="p-3 bg-muted rounded-md mt-1 whitespace-pre-wrap text-sm">
                                {template.body}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => handleSendTestEmail(template)}
                              disabled={isSending}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Test
                            </Button>
                            <Button 
                              onClick={() => handleSendBulkEmail(template)}
                              disabled={isSending}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Send to All Staff
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm" variant="ghost">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Email Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recent Email Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            History of automated and manual emails sent to staff
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    log.status === 'sent' ? 'bg-green-100 dark:bg-green-900/30' :
                    log.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    {log.status === 'sent' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : log.status === 'failed' ? (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{log.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      Sent to {log.recipientCount} recipients • {log.eventType}
                      {log.employeeName && ` • ${log.employeeName} (${log.employeeId})`}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">{log.sentAt}</div>
                  <Badge variant={log.status === 'sent' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automated Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automated Email Triggers
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure when automatic emails are sent based on system events
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">New Employee Onboarding</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically send welcome email when Employee ID is assigned
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </Badge>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Plane className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Leave Status Changes</div>
                  <div className="text-sm text-muted-foreground">
                    Send notification when leave status changes to Departed/Arrived
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </Badge>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <UserX className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium">Employee Status Changes</div>
                  <div className="text-sm text-muted-foreground">
                    Send alerts for Termination, Resignation, Missing, Dead, Retired
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </Badge>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}