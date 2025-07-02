"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Mail, Shield, CheckCircle, AlertCircle, ArrowLeft, 
  Loader2, Key, User, Eye, EyeOff, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface PasswordResetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resetType?: 'password' | 'username' | 'both'
}

type ResetStep = 'method' | 'email' | 'verification' | 'new-credentials' | 'success'

interface ResetErrors {
  email?: string
  code?: string
  password?: string
  confirmPassword?: string
  username?: string
  general?: string
}

export function PasswordResetDialog({ 
  open, 
  onOpenChange, 
  resetType = 'both' 
}: PasswordResetDialogProps) {
  const [currentStep, setCurrentStep] = useState<ResetStep>('method')
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone' | 'security'>('email')
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
    newUsername: ''
  })
  const [errors, setErrors] = useState<ResetErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0
    if (pwd.length >= 8) strength += 25
    if (/[A-Z]/.test(pwd)) strength += 25
    if (/[0-9]/.test(pwd)) strength += 25
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25
    return strength
  }

  const passwordStrength = calculatePasswordStrength(formData.newPassword)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep('method')
      setFormData({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: '',
        newUsername: ''
      })
      setErrors({})
      setCountdown(0)
    }
  }, [open])

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateStep = (): boolean => {
    const newErrors: ResetErrors = {}

    switch (currentStep) {
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address'
        }
        break

      case 'verification':
        if (!formData.verificationCode.trim()) {
          newErrors.code = 'Verification code is required'
        } else if (formData.verificationCode.length !== 6) {
          newErrors.code = 'Code must be 6 digits'
        }
        break

      case 'new-credentials':
        if (resetType === 'password' || resetType === 'both') {
          if (!formData.newPassword) {
            newErrors.password = 'Password is required'
          } else if (formData.newPassword.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
          }

          if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
          }
        }

        if (resetType === 'username' || resetType === 'both') {
          if (!formData.newUsername.trim()) {
            newErrors.username = 'Username is required'
          } else if (formData.newUsername.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
          }
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep()) return

    setIsLoading(true)
    setErrors({})

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      switch (currentStep) {
        case 'method':
          setCurrentStep('email')
          break

        case 'email':
          // Simulate sending verification code
          setCurrentStep('verification')
          setCountdown(60)
          toast.success('Verification code sent to your email')
          break

        case 'verification':
          // Simulate code verification
          if (formData.verificationCode === '123456') {
            setCurrentStep('new-credentials')
          } else {
            setErrors({ code: 'Invalid verification code. Try 123456 for demo.' })
          }
          break

        case 'new-credentials':
          // Simulate updating credentials
          setCurrentStep('success')
          toast.success('Credentials updated successfully!')
          break
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCountdown(60)
      toast.success('New verification code sent')
    } catch (error) {
      toast.error('Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  const resetMethods = [
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Reset via email verification',
      icon: Mail,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'phone',
      title: 'SMS Verification',
      description: 'Reset via SMS code',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'security',
      title: 'Security Questions',
      description: 'Answer security questions',
      icon: Key,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method': return 'Choose Reset Method'
      case 'email': return 'Enter Your Email'
      case 'verification': return 'Enter Verification Code'
      case 'new-credentials': 
        if (resetType === 'password') return 'Create New Password'
        if (resetType === 'username') return 'Create New Username'
        return 'Update Your Credentials'
      case 'success': return 'Reset Complete'
      default: return 'Reset Credentials'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'method': return 'Select how you\'d like to reset your credentials'
      case 'email': return 'We\'ll send a verification code to this email address'
      case 'verification': return `Check your ${selectedMethod === 'email' ? 'email' : 'phone'} for a 6-digit code`
      case 'new-credentials': return 'Create your new login credentials'
      case 'success': return 'Your credentials have been successfully updated'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>{getStepTitle()}</span>
              </DialogTitle>
              <DialogDescription>
                {getStepDescription()}
              </DialogDescription>
            </div>
            {currentStep !== 'method' && currentStep !== 'success' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (currentStep === 'email') setCurrentStep('method')
                  else if (currentStep === 'verification') setCurrentStep('email')
                  else if (currentStep === 'new-credentials') setCurrentStep('verification')
                }}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {['method', 'email', 'verification', 'new-credentials', 'success'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  currentStep === step
                    ? 'bg-primary text-primary-foreground'
                    : index < ['method', 'email', 'verification', 'new-credentials', 'success'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < ['method', 'email', 'verification', 'new-credentials', 'success'].indexOf(currentStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && (
                  <div className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                    index < ['method', 'email', 'verification', 'new-credentials', 'success'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* General Error Display */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-sm text-destructive flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.general}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 'method' && (
              <motion.div
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {resetMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id as 'email' | 'phone' | 'security')
                      setCurrentStep('email')
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                        <method.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{method.title}</h3>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {currentStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }))
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }))
                      }
                    }}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Code sent to <strong>{formData.email}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setFormData(prev => ({ ...prev, verificationCode: value }))
                      if (errors.code) {
                        setErrors(prev => ({ ...prev, code: undefined }))
                      }
                    }}
                    className={`text-center text-lg tracking-widest ${errors.code ? 'border-destructive' : ''}`}
                    maxLength={6}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.code}</span>
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={countdown > 0 || isLoading}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'new-credentials' && (
              <motion.div
                key="new-credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {(resetType === 'username' || resetType === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="newUsername">New Username</Label>
                    <Input
                      id="newUsername"
                      type="text"
                      placeholder="Enter new username"
                      value={formData.newUsername}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, newUsername: e.target.value }))
                        if (errors.username) {
                          setErrors(prev => ({ ...prev, username: undefined }))
                        }
                      }}
                      className={errors.username ? 'border-destructive' : ''}
                    />
                    {errors.username && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.username}</span>
                      </p>
                    )}
                  </div>
                )}

                {(resetType === 'password' || resetType === 'both') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, newPassword: e.target.value }))
                            if (errors.password) {
                              setErrors(prev => ({ ...prev, password: undefined }))
                            }
                          }}
                          className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {formData.newPassword && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Password Strength</span>
                            <span className={`${
                              passwordStrength < 50 ? 'text-red-500' : 
                              passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full ${
                                passwordStrength < 50 ? 'bg-red-500' : 
                                passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      {errors.password && (
                        <p className="text-sm text-destructive flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.password}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                            if (errors.confirmPassword) {
                              setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                            }
                          }}
                          className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.confirmPassword}</span>
                        </p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {currentStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-4"
              >
                <motion.div
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Credentials Updated!</h3>
                  <p className="text-muted-foreground">
                    Your {resetType === 'password' ? 'password' : resetType === 'username' ? 'username' : 'credentials'} 
                    {resetType === 'both' ? ' have' : ' has'} been successfully updated.
                  </p>
                </div>
                
                {resetType === 'both' && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">New Username:</span>
                        <Badge variant="secondary">{formData.newUsername}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Password:</span>
                        <Badge variant="secondary">Updated</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {currentStep === 'success' ? 'Close' : 'Cancel'}
            </Button>
            
            {currentStep !== 'success' && (
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentStep === 'email' ? 'Sending...' : 
                     currentStep === 'verification' ? 'Verifying...' : 
                     currentStep === 'new-credentials' ? 'Updating...' : 'Next'}
                  </div>
                ) : (
                  currentStep === 'new-credentials' ? 'Update Credentials' : 'Next'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}