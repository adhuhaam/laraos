import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Employee interface
export interface Employee {
  id: string
  empId: string
  name: string
  email: string
  phone: string
  nationality: string
  department: string
  designation: string
  joinDate: string
  salary: number
  status: 'active' | 'on-leave' | 'suspended' | 'terminated' | 'resigned'
  avatar?: string
  passportNumber: string
  visaStatus: 'valid' | 'expired' | 'pending' | 'rejected'
  workPermitNumber?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  address: string
  manager: string
  workLocation: string
  contractType: 'permanent' | 'temporary' | 'contractor'
  bankAccount?: string
  skills: string[]
  performance: {
    rating: number
    lastReview: string
    nextReview: string
  }
  disciplinaryRecords: number
  leaveBalance: {
    annual: number
    sick: number
    emergency: number
  }
  documents: {
    passport: boolean
    visa: boolean
    workPermit: boolean
    medical: boolean
    contract: boolean
  }
  createdAt: string
  updatedAt: string
}

// HR Staff interface for chat system
export interface HRStaff {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: Date
  joinDate: string
}

// User interface for system access
export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatar?: string
  phone?: string
  department: string
  designation: string
  roleId: string
  roleName: string
  permissions: string[]
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: Date
  loginAttempts: number
  isLocked: boolean
  lockoutUntil?: Date
  emailVerified: boolean
  passwordResetRequired: boolean
  twoFactorEnabled: boolean
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  employeeId?: string // Link to employee record if applicable
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// Role interface
export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystemRole: boolean
  createdAt: string
  updatedAt: string
}

// Disciplinary Letter interface
export interface DisciplinaryLetterRecord {
  id: string
  employeeId: string
  employeeName: string
  empId: string
  department: string
  designation: string
  letterType: 'warning' | 'written-warning' | 'final-warning' | 'suspension-notice' | 'improvement-notice' | 'other'
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  subject: string
  description: string
  incidentDate: string
  letterDate: string
  issuedBy: string
  reviewDate?: string
  followUpRequired: boolean
  followUpDate?: string
  employeeResponse?: string
  responseDate?: string
  acknowledged: boolean
  acknowledgedDate?: string
  status: 'draft' | 'issued' | 'acknowledged' | 'responded' | 'reviewed' | 'closed'
  attachments: string[]
  linkedToFine?: string
  previousLetters: string[]
  escalationLevel: 1 | 2 | 3 | 4
  appealPeriod: boolean
  appealDeadline?: string
  hrNotes?: string
  managerNotes?: string
  referenceNumber: string
  fineAmount?: number
  createdAt: string
  updatedAt: string
}

// Context interface
interface HRDataContextType {
  // Employee data
  employees: Employee[]
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
  getEmployee: (id: string) => Employee | undefined
  getEmployeeByEmpId: (empId: string) => Employee | undefined
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  addEmployee: (employee: Employee) => void
  
  // HR Staff data for chat
  hrStaff: HRStaff[]
  setHRStaff: React.Dispatch<React.SetStateAction<HRStaff[]>>
  getHRStaff: (id: string) => HRStaff | undefined
  updateHRStaffStatus: (id: string, status: HRStaff['status']) => void
  
  // User management
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  getUser: (id: string) => User | undefined
  getUserByUsername: (username: string) => User | undefined
  getUserByEmail: (email: string) => User | undefined
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  activateUser: (id: string) => void
  deactivateUser: (id: string) => void
  resetUserPassword: (id: string) => void
  lockUser: (id: string) => void
  unlockUser: (id: string) => void
  
  // Role management
  roles: Role[]
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>
  getRole: (id: string) => Role | undefined
  addRole: (role: Role) => void
  updateRole: (id: string, updates: Partial<Role>) => void
  deleteRole: (id: string) => void
  
  // Disciplinary letter data
  disciplinaryLetters: DisciplinaryLetterRecord[]
  setDisciplinaryLetters: React.Dispatch<React.SetStateAction<DisciplinaryLetterRecord[]>>
  getDisciplinaryLettersForEmployee: (employeeId: string) => DisciplinaryLetterRecord[]
  addDisciplinaryLetter: (letter: DisciplinaryLetterRecord) => void
  updateDisciplinaryLetter: (id: string, updates: Partial<DisciplinaryLetterRecord>) => void
  
  // Cross-component actions
  createDisciplinaryLetterForEmployee: (employeeId: string, letterData: Partial<DisciplinaryLetterRecord>) => Promise<string>
  updateEmployeeDisciplinaryCount: (employeeId: string) => void
}

const HRDataContext = createContext<HRDataContextType | undefined>(undefined)

// Initial employee data
const initialEmployees: Employee[] = [
  {
    id: '1',
    empId: 'EMP001',
    name: 'Ahmed Hassan Al-Mansouri',
    email: 'ahmed.hassan@rcc.mv',
    phone: '+960 777 1234',
    nationality: 'Maldivian',
    department: 'Construction',
    designation: 'Project Manager',
    joinDate: '2023-01-15',
    salary: 25000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    passportNumber: 'MP1234567',
    visaStatus: 'valid',
    workPermitNumber: 'WP2023001',
    emergencyContact: {
      name: 'Fatima Hassan',
      phone: '+960 777 5678',
      relationship: 'Spouse'
    },
    address: 'Male\', Maldives',
    manager: 'Ibrahim Waheed',
    workLocation: 'Head Office - Male',
    contractType: 'permanent',
    bankAccount: 'BML-1234567890',
    skills: ['Project Management', 'AutoCAD', 'Team Leadership', 'Construction Planning'],
    performance: {
      rating: 4.5,
      lastReview: '2024-06-15',
      nextReview: '2024-12-15'
    },
    disciplinaryRecords: 0,
    leaveBalance: {
      annual: 18,
      sick: 10,
      emergency: 3
    },
    documents: {
      passport: true,
      visa: true,
      workPermit: true,
      medical: true,
      contract: true
    },
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    empId: 'EMP002',
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh.kumar@rcc.mv',
    phone: '+960 777 2345',
    nationality: 'Indian',
    department: 'Construction',
    designation: 'Site Engineer',
    joinDate: '2023-03-20',
    salary: 18000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    passportNumber: 'IN9876543',
    visaStatus: 'valid',
    workPermitNumber: 'WP2023002',
    emergencyContact: {
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      relationship: 'Wife'
    },
    address: 'Hulhumale, Maldives',
    manager: 'Ahmed Hassan Al-Mansouri',
    workLocation: 'Site A - Hulhumale',
    contractType: 'permanent',
    bankAccount: 'BML-2345678901',
    skills: ['Civil Engineering', 'Site Management', 'Quality Control', 'Safety Management'],
    performance: {
      rating: 4.2,
      lastReview: '2024-03-20',
      nextReview: '2024-09-20'
    },
    disciplinaryRecords: 1,
    leaveBalance: {
      annual: 15,
      sick: 8,
      emergency: 2
    },
    documents: {
      passport: true,
      visa: true,
      workPermit: true,
      medical: true,
      contract: true
    },
    createdAt: '2023-03-20',
    updatedAt: '2024-03-20'
  },
  {
    id: '3',
    empId: 'EMP003',
    name: 'Mohammad Al-Zahra',
    email: 'mohammad.alzahra@rcc.mv',
    phone: '+960 777 3456',
    nationality: 'Bangladeshi',
    department: 'Electrical',
    designation: 'Electrician',
    joinDate: '2023-05-10',
    salary: 12000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    passportNumber: 'BD5432109',
    visaStatus: 'valid',
    workPermitNumber: 'WP2023003',
    emergencyContact: {
      name: 'Hassan Al-Zahra',
      phone: '+880 171 234567',
      relationship: 'Brother'
    },
    address: 'Vilimale, Maldives',
    manager: 'Ahmed Hassan Al-Mansouri',
    workLocation: 'Site B - Vilimale',
    contractType: 'permanent',
    bankAccount: 'BML-3456789012',
    skills: ['Electrical Installation', 'Maintenance', 'Troubleshooting', 'Safety Protocols'],
    performance: {
      rating: 4.0,
      lastReview: '2024-05-10',
      nextReview: '2024-11-10'
    },
    disciplinaryRecords: 2,
    leaveBalance: {
      annual: 12,
      sick: 6,
      emergency: 1
    },
    documents: {
      passport: true,
      visa: true,
      workPermit: true,
      medical: true,
      contract: true
    },
    createdAt: '2023-05-10',
    updatedAt: '2024-05-10'
  },
  {
    id: '4',
    empId: 'EMP004',
    name: 'Sarah Elizabeth Johnson',
    email: 'sarah.johnson@rcc.mv',
    phone: '+960 777 4567',
    nationality: 'British',
    department: 'Engineering',
    designation: 'Structural Engineer',
    joinDate: '2022-11-01',
    salary: 35000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
    passportNumber: 'GB7890123',
    visaStatus: 'valid',
    workPermitNumber: 'WP2022004',
    emergencyContact: {
      name: 'Michael Johnson',
      phone: '+44 20 7946 0958',
      relationship: 'Husband'
    },
    address: 'Male\', Maldives',
    manager: 'Ibrahim Waheed',
    workLocation: 'Head Office - Male',
    contractType: 'permanent',
    bankAccount: 'BML-4567890123',
    skills: ['Structural Design', 'CAD Software', 'Project Planning', 'Team Management'],
    performance: {
      rating: 4.8,
      lastReview: '2024-11-01',
      nextReview: '2025-05-01'
    },
    disciplinaryRecords: 0,
    leaveBalance: {
      annual: 20,
      sick: 12,
      emergency: 5
    },
    documents: {
      passport: true,
      visa: true,
      workPermit: true,
      medical: true,
      contract: true
    },
    createdAt: '2022-11-01',
    updatedAt: '2024-11-01'
  },
  {
    id: '5',
    empId: 'EMP005',
    name: 'Kumar Patel',
    email: 'kumar.patel@rcc.mv',
    phone: '+960 777 5678',
    nationality: 'Indian',
    department: 'Administration',
    designation: 'HR Assistant',
    joinDate: '2024-01-08',
    salary: 15000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    passportNumber: 'IN1357924',
    visaStatus: 'valid',
    workPermitNumber: 'WP2024005',
    emergencyContact: {
      name: 'Neha Patel',
      phone: '+91 98765 54321',
      relationship: 'Sister'
    },
    address: 'Hulhumale, Maldives',
    manager: 'Sarah Elizabeth Johnson',
    workLocation: 'Head Office - Male',
    contractType: 'permanent',
    bankAccount: 'BML-5678901234',
    skills: ['HR Management', 'Documentation', 'Communication', 'Problem Solving'],
    performance: {
      rating: 3.8,
      lastReview: '2024-07-08',
      nextReview: '2025-01-08'
    },
    disciplinaryRecords: 0,
    leaveBalance: {
      annual: 22,
      sick: 15,
      emergency: 5
    },
    documents: {
      passport: true,
      visa: true,
      workPermit: true,
      medical: false,
      contract: true
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-07-08'
  }
]

// Initial HR staff data for chat system
const initialHRStaff: HRStaff[] = [
  {
    id: 'hr-1',
    name: 'N.B Rajanayaka',
    role: 'HR Manager',
    department: 'Human Resources',
    email: 'nb.rajanayaka@rcc.mv',
    phone: '+960 3317878',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    joinDate: '2020-01-15'
  },
  {
    id: 'hr-2',
    name: 'Sarah Johnson',
    role: 'HR Assistant',
    department: 'Human Resources',
    email: 'sarah.johnson@rcc.mv',
    phone: '+960 3317879',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    joinDate: '2021-03-20'
  },
  {
    id: 'hr-3',
    name: 'Ahmed Hassan',
    role: 'Recruitment Specialist',
    department: 'Human Resources',
    email: 'ahmed.hassan@rcc.mv',
    phone: '+960 3317880',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'away',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    joinDate: '2021-06-10'
  },
  {
    id: 'hr-4',
    name: 'Maria Santos',
    role: 'Payroll Officer',
    department: 'Human Resources',
    email: 'maria.santos@rcc.mv',
    phone: '+960 3317881',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'busy',
    joinDate: '2022-02-15'
  },
  {
    id: 'hr-5',
    name: 'David Kim',
    role: 'XPAT Coordinator',
    department: 'Human Resources',
    email: 'david.kim@rcc.mv',
    phone: '+960 3317882',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    joinDate: '2022-08-01'
  },
  {
    id: 'hr-6',
    name: 'Lisa Chen',
    role: 'Training Coordinator',
    department: 'Human Resources',
    email: 'lisa.chen@rcc.mv',
    phone: '+960 3317883',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    joinDate: '2023-01-12'
  }
]

// Initial roles data
const initialRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'employee.create', 'employee.read', 'employee.update', 'employee.delete',
      'role.create', 'role.read', 'role.update', 'role.delete',
      'system.admin', 'system.settings', 'system.backup',
      'disciplinary.create', 'disciplinary.read', 'disciplinary.update', 'disciplinary.delete',
      'payroll.read', 'payroll.process', 'reports.generate'
    ],
    isSystemRole: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'role-2',
    name: 'HR Manager',
    description: 'HR management with employee and disciplinary access',
    permissions: [
      'user.read', 'user.update',
      'employee.create', 'employee.read', 'employee.update', 'employee.delete',
      'disciplinary.create', 'disciplinary.read', 'disciplinary.update', 'disciplinary.delete',
      'payroll.read', 'reports.generate'
    ],
    isSystemRole: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'role-3',
    name: 'HR Assistant',
    description: 'Basic HR operations and employee management',
    permissions: [
      'employee.read', 'employee.update',
      'disciplinary.read', 'disciplinary.create',
      'reports.view'
    ],
    isSystemRole: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'role-4',
    name: 'Recruitment Specialist',
    description: 'Candidate and recruitment management',
    permissions: [
      'candidate.create', 'candidate.read', 'candidate.update', 'candidate.delete',
      'employee.read', 'employee.create',
      'reports.view'
    ],
    isSystemRole: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'role-5',
    name: 'Payroll Officer',
    description: 'Payroll and financial operations',
    permissions: [
      'employee.read',
      'payroll.read', 'payroll.process', 'payroll.generate',
      'reports.payroll'
    ],
    isSystemRole: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

// Initial users data
const initialUsers: User[] = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@rcc.mv',
    firstName: 'System',
    lastName: 'Administrator',
    fullName: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+960 3317878',
    department: 'Information Technology',
    designation: 'System Administrator',
    roleId: 'role-1',
    roleName: 'Super Administrator',
    permissions: [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'employee.create', 'employee.read', 'employee.update', 'employee.delete',
      'role.create', 'role.read', 'role.update', 'role.delete',
      'system.admin', 'system.settings', 'system.backup',
      'disciplinary.create', 'disciplinary.read', 'disciplinary.update', 'disciplinary.delete',
      'payroll.read', 'payroll.process', 'reports.generate'
    ],
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    loginAttempts: 0,
    isLocked: false,
    emailVerified: true,
    passwordResetRequired: false,
    twoFactorEnabled: true,
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Male',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    },
    address: 'Male\', Maldives',
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+960 777 0000',
      relationship: 'Contact'
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-07-01',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    id: 'user-2',
    username: 'nb.rajanayaka',
    email: 'nb.rajanayaka@rcc.mv',
    firstName: 'N.B',
    lastName: 'Rajanayaka',
    fullName: 'N.B Rajanayaka',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+960 3317878',
    department: 'Human Resources',
    designation: 'HR Manager',
    roleId: 'role-2',
    roleName: 'HR Manager',
    permissions: [
      'user.read', 'user.update',
      'employee.create', 'employee.read', 'employee.update', 'employee.delete',
      'disciplinary.create', 'disciplinary.read', 'disciplinary.update', 'disciplinary.delete',
      'payroll.read', 'reports.generate'
    ],
    status: 'active',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    loginAttempts: 0,
    isLocked: false,
    emailVerified: true,
    passwordResetRequired: false,
    twoFactorEnabled: false,
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Male',
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    },
    address: 'Male\', Maldives',
    employeeId: 'hr-1',
    createdAt: '2024-01-15',
    updatedAt: '2024-07-01',
    createdBy: 'user-1',
    updatedBy: 'user-1'
  },
  {
    id: 'user-3',
    username: 'sarah.johnson',
    email: 'sarah.johnson@rcc.mv',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
    phone: '+960 3317879',
    department: 'Human Resources',
    designation: 'HR Assistant',
    roleId: 'role-3',
    roleName: 'HR Assistant',
    permissions: [
      'employee.read', 'employee.update',
      'disciplinary.read', 'disciplinary.create',
      'reports.view'
    ],
    status: 'active',
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
    loginAttempts: 0,
    isLocked: false,
    emailVerified: true,
    passwordResetRequired: false,
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
    employeeId: 'hr-2',
    createdAt: '2024-02-01',
    updatedAt: '2024-07-01',
    createdBy: 'user-1',
    updatedBy: 'user-2'
  }
]

// Initial disciplinary letters data
const initialDisciplinaryLetters: DisciplinaryLetterRecord[] = [
  {
    id: '1',
    employeeId: '2',
    employeeName: 'Rajesh Kumar Sharma',
    empId: 'EMP002',
    department: 'Construction',
    designation: 'Site Engineer',
    letterType: 'written-warning',
    severity: 'moderate',
    subject: 'Failure to Follow Safety Protocols',
    description: 'you have been observed not wearing the required safety equipment on site despite multiple verbal warnings. This includes failure to wear hard hat and safety vest in designated construction zones.',
    incidentDate: '2024-03-15',
    letterDate: '2024-03-18',
    issuedBy: 'Ahmed Hassan Al-Mansouri',
    reviewDate: '2024-06-18',
    followUpRequired: true,
    followUpDate: '2024-04-18',
    acknowledged: true,
    acknowledgedDate: '2024-03-19',
    status: 'acknowledged',
    attachments: ['safety_incident_report.pdf'],
    previousLetters: [],
    escalationLevel: 1,
    appealPeriod: true,
    appealDeadline: '2024-03-25',
    hrNotes: 'First formal warning. Employee acknowledged and signed.',
    managerNotes: 'Employee seemed understanding. Will monitor closely.',
    referenceNumber: 'HR/RCC/2024-MAR/001',
    fineAmount: 300,
    createdAt: '2024-03-18',
    updatedAt: '2024-03-19'
  },
  {
    id: '2',
    employeeId: '3',
    employeeName: 'Mohammad Al-Zahra',
    empId: 'EMP003',
    department: 'Electrical',
    designation: 'Electrician',
    letterType: 'written-warning',
    severity: 'moderate',
    subject: 'Staying in Room During Work Hours',
    description: 'you have been staying in your room during working hours without authorization even after you have been already warned last month regarding the same issue.',
    incidentDate: '2024-04-20',
    letterDate: '2024-04-22',
    issuedBy: 'Ahmed Hassan Al-Mansouri',
    reviewDate: '2024-07-22',
    followUpRequired: true,
    followUpDate: '2024-05-22',
    acknowledged: true,
    acknowledgedDate: '2024-04-23',
    status: 'acknowledged',
    attachments: [],
    previousLetters: ['previous_verbal_warning'],
    escalationLevel: 2,
    appealPeriod: false,
    hrNotes: 'Second incident. Escalation level increased.',
    managerNotes: 'Employee apologized and committed to improvement.',
    referenceNumber: 'HR/RCC/2024-APR/002',
    fineAmount: 200,
    createdAt: '2024-04-22',
    updatedAt: '2024-04-23'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Mohammad Al-Zahra',
    empId: 'EMP003',
    department: 'Electrical',
    designation: 'Electrician',
    letterType: 'final-warning',
    severity: 'major',
    subject: 'Repeated Attendance Issues',
    description: 'you have been absent from work without valid reason and proper authorization for the third time this month despite previous warnings.',
    incidentDate: '2024-06-10',
    letterDate: '2024-06-12',
    issuedBy: 'Ahmed Hassan Al-Mansouri',
    reviewDate: '2024-09-12',
    followUpRequired: true,
    followUpDate: '2024-07-12',
    acknowledged: false,
    status: 'issued',
    attachments: ['attendance_record.pdf'],
    previousLetters: ['1', '2'],
    escalationLevel: 3,
    appealPeriod: true,
    appealDeadline: '2024-06-19',
    hrNotes: 'Final warning issued. Next violation may result in termination.',
    managerNotes: 'Employee was counseled about job security.',
    referenceNumber: 'HR/RCC/2024-JUN/003',
    fineAmount: 500,
    createdAt: '2024-06-12',
    updatedAt: '2024-06-12'
  }
]

// Provider component
export function HRDataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [hrStaff, setHRStaff] = useState<HRStaff[]>(initialHRStaff)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [disciplinaryLetters, setDisciplinaryLetters] = useState<DisciplinaryLetterRecord[]>(initialDisciplinaryLetters)

  // Employee functions
  const getEmployee = useCallback((id: string) => {
    return employees.find(emp => emp.id === id)
  }, [employees])

  const getEmployeeByEmpId = useCallback((empId: string) => {
    return employees.find(emp => emp.empId === empId)
  }, [employees])

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : emp
    ))
  }, [])

  const addEmployee = useCallback((employee: Employee) => {
    setEmployees(prev => [employee, ...prev])
  }, [])

  // HR Staff functions
  const getHRStaff = useCallback((id: string) => {
    return hrStaff.find(staff => staff.id === id)
  }, [hrStaff])

  const updateHRStaffStatus = useCallback((id: string, status: HRStaff['status']) => {
    setHRStaff(prev => prev.map(staff => 
      staff.id === id ? { 
        ...staff, 
        status, 
        lastSeen: status === 'offline' ? new Date() : staff.lastSeen 
      } : staff
    ))
  }, [])

  // User management functions
  const getUser = useCallback((id: string) => {
    return users.find(user => user.id === id)
  }, [users])

  const getUserByUsername = useCallback((username: string) => {
    return users.find(user => user.username === username)
  }, [users])

  const getUserByEmail = useCallback((email: string) => {
    return users.find(user => user.email === email)
  }, [users])

  const addUser = useCallback((user: User) => {
    setUsers(prev => [user, ...prev])
  }, [])

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { 
        ...user, 
        ...updates, 
        updatedAt: new Date().toISOString().split('T')[0],
        fullName: updates.firstName && updates.lastName ? 
          `${updates.firstName} ${updates.lastName}` : user.fullName
      } : user
    ))
  }, [])

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }, [])

  const activateUser = useCallback((id: string) => {
    updateUser(id, { status: 'active' })
  }, [updateUser])

  const deactivateUser = useCallback((id: string) => {
    updateUser(id, { status: 'inactive' })
  }, [updateUser])

  const resetUserPassword = useCallback((id: string) => {
    updateUser(id, { passwordResetRequired: true })
  }, [updateUser])

  const lockUser = useCallback((id: string) => {
    updateUser(id, { 
      isLocked: true, 
      lockoutUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })
  }, [updateUser])

  const unlockUser = useCallback((id: string) => {
    updateUser(id, { 
      isLocked: false, 
      lockoutUntil: undefined,
      loginAttempts: 0
    })
  }, [updateUser])

  // Role management functions
  const getRole = useCallback((id: string) => {
    return roles.find(role => role.id === id)
  }, [roles])

  const addRole = useCallback((role: Role) => {
    setRoles(prev => [role, ...prev])
  }, [])

  const updateRole = useCallback((id: string, updates: Partial<Role>) => {
    setRoles(prev => prev.map(role => 
      role.id === id ? { 
        ...role, 
        ...updates, 
        updatedAt: new Date().toISOString().split('T')[0]
      } : role
    ))
  }, [])

  const deleteRole = useCallback((id: string) => {
    // Don't allow deletion of system roles
    const role = getRole(id)
    if (role?.isSystemRole) {
      throw new Error('Cannot delete system roles')
    }
    
    // Check if any users are assigned to this role
    const usersWithRole = users.filter(user => user.roleId === id)
    if (usersWithRole.length > 0) {
      throw new Error('Cannot delete role that is assigned to users')
    }
    
    setRoles(prev => prev.filter(role => role.id !== id))
  }, [getRole, users])

  // Disciplinary letter functions
  const getDisciplinaryLettersForEmployee = useCallback((employeeId: string) => {
    return disciplinaryLetters.filter(letter => letter.employeeId === employeeId)
      .sort((a, b) => new Date(b.letterDate).getTime() - new Date(a.letterDate).getTime())
  }, [disciplinaryLetters])

  const addDisciplinaryLetter = useCallback((letter: DisciplinaryLetterRecord) => {
    setDisciplinaryLetters(prev => [letter, ...prev])
    
    // Update employee disciplinary count
    updateEmployeeDisciplinaryCount(letter.employeeId)
  }, [])

  const updateDisciplinaryLetter = useCallback((id: string, updates: Partial<DisciplinaryLetterRecord>) => {
    setDisciplinaryLetters(prev => prev.map(letter => 
      letter.id === id ? { ...letter, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : letter
    ))
  }, [])

  // Cross-component functions
  const createDisciplinaryLetterForEmployee = useCallback(async (employeeId: string, letterData: Partial<DisciplinaryLetterRecord>): Promise<string> => {
    const employee = getEmployee(employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    // Generate reference number
    const generateReferenceNumber = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
      return `HR/RCC/${year}-${month}/${sequence}`
    }

    const newLetter: DisciplinaryLetterRecord = {
      id: Date.now().toString(),
      employeeId,
      employeeName: employee.name,
      empId: employee.empId,
      department: employee.department,
      designation: employee.designation,
      letterType: letterData.letterType || 'warning',
      severity: letterData.severity || 'minor',
      subject: letterData.subject || '',
      description: letterData.description || '',
      incidentDate: letterData.incidentDate || new Date().toISOString().split('T')[0],
      letterDate: new Date().toISOString().split('T')[0],
      issuedBy: letterData.issuedBy || 'Current User',
      followUpRequired: letterData.followUpRequired || false,
      acknowledged: false,
      status: 'draft',
      attachments: letterData.attachments || [],
      previousLetters: getDisciplinaryLettersForEmployee(employeeId).map(l => l.id),
      escalationLevel: Math.min(4, getDisciplinaryLettersForEmployee(employeeId).length + 1) as 1 | 2 | 3 | 4,
      appealPeriod: true,
      appealDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      referenceNumber: generateReferenceNumber(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      ...letterData
    }

    addDisciplinaryLetter(newLetter)
    return newLetter.id
  }, [getEmployee, getDisciplinaryLettersForEmployee, addDisciplinaryLetter])

  const updateEmployeeDisciplinaryCount = useCallback((employeeId: string) => {
    const employeeLetters = getDisciplinaryLettersForEmployee(employeeId)
    const count = employeeLetters.filter(letter => letter.status !== 'draft').length
    
    updateEmployee(employeeId, { disciplinaryRecords: count })
  }, [getDisciplinaryLettersForEmployee, updateEmployee])

  const value: HRDataContextType = {
    employees,
    setEmployees,
    getEmployee,
    getEmployeeByEmpId,
    updateEmployee,
    addEmployee,
    hrStaff,
    setHRStaff,
    getHRStaff,
    updateHRStaffStatus,
    users,
    setUsers,
    getUser,
    getUserByUsername,
    getUserByEmail,
    addUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    resetUserPassword,
    lockUser,
    unlockUser,
    roles,
    setRoles,
    getRole,
    addRole,
    updateRole,
    deleteRole,
    disciplinaryLetters,
    setDisciplinaryLetters,
    getDisciplinaryLettersForEmployee,
    addDisciplinaryLetter,
    updateDisciplinaryLetter,
    createDisciplinaryLetterForEmployee,
    updateEmployeeDisciplinaryCount
  }

  return (
    <HRDataContext.Provider value={value}>
      {children}
    </HRDataContext.Provider>
  )
}

// Custom hook to use the context
export function useHRData() {
  const context = useContext(HRDataContext)
  if (context === undefined) {
    throw new Error('useHRData must be used within a HRDataProvider')
  }
  return context
}